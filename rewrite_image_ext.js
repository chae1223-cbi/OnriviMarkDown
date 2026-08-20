const fs = require('fs');
const file = 'd:/Developer/OnriviMarkDown/OnriviMarkDown/frontend/src/lib/fileImporter.ts';
let c = fs.readFileSync(file, 'utf8');

const targetRegex = /\/\/ 💡 3단계: OLE BinData 내 첨부 이미지 디코딩 및 미디어 결합 파이프라인[\s\S]*?const lines = replacedText\.split\('\\n'\);/;

const replacement = `// 💡 3단계: OLE BinData 내 첨부 이미지 디코딩 및 미디어 결합 파이프라인
    const imageTags: string[] = [];
    const imageMap: Record<number, string> = {};
    let parsedDoc = (view as any)._parsedHwpDoc;

    try {
      if (parsedDoc && parsedDoc.info && parsedDoc.info.binData && parsedDoc.info.binData.length > 0 && imageSaveCallback) {
        // hwp.js가 성공적으로 파싱한 경우, 해제된 이미지를 그대로 사용
        const binDataArray = parsedDoc.info.binData;
        for (let i = 0; i < binDataArray.length; i++) {
          const image = binDataArray[i];
          if (!image || !image.payload) continue;
          
          const base64 = Buffer.from(image.payload).toString('base64');
          const ext = (image.extension || 'png').toLowerCase();
          let mimeType = 'image/png';
          if (ext === 'jpg' || ext === 'jpeg') mimeType = 'image/jpeg';
          else if (ext === 'bmp') mimeType = 'image/bmp';
          else if (ext === 'gif') mimeType = 'image/gif';
          else if (ext === 'webp') mimeType = 'image/webp';
          else if (ext === 'svg') mimeType = 'image/svg+xml';
          
          try {
            const src = await imageSaveCallback(base64, mimeType);
            const imgTag = \`<img src="\${src}" alt="image_\${i}" style="max-width: 100%; height: auto;" />\`;
            imageTags.push(imgTag);
            imageMap[i] = imgTag;
          } catch (e) {
            console.error('이미지 저장 콜백 실패 (hwp.js):', e);
          }
        }
      } else {
        // fallbackText 등을 탔거나 binData가 비어있는 경우 OLE CFB로 강제 추출
        const cfb = await import('cfb');
        const pako = (await import('pako')).default;
        const cfbFile = cfb.read(view, { type: 'array' });
        const imageEntries = cfbFile.FileIndex.filter((entry: any) => 
          entry.type === 2 && 
          (
            entry.name.toLowerCase().includes('bindata') ||
            entry.name.toLowerCase().includes('bin00') ||
            /bin\\d+/i.test(entry.name)
          ) && 
          entry.size > 0 &&
          !entry.name.toLowerCase().endsWith('.wmf')
        );
        
        imageEntries.sort((a: any, b: any) => a.name.localeCompare(b.name, undefined, { numeric: true, sensitivity: 'base' }));
        
        if (imageEntries.length > 0 && imageSaveCallback) {
          for (const entry of imageEntries) {
            const streamData = new Uint8Array(entry.content);
            let decrypted: Uint8Array;
            try { decrypted = pako.inflate(streamData); }
            catch {
              try { decrypted = pako.inflateRaw(streamData); }
              catch {
                try { decrypted = pako.inflateRaw(streamData.subarray(2)); }
                catch (err) { decrypted = streamData; }
              }
            }
            
            const base64 = Buffer.from(decrypted).toString('base64');
            const ext = entry.name.split('.').pop()?.toLowerCase() || 'png';
            let mimeType = 'image/png';
            if (ext === 'jpg' || ext === 'jpeg') mimeType = 'image/jpeg';
            else if (ext === 'bmp') mimeType = 'image/bmp';
            else if (ext === 'gif') mimeType = 'image/gif';
            else if (ext === 'webp') mimeType = 'image/webp';
            else if (ext === 'svg') mimeType = 'image/svg+xml';
            
            try {
              const src = await imageSaveCallback(base64, mimeType);
              const imgTag = \`<img src="\${src}" alt="\${entry.name.split('/').pop()}" style="max-width: 100%; height: auto;" />\`;
              imageTags.push(imgTag);
              
              // HEX ID 추출 (예: BIN000A.bmp -> A -> 10)
              const binMatch = entry.name.match(/bin0*([0-9a-f]+)\\./i);
              if (binMatch) {
                const binId = parseInt(binMatch[1], 16) - 1; // 1-based index in file -> 0-based binID
                imageMap[binId] = imgTag;
              }
            } catch (saveError) {
              console.error('이미지 저장 콜백 실패 (CFB):', saveError);
            }
          }
        }
      }
    } catch (cfbError) {
      console.warn('이미지 추출 실패:', cfbError);
    }
    
    // 💡 이미지 플레이스홀더 치환 (매핑된 binID 우선, 나머지는 순차)
    let replacedText = text;
    
    // 1. binID 매핑된 플레이스홀더 치환
    for (const [binId, imgTag] of Object.entries(imageMap)) {
      const ph = \`::HWP_IMAGE_PLACEHOLDER_\${binId}::\`;
      replacedText = replacedText.replaceAll(ph, imgTag);
    }
    
    // 2. 매핑되지 못한 남은 특정 ID 플레이스홀더 정리
    replacedText = replacedText.replace(/::HWP_IMAGE_PLACEHOLDER_\\d+::/g, '');
    
    // 3. 범용 플레이스홀더 (fallbackText 등에서 삽입한 경우) 순차 치환
    let imageIdx = 0;
    while (replacedText.includes('::HWP_IMAGE_PLACEHOLDER::') && imageIdx < imageTags.length) {
      replacedText = replacedText.replace('::HWP_IMAGE_PLACEHOLDER::', imageTags[imageIdx]);
      imageIdx++;
    }
    replacedText = replacedText.replaceAll('::HWP_IMAGE_PLACEHOLDER::', ''); 
    
    // 💡 남은 이미지는 하단 첨부 이미지 목록에 순차 나열
    // (이미 맵핑에 사용된 태그도 남을 수 있으나, 보통 fallback일때만 발생함)
    if (imageIdx < imageTags.length && !parsedDoc) {
      replacedText += '\\n\\n---\\n### 📎 첨부 이미지 목록\\n\\n';
      for (let i = imageIdx; i < imageTags.length; i++) {
        replacedText += imageTags[i] + '\\n\\n';
      }
    }
    replacedText = replacedText.replace(/\\n{3,}/g, '\\n\\n');

    const lines = replacedText.split('\\n');`;

c = c.replace(targetRegex, replacement);

fs.writeFileSync(file, c, 'utf8');
console.log('Rewrote image extraction to perfectly map images to binIDs!');
