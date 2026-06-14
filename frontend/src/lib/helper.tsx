"use client";

import React from 'react';
import { FileText, FileCode, FileJson, FileType, File, Folder } from 'lucide-react';
import { msg } from './msg';

// IndexedDB 헬퍼 (핸들 저장을 위해 필요)
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
export async function scanDirectory(dirHandle: any, parentPath: string = ""): Promise<FileNode[]> {
  const entries: FileNode[] = [];
  try {
    for await (const [name, handle] of dirHandle.entries()) {
      const currentPath = parentPath ? `${parentPath}/${name}` : name;
      if (handle.kind === 'directory') {
        const children = await scanDirectory(handle, currentPath);
        entries.push({ name, kind: 'directory', handle, children, path: currentPath });
      } else if (handle.kind === 'file') {
        const nameLower = name.toLowerCase();
        if (nameLower.endsWith('.md') || nameLower.endsWith('.markdown')) {
          entries.push({ name, kind: 'file', handle, path: currentPath });
        }
      }
    }
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
export const getFileIcon = (node: FileNode, isSelected: boolean) => {
  const baseClass = "shrink-0 transition-colors";
  
  if (node.kind === 'directory') {
    return <Folder size={16} className={`${baseClass} text-yellow-500 fill-yellow-500/20`} />;
  }

  const fileName = node.name;
  const ext = fileName.split('.').pop()?.toLowerCase();
  
  if (ext === 'md') return <FileText size={16} className={`${baseClass} text-blue-500`} />;
  if (ext === 'js' || ext === 'jsx') return <FileCode size={16} className={`${baseClass} text-yellow-500`} />;
  if (ext === 'ts' || ext === 'tsx') return <FileCode size={16} className={`${baseClass} text-blue-400`} />;
  if (ext === 'json') return <FileJson size={16} className={`${baseClass} text-orange-400`} />;
  if (ext === 'css') return <FileType size={16} className={`${baseClass} text-blue-300`} />;
  if (ext === 'html') return <FileCode size={16} className={`${baseClass} text-orange-500`} />;
  
  return <File size={16} className={`${baseClass} ${isSelected ? "text-blue-500" : "text-gray-400"}`} />;
};
