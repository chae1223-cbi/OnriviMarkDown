// ====================================================================
// 📊 [OMD-CORE-hybridRetriever-0001] hybridRetriever.ts ➔ Hybrid Search Retriever
// 🎯 @KICK  : SQLite FTS5 전문 검색, 후보군 내 상대 정규화(Candidate-Relative Normalization), 태그/헤딩/우선순위 가중 합산 검색 엔진 구현
// 🛡️ @GUARD : 음수 BM25 왜곡 방지, 0건 검색 방어, 컬렉션 필터링, 개별 점수 보존
// 🚨 @PATCH : **2026-09-12** — [무관한 문서 오매칭 및 0건 임의 폴백 전면 제거 / 정밀 키워드 FTS5 검색 확립]
//             1) 사용자 요구 반영("상관없는 문서가 나오지 않아야 정상"): FTS 0건 검색 시 최신 문서를 임의로 가져오던 fallbackSql 전면 영구 제거
//             2) 한국어 프롬프트 서술/요청 동사(기술해줘, 기술, 서술, 써줘 등) 불용어 필터링 완전 추가로 엉뚱한 개발 규약/문서 오매칭 원천 차단
//             3) 복합 검색어 대상 FTS5 AND 결합(`"${t}"* AND "${t2}"*`) 적용으로 모든 핵심어가 존재하는 경우에만 매칭되도록 검색 정밀도 대폭 격상
// 🚨 @PATCH : **2026-09-12** — [하이브리드 지식 검색 엔진 고도화: chunk_text 전체 발췌, 한국어 조사/불용어 필터링, 활성 청크 다중 상태 지원]
//             1) buildFtsQuery에서 한국어 조사 및 대화형 불용어를 정제하여 구어체 질의에서도 핵심 명사 키워드가 정확히 추출되도록 개선
//             2) document_chunks의 chunk_text 원문 컬럼을 추출하여 단순 요약문이 아닌 실제 청크 본문이 RAG 프롬프트에 주입되도록 보강
//             **2026-09-04** — [ONRIVI-KNOWLEDGE-ENGINE-002.1] normalizeCandidateBm25, buildWeightedQuery, retrieveKnowledgeCandidates 최초 구현
// 🔗 @CALLS : node:sqlite, ../../types/knowledge.ts
// ====================================================================

import type { RetrievalCandidate, KnowledgeQuery } from '../../types/knowledge';

/**
 * FTS5 BM25 점수(작을수록 우수)를 Top-K 후보군 내에서 0~100 스케일로 상대 정규화합니다.
 */
export function normalizeCandidateBm25(candidates: Array<{ rawBm25: number }>): number[] {
  if (candidates.length === 0) return [];
  if (candidates.length === 1) return [100];

  const scores = candidates.map(c => c.rawBm25);
  const best = Math.min(...scores);   // FTS5는 작을수록 높은 일치도
  const worst = Math.max(...scores);

  if (best === worst) {
    return candidates.map(() => 100);
  }

  // Best = 100점, Worst = 0점
  return scores.map(score => {
    const normalized = ((worst - score) / (worst - best)) * 100;
    return Math.max(0, Math.min(100, Math.round(normalized * 10) / 10));
  });
}

/**
 * 사용자 질의어를 분해하여 정확 일치 및 전방 일치 구문을 조합합니다.
 */
