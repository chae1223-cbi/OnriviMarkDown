const fs = require('fs');
const f = 'd:/Developer/OnriviMarkDown/OnriviMarkDown/frontend/src/components/MainEditorApp.tsx';
let c = fs.readFileSync(f, 'utf8');

c = c.replace(
  "prevActiveTabRef.current = activeTabId;\n          lastSavedContentRef.current = content;\n          // ????? saveStatus???재 ?? isModified?맞게 ?기??        const activeTab = tabsRef.current.find(t => t.id === activeTabId);\n          setSaveStatus(activeTab?.isModified ? 'unsaved' : 'saved');\n          return;",
  "prevActiveTabRef.current = activeTabId;\n          const activeTab = tabsRef.current.find(t => t.id === activeTabId);\n          if (!activeTab?.isModified) lastSavedContentRef.current = content;\n          setSaveStatus(activeTab?.isModified ? 'unsaved' : 'saved');\n          return;"
);

// Fallback search in case whitespace is slightly different
c = c.replace(
  /prevActiveTabRef\.current = activeTabId;\s+lastSavedContentRef\.current = content;\s+\/\/.*?\s+const activeTab = tabsRef\.current\.find.*?;\s+setSaveStatus\(activeTab\?\.isModified \? 'unsaved' : 'saved'\);\s+return;/g,
  "prevActiveTabRef.current = activeTabId;\n          const activeTab = tabsRef.current.find(t => t.id === activeTabId);\n          if (!activeTab?.isModified) lastSavedContentRef.current = content;\n          setSaveStatus(activeTab?.isModified ? 'unsaved' : 'saved');\n          return;"
);

fs.writeFileSync(f, c, 'utf8');
console.log('Fixed tabswitch');
