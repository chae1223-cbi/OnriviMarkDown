const fs = require('fs');
const f = 'd:/Developer/OnriviMarkDown/OnriviMarkDown/frontend/src/components/AIDraftModal.tsx';
let c = fs.readFileSync(f, 'utf8');

c = c.replace(
  /const \[ignoreContext, setIgnoreContext\] = useState\(false\);/,
  'const [ignoreContext, setIgnoreContext] = useState(true);'
);

c = c.replace(
  /setTargetScope\('selection'\);\s*setIgnoreContext\(false\);\s*setAttachedFileName\(''\);/,
  "setTargetScope('selection');\n    setIgnoreContext(true);\n    setAttachedFileName('');"
);

c = c.replace(
  /useEffect\(\(\) => \{\s*try \{\s*const cached = localStorage\.getItem\(AI_DRAFT_CACHE_KEY\);\s*if \(cached\) \{\s*const data = JSON\.parse\(cached\);\s*if \(data\.editorialCommand\) setEditorialCommand\(data\.editorialCommand\);\s*if \(data\.targetScope\) setTargetScope\(data\.targetScope\);\s*\}\s*\} catch\(e\) \{\}\s*\}, \[\]\);/,
  `useEffect(() => {
    // [OMD-EDIT-AI] AI 모달 열릴 때 무조건 초기화 (캐시 로드 방지)
    localStorage.removeItem(AI_DRAFT_CACHE_KEY);
  }, []);`
);

fs.writeFileSync(f, c, 'utf8');
console.log('Fixed AIDraftModal');
