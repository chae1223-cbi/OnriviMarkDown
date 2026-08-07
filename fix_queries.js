const fs = require('fs');
const path = 'frontend/src/lib/db/queries/licenseQueries.ts';
let content = fs.readFileSync(path, 'utf8');

const target = `        if (isElitePro) {
          const desktopSessions = activeSessions.filter((s: any) => s.device_name?.toLowerCase().includes('desktop'));
          const webSessions = activeSessions.filter((s: any) => !s.device_name?.toLowerCase().includes('desktop'));
          
          if (isDesktopReq && desktopSessions.length >= 1) {
            await tx\`UPDATE license_activations SET is_active = false WHERE id = \${desktopSessions[0].id}\`;
          } else if (!isDesktopReq && webSessions.length >= 1) {
            await tx\`UPDATE license_activations SET is_active = false WHERE id = \${webSessions[0].id}\`;
          }
        } else {
          if (activeSessions.length >= max_devices) {
            const numToKick = activeSessions.length - max_devices + 1;
            for (let i = 0; i < numToKick; i++) {
              await tx\`UPDATE license_activations SET is_active = false WHERE id = \${activeSessions[i].id}\`;
            }
          }
        }
      }
      return true;`;

const repl = `        if (isElitePro) {
          const desktopSessions = activeSessions.filter((s: any) => s.device_name?.toLowerCase().includes('desktop'));
          const webSessions = activeSessions.filter((s: any) => !s.device_name?.toLowerCase().includes('desktop'));
          
          if (isDesktopReq && desktopSessions.length >= 1) {
            return false;
          } else if (!isDesktopReq && webSessions.length >= 1) {
            return false;
          }
        } else {
          if (activeSessions.length >= max_devices) {
            return false;
          }
        }
      }
      return true;`;

content = content.replace(target, repl);
fs.writeFileSync(path, content, 'utf8');
console.log('done');
