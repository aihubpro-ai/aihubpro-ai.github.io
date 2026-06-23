// AI HUB 2026 - FINAL AUTO PILOT CODE BY VASU ENTERPRISES
const GROQ_API_KEY = process.env.GROQ_API_KEY;
const OPENROUTER_KEY = process.env.OPENROUTER_KEY;

let SYSTEM_CONFIG = null;
let LAST_FETCH = 0;

async function getSystemConfig() {
  if (SYSTEM_CONFIG && Date.now() - LAST_FETCH < 21600000) return SYSTEM_CONFIG;
  try {
    const res = await fetch('https://raw.githubusercontent.com/aihubpro-ai/config/main/system.json');
    SYSTEM_CONFIG = await res.json();
    LAST_FETCH = Date.now();
    return SYSTEM_CONFIG;
  } catch {
    return {
      bannedWords: ['bomb','gun','kill','hack','sex','nude','porn','rape','suicide','drug'],
      aiModels: ['llama-3.1-70b-versatile'],
      features: ['Voice Chat', 'Photo Banao AI'],
      priceINR: 549, priceUSD: 7, trialMinutes: 5,
      systemPrompt: 'You are AI Hub 2026. Desi AI. Safe Hinglish replies.',
      paymentLinks: { IN: 'https://razorpay.me/@vasu', INTL: 'https://buy.stripe.com/test_xxx' }
    };
  }
}

function getAutoPrice(country = 'IN') {
  const baseINR = 549, baseUSD = 7;
  const years = new Date().getFullYear() - 2026;
  return country === 'IN'
? Math.round(baseINR * Math.pow(1.1, years))
    : Math.round(baseUSD * Math.pow(1.1, years));
}

async function getCountryFromIP(ip) {
  try {
    const res = await fetch(`http://ip-api.com/json/${ip}?fields=countryCode`);
    const data = await res.json();
    return data.countryCode || 'IN';
  } catch { return 'IN'; }
}

const trialDB = new Map();

exports.handler = async (event, context) => {
  const headers = { 'Access-Control-Allow-Origin': '*', 'Access-Control-Allow-Headers': 'Content-Type', 'Access-Control-Allow-Methods': 'POST, OPTIONS' };
  if (event.httpMethod === 'OPTIONS') return { statusCode: 200, headers, body: '' };

  try {
    const config = await getSystemConfig();
    const { message, fingerprint } = JSON.parse(event.body);
    const userIP = event.headers['x-forwarded-for']?.split(',')[0] || 'unknown';
    const country = await getCountryFromIP(userIP);
    const isIndian = country === 'IN';
    const currentPrice = getAutoPrice(country);
    const currency = isIndian? '₹' : '$';
    const today = new Date().toISOString().split('T')[0];
    const userKey = `${userIP}_${fingerprint}_${today}`;

    const msgClean = message.toLowerCase().replace(/[^a-z0-9]/gi, '');
    const isBanned = config.bannedWords.some(w => msgClean.includes(w.toLowerCase().replace(/[^a-z0-9]/gi, '')));

    if (isBanned) {
      return { statusCode: 200, headers, body: JSON.stringify({
        reply: "⚠️ Auto-Blocked: Illegal/Sexual/Harmful content not allowed.\n\nHelp: vasu081120@gmail.com",
        blocked: true
      })};
    }

    const trialData = trialDB.get(userKey);
    const fiveMin = config.trialMinutes * 60 * 1000;
    const currentTime = Date.now();

    if (trialData && (currentTime - trialData.start) > fiveMin) {
      const paymentLink = isIndian? config.paymentLinks.IN : config.paymentLinks.INTL;
      return { statusCode: 200, headers, body: JSON.stringify({
        reply: `🔒 Auto Trial Khatam! 24hr mein 1 baar 5 min free.\n\nPay: ${currency}${currentPrice}/month 👉 ${paymentLink}`,
        trialOver: true, paymentLink: paymentLink, price: currentPrice, currency: currency
      })};
    }

    if (!trialData) trialDB.set(userKey, { start: currentTime });

    const groqRes = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${GROQ_API_KEY}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: config.aiModels[0],
        messages: [
          { role: 'system', content: `${config.systemPrompt} Price: ${currency}${currentPrice}/month. Features: ${config.features.join(', ')}` },
          { role: 'user', content: message }
        ],
        temperature: 0.7, max_tokens: 500
      })
    });

    const data = await groqRes.json();
    const reply = data.choices[0].message.content;
    const timeLeft = Math.ceil((fiveMin - (currentTime - trialDB.get(userKey).start)) / 60000);

    return {
      statusCode: 200, headers,
      body: JSON.stringify({
        reply: reply,
        trialMinutesLeft: timeLeft > 0? timeLeft : 0,
        autoPrice: currentPrice,
        currency: currency,
        autoFeatures: config.features
      })
    };

  } catch (err) {
    return { statusCode: 200, headers, body: JSON.stringify({
      reply: "Auto-Heal: Server busy. 10 sec baad try karo. Issue? vasu081120@gmail.com",
      error: true
    })};
  }
};
