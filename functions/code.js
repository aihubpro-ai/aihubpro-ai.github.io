export async function onRequestPost(context) {
  const { request, env } = context;

  // CORS headers - taki browser block na kare
  const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Content-Type': 'application/json'
  };

  // OPTIONS request handle karo - preflight ke liye
  if (request.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // 1. API Key check karo
    if (!env.GEMINI_API_KEY) {
      return Response.json({
        reply: 'Server Error: GEMINI_API_KEY set nahi hai Cloudflare mein.'
      }, { status: 500, headers: corsHeaders });
    }

    // 2. User ka message nikalo
    const body = await request.json();
    const userMessage = body.message;

    if (!userMessage) {
      return Response.json({
        reply: 'Message khali hai. Kuch likho.'
      }, { status: 400, headers: corsHeaders });
    }

    // 3. Gemini API call karo
    const geminiResponse = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-latest:generateContent?key=${env.GEMINI_API_KEY}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{
          parts: [{ text: userMessage }]
        }],
        generationConfig: {
          temperature: 0.9,
          maxOutputTokens: 2048,
        }
      })
    });

    // 4. Agar Gemini error de to usko handle karo
    if (!geminiResponse.ok) {
      const errorData = await geminiResponse.json();
      console.error('Gemini API Error:', errorData);
      return Response.json({
        reply: `Gemini Error: ${errorData.error?.message || 'API fail ho gayi'}`
      }, { status: 500, headers: corsHeaders });
    }

    // 5. Reply nikalo
    const data = await geminiResponse.json();
    const aiReply = data.candidates?.[0]?.content?.parts?.[0]?.text;

    if (!aiReply) {
      return Response.json({
        reply: 'AI se khali response aaya. Phir try karo.'
      }, { status: 500, headers: corsHeaders });
    }

    // 6. Success - reply bhej do
    return Response.json({ reply: aiReply }, { headers: corsHeaders });

  } catch (error) {
    // 7. Koi bhi crash ho to yahan pakad lenge
    console.error('Function Crash:', error);
    return Response.json({
      reply: `Server Crash: ${error.message}`
    }, { status: 500, headers: corsHeaders });
  }
}
