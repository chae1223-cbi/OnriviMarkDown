"use client";

import React, { useState } from 'react';
import { X, Sparkles, Wand2 } from 'lucide-react';
import { useToast } from '@/components/ToastProvider';

interface AIDraftModalProps {
  onClose: () => void;
  onGenerate: (domain: string, docType: string, topic: string) => void;
}

const DOMAIN_OPTIONS = [
  {
    id: '직장인 (비즈니스 및 실무)',
    label: '직장인 (비즈니스)',
    docTypes: ['기획서', '보고서', '비즈니스 이메일', '프레젠테이션 대본', '회의록']
  },
  {
    id: '작가 (문학적·창의적)',
    label: '작가 (문학적)',
    docTypes: ['시놉시스', '소설 프롤로그', '에세이', '캐릭터 설정', '대본']
  },
  {
    id: '학생 (학술적)',
    label: '학생 (학술적)',
    docTypes: ['보고서', '에세이', '연구 계획서', '서평', '프로젝트 요약']
  },
  {
    id: '생활 (실용적·논리적)',
    label: '생활 (실용적)',
    docTypes: ['안내문', '사용 설명서', '공문서', '블로그 포스트', '칼럼']
  }
];

export default function AIDraftModal({ onClose, onGenerate }: AIDraftModalProps) {
  const { showToast } = useToast();
  const [selectedDomain, setSelectedDomain] = useState(DOMAIN_OPTIONS[0]);
  const [selectedDocType, setSelectedDocType] = useState(DOMAIN_OPTIONS[0].docTypes[0]);
  const [topic, setTopic] = useState('');

  const handleDomainChange = (domainId: string) => {
    const domain = DOMAIN_OPTIONS.find(d => d.id === domainId) || DOMAIN_OPTIONS[0];
    setSelectedDomain(domain);
    setSelectedDocType(domain.docTypes[0]);
  };

  const handleGenerate = () => {
    if (!topic.trim()) {
      showToast("작성할 문서의 주제나 내용을 입력해 주세요.", "warning");
      return;
    }
    onGenerate(selectedDomain.id, selectedDocType, topic);
  };

  return (
    <div className="fixed inset-0 z-[99999] flex items-center justify-center bg-black/40 backdrop-blur-sm" onMouseDown={onClose}>
      <div
        className="bg-white dark:bg-zinc-800 w-[500px] max-w-[90vw] rounded-xl shadow-2xl flex flex-col border border-zinc-200 dark:border-zinc-700/50"
        onMouseDown={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-zinc-100 dark:border-zinc-700/50">
          <div className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-indigo-500" />
            <h2 className="text-[15px] font-bold text-zinc-800 dark:text-zinc-100">AI 맞춤형 초안 생성기</h2>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-md hover:bg-zinc-100 dark:hover:bg-zinc-700 text-zinc-500 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Body */}
        <div className="p-5 flex flex-col gap-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col gap-1.5">
              <label className="text-[12px] font-bold text-zinc-600 dark:text-zinc-400">분류 (도메인)</label>
              <select
                value={selectedDomain.id}
                onChange={(e) => handleDomainChange(e.target.value)}
                className="w-full bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 rounded-lg px-3 py-2 text-[13px] text-zinc-800 dark:text-zinc-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
              >
                {DOMAIN_OPTIONS.map(d => (
                  <option key={d.id} value={d.id}>{d.label}</option>
                ))}
              </select>
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-[12px] font-bold text-zinc-600 dark:text-zinc-400">문서 종류</label>
              <select
                value={selectedDocType}
                onChange={(e) => setSelectedDocType(e.target.value)}
                className="w-full bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 rounded-lg px-3 py-2 text-[13px] text-zinc-800 dark:text-zinc-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
              >
                {selectedDomain.docTypes.map(type => (
                  <option key={type} value={type}>{type}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-[12px] font-bold text-zinc-600 dark:text-zinc-400">주제 및 핵심 내용</label>
            <textarea
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              placeholder="문서에 포함될 핵심 키워드, 주제, 혹은 작성 방향을 자유롭게 입력해 주세요."
              className="w-full bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 rounded-lg px-3 py-2 text-[13px] text-zinc-800 dark:text-zinc-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 resize-none h-28"
            />
          </div>
        </div>

        {/* Footer */}
        <div className="px-5 py-4 border-t border-zinc-100 dark:border-zinc-700/50 flex justify-end gap-2 bg-zinc-50 dark:bg-zinc-800/50 rounded-b-xl">
          <button
            onClick={onClose}
            className="px-4 py-2 text-[13px] font-medium text-zinc-600 dark:text-zinc-300 hover:bg-zinc-200 dark:hover:bg-zinc-700 rounded-lg transition-colors"
          >
            취소
          </button>
          <button
            onClick={handleGenerate}
            className="px-4 py-2 text-[13px] font-bold text-white bg-indigo-500 hover:bg-indigo-600 rounded-lg flex items-center gap-1.5 transition-colors shadow-sm"
          >
            <Wand2 className="w-4 h-4" />
            초안 생성하기
          </button>
        </div>
      </div>
    </div>
  );
}
