export async function onRequestPost(context) {
  const { request, env } = context;
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Content-Type': 'application/json'
  };

  try {
    const body = await request.json();
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature, plan } = body;
    const ip = request.headers.get('CF-Connecting-IP');
    const userAgent = request.headers.get('User-Agent');
    const cf = request.cf;

    // 1. RAZORPAY SIGNATURE VERIFY - Security ke liye zaruri
    const crypto = await import('node:crypto');
    const generated_signature = crypto.createHmac('sha256', env.RAZORPAY_KEY_SECRET)
      .update(razorpay_order_id + "|" + razorpay_payment_id)
      .digest('hex');

    if (generated_signature !== razorpay_signature) {
      return Response.json({ 
        success: false, 
        error: 'Payment verification failed - Invalid signature' 
      }, { status: 400, headers });
    }

    // 2. 30 DIN KA ACCESS DO - IP SE SAVE KARO
    const expiryTimestamp = Date.now() + (30 * 24 * 60 * 60 * 1000); // 30 days in ms
    const expiryDate = new Date(expiryTimestamp);

    // KV mein IP ke against expiry save karo - Frontend isi ko check karta hai
    await env.SUBSCRIPTIONS.put(
      `paid_${ip}`, 
      expiryTimestamp.toString(), 
      { expirationTtl: 2592000 } // 30 days auto-delete
    );
    
    // Payment ka poora log rakho - 1 saal ke liye
    await env.PAYMENT_LOGS.put(
      `payment_${razorpay_payment_id}`, 
      JSON.stringify({
        ip: ip,
        plan: plan,
        amount: plan,
        payment_id: razorpay_payment_id,
        order_id: razorpay_order_id,
        time_ist: new Date().toLocaleString('en-IN', {timeZone: 'Asia/Kolkata'}),
        expiry_ist: expiryDate.toLocaleString('en-IN', {timeZone: 'Asia/Kolkata'}),
        expiry_timestamp: expiryTimestamp,
        location: cf?.city + ', ' + cf?.country,
        user_agent: userAgent,
        jurisdiction: 'Yamunanagar District Court, Haryana, India',
        status: 'SUCCESS'
      }), 
      { expirationTtl: 31536000 } // 1 year
    );

    // 3. SUCCESS RESPONSE - Frontend ko expiry bhej do
    return Response.json({
      success: true,
      message: 'Payment verified. 30 days access activated.',
      expiry: expiryTimestamp,
      plan: plan,
      next_billing: expiryDate.toLocaleDateString('en-IN', {
        day: '2-digit', month: 'short', year: 'numeric'
      })
    }, { headers });

  } catch (error) {
    // Error log karo future debugging ke liye
    console.error('Payment Verify Error:', error);
    return Response.json({ 
      success: false,
      error: 'Verification failed: ' + error.message 
    }, { status: 500, headers });
  }
}
