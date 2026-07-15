// PERMANENT WORKING CODE - aihubpro.in - No more 405
export async function onRequestPost(context) {
  try {
    const request = context.request;
    const cf = context.cf;

    let body = null;
    try {
      body = await request.json();
    } catch (e) {
      body = null;
    }

    let plan = 'basic';
    if (body) {
      if (body.plan) {
        plan = body.plan;
      }
    }

    let country = 'IN';
    if (cf) {
      if (cf.country) {
        country = cf.country;
      }
    }

    let isIndian = false;
    if (country === 'IN') {
      isIndian = true;
    }

    // TEST Stripe Payment Links - baad me LIVE links daal dena
    let basicUrl = '';
    let proUrl = '';

    if (isIndian) {
      basicUrl = 'https://buy.stripe.com/test_28o8xA0Hq5iF8N28ww';
      proUrl = 'https://buy.stripe.com/test_14k8xA0Hq5iF8N28ww';
    } else {
      basicUrl = 'https://buy.stripe.com/test_bIY8xA0Hq5iF8N28ww';
      proUrl = 'https://buy.stripe.com/test_6oE8xA0Hq5iF8N28ww';
    }

    let finalUrl = basicUrl;
    if (plan === 'pro') {
      finalUrl = proUrl;
    }

    let currency = 'USD';
    if (isIndian) {
      currency = 'INR';
    }

    const data = {
      success: true,
      url: finalUrl,
      plan: plan,
      currency: currency
    };

    return new Response(JSON.stringify(data), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type'
      }
    });

  } catch (error) {
    const errData = {
      success: false,
      error: 'Checkout failed',
      details: error.message
    };
    return new Response(JSON.stringify(errData), {
      status: 500,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
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
      'Access-Control-Allow-Headers': 'Content-Type'
    }
  });
}

// Extra safety - agar GET se bhi call ho jaye to
export async function onRequestGet(context) {
  return onRequestPost(context);
}