export function buildFtsQuery(rawQuery: string): string {
  const rawTerms = rawQuery
    .replace(/[^\w\s가-힣]/g, ' ')
    .trim()
    .split(/\s+/)
    .filter(t => t.length > 0);

  if (rawTerms.length === 0) return '';

  const termsSet = new Set<string>();
  const josaRegex = /(은|는|이|가|을|를|의|에|에게|에서|로|으로|와|과|도|만|처럼|같이|부터|까지|하고|하여|해서|해줘|해줄래|해주세요|인|인스턴스)?$/;
  const conversationalStopwords = new Set([
    '작성', '작성해', '작성해줘', '작성해줄래', '작성해주세요', '작성하기', '작성된',
    '기술', '기술해', '기술해줘', '기술해줄래', '기술해주세요', '기술하기', '기술한', '기술된',
    '서술', '서술해', '서술해줘', '서술해줄래', '서술해주세요', '서술하기', '서술한', '서술된',
    '설명', '설명해', '설명해줘', '설명해줄래', '설명해주세요', '설명하기', '설명된',
    '알려줘', '알려줄래', '알려주세요', '알려', '알려주기',
    '찾아줘', '찾아줄래', '찾아주세요', '검색', '검색해', '검색해줘', '검색해주세요',
    '가르쳐줘', '가르쳐주세요', '가르쳐',
    '요약', '요약해', '요약해줘', '요약해주세요', '요약하기',
    '정리', '정리해', '정리해줘', '정리해주세요', '정리하기',
    '말해줘', '말해줄래', '말해주세요', '이야기', '이야기해줘',
    '적어줘', '적어줄래', '적어주세요', '써줘', '써주세요', '써줄래', '쓰기',
    '소개', '소개해', '소개해줘', '소개해주세요', '소개하는',
    '추천', '추천해', '추천해줘', '추천해주세요',
    '비교', '비교해', '비교해줘', '비교해주세요',
    '분석', '분석해', '분석해줘', '분석해주세요',
    '안내', '안내해', '안내해줘', '안내해주세요',
    '답변', '답변해', '답변해줘', '답변해주세요', '답해줘',
    '보여줘', '보여주세요', '출력', '출력해', '출력해줘',
    '부탁', '부탁해', '부탁해요', '부탁드립니다',
    '관련', '관련된', '관련한', '관해서', '관하여', '관한', '관해',
    '대해', '대해서', '대하여', '대한',
    '내용', '글', '글을', '문서', '자료', '정보', '항목', '방법', '방식',
    '무엇', '어떤', '어떻게', '있는', '있는지', '새로운', '가장', '위', '아래', '통해', '위해',
    '대략', '자세히', '상세히', '친절히', '간단히', '명확히', '모두', '전부'
  ]);

  for (const t of rawTerms) {
    const lower = t.toLowerCase();
    const stripped = lower.replace(josaRegex, '');
    if (conversationalStopwords.has(lower) || conversationalStopwords.has(stripped)) {
      continue;
    }
    if (stripped.length >= 2) {
      termsSet.add(stripped);
    } else if (lower.length >= 2 && !conversationalStopwords.has(lower)) {
      termsSet.add(lower);
    }
  }

  const terms = Array.from(termsSet);
  if (terms.length === 0) return '';

  // 1. 복합 검색어일 경우: 전체 구문 일치 또는 핵심어 전체 AND 결합을 최우선 적용하여 무관 문서 유입 차단
  if (terms.length > 1) {
    const phrase = `"${terms.join(' ')}"`;
    const andGroup = terms.map(t => `"${t}"*`).join(' AND ');
    return `(${phrase}) OR (${andGroup})`;
  }

  // 2. 단일 검색어: 전방 일치 및 정확 일치
  return `"${terms[0]}"* OR "${terms[0]}"`;
}

/**
 * SQLite 지식 DB에서 하이브리드 검색을 수행하여 순위화된 후보 청크 배열을 반환합니다.
 */
