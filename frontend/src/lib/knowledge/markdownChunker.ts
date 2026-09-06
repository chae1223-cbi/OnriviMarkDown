// ====================================================================
// 📊 [OMD-CORE-markdownChunker-0001] markdownChunker.ts ➔ Markdown Semantic Chunker
// 🎯 @KICK  : 마크다운 텍스트를 AST/헤딩 구조 기반으로 분석하여 라인 범위 및 heading_path를 보존하는 청크 배열로 분할
// 🛡️ @GUARD : 헤딩 없는 서두 문단 처리, 150줄 초과 대형 섹션 2차 분할, 빈 문서 방어
// 🚨 @PATCH : **2026-09-04** — [ONRIVI-KNOWLEDGE-ENGINE-002.1] heading_path 계층 구조 추적 및 대형 섹션 문단 분할 청커 최초 구현
// 🔗 @CALLS : 없음
// ====================================================================

import type { DocumentChunk } from '../../types/knowledge';

export interface RawChunkResult {
  chunkIndex: number;
  headingTitle: string;
  headingLevel: number;
  headingPath: string;
  startLine: number;
  endLine: number;
  chunkText: string;
}

const MAX_SECTION_LINES = 150; // 150줄 초과 시 2차 분할

/**
 * 마크다운 원문을 헤딩 구조 및 라인 범위 기반 청크로 분할합니다.
 */
export function chunkMarkdownByHeadings(
  documentId: string,
  markdownText: string
): DocumentChunk[] {
  if (!markdownText || !markdownText.trim()) {
    return [];
  }

  const lines = markdownText.split('\n');
  const totalLines = lines.length;

  interface SectionBoundary {
    headingTitle: string;
    headingLevel: number;
    headingPath: string;
    startLine: number; // 1-indexed
    endLine: number;
  }

  const boundaries: SectionBoundary[] = [];
  const headingStack: { level: number; title: string }[] = [];

  let currentSection: {
    headingTitle: string;
    headingLevel: number;
    headingPath: string;
    startLine: number;
  } = {
    headingTitle: '개요 (서론)',
    headingLevel: 0,
    headingPath: '개요',
    startLine: 1,
  };

  const headingRegex = /^(#{1,6})\s+(.+)$/;

  for (let i = 0; i < totalLines; i++) {
    const line = lines[i];
    const match = line.match(headingRegex);

    if (match) {
      const level = match[1].length;
      const title = match[2].trim();

      // 이전 섹션이 존재하면 경계 닫기
      if (i > 0 && i >= currentSection.startLine) {
        boundaries.push({
          ...currentSection,
          endLine: i, // 헤딩 직전 줄까지
        });
      }

      // 헤딩 스택 갱신 (트리 경로 유지)
      while (headingStack.length > 0 && headingStack[headingStack.length - 1].level >= level) {
        headingStack.pop();
      }
      headingStack.push({ level, title });

      const headingPath = headingStack.map(h => h.title).join(' > ');

      currentSection = {
        headingTitle: title,
        headingLevel: level,
        headingPath,
        startLine: i + 1, // 1-indexed
      };
    }
  }

  // 마지막 섹션 닫기
  boundaries.push({
    ...currentSection,
    endLine: totalLines,
  });

  // 빈 청크 필터링 및 대형 섹션 2차 분할
  const rawChunks: RawChunkResult[] = [];
  let chunkCounter = 0;

  for (const b of boundaries) {
    const sectionLines = lines.slice(b.startLine - 1, b.endLine);
    const text = sectionLines.join('\n').trim();

    if (!text) continue; // 빈 줄만 있는 섹션 스킵

    const lineCount = b.endLine - b.startLine + 1;

    if (lineCount <= MAX_SECTION_LINES) {
      rawChunks.push({
        chunkIndex: chunkCounter++,
        headingTitle: b.headingTitle,
        headingLevel: b.headingLevel,
        headingPath: b.headingPath,
        startLine: b.startLine,
        endLine: b.endLine,
        chunkText: text,
      });
    } else {
      // 150줄 초과 대형 섹션: 문단(\n\n) 단위 2차 분할
      let subStartLine = b.startLine;
      let currentSubLines: string[] = [];

      for (let j = 0; j < sectionLines.length; j++) {
        const curLine = sectionLines[j];
        currentSubLines.push(curLine);

        const isLastLine = j === sectionLines.length - 1;
        const reachedLimit = currentSubLines.length >= 100;
        const isParagraphBreak = curLine.trim() === '' && reachedLimit;

        if (isParagraphBreak || isLastLine) {
          const subEndLine = b.startLine + j;
          const subText = currentSubLines.join('\n').trim();

          if (subText) {
            rawChunks.push({
              chunkIndex: chunkCounter++,
              headingTitle: b.headingTitle,
              headingLevel: b.headingLevel,
              headingPath: `${b.headingPath} (Part ${rawChunks.length + 1})`,
              startLine: subStartLine,
              endLine: subEndLine,
              chunkText: subText,
            });
          }

          subStartLine = subEndLine + 1;
          currentSubLines = [];
        }
      }
    }
  }

  return rawChunks.map((rc, idx) => ({
    id: `${documentId}_chunk_${idx}`,
    documentId,
    chunkIndex: rc.chunkIndex,
    headingTitle: rc.headingTitle,
    headingLevel: rc.headingLevel,
    headingPath: rc.headingPath,
    startLine: rc.startLine,
    endLine: rc.endLine,
    chunkText: rc.chunkText,
  }));
}
