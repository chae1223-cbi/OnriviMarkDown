import { readDocument, replaceDocument } from './documents.mjs';

const tools = [
  {
    name: 'read_markdown',
    description: '절대경로로 로컬 .md 또는 .markdown 파일을 읽고, 안전한 수정을 위한 내용과 SHA-256 값을 반환합니다.',
    inputSchema: { type: 'object', properties: { path: { type: 'string', description: '로컬 마크다운 파일의 절대경로' } }, required: ['path'], additionalProperties: false }
  },
  {
    name: 'replace_markdown',
    description: '이전에 읽은 SHA-256 값이 현재 파일과 같을 때만 로컬 마크다운 파일의 전체 내용을 교체합니다.',
    inputSchema: { type: 'object', properties: { path: { type: 'string' }, expectedSha256: { type: 'string' }, content: { type: 'string' } }, required: ['path', 'expectedSha256', 'content'], additionalProperties: false }
  }
];

function reply(id, result) { process.stdout.write(JSON.stringify({ jsonrpc: '2.0', id, result }) + '\n'); }
function error(id, code, message) { process.stdout.write(JSON.stringify({ jsonrpc: '2.0', id, error: { code, message } }) + '\n'); }

async function dispatch(message) {
  if (!message || message.jsonrpc !== '2.0') return;
  const { id, method, params = {} } = message;
  if (id === undefined) return;
  try {
    if (method === 'initialize') return reply(id, { protocolVersion: params.protocolVersion ?? '2025-06-18', capabilities: { tools: {} }, serverInfo: { name: 'onrivi-author-local', version: '0.1.1' } });
    if (method === 'ping') return reply(id, {});
    if (method === 'tools/list') return reply(id, { tools });
    if (method === 'tools/call') {
      try {
        const result = params.name === 'read_markdown'
          ? await readDocument(params.arguments?.path)
          : params.name === 'replace_markdown'
            ? await replaceDocument(params.arguments?.path, params.arguments?.expectedSha256, params.arguments?.content)
            : null;
        if (!result) return error(id, -32602, '알 수 없는 도구입니다.');
        return reply(id, { content: [{ type: 'text', text: JSON.stringify(result) }], structuredContent: result });
      } catch (cause) {
        return reply(id, { isError: true, content: [{ type: 'text', text: cause.message }] });
      }
    }
    return error(id, -32601, 'Method not found.');
  } catch (cause) { return error(id, -32603, cause.message); }
}

let pending = '';
let queue = Promise.resolve();
process.stdin.setEncoding('utf8');
process.stdin.on('data', (chunk) => {
  pending += chunk;
  let newline;
  while ((newline = pending.indexOf('\n')) !== -1) {
    const line = pending.slice(0, newline).trim();
    pending = pending.slice(newline + 1);
    if (line) {
      try {
        const message = JSON.parse(line);
        queue = queue.then(() => dispatch(message)).catch((cause) => process.stderr.write(`${cause.message}\n`));
      }
      catch { process.stderr.write('Invalid JSON-RPC message\n'); }
    }
  }
});
