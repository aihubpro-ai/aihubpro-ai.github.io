export async function onRequestPost({request, env}){
  const ip = request.headers.get('CF-Connecting-IP') || 'unknown';
  const body = await request.json().catch(()=>({}));
  const amount = body.amount || 666;
  const plan = amount==999 ? 'premium' : 'pro';
  const days = 28; // Dono ka 28 din
  const adFree = amount==999 ? true : false;
  
  // Paid + Plan + Ad status save
  await env.SUBSCRIPTIONS?.put('paid_'+ip, (Date.now()+days*24*60*60*1000).toString(), {expirationTtl: days*24*60*60+100});
  await env.SUBSCRIPTIONS?.put('plan_'+ip, plan, {expirationTtl: days*24*60*60+100});
  await env.SUBSCRIPTIONS?.put('adfree_'+ip, adFree.toString(), {expirationTtl: days*24*60*60+100});
  
  return Response.json({success:true, plan:plan, adFree:adFree, days:days});
}
