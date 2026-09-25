const API_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:3000/api';

type ApiOptions = RequestInit & { token?: string };

export async function api<T>(path: string, options: ApiOptions = {}): Promise<T> {
  const { token, ...requestOptions } = options;
  const response = await fetch(`${API_URL}${path}`, {
    ...requestOptions,
    headers: {
      ...(requestOptions.body ? { 'Content-Type': 'application/json' } : {}),
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...requestOptions.headers
    }
  });

  if (!response.ok) {
    const body = await response.json().catch(() => ({ error: 'No se pudo completar la solicitud.' }));
    throw new Error(body.error ?? 'No se pudo completar la solicitud.');
  }

  if (response.status === 204) return undefined as T;
  return response.json() as Promise<T>;
}

export function money(value: string | number): string {
  return new Intl.NumberFormat('es-BO', {
    style: 'currency',
    currency: 'BOB',
    minimumFractionDigits: 2
  }).format(Number(value));
}

