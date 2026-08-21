const fs = require('fs');
const f1 = 'd:/Developer/OnriviMarkDown/OnriviMarkDown/frontend/src/components/MarkdownViewer.tsx';
let c1 = fs.readFileSync(f1, 'utf8');

const replacement = `
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
  );
`;

c1 = c1.replace(
  "return <img src={imgSrc} alt={alt} style={style} className={className} onError={onImgError} {...props} />;",
  replacement
);

fs.writeFileSync(f1, c1, 'utf8');
console.log('Fixed img copy');
