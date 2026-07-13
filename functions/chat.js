export async function onRequestPost(context) {
  const { request, env, cf } = context;
  
  const securityHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Content-Type': 'application/json',
    'X-Content-Type-Options': 'nosniff',
    'X-Frame-Options': 'DENY',
    'X-XSS-Protection': '1; mode=block',
    'Strict-Transport-Security': 'max-age=31536000; includeSubDomains',
    'Referrer-Policy': 'strict-origin-when-cross-origin'
  };

  try {
    const ip = request.headers.get('CF-Connecting-IP') || 'unknown';
    const userAgent = request.headers.get('User-Agent') || 'unknown';
    const country = cf.country || 'IN';
    const city = cf.city || 'Unknown';
    const userLang = request.headers.get('Accept-Language') || 'en';

    const body = await request.json().catch(() => null);
    if (!body?.message) {
      return Response.json({ error: 'Message required' }, { status: 400, headers: securityHeaders });
    }

    let { message } = body;
    const originalMessage = message.substring(0, 2000);
    message = message.toLowerCase().trim();

    const isBanned = await env.BANNED_IPS?.get(ip);
    if (isBanned) {
      return Response.json({
        error: 'IP_BANNED',
        message: '❌ Aapka IP permanently banned hai due to illegal activity.'
      }, { status: 403, headers: securityHeaders });
    }

    const ILLEGAL_KEYWORDS = [
      'bomb','bom','explosive','tnt','rdx','c4','dynamite','grenade',
      'drug','drugs','cocaine','heroin','marijuana','ganja','charas',
      'poison','poision','zehar','jahar','cyanide','arsenic','ricin',
      'gun','pistol','rifle','ak47','ak-47','weapon','hathiyaar',
      'hack','hacking','crack','cracking','phishing','ddos','sql injecti',
      'fake id','fake passport','fake aadhar','fake currency','nakli not',
      'credit card fraud','carding','skimming','money laundering','hawal'
    ];

    const isIllegal = ILLEGAL_KEYWORDS.some(keyword => {
      return message.includes(keyword) || 
             message.replace(/[^a-z0-9]/g, '').includes(keyword.replace(/[^a-z0-9]/g, ''));
    });

    if (isIllegal) {
      const logData = {
        timestamp: new Date().toISOString(),
        time_ist: new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' }),
        ip: ip, country: country, state: cf.region || 'Haryana', city: city,
        userAgent: userAgent, query: originalMessage, blocked: true,
        reason: 'Illegal content detected',
        jurisdiction: 'Yamunanagar District Court, Haryana, India',
        legal_basis: 'IT Act 2000 Section 79, IPC 505, 506',
        police_report: 'Eligible for Yamunanagar Cyber Crime Cell'
      };
      await env.ILLEGAL_LOGS?.put(`illegal_${Date.now()}_${ip}`, JSON.stringify(logData));
      
      const illegalAttempts = await env.RATE_LIMIT?.get(`illegal_${ip}`);
      const attempts = parseInt(illegalAttempts || '0') + 1;
      await env.RATE_LIMIT?.put(`illegal_${ip}`, attempts.toString(), { expirationTtl: 86400 });
      
      if (attempts >= 3) {
        await env.BANNED_IPS?.put(ip, 'PERMANENT_BAN_ILLEGAL', { expirationTtl: 31536000 });
      }
      
      return Response.json({
        error: 'LEGAL_WARNING',
        message: '⚠️ Ye request illegal hai aur Indian Law ke khilaf hai\n' +
                 '❌ IPC Section 505, 506, IT Act 66F ke under ye crime hai\n' +
                 '📍 Aapka IP: ' + ip + ', Location: ' + city + ', ' + cf.region + '\n' +
                 '🕒 Time: ' + new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' }) + '\n' +
                 '👮 Police ko report kiya ja sakta hai.\n' +
                 '⚖️ Jurisdiction: Yamunanagar District Court, Haryana\n' +
                 '✅ Kripya legal aur ethical sawal puche.',
        blocked: true,
        legal_notice: 'This attempt logged for Yamunanagar Court compliance'
      }, { status: 403, headers: securityHeaders });
    }

    const rateLimit = await env.RATE_LIMIT?.get(`rate_${ip}`);
    if (rateLimit && parseInt(rateLimit) > 30) {
      return Response.json({
        error: 'Too many requests. 1 minute baad try karo.',
        message: '⏳ Server overload protection active. 60 sec wait karo'
      }, { status: 429, headers: securityHeaders });
    }
    await env.RATE_LIMIT?.put(`rate_${ip}`, (parseInt(rateLimit || '0') + 1).toString(), { expirationTtl: 60 });

    message = originalMessage.replace(/<script.*?>.*?<\/script>/gi, '');
    if (message.length === 0) {
      return Response.json({ error: 'Khali message mat bhejo' }, { status: 400, headers: securityHeaders });
    }
    if (message.length > 2000) {
      return Response.json({ error: 'Message 2000 characters se chota rakho' }, { status: 400, headers: securityHeaders });
    }

    const paidUntil = await env.SUBSCRIPTIONS?.get(`paid_${ip}`);
    if (paidUntil && Date.now() < parseInt(paidUntil)) {
      // PAID USER - DIRECT AI REPLY - NO LIMITS
    } else {
      const trialStart = await env.SUBSCRIPTIONS?.get(`trial_${ip}`);
      if (!trialStart) {
        await env.SUBSCRIPTIONS?.put(`trial_${ip}`, Date.now().toString(), { expirationTtl: 86400 });
      } else {
        const elapsed = Date.now() - parseInt(trialStart);
        if (elapsed > 5 * 60 * 1000) {
          const nextFreeTime = new Date(parseInt(trialStart) + 24 * 60 * 60 * 1000);
          const isIndian = country === 'IN';
          return Response.json({
            reply: "TRIAL_ENDED",
            nextFreeTime: nextFreeTime.toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' }),
            razorpay_key: env.RAZORPAY_KEY_ID || null,
            stripe_key: env.STRIPE_PUBLISHABLE_KEY || null,
            currency: isIndian ? 'INR' : 'USD',
            message: isIndian 
              ? '⏰ 5 minute free trial khatam.\n\n💎 ₹666 Basic ya ₹999 Pro plan lo unlimited chat ke liye.' 
              : '⏰ 5 minute free trial ended.\n\n💎 $8 Basic / $12 Pro plan for unlimited chat.'
          }, { headers: securityHeaders });
        }
      }
    }

    const hinglishPrompt = `You are AIHubPro AI. CRITICAL RULES:
1. NEVER provide illegal content.
2. Detect user language from: "${originalMessage}".
3. If Hinglish like "bhai code samjha do" → Reply in Hinglish mix Hindi-English.
4. If pure Hindi "भाई कैसे हो" → Reply in Hindi.
5. If English → Reply English.
6. Indian users: Use ₹, Indian examples, Hinglish tone. Global: USD, global examples.
7. Be helpful, friendly, natural, conversational.`;

    const aiProviders = [
      {
        name:'Groq', 
        url:'https://api.groq.com/openai/v1/chat/completions',
        key: env.GROQ_API_KEY, 
        model: 'llama-3.1-8b-instant',
        timeout: 10000
      },
      {
        name:'Gemini', 
        url:'https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent',
        key: env.GEMINI_API_KEY,
        model: 'gemini-1.5-flash',
        timeout: 10000
      },
      {
        name:'OpenAI', 
        url:'https://api.openai.com/v1/chat/completions',
        key: env.OPENAI_API_KEY,
        model: 'gpt-4o-mini',
        timeout: 10000
      },
    ];

    let reply = null, usedProvider = null;
    for (const p of aiProviders) {
      if (!p.key) continue;
      try {
        const controller = new AbortController();
        const timeout = setTimeout(() => controller.abort(), p.timeout);
        let bodyPayload, headers = {'Content-Type':'application/json'};

        if (p.name === 'Gemini') {
          bodyPayload = {contents:[{parts:[{text: `${hinglishPrompt}\n\nUser: ${originalMessage}\n\nAI:`}]}]};
          headers['x-goog-api-key'] = p.key;
        } else {
          headers['Authorization'] = `Bearer ${p.key}`;
          bodyPayload = {
            model: p.model, 
            messages: [
              {role:'system', content: hinglishPrompt},
              {role:'user', content: originalMessage}
            ],
            temperature: 0.7,
            max_tokens: 1000
          };
        }

        const res = await fetch(p.url, {
          method: 'POST', 
          headers, 
          body: JSON.stringify(bodyPayload),
          signal: controller.signal
        });
        clearTimeout(timeout);
        
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const data = await res.json();

        if (p.name==='Gemini') reply = data.candidates?..content?.parts?..text;
        else reply = data.choices?..message?.content;

        if (reply) {
          usedProvider = p.name;
          await env.SYSTEM_LOGS?.put(`success_${Date.now()}`, JSON.stringify({provider: p.name, ip: ip}));
          break;
        }
      } catch (e) {
        await env.ERROR_LOGS?.put(`fail_${p.name}_${Date.now()}`, JSON.stringify({error: e.message, ip: ip}));
        continue;
      }
    }

    if (!reply) {
      await env.ALERT_KV?.put('CRITICAL_DOWN', JSON.stringify({time:Date.now(), ip:ip}));
      return Response.json({ error: 'All AI services temporarily down. 2 min baad try karo.' }, { status: 503, headers: securityHeaders });
    }

    return Response.json({
      reply: reply,
      success: true,
      filtered: true,
      provider: usedProvider,
      lang: userLang
    }, { headers: securityHeaders });

  } catch (error) {
    console.error('Chat Error:', error.message);
    await env.ERROR_LOGS?.put(`error_${Date.now()}`, JSON.stringify({
      error: error.message,
      ip: request.headers.get('CF-Connecting-IP'),
      time: new Date().toISOString(),
      jurisdiction: 'Yamunanagar Court'
    }), { expirationTtl: 604800 });

    return Response.json({
      error: 'Something went wrong. Try again.'
    }, { status: 500, headers: securityHeaders });
  }
}
