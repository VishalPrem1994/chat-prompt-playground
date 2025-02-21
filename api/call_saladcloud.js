const handler = async (request, response) => {
  const saladCloudUrl = 'https://jujube-spinach-40dapeep3i9p2t75.salad.cloud/v1/chat/completions';
  
  try {
    console.log("Running on Vercel Node");
    console.log('Request body:', request.body);
    console.log('API Key present:', !!process.env.SALAD_CLOUD_API_KEY);

    const { model, messages, temperature, max_tokens } = request.body;

    if (!process.env.SALAD_CLOUD_API_KEY) {
      throw new Error('SALAD_CLOUD_API_KEY is not configured');
    }

    const result = await fetch(saladCloudUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.SALAD_CLOUD_API_KEY}`
      },
      body: JSON.stringify({
        model,
        messages,
        temperature,
        max_tokens
      })
    });

    if (!result.ok) {
      const errorData = await result.text();
      console.error('Salad Cloud error:', errorData);
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