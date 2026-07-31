/**
 * 프로그램명 : OnriviAuthor
 * 프로그램 ID : oaar-modal-manager
 * -----------------------------------------------------------------------
 * 변경내역
 * -----------------------------------------------------------------------
 * <2026.07.05> 최초작성
 * 🚨 @PATCH : **2026-07-06** — [시큐어코딩] 파일 및 폴더 생성 시 경로 탐색(Path Traversal) 공격 방지를 위해 생성명에서 슬래시(/) 및 백슬래시(\) 문자를 제거하는 정규식 필터 적용
 * -----------------------------------------------------------------------
 */
import React from 'react';

// 각종 모달 컴포넌트 임포트
import SettingsModal from '@/components/SettingsModal';        // 환경설정 모달 컴포넌트
import ExportModal from '@/components/ExportModal';        // 내보내기 모달 컴포넌트
import PromptModal from '@/components/PromptModal';        // 프롬프트 모달 컴포넌트
import ConfirmModal from '@/components/ConfirmModal';        // 확인 모달 컴포넌트
import ImageModal from '@/components/ImageModal';        // 이미지 모달 컴포넌트
import MapModal from '@/components/MapModal';        // 지도 모달 컴포넌트
import TableModal from '@/components/TableModal';        // 표 모달 컴포넌트
import MergeModal from '@/components/MergeModal';        // 병합 모달 컴포넌트
import YoutubeModal from '@/components/YoutubeModal';        // 유튜브 모달 컴포넌트
import HelpModal from '@/components/HelpModal';        // 도움말 모달 컴포넌트
import LicenseModal from '@/components/LicenseModal';        // 라이선스 모달 컴포넌트
import FormulaModal from '@/components/FormulaModal';        // 수식 모달 컴포넌트
import CssStyleModal from '@/components/CssStyleModal';        // 서식 모달 컴포넌트

import { useEditorModals } from '@/hooks/editor/useEditorModals';
import { BROWSER_STORAGE_NAME } from '@/constants/storage'; // 모달 관련 상태와 함수들을 hook으로 관리하는 hooks

/**
 * props들의 타입을 선언
 */
interface ModalManagerProps {
  modals: ReturnType<typeof useEditorModals>;
  deps: any; // MainEditorApp에서 넘어오는 수많은 상태와 함수들 (점진적 타입 구체화 예정)
}

/**
 * [Step 4 리팩토링]
 * MainEditorApp 하단에 흩어져 있던 모든 모달/플러그인을 모아서 렌더링하는 관제 센터
 * 차후 AI 설정 모달 등 새로운 플러그인 추가 시 이 컴포넌트만 수정하면 됨.
 */
