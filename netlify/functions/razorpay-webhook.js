const crypto = require('crypto');

exports.handler = async (event, context) => {
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: 'Method Not Allowed' };
  }

  const webhookSecret = process.env.RAZORPAY_WEBHOOK_SECRET;
  const signature = event.headers['x-razorpay-signature'];
  
  const shasum = crypto.createHmac('sha256', webhookSecret);
  shasum.update(event.body);
  const digest = shasum.digest('hex');

  if (digest !== signature) {
    return { statusCode: 403, body: 'Invalid signature' };
  }

  const body = JSON.parse(event.body);
  
  if (body.event === 'payment.captured') {
    const user_email = body.payload.payment.entity.email;
    const payment_id = body.payload.payment.entity.id;
    
    console.log(`Payment captured for ${user_email}, ID: ${payment_id}`);
    
    return {
      statusCode: 200,
      body: JSON.stringify({ status: 'ok' })
    };
  }

  return { statusCode: 200, body: 'Event ignored' };
};
