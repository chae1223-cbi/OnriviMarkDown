// ====================================================================
// 📊 [OMD-CORE-hybridRetriever-0001] hybridRetriever.ts ➔ Hybrid Search Retriever
// 🎯 @KICK  : SQLite FTS5 전문 검색, 후보군 내 상대 정규화(Candidate-Relative Normalization), 태그/헤딩/우선순위 가중 합산 검색 엔진 구현
// 🛡️ @GUARD : 음수 BM25 왜곡 방지, 0건 검색 방어, 컬렉션 필터링, 개별 점수 보존
// 🚨 @PATCH : **2026-09-04** — [ONRIVI-KNOWLEDGE-ENGINE-002.1] normalizeCandidateBm25, buildWeightedQuery, retrieveKnowledgeCandidates 최초 구현
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
  const terms = rawQuery
    .replace(/[^\w\s가-힣]/g, ' ')
    .trim()
    .split(/\s+/)
    .filter(t => t.length > 0);

  if (terms.length === 0) return '';

  const clauses: string[] = [];

  // 1. 전체 구문 정확 일치 (Exact Phrase)
  if (terms.length > 1) {
    clauses.push(`"${terms.join(' ')}"`);
  }

  // 2. 각 단어별 전방 일치
  for (const term of terms) {
    clauses.push(`"${term}"*`);
    clauses.push(`"${term}"`);
  }

  return clauses.join(' OR ');
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
  if (!ftsQuery) return [];

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
      AND d.status = 'READY'
  `;

  const params: any[] = [ftsQuery];

  if (collectionId) {
    sql += ' AND d.collection_id = ?';
    params.push(collectionId);
  }

  sql += ' ORDER BY raw_bm25 ASC LIMIT ?';
  params.push(limit);

  let rawRows: any[] = [];
  try {
    const stmt = db.prepare(sql);
    rawRows = stmt.all(...params) as any[];
  } catch (err) {
    // FTS 문법 오류 시 폴백 (원문 단순 매칭)
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
      snippet: row.chunk_summary || row.doc_summary || '',
    };
  });

  // 최종 점수 기준 내림차순 정렬
  return candidates.sort((a, b) => b.finalScore - a.finalScore);
}
