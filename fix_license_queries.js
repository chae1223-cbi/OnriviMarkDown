const fs = require('fs');
const filePath = 'D:/Developer/OnriviMarkDown/OnriviMarkDown/frontend/src/lib/db/queries/licenseQueries.ts';
let content = fs.readFileSync(filePath, 'utf8');

const targetStr = `    let isCurrentlyActive = false;
    let newIsActive = true;`;

const newStr = `    let isCurrentlyActive = false;
    let newIsActive = !isExpired;`;

content = content.replace(targetStr, newStr);

fs.writeFileSync(filePath, content, 'utf8');
console.log('Fixed insertLicenseActivationQuery');
