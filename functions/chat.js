export async function onRequestPost(context) {
  const { request, env, cf } = context;
  const securityHeaders = {
    'Content-Type': 'application/json',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type'
  };
  try {
    const ip = request.headers.get('CF-Connecting-IP') || 'unknown';
    const city = cf?.city || 'Unknown';
    const country = cf?.country || 'IN';

    let body = null;
    try { body = await request.json(); } catch (e) { body = {}; }
    let originalMessage = (body.message || '').toString();
    const userLang = body.lang || 'auto';
    let message = originalMessage.trim();

    // 1. IP Banned Check
    const isBanned = await env.BANNED_IPS?.get(ip);
    if (isBanned) {
      return Response.json({ error: 'BANNED', message: 'Aapka IP banned hai', blocked: true }, { status: 403, headers: securityHeaders });
    }

    // 2. Illegal Content Check
    const illegalKeywords = ['bomb', 'hack govt', 'child porn', 'terrorist'];
    const lowerMsg = message.toLowerCase();
    let isIllegal = false;
    for (const kw of illegalKeywords) { if (lowerMsg.includes(kw)) { isIllegal = true; break; } }
    if (isIllegal) {
      const attempts = parseInt((await env.RATE_LIMIT?.get('illegal_' + ip)) || '0') + 1;
      await env.RATE_LIMIT?.put('illegal_' + ip, attempts.toString(), { expirationTtl: 86400 });
      if (attempts >= 3) { await env.BANNED_IPS?.put(ip, 'PERMANENT_BAN_ILLEGAL', { expirationTtl: 86400 * 365 }); }
      return Response.json({ error: 'LEGAL_WARNING', message: '⚠️ Ye request illegal hai aur Indian Law ke khilaf hai' }, { headers: securityHeaders });
    }

    // 3. Rate limiting: 30 per hour
    const rateLimit = await env.RATE_LIMIT?.get('rate_' + ip);
    if (rateLimit && parseInt(rateLimit) > 30) {
      return Response.json({ error: 'Too many requests. 1 minute baad try karo.', message: '⏳ Server overload protection' }, { headers: securityHeaders });
    }
    await env.RATE_LIMIT?.put('rate_' + ip, (parseInt(rateLimit || '0') + 1).toString(), { expirationTtl: 3600 });

    // 4. Sanitize
    message = originalMessage.replace(/<script.*?>.*?<\/script>/gi, '');
    if (message.length === 0) { return Response.json({ error: 'Khali message mat bhejo' }, { status: 400, headers: securityHeaders }); }
    if (message.length > 2000) { return Response.json({ error: 'Message 2000 characters se chota rakho' }, { status: 400, headers: securityHeaders }); }

    // 5. SUBSCRIPTION / TRIAL CHECK - PERFECT 5 MINUTE LOGIC + PLUS/PRO
    const paidUntil = await env.SUBSCRIPTIONS?.get('paid_' + ip);
    const userPlan = await env.SUBSCRIPTIONS?.get('plan_' + ip) || 'free';
    const isAdFree = await env.SUBSCRIPTIONS?.get('adfree_' + ip) === 'true';

    if (paidUntil && Date.now() < parseInt(paidUntil)) {
      // PAID USER - DIRECT AI REPLY - NO LIMITS - PLUS/PRO ka fark frontend pe hoga
    } else {
      const trialStart = await env.SUBSCRIPTIONS?.get('trial_' + ip);
      if (!trialStart) {
        await env.SUBSCRIPTIONS?.put('trial_' + ip, Date.now().toString(), { expirationTtl: 86400 });
      } else {
        const elapsed = Date.now() - parseInt(trialStart);
        if (elapsed > 5 * 60 * 1000) {
          const isIndian = country === 'IN';
          return Response.json({
            reply: "TRIAL_ENDED",
            nextFreeTime: "Kal",
            razorpay_key: env.RAZORPAY_KEY_ID || null,
            stripe_key: env.STRIPE_PUBLISHABLE_KEY || null,
            currency: isIndian? 'INR' : 'USD',
            message: isIndian? `⏰ 5 Minute Free Trial Khatam!\n\nAaj ka free limit khatam.\n\n👉 ₹666 PLUS - 28 Din (Ads ke saath)\n🔥 ₹999 PRO - 28 Din (Bina Ads - Sab Perfect)\n\n💳 UPI / Card se turant upgrade karo!` : `Trial ended. ₹666 PLUS with Ads / ₹999 PRO No Ads - 28 Days`,
          }, { headers: securityHeaders });
        }
      }
    }

    // 6. Hinglish System Prompt
    const hinglishPrompt = 'You are AIHubPro AI. CRITICAL RULES: 1. NEVER provide illegal content. 2. Detect user language and reply in same language (Hinglish if user uses Hinglish). 3. Be helpful, friendly AI assistant for India. 4. For PLUS users, keep answers concise but helpful. For PRO users, give detailed perfect answers.';

    // 7. Multi-AI Providers with Fallback - 3 ENGINE COMPLETE
    const aiProviders = [
      { name: 'Groq', url: 'https://api.groq.com/openai/v1/chat/completions', key: env.GROQ_API_KEY, model: 'llama-3.3-70b-versatile', timeout: 8000 },
      { name: 'Gemini', url: 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=' + env.GEMINI_API_KEY, key: env.GEMINI_API_KEY, timeout: 10000 },
      { name: 'OpenAI', url: 'https://api.openai.com/v1/chat/completions', key: env.OPENAI_API_KEY, model: 'gpt-4o-mini', timeout: 12000 },
    ];

    let reply = null, usedProvider = null;
    for (const p of aiProviders) {
      if (!p.key) continue;
      try {
        const controller = new AbortController();
        const timeout = setTimeout(() => controller.abort(), p.timeout);
        let bodyPayload, headers = { 'Content-Type': 'application/json' };
        if (p.name === 'Gemini') {
          bodyPayload = { contents: [{ parts: [{ text: hinglishPrompt + '\n\nUser: ' + originalMessage }] }] };
        } else {
          headers['Authorization'] = 'Bearer ' + p.key;
          bodyPayload = { model: p.model, messages: [{ role: 'system', content: hinglishPrompt }, { role: 'user', content: originalMessage }] };
        }
        const res = await fetch(p.url, { method: 'POST', headers, body: JSON.stringify(bodyPayload), signal: controller.signal });
        clearTimeout(timeout);
        if (!res.ok) throw new Error('HTTP ' + res.status);
        const data = await res.json();
        // ✅ YE 3 LINES FIX KARI HAIN
        if (p.name === 'Gemini') { reply = data.candidates?.[0]?.content?.parts?.[0]?.text; }
        else { reply = data.choices?.[0]?.message?.content; }
        if (reply) { usedProvider = p.name; await env.SYSTEM_LOGS?.put('success_' + Date.now(), JSON.stringify({ provider: p.name, ip })); break; }
      } catch (e) { await env.ERROR_LOGS?.put('fail_' + p.name + '_' + Date.now(), JSON.stringify({ provider: p.name, error: e.message, ip })); }
    }

    if (!reply) {
      await env.ALERT_KV?.put('CRITICAL_DOWN_' + Date.now(), JSON.stringify({ time: new Date().toISOString(), ip: ip }));
      return Response.json({ error: 'All AI services temporarily down. 2 minute baad try karo.' }, { status: 503, headers: securityHeaders });
    }

    // PLUS walo ke liye ad notice add karo
    let finalReply = reply;
    if (userPlan === 'plus') {
      finalReply += `\n\n---\n*💡 [Ad] PRO lo (₹999) aur bina ads ke perfect answers pao!*`;
    }

    return Response.json({ reply: finalReply, success: true, filtered: true, provider: usedProvider, lang: userLang, plan: userPlan, adFree: isAdFree }, { headers: securityHeaders });
  } catch (error) {
    console.error('Chat Error:', error);
    await env.ERROR_LOGS?.put('critical_' + Date.now(), JSON.stringify({ error: error.message, ip: request.headers.get('CF-Connecting-IP') }));
    return Response.json({ error: 'Something went wrong. Try again.' }, { status: 500, headers: securityHeaders });
  }
}

export async function onRequestOptions() {
  return new Response(null, { status: 200, headers: { 'Access-Control-Allow-Origin': '*', 'Access-Control-Allow-Methods': 'POST, OPTIONS', 'Access-Control-Allow-Headers': 'Content-Type' } });
}
