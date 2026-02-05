export async function fetchJson<T>(
  input: RequestInfo | URL,
  init?: RequestInit
): Promise<T> {
  const res = await fetch(input, init);
  const ct = res.headers.get("content-type") || "";
  const text = await res.text();

  if (!ct.includes("application/json")) {
    throw new Error(
      `Resposta não-JSON (${res.status}). Início: ${text.slice(0, 120)}`
    );
  }

  const data = JSON.parse(text);

  if (!res.ok) {
    const msg =
      (data && (data.error || data.message)) || `Erro HTTP ${res.status}`;
    throw new Error(msg);
  }

  return data as T;
}
