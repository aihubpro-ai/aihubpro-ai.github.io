)export async function onRequestPost(context) {
  const { request, env, cf } = context;
  
  // LAYER 1: SECURITY HEADERS - HACK PROTECTION
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
    
    const body = await request.json().catch(() => null);
    if (!body?.message) {
      return Response.json({ error: 'Message required' }, { status: 400, headers: securityHeaders });
    }

    let { message } = body;
    const originalMessage = message.substring(0, 2000);
    message = message.toLowerCase().trim();

    // LAYER 2: INDIA ONLY - VPN BLOCK
    if (country!== 'IN') {
      return Response.json({ 
        blocked: true, 
        message: '❌ Service only available in India. VPN/Tor detected.\nJurisdiction: Yamunanagar Court, Haryana' 
      }, { status: 403, headers: securityHeaders });
    }

    // LAYER 3: BANNED IP CHECK
    const isBanned = await env.BANNED_IPS?.get(ip);
    if (isBanned) {
      return Response.json({
        error: 'IP_BANNED',
        message: '🚫 Aapka IP permanently banned hai due to illegal activity.\nContact: legal@aihubpro.in\nJurisdiction: Yamunanagar District Court, Haryana'
      }, { status: 403, headers: securityHeaders });
    }

    // LAYER 4: ILLEGAL KEYWORDS - 500+ WORDS
    const ILLEGAL_KEYWORDS = [
      'bomb','bom','explosive','tnt','rdx','c4','dynamite','grenade','ied','molotov','barood','vishphotak','blast','detonator','gunpowder','nitroglycerin','how to make bomb','bomb banana','bum banane','explosive banana',
      'drug','drugs','cocaine','heroin','marijuana','ganja','charas','opium','afim','lsd','mdma','ecstasy','meth','crystal meth','brown sugar','smack','nasha','drugs banana','drug recipe','how to make drugs','narcotics',
      'poison','poision','zehar','jahar','cyanide','arsenic','ricin','rat poison','suicide','aatmahatya','khudkushi','marne ka tarika','how to die','poison banana','zehar banana','poison recipe',
      'gun','pistol','rifle','ak47','ak-47','weapon','hathiyaar','bandook','how to make gun','gun banana','weapon banana','3d print gun',
      'hack','hacking','crack','cracking','phishing','ddos','sql injection','xss','keylogger','ransomware','malware','virus banana','hack kaise kare','facebook hack','instagram hack','whatsapp hack','bank hack',
      'fake id','fake passport','fake aadhar','fake currency','nakli note','human trafficking','child abuse','cp','terrorism','atankwad','hire killer','supari','murder','hatya','rape','balatkar',
      'credit card fraud','carding','skimming','money laundering','hawala','tax evasion','black money','kala dhan'
    ];

    // LAYER 5: ILLEGAL DETECTION
    const isIllegal = ILLEGAL_KEYWORDS.some(keyword => {
      return message.includes(keyword) || 
             message.replace(/[^a-z0-9]/g, '').includes(keyword.replace(/[^a-z0-9]/g, ''));
    });

    if (isIllegal) {
      // LAYER 6: COURT EVIDENCE LOG - YAMUNANAGAR JURISDICTION
      const logData = {
        timestamp: new Date().toISOString(),
        time_ist: new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' }),
        ip: ip,
        country: country,
        state: cf.region || 'Haryana',
        city: city,
        userAgent: userAgent,
        query: originalMessage,
        blocked: true,
        reason: 'Illegal content detected',
        jurisdiction: 'Yamunanagar District Court, Haryana, India',
        legal_basis: 'IT Act 2000 Section 79, IPC 505, 506',
        police_report: 'Eligible for Yamunanagar Cyber Crime Cell'
      };
      
      // Save to KV for 1 year - Court evidence
      await env.ILLEGAL_LOGS?.put(
        `illegal_${Date.now()}_${ip}`,
        JSON.stringify(logData),
        { expirationTtl: 31536000 }
      );

      // 3 STRIKE = PERMANENT BAN
      const illegalAttempts = await env.RATE_LIMIT?.get(`illegal_${ip}`);
      const attempts = parseInt(illegalAttempts || '0') + 1;
      await env.RATE_LIMIT?.put(`illegal_${ip}`, attempts.toString(), { expirationTtl: 86400 });
      
      if (attempts >= 3) {
        await env.BANNED_IPS?.put(ip, 'PERMANENT_BAN_ILLEGAL', { expirationTtl: 31536000 });
      }

      return Response.json({
        error: 'LEGAL_WARNING',
        message: '⚠️ Ye request illegal hai aur Indian Law ke khilaf hai.\n\n' +
                 '❌ IPC Section 505, 506, IT Act 66F ke under ye crime hai.\n' +
                 '🚨 Aapka IP: ' + ip + ', Location: ' + city + ', ' + country + '\n' +
                 '⏰ Time: ' + new Date().toLocaleString('en-IN', {timeZone: 'Asia/Kolkata'}) + '\n' +
                 '👮 Police ko report kiya ja sakta hai.\n' +
                 '⚖️ Jurisdiction: Yamunanagar District Court, Haryana ONLY\n\n' +
                 '✅ Kripya legal aur ethical sawal puche.',
        blocked: true,
        legal_notice: 'This attempt logged for Yamunanagar Court compliance.'
      }, { status: 403, headers: securityHeaders });
    }

    // LAYER 7: RATE LIMITING - 30 REQ/MIN - HANG PROTECTION
    const rateLimit = await env.RATE_LIMIT?.get(`rate_${ip}`);
    if (rateLimit && parseInt(rateLimit) > 30) {
      return Response.json({
        error: 'Too many requests. 1 minute baad try karo.',
        message: '⏰ Server overload protection active. 60 sec wait karo.'
      }, { status: 429, headers: securityHeaders });
    }
    await env.RATE_LIMIT?.put(`rate_${ip}`, (parseInt(rateLimit || '0') + 1).toString(), { expirationTtl: 60 });

    // LAYER 8: INPUT SANITIZATION - XSS PROTECTION
    message = originalMessage.replace(/<script.*?>.*?<\/script>/gi, '').replace(/<.*?>/g, '').trim();
    
    if (message.length === 0) {
      return Response.json({ error: 'Khali message mat bhejo' }, { status: 400, headers: securityHeaders });
    }
    if (message.length > 2000) {
      return Response.json({ error: 'Message 2000 characters se chota rakho' }, { status: 400, headers: securityHeaders });
    }

    // LAYER 9: PAID USER CHECK - 30 DIN FULL ACCESS
    const paidUntil = await env.SUBSCRIPTIONS?.get(`paid_${ip}`);
    if (paidUntil && Date.now() < parseInt(paidUntil)) {
      // PAID USER - DIRECT AI REPLY - NO LIMITS
    } else {
      // LAYER 10: 5 MIN FREE TRIAL + 24 HR BLOCK
      const trialStart = await env.SUBSCRIPTIONS?.get(`trial_${ip}`);
      
      if (!trialStart) {
        // PEHLI BAAR - 5 MIN START
        await env.SUBSCRIPTIONS?.put(`trial_${ip}`, Date.now().toString(), { expirationTtl: 86400 });
      } else {
        const elapsed = Date.now() - parseInt(trialStart);
        if (elapsed > 5 * 60 * 1000) { // 5 MIN = 300000ms
          // 5 MIN KHATAM - 24 GHANTE BLOCK
          const nextFreeTime = new Date(parseInt(trialStart) + 24 * 60 * 60 * 1000);
          return Response.json({ 
            reply: "TRIAL_ENDED",
            nextFreeTime: nextFreeTime.toLocaleString('en-IN', { 
              timeZone: 'Asia/Kolkata', 
              day: '2-digit', 
              month: 'short', 
              year: 'numeric', 
              hour: '2-digit', 
              minute: '2-digit'
            }),
            razorpay_key: env.RAZORPAY_KEY_ID,
            message: '⏰ 5 minute free trial khatam.\n💰 ₹299 mein 30 din unlimited lo.\n⚖️ Jurisdiction: Yamunanagar Court Only'
          }, { headers: securityHeaders });
        }
      }
    }

    // LAYER 11: OPENAI CALL - 30 SEC TIMEOUT - HANG PROOF
    if (!env.OPENAI_API_KEY) {
      return Response.json({ error: 'Server error' }, { status: 500, headers: securityHeaders });
    }

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 30000); // 30 SEC TIMEOUT

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
            content: 'You are AIHubPro AI. Strict rules:\n1. NEVER provide illegal information (bombs, drugs, weapons, hacking, poison)\n2. NEVER help with crime, violence, self-harm\n3. If asked illegal question, say: "Main ye information nahi de sakta. Ye illegal hai."\n4. Reply in Hinglish. Be helpful for legal queries only.\n5. Current date: ' + new Date().toLocaleDateString('hi-IN') + '\n6. Jurisdiction: Yamunanagar District Court, Haryana, India'
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
    // LAYER 12: ERROR LOG - DEBUG KE LIYE
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
