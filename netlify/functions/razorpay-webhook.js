const crypto = require('crypto');

exports.handler = async (event, context) => {
  // 1. Sirf POST request allow karo
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: 'Method Not Allowed' };
  }

  // 2. Signature verify karo - Security ke liye sabse zaroori
  const webhookSecret = process.env.RAZORPAY_WEBHOOK_SECRET;
  const signature = event.headers['x-razorpay-signature'];

  const shasum = crypto.createHmac('sha256', webhookSecret);
  shasum.update(event.body);
  const digest = shasum.digest('hex');

  // Agar signature match nahi hua to request fake hai
  if (digest !== signature) {
    console.error('❌ Invalid signature. Request rejected.');
    return { statusCode: 400, body: 'Invalid signature' };
  }

  // 3. Razorpay ka data parse karo
  const body = JSON.parse(event.body);

  // 4. Sirf 'payment.captured' event pe kaam karo
  if (body.event === 'payment.captured') {
    const payment = body.payload.payment.entity;
    const user_email = payment.email;
    const payment_id = payment.id;
    const amount = payment.amount / 100; // paise to rupee

    console.log(`✅ Payment SUCCESS: ${user_email}, ₹${amount}, ID: ${payment_id}`);
    
    // TODO: YAHAN DATABASE UPDATE KA CODE AAYEGA
    // Abhi ke liye sirf log kar rahe hain

    return {
      statusCode: 200,
      body: JSON.stringify({ status: 'ok', message: 'Payment processed' })
    };
  }

  // 5. Baaki events ignore karo
  console.log(`Event ignored: ${body.event}`);
  return { statusCode: 200, body: 'Event ignored' };
};
