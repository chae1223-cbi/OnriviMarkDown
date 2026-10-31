// ====================================================================
// 📊 [OMD-MCP-AI-TEMPLATES-0001] server/ai-templates.mjs
// 🎯 @KICK  : 로컬 리소스 폴더 AI 템플릿 조회·열람·채팅 실행 입력 구성
// 🛡️ @GUARD : 경로 고정, 심볼릭 링크 거부, 크기 제한, 조회 후 변경 감지
// 🚨 @PATCH : 2026-10-30 — AI 프리셋과 문서 프롬프트를 MCP에서 읽고 실행 입력으로 구성
// ====================================================================
import { createHash } from 'node:crypto';
import { promises as fs } from 'node:fs';
import path from 'node:path';

const MAX_FILE_BYTES = 4 * 1024 * 1024;
const MAX_PROMPT_CHARS = 100_000;
const sha256 = bytes => createHash('sha256').update(bytes).digest('hex');
const sources = { preset: 'ai_presets.json', prompt: 'ai_prompts.json' };

async function loadSource(resourcePath, kind) {
  if (!Object.hasOwn(sources, kind)) throw new Error('kind는 preset 또는 prompt여야 합니다.');
  const folder = path.join(resourcePath, 'prompt');
  const folderStat = await fs.lstat(folder);
  if (!folderStat.isDirectory() || folderStat.isSymbolicLink()) throw new Error('리소스 폴더의 prompt 디렉터리를 확인해 주세요.');
  const file = path.join(folder, sources[kind]);
  const stat = await fs.lstat(file);
  if (!stat.isFile() || stat.isSymbolicLink() || stat.size > MAX_FILE_BYTES) throw new Error('지원하지 않는 AI 템플릿 파일입니다.');
  const bytes = await fs.readFile(file);
  if (bytes.length > MAX_FILE_BYTES || bytes.includes(0)) throw new Error('AI 템플릿 파일의 크기 또는 형식이 올바르지 않습니다.');
  let data;
  try { data = JSON.parse(bytes.toString('utf8').replace(/^\uFEFF/, '')); }
  catch { throw new Error(`${sources[kind]}의 JSON 형식이 올바르지 않습니다.`); }
  if (kind === 'preset' && !Array.isArray(data)) throw new Error('AI 프리셋은 배열이어야 합니다.');
  if (kind === 'prompt' && (!data || typeof data !== 'object' || Array.isArray(data))) throw new Error('AI 문서 템플릿은 분야별 객체여야 합니다.');
  return { data, sha256: sha256(bytes), file };
}

function itemsFor(kind, data) {
  if (kind === 'preset') return data.map((row, index) => {
    if (!row || typeof row !== 'object' || Array.isArray(row)) throw new Error('AI 프리셋 항목의 형식이 올바르지 않습니다.');
    return { kind, id: String(row.id || `preset-${index}`), name: String(row.name || '이름 없음'), folder: String(row.folder || '') };
  });
  const rows = [];
  for (const [domain, group] of Object.entries(data)) {
    if (!group || typeof group !== 'object' || Array.isArray(group)) throw new Error('AI 문서 템플릿 분야의 형식이 올바르지 않습니다.');
    for (const [docType, template] of Object.entries(group)) {
      if (!template || typeof template !== 'object' || Array.isArray(template)) throw new Error('AI 문서 템플릿 항목의 형식이 올바르지 않습니다.');
      rows.push({ kind, domain, docType, name: docType });
    }
  }
  return rows;
}

export async function listAITemplates(resourcePath, { kind, query = '', limit = 50, offset = 0 } = {}) {
  if (kind !== undefined && !Object.hasOwn(sources, kind)) throw new Error('kind는 preset 또는 prompt여야 합니다.');
  if (typeof query !== 'string' || query.length > 100) throw new Error('검색어는 100자 이하여야 합니다.');
  if (!Number.isInteger(limit) || limit < 1 || limit > 100) throw new Error('limit은 1~100 사이의 정수여야 합니다.');
  if (!Number.isInteger(offset) || offset < 0 || offset > 10000) throw new Error('offset은 0~10000 사이의 정수여야 합니다.');
  const kinds = kind ? [kind] : ['preset', 'prompt'];
  const sourcesFound = [];
  const items = [];
  for (const current of kinds) {
    let source;
    try { source = await loadSource(resourcePath, current); }
    catch (error) { if (error.code === 'ENOENT') continue; throw error; }
    sourcesFound.push({ kind: current, sha256: source.sha256 });
    items.push(...itemsFor(current, source.data).map(item => ({ ...item, sha256: source.sha256 })));
  }
  const needle = query.trim().toLocaleLowerCase();
  const filtered = needle ? items.filter(item => `${item.name} ${item.folder || ''} ${item.domain || ''}`.toLocaleLowerCase().includes(needle)) : items;
  return { sources: sourcesFound, items: filtered.slice(offset, offset + limit), total: filtered.length, nextOffset: offset + limit < filtered.length ? offset + limit : null };
}

