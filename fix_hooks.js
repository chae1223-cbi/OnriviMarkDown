const fs = require('fs');
const f1 = 'd:/Developer/OnriviMarkDown/OnriviMarkDown/frontend/src/components/MarkdownViewer.tsx';
let c1 = fs.readFileSync(f1, 'utf8');

const badCode = `
                if (!src) return <img alt={alt} {...props} />;
                
                // ? [쿼리 ?트?분리 가??
                // ??지 URL ?에 ?width=300&height=200 ?의 쿼리 ?라미터가 ?붙???는 경우,
                // 로컬 ?일 경로 ?석 ????쿼리가 ?함?면 404 ?러가 ???분리 처리?니??
                let pureSrc = src;
                let queryString = '';
                const qIdx = src.indexOf('?');
                if (qIdx !== -1) {
                  pureSrc = src.substring(0, qIdx);
                  queryString = src.substring(qIdx);
                }
  
                // ? [URL ?코? 가??
                // %20 ?이 ?함??URL??로컬 ?일 ?스?? ?출 ???러?를 야기?므?decode 처리?니??
                try { if (pureSrc) pureSrc = decodeURI(pureSrc); } catch(e){}
                
                let finalSrc = src;
                let absolutePath = pureSrc;
                let width = '';
                let height = '';
  
                // URL 쿼리 파라미터?width, height 추출
                if (queryString) {
                  const params = new URLSearchParams(queryString);
                  if (params.get('width')) width = params.get('width') as string;
                  if (params.get('w')) width = params.get('w') as string;
                  if (params.get('height')) height = params.get('height') as string;
                  if (params.get('h')) height = params.get('h') as string;
                }
                
                // HTML ?성(width="", height="")?서 ?출 (?선순위)
                if (props.width) width = String(props.width).replace('px', '');
                if (props.height) height = String(props.height).replace('px', '');
  
                const isExternal = pureSrc.startsWith('http://') || pureSrc.startsWith('https://') || pureSrc.startsWith('data:') || pureSrc.startsWith('blob:');
                const isMediaServe = pureSrc.startsWith('media://local/serve');
                let mediaFilePath = '';
                if (isMediaServe) {
                  try {
                    const parsedUrl = new URL(src);
                    const extracted = parsedUrl.searchParams.get('url');
                    if (extracted) mediaFilePath = extracted;
                  } catch (e) {
                    const m = src.match(/[?&]url=([^&]+)/);
                    if (m) mediaFilePath = decodeURIComponent(m[1]);
                  }
                } else if (!isExternal && typeof window !== 'undefined') {
                  const api = (window as any).electronAPI;
                  const isAbsoluteWin = /^[a-zA-Z]:[\\/]/.test(pureSrc);
                  // ? [마크?운 루트 ??경로 지??
                  // 마크?운 문법?서 /assets/img.png 처럼 최상???래??/)??작?는 경로??
                  // ?크?페?스??루트 ?더?기??로 ?는 ?? 경로(Root-Relative)??석?야 ?니??
                  const isRootRelative = pureSrc.startsWith('/');
  
                  const isWelcomePage = dynamicPropsRef.current.currentFilePath && (
                    dynamicPropsRef.current.currentFilePath.endsWith('Welcome.md') || 
                    dynamicPropsRef.current.currentFilePath.endsWith('Welcome_EN.md')
                  );
  
                  // hero.png??컴 ?셋?로 취급?거?? ?수?게 Welcome.md가 ?더?중일 ?만
                  const isWelcomeAsset = (pureSrc === './hero.png' || pureSrc === 'hero.png') && isWelcomePage;
  
                  if ((pureSrc.startsWith('/media/') || pureSrc.startsWith('./media/')) && api) {
                    // ? [?심] ?스?탑: secureStorage?서 ?? 최신 resourceFolder?직접 ?어 경로 조
                    const freshRF = loadSecureData<string>('resourceFolder') || dynamicPropsRef.current.resourceFolder;
                    if (freshRF) {
                      const sep = freshRF.includes('\\') ? '\\' : '/';
                      const cleanRoot = freshRF.endsWith(sep) ? freshRF.slice(0, -1) : freshRF;
                      const strippedSrc = pureSrc.startsWith('./') ? pureSrc.substring(1) : pureSrc;
                      const normalizedSrc = sep === '\\' ? strippedSrc.replace(/\\//g, '\\') : strippedSrc;
                      absolutePath = cleanRoot + normalizedSrc;
                    } else {
                      let baseDir = dynamicPropsRef.current.targetFolder;
                      const sep = baseDir && baseDir.includes('\\') ? '\\' : '/';
                      if (baseDir) {
                        if (baseDir.endsWith(sep)) baseDir = baseDir.slice(0, -1);
                      } else if (dynamicPropsRef.current.currentFilePath) {
                        baseDir = dynamicPropsRef.current.currentFilePath.replace(/[/\\][^/\\]+$/, '');
                      }
  
                      if (baseDir) {
                        const fileName = pureSrc.replace(/^\\.?\\/media\\//, '');
                        absolutePath = baseDir + '\\media\\' + fileName;
                      }
                    }
                  } else if (isRootRelative && dynamicPropsRef.current.rootFolderPath && dynamicPropsRef.current.rootFolderPath !== BROWSER_STORAGE_NAME && !isWelcomeAsset) {
                    // ?크?페?스 루트 ?? 경로 처리 (?? /assets/img.png -> ?크?페?스경로/assets/img.png)
                    const sep = dynamicPropsRef.current.rootFolderPath.includes('\\') ? '\\' : '/';
                    const cleanRoot = dynamicPropsRef.current.rootFolderPath.endsWith(sep) ? dynamicPropsRef.current.rootFolderPath.slice(0, -1) : dynamicPropsRef.current.rootFolderPath;
                    const normalizedSrc = sep === '\\' ? pureSrc.replace(/\\//g, '\\') : pureSrc;
                    absolutePath = cleanRoot + normalizedSrc;
                  } else if (isRootRelative && (!dynamicPropsRef.current.rootFolderPath || dynamicPropsRef.current.rootFolderPath === BROWSER_STORAGE_NAME) && dynamicPropsRef.current.currentFilePath && !isWelcomeAsset) {
                    // 루트 ?더가 ?정?지 ?은 ?태?서 root-relative 경로?지정??경우
                    // ?재 열려?는 ?일???위 ?더?기준?로 처리(?시 보완)
                    const sep = dynamicPropsRef.current.currentFilePath.includes('\\') ? '\\' : '/';
                    const parentDir = dynamicPropsRef.current.currentFilePath.replace(/[/\\][^/\\]+$/, '');
                    const normalizedSrc = sep === '\\' ? pureSrc.replace(/\\//g, '\\') : pureSrc;
                    absolutePath = parentDir + normalizedSrc;
                  } else if (!isAbsoluteWin && !isWelcomeAsset) {
                    let baseDir = dynamicPropsRef.current.targetFolder;
                    const sep = baseDir && baseDir.includes('\\') ? '\\' : '/';
                    if (baseDir) {
                      if (baseDir.endsWith(sep)) baseDir = baseDir.slice(0, -1);
                    } else if (dynamicPropsRef.current.currentFilePath) {
                      baseDir = dynamicPropsRef.current.currentFilePath.replace(/[/\\][^/\\]+$/, '');
                    }
                    if (baseDir) {
                      const normalizedSrc = sep === '\\' ? pureSrc.replace(/\\//g, '\\') : pureSrc;
                      absolutePath = baseDir + (normalizedSrc.startsWith(sep) ? '' : sep) + normalizedSrc;
                    }
                  }
                  
                  // Welcome ?셋 특별 처리
                  if (isWelcomeAsset && dynamicPropsRef.current.welcomeHeroPath) {
                    absolutePath = dynamicPropsRef.current.welcomeHeroPath;
                  }
  
                  finalSrc = \`media://local/serve?url=\${encodeURIComponent(absolutePath)}\`;
                  if (queryString) finalSrc += \`&\${queryString.substring(1)}\`;
                }
  
                // ? [?위 ?동 보완 가??
                if (width && /^\\d+$/.test(width)) width = \`\${width}px\`;
                if (height && /^\\d+$/.test(height)) height = \`\${height}px\`;
  
                const imgStyle: React.CSSProperties = {
                  ...style, maxWidth: '100%', height: height || 'auto',
                };
                imgStyle.width = width || undefined;
                if (!width) imgStyle.maxWidth = 'min(100%, 600px)';
                
                let figureStyle: React.CSSProperties = {
                  display: 'flex',
                  flexDirection: 'column',
                  width: '100%',
                };
                
                let forceAlignClass = '';
                if (queryString.includes('align=left')) {
                   forceAlignClass = 'mr-auto';
                   figureStyle.alignItems = 'flex-start';
                   figureStyle.textAlign = 'left';
                } else if (queryString.includes('align=right')) {
                   forceAlignClass = 'ml-auto';
                   figureStyle.alignItems = 'flex-end';
                   figureStyle.textAlign = 'right';
                } else {
                  figureStyle.alignItems = 'center';
                  figureStyle.textAlign = 'center';
                }
                
  const [copied, setCopied] = useState(false);
  const imgRef = useRef<HTMLImageElement>(null);
  
  const handleCopy = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    try {
      let blob;
      if (imgSrc.startsWith('data:')) {
        const response = await fetch(imgSrc);
        blob = await response.blob();
      } else if (imgRef.current) {
        const canvas = document.createElement('canvas');
        canvas.width = imgRef.current.naturalWidth || imgRef.current.width;
        canvas.height = imgRef.current.naturalHeight || imgRef.current.height;
        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.drawImage(imgRef.current, 0, 0);
          blob = await new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, 'image/png'));
        }
      }
      
      if (blob) {
        await navigator.clipboard.write([new ClipboardItem({ 'image/png': blob })]);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      }
    } catch (err) {
      console.error('Image copy failed', err);
    }
  };

  const imgElement = (
    <div className="relative group inline-block" style={imgStyle}>
      <AsyncImage 
        src={finalSrc} 
        alt={alt} 
        absolutePath={absolutePath} 
        rootFolder={dynamicPropsRef.current.rootFolder} 
        resourceFolderHandle={dynamicPropsRef.current.resourceFolderHandle}
        workspaceType={dynamicPropsRef.current.workspaceType} 
        api={typeof window !== 'undefined' ? (window as any).electronAPI : null} 
        queryString={queryString} 
        className={\`rounded-lg shadow-sm border border-zinc-200/30 my-3 \${forceAlignClass}\`} 
        {...props} 
        style={{ width: '100%', height: '100%', objectFit: 'contain' }} 
        ref={imgRef}
      />
      <button
        onClick={handleCopy}
        className="absolute top-2 right-2 p-1.5 bg-black/60 text-white rounded opacity-0 group-hover:opacity-100 transition-opacity text-xs flex items-center gap-1 z-10 hover:bg-black/80"
        title="이미지 복사"
      >
        {copied ? (
          <>
            <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>
            복사됨
          </>
        ) : (
          <>
            <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path></svg>
            복사
          </>
        )}
      </button>
    </div>
  );
                
                if (alt && alt.trim() !== '') {
`;

