export async function onRequestPost(context) {
  const { request, env } = context;
  const headers = { 'Access-Control-Allow-Origin': '*', 'Content-Type': 'application/json' };

  try {
    const { message } = await request.json();

    // AI se code generate + explain
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${env.OPENAI_API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: 'gpt-4o',
        messages: [{
          role: 'system',
          content: 'You are coding expert. Write code + explain in Hinglish. If user asks to run, provide code in ```python or ```javascript blocks.'
        }, {
          role: 'user',
          content: message
        }]
      })
    });

    const data = await response.json();
    return Response.json({ reply: data.choices[0].message.content }, { headers });

  } catch (error) {
    return Response.json({ error: error.message }, { status: 500, headers });
  }
}
