/**
 * Cloudflare Pages Function: /api/image/[...path]
 * R2 버킷에서 이미지를 읽어 서빙합니다. (퍼블릭 R2 URL 불필요)
 * 
 * 요청 형식: GET /api/image/users/{userId}/img_xxx.png
 * R2 키:   users/{userId}/img_xxx.png
 */
export async function onRequestGet(context) {
  try {
    const { request, env, params } = context;

    // URL에서 이미지 경로 추출 (/api/image/ 이후 부분)
    const url = new URL(request.url);
    // pathname: /api/image/users/xxx/img.png → key: users/xxx/img.png
    const key = url.pathname.replace(/^\/api\/image\//, '');

    if (!key) {
      return new Response('Missing image path', { status: 400 });
    }

    if (!env.R2_BUCKET) {
      return new Response('R2_BUCKET binding missing', { status: 500 });
    }

    // R2에서 객체 읽기
    const object = await env.R2_BUCKET.get(key);

    if (!object) {
      return new Response('Image not found', { status: 404 });
    }

    // Content-Type 결정
    const ext = key.split('.').pop()?.toLowerCase() || '';
    const contentTypeMap = {
      'png': 'image/png',
      'jpg': 'image/jpeg',
      'jpeg': 'image/jpeg',
      'gif': 'image/gif',
      'webp': 'image/webp',
      'svg': 'image/svg+xml',
    };
    const contentType = contentTypeMap[ext] || object.httpMetadata?.contentType || 'application/octet-stream';

    const headers = new Headers();
    headers.set('Content-Type', contentType);
    // 1주일 캐싱
    headers.set('Cache-Control', 'public, max-age=604800, immutable');
    headers.set('ETag', object.httpEtag);

    // ETag 캐시 검증
    const ifNoneMatch = request.headers.get('If-None-Match');
    if (ifNoneMatch === object.httpEtag) {
      return new Response(null, { status: 304, headers });
    }

    return new Response(object.body, { status: 200, headers });

  } catch (err) {
    console.error('Image serve error:', err);
    return new Response(err.message, { status: 500 });
  }
}
