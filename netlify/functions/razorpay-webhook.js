const crypto = require('crypto');

exports.handler = async (event) => {
  // 1. Razorpay signature verify karo
  const webhookSecret = process.env.RAZORPAY_WEBHOOK_SECRET;
  const signature = event.headers['x-razorpay-signature'];
  const body = event.body;
  
  const expectedSignature = crypto
    .createHmac('sha256', webhookSecret)
    .update(body)
    .digest('hex');

  if (signature !== expectedSignature) {
    console.log('Invalid signature');
    return { statusCode: 400, body: 'Invalid signature' };
  }

  // 2. Payment data nikalo
  const data = JSON.parse(body);
  
  if (data.event === 'payment.captured') {
    const payment = data.payload.payment.entity;
    const email = payment.email; 
    const amount = payment.amount / 100;
    
    console.log('Payment Success:', email, amount);
    
    // 3. TODO: YAHAN DB UPDATE KA CODE AAYEGA
    // Tu DB bata dega to main ye complete kar dunga
    
    return { 
      statusCode: 200, 
      body: JSON.stringify({ success: true }) 
    };
  }

  return { statusCode: 200, body: 'Event ignored' };
};
