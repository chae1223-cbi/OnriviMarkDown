import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

export async function POST(request: Request) {
  try {
    const { base64Data, targetFolder } = await request.json();
    if (!base64Data) {
      return NextResponse.json({ error: 'No image data provided' }, { status: 400 });
    }

    // 1. Next.js dev server public/assets path (웹에서 보기 위함)
    const webAssetsDir = path.join(process.cwd(), 'public', 'assets');
    if (!fs.existsSync(webAssetsDir)) {
      fs.mkdirSync(webAssetsDir, { recursive: true });
    }

    const cleanBase64 = base64Data.replace(/^data:image\/\w+;base64,/, '');
    const buffer = Buffer.from(cleanBase64, 'base64');

    const fileName = `image_${Date.now()}_${Math.floor(Math.random() * 1000)}.png`;
    
    // 웹용 public 폴더에 저장
    const webFilePath = path.join(webAssetsDir, fileName);
    fs.writeFileSync(webFilePath, buffer);

    // 2. 데스크탑용 실제 디렉토리에 동시 저장 (Electron 크로스 호환성 보장)
    if (targetFolder) {
      // 파일인 경우 상위 디렉토리 추출
      const isFile = targetFolder.toLowerCase().endsWith('.md') || targetFolder.toLowerCase().endsWith('.markdown');
      const dirPath = isFile ? path.dirname(targetFolder) : targetFolder;
      
      const localAssetsDir = path.join(dirPath, 'assets');
      if (!fs.existsSync(localAssetsDir)) {
        fs.mkdirSync(localAssetsDir, { recursive: true });
      }
      const localFilePath = path.join(localAssetsDir, fileName);
      fs.writeFileSync(localFilePath, buffer);
    }

    return NextResponse.json({
      status: 'success',
      relativePath: `/assets/${fileName}`
    });
  } catch (error: any) {
    console.error('API Error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
