export async function onRequestPost(context) {
  const { request, env } = context;
  const headers = { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*', 'Access-Control-Allow-Methods': 'POST, OPTIONS', 'Access-Control-Allow-Headers': 'Content-Type' };
  try {
    const ip = request.headers.get('CF-Connecting-IP') || 'unknown';
    let body = {}; try{ body = await request.json(); }catch(e){ body = {}; }
    const originalMessage = (body.message || '').toString().trim();
    if(!originalMessage) return Response.json({error:'Khali message'}, {status:400, headers});

    // ✅ TRY-CATCH WRAP - KV na ho to bhi crash nahi hoga
    let paidUntil=null, userPlan='free', trialStart=null;
    try{
      paidUntil = await env.SUBSCRIPTIONS?.get('paid_' + ip);
      userPlan = await env.SUBSCRIPTIONS?.get('plan_' + ip) || 'free';
      trialStart = await env.SUBSCRIPTIONS?.get('trial_' + ip);
    }catch(e){ /* KV nahi hai to ignore */ }

    // Paid nahi hai to trial check
    if(!paidUntil || Date.now() >= parseInt(paidUntil||'0')){
      try{
        if(!trialStart){
          await env.SUBSCRIPTIONS?.put('trial_'+ip, Date.now().toString(), {expirationTtl:86400});
        } else {
          const elapsed = Date.now() - parseInt(trialStart);
          if(elapsed > 5*60*1000){
            return Response.json({
              reply: "TRIAL_ENDED",
              razorpay_key: env.RAZORPAY_KEY_ID || null,
              message: `⏰ 5 Minute Trial Khatam!\n\n👉 ₹666 PLUS - 28 Din (With Ads)\n🔥 ₹999 PRO - 28 Din (No Ads)`,
            }, {headers});
          }
        }
      }catch(e){ /* KV error ignore */ }
    }

    // ✅ AI PROMPT
    const systemPrompt = 'You are AIHUBPRO AI. Reply in Hinglish friendly style. User: '+originalMessage;

    // ✅ 3 ENGINES - JO KEY MILEGA USSE CHALEGA
    let reply = null;

    // 1. GROQ
    if(!reply && env.GROQ_API_KEY){
      try{
        const r = await fetch('https://api.groq.com/openai/v1/chat/completions',{
          method:'POST',
          headers:{'Content-Type':'application/json','Authorization':'Bearer '+env.GROQ_API_KEY},
          body: JSON.stringify({model:'llama-3.3-70b-versatile', messages:[{role:'system',content:systemPrompt},{role:'user',content:originalMessage}]})
        });
        const d = await r.json();
        reply = d.choices?.[0]?.message?.content;
      }catch(e){}
    }

    // 2. GEMINI
    if(!reply && env.GEMINI_API_KEY){
      try{
        const r = await fetch('https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key='+env.GEMINI_API_KEY,{
          method:'POST',
          headers:{'Content-Type':'application/json'},
          body: JSON.stringify({contents:[{parts:[{text:systemPrompt}]}]})
        });
        const d = await r.json();
        reply = d.candidates?.[0]?.content?.parts?.[0]?.text;
      }catch(e){}
    }

    // 3. OPENAI
    if(!reply && env.OPENAI_API_KEY){
      try{
        const r = await fetch('https://api.openai.com/v1/chat/completions',{
          method:'POST',
          headers:{'Content-Type':'application/json','Authorization':'Bearer '+env.OPENAI_API_KEY},
          body: JSON.stringify({model:'gpt-4o-mini', messages:[{role:'system',content:systemPrompt},{role:'user',content:originalMessage}]})
        });
        const d = await r.json();
        reply = d.choices?.[0]?.message?.content;
      }catch(e){}
    }

    // ✅ AGAR 3no key nahi hai to bhi reply dega - Server busy nahi ayega
    if(!reply){
      if(!env.GROQ_API_KEY &&!env.GEMINI_API_KEY &&!env.OPENAI_API_KEY){
        return Response.json({reply:`Ram Ram! 🙏 Main AIHUBPRO hun! \n\nAbhi AI keys Cloudflare me add nahi hai isliye ye demo reply hai. \n\n**Cloudflare > aihubpro-ai > Settings > Variables and Secrets me:**\n- GROQ_API_KEY daalo\n- Fir se deploy karo\n\nFir real AI reply ayega!`}, {headers});
      }
      return Response.json({reply:`Thoda busy hu, 5 sec baad phir se "${originalMessage}" bhejo! 😊`}, {headers});
    }

    if(userPlan==='plus') reply += `\n\n---\n*💡 PRO lo (₹999) bina ads perfect pao!*`;

    return Response.json({reply: reply, plan: userPlan}, {headers});

  } catch(err){
    // ✅ CRASH BHI HOGA TO BHI SERVER BUSY NAHI, REPLY DEGA
    return Response.json({reply:`Hi! "${(await request.json().catch(()=>({})).message)||'').toString().slice(0,50)}" ka jawab thodi der me dunga, abhi thoda load hai!`}, {status:200, headers: {'Content-Type':'application/json','Access-Control-Allow-Origin':'*'}});
  }
}
export async function onRequestOptions(){ return new Response(null,{status:200, headers:{'Access-Control-Allow-Origin':'*','Access-Control-Allow-Methods':'POST, OPTIONS','Access-Control-Allow-Headers':'Content-Type'}}); }
