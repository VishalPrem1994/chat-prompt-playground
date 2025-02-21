const handler = async (request, response) => {
  const grokApiUrl = 'https://api.x.ai/v1/chat/completions';
  
  try {
    console.log("Running on Vercel Node");
    console.log('Request body:', request.body);
    console.log('API Key present:', !!process.env.GROK_API_KEY);

    const { model, messages, temperature, max_tokens } = request.body;

    if (!process.env.GROK_API_KEY) {
      throw new Error('GROK_API_KEY is not configured');
    }

    const result = await fetch(grokApiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.GROK_API_KEY}`
      },
      body: JSON.stringify({
        model: model || 'grok-1',
        messages,
        temperature: temperature || 0.7,
        max_tokens: max_tokens || 150,
        stream: false
      })
    });

    if (!result.ok) {
      const errorData = await result.text();
      console.error('Grok API error:', errorData);
      return response.status(result.status).json({ error: errorData });
    }

    const data = await result.json();
    return response.json(data);
  } catch (error) {
    console.error('Server error:', error);
    return response.status(500).json({ 
      error: 'Error processing request',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};

export default handler; 