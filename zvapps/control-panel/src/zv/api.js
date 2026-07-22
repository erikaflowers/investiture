// Thin fetch wrapper for the ZV API (ZV-CONTRACT.md §4) and legacy endpoints.

export async function apiGet(path) {
  const res = await fetch(path);
  const data = await res.json().catch(() => null);
  if (!res.ok) {
    throw new Error(data?.error?.message ?? data?.error ?? `HTTP ${res.status}`);
  }
  return data;
}
