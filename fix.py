import re

filepath = r'd:\developer\OnriviMarkDown\frontend\src\app\page.tsx'
with open(filepath, 'r', encoding='utf-8') as f:
    content = f.read()

start_str = 'suggestions: suggestions.map(s => ({'
end_str = '                <ExportModal'

idx_start = content.find(start_str)
idx_end = content.find(end_str)

new_block = """suggestions: suggestions.map(s => ({
                            ...s,
                            range: {
                              startLineNumber: position.lineNumber,
                              endLineNumber: position.lineNumber,
                              startColumn: position.column - 1,
                              endColumn: position.column
                            }
                          }))
                        };
                      }
                    });

                    editor.onDidScrollChange(() => {
                      if (isScrollingRef.current === 'preview' || previewMode !== 'both' || !previewRef.current) return;
                      
                      isScrollingRef.current = 'editor';
                      if (scrollTimeoutRef.current) clearTimeout(scrollTimeoutRef.current);
                      scrollTimeoutRef.current = setTimeout(() => { isScrollingRef.current = null; }, 50);

                      const visibleRanges = editor.getVisibleRanges();
                      if (visibleRanges.length > 0) {
                        const topVisibleLine = visibleRanges[0].startLineNumber;
                        
                        const elements = Array.from(previewRef.current.querySelectorAll('[data-line]')) as HTMLElement[];
                        let targetEl: HTMLElement | null = null;
                        let maxLine = -1;
                        for (const el of elements) {
                          const lineStr = el.getAttribute('data-line');
                          if (lineStr) {
                            const line = parseInt(lineStr, 10);
                            if (line <= topVisibleLine && line > maxLine) {
                              maxLine = line;
                              targetEl = el;
                            }
                          }
                        }
                        
                        if (targetEl) {
                          const getRelativeOffsetTop = (el: HTMLElement, container: HTMLElement): number => {
                            let offsetTop = 0;
                            let current: HTMLElement | null = el;
                            while (current && current !== container) {
                              offsetTop += current.offsetTop;
                              current = current.offsetParent as HTMLElement | null;
                            }
                            return offsetTop;
                          };
                          const relativeTop = getRelativeOffsetTop(targetEl, previewRef.current);
                          previewRef.current.scrollTo({
                            top: Math.max(0, relativeTop - 20),
                            behavior: 'auto'
                          });
                        }
                      }
                    });
                  }}
                  options={{
                    fontSize,
                    wordWrap,
                    lineNumbers: 'on',
                    minimap: { enabled: false },
                    scrollbar: { vertical: 'visible', horizontal: 'visible' },
                    quickSuggestions: { other: true, comments: true, strings: true },
                    suggestOnTriggerCharacters: true
                  }}
                />
                {floatingToolbar.visible && (
                  <div 
                    className="absolute z-50 flex items-center bg-white dark:bg-zinc-800 shadow-lg rounded-md border border-gray-200 dark:border-zinc-700 px-1 py-1 gap-0.5 animate-in fade-in zoom-in-95 duration-100 flex-wrap max-w-[500px]"
                    style={{ top: floatingToolbar.top, left: floatingToolbar.left }}
                    onMouseDown={(e) => e.preventDefault()}
                  >
                    {TOOLBAR_ITEMS.filter(item => item.group !== '푸터').map((item, idx, arr) => {
                      const isNewGroup = idx > 0 && arr[idx - 1].group !== item.group;
                      return (
                        <React.Fragment key={item.id}>
                          {isNewGroup && <div className="w-px h-4 bg-gray-300 dark:bg-zinc-600 mx-1" />}
                          <button 
                            className="w-7 h-7 flex items-center justify-center rounded hover:bg-gray-100 dark:hover:bg-zinc-700 text-[13px] font-medium"
                            title={`${item.name} (${customHotkeys[item.id] || ''})`} 
                            onClick={(e) => { 
                              e.preventDefault(); 
                              if (handlers[item.id as keyof typeof handlers]) {
                                (handlers[item.id as keyof typeof handlers] as any)();
                              }
                            }}
                          >
                            {item.icon}
                          </button>
                        </React.Fragment>
                      );
                    })}
                  </div>
                )}
              </div>
            )}

            {previewMode !== 'edit' && (
              <MarkdownViewer 
                content={content} 
                previewRef={previewRef}
                isScrollingRef={isScrollingRef}
                scrollTimeoutRef={scrollTimeoutRef}
                editorRef={editorRef}
                previewMode={previewMode}
                quoteStyle={quoteStyle}
              />
            )}
          </div>
          
          <StatusBar 
            content={content}
            fileName={currentFileName}
            folderName={rootFolder?.name}
            driveLetter={driveLetter}
            workspaceType={workspaceType}
            cloudProvider={cloudProvider}
            path={currentFileNode?.path}
            cursorLine={cursorPositionRef.current?.lineNumber}
            cursorColumn={cursorPositionRef.current?.column}
            saveStatus={saveStatus}
            isToolbarOpen={isToolbarOpen}
            setIsToolbarOpen={setIsToolbarOpen}
            isSidebarOpen={isSidebarOpen}
            setIsSidebarOpen={setIsSidebarOpen}
            previewMode={previewMode}
            setPreviewMode={setPreviewMode}
            isDarkMode={isDarkMode}
            setIsDarkMode={setIsDarkMode}
            language={language}
          />
        </main>
      </div>

      <SettingsModal 
        isOpen={isSettingsModalOpen} 
        onClose={() => setIsSettingsModalOpen(false)}
        isDarkMode={isDarkMode} setIsDarkMode={setIsDarkMode}
        fontSize={fontSize} setFontSize={setFontSize}
        wordWrap={wordWrap} setWordWrap={setWordWrap}
        autoSave={autoSave} setAutoSave={setAutoSave}
        rootFolder={rootFolder} onSelectRootFolder={handleSelectRootFolder}
        driveLetter={driveLetter} setDriveLetter={setDriveLetter}
        workspaceType={workspaceType} setWorkspaceType={setWorkspaceType}
        cloudProvider={cloudProvider}
        previewMode={previewMode} setPreviewMode={setPreviewMode}
        quoteStyle={quoteStyle} setQuoteStyle={setQuoteStyle}
        language={language} setLanguage={setLanguage}
        customHotkeys={customHotkeys} setCustomHotkeys={setCustomHotkeys}
        customSlashCommands={customSlashCommands} setCustomSlashCommands={setCustomSlashCommands}
      />
"""

if idx_start != -1 and idx_end != -1:
    new_content = content[:idx_start] + new_block + '              ' + content[idx_end:]
    with open(filepath, 'w', encoding='utf-8') as f:
        f.write(new_content)
    print("File repaired successfully.")
else:
    print("Could not find indices.")
