
import Constants from 'expo-constants';

export const BACKEND_URL = Constants.expoConfig?.extra?.backendUrl || 'http://localhost:3000';

export async function apiPost<T>(endpoint: string, body: any): Promise<T> {
  console.log(`[API] POST ${endpoint}`, body);
  
  const response = await fetch(`${BACKEND_URL}${endpoint}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(body),
  });

  if (!response.ok) {
    const errorText = await response.text();
    console.error(`[API] POST ${endpoint} failed:`, response.status, errorText);
    throw new Error(`API request failed: ${response.status}`);
  }

  const data = await response.json();
  console.log(`[API] POST ${endpoint} success:`, data);
  return data;
}

export async function apiGet<T>(endpoint: string): Promise<T> {
  console.log(`[API] GET ${endpoint}`);
  
  const response = await fetch(`${BACKEND_URL}${endpoint}`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    const errorText = await response.text();
    console.error(`[API] GET ${endpoint} failed:`, response.status, errorText);
    throw new Error(`API request failed: ${response.status}`);
  }

  const data = await response.json();
  console.log(`[API] GET ${endpoint} success:`, data);
  return data;
}
