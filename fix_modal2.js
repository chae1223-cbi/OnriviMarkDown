const fs = require('fs');
const path = 'frontend/src/components/LicenseModal.tsx';
let content = fs.readFileSync(path, 'utf8');

const target = `{getPlanDisplayName(licenseStatus.planName)}</span>`;

const repl = `{getPlanDisplayName(licenseStatus.planName)}
                      {licenseStatus.isRestricted && <span className="ml-2 text-error text-[13px] font-normal tracking-normal">(동시접속 제한)</span>}
                    </span>`;

content = content.replace(target, repl);

fs.writeFileSync(path, content, 'utf8');
console.log('done');
