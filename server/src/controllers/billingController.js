import crypto from 'node:crypto';
import Order from '../models/Order.js';
import Restaurant from '../models/Restaurant.js';
import User from '../models/User.js';
import { BILLING_PERIODS, PLANS, getPlanPrice } from '../config/plans.js';
import { PAYTR_IFRAME_URL, isPaytrConfigured, requestIframeToken, verifyCallbackHash } from '../services/paytr.js';

// PayTR shows the result pages inside its iframe, so they live on the public site (no frame restrictions).
const siteBase = () => (process.env.SITE_URL || 'https://www.zuuqrmenu.com').replace(/\/$/, '');

const getClientIp = (req) => {
  const forwarded = String(req.headers['x-forwarded-for'] || '').split(',')[0].trim();
  const ip = forwarded || req.socket?.remoteAddress || '';
  return ip.replace(/^::ffff:/, '') || '127.0.0.1';
};

const addMonths = (date, months) => {
  const next = new Date(date);
  next.setMonth(next.getMonth() + months);
  return next;
};

const serializeOrder = (order) => ({
  id: order._id,
  merchantOid: order.merchantOid,
  plan: order.plan,
  planName: PLANS[order.plan]?.name || order.plan,
  period: order.period,
  amount: order.amount,
  status: order.status,
  paidAt: order.paidAt,
  periodEnd: order.periodEnd,
  createdAt: order.createdAt,
});

const requireRestaurantContext = async (req, res) => {
  if (!req.user.restaurantId) {
    res.status(403).json({ error: 'Ödeme için bir restoran hesabı gerekli.' });
    return null;
  }
  const restaurant = await Restaurant.findById(req.user.restaurantId);
  if (!restaurant) {
    res.status(404).json({ error: 'Restoran bulunamadı.' });
    return null;
  }
  return restaurant;
};

export const getBillingOverview = async (req, res, next) => {
  try {
    const restaurant = await requireRestaurantContext(req, res);
    if (!restaurant) return;
    const orders = await Order.find({ restaurantId: restaurant._id }).sort({ createdAt: -1 }).limit(20).lean();
    res.json({
      configured: isPaytrConfigured(),
      subscription: {
        plan: restaurant.subscription?.plan || null,
        planName: PLANS[restaurant.subscription?.plan]?.name || null,
        period: restaurant.subscription?.period || null,
        status: restaurant.subscription?.status || 'NONE',
        currentPeriodEnd: restaurant.subscription?.currentPeriodEnd || null,
      },
      plans: Object.values(PLANS),
      orders: orders.map(serializeOrder),
    });
  } catch (error) {
    next(error);
  }
};

export const createCheckout = async (req, res, next) => {
  try {
    if (!isPaytrConfigured()) {
      return res.status(503).json({ error: 'Ödeme altyapısı henüz yapılandırılmadı. Lütfen daha sonra tekrar deneyin.' });
    }
    const restaurant = await requireRestaurantContext(req, res);
    if (!restaurant) return;

    const { plan, period, name, phone, address } = req.body || {};
    const priced = getPlanPrice(plan, period);
    if (!priced) return res.status(400).json({ error: 'Geçersiz paket veya dönem seçimi.' });

    const cleanName = String(name || '').trim().slice(0, 60);
    const cleanPhone = String(phone || '').replace(/[^\d+]/g, '').slice(0, 20);
    const cleanAddress = String(address || '').trim().slice(0, 200);
    if (cleanName.length < 3) return res.status(400).json({ error: 'Ad soyad / ünvan zorunludur.' });
    if (cleanPhone.replace(/\D/g, '').length < 10) return res.status(400).json({ error: 'Geçerli bir telefon numarası girin.' });
    if (cleanAddress.length < 10) return res.status(400).json({ error: 'Fatura adresi zorunludur.' });

    const user = await User.findById(req.user.userId).select('email').lean();
    const email = user?.email;
    if (!email || !/^\S+@\S+\.\S+$/.test(email)) {
      return res.status(400).json({ error: 'Ödeme için hesabınıza geçerli bir e-posta adresi tanımlı olmalı.' });
    }

    // PayTR requires an alphanumeric merchant_oid.
    const merchantOid = `ZUU${Date.now()}${crypto.randomBytes(4).toString('hex')}`;
    const periodLabel = BILLING_PERIODS[period].label;
    const basket = [[`zuuqrmenu ${priced.plan.name} (${periodLabel})`, priced.amount.toFixed(2), 1]];
    const site = siteBase();

    const { token, testMode } = await requestIframeToken({
      merchantOid,
      email,
      amountTry: priced.amount,
      userIp: getClientIp(req),
      userName: cleanName,
      userAddress: cleanAddress,
      userPhone: cleanPhone,
      basket,
      okUrl: `${site}/odeme-sonuc?durum=basarili`,
      failUrl: `${site}/odeme-sonuc?durum=basarisiz`,
    });

    await Order.create({
      merchantOid,
      restaurantId: restaurant._id,
      userId: req.user.userId,
      plan,
      period,
      amount: priced.amount,
      testMode,
      billing: { name: cleanName, email, phone: cleanPhone, address: cleanAddress },
    });

    res.json({ token, iframeUrl: `${PAYTR_IFRAME_URL}${token}`, merchantOid });
  } catch (error) {
    next(error);
  }
};

export const getOrderStatus = async (req, res, next) => {
  try {
    const order = await Order.findOne({ merchantOid: req.params.merchantOid, restaurantId: req.user.restaurantId }).lean();
    if (!order) return res.status(404).json({ error: 'Sipariş bulunamadı.' });
    res.json({ order: serializeOrder(order) });
  } catch (error) {
    next(error);
  }
};

/**
 * PayTR notification (callback) endpoint. It must answer with the plain text "OK"
 * once the notification is processed, otherwise PayTR keeps retrying.
 */
export const paytrCallback = async (req, res) => {
  try {
    const payload = req.body || {};
    if (!verifyCallbackHash(payload)) {
      return res.status(400).send('PAYTR notification failed: bad hash');
    }

    const order = await Order.findOne({ merchantOid: payload.merchant_oid });
    if (!order || order.status !== 'PENDING') return res.send('OK'); // unknown or already processed

    if (payload.status === 'success') {
      const expectedKurus = Math.round(order.amount * 100);
      if (Number(payload.total_amount) !== expectedKurus) {
        order.status = 'FAILED';
        order.failureMessage = `Tutar uyuşmazlığı: beklenen ${expectedKurus}, gelen ${payload.total_amount}`;
        await order.save();
        return res.send('OK');
      }
      const restaurant = await Restaurant.findById(order.restaurantId);
      const now = new Date();
      const currentEnd = restaurant?.subscription?.currentPeriodEnd;
      // Renewing the same active plan extends the running period.
      const start = currentEnd && currentEnd > now && restaurant.subscription.plan === order.plan ? currentEnd : now;
      const end = addMonths(start, BILLING_PERIODS[order.period].months);
      order.status = 'PAID';
      order.paidAt = now;
      order.periodStart = start;
      order.periodEnd = end;
      await order.save();
      if (restaurant) {
        restaurant.subscription = { plan: order.plan, period: order.period, status: 'ACTIVE', currentPeriodEnd: end, lastOrderId: order._id };
        await restaurant.save();
      }
    } else {
      order.status = 'FAILED';
      order.failureCode = payload.failed_reason_code;
      order.failureMessage = payload.failed_reason_msg;
      await order.save();
    }
    res.send('OK');
  } catch (error) {
    console.error('PayTR callback error:', error);
    res.status(500).send('error');
  }
};
