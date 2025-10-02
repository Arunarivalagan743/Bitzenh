// Centralized API client
// Set VITE_API_BASE_URL in a .env file at project root (e.g., https://siporants.onrender.com OR https://siporants.onrender.com/api)
// If you omit the trailing /api it will be appended automatically. Falls back to local dev server if not provided.

function normalizeBase(raw) {
  if (!raw) return 'http://localhost:5000/api';
  let base = raw.trim();
  // Remove trailing slash
  base = base.replace(/\/$/, '');
  // If it already ends with /api or contains /api? query, keep as is, else append /api
  if (!/\/api($|[/?#])/.test(base)) {
    base += '/api';
  }
  return base;
}

const BASE_URL = normalizeBase(import.meta.env.VITE_API_BASE_URL);

export function buildUrl(path) {
  if (path.startsWith('http')) return path;
  return `${BASE_URL}${path.startsWith('/') ? path : '/' + path}`;
}

export async function apiFetch(path, options = {}) {
  const url = buildUrl(path);
  const resp = await fetch(url, {
    headers: { 'Content-Type': 'application/json', ...(options.headers || {}) },
    ...options,
  });
  if (!resp.ok) {
    let message = `Request failed: ${resp.status}`;
    try { message = await resp.text(); } catch {}
    throw new Error(message);
  }
  try {
    return await resp.json();
  } catch {
    return null;
  }
}

export async function apiUpload(path, file, fieldName = 'image') {
  const url = buildUrl(path);
  const formData = new FormData();
  formData.append(fieldName, file);
  const resp = await fetch(url, { method: 'POST', body: formData });
  if (!resp.ok) {
    const text = await resp.text();
    throw new Error(text || 'Upload failed');
  }
  return resp.json();
}

export { BASE_URL };