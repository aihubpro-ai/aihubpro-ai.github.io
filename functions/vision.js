export async function onRequestPost(context) {
  const { request, env } = context;
  const headers = { 'Access-Control-Allow-Origin': '*', 'Content-Type': 'application/json' };

  try {
    const formData = await request.formData();
    const file = formData.get('file');
    const mode = formData.get('mode');

    if (!file) throw new Error('No file uploaded');

    // Convert to base64
    const buffer = await file.arrayBuffer();
    const base64 = btoa(String.fromCharCode(...new Uint8Array(buffer)));

    // GPT-4 Vision API
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${env.OPENAI_API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: 'gpt-4o',
        messages: [{
          role: 'user',
          content: [
            { type: 'text', text: mode === 'vision'? 'Is image mein kya hai? Detail mein Hinglish mein batao.' : 'Is file ka summary banao Hinglish mein.' },
            { type: 'image_url', image_url: { url: `data:${file.type};base64,${base64}` } }
          ]
        }],
        max_tokens: 1000
      })
    });

    const data = await response.json();
    return Response.json({ reply: data.choices[0].message.content }, { headers });

  } catch (error) {
    return Response.json({ error: error.message }, { status: 500, headers });
  }
}
