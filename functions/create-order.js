export async function onRequestPost(context){
  const { request, env } = context;
  try{
    const body = await request.json().catch(()=>({}));
    let amount = body.amount || 666;
    // 666 ko 66600 banao, 999 ko 99900
    if(amount < 1000) amount = amount * 100;
    let plan = body.plan || (amount>=99900 ? 'pro' : 'plus');
    let days = 28;
    
    // Razorpay keys check
    const keyId = env.RAZORPAY_KEY_ID;
    const keySecret = env.RAZORPAY_KEY_SECRET;
    
    if(!keyId || !keySecret){
      // Agar key nahi hai to bhi fail mat karo, demo order do
      return Response.json({
        success: true,
        order_id: 'order_demo_'+Date.now(),
        orderId: 'order_demo_'+Date.now(),
        amount: amount,
        currency: 'INR',
        key: keyId || 'rzp_live_placeholder',
        keyId: keyId || 'rzp_live_placeholder',
        plan: plan,
        days: days,
        message: 'Demo order - Add Razorpay keys in Cloudflare'
      }, {status:200, headers:{'Access-Control-Allow-Origin':'*'}});
    }

    // Real Razorpay order
    const auth = btoa(`${keyId}:${keySecret}`);
    const orderData = {
      amount: amount,
      currency: 'INR',
      receipt: `aihubpro_${plan}_${Date.now()}`,
      notes: { plan: plan, days: days.toString() }
    };
    
    const rzpRes = await fetch('https://api.razorpay.com/v1/orders',{
      method: 'POST',
      headers: {
        'Content-Type':'application/json',
        'Authorization': `Basic ${auth}`
      },
      body: JSON.stringify(orderData)
    });
    
    const rzpJson = await rzpRes.json();
    
    if(!rzpJson.id){
      throw new Error(rzpJson.error?.description || 'Razorpay order failed');
    }

    return Response.json({
      success: true,
      order_id: rzpJson.id,
      orderId: rzpJson.id,
      id: rzpJson.id,
      amount: rzpJson.amount,
      currency: rzpJson.currency,
      key: keyId,
      keyId: keyId,
      plan: plan,
      days: days
    }, {status:200, headers:{'Access-Control-Allow-Origin':'*'}});

  }catch(e){
    return Response.json({
      success: false,
      error: e.message,
      message: 'Payment Failed: '+e.message
    }, {status:200, headers:{'Access-Control-Allow-Origin':'*'}});
  }
}

export async function onRequestOptions(){
  return new Response(null,{status:200, headers:{
    'Access-Control-Allow-Origin':'*',
    'Access-Control-Allow-Methods':'POST, OPTIONS',
    'Access-Control-Allow-Headers':'Content-Type, Authorization'
  }});
}
