import crypto from 'node:crypto';

const GET_TOKEN_URL = 'https://www.paytr.com/odeme/api/get-token';
export const PAYTR_IFRAME_URL = 'https://www.paytr.com/odeme/guvenli/';

export const isPaytrConfigured = () => Boolean(
  process.env.PAYTR_MERCHANT_ID && process.env.PAYTR_MERCHANT_KEY && process.env.PAYTR_MERCHANT_SALT,
);

const hmac = (data) => crypto.createHmac('sha256', process.env.PAYTR_MERCHANT_KEY).update(data).digest('base64');

const safeEqual = (a, b) => {
  const first = Buffer.from(String(a));
  const second = Buffer.from(String(b));
  return first.length === second.length && crypto.timingSafeEqual(first, second);
};

/**
 * Requests an iFrame token from PayTR.
 * amountTry is in TRY; PayTR expects kuruş (x100) as an integer.
 */
export const requestIframeToken = async ({ merchantOid, email, amountTry, userIp, userName, userAddress, userPhone, basket, okUrl, failUrl }) => {
  const merchantId = process.env.PAYTR_MERCHANT_ID;
  const salt = process.env.PAYTR_MERCHANT_SALT;
  const testMode = process.env.PAYTR_TEST_MODE === '0' ? '0' : '1';
  const paymentAmount = String(Math.round(amountTry * 100));
  const userBasket = Buffer.from(JSON.stringify(basket)).toString('base64');
  const noInstallment = process.env.PAYTR_NO_INSTALLMENT === '0' ? '0' : '1';
  const maxInstallment = process.env.PAYTR_MAX_INSTALLMENT || '0';
  const currency = 'TL';

  const hashStr = `${merchantId}${userIp}${merchantOid}${email}${paymentAmount}${userBasket}${noInstallment}${maxInstallment}${currency}${testMode}`;
  const paytrToken = hmac(hashStr + salt);

  const body = new URLSearchParams({
    merchant_id: merchantId,
    user_ip: userIp,
    merchant_oid: merchantOid,
    email,
    payment_amount: paymentAmount,
    paytr_token: paytrToken,
    user_basket: userBasket,
    debug_on: process.env.NODE_ENV === 'production' ? '0' : '1',
    no_installment: noInstallment,
    max_installment: maxInstallment,
    user_name: userName,
    user_address: userAddress,
    user_phone: userPhone,
    merchant_ok_url: okUrl,
    merchant_fail_url: failUrl,
    timeout_limit: '30',
    currency,
    test_mode: testMode,
    lang: 'tr',
  });

  const response = await fetch(GET_TOKEN_URL, { method: 'POST', body, signal: AbortSignal.timeout(15000) });
  const data = await response.json().catch(() => null);
  if (!data || data.status !== 'success' || !data.token) {
    const error = new Error(data?.reason || 'PayTR ödeme oturumu başlatılamadı.');
    error.statusCode = 502;
    throw error;
  }
  return { token: data.token, testMode: testMode === '1' };
};

/** Verifies the hash PayTR sends to the notification (callback) URL. */
export const verifyCallbackHash = ({ merchant_oid, status, total_amount, hash }) => {
  if (!isPaytrConfigured() || !merchant_oid || !status || !hash) return false;
  const expected = hmac(`${merchant_oid}${process.env.PAYTR_MERCHANT_SALT}${status}${total_amount}`);
  return safeEqual(expected, hash);
};
