export function apiClient(token) {
  const base = process.env.GATSBY_API_BASE || '/api';
  async function request(path, opts = {}) {
    const headers = { ...(opts.headers || {}) };
    
    // Only set Content-Type to application/json if body is not FormData
    if (!(opts.body instanceof FormData)) {
      headers['Content-Type'] = 'application/json';
    }
    
    if (token) headers['Authorization'] = `Bearer ${token}`;
    const res = await fetch(`${base}${path}`, { ...opts, headers });
    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      throw new Error(data.error || `Request failed: ${res.status}`);
    }
    return res.json();
  }
  return {
    get: (p) => request(p),
    post: (p, body, options = {}) => {
      const requestBody = body instanceof FormData ? body : JSON.stringify(body);
      return request(p, { method: 'POST', body: requestBody, ...options });
    },
    put: (p, body, options = {}) => {
      const requestBody = body instanceof FormData ? body : JSON.stringify(body);
      return request(p, { method: 'PUT', body: requestBody, ...options });
    }
  };
}
