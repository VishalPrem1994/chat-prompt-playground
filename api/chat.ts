import type { VercelRequest, VercelResponse } from '@vercel/node';

export default async function handler(
  request: VercelRequest,
  response: VercelResponse
) {
  const saladCloudUrl = 'https://jujube-spinach-40dapeep3i9p2t75.salad.cloud/v1/chat/completions';
  
  try {
    console.log('saladCloudUrl', saladCloudUrl);
    console.log("Running on Vercel Node");
    const result = await fetch(saladCloudUrl, {
      method: request.method,
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.SALAD_CLOUD_API_KEY}`
        // Forward any other necessary headers
      },
      body: request.method !== 'GET' ? JSON.stringify(request.body) : undefined,
    });

    const data = await result.json();
    
    return response.json(data);
  } catch (error) {
    return response.status(500).json({ error: 'Error forwarding request' });
  }
} 