const fs = require('fs');

const mainFile = 'frontend/src/components/MainEditorApp.tsx';
let mainContent = fs.readFileSync(mainFile, 'utf8');

const patchFile = 'temp_newLoadAndVerify.tsx';
const patchContent = fs.readFileSync(patchFile, 'utf8');

const startIndex = mainContent.indexOf('  const loadAndVerifyLicense = useCallback(async () => {');
const endIndex = mainContent.indexOf('  }, [deviceId, showToast]);', startIndex) + '  }, [deviceId, showToast]);'.length;

if (startIndex === -1 || endIndex === -1) {
  console.error('Could not find boundaries');
  process.exit(1);
}

const newContent = mainContent.substring(0, startIndex) + patchContent + mainContent.substring(endIndex);

// Also we need to make sure the patchContent has payment_no mapped!
let finalContent = newContent.replace(
  /paymentNo: data\.payment_no \|\| '',/g,
  "paymentNo: data.payment_no || ''," // It was already updated in temp_newLoadAndVerify.tsx maybe? Let's force it.
).replace(
  /userId: savedUserId, licenseKey: data\.license_key \|\| '', paymentNo: '',/g,
  "userId: savedUserId, licenseKey: data.license_key || '', paymentNo: data.payment_no || '',"
);

fs.writeFileSync(mainFile, finalContent, 'utf8');
console.log('Patched successfully');
