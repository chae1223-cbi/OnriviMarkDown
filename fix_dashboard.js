const fs = require('fs');
const filePath = 'D:/Developer/OnriviMarkDown/OnriviMarkDown/frontend/src/app/dashboard/page.tsx';
let content = fs.readFileSync(filePath, 'utf8');

const targetStr = `                                  {isDesktop && !isCurrent && (
                                    <span style={{ fontSize: 9, fontWeight: 700, color: T.primaryDark, alignSelf: "flex-start", marginTop: 2 }}>
                                      [앱 구동중]
                                    </span>
                                  )}`;

const newStr = `                                  {isDesktop && !isCurrent && (
                                    <span style={{ fontSize: 9, fontWeight: 700, color: T.primaryDark, alignSelf: "flex-start", marginTop: 2 }}>
                                      [앱 구동중]
                                    </span>
                                  )}
                                  {device.is_active === false && (
                                    <span style={{ fontSize: 9, fontWeight: 700, color: T.error, alignSelf: "flex-start", marginTop: 2 }}>
                                      [제한됨 (읽기전용)]
                                    </span>
                                  )}`;

content = content.replace(targetStr, newStr);

const targetType = `    device_name: string;
    activated_at: string;`;

const newType = `    device_name: string;
    activated_at: string;
    is_active?: boolean;`;

content = content.replace(targetType, newType);

fs.writeFileSync(filePath, content, 'utf8');
console.log('Fixed dashboard page');
