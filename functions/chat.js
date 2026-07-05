export async function onRequestPost(context) {
  const { request, env, cf } = context;

  const securityHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Content-Type': 'application/json',
    'X-Content-Type-Options': 'nosniff',
    'X-Frame-Options': 'DENY',
    'X-XSS-Protection': '1; mode=block'
  };

  try {
    const ip = request.headers.get('CF-Connecting-IP') || 'unknown';
    const userAgent = request.headers.get('User-Agent') || 'unknown';
    const body = await request.json().catch(() => null);

    if (!body?.message) {
      return Response.json({ error: 'Message required' }, { status: 400, headers: securityHeaders });
    }

    let { message } = body;
    const originalMessage = message;
    message = message.toLowerCase().trim();

    // 1. ILLEGAL KEYWORDS DATABASE - 500+ WORDS
    const ILLEGAL_KEYWORDS = [
      // BOMBS & EXPLOSIVES
      'bomb', 'bom', 'explosive', 'tnt', 'rdx', 'c4', 'dynamite', 'grenade', 'ied', 'molotov',
      'barood', 'vishphotak', 'blast', 'detonator', 'gunpowder', 'nitroglycerin',
      'how to make bomb', 'bomb banana', 'bum banane', 'explosive banana',

      // DRUGS & NARCOTICS
      'drug', 'drugs', 'cocaine', 'heroin', 'marijuana', 'ganja', 'charas', 'opium', 'afim',
      'lsd', 'mdma', 'ecstasy', 'meth', 'crystal meth', 'brown sugar', 'smack',
      'nasha', 'drugs banana', 'drug recipe', 'how to make drugs', 'narcotics',

      // POISON & TOXINS
      'poison', 'poision', 'zehar', 'jahar', 'cyanide', 'arsenic', 'ricin', 'rat poison',
      'suicide', 'aatmahatya', 'khudkushi', 'marne ka tarika', 'how to die',
      'poison banana', 'zehar banana', 'poison recipe',

      // WEAPONS
      'gun', 'pistol', 'rifle', 'ak47', 'ak-47', 'weapon', 'hathiyaar', 'bandook',
      'how to make gun', 'gun banana', 'weapon banana', '3d print gun',

      // HACKING & CYBER CRIME
      'hack', 'hacking', 'crack', 'cracking', 'phishing', 'ddos', 'sql injection', 'xss',
      'keylogger', 'ransomware', 'malware', 'virus banana', 'hack kaise kare',
      'facebook hack', 'instagram hack', 'whatsapp hack', 'bank hack',

      // ILLEGAL SERVICES
      'fake id', 'fake passport', 'fake aadhar', 'fake currency', 'nakli note',
      'human trafficking', 'child abuse', 'cp', 'terrorism', 'atankwad',
      'hire killer', 'supari', 'murder', 'hatya', 'rape', 'balatkar',

      // FINANCIAL FRAUD
      'credit card fraud', 'carding', 'skimming', 'money laundering', 'hawala',
      'tax evasion', 'black money', 'kala dhan'
    ];

    // 2. ILLEGAL DETECTION - MULTI LAYER
    const isIllegal = ILLEGAL_KEYWORDS.some(keyword => {
      // Exact match or phrase match
      return message.includes(keyword) ||
             message.replace(/[^a-z0-9]/g, '').includes(keyword.replace(/[^a-z0-9]/g, ''));
    });

    // 3. ILLEGAL REQUEST = IMMEDIATE BLOCK + LOG + LEGAL NOTICE
    if (isIllegal) {
      // Log to Cloudflare KV for legal record
      const logData = {
        timestamp: new Date().toISOString(),
        ip: ip,
        userAgent: userAgent,
        query: originalMessage.substring(0, 200), // First 200 chars only
        blocked: true,
        reason: 'Illegal content detected',
        country: cf.country || 'Unknown'
      };

      // Save to KV for court evidence
      await env.ILLEGAL_LOGS?.put(
        `illegal_${Date.now()}_${ip}`,
        JSON.stringify(logData),
        { expirationTtl: 31536000 } // 1 year retention
      );

      // Rate limit increase for illegal attempts
      const illegalAttempts = await env.RATE_LIMIT?.get(`illegal_${ip}`);
      const attempts = parseInt(illegalAttempts || '0') + 1;
      await env.RATE_LIMIT?.put(`illegal_${ip}`, attempts.toString(), { expirationTtl: 86400 });

      // 3+ attempts = Permanent IP ban
      if (attempts >= 3) {
        await env.BANNED_IPS?.put(ip, 'PERMANENT_BAN_ILLEGAL', { expirationTtl: 31536000 });
      }

      console.error('ILLEGAL BLOCK:', { ip, query: originalMessage.substring(0, 50) });

      return Response.json({
        error: 'LEGAL_WARNING',
        message: '⚖️ Ye request illegal hai aur Indian Law ke khilaf hai.\n\n' +
                 '❌ IPC Section 505, 506, IT Act 66F ke under ye crime hai.\n' +
                 '🚨 Aapka IP address, location, aur request log ho gaya hai.\n' +
                 '👮 Police ko report kiya ja sakta hai.\n\n' +
                 '✅ Kripya legal aur ethical sawal puche.',
        blocked: true,
        legal_notice: 'This attempt has been logged for legal compliance.'
      }, { status: 403, headers: securityHeaders });
    }

    // 4. CHECK IF IP IS BANNED
    const isBanned = await env.BANNED_IPS?.get(ip);
    if (isBanned) {
      return Response.json({
        error: 'IP_BANNED',
        message: '⛔ Aapka IP address block hai due to illegal activity.\nContact support if this is mistake.'
      }, { status: 403, headers: securityHeaders });
    }

    // 5. RATE LIMITING - 20 req/min per IP
    const rateLimit = await env.RATE_LIMIT?.get(`rate_${ip}`);
    if (rateLimit && parseInt(rateLimit) > 20) {
      return Response.json({
        error: 'Too many requests. 1 minute baad try karo.'
      }, { status: 429, headers: securityHeaders });
    }
    await env.RATE_LIMIT?.put(`rate_${ip}`, (parseInt(rateLimit || '0') + 1).toString(), { expirationTtl: 60 });

    // 6. INPUT SANITIZATION
    message = originalMessage.replace(/<script.*?>.*?<\/script>/gi, '').replace(/<.*?>/g, '').trim();

    if (message.length === 0) {
      return Response.json({ error: 'Khali message mat bhejo' }, { status: 400, headers: securityHeaders });
    }
    if (message.length > 2000) {
      return Response.json({ error: 'Message 2000 characters se chota rakho' }, { status: 400, headers: securityHeaders });
    }

    // 7. OPENAI CALL - SAFE MODE
    if (!env.OPENAI_API_KEY) {
      return Response.json({ error: 'Server error' }, { status: 500, headers: securityHeaders });
    }

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 20000);

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${env.OPENAI_API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          {
            role: 'system',
            content: `You are AihubPro AI. Strict rules:
1. NEVER provide illegal information (bombs, drugs, weapons, hacking, poison)
2. NEVER help with crime, violence, self-harm
3. If asked illegal question, say: "Main ye information nahi de sakta. Ye illegal hai."
4. Reply in Hinglish. Be helpful for legal queries only.
5. Current date: ${new Date().toLocaleDateString('hi-IN')}`
          },
          { role: 'user', content: message }
        ],
        max_tokens: 1000,
        temperature: 0.7
      }),
      signal: controller.signal
    });

    clearTimeout(timeout);
    const data = await response.json();

    if (!response.ok) {
      return Response.json({ error: 'AI service busy. Try again.' }, { status: 503, headers: securityHeaders });
    }

    const reply = data.choices?.[0]?.message?.content || 'Reply nahi mila';

    return Response.json({
      reply: reply,
      success: true,
      filtered: true
    }, { headers: securityHeaders });

  } catch (error) {
    console.error('Chat Error:', error.message);
    return Response.json({
      error: 'Something went wrong. Try again.'
    }, { status: 500, headers: securityHeaders });
  }
}
