export async function onRequestPost(context) {
  const { request, env } = context;
  const headers = { 'Access-Control-Allow-Origin': '*', 'Content-Type': 'application/json' };

  try {
    const { message } = await request.json();

    // Step 1: Google Search API
    const searchRes = await fetch(`https://www.googleapis.com/customsearch/v1?key=${env.GOOGLE_API_KEY}&cx=${env.GOOGLE_CX}&q=${encodeURIComponent(message)}`);
    const searchData = await searchRes.json();

    const snippets = searchData.items?.slice(0, 5).map(item =>
      `${item.title}: ${item.snippet}`
    ).join('\n\n');

    // Step 2: AI Summary
    const aiRes = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${env.OPENAI_API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [{
          role: 'user',
          content: `Latest web search results:\n${snippets}\n\nUser question: ${message}\n\nAnswer in Hinglish with sources:`
        }]
      })
    });

    const aiData = await aiRes.json();
    return Response.json({ reply: aiData.choices[0].message.content }, { headers });

  } catch (error) {
    return Response.json({ error: 'Search failed: ' + error.message }, { status: 500, headers });
  }
}
