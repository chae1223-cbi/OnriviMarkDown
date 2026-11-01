// 🚨 @PATCH : 2026-11-01 — PostgreSQL 오류 응답과 진단 메타데이터를 한곳에서 생성한다.
const PG_CODE = /^[0-9A-Z]{5}$/;

export function serverError(request, error, { source, stage, message = '요청을 처리하지 못했습니다.' }) {
  const requestId = request.headers.get('x-onrivi-request-id') || crypto.randomUUID();
  const dbCode = typeof error?.code === 'string' && PG_CODE.test(error.code) ? error.code : null;
  console.error(JSON.stringify({
    event: 'SERVER_ERROR', requestId, source, stage, dbCode,
    errorName: typeof error?.name === 'string' ? error.name : 'Error',
    constraint: typeof error?.constraint === 'string' ? error.constraint : undefined,
  }));
  return new Response(JSON.stringify({ success: false, code: 'SERVER_ERROR', message, requestId }), {
    status: 500,
    headers: {
      'Content-Type': 'application/json; charset=utf-8',
      'Cache-Control': 'no-store',
      'X-Error-Source': source,
      'X-Error-Stage': stage,
      ...(dbCode ? { 'X-Error-Db-Code': dbCode } : {}),
    },
  });
}
