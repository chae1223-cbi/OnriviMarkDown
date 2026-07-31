const fs = require('fs');
const lines = fs.readFileSync('C:/Users/chae1/.gemini/antigravity/brain/690e02c7-411f-44bb-af94-c6d6d055e67b/.system_generated/logs/transcript_full.jsonl', 'utf8').split('\n');
for (const line of lines) {
  if (line.includes('"type":"USER_INPUT"') && line.includes('이것을 분석해서 내보내기에 지금 서식에 빠져있는게 있는지 확인해줘')) {
    fs.writeFileSync('user_json.txt', line);
    break;
  }
}
