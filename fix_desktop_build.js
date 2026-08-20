const fs = require('fs');
const file = 'd:/Developer/OnriviMarkDown/OnriviMarkDown/frontend/desktop-build.js';
let c = fs.readFileSync(file, 'utf8');

const target = `const DEV_ONLY_ROUTES = [
  { parent: API_DIR, route: 'view' },
  { parent: API_DIR, route: 'upload-pasted-image' },
  { parent: API_DIR, route: 'admin' },
  { parent: API_DIR, route: 'cron' },
  { parent: API_DIR, route: 'faqs' },
  { parent: API_DIR, route: 'plans' },
  { parent: APP_DIR, route: 'auth' },
  { parent: APP_DIR, route: 'contact' },
  { parent: APP_DIR, route: 'dashboard' },
  { parent: APP_DIR, route: 'forgot-password' },
  { parent: APP_DIR, route: 'login' },
  { parent: APP_DIR, route: 'privacy' },
  { parent: APP_DIR, route: 'reset-password' },
  { parent: APP_DIR, route: 'signup' },
  { parent: APP_DIR, route: 'terms' }
];`;

const replacement = `const DEV_ONLY_ROUTES = [
  { parent: APP_DIR, route: 'api' },
  { parent: APP_DIR, route: 'auth' },
  { parent: APP_DIR, route: 'contact' },
  { parent: APP_DIR, route: 'dashboard' },
  { parent: APP_DIR, route: 'forgot-password' },
  { parent: APP_DIR, route: 'login' },
  { parent: APP_DIR, route: 'privacy' },
  { parent: APP_DIR, route: 'reset-password' },
  { parent: APP_DIR, route: 'signup' },
  { parent: APP_DIR, route: 'terms' }
];`;

c = c.replace(target, replacement);

fs.writeFileSync(file, c, 'utf8');
console.log('Fixed desktop-build.js to exclude the entire api folder');
