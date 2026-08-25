export function isBlockedDemoRequest(input, baseUrl = globalThis.location?.href || "http://localhost/") {
  const source = typeof input === "string" || input instanceof URL ? input : input?.url;
  if (!source) return true;
  const url = new URL(source, baseUrl);
  const base = new URL(baseUrl);
  if (url.origin !== base.origin) return true;
  return url.pathname.startsWith("/api/") || url.pathname.startsWith("/ws/");
}

export function installDemoFetchGuard(target = globalThis.window) {
  const nativeFetch = target.fetch.bind(target);
  target.fetch = (input, init) => {
    if (!isBlockedDemoRequest(input, target.location.href)) {
      return nativeFetch(input, init);
    }
    return Promise.resolve(new Response(JSON.stringify({ detail: "demo mode" }), {
      status: 503,
      headers: { "Content-Type": "application/json" },
    }));
  };
}
