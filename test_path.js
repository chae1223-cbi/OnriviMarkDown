const freshRF = 'D:\\Onrivi_Asset';
const pureSrc = '/media/image_1785452841606.png';

const sep = freshRF.includes('\\') ? '\\' : '/';
const cleanRoot = freshRF.endsWith(sep) ? freshRF.slice(0, -1) : freshRF;
const normalizedSrc = sep === '\\' ? pureSrc.replace(/\//g, '\\') : pureSrc;
const absolutePath = cleanRoot + normalizedSrc;

console.log('sep:', sep);
console.log('cleanRoot:', cleanRoot);
console.log('normalizedSrc:', normalizedSrc);
console.log('absolutePath:', absolutePath);