export default function ModalManager({ modals, deps }: ModalManagerProps) {
  const {
    isSettingsModalOpen, setIsSettingsModalOpen,                         // 환경설정 모달 열림/닫힘 상태
    settingsModalInitialTab, setSettingsModalInitialTab,                 // 환경설정 모달 초기 탭 설정
    isStyleModalOpen, setIsStyleModalOpen,                                 // 서식 모달 열림/닫힘 상태
    isExportModalOpen, setIsExportModalOpen,                             // 내보내기 모달 열림/닫힘 상태
    isImageModalOpen, setIsImageModalOpen,                                 // 이미지 모달 열림/닫힘 상태
    editingImageInfo, setEditingImageInfo,                                 // 이미지 모달 편집 정보 상태
    isMergeModalOpen, setIsMergeModalOpen,                                   // 병합 모달 열림/닫힘 상태
    isYoutubeModalOpen, setIsYoutubeModalOpen,                             // 유튜브 모달 열림/닫힘 상태
    youtubeInitialUrl, setYoutubeInitialUrl,                             // 유튜브 모달 초기 URL 설정
    isLicenseModalOpen, setIsLicenseModalOpen,                             // 라이선스 모달 열림/닫힘 상태
    isFormulaModalOpen, setIsFormulaModalOpen,                             // 수식 모달 열림/닫힘 상태
    promptConfig, setPromptConfig,                                         // 프롬프트 모달 설정 상태
    confirmConfig, setConfirmConfig,                                         // 확인 모달 설정 상태
    isMapModalOpen, setIsMapModalOpen,                                     // 지도 모달 열림/닫힘 상태
    isTableModalOpen, setIsTableModalOpen,                                 // 표 모달 열림/닫힘 상태
    isHelpModalOpen, setIsHelpModalOpen                                  // 도움말 모달 열림/닫힘 상태
  } = modals;

  // deps에서 필요한 속성들 추출
  const {
    isDarkMode, setIsDarkMode, fontSize, setFontSize, wordWrap, setWordWrap,   // 다크모드, 글자크기, 단어줄바꿈
    autoSave, setAutoSave, rootFolder, rootFolderRef, selectRootFolder, driveLetter, setDriveLetter,    // 자동저장, 루트폴더, 루트폴더참조, 루트폴더선택, 드라이브문자
    workspaceType, setWorkspaceType, previewMode, setPreviewMode, customHotkeys, setCustomHotkeys,       // 워크스페이스타입, 미리보기모드, 사용자지정단축키, 사용자지정단축키설정
    customSlashCommands, setCustomSlashCommands, licenseKey, setLicenseKey, themePalette, handleThemeChange,   // 사용자지정슬래시명령어, 사용자지정슬래시명령어설정, 라이선스키, 라이선스키설정, 테마팔레트, 테마변경
    geminiApiKey, setGeminiApiKey, aiModelName, setAiModelName,                                       // geminiAPI키, geminiAPI키설정, ai모델이름, ai모델이름설정
    isActivated, licenseStatus, deviceId, handleSuccessActivation, handlers, content, currentFileNodeRef,  // 활성화여부, 라이선스상태, 디바이스ID, 성공적인활성화처리, 핸들러, 콘텐츠, 현재파일노드참조
    setCurrentFileName, setCurrentFileNode, lastSavedContentRef, setSaveStatus, refreshFileList,       // 현재파일이름설정, 현재파일노드설정, 마지막저장콘텐츠참조, 저장상태설정, 파일목록갱신
    showToast, editorRef, insertAtCursor, setIsMergeMode, selectedMergeNodes, setSelectedMergeNodes,   // 토스트보이기, 에디터참조, 커서에삽입, 병합모드설정, 선택된병합노드, 선택된병합노드설정
    handleFileClick, profiles, activeProfileId, dynamicCssString, setActiveProfileId, setProfiles,   // 파일클릭핸들러, 프로필, 활성프로필ID, 동적CSS문자열, 활성프로필ID설정, 프로필설정
    isSystemProfileId, getApiUrl, DEFAULT_PROFILE, SYSTEM_PROFILES, vfsCreateFile, vfsWriteFile, vfsCreateFolder,   // 시스템프로파일ID, API URL 얻기, 기본프로파일, 시스템프로파일, 가상파일시스템생성파일, 가상파일시스템쓰기파일, 가상파일시스템생성폴더
    helpTitle, helpContent, setHelpContent,                                                                  // 도움말제목, 도움말콘텐츠, 도움말콘텐츠설정
    resourceFolder, resourceFolderRef, selectResourceFolder
  } = deps;

  return (
    <>
      {/* 환경설정 모달 */}
      <SettingsModal
        isOpen={isSettingsModalOpen}
        onClose={() => setIsSettingsModalOpen(false)}
        isDarkMode={isDarkMode} setIsDarkMode={setIsDarkMode}
        fontSize={fontSize} setFontSize={setFontSize}
        wordWrap={wordWrap} setWordWrap={setWordWrap}
        autoSave={autoSave} setAutoSave={setAutoSave}
        rootFolder={rootFolder} onSelectRootFolder={selectRootFolder}
        driveLetter={driveLetter} setDriveLetter={setDriveLetter}
        workspaceType={workspaceType} setWorkspaceType={setWorkspaceType}
        cloudProvider={null}
        previewMode={previewMode} setPreviewMode={setPreviewMode}
        customHotkeys={customHotkeys} setCustomHotkeys={setCustomHotkeys}
        customSlashCommands={customSlashCommands} setCustomSlashCommands={setCustomSlashCommands}
        licenseKey={licenseKey} setLicenseKey={setLicenseKey}
        themePalette={themePalette}
        onThemeChange={handleThemeChange}
        isActivated={isActivated}
        isExpired={licenseStatus?.isExpired || false}
        autoClosingBrackets={deps.autoClosingBrackets}
        setAutoClosingBrackets={deps.setAutoClosingBrackets}
        geminiApiKey={geminiApiKey}
        setGeminiApiKey={setGeminiApiKey}
        aiModelName={aiModelName}
        setAiModelName={setAiModelName}
        resourceFolder={resourceFolder} onSelectResourceFolder={selectResourceFolder}
      />

      <ExportModal
        isOpen={isExportModalOpen}
        onClose={() => setIsExportModalOpen(false)}
        isDarkMode={isDarkMode}
        onExport={(format: any) => {
          if (!isActivated) {
            showToast("정품 라이선스 키 등록이 필요합니다. (설정 -> 애플리케이션 탭에서 등록)", 'error');
            return;
          }
          if (format === 'print') handlers.print();
          else if (format === 'html') handlers.exportHTML();
          else if (format === 'png') handlers.exportPNG();
          else if (format === 'epub') handlers.exportEPUB();
        }}
      />
      {promptConfig.isOpen && (
        <PromptModal
          isOpen={promptConfig.isOpen}
          title={promptConfig.title}
          defaultValue={promptConfig.defaultValue}
          error={promptConfig.error}
          onConfirm={async (value: string) => {
            if (!value.trim()) {
              setPromptConfig((prev: any) => ({ ...prev, error: '이름을 입력해주세요.' }));
              return;
            }
            try {
              if (promptConfig.type === 'createFile') {
                // [시큐어코딩] 경로 탐색(Path Traversal) 공격 방지: 파일명에서 슬래시, 백슬래시 제거
                const safeValue = value.replace(/[\/\\]/g, '');
                const finalName = safeValue.endsWith('.md') ? safeValue : `${safeValue}.md`;
                const api = (window as any).electronAPI;
                if (api && rootFolder?.name && rootFolder.name !== BROWSER_STORAGE_NAME) {
                  const fullPath = rootFolder.name + '\\' + finalName;
                  const success = await api.saveFile(fullPath, content);
                  if (success) {
                    setPromptConfig((prev: any) => ({ ...prev, isOpen: false, error: '' }));
                    setCurrentFileName(finalName);
                    setCurrentFileNode({ name: finalName, kind: 'file', path: fullPath });
                    lastSavedContentRef.current = content;
                    setSaveStatus('saved');
                    await refreshFileList();
                    window.dispatchEvent(new CustomEvent('file:refresh-all-directories'));
                    showToast(`${finalName} 저장 완료`, 'success');
                  } else {
                    showToast("저장 실패", 'error');
                  }
                } else if (workspaceType === 'browser') {
                  if (rootFolder?.handle) {
                    const handle = await rootFolder.handle.getFileHandle(finalName, { create: true });
                    const writable = await handle.createWritable();
                    await writable.write(content);
                    await writable.close();
                    setPromptConfig((prev: any) => ({ ...prev, isOpen: false, error: '' }));
                    setCurrentFileName(finalName);
                    setCurrentFileNode({ name: finalName, kind: 'file', handle });
                    lastSavedContentRef.current = content;
                    setSaveStatus('saved');
                    await refreshFileList();
                    window.dispatchEvent(new CustomEvent('file:refresh-all-directories'));
                    showToast(`${finalName} 저장 완료`, 'success');
                  } else {
                    vfsCreateFile('', finalName);
                    vfsWriteFile(finalName, content);
                    setPromptConfig((prev: any) => ({ ...prev, isOpen: false, error: '' }));
                    setCurrentFileName(finalName);
                    setCurrentFileNode({ name: finalName, kind: 'file', path: finalName });
                    lastSavedContentRef.current = content;
                    setSaveStatus('saved');
                    await refreshFileList();
                    window.dispatchEvent(new CustomEvent('file:refresh-all-directories'));
                    showToast(`${finalName} 저장 완료`, 'success');
                  }
                } else {
                  const res = await fetch(getApiUrl('/api/create-file'), {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ parentPath: '', name: finalName })
                  });
                  if (res.ok) {
                    const data = await res.json();
                    if (content) {
                      await fetch(getApiUrl('/api/save'), {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ path: data.path, content })
                      });
                    }
                    setPromptConfig((prev: any) => ({ ...prev, isOpen: false, error: '' }));
                    await refreshFileList();
                    window.dispatchEvent(new CustomEvent('file:refresh-all-directories'));
                    const newFileNode = { name: finalName, kind: 'file' as const, path: data.path };
                    setCurrentFileName(finalName);
                    setCurrentFileNode(newFileNode);
                    lastSavedContentRef.current = content;
                    setSaveStatus('saved');
                    showToast(`${finalName} 생성 및 저장 완료`, 'success');
                  }
                }
              } else if (promptConfig.type === 'createFolder') {
                // [시큐어코딩] 경로 탐색(Path Traversal) 공격 방지: 폴더명에서 슬래시, 백슬래시 제거
                const safeValue = value.replace(/[\/\\]/g, '');
                if (workspaceType === 'browser') {
                  if (rootFolder?.handle) {
                    await rootFolder.handle.getDirectoryHandle(safeValue, { create: true });
                  } else {
                    vfsCreateFolder('', safeValue);
                  }
                } else {
                  await fetch(getApiUrl('/api/create-folder'), {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ parentPath: '', name: safeValue })
                  });
                }
                setPromptConfig((prev: any) => ({ ...prev, isOpen: false, error: '' }));
                await refreshFileList();
                window.dispatchEvent(new CustomEvent('file:refresh-all-directories'));
                showToast(`${value} 폴더 생성 완료`, 'success');
              } else {
                setPromptConfig((prev: any) => ({ ...prev, isOpen: false, error: '' }));
              }
            } catch (e: any) {
              showToast('작업 실패: ' + e.message, 'error');
            }
          }}
          onCancel={() => setPromptConfig((prev: any) => ({ ...prev, isOpen: false, error: '' }))}
        />
      )}
      <ConfirmModal
        isOpen={confirmConfig.isOpen}
        title={confirmConfig.title}
        message={confirmConfig.message}
        confirmText={confirmConfig.confirmText}
        cancelText={confirmConfig.cancelText}
        isDanger={confirmConfig.isDanger}
        onConfirm={() => {
          confirmConfig.onConfirm();
          setConfirmConfig((prev: any) => ({ ...prev, isOpen: false }));
        }}
        onCancel={() => {
          if (confirmConfig.onCancel) confirmConfig.onCancel();
          setConfirmConfig((prev: any) => ({ ...prev, isOpen: false }));
        }}
      />
      <FormulaModal
        isOpen={isFormulaModalOpen}
        onClose={() => setIsFormulaModalOpen(false)}
        onInsert={(formula: string) => insertAtCursor(formula)}
        isDarkMode={isDarkMode}
      />
      <MergeModal
        isOpen={isMergeModalOpen}
        onClose={() => { setIsMergeModalOpen(false); setIsMergeMode(false); setSelectedMergeNodes([]); }}
        selectedNodes={selectedMergeNodes}
        rootFolder={rootFolder}
        workspaceType={workspaceType}
        refreshParent={refreshFileList}
        openFile={handleFileClick}
      />
      <LicenseModal
        isOpen={isLicenseModalOpen}
        onClose={() => setIsLicenseModalOpen(false)}
        deviceId={deviceId}
        licenseStatus={licenseStatus}
        onSuccessActivation={handleSuccessActivation}
        isDarkMode={isDarkMode}
      />
      <ImageModal
        isOpen={isImageModalOpen}
        onClose={() => {
          setIsImageModalOpen(false);
          setEditingImageInfo(null);
        }}
        initialData={editingImageInfo}
        targetFolder={(() => {
          const api = typeof window !== 'undefined' ? (window as any).electronAPI : null;
          if (api) {
            // 데스크탑: resourceFolderRef.current를 최우선 사용 (state보다 항상 최신)
            const rf = resourceFolderRef?.current ?? resourceFolder;
            if (rf) {
              return rf + '\\media';
            }
            // resourceFolder 없으면 현재 파일 경로 기준 폴더 사용
            if (currentFileNodeRef?.current?.path) {
              const filePath = currentFileNodeRef.current.path;
              const lastSlash = Math.max(filePath.lastIndexOf('\\'), filePath.lastIndexOf('/'));
              if (lastSlash !== -1) return filePath.substring(0, lastSlash);
            }
            return '';
          }
        // 웹 환경: resourceFolderHandle이 있으면 빈 문자열 (핸들로 처리), 없으면 rootFolder
        if (deps.resourceFolderHandle) return '';
        if (rootFolderRef?.current?.name && rootFolderRef.current.name !== BROWSER_STORAGE_NAME) {
          return rootFolderRef.current.name;
        }
        return '';
      })()}
      resourceFolder={resourceFolder}
      resourceFolderHandle={deps.resourceFolderHandle}
      workspaceType={deps.workspaceType}
      rootFolder={deps.rootFolder}
      showToast={showToast}
      onInsert={(path: string, alt: string, range: any) => {
        if (range) {
          const editor = editorRef.current;
          if (editor) {
            editor.executeEdits("edit-image", [{
              range: range,
              text: `![${alt}](${path})`,
              forceMoveMarkers: true
            }]);
            editor.focus();
          }
        } else {
          insertAtCursor(`![${alt}](${path})`);
        }
        setEditingImageInfo(null);
      }}
      isDarkMode={isDarkMode}
    />
    <YoutubeModal
      isOpen={isYoutubeModalOpen}
      onClose={() => { setIsYoutubeModalOpen(false); setYoutubeInitialUrl(null); }}
      onInsert={(code: string) => {
        insertAtCursor(code);
      }}
      isDarkMode={isDarkMode}
      initialUrl={youtubeInitialUrl || undefined}
      targetFolder={resourceFolder ? resourceFolder + '\\media' : (rootFolder?.name || '')}
      resourceFolder={resourceFolder}
      resourceFolderHandle={deps.resourceFolderHandle}
      workspaceType={deps.workspaceType}
      rootFolder={deps.rootFolder}
    />
      <MapModal
        isOpen={isMapModalOpen}
        onClose={() => setIsMapModalOpen(false)}
        onInsert={(code: string) => insertAtCursor(code)}
        isDarkMode={isDarkMode}
      />
      <TableModal
        isOpen={isTableModalOpen}
        onClose={() => setIsTableModalOpen(false)}
        onInsert={(code: string) => insertAtCursor(code)}
        isDarkMode={isDarkMode}
      />
      <CssStyleModal
        isOpen={isStyleModalOpen}
        onClose={() => setIsStyleModalOpen(false)}
        profiles={profiles}
        activeProfileId={activeProfileId}
        dynamicCssString={dynamicCssString}
        geminiApiKey={geminiApiKey}
        aiModelName={aiModelName}
        onSelectProfile={setActiveProfileId}
        onUpdateProfile={(updated: any) => setProfiles((prev: any) =>
          prev.map((p: any) => p.id === updated.id ? updated : p)
        )}
        onAddProfile={() => {
          const newId = 'profile-' + Date.now();
          const count = profiles.filter((p: any) => !isSystemProfileId(p.id)).length + 1;
          setProfiles((prev: any) => [...prev, {
            ...DEFAULT_PROFILE,
            id: newId,
            name: `나만의 서식 ${count}`,
            rules: structuredClone(DEFAULT_PROFILE.rules || {}),
          }]);
          setActiveProfileId(newId);
        }}
        onDeleteProfile={(id: string) => {
          if (isSystemProfileId(id)) return;
          setProfiles((prev: any) => prev.filter((p: any) => p.id !== id));
          if (activeProfileId === id) {
            setActiveProfileId(SYSTEM_PROFILES[0].id);
          }
        }}
        onImportProfile={(imported: any) => {
          const newId = 'profile-' + Date.now();
          // null/undefined 필드를 필터링하여 DEFAULT_PROFILE 기본값이 보존되도록 보장 (AI 응답에 포함된 null 값 방어)
          const cleanPageStyle = Object.fromEntries(
            Object.entries(imported.pageStyle || {}).filter(([, v]) => v !== undefined && v !== null)
          );
          // 💡 [OMD-PATCH] 구버전 프로필 호환성을 위한 데이터 마이그레이션 및 살균 (Sanitization)
          if (imported.rules) {
            // 1. 거대 공백 버그를 유발하는 keep-all 속성을 break-all로 일괄 강제 변환
            Object.keys(imported.rules).forEach(tag => {
              if (imported.rules[tag] && imported.rules[tag]['word-break'] === 'keep-all') {
                imported.rules[tag]['word-break'] = 'break-all';
              }
            });
            // 2. 인용구(blockquote) 테두리 중복 속성 정리 (왼쪽 띠형과 전체 박스형 전환 시 발생했던 버그 찌꺼기 제거)
            if (imported.rules.blockquote) {
              if (imported.rules.blockquote['border-left'] === 'none') {
                delete imported.rules.blockquote['border-left'];
              }
              // 만약 border-left가 있는데 border-width가 있다면 충돌 방지를 위해 border-width 삭제
              if (imported.rules.blockquote['border-left'] && imported.rules.blockquote['border-left'] !== 'none' && imported.rules.blockquote['border-width']) {
                delete imported.rules.blockquote['border-width'];
              }
              // 반대로 border가 있는데 border-left-width가 있다면 삭제
              if (imported.rules.blockquote['border'] && imported.rules.blockquote['border'] !== 'none' && imported.rules.blockquote['border-left-width']) {
                delete imported.rules.blockquote['border-left-width'];
              }
            }
            // 3. 인라인 코드(code) 폰트 크기 조절 기능 제거에 따른 찌꺼기 속성 제거
            if (imported.rules.code && imported.rules.code['font-size']) {
              delete imported.rules.code['font-size'];
            }
            // 4. 표(table) 단축 속성과 개별 속성 중복 제거
            ['table', 'th', 'td'].forEach(tag => {
              if (imported.rules[tag] && imported.rules[tag]['border-width'] && imported.rules[tag]['border']) {
                delete imported.rules[tag]['border'];
              }
            });
          }

          const cleanRules = Object.fromEntries(
            Object.entries(imported.rules || {}).filter(([, v]) => v !== undefined && v !== null)
          );
          
          // 💡 [OMD-PATCH] 각 태그별(h1, p, blockquote 등) 속성을 2-Depth 딥머지(Deep Merge)하여 
          // 가져온 서식에서 누락된 속성은 시스템 기본 서식(DEFAULT_PROFILE)의 값으로 자동 대처(Fallback)되게 합니다.
          const deeplyMergedRules: any = { ...(DEFAULT_PROFILE.rules || {}) };
          Object.keys(cleanRules).forEach(tag => {
            deeplyMergedRules[tag] = {
              ...(deeplyMergedRules[tag] || {}),
              ...(cleanRules[tag] || {})
            };
          });

          const merged: any = {
            ...DEFAULT_PROFILE,
            ...imported,
            id: newId,
            name: imported.name || '가져온 서식',
            pageStyle: { ...DEFAULT_PROFILE.pageStyle, ...cleanPageStyle },
            rules: deeplyMergedRules,
          };
          setProfiles((prev: any) => [...prev, merged]);
          setActiveProfileId(newId);
          showToast(`서식 '${merged.name}'이(가) 추가되었습니다.`, 'success');
        }}
        isDarkMode={isDarkMode}
      />

      <HelpModal
        isOpen={isHelpModalOpen}
        onClose={() => { setIsHelpModalOpen(false); setHelpContent(''); }}
        title={helpTitle}
        content={helpContent}
        isDarkMode={isDarkMode}
      />
    </>
  );
}
