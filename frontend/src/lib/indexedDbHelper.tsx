"use client";

import React from 'react';
import { FileText, FileCode, FileJson, FileType, File, Folder, Library } from 'lucide-react';
import { msg } from './systemMessages';

// IndexedDB 헬퍼 (핸들 저장을 위해 필요)
// ====================================================================
// 📊 [OMD-CORE-indexedDbHelper-0001 ✅ FIXED] indexedDbHelper.tsx ➔ idb
// 🎯 @KICK  : IndexedDB 기반 key-value 저장 헬퍼 (get/set/del/clear)
// 🛡️ @GUARD : onupgradeneeded 스토어 생성, objectStoreNames 존재 여부 체크
// 🚨 @PATCH : **2026-09-05** — idb.del 및 idb.clear 메서드 구현 추가 (리소스 폴더 해제 시 IndexedDB의 resourceFolderHandle이 삭제되지 않아 브라우저 새로고침(F5) 시 이전 폴더로 재연결되던 결함 완벽 해결)
// 🔗 @CALLS : 없음
// ====================================================================
export const idb = {
  get: (key: string) => new Promise<any>((resolve, reject) => {
    const req = indexedDB.open('onrivi-author-db', 1);
    req.onupgradeneeded = () => req.result.createObjectStore('store');
    req.onsuccess = () => {
      const db = req.result;
      if (!db.objectStoreNames.contains('store')) return resolve(null);
      const tx = db.transaction('store', 'readonly');
      const getReq = tx.objectStore('store').get(key);
      getReq.onsuccess = () => resolve(getReq.result);
      getReq.onerror = () => reject(getReq.error);
    };
    req.onerror = () => reject(req.error);
  }),
  set: (key: string, val: any) => new Promise<void>((resolve, reject) => {
    const req = indexedDB.open('onrivi-author-db', 1);
    req.onupgradeneeded = () => req.result.createObjectStore('store');
    req.onsuccess = () => {
      const db = req.result;
      const tx = db.transaction('store', 'readwrite');
      const putReq = tx.objectStore('store').put(val, key);
      putReq.onsuccess = () => resolve();
      putReq.onerror = () => reject(putReq.error);
    };
    req.onerror = () => reject(req.error);
  }),
  del: (key: string) => new Promise<void>((resolve, reject) => {
    const req = indexedDB.open('onrivi-author-db', 1);
    req.onupgradeneeded = () => req.result.createObjectStore('store');
    req.onsuccess = () => {
      const db = req.result;
      if (!db.objectStoreNames.contains('store')) return resolve();
      const tx = db.transaction('store', 'readwrite');
      const delReq = tx.objectStore('store').delete(key);
      delReq.onsuccess = () => resolve();
      delReq.onerror = () => reject(delReq.error);
    };
    req.onerror = () => reject(req.error);
  }),
  clear: () => new Promise<void>((resolve, reject) => {
    const req = indexedDB.open('onrivi-author-db', 1);
    req.onupgradeneeded = () => req.result.createObjectStore('store');
    req.onsuccess = () => {
      const db = req.result;
      if (!db.objectStoreNames.contains('store')) return resolve();
      const tx = db.transaction('store', 'readwrite');
      const clearReq = tx.objectStore('store').clear();
      clearReq.onsuccess = () => resolve();
      clearReq.onerror = () => reject(clearReq.error);
    };
    req.onerror = () => reject(req.error);
  })
};

// 파일 트리 노드 타입 (재귀 구조)
export type FileNode = {
  name: string;
  kind: 'file' | 'directory';
  handle?: any;
  path?: string;
  children?: FileNode[];
};

