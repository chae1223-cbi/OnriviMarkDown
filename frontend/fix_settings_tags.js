const fs = require('fs');
const filePath = __dirname + '/src/components/SettingsModal.tsx';
let content = fs.readFileSync(filePath, 'utf8');

const correctSidebar = `        {/* 좌측 사이드바 */}
        <div className="w-48 border-r flex flex-col" style={{ backgroundColor: colors.container, borderColor: colors.border }}>
          <div className="p-4 border-b flex items-center gap-2" style={{ borderColor: colors.border }}>
            <span className="text-lg leading-none">⚙️</span>
            <h2 className="font-bold text-sm" style={{ color: colors.onSurface }}>{t('settings')}</h2>
          </div>
          <nav className="flex-1 p-2 space-y-1">
            <TabButton 
              active={activeTab === 'editor'} 
              onClick={() => setActiveTab('editor')}`;

// Revert the last replace by replacing the broken one with the correct one
content = content.replace(/\{\/\* 좌측 사이드바 \*\/\}\s+icon=\{<Type size=\{16\}\/>\}/, correctSidebar);
content = content.replace(/\{\/\* \?정 본문 \*\/\}/g, '{/* 설정 본문 */}');

fs.writeFileSync(filePath, content, 'utf8');
console.log('Fixed SettingsModal formatting');