// Wait, the hook needs to be AT THE TOP OF THE COMPONENT, before ANY early returns!
const betterReplacement = `
              img: ({ node, src, alt, style, ...props }: any) => {
                const [copied, setCopied] = useState(false);
                const imgRef = useRef<HTMLImageElement>(null);
                
                if (!src) return <img alt={alt} {...props} />;
                
                const handleCopy = async (e: React.MouseEvent) => {
                  e.preventDefault();
                  e.stopPropagation();
                  try {
                    let blob;
                    if (finalSrc.startsWith('data:')) {
                      const response = await fetch(finalSrc);
                      blob = await response.blob();
                    } else if (imgRef.current) {
                      // wait, imgRef is attached to AsyncImage which renders an img.
                      // AsyncImage doesn't forward ref natively unless we use forwardRef!
                      // I need to use a DOM query or attach to a wrapper.
                      const imgEl = imgRef.current.querySelector('img');
                      if (imgEl) {
                        const canvas = document.createElement('canvas');
                        canvas.width = imgEl.naturalWidth || imgEl.width;
                        canvas.height = imgEl.naturalHeight || imgEl.height;
                        const ctx = canvas.getContext('2d');
                        if (ctx) {
                          ctx.drawImage(imgEl, 0, 0);
                          blob = await new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, 'image/png'));
                        }
                      }
                    }
                    
                    if (blob) {
                      await navigator.clipboard.write([new ClipboardItem({ 'image/png': blob })]);
                      setCopied(true);
                      setTimeout(() => setCopied(false), 2000);
                    }
                  } catch (err) {
                    console.error('Image copy failed', err);
                  }
                };

                let pureSrc = src;
`;