// 폴더를 재귀적으로 스캔하는 함수 (상대 경로인 parentPath를 인자로 받아 노드별 path 가상 경로 부여)
// ====================================================================
// 📊 [OMD-CORE-indexedDbHelper-0002] indexedDbHelper.tsx ➔ scanDirectory
// 🎯 @KICK  : File System Access API로 폴더를 재귀 스캔하여 .md/.markdown 파일 트리 구축
// 🛡️ @GUARD : directory/file kind 분기, 오류 시 빈 배열 반환, 파일명 필터링
// 🚨 @PATCH : **2026-08-19** — scanDirectory 성능 최적화 (Promise.all 병렬 처리 및 node_modules, 숨김 파일 무시 스킵 로직 적용)
//             localeCompare로 폴더 우선 정렬
// 🔗 @CALLS : msg.error
// ====================================================================
export async function scanDirectory(dirHandle: any, parentPath: string = ""): Promise<FileNode[]> {
  const entries: FileNode[] = [];
  const dirPromises: Promise<void>[] = [];

  try {
    for await (const [name, handle] of dirHandle.entries()) {
      // 🚀 [최적화] 숨김 파일(.git, .obsidian 등) 및 node_modules 폴더는 무시하여 스캔 속도 대폭 향상
      if (name.startsWith('.') || name === 'node_modules') continue;

      const currentPath = parentPath ? `${parentPath}/${name}` : name;
        if (handle.kind === 'directory') {
          // ⚡ [최적화] 웹 환경 초기 로딩 속도 향상을 위해 재귀 스캔을 중단하고 지연 로딩(Lazy Load)으로 전환
          entries.push({ name, kind: 'directory', handle, children: [], path: currentPath });
        } else if (handle.kind === 'file') {
        const nameLower = name.toLowerCase();
        if (nameLower.endsWith('.md') || nameLower.endsWith('.markdown') || nameLower.endsWith('.bib')) {
          entries.push({ name, kind: 'file', handle, path: currentPath });
        }
      }
    }
    // 모든 하위 디렉토리 스캔을 병렬로 기다림
    await Promise.all(dirPromises);
  } catch (e) {
    msg.error("Directory scan error", e);
  }
  return entries.sort((a, b) => {
    if (a.kind === b.kind) {
      return a.name.localeCompare(b.name, 'en', { numeric: true, sensitivity: 'base' });
    }
    return a.kind === 'directory' ? -1 : 1;
  });
}

// 파일/폴더 확장자에 따른 아이콘 및 색상 반환 함수
// ====================================================================
// 📊 [OMD-CORE-indexedDbHelper-0003] indexedDbHelper.tsx ➔ getFileIcon
// 🎯 @KICK  : 파일/폴더 확장자에 따른 Lucide 아이콘 및 색상 반환
// 🛡️ @GUARD : directory/file 분기, 확장자 lowercase 매핑
// 🚨 @PATCH : 없음
// 🔗 @CALLS : 없음
// ====================================================================
export const getFileIcon = (node: FileNode, isSelected: boolean) => {
  const baseClass = "shrink-0 transition-colors";
  
  if (node.kind === 'directory') {
    return <Folder size={16} className={`${baseClass} text-yellow-500 fill-yellow-500/20`} />;
  }

  const fileName = node.name;
  const ext = fileName.split('.').pop()?.toLowerCase();
  
  if (ext === 'md' || ext === 'markdown') return <FileText size={16} className={`${baseClass} text-blue-500`} />;
  if (ext === 'bib') return <Library size={16} className={`${baseClass} text-purple-500`} />;
  if (ext === 'js' || ext === 'jsx') return <FileCode size={16} className={`${baseClass} text-yellow-500`} />;
  if (ext === 'ts' || ext === 'tsx') return <FileCode size={16} className={`${baseClass} text-blue-400`} />;
  if (ext === 'json') return <FileJson size={16} className={`${baseClass} text-orange-400`} />;
  if (ext === 'css') return <FileType size={16} className={`${baseClass} text-blue-300`} />;
  if (ext === 'html') return <FileCode size={16} className={`${baseClass} text-orange-500`} />;
  
  return <File size={16} className={`${baseClass} ${isSelected ? "text-blue-500" : "text-gray-400"}`} />;
};
