export async function onRequestPost(context) {
  const { env, request, cf } = context;
  const securityHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Content-Type': 'application/json'
  };
  try {
    const body = await request.json().catch(() => null);
    // Frontend se jo bhi aaye - PLUS ya PRO ya amount
    let amount = body?.amount || 666;
    let planInput = body?.plan || '';

    // Plan ko amount me convert - PLUS/PRO final naming
    if (planInput === 'plus' || planInput === 'PLUS' || amount == 666) {
      amount = 666;
      planInput = 'plus';
    } else if (planInput === 'pro' || planInput === 'PRO' || amount == 999) {
      amount = 999;
      planInput = 'pro';
    }

    const country = cf?.country || 'IN';
    const isIndian = country === 'IN';
    const currency = isIndian ? 'INR' : 'USD';
    const days = 28; // Dono ka 28 din - PLUS aur PRO

    // Agar Razorpay keys hai to real order banao
    if (env.RAZORPAY_KEY_ID && env.RAZORPAY_KEY_SECRET) {
      const orderOptions = {
        amount: amount * 100, // paise me
        currency: currency,
        receipt: `aihubpro_${planInput}_${Date.now()}`,
        notes: {
          plan: planInput,
          days: days.toString(),
          adfree: planInput === 'pro' ? 'true' : 'false'
        }
      };
      const auth = btoa(env.RAZORPAY_KEY_ID + ':' + env.RAZORPAY_KEY_SECRET);
      const res = await fetch('https://api.razorpay.com/v1/orders', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Basic ' + auth
        },
        body: JSON.stringify(orderOptions)
      });
      const data = await res.json();

      if (data.id) {
        return Response.json({
          success: true,
          orderId: data.id,
          order_id: data.id,
          amount: amount,
          currency: currency,
          plan: planInput,
          days: days,
          key: env.RAZORPAY_KEY_ID,
          adfree: planInput === 'pro'
        }, { status: 200, headers: securityHeaders });
      }
    }

    // Fallback - Agar keys nahi hai to bhi frontend ko PLUS/PRO ka data do
    return Response.json({
      success: true,
      amount: amount,
      currency: currency,
      plan: planInput,
      days: days,
      key: env.RAZORPAY_KEY_ID || null,
      adfree: planInput === 'pro',
      message: planInput === 'plus' ? '₹666 PLUS - 28 Din (Ads ke saath)' : '₹999 PRO - 28 Din (Bina Ads - Sab Perfect)'
    }, { status: 200, headers: securityHeaders });

  } catch (error) {
    return Response.json({
      error: 'Checkout failed',
      details: error.message
    }, { status: 500, headers: securityHeaders });
  }
}

export async function onRequestOptions() {
  return new Response(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization'
    }
  });
}
