const OpenAI = require('openai');
const fs = require('fs');
const path = require('path');

const SECRETS_PATH = path.join(__dirname, '..', 'secrets.json');

function loadApiKey() {
  const envKey = process.env.OPENAI_API_KEY;
  if (envKey) return envKey;
  if (fs.existsSync(SECRETS_PATH)) {
    try {
      const secrets = JSON.parse(fs.readFileSync(SECRETS_PATH, 'utf-8'));
      if (secrets.OPENAI_API_KEY) return secrets.OPENAI_API_KEY;
    } catch (e) {}
  }
  return null;
}

const SYSTEM_PROMPT = `당신은 블로그 콘텐츠를 작성하는 전문 에디터입니다.
다음 조건을 만족하는 한국어 블로그 글을 작성하세요.

- 말투: 친근하지만 전문적인 설명형
- 대상 독자: 일반 독자
- SEO를 고려해, 자연스러운 키워드 반복 포함
- 구조:
  1) 강렬한 도입부 (문제 제기, 공감)
  2) 본문을 3~6개의 소제목으로 나누어 서술
  3) 정리 및 한 줄 결론
  4) 마지막에 독자에게 질문 1개 던지기

또한 아래 3가지를 반드시 만들어 주세요:
1) 블로그 글 제목 1개 (클릭을 유도하는 형태)
2) 본문 (마크다운 형식, #, ## 등 사용)
3) 태그 후보 5~10개 (쉼표로 구분)

출력 형식은 JSON 형식으로 해주세요:
{
  "title": "...",
  "content_markdown": "...",
  "tags": ["...", "..."]
}`;

async function generatePost({ keyword, category, tone, length }) {
  const apiKey = loadApiKey();
  if (!apiKey) {
    throw new Error('OpenAI API 키가 설정되지 않았습니다. backend/secrets.json에 OPENAI_API_KEY를 추가하세요.');
  }

  const openai = new OpenAI({ apiKey });

  const lengthDesc = length === 'short' ? '짧은 글 (1500자 내외)' :
    length === 'medium' ? '중간 길이 글 (2000~3000자)' :
    '긴 글 (3000~5000자)';

  const userPrompt = `[키워드/주제]
${keyword}

${category ? `[카테고리]\n${category}\n` : ''}
${tone ? `[말투]\n${tone}\n` : ''}
위 정보를 바탕으로 블로그 글을 작성해 주세요.`;

  const response = await openai.chat.completions.create({
    model: 'gpt-4o-mini',
    messages: [
      { role: 'system', content: SYSTEM_PROMPT },
      { role: 'user', content: userPrompt.trim() },
    ],
    temperature: 0.7,
  });

  let content = response.choices[0].message.content || '';
  let clean = content.trim();
  clean = clean.replace(/^```json\n?/i, '').replace(/^```\n?/, '').replace(/\n?```$/i, '');
  clean = clean.replace(/\u2028/g, '\\n').replace(/\u2029/g, '\\n');

  const data = JSON.parse(clean);
  return {
    title: (data.title || '').trim(),
    content_markdown: (data.content_markdown || '').trim(),
    tags: data.tags || [],
  };
}

module.exports = { generatePost };