c1 = c1.replace(
  "img: ({ node, src, alt, style, ...props }: any) => {\n                if (!src) return <img alt={alt} {...props} />;\n                \n                // ? [쿼리",
  betterReplacement.trim() + "\n                // ? [쿼리"
);

c1 = c1.replace(
  "const imgElement = (\n                  <AsyncImage \n                    src={finalSrc}",
  `const imgElement = (
                  <div className="relative group inline-block" style={imgStyle} ref={imgRef as any}>
                    <AsyncImage 
                      src={finalSrc} `
);

c1 = c1.replace(
  "{...props} \n                  />\n                );",
  `{...props} 
                      style={{ width: '100%', height: '100%', objectFit: 'contain' }} 
                    />
                    <button
                      onClick={handleCopy}
                      className="absolute top-2 right-2 p-1.5 bg-black/60 text-white rounded opacity-0 group-hover:opacity-100 transition-opacity text-xs flex items-center gap-1 z-10 hover:bg-black/80"
                      title="이미지 복사"
                    >
                      {copied ? (
                        <>
                          <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>
                          복사됨
                        </>
                      ) : (
                        <>
                          <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path></svg>
                          복사
                        </>
                      )}
                    </button>
                  </div>
                );`
);

// We need to remove the PREVIOUS replacement I did inside `AsyncImage` directly!
c1 = c1.replace(
  `  const [copied, setCopied] = useState(false);
  const imgRef = useRef<HTMLImageElement>(null);
  
  const handleCopy = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    try {
      let blob;
      if (imgSrc.startsWith('data:')) {
        const response = await fetch(imgSrc);
        blob = await response.blob();
      } else if (imgRef.current) {
        const canvas = document.createElement('canvas');
        canvas.width = imgRef.current.naturalWidth || imgRef.current.width;
        canvas.height = imgRef.current.naturalHeight || imgRef.current.height;
        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.drawImage(imgRef.current, 0, 0);
          blob = await new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, 'image/png'));
        }
      }
      
      if (blob) {
        await navigator.clipboard.write([new ClipboardItem({ 'image/png': blob })]);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      }
    } catch (err) {
      console.error('Image copy failed', err);
    }
  };

  return (
    <div className="relative group inline-block" style={style}>
      <img ref={imgRef} src={imgSrc} alt={alt} className={className} onError={onImgError} {...props} style={{ width: '100%', height: '100%', objectFit: 'contain' }} crossOrigin="anonymous" />
      <button
        onClick={handleCopy}
        className="absolute top-2 right-2 p-1.5 bg-black/60 text-white rounded opacity-0 group-hover:opacity-100 transition-opacity text-xs flex items-center gap-1 z-10 hover:bg-black/80"
        title="이미지 복사"
      >
        {copied ? (
          <>
            <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>
            복사됨
          </>
        ) : (
          <>
            <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path></svg>
            복사
          </>
        )}
      </button>
    </div>
  );`,
  "return <img src={imgSrc} alt={alt} style={style} className={className} onError={onImgError} {...props} />;"
);


fs.writeFileSync(f1, c1, 'utf8');
console.log('Fixed hooks');
