import type { VercelRequest, VercelResponse } from '@vercel/node';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.VITE_SUPABASE_URL!,
  process.env.VITE_SUPABASE_ANON_KEY!
);

export default async function handler(
  request: VercelRequest,
  response: VercelResponse
) {
  if (request.method !== 'POST') {
    return response.status(405).json({ error: 'Method not allowed' });
  }

  const { action, username, password } = request.body;

  try {
    switch (action) {
      case 'login':
        const { data: loginData, error: loginError } = await supabase
          .from('users')
          .select('user_id, active')
          .eq('username', username)
          .eq('password', password)
          .single();

        if (loginError) throw loginError;
        if (!loginData) {
          return response.status(401).json({ error: 'Invalid credentials' });
        }
        if (!loginData.active) {
          return response.status(403).json({ error: 'Account is inactive' });
        }

        return response.json({ userId: loginData.user_id });

      case 'signup':
        // Check if username exists
        const { data: existingUser } = await supabase
          .from('users')
          .select('username')
          .eq('username', username)
          .single();

        if (existingUser) {
          return response.status(409).json({ error: 'Username already exists' });
        }

        // Create new user
        const { data: signupData, error: signupError } = await supabase
          .from('users')
          .insert([
            {
              username,
              password,
              active: true
            }
          ])
          .select('user_id')
          .single();

        if (signupError) throw signupError;
        return response.json({ userId: signupData.user_id });

      default:
        return response.status(400).json({ error: 'Invalid action' });
    }
  } catch (error) {
    console.error('Auth error:', error);
    return response.status(500).json({ error: 'Internal server error' });
  }
} 