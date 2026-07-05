export async function onRequestPost(context) {
  const { request, env } = context;
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Content-Type': 'application/json'
  };

  try {
    const body = await request.json();
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature, email, plan } = body;

    // 1. SIGNATURE VERIFY
    const crypto = await import('node:crypto');
    const generated_signature = crypto.createHmac('sha256', env.RAZORPAY_KEY_SECRET)
      .update(razorpay_order_id + "|" + razorpay_payment_id)
      .digest('hex');

    if (generated_signature !== razorpay_signature) {
      return Response.json({ error: 'Payment verification failed' }, { status: 400, headers });
    }

    // 2. 30 DIN KA ACCESS DO
    const expiryDate = new Date();
    expiryDate.setDate(expiryDate.getDate() + 30);

    await env.SUBSCRIPTIONS.put(email, JSON.stringify({
      plan: plan,
      payment_id: razorpay_payment_id,
      order_id: razorpay_order_id,
      start_date: new Date().toISOString(),
      expiry_date: expiryDate.toISOString(),
      status: 'active',
      price_paid: plan === 'basic' ? 666 : 999,
      terms: '9% price increase every April 1st with 1 month email notice. Court: Yamunanagar, Haryana only'
    }), { expirationTtl: 2592000 }); // 30 days

    return Response.json({
      success: true,
      message: 'Payment verified. 30 days access activated.',
      expiry: expiryDate.toLocaleDateString('hi-IN'),
      plan: plan
    }, { headers });

  } catch (error) {
    return Response.json({ error: 'Verification failed' }, { status: 500, headers });
  }
}
