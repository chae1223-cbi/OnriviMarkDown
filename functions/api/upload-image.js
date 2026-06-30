// CORS 헤더 (Electron 데스크탑 file:// origin 지원)
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
  'Access-Control-Max-Age': '86400',
};

export async function onRequestOptions() {
  return new Response(null, { headers: corsHeaders });
}

function withCors(res) {
  const headers = new Headers(res.headers);
  for (const [k, v] of Object.entries(corsHeaders)) headers.set(k, v);
  return new Response(res.body, { status: res.status, statusText: res.statusText, headers });
}

export async function onRequestPost(context) {
  try {
    const { request, env } = context;
    
    // 1. Authorization 헤더 확인 (Supabase JWT)
    const authHeader = request.headers.get('Authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return withCors(new Response(JSON.stringify({ error: 'Unauthorized: Missing or invalid token' }), { 
        status: 401,
        headers: { 'Content-Type': 'application/json' }
      }));
    }
    const token = authHeader.split(' ')[1];
    
    // 2. JWT 디코딩하여 User ID (sub) 추출
    let userId = 'anonymous';
    try {
      const tokenParts = token.split('.');
      if (tokenParts.length === 3) {
        const payload = JSON.parse(atob(tokenParts[1]));
        if (payload.sub) {
          userId = payload.sub;
        }
      }
    } catch (e) {
      console.warn('Failed to parse JWT', e);
    }

    // 3. Request Body (JSON) 파싱
    const body = await request.json();
    const base64Data = body.base64Data;
    if (!base64Data) {
      return withCors(new Response(JSON.stringify({ error: 'Bad Request: No image data provided' }), { 
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      }));
    }

    // 클라이언트가 fileName을 전달하면 해당 이름 사용, 없으면 자동 생성
    const clientFileName = body.fileName || null;

    // 4. Base64 -> Uint8Array (바이너리) 변환
    const cleanBase64 = base64Data.replace(/^data:image\/\w+;base64,/, '');
    const binaryString = atob(cleanBase64);
    const len = binaryString.length;
    const bytes = new Uint8Array(len);
    for (let i = 0; i < len; i++) {
        bytes[i] = binaryString.charCodeAt(i);
    }

    // 5. 유니크 파일명 생성 (User ID별 폴더 분리)
    const timestamp = Date.now();
    const randomHex = Math.floor(Math.random() * 16777215).toString(16);
    const baseName = clientFileName || `img_${timestamp}_${randomHex}.png`;
    const fileName = `users/${userId}/${baseName}`;

    // 6. R2 버킷에 업로드
    if (!env.R2_BUCKET) {
      return withCors(new Response(JSON.stringify({ error: 'Internal Server Error: R2_BUCKET binding missing' }), { 
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      }));
    }

    await env.R2_BUCKET.put(fileName, bytes, {
      httpMetadata: { contentType: 'image/png' },
      customMetadata: { userId }
    });

    // 7. 자체 Pages Function(/api/image/) 경로로 반환 (R2 퍼블릭 도메인 불필요)
    // /api/image/users/{userId}/img_xxx.png 형태로 반환하면
    // [[path]].js Function이 R2에서 직접 읽어 서빙합니다.
    const servePath = `/api/image/${fileName}`;

    return withCors(new Response(JSON.stringify({
      status: 'success',
      relativePath: servePath
    }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    }));

  } catch (err) {
    return withCors(new Response(JSON.stringify({ error: err.message }), { 
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    }));
  }
}
