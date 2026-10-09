// Request metadata only: never store bodies, tokens, queries or user identifiers.
export async function onRequest(context) {
  const started = Date.now();
  const url = new URL(context.request.url);
  const requestId = crypto.randomUUID();
  let response;
  try { response = await context.next(); }
  catch { response = new Response('Internal server error', { status: 500 }); }
  // Temporary diagnostic window ends at 2026-10-10 00:00 KST.
  const captureAllToday = Date.now() < Date.parse('2026-10-10T00:00:00+09:00');
  if ((captureAllToday || response.status >= 400) && context.env.R2_BUCKET && !url.pathname.startsWith('/api/admin/system')) {
    const entry = { id: requestId, timestamp: new Date().toISOString(), level: response.status >= 500 ? 'ERROR' : response.status >= 400 ? 'WARN' : 'INFO', module: 'HTTP', action: context.request.method, message: `HTTP ${response.status} · ${Date.now() - started}ms`, actor: 'SERVER', target: '-', status: response.status };
    const date = entry.timestamp.slice(0,10);
    context.waitUntil(context.env.R2_BUCKET.put(`_system-logs/${date}/${entry.timestamp}_${requestId}.json`, JSON.stringify(entry)).catch(() => console.error('[ServerLog] Storage write failed')));
  }
  const result = new Response(response.body, response);
  result.headers.set('X-Request-ID', requestId);
  return result;
}
