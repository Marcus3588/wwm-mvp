
const PAYSTACK_BASE = 'https://api.paystack.co';

async function paystackRequest(method, path, body = null) {
  const key = process.env.PAYSTACK_SECRET_KEY;
  if (!key) throw new Error('Paystack not configured');

  const opts = {
    method,
    headers: {
      Authorization: `Bearer ${key}`,
      'Content-Type': 'application/json',
    },
  };
  if (body && (method === 'POST' || method === 'PUT')) {
    opts.body = JSON.stringify(body);
  }

  const res = await fetch(`${PAYSTACK_BASE}${path}`, opts);
  const data = await res.json();

  if (!data.status) {
    throw new Error(data.message || 'Paystack API error');
  }
  return data;
}

async function initializeTransaction({ email, amount, currency = 'GHS', reference, metadata = {}, callback_url }) {
  const data = await paystackRequest('POST', '/transaction/initialize', {
    email,
    amount,
    currency,
    reference,
    metadata,
    callback_url,
  });
  return data.data;
}

async function verifyTransaction(reference) {
  const data = await paystackRequest('GET', `/transaction/verify/${encodeURIComponent(reference)}`);
  return data.data;
}

module.exports = {
  initializeTransaction,
  verifyTransaction,
};
