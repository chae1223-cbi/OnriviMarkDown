const fs = require('fs');
const lines = fs.readFileSync('C:/Users/chae1/.gemini/antigravity/brain/690e02c7-411f-44bb-af94-c6d6d055e67b/.system_generated/logs/transcript_full.jsonl', 'utf8').split('\n');
for (const line of lines) {
  if (line.includes('"type":"USER_INPUT"') && line.includes('profile-1785380903178')) {
    fs.writeFileSync('user_json.txt', line);
    break;
  }
}
