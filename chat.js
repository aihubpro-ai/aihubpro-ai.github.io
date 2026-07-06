export async function onRequestPost(context) {
  const { request, env } = context;
  const body = await request.json();
  const userMessage = body.message;
  const userIP = request.headers.get('CF-Connecting-IP');

  const illegalWords = ['bomb', 'hack', 'kill', 'drug', 'murder', 'weapon', 'suicide'];
  const hasIllegal = illegalWords.some(word => 
    userMessage.toLowerCase().includes(word)
  );
  
  if (hasIllegal) {
    await env.ILLEGAL_LOGS.put(userIP + ':' + Date.now(), userMessage);
    return new Response(JSON.stringify({ 
      reply: "Sorry, I can't help with that request. It violates our safety policy." 
    }), { headers: { 'Content-Type': 'application/json' } });
  }

  const trialKey = 'trial:' + userIP;
  const paidKey = 'paid:' + userIP;
  const isPaid = await env.SUBSCRIPTIONS.get(paidKey);
  const trialStart = await env.SUBSCRIPTIONS.get(trialKey);

  if (!isPaid) {
    if (!trialStart) {
      await env.SUBSCRIPTIONS.put(trialKey, Date.now().toString(), { expirationTtl: 86400 });
    } else {
      const elapsed = Date.now() - parseInt(trialStart);
      if (elapsed > 5 * 60 * 1000) {
        return new Response(JSON.stringify({ 
          reply: "TRIAL_ENDED",
          razorpay_key: env.RAZORPAY_KEY_ID
        }), { headers: { 'Content-Type': 'application/json' } });
      }
    }
  }

  const openaiRes = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${env.OPENAI_API_KEY}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      model: 'gpt-4o-mini',
      messages: [
        { role: 'system', content: 'You are AIHubPro, a helpful AI assistant. Reply in Hinglish or English based on user language.' },
        { role: 'user', content: userMessage }
      ]
    })
  });

  const data = await openaiRes.json();
  const aiReply = data.choices[0].message.content;

  return new Response(JSON.stringify({ reply: aiReply }), {
    headers: { 'Content-Type': 'application/json' }
  });
}
