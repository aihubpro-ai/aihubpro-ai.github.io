export async function onRequestPost(context) {
  const { request, env } = context;
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Content-Type': 'application/json'
  };

  try {
    const body = await request.json();
    const { plan, email } = body;

    // PRICE CALCULATOR - 9% YEARLY INCREASE
    function getCurrentPrice(basePrice) {
      const launchDate = new Date('2026-01-01');
      const now = new Date();
      const yearsPassed = now.getFullYear() - launchDate.getFullYear();
      const monthNow = now.getMonth();

      let price = basePrice;
      for (let i = 0; i < yearsPassed; i++) {
        price = Math.round(price * 1.09);
      }

      // April 1st ke baad 9% badh jayega
      if (monthNow >= 3 && yearsPassed >= 0) {
        price = Math.round(price * 1.09);
      }

      return price;
    }

    const prices = {
      basic: getCurrentPrice(666),
      pro: getCurrentPrice(999)
    };

    const amount = prices[plan];
    if (!amount) return Response.json({ error: 'Invalid plan' }, { status: 400, headers });

    const order = await fetch('https://api.razorpay.com/v1/orders', {
      method: 'POST',
      headers: {
        'Authorization': 'Basic ' + btoa(env.RAZORPAY_KEY_ID + ':' + env.RAZORPAY_KEY_SECRET),
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        amount: amount * 100,
        currency: 'INR',
        receipt: `aihub_${Date.now()}`,
        notes: { plan, email, price_increase: '9% every April 1st with 1 month email notice' }
      })
    });

    const data = await order.json();
    return Response.json({
      order_id: data.id,
      amount: data.amount,
      key: env.RAZORPAY_KEY_ID,
      current_price: amount
    }, { headers });

  } catch (error) {
    return Response.json({ error: 'Order creation failed' }, { status: 500, headers });
  }
}
