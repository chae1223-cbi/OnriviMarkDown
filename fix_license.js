const fs = require('fs');
const path = 'frontend/src/components/LicenseModal.tsx';
let content = fs.readFileSync(path, 'utf8');

const target = `  licenseStatus: {
    isActivated: boolean;
    isExpired: boolean;
    remainingDays: number;
    userId: string;
    licenseKey: string;
    paymentNo?: string;
    planName?: string;
    nextPaymentDate?: string;
  };`;

const repl = `  licenseStatus: {
    isActivated: boolean;
    isExpired: boolean;
    isRestricted?: boolean;
    remainingDays: number;
    userId: string;
    licenseKey: string;
    paymentNo?: string;
    planName?: string;
    nextPaymentDate?: string;
  };`;

content = content.replace(target, repl);
fs.writeFileSync(path, content, 'utf8');
console.log('done');
