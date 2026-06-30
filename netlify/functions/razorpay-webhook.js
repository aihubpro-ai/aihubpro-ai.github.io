const crypto = require('crypto');
const admin = require('firebase-admin');

// Firebase init - ek hi baar chalega
if (!admin.apps.length) {
  try {
    admin.initializeApp({
      credential: admin.credential.cert(JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT))
    });
  } catch (error) {
    console.log('Firebase init error:', error);
  }
}
const db = admin.firestore();

exports.handler = async (event) => {
  // Sirf POST request allow karo
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: 'Method Not Allowed' };
  }

  // 1. Razorpay signature verify karo
  const webhookSecret = process.env.RAZORPAY_WEBHOOK_SECRET;
  const signature = event.headers['x-razorpay-signature'];
  const body = event.body;
  
  if (!webhookSecret || !signature) {
    return { statusCode: 400, body: 'Missing webhook secret or signature' };
  }

  const expectedSignature = crypto
    .createHmac('sha256', webhookSecret)
    .update(body)
    .digest('hex');

  if (signature !== expectedSignature) {
    console.log('Invalid signature received');
    return { statusCode: 400, body: 'Invalid signature' };
  }

  // 2. Payment data nikalo
  let data;
  try {
    data = JSON.parse(body);
  } catch (err) {
    return { statusCode: 400, body: 'Invalid JSON' };
  }
  
  // 3. Sirf payment.captured event pe kaam karo
  if (data.event === 'payment.captured') {
    const payment = data.payload.payment.entity;
    const email = payment.email;
    const amount = payment.amount / 100;
    const paymentId = payment.id;
    
    if (!email) {
      console.log('Email not found in payment');
      return { statusCode: 400, body: 'Email missing' };
    }
    
    console.log('Payment Success:', email, amount);
    
    // 4. FIREBASE MEIN USER KO PRO BANAO
    try {
      await db.collection('users').doc(email).set({ 
        isPro: true, 
        proDate: admin.firestore.FieldValue.serverTimestamp(),
        plan: 'pro',
        paymentId: paymentId,
        amount: amount,
        currency: payment.currency
      }, { merge: true });
      
      console.log('User upgraded to PRO successfully:', email);
      return {
        statusCode: 200,
        body: JSON.stringify({ success: true, email: email })
      };
      
    } catch (err) {
      console.log('DB Error:', err);
