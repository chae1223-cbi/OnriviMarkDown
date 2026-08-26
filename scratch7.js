const fs = require("fs");
let content = fs.readFileSync("frontend/src/components/MainEditorApp.tsx", "utf8");

content = content.replace(
  /if \(rect\.bottom >= containerRect\.top\) {\s*elA = elements\[i\];\s*if \(i \+ 1 < elements\.length\) {\s*elB = elements\[i \+ 1\];\s*}\s*break;\s*}/,
  `if (rect.bottom >= containerRect.top) {
                                  elA = elements[i];
                                  const lineAStr = elA.getAttribute("data-line");
                                  if (lineAStr) {
                                    const lineA = parseInt(lineAStr, 10);
                                    for (let j = i + 1; j < elements.length; j++) {
                                      const nextEl = elements[j];
                                      const lineBStr = nextEl.getAttribute("data-line");
                                      if (lineBStr && parseInt(lineBStr, 10) > lineA) {
                                        elB = nextEl;
                                        break;
                                      }
                                    }
                                  }
                                  break;
                                }`
);

fs.writeFileSync("frontend/src/components/MainEditorApp.tsx", content, "utf8");
