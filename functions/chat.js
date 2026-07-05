export async function onRequestPost(context) {
  const { request, env, cf } = context;
  const securityHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Content-Type': 'application/json',
    'X-Content-Type-Options': 'nosniff',
    'X-Frame-Options': 'DENY'
  };

  try {
    const ip = request.headers.get('CF-Connecting-IP') || 'unknown';
    const body = await request.json().catch(() => null);
    if (!body?.message) return Response.json({ error: 'Message required' }, { status: 400, headers: securityHeaders });

    let { message } = body;
    const originalMessage = message;
    message = message.toLowerCase().trim();

    // ILLEGAL KEYWORDS - BOMB, DRUGS, POISON, HACKING, WEAPONS
    const ILLEGAL_KEYWORDS = [
      'bomb','bom','explosive','tnt','rdx','c4','dynamite','grenade','ied','molotov','barood','vishphotak','blast',
      'drug','drugs','cocaine','heroin','marijuana','ganja','charas','opium','afim','lsd','mdma','meth','smack',
      'poison','poision','zehar','jahar','cyanide','arsenic','ricin','suicide','aatmahatya','khudkushi','marne ka tarika',
      'gun','pistol','rifle','ak47','ak-47','weapon','hathiyaar','bandook','hack','hacking','phishing','ddos','keylogger',
      'fake id','fake passport','fake aadhar','fake currency','human trafficking','child abuse','terrorism','atankwad',
      'hire killer','supari','murder','hatya','rape','balatkar','credit card fraud','carding','money laundering','hawala'
    ];

    // ILLEGAL DETECTION
    const isIllegal = ILLEGAL_KEYWORDS.some(k => message.includes(k));

    // BLOCK + LOG + IP BAN + COURT NOTICE
    if (isIllegal) {
      const logData = {
        timestamp: new Date().toISOString(),
        ip: ip,
        country: cf.country || 'IN',
        query: originalMessage.substring(0,200),
        legal_notice: 'IT Act 2000 & IPC compliance. Court: Yamunanagar, Haryana only'
      };

      await env.ILLEGAL_LOGS?.put(`illegal_${Date.now()}_${ip}`, JSON.stringify(logData), { expirationTtl: 31536000 });
      const attempts = parseInt(await env.RATE_LIMIT?.get(`illegal_${ip}`) || '0') + 1;
      await env.RATE_LIMIT?.put(`illegal_${ip}`, attempts.toString(), { expirationTtl: 86400 });
      if (attempts >= 3) await env.BANNED_IPS?.put(ip, 'PERMANENT_BAN_ILLEGAL', { expirationTtl: 31536000 });

      return Response.json({
        error: 'LEGAL_WARNING',
        message: '⚖️ Ye request illegal hai aur Indian Law ke khilaf hai.\n\n❌ IPC Section 505, 506, IT Act 66F ke under crime hai.\n🚨 Aapka IP address, location, time log ho gaya hai.\n👮 Police ko report kiya ja sakta hai.\n\n✅ Legal sawal puche.\n\nCourt Jurisdiction: Yamunanagar, Haryana only.',
        blocked: true
      }, { status: 403, headers: securityHeaders });
    }

    // CHECK BANNED IP
    if (await env.BANNED_IPS?.get(ip)) {
      return Response.json({ error: 'IP_BANNED', message: '⛔ Aapka IP block hai due to illegal activity.' }, { status: 403, headers: securityHeaders });
    }

    // RATE LIMIT 20/min
    const rateLimit = await env.RATE_LIMIT?.get(`rate_${ip}`);
    if (rateLimit && parseInt(rateLimit) > 20) {
      return Response.json({ error: 'Too many requests. 1 min baad try karo.' }, { status: 429, headers: securityHeaders });
    }
    await env.RATE_LIMIT?.put(`rate_${ip}`, (parseInt(rateLimit || '0') + 1).toString(), { expirationTtl: 60 });

    // OPENAI CALL
    if (!env.OPENAI_API_KEY) return Response.json({ error: 'Server error' }, { status: 500, headers: securityHeaders });

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 20000);

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${env.OPENAI_API_KEY}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          { role: 'system', content: `You are AihubPro AI. Strict rules: NEVER provide illegal info (bombs, drugs, weapons, hacking, poison). If asked illegal question, say: "Main ye information nahi de sakta. Ye illegal hai. Court: Yamunanagar only." Reply in Hinglish. Terms: 9% price increase every April 1st with 1 month prior email notice. Date: ${new Date().toLocaleDateString('hi-IN')}` },
          { role: 'user', content: originalMessage }
        ],
        max_tokens: 1000
      }),
      signal: controller.signal
    });

    clearTimeout(timeout);
    const data = await response.json();
    return Response.json({ reply: data.choices[0].message.content, success: true }, { headers: securityHeaders });

  } catch (error) {
    return Response.json({ error: 'Something went wrong' }, { status: 500, headers: securityHeaders });
  }
}