export function retrieveKnowledgeCandidates(
  db: any,
  queryParams: KnowledgeQuery
): RetrievalCandidate[] {
  const { query, collectionId, limit = 20 } = queryParams;
  if (!query || !query.trim()) return [];

  const ftsQuery = buildFtsQuery(query);

  let rawRows: any[] = [];

  if (ftsQuery) {
    // FTS5 매칭 쿼리 (documents 조인 및 컬렉션 필터 적용)
    let sql = `
      SELECT 
        c.id AS chunk_id,
        c.document_id,
        c.heading_title,
        c.heading_path,
        c.start_line,
        c.end_line,
        c.chunk_summary,
        c.chunk_text,
        d.file_path,
        d.title AS document_title,
        d.file_hash,
        d.priority,
        d.summary AS doc_summary,
        bm25(document_chunks_fts) AS raw_bm25
      FROM document_chunks_fts fts
      JOIN document_chunks c ON fts.chunk_id = c.id
      JOIN knowledge_documents d ON c.document_id = d.id
      WHERE document_chunks_fts MATCH ?
        AND UPPER(d.status) IN ('READY', 'ACTIVE', 'INDEXED')
    `;

    const params: any[] = [ftsQuery];

    if (collectionId) {
      sql += ' AND d.collection_id = ?';
      params.push(collectionId);
    }

    sql += ' ORDER BY raw_bm25 ASC LIMIT ?';
    params.push(limit);

    try {
      const stmt = db.prepare(sql);
      rawRows = stmt.all(...params) as any[];
    } catch (err) {
      // FTS 문법 오류 시 폴백
      rawRows = [];
    }
  }

  // 매칭된 행이 0건이면 임의 문서를 폴백하지 않고 깨끗하게 빈 배열 반환 (사용자 의도: 안 나와야 정상)
  if (rawRows.length === 0) {
    return [];
  }

  if (rawRows.length === 0) return [];

  // 1. BM25 상대 정규화 (0~100)
  const normalizedBm25Scores = normalizeCandidateBm25(
    rawRows.map(r => ({ rawBm25: Number(r.raw_bm25) }))
  );

  // 2. 복합 점수 산출
  const queryWords = query.toLowerCase().split(/\s+/).filter(Boolean);

  const candidates: RetrievalCandidate[] = rawRows.map((row, idx) => {
    const normalizedFtsScore = normalizedBm25Scores[idx];

    // 태그 관련도 점수 조회
    const tagStmt = db.prepare(`
      SELECT score FROM document_tags 
      WHERE document_id = ? 
      ORDER BY score DESC LIMIT 1
    `);
    const tagRow = tagStmt.get(row.document_id) as any;
    const tagScore = tagRow ? Number(tagRow.score) : 50;

    // 헤딩 일치 점수 (헤딩 텍스트에 검색어가 포함되어 있는지)
    const headingText = String(row.heading_path || row.heading_title || '').toLowerCase();
    const headingMatches = queryWords.filter(w => headingText.includes(w)).length;
    const headingScore = queryWords.length > 0 
      ? Math.min(100, Math.round((headingMatches / queryWords.length) * 100))
      : 0;

    // 사용자 지정 중요도 (1~5★ -> 20~100점)
    const priorityScore = Math.min(100, Math.max(20, Number(row.priority || 3) * 20));

    // 최종 복합 점수: FTS 50% + Tag 25% + Heading 15% + Priority 10%
    const finalScore = Math.round(
      (normalizedFtsScore * 0.50) +
      (tagScore * 0.25) +
      (headingScore * 0.15) +
      (priorityScore * 0.10)
    );

    return {
      documentId: row.document_id,
      chunkId: row.chunk_id,
      filePath: row.file_path,
      documentTitle: row.document_title || row.heading_title,
      headingTitle: row.heading_title,
      headingPath: row.heading_path,
      startLine: Number(row.start_line),
      endLine: Number(row.end_line),
      fileHash: row.file_hash,
      rawBm25: Number(row.raw_bm25),
      normalizedFtsScore,
      tagScore,
      headingScore,
      priorityScore,
      finalScore,
      score: finalScore,
      snippet: row.chunk_text || row.chunk_summary || row.doc_summary || '',
    };
  });

  // 최종 점수 기준 내림차순 정렬
  return candidates.sort((a, b) => b.finalScore - a.finalScore);
}
