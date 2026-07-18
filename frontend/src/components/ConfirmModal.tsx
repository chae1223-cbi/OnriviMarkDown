"use client"; // "use client" : 클라이언트 사이드 렌더링을 위한 지시어

import React, { useState, useEffect } from 'react'; // React : 리액트 라이브러리
import { createPortal } from 'react-dom'; // createPortal : 포털 생성
import { X, AlertCircle } from 'lucide-react'; // X : 닫기 아이콘, AlertCircle : 경고 아이콘

/**
 * [ONR-UI-009] ConfirmModalProps 인터페이스
 * @description 저장 안 하고 탭 닫기 등의 의사결정을 묻는 ConfirmModal 대화 상자 매개변수 명세입니다.
 */
interface ConfirmModalProps {
  isOpen: boolean; // isOpen : 모달이 열려 있는지 여부
  title: string; // title : 모달 제목
  message: string; // message : 모달 내용
  confirmText?: string; // confirmText : 확인 버튼 텍스트
  cancelText?: string; // cancelText : 취소 버튼 텍스트
  onConfirm: () => void; // onConfirm : 확인 버튼 클릭 시 실행할 함수
  onCancel: () => void; // onCancel : 취소 버튼 클릭 시 실행할 함수
  isDanger?: boolean; // isDanger : 위험 버튼 여부
}

/**
 * [ONR-UI-010] ConfirmModal 컴포넌트 함수
 * @description 작업의 실행 여부를 예/아니오 단추와 위험성 경고 아이콘 등으로 확인받는 포털 기반 범용 컨펌 창입니다.
 */
// ====================================================================
// 📊 [OMD-CORE-ConfirmModal-0001] ConfirmModal ➔ ConfirmModal
// 🎯 @KICK  : 확인/취소 선택과 위험 경고 아이콘을 표시하는 포털 기반 범용 컨펌 모달
// 🛡️ @GUARD : isOpen 및 mounted 상태 모두 true일 때만 렌더링, isDanger에 따라 스타일 분기
// 🚨 @PATCH : 없음
// 🔗 @CALLS : 없음
// ====================================================================
export default function ConfirmModal({ // ConfirmModal : 확인/취소 선택과 위험 경고 아이콘을 표시하는 포털 기반 범용 컨펌 모달
  isOpen,  // isOpen : 모달이 열려 있는지 여부
  title,   // title : 모달 제목
  message, // message : 모달 내용
  confirmText = "확인", // confirmText : 확인 버튼 텍스트
  cancelText = "취소", // cancelText : 취소 버튼 텍스트
  onConfirm, // onConfirm : 확인 버튼 클릭 시 실행할 함수
  onCancel,  // onCancel : 취소 버튼 클릭 시 실행할 함수
  isDanger = false // isDanger : 위험 버튼 여부
}: ConfirmModalProps) { // ConfirmModalProps : 컨펌 모달의 매개변수 명세
  const [mounted, setMounted] = useState(false); // mounted : 모달이 마운트되었는지 여부

  useEffect(() => {  // useEffect : 컴포넌트가 마운트되었을 때 실행할 함수
    setMounted(true);
  }, []); // [] : 의존성 배열, 빈 배열이면 컴포넌트가 마운트되었을 때만 실행

  // Enter or Escape Key Down
  // ====================================================================
  // 📊 [OMD-CORE-ConfirmModal-0002] ConfirmModal ➔ useEffect (handleKeyDown)
  // 🎯 @KICK  : Escape/Enter 키 입력 시 각각 취소/확인 콜백 자동 실행
  // 🛡️ @GUARD : isOpen이 false면 이벤트 무시
  // 🚨 @PATCH : 없음
  // 🔗 @CALLS : onCancel, onConfirm
  // ====================================================================
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => { // handleKeyDown : 키보드 입력 처리
      if (!isOpen) return; // if : 모달이 열려 있지 않으면 null을 반환
      if (e.key === 'Escape') onCancel(); // if : Escape 키를 누르면 onCancel() 실행
      if (e.key === 'Enter') onConfirm(); // if : Enter 키를 누르면 onConfirm() 실행
    };

    window.addEventListener('keydown', handleKeyDown); // window.addEventListener : 이벤트 리스너 추가
    return () => window.removeEventListener('keydown', handleKeyDown); // window.removeEventListener : 이벤트 리스너 제거
  }, [isOpen, onConfirm, onCancel]); // [] : 의존성 배열, 빈 배열이면 컴포넌트가 마운트되었을 때만 실행

  if (!isOpen) return null; // if : 모달이 열려 있지 않으면 null을 반환
  if (!mounted) return null; // if : 모달이 마운트되지 않았으면 null을 반환

  return createPortal(
    <div className="fixed inset-0 z-[99999] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200" style={{ overflowY: "auto" }}>
      <div
        className="w-full max-w-sm bg-white dark:bg-[#1e1e1e] rounded-2xl shadow-2xl border border-black/10 dark:border-white/10 animate-in zoom-in-95 duration-200 flex flex-col"
        style={{ maxHeight: "90dvh" }}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-black/5 dark:border-white/5 bg-gray-50/50 dark:bg-white/5 shrink-0">
          <div className="flex items-center gap-2">
            <AlertCircle size={18} className={isDanger ? "text-red-500" : "text-blue-500"} />
            <h3 className="text-sm font-bold text-gray-800 dark:text-gray-100">{title}</h3>
          </div>
          <button
            onClick={onCancel}
            className="p-1 hover:bg-black/5 dark:hover:bg-white/5 rounded-md transition-colors text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
          >
            <X size={18} />
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto min-h-0 p-6">
          <p className="text-sm text-gray-600 dark:text-gray-300 leading-relaxed whitespace-pre-wrap">
            {message}
          </p>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 px-6 pb-6 shrink-0">
          <button
            onClick={onCancel}
            className="px-4 py-2 text-xs font-bold text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 transition-colors"
          >
            {cancelText}
          </button>
          <button
            onClick={onConfirm}
            className={`px-5 py-2.5 ${isDanger
              ? 'bg-red-600 hover:bg-red-500 shadow-red-500/20'
              : 'bg-blue-600 hover:bg-blue-500 shadow-blue-500/20'
              } text-white text-xs font-bold rounded-xl shadow-lg transition-all active:scale-95`}
          >
            {confirmText}
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
}
