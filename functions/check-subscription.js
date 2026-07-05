export async function onRequestPost(context) {
  const { request, env } = context;
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Content-Type': 'application/json'
  };

  try {
    const body = await request.json();
    const { email } = body;

    if (!email) return Response.json({ error: 'Email required' }, { status: 400, headers });

    const subData = await env.SUBSCRIPTIONS.get(email);
    
    if (!subData) {
      return Response.json({ 
        active: false, 
        message: 'No active subscription. Please buy plan.',
        plans: { basic: 666, pro: 999 }
      }, { headers });
    }

    const subscription = JSON.parse(subData);
    const expiryDate = new Date(subscription.expiry_date);
    const now = new Date();

    if (now > expiryDate) {
      return Response.json({ 
        active: false, 
        message: 'Subscription expired. Renew karo.',
        expired_on: expiryDate.toLocaleDateString('hi-IN'),
        plans: { basic: 666, pro: 999 }
      }, { headers });
    }

    const daysLeft = Math.ceil((expiryDate - now) / (1000 * 60 * 60 * 24));
    
    return Response.json({
      active: true,
      plan: subscription.plan,
      expiry: expiryDate.toLocaleDateString('hi-IN'),
      days_left: daysLeft,
      message: `Active plan: ${subscription.plan}. ${daysLeft} din bache hain.`
    }, { headers });

  } catch (error) {
    return Response.json({ error: 'Check failed' }, { status: 500, headers });
  }
}
