export async function onRequestPost({request, env}){
  const ip = request.headers.get('CF-Connecting-IP') || 'unknown';
  const body = await request.json().catch(()=>({}));
  const amount = body.amount || 666;
  const plan = amount==999 ? 'pro' : 'plus';
  const days = 28;
  const adFree = amount==999 ? true : false;
  const expire = Date.now() + days*24*60*60*1000;

  // Paid + Plan + Ad status save - KV me
  try{
    if(env.SUBSCRIPTIONS){
      await env.SUBSCRIPTIONS.put('paid_'+ip, expire.toString(), {expirationTtl: days*24*60*60});
      await env.SUBSCRIPTIONS.put('plan_'+ip, plan, {expirationTtl: days*24*60*60});
      await env.SUBSCRIPTIONS.put('adfree_'+ip, adFree.toString(), {expirationTtl: days*24*60*60});
    }
  }catch(e){ console.log('KV Error:', e.message); }

  return Response.json({success:true, plan:plan, adFree:adFree, days:days, amount:amount, message: 'Payment Complete! ₹'+amount+' Plan Activated'});
}

export async function onRequestOptions(){
  return new Response(null,{status:200,headers:{'Access-Control-Allow-Origin':'*','Access-Control-Allow-Methods':'POST, OPTIONS','Access-Control-Allow-Headers':'Content-Type'}});
}
