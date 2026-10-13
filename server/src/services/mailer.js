import nodemailer from 'nodemailer';
import { BILLING_PERIODS, PLANS } from '../config/plans.js';

const isMailConfigured = () => Boolean(process.env.MAIL_USER && process.env.MAIL_APP_PASSWORD);

const escapeHtml = (value) => String(value ?? '').replace(/[&<>"']/g, (ch) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[ch]));
const fmtTry = (n) => `₺${Number(n).toLocaleString('tr-TR')}`;
const fmtDate = (d) => (d ? new Date(d).toLocaleString('tr-TR', { dateStyle: 'long', timeStyle: 'short', timeZone: 'Europe/Istanbul' }) : '-');

let transporter;
const getTransporter = () => {
  if (!transporter) {
    transporter = nodemailer.createTransport({
      host: 'smtp.gmail.com',
      port: 465,
      secure: true,
      auth: { user: process.env.MAIL_USER, pass: process.env.MAIL_APP_PASSWORD },
      connectionTimeout: 8000,
      socketTimeout: 8000,
    });
  }
  return transporter;
};

/**
 * Notifies the owner of a completed purchase. Never throws: a mail problem must not break the payment callback.
 */
export const sendPurchaseNotification = async ({ order, restaurant }) => {
  if (!isMailConfigured()) {
    console.warn('Purchase mail skipped: MAIL_USER / MAIL_APP_PASSWORD not set.');
    return false;
  }
  try {
    const planName = PLANS[order.plan]?.name || order.plan;
    const periodLabel = BILLING_PERIODS[order.period]?.label || order.period;
    const rows = [
      ['Restoran', restaurant?.name],
      ['Paket', `${planName} (${periodLabel})`],
      ['Tutar (KDV dahil)', fmtTry(order.amount)],
      ['Ödeme zamanı', fmtDate(order.paidAt)],
      ['Abonelik bitişi', fmtDate(order.periodEnd)],
      ['Sipariş no', order.merchantOid],
      ['Fatura adı / ünvan', order.billing?.name],
      ['E-posta', order.billing?.email],
      ['Telefon', order.billing?.phone],
      ['Fatura adresi', order.billing?.address],
    ];
    const testTag = order.testMode ? ' [TEST]' : '';
    const html = `<div style="font-family:Arial,sans-serif;max-width:560px">
      <h2 style="margin:0 0 12px">Satın Alındı!${escapeHtml(testTag)}</h2>
      <table style="border-collapse:collapse;width:100%">${rows.map(([k, v]) => `<tr><td style="padding:6px 10px;border-bottom:1px solid #e5e5e0;color:#666">${escapeHtml(k)}</td><td style="padding:6px 10px;border-bottom:1px solid #e5e5e0"><b>${escapeHtml(v || '-')}</b></td></tr>`).join('')}</table>
      ${order.testMode ? '<p style="color:#b45309">Bu bir test ödemesidir, gerçek çekim yapılmamıştır.</p>' : ''}
    </div>`;
    const text = rows.map(([k, v]) => `${k}: ${v || '-'}`).join('\n');

    await getTransporter().sendMail({
      from: `"zuuqrmenu" <${process.env.MAIL_USER}>`,
      to: process.env.MAIL_TO || process.env.MAIL_USER,
      subject: `Satın Alındı! (zuuqrmenu - ${planName})${testTag}`,
      text,
      html,
    });
    return true;
  } catch (error) {
    console.error('Purchase mail failed:', error.message);
    return false;
  }
};
