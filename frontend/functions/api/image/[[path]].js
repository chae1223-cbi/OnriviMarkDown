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
    // Cloudflare Workers의 URL.pathname은 percent-encoding이 유지되므로 디코딩 필요
    const key = decodeURIComponent(url.pathname.replace(/^\/api\/image\//, ''));

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
      'bmp': 'image/bmp',
      'ico': 'image/x-icon',
      'tiff': 'image/tiff',
      'tif': 'image/tiff',
      'mp4': 'video/mp4',
      'webm': 'video/webm',
      'ogg': 'video/ogg',
      'mov': 'video/quicktime',
      'avi': 'video/x-msvideo',
      'mkv': 'video/x-matroska',
      'mp3': 'audio/mpeg',
      'wav': 'audio/wav',
      'flac': 'audio/flac',
      'aac': 'audio/aac',
      'pdf': 'application/pdf',
      'doc': 'application/msword',
      'docx': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'xls': 'application/vnd.ms-excel',
      'xlsx': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'ppt': 'application/vnd.ms-powerpoint',
      'pptx': 'application/vnd.openxmlformats-officedocument.presentationml.presentation',
      'zip': 'application/zip',
      'rar': 'application/vnd.rar',
      '7z': 'application/x-7z-compressed',
      'tar': 'application/x-tar',
      'gz': 'application/gzip',
      'txt': 'text/plain',
      'csv': 'text/csv',
      'json': 'application/json',
      'md': 'text/markdown',
      'xml': 'application/xml',
      'hwp': 'application/x-hwp',
    };
    const contentType = contentTypeMap[ext] || object.httpMetadata?.contentType || 'application/octet-stream';

    const headers = new Headers();
    headers.set('Content-Type', contentType);
    // 이미지는 브라우저 표시, 나머지는 다운로드 (파일명 유지)
    const isImage = contentType.startsWith('image/');
    headers.set('Content-Disposition', isImage ? 'inline' : `attachment; filename="${key.split('/').pop()}"`);
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
