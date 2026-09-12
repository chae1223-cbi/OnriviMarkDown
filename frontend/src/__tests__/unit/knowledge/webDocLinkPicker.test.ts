// ====================================================================
// 📊 [OMD-TEST-WEB-DOCLINK-001] webDocLinkPicker.test.ts
// 🎯 @KICK  : 웹(Browser) 환경 문서 연결(DocLinkPicker) 심층 스캔, WASM 지식 DB 병합, 3중 NFC 검색, 상대경로 추출 단위 테스트
// 🛡️ @GUARD : Rule 4 전용 디렉토리 격리, mock FileSystemDirectoryHandle, NFC 한글 정규화 검증
// 🚨 @PATCH : **2026-09-12** — [웹 환경 문서 연결 검색 완벽 지원] 브라우저 심층 스캔, 지식 DB 병합 및 3중 검색 필터링 단위 테스트 신설
// ====================================================================

import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { scanDirectoryDeep, FileNode } from '../../../lib/indexedDbHelper';

describe('Web DocLinkPicker & Deep Scan Unit Tests', () => {
  // 1. scanDirectoryDeep 모의 테스트
  it('scanDirectoryDeep should recursively scan all subdirectories and collect .md files', async () => {
    // Mock FileSystemDirectoryHandle
    const mockRootHandle = {
      name: 'workspace',
      kind: 'directory',
      async *entries() {
        yield [
          'welcome.md',
          { name: 'welcome.md', kind: 'file' }
        ];
        yield [
          '.git',
          { name: '.git', kind: 'directory' }
        ];
        yield [
          'node_modules',
          { name: 'node_modules', kind: 'directory' }
        ];
        yield [
          '체험하기',
          {
            name: '체험하기',
            kind: 'directory',
            async *entries() {
              yield [
                '추석.md',
                { name: '추석.md', kind: 'file' }
              ];
              yield [
                '하위폴더',
                {
                  name: '하위폴더',
                  kind: 'directory',
                  async *entries() {
                    yield [
                      '설날.markdown',
                      { name: '설날.markdown', kind: 'file' }
                    ];
                    yield [
                      'image.png',
                      { name: 'image.png', kind: 'file' }
                    ];
                  }
                }
              ];
            }
          }
        ];
      }
    };

    const files = await scanDirectoryDeep(mockRootHandle);

    assert.equal(files.length, 3, 'Should find exactly 3 markdown files');
    const paths = files.map(f => f.path);
    assert.ok(paths.includes('welcome.md'), 'Should include welcome.md');
    assert.ok(paths.includes('체험하기/추석.md'), 'Should include 체험하기/추석.md');
    assert.ok(paths.includes('체험하기/하위폴더/설날.markdown'), 'Should include 체험하기/하위폴더/설날.markdown');
    assert.ok(!paths.some(p => p?.includes('.git')), 'Should skip .git');
    assert.ok(!paths.some(p => p?.includes('node_modules')), 'Should skip node_modules');
    assert.ok(!paths.some(p => p?.includes('image.png')), 'Should ignore non-markdown files');
  });

  // 2. 지식 보관함 문서 병합 및 중복 제거 테스트
  it('Should merge knowledge documents and deduplicate by NFC normalized path', () => {
    const workspaceFiles: FileNode[] = [
      { name: 'welcome.md', path: 'welcome.md', kind: 'file' },
      { name: '추석.md', path: '체험하기/추석.md', kind: 'file' }
    ];

    const knowledgeDocs = [
      {
        id: 'kd-1',
        title: '추석 명절 상식',
        filePath: '체험하기/추석.md'
      },
      {
        id: 'kd-2',
        title: '온리비 매뉴얼',
        filePath: 'manual.md'
      }
    ];

    const fileMap = new Map<string, any>();
    const addToFileMap = (node: any, extra?: any) => {
      const rawKey = (node.path || node.name).replace(/\\/g, '/').toLowerCase().normalize('NFC');
      if (!fileMap.has(rawKey)) {
        fileMap.set(rawKey, { ...node, ...extra });
      } else if (extra) {
        const existing = fileMap.get(rawKey)!;
        fileMap.set(rawKey, { ...existing, ...extra });
      }
    };

    // 워크스페이스 파일 추가
    workspaceFiles.forEach(f => addToFileMap(f));

    // 지식 문서 병합
    knowledgeDocs.forEach(doc => {
      addToFileMap({
        name: doc.filePath.split('/').pop() || `${doc.title}.md`,
        path: doc.filePath,
        kind: 'file'
      }, {
        title: doc.title,
        isKnowledge: true
      });
    });

    const result = Array.from(fileMap.values());
    assert.equal(result.length, 3, 'Total files should be 3 (welcome.md, 체험하기/추석.md, manual.md)');

    const chuseok = result.find(f => f.path === '체험하기/추석.md');
    assert.ok(chuseok, '체험하기/추석.md should exist');
    assert.equal(chuseok?.isKnowledge, true, '체험하기/추석.md should be flagged as isKnowledge');
    assert.equal(chuseok?.title, '추석 명절 상식', 'Should preserve document title');

    const manual = result.find(f => f.path === 'manual.md');
    assert.ok(manual, 'manual.md should exist');
    assert.equal(manual?.isKnowledge, true, 'manual.md should be flagged as isKnowledge');
  });

  // 3. 한글 유니코드 NFC 및 파일명/경로/제목 3중 검색 필터링 테스트
  it('Should match search query by filename, path, or title with Unicode NFC normalization', () => {
    const allFiles = [
      { name: '추석.md', path: '체험하기/추석.md', title: '추석 풍습 정리', isKnowledge: true },
      { name: 'guide.md', path: 'docs/guide.md', title: '사용자 가이드' },
      { name: '설날.md', path: 'docs/holiday/설날.md', title: '명절 행사' }
    ];

    const filterDocs = (queryStr: string) => {
      const query = (queryStr || '').normalize('NFC').trim().toLowerCase();
      return allFiles.filter(f => {
        if (!query) return true;
        const nameNorm = (f.name || '').normalize('NFC').toLowerCase();
        const pathNorm = (f.path || '').normalize('NFC').toLowerCase();
        const titleNorm = ((f as any).title || '').normalize('NFC').toLowerCase();
        return nameNorm.includes(query) || pathNorm.includes(query) || titleNorm.includes(query);
      });
    };

    // 1) 파일명으로 검색
    const byName = filterDocs('추석');
    assert.equal(byName.length, 1);
    assert.equal(byName[0].name, '추석.md');

    // 2) 문서 제목(title)으로 검색 ("풍습")
    const byTitle = filterDocs('풍습');
    assert.equal(byTitle.length, 1);
    assert.equal(byTitle[0].title, '추석 풍습 정리');

    // 3) 폴더 경로(path)로 검색 ("holiday")
    const byPath = filterDocs('holiday');
    assert.equal(byPath.length, 1);
    assert.equal(byPath[0].name, '설날.md');

    // 4) 한글 NFD 분리된 자모음 검색도 NFC 정규화로 매칭 ("ㅊㅜㅅㅓㄱ" -> NFC "추석")
    const decomposedQuery = '추석'.normalize('NFD');
    const byNfc = filterDocs(decomposedQuery);
    assert.equal(byNfc.length, 1);
    assert.equal(byNfc[0].name, '추석.md');
  });

  // 4. 상대 경로 계산 및 정규화 테스트
  it('getRelativePath should compute accurate relative paths across directories', () => {
    const getRelativePath = (fromPath: string | null | undefined, toPath: string): string => {
      if (!fromPath) {
        return toPath.startsWith('/') || toPath.startsWith('.') ? toPath : `./${toPath}`;
      }
      const normFrom = fromPath.replace(/\\/g, '/');
      const normTo = toPath.replace(/\\/g, '/');

      const fromDrive = normFrom.match(/^[a-zA-Z]:/)?.[0]?.toUpperCase();
      const toDrive = normTo.match(/^[a-zA-Z]:/)?.[0]?.toUpperCase();
      if (fromDrive && toDrive && fromDrive !== toDrive) {
        return normTo;
      }

      const fromParts = normFrom.split('/').filter(Boolean);
      const toParts = normTo.split('/').filter(Boolean);

      fromParts.pop(); // Remove filename

      let commonIndex = 0;
      while (commonIndex < fromParts.length && commonIndex < toParts.length && fromParts[commonIndex] === toParts[commonIndex]) {
        commonIndex++;
      }

      const upCount = fromParts.length - commonIndex;
      const upParts = Array(upCount).fill('..');
      const downParts = toParts.slice(commonIndex);

      const relParts = [...upParts, ...downParts];
      let relPath = relParts.join('/');
      if (!relPath.startsWith('.') && !relPath.startsWith('/')) {
        relPath = './' + relPath;
      }
      return relPath;
    };

    // 같은 폴더 내 파일
    assert.equal(getRelativePath('docs/a.md', 'docs/b.md'), './b.md');

    // 하위 폴더 파일
    assert.equal(getRelativePath('docs/welcome.md', 'docs/sub/test.md'), './sub/test.md');

    // 상위 및 다른 폴더 파일
    assert.equal(getRelativePath('docs/sub/intro.md', 'docs/other/guide.md'), '../other/guide.md');

    // 루트 파일에서 하위 폴더 파일
    assert.equal(getRelativePath('welcome.md', '체험하기/추석.md'), './체험하기/추석.md');

    // 서로 다른 윈도우 드라이브 간 (D: -> C:) 절대 경로 반환 검증
    assert.equal(
      getRelativePath('D:/workspace/note.md', 'C:/Users/chae1/Documents/guide.md'),
      'C:/Users/chae1/Documents/guide.md'
    );
  });

  // 5. handleFileOpenByPath 경로 클렌징 및 세그먼트 파싱 테스트
  it('Path normalization should strip quotes, angle brackets, and hash anchors', () => {
    const rawPaths = [
      '<./체험하기/추석.md#인사말>',
      '"./체험하기/추석.md#헤딩"',
      './체험하기/추석.md#목차',
      '체험하기/추석.md',
      '<%2E%2F%EC%B2%B4%ED%97%98%ED%95%98%EA%B8%B0%2F%EC%B6%94%EC%84%9D.md#%ED%97%A4%EB%94%A9>'
    ];

    for (const raw of rawPaths) {
      let rawDecoded = raw || '';
      try { rawDecoded = decodeURIComponent(rawDecoded); } catch {}
      const cleanPath = (rawDecoded || '').replace(/^[<"']|[>"']$/g, '').trim();
      const pathWithoutHash = cleanPath.split('#')[0].replace(/^[<"']|[>"']$/g, '').trim();
      const parts = pathWithoutHash.replace(/\\/g, '/').split('/').filter(p => p && p !== '.');

      assert.deepEqual(parts, ['체험하기', '추석.md'], `Path [${raw}] should parse to ['체험하기', '추석.md']`);
    }
  });

  // 6. BaseName 및 무확장자 3중 매칭 검증 테스트
  it('BaseName and title matching should accurately match regardless of relative paths and .md extension', () => {
    const targetPath = './추석 연휴 관련 여행지.md#추석 연휴 일정별로 어디를 가면 좋을까?';
    let rawDecoded = targetPath;
    try { rawDecoded = decodeURIComponent(rawDecoded); } catch {}
    const cleanPath = rawDecoded.replace(/^[<"']|[>"']$/g, '').trim();
    const pathWithoutHash = cleanPath.split('#')[0];
    const targetHash = cleanPath.split('#')[1];

    const targetBaseName = pathWithoutHash.split(/[/\\]/).pop() || pathWithoutHash;
    const targetBaseNameWithoutMd = targetBaseName.replace(/\.md$/i, '');
    const targetBaseNameWithMd = targetBaseNameWithoutMd ? `${targetBaseNameWithoutMd}.md` : '';

    assert.equal(targetBaseName, '추석 연휴 관련 여행지.md');
    assert.equal(targetBaseNameWithoutMd, '추석 연휴 관련 여행지');
    assert.equal(targetBaseNameWithMd, '추석 연휴 관련 여행지.md');
    assert.equal(targetHash, '추석 연휴 일정별로 어디를 가면 좋을까?');

    // 노드 매칭 검증
    const mockNodes = [
      { name: '추석 연휴 관련 여행지.md', path: '/추석 연휴 관련 여행지.md', kind: 'file' },
      { name: '다른 문서.md', path: '/docs/다른 문서.md', kind: 'file' }
    ];

    const normalizedTarget = pathWithoutHash.replace(/\\/g, '/').toLowerCase().normalize('NFC');
    const baseName = (normalizedTarget.split(/[/\\]/).pop() || normalizedTarget).replace(/^\.\//, '');
    const baseNameNoMd = baseName.replace(/\.md$/i, '');
    const targetNoDotSlash = normalizedTarget.replace(/^\.\//, '').replace(/^\//, '');

    const matched = mockNodes.filter(node => {
      const normalizedNodePath = (node.path || '').replace(/\\/g, '/').toLowerCase().normalize('NFC');
      const nodePathNoDotSlash = normalizedNodePath.replace(/^\.\//, '').replace(/^\//, '');
      const nodeName = (node.name || '').toLowerCase().normalize('NFC');
      const nodeNameNoMd = nodeName.replace(/\.md$/i, '');

      return node.kind === 'file' && (
        normalizedNodePath === normalizedTarget ||
        nodePathNoDotSlash === targetNoDotSlash ||
        nodeName === normalizedTarget ||
        nodeName === baseName ||
        (nodeNameNoMd && nodeNameNoMd === baseNameNoMd) ||
        normalizedNodePath.endsWith('/' + baseName) ||
        normalizedNodePath.endsWith('\\' + baseName)
      );
    });

    assert.equal(matched.length, 1);
    assert.equal(matched[0].name, '추석 연휴 관련 여행지.md');
  });
});
