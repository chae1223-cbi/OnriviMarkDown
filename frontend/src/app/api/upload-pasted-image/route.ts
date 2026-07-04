import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

export async function POST(request: Request) {
  try {
    const { base64Data, fileName: clientFileName, targetFolder } = await request.json();
    if (!base64Data) {
      return NextResponse.json({ error: 'No data provided' }, { status: 400 });
    }

    const ext = clientFileName ? (clientFileName.split('.').pop()?.toLowerCase() || 'png') : 'png';
    const baseName = clientFileName || `file_${Date.now()}_${Math.floor(Math.random() * 1000)}.${ext}`;
    const fileName = `inquiry_${Date.now()}_${Math.floor(Math.random() * 1000)}.${ext}`;

    const cleanBase64 = base64Data.replace(/^data:\w+\/\w+;base64,/, '');
    const buffer = Buffer.from(cleanBase64, 'base64');

    const webAssetsDir = path.join(process.cwd(), 'public', 'assets');
    if (!fs.existsSync(webAssetsDir)) {
      fs.mkdirSync(webAssetsDir, { recursive: true });
    }
    const webFilePath = path.join(webAssetsDir, fileName);
    fs.writeFileSync(webFilePath, buffer);

    if (targetFolder) {
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
