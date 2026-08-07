const fs = require('fs');
const path = 'frontend/src/components/MainEditorApp.tsx';
let content = fs.readFileSync(path, 'utf8');

content = content.replace(
  `  }, [mounted, isLicenseChecking, licenseStatus.isExpired, licenseStatus.planName]);`,
  `  }, [mounted, isLicenseChecking, licenseStatus.isExpired, licenseStatus.planName, licenseStatus.isRestricted]);`
);
fs.writeFileSync(path, content, 'utf8');
console.log('done');
