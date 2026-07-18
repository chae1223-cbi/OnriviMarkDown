"use client";   // "use client" : 클라이언트 사이드 렌더링을 위한 지시어 

import React, { useState, useEffect } from 'react'; // useState : 상태 관리를 위해 임포트 
import { createPortal } from 'react-dom'; // createPortal : 포털을 생성하기 위해 임포트 
import { X } from 'lucide-react'; // X : 닫기 버튼을 위한 아이콘 
import OAIcon from '../app/icon_onriveauther.png'; // OAIcon : 온리비 아서 프로그램 아이콘  

/**
 * [ONR-UI-007] AboutModalProps 인터페이스
 * @description 프로그램 정보 팝업창인 AboutModal에 전달되는 상태값들과 정품 라이선스 키 상태 명세입니다.
 */
interface AboutModalProps {   // AboutModalProps : 온리비 아서 프로그램 정보 모달에 전달되는 상태값들의 인터페이스  
  isOpen: boolean; // isOpen : 모달 열림 여부를 위한 상태  
  onClose: () => void; // onClose : 모달 닫기 버튼 클릭 시 실행될 함수  
  isDarkMode: boolean; // isDarkMode : 다크 모드 여부를 위한 상태  
  licenseKey: string; // licenseKey : 정품 라이선스 키 상태  
  setLicenseKey: (v: string) => void; // setLicenseKey : 정품 라이선스 키 상태를 변경하기 위한 함수 
  isActivated: boolean; // isActivated : 정품 인증 여부를 위한 상태 
}

/**
 * [ONR-UI-008] AboutModal 컴포넌트 함수
 * @description 현재 에디터 프로그램의 버전 정보, 정품 인증 여부, 제작사 저작권 정보를 띄워주는 포털 기반 모달 창입니다.
 */
// ====================================================================
// 📊 [OMD-AUTH-AboutModal-0001] AboutModal ➔ AboutModal
// 🎯 @KICK  : 프로그램 정보, 정품 인증 상태, 저작권 정보를 표시하는 포털 기반 모달 창
// 🛡️ @GUARD : isOpen 및 mounted 상태가 모두 true일 때만 렌더링
// 🚨 @PATCH : 없음
// 🔗 @CALLS : 없음
// ====================================================================
export default function AboutModal({
  isOpen, // isOpen : 모달 열림 여부를 위한 상태  
  onClose, // onClose : 모달 닫기 버튼 클릭 시 실행될 함수  
  isDarkMode, // isDarkMode : 다크 모드 여부를 위한 상태  
  licenseKey, // licenseKey : 정품 라이선스 키 상태  
  setLicenseKey, // setLicenseKey : 정품 라이선스 키 상태를 변경하기 위한 함수 
  isActivated // isActivated : 정품 인증 여부를 위한 상태 
}: AboutModalProps) {
  const [mounted, setMounted] = useState(false); // mounted : 컴포넌트 마운트 여부를 위한 상태 

  useEffect(() => { // useEffect : 컴포넌트 마운트 시 실행될 함수 
    setMounted(true); // mounted : 컴포넌트 마운트 여부를 true로 변경 
  }, []); // [] : 의존성 배열 (빈 배열이므로 컴포넌트 마운트 시 한 번만 실행)

  if (!isOpen) return null; // if : 모달 열림 여부를 확인하고, false이면 null을 반환 
  if (!mounted) return null; // if : 컴포넌트 마운트 여부를 확인하고, false이면 null을 반환

  return createPortal(
    <div className="fixed inset-0 z-[99999] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200" onClick={onClose} style={{ overflowY: "auto" }}>
      <div
        className={`relative w-full max-w-sm rounded-2xl shadow-2xl border animate-in zoom-in-95 duration-200 flex flex-col ${isDarkMode ? 'bg-zinc-900 border-white/10' : 'bg-white border-black/5'
          }`}
        style={{ maxHeight: "90dvh", overflow: "hidden" }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className={`flex items-center justify-between px-5 py-4 border-b shrink-0 ${isDarkMode ? 'border-white/10' : 'border-black/5'}`}>
          <div className="flex items-center gap-2">
            <img src={OAIcon.src} alt="Logo" className="w-4 h-4 object-contain" />
            <h2 className="text-sm font-bold">프로그램 정보</h2>
          </div>
          <button onClick={onClose} className="p-1 hover:bg-black/5 dark:hover:bg-white/5 rounded-full transition-colors">
            <X size={16} className="opacity-50" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto min-h-0 p-6 text-center space-y-5">
          <div className="flex items-center justify-center gap-3">
            <img src={OAIcon.src} alt="온리비 어서 브랜드 아이콘" className="w-12 h-12 object-contain" />
            <h3 className="text-xl font-bold">온리비 어서</h3>
          </div>

          <div className={`inline-block px-3 py-1 rounded-full text-[10px] font-bold border ${isDarkMode ? 'bg-blue-500/10 text-blue-400 border-blue-500/20' : 'bg-blue-50 text-blue-600 border-blue-200'
            }`}>
            v1.2.0-beta
          </div>

          <div className="pt-4 border-t border-black/5 dark:border-white/10 space-y-3">
            <div className="flex items-center justify-between text-xs px-2">
              <span className="opacity-70">라이선스 상태:</span>
              {isActivated ? (
                <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-extrabold px-2 py-0.5 rounded bg-emerald-500/10 border border-emerald-500/20">
                  정품 인증됨
                </span>
              ) : (
                <span className="text-[10px] text-rose-600 dark:text-rose-400 font-extrabold px-2 py-0.5 rounded bg-rose-500/10 border border-rose-500/20 animate-pulse">
                  체험판 (인증 필요)
                </span>
              )}
            </div>

            <div className="space-y-1 text-left px-2">
              <label className="text-[10px] opacity-60 font-bold">정품 라이선스 키 등록</label>
              <input
                type="text"
                value={licenseKey}
                onChange={(e) => {
                  setLicenseKey(e.target.value);
                  if (typeof window !== 'undefined') {
                    localStorage.setItem('onrivi_license_key', e.target.value);
                    const chromeStorage = (window as any).chrome?.storage?.local;
                    if (chromeStorage) {
                      chromeStorage.set({ onrivi_license_key: e.target.value });
                    }
                    const api = (window as any).electronAPI;
                    if (api && typeof api.saveLicense === 'function') {
                      api.saveLicense(e.target.value);
                    }
                  }
                }}
                className={`w-full px-3 py-1.5 text-xs font-mono rounded border outline-none focus:ring-1 focus:ring-blue-500 shadow-sm ${isDarkMode
                    ? 'bg-zinc-800 border-white/10 text-white'
                    : 'bg-zinc-50 border-black/10 text-black'
                  }`}
                placeholder="인증 키를 입력하세요"
              />
              <p className="text-[9px] opacity-50 mt-1">
                * 올바른 정품 라이선스 키를 입력하시면 고급 내보내기 등 모든 기능이 즉시 활성화됩니다.
              </p>
            </div>
          </div>

          <p className="text-[10px] text-gray-500 dark:text-gray-400 pt-2 border-t border-black/5 dark:border-white/10 shrink-0">
            © 2024 Onrivi. All rights reserved.
          </p>
        </div>
      </div>
    </div>,
    document.body
  );
}