import { useState } from 'react';

export interface PromptConfig {
  isOpen: boolean;
  title: string;
  defaultValue: string;
  type: 'createFile' | 'createFolder' | 'rename' | null;
  error: string;
}

export interface ConfirmConfig {
  isOpen: boolean;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  isDanger?: boolean;
  onConfirm: () => void;
  onCancel?: () => void;
}

/**
 * [Step 2 리팩토링 완료]
 * MainEditorApp에 산재해 있던 모든 모달 및 팝업의 열림/닫힘 상태를 한 곳에서 중앙 관리하는 훅
 */
export const useEditorModals = () => {
  const [isSettingsModalOpen, setIsSettingsModalOpen] = useState(false);
  const [settingsModalInitialTab, setSettingsModalInitialTab] = useState<'editor' | 'app' | 'shortcuts'>('editor');
  const [isStyleModalOpen, setIsStyleModalOpen] = useState(false);
  const [isExportModalOpen, setIsExportModalOpen] = useState(false);
  
  const [isImageModalOpen, setIsImageModalOpen] = useState(false);
  const [editingImageInfo, setEditingImageInfo] = useState<{
    range: any;
    alt: string;
    path: string;
    width: string;
    height: string;
    align: string;
  } | null>(null);

  const [isMapModalOpen, setIsMapModalOpen] = useState(false);
  const [isTableModalOpen, setIsTableModalOpen] = useState(false);
  const [isMergeModalOpen, setIsMergeModalOpen] = useState(false);
  
  const [isYoutubeModalOpen, setIsYoutubeModalOpen] = useState(false);
  const [youtubeInitialUrl, setYoutubeInitialUrl] = useState<string | null>(null);

  const [isAboutModalOpen, setIsAboutModalOpen] = useState(false);
  const [isLicenseModalOpen, setIsLicenseModalOpen] = useState(false);
  const [isFormulaModalOpen, setIsFormulaModalOpen] = useState(false);
  
  const [promptConfig, setPromptConfig] = useState<PromptConfig>({
    isOpen: false, title: "", defaultValue: "", type: null, error: ""
  });
  
  const [confirmConfig, setConfirmConfig] = useState<ConfirmConfig>({
    isOpen: false, title: "", message: "", onConfirm: () => {}
  });

  return {
    isSettingsModalOpen, setIsSettingsModalOpen,
    settingsModalInitialTab, setSettingsModalInitialTab,
    isStyleModalOpen, setIsStyleModalOpen,
    isExportModalOpen, setIsExportModalOpen,
    isImageModalOpen, setIsImageModalOpen,
    editingImageInfo, setEditingImageInfo,
    isMapModalOpen, setIsMapModalOpen,
    isTableModalOpen, setIsTableModalOpen,
    isMergeModalOpen, setIsMergeModalOpen,
    isYoutubeModalOpen, setIsYoutubeModalOpen,
    youtubeInitialUrl, setYoutubeInitialUrl,
    isAboutModalOpen, setIsAboutModalOpen,
    isLicenseModalOpen, setIsLicenseModalOpen,
    isFormulaModalOpen, setIsFormulaModalOpen,
    promptConfig, setPromptConfig,
    confirmConfig, setConfirmConfig
  };
};