export async function getAITemplate(resourcePath, { kind, id, domain, docType } = {}) {
  const source = await loadSource(resourcePath, kind);
  if (kind === 'preset') {
    if (typeof id !== 'string' || !id.trim()) throw new Error('프리셋 ID를 지정하세요.');
    const matches = source.data.map((row, index) => ({ row, key: String(row?.id || `preset-${index}`) })).filter(item => item.key === id);
    if (matches.length !== 1) throw new Error('해당 프리셋을 고유하게 찾지 못했습니다.');
    const { row } = matches[0];
    const prompt = row.editorialCommand || (row.systemPrompt ? `[작성 규칙]\n${row.systemPrompt}\n\n[입력 데이터]\n${row.userPrompt || row.userInputTemplate || ''}` : '');
    if (typeof prompt !== 'string' || !prompt.trim()) throw new Error('프리셋에 실행할 명령이 없습니다.');
    return { kind, id, name: String(row.name || '이름 없음'), folder: String(row.folder || ''), prompt, variables: [...new Set([...prompt.matchAll(/\{\{([^{}\n]{1,60})\}\}/g)].map(match => match[1]))], sha256: source.sha256 };
  }
  if (typeof domain !== 'string' || !domain || typeof docType !== 'string' || !docType) throw new Error('분야와 문서 종류를 지정하세요.');
  const row = source.data[domain]?.[docType];
  if (!row || typeof row.systemPrompt !== 'string' || typeof row.userInputTemplate !== 'string') throw new Error('문서 템플릿을 찾지 못했거나 형식이 올바르지 않습니다.');
  return { kind, domain, docType, name: docType, systemPrompt: row.systemPrompt, userInputTemplate: row.userInputTemplate, sha256: source.sha256 };
}

export async function executeAITemplate(resourcePath, { kind, id, domain, docType, expectedSha256, values = {}, input = '' } = {}) {
  if (!/^[a-f0-9]{64}$/i.test(expectedSha256 || '')) throw new Error('get_ai_template에서 받은 SHA-256 값이 필요합니다.');
  if (!values || typeof values !== 'object' || Array.isArray(values) || Object.values(values).some(value => typeof value !== 'string')) throw new Error('values에는 문자열 값만 넣어 주세요.');
  if (typeof input !== 'string') throw new Error('input은 문자열이어야 합니다.');
  const template = await getAITemplate(resourcePath, { kind, id, domain, docType });
  if (template.sha256 !== expectedSha256.toLowerCase()) throw new Error('AI 템플릿이 조회 후 변경되었습니다. 다시 열람해 주세요.');
  let prompt;
  if (kind === 'preset') {
    prompt = template.prompt.replace(/\{\{([^{}\n]{1,60})\}\}/g, (_match, key) => {
      if (!values[key]?.trim()) throw new Error(`${key} 값을 입력해 주세요.`);
      return values[key];
    });
    if (input.trim()) prompt += `\n\n[사용자 입력]\n${input}`;
  } else {
    if (!input.trim()) throw new Error('문서 템플릿 실행에는 input이 필요합니다.');
    prompt = `${template.systemPrompt}\n\n[입력 항목]\n${template.userInputTemplate}\n\n[사용자 입력]\n${input}`;
  }
  if (prompt.length > MAX_PROMPT_CHARS) throw new Error('실행할 템플릿과 입력이 너무 깁니다.');
  return { kind, name: template.name, prompt, sha256: template.sha256, execution: 'host_ai', note: '이 MCP는 앱의 AI 키를 사용하지 않습니다. 호출한 채팅 AI가 이 입력을 바탕으로 답변을 생성합니다.' };
}
