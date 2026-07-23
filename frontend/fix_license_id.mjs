import fs from 'fs';

function replaceInFile(filePath) {
  let content = fs.readFileSync(filePath, 'utf8');
  let originalContent = content;

  // license_id = ${ -> subscription_id = ${ 
  
  if (filePath.endsWith('check-session/route.ts')) {
    content = content.replace(/license_id = \$\{licenseId\}/g, 'subscription_id = ${licenseId}');
  }
  
  if (filePath.endsWith('subscription/create/route.ts')) {
    content = content.replace(/license_id = \$\{subId\}/g, 'subscription_id = ${subId}');
    content = content.replace(/license_id, device_uuid/g, 'subscription_id, device_uuid');
  }
  
  if (filePath.endsWith('subscription/expire/route.ts')) {
    content = content.replace(/license_id = \$\{p_subscription_id\}/g, 'subscription_id = ${p_subscription_id}');
  }
  
  if (filePath.endsWith('licenseQueries.ts')) {
    content = content.replace(/license_id = \$\{licenseId\}/g, 'subscription_id = ${licenseId}');
    content = content.replace(/license_id, device_uuid/g, 'subscription_id, device_uuid');
  }

  if (content !== originalContent) {
    fs.writeFileSync(filePath, content, 'utf8');
    console.log('✅ Fixed license_id to subscription_id in:', filePath);
  }
}

const files = [
  'd:/Developer/OnriviMarkDown/OnriviMarkDown/frontend/src/app/api/license/check-session/route.ts',
  'd:/Developer/OnriviMarkDown/OnriviMarkDown/frontend/src/app/api/subscription/create/route.ts',
  'd:/Developer/OnriviMarkDown/OnriviMarkDown/frontend/src/app/api/subscription/expire/route.ts',
  'd:/Developer/OnriviMarkDown/OnriviMarkDown/frontend/src/lib/db/queries/licenseQueries.ts'
];

files.forEach(replaceInFile);
