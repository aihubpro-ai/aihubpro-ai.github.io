export async function onRequestPost(context) {
  const { env, request, cf } = context;
  const securityHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Content-Type': 'application/json'
  };
  try {
    const body = await request.json().catch(() => null);
    const plan = body?.plan || 'basic';
    const country = cf.country || 'IN';
    const isIndian = country === 'IN';

    const testUrls = {
      basic: isIndian? 'https://buy.stripe.com/test_28o8xA0Hq5iF8N28ww' : 'https://buy.stripe.com/test_bIY8xA0Hq5iF8N28ww',
      pro: isIndian? 'https://buy.stripe.com/test_14k8xA0Hq5iF8N28ww' : 'https://buy.stripe.com/test_6oE8xA0Hq5iF8N28ww'
    };
    
    return Response.json({ 
      success: true,
      url: testUrls[plan] || testUrls.basic, // <-- Ye line fix ki hai
      plan: plan,
      currency: isIndian? 'INR' : 'USD'
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
