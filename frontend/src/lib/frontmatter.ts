/**
 * frontmatter.ts
 * 마크다운 파일 최상단의 YAML 메타데이터(Frontmatter)를 파싱하고 업데이트하는 유틸리티
 */

const FRONTMATTER_REGEX = /^---\s*\n([\s\S]*?)\n---\s*(\n|$)/;

export interface FrontmatterData {
  css_profile?: string;
  [key: string]: string | undefined;
}

/**
 * 텍스트에서 Frontmatter 영역과 순수 마크다운 영역을 분리하여 파싱합니다.
 * @param content 전체 마크다운 텍스트
 * @returns { content: 순수 마크다운 텍스트, data: 파싱된 키-값 쌍 }
 */
export function extractFrontmatter(content: string): { content: string; data: FrontmatterData } {
  const match = content.match(FRONTMATTER_REGEX);
  if (!match) return { content, data: {} };
  
  const rawYaml = match[1];
  const restContent = content.slice(match[0].length);
  
  const data: FrontmatterData = {};
  const lines = rawYaml.split('\n');
  for (const line of lines) {
    const colonIdx = line.indexOf(':');
    if (colonIdx !== -1) {
      const key = line.slice(0, colonIdx).trim();
      const value = line.slice(colonIdx + 1).trim();
      data[key] = value;
    }
  }
  
  return { content: restContent, data };
}

/**
 * 주어진 텍스트의 Frontmatter에 css_profile 값을 주입하거나 업데이트합니다.
 * @param content 전체 마크다운 텍스트
 * @param profileId 새롭게 지정할 서식 ID
 * @returns 업데이트된 새로운 마크다운 텍스트
 */
export function updateCssProfileInFrontmatter(content: string, profileId: string): string {
  const { data, content: restContent } = extractFrontmatter(content);
  
  // Update or set the profile ID
  data['css_profile'] = profileId;
  
  // Reconstruct frontmatter
  let newYaml = '---\n';
  for (const [k, v] of Object.entries(data)) {
    if (v !== undefined) {
      newYaml += `${k}: ${v}\n`;
    }
  }
  newYaml += '---\n\n';
  
  return newYaml + restContent;
}
