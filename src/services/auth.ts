import { AxiosResponse } from 'axios';

interface AuthResponse {
  userId: string;
  error?: string;
}

interface AuthCredentials {
  username: string;
  password: string;
}

export const login = async (credentials: AuthCredentials): Promise<string> => {
  const response = await fetch('/api/auth', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      action: 'login',
      username: credentials.username,
      password: credentials.password,
    }),
  });

  const data: AuthResponse = await response.json();
  
  if (!response.ok) {
    throw new Error(data.error || 'Failed to login');
  }

  return data.userId;
};

export const signup = async (credentials: AuthCredentials): Promise<string> => {
  const response = await fetch('/api/auth', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      action: 'signup',
      username: credentials.username,
      password: credentials.password,
    }),
  });

  const data: AuthResponse = await response.json();
  
  if (!response.ok) {
    throw new Error(data.error || 'Failed to signup');
  }

  return data.userId;
}; 