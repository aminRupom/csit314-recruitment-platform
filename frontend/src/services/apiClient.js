import { getAccessToken, getRefreshToken, setTokens, clearTokens } from "./auth";

const BASE_URL = import.meta.env.VITE_API_BASE_URL;

async function parseBody(res) {
  const text = await res.text();
  if (!text) return null;
  try {
    return JSON.parse(text);
  } catch {
    return text;
  }
}

function errorMessage(body) {
  if (!body) return "Request failed";
  if (typeof body === "string") return body;
  if (body.detail) return body.detail;
  return JSON.stringify(body);
}

async function doFetch(path, options) {
  const token = getAccessToken();
  const headers = { ...(options.headers || {}) };
  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  const res = await fetch(`${BASE_URL}${path}`, { ...options, headers });

  if (res.ok) {
    return parseBody(res);
  }

  if (res.status === 401) {
    const refresh = getRefreshToken();
    if (refresh) {
      const refreshRes = await fetch(`${BASE_URL}/auth/refresh/`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ refresh }),
      });
      if (refreshRes.ok) {
        const refreshData = await refreshRes.json();
        setTokens(refreshData.access, refresh);
        const retryHeaders = { ...headers, Authorization: `Bearer ${refreshData.access}` };
        const retryRes = await fetch(`${BASE_URL}${path}`, { ...options, headers: retryHeaders });
        if (retryRes.ok) return parseBody(retryRes);
        const retryBody = await parseBody(retryRes);
        throw new Error(errorMessage(retryBody));
      }
    }
    clearTokens();
  }

  const body = await parseBody(res);
  throw new Error(errorMessage(body));
}

export function apiRequest(path, options = {}) {
  return doFetch(path, options);
}

export function apiGet(path) {
  return doFetch(path, { method: "GET" });
}

export function apiPost(path, body) {
  return doFetch(path, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
}

export function apiPut(path, body) {
  return doFetch(path, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
}

export function apiPatch(path, body) {
  return doFetch(path, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
}

export function apiDelete(path) {
  return doFetch(path, { method: "DELETE" });
}

export function apiMultipart(path, formData) {
  // No Content-Type header: browser sets multipart boundary automatically.
  return doFetch(path, { method: "POST", body: formData });
}
