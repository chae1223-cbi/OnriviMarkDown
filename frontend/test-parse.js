const text = `
본문 1
[^1]: 각주 1
본문 2
[^2]: 각주 2
    이어진 각주 2
  
본문 3
`;

const lines = text.split('\n');
let newLines = [];
let footnotes = [];
let currentFootnote = null;
let maxNumber = 0;

for (let i = 0; i < lines.length; i++) {
  const line = lines[i];
  const fnMatch = line.match(/^\[\^(\d+)\]:(.*)/);
  
  if (fnMatch) {
    if (currentFootnote) {
      footnotes.push(currentFootnote);
    }
    const num = parseInt(fnMatch[1], 10);
    if (num > maxNumber) maxNumber = num;
    currentFootnote = { num, lines: [line] };
  } else if (currentFootnote) {
    if (line.trim() === '' || /^[ \t]+/.test(line)) {
      currentFootnote.lines.push(line);
    } else {
      footnotes.push(currentFootnote);
      currentFootnote = null;
      newLines.push(line);
    }
  } else {
    newLines.push(line);
  }
}
if (currentFootnote) {
  footnotes.push(currentFootnote);
}

// Clean up trailing empty lines in footnotes
footnotes.forEach(f => {
  while (f.lines.length > 0 && f.lines[f.lines.length - 1].trim() === '') {
    f.lines.pop();
  }
});

// Clean up trailing empty lines in newLines
while (newLines.length > 0 && newLines[newLines.length - 1].trim() === '') {
  newLines.pop();
}

footnotes.sort((a, b) => a.num - b.num);

if (footnotes.length > 0) {
  newLines.push('');
  newLines.push('');
  footnotes.forEach(f => {
    newLines.push(...f.lines);
  });
}

console.log(newLines.join('\n'));
