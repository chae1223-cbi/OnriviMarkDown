import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const filePath = searchParams.get('filePath');

    if (!filePath) {
      return new NextResponse('Missing filePath', { status: 400 });
    }

    let actualPath = filePath;

    if (!fs.existsSync(actualPath)) {
      // 💡 가상 경로이거나 상대 경로일 경우, 프론트엔드의 public/assets 폴더에서 파일명으로 폴백 검색합니다.
      const fileName = path.basename(filePath);
      const publicAssetsPath = path.join(process.cwd(), 'public', 'assets', fileName);
      
      if (fs.existsSync(publicAssetsPath)) {
        actualPath = publicAssetsPath;
      } else {
        return new NextResponse('File not found', { status: 404 });
      }
    }

    // 파일 수정 시간 기반 ETag 생성 (브라우저 캐싱용)
    const stat = fs.statSync(actualPath);
    const etag = `"${stat.mtimeMs.toString(36)}-${stat.size.toString(36)}"`;
    const ifNoneMatch = request.headers.get('if-none-match');
    
    // 브라우저가 이미 최신 버전을 가지고 있으면 304 Not Modified 반환 (로그 없음)
    if (ifNoneMatch === etag) {
      return new NextResponse(null, { status: 304, headers: { 'ETag': etag } });
    }

    const fileBuffer = fs.readFileSync(actualPath);
    
    // Determine content type
    const ext = path.extname(actualPath).toLowerCase();
    let contentType = 'application/octet-stream';
    if (ext === '.png') contentType = 'image/png';
    else if (ext === '.jpg' || ext === '.jpeg') contentType = 'image/jpeg';
    else if (ext === '.gif') contentType = 'image/gif';
    else if (ext === '.svg') contentType = 'image/svg+xml';
    else if (ext === '.webp') contentType = 'image/webp';

    return new NextResponse(fileBuffer, {
      headers: {
        'Content-Type': contentType,
        // 1시간 캐싱 (개발 환경에서 반복 요청 및 로그 억제)
        'Cache-Control': 'private, max-age=3600',
        'ETag': etag,
      }
    });
  } catch (error: any) {
    console.error('View API Error:', error);
    return new NextResponse(error.message, { status: 500 });
  }
}

