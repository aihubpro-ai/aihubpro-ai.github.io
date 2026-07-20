// AI HUB PRO - Final Working API - By Vasu Enterprises
// Path: functions/api/chat.js

export async function onRequestPost(context) {
  const { request, env } = context;

  const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    'Content-Type': 'application/json'
  };

  try {
    // 1. Check API Key
    if (!env.OPENAI_API_KEY) {
      return new Response(JSON.stringify({
        error: 'OPENAI_API_KEY is missing in Cloudflare Dashboard > Settings > Environment Variables'
      }), { status: 500, headers: corsHeaders });
    }

    const body = await request.json();
    const userMessage = body.message || "Hello";

    // 2. Optional Google Search (Agar GOOGLE_API_KEY hai to)
    let searchContext = '';
    try {
      if (env.GOOGLE_API_KEY && env.GOOGLE_CX) {
        const searchUrl = `https://www.googleapis.com/customsearch/v1?key=${env.GOOGLE_API_KEY}&cx=${env.GOOGLE_CX}&q=${encodeURIComponent(userMessage)}&num=2`;
        const gRes = await fetch(searchUrl);
        const gData = await gRes.json();
        if (gData.items && gData.items.length > 0) {
          searchContext = gData.items.map(item => item.snippet).join('\n');
        }
      }
    } catch (e) {
      console.log("Google search skip");
    }

    // 3. Call OpenAI
    const openaiRes = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${env.OPENAI_API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          { role: 'system', content: `You are AI HUB PRO assistant, created by Vasu Enterprises. You help with GST, Invoice, Business Tools. Use this context if relevant: ${searchContext}` },
          { role: 'user', content: userMessage }
        ],
        temperature: 0.7
      })
    });

    const aiData = await openaiRes.json();

    // 4. FIXED ERROR HANDLING - Yahi pe pehle crash hota tha
    if (!aiData.choices) {
      return new Response(JSON.stringify({
        error: aiData.error?.message || 'OpenAI API Error - Check Billing or Key',
        details: aiData
      }), { status: 500, headers: corsHeaders });
    }

    // 5. Success Response
    return new Response(JSON.stringify({
      reply: aiData.choices[0].message.content,
      model: 'gpt-4o-mini',
      source: 'AI HUB PRO'
    }), { headers: corsHeaders });

  } catch (err) {
    return new Response(JSON.stringify({ error: err.message }), { status: 500, headers: corsHeaders });
  }
}

// For CORS Preflight
export async function onRequestOptions() {
  return new Response(null, {
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization'
    }
  });
}
