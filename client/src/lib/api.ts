const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api';

async function parseJsonResponse(response: Response) {
  const contentType = response.headers.get('content-type') || '';

  if (response.status === 204 || !contentType.includes('application/json')) {
    return null;
  }

  const text = await response.text();
  if (!text.trim()) {
    return null;
  }

  return JSON.parse(text);
}

export async function apiRequest(endpoint: string, options: RequestInit = {}) {
  const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
  
  const headers = {
    'Content-Type': 'application/json',
    ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
    ...options.headers,
  };

  const response = await fetch(`${API_URL}${endpoint}`, {
    ...options,
    headers,
  });

  if (!response.ok) {
    const error = await parseJsonResponse(response);
    throw new Error(error?.error || 'Something went wrong');
  }

  return parseJsonResponse(response);
}
