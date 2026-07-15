export async function onRequestPost(context) {
  const { request, cf } = context;
  try {
    const body = await request.json().catch(function() { return null; });
    const plan = body && body.plan? body.plan : 'basic';
    const country = cf && cf.country? cf.country : 'IN';
    const isIndian = country === 'IN';

    var testUrls = {
      basic: isIndian? 'https://buy.stripe.com/test_28o8xA0Hq5iF8N28ww' : 'https://buy.stripe.com/test_bIY8xA0Hq5iF8N28ww',
      pro: isIndian? 'https://buy.stripe.com/test_14k8xA0Hq5iF8N28ww' : 'https://buy.stripe.com/test_6oE8xA0Hq5iF8N28ww'
    };

    var url = testUrls[plan] || testUrls.basic;

    return new Response(JSON.stringify({
      success: true,
      url: url,
      plan: plan,
      currency: isIndian? 'INR' : 'USD'
    }), {
      status: 200,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Content-Type': 'application/json'
      }
    });
  } catch (error) {
    return new Response(JSON.stringify({
      error: 'Checkout failed',
      details: error.message
    }), {
      status: 500,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Content-Type': 'application/json'
      }
    });
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
