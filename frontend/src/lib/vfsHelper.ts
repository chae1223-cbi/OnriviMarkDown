/*
 * vfsHelper.ts — Virtual File System (가상 파일 시스템)
 *
 * 브라우저 localStorage를 기반으로 한 단순한 가상 파일 시스템입니다.
 * 실제 파일 I/O 없이도 .md 파일을 생성/수정/삭제/이름변경할 수 있습니다.
 *
 * 구조:
 * - 파일 목록: localStorage['onrivi_vfs_files'] (FileNode[] 직렬화)
 * - 파일 내용: localStorage['onrivi_vfs_content_<path>'] (원문 문자열)
 *
 * 초기화 시 Welcome.md 파일이 자동 생성되며, 내용은 constants/welcomeContent.ts의
 * DEFAULT_WELCOME_MD를 사용합니다.
 */

import { FileNode } from './helper';
import { msg } from './msg';
import { DEFAULT_WELCOME_MD } from '@/constants/welcomeContent';

const DEFAULT_WELCOME_TEXT = DEFAULT_WELCOME_MD;

// 파일 목록 스토리지 키
const VFS_FILES_KEY = 'onrivi_vfs_files';

// 파일 내용 스토리지 키 접두사
const VFS_CONTENT_PREFIX = 'onrivi_vfs_content_';

/**
 * 로컬 스토리지에서 가상 파일 목록을 조회합니다.
 * 없을 경우 기본 Welcome.md 파일을 포함하여 초기화합니다.
 */
// ====================================================================
// 📊 [OMD-FILE-vfsHelper-0001] vfsHelper.ts ➔ getVfsFiles
// 🎯 @KICK  : localStorage에서 가상 파일 목록 조회, 없으면 Welcome.md로 초기화
// 🛡️ @GUARD : window 부재, JSON 파싱 오류 시 빈 배열
// 🚨 @PATCH : 없음
// 🔗 @CALLS : saveVfsFiles, vfsWriteFile, msg.error
// ====================================================================
export function getVfsFiles(): FileNode[] {
  if (typeof window === 'undefined') return [];
  
  const saved = localStorage.getItem(VFS_FILES_KEY);
  if (!saved) {
    // 초기화
    const initialFiles: FileNode[] = [
      {
        name: 'Welcome.md',
        kind: 'file',
        path: 'Welcome.md'
      }
    ];
    saveVfsFiles(initialFiles);
    vfsWriteFile('Welcome.md', DEFAULT_WELCOME_TEXT);
    return initialFiles;
  }
  
  try {
    return JSON.parse(saved);
  } catch (e) {
    msg.error('가상 파일 트리 파싱 오류', e);
    return [];
  }
}

/**
 * 가상 파일 목록 구조를 로컬 스토리지에 저장합니다.
 */
// ====================================================================
// 📊 [OMD-FILE-vfsHelper-0002] vfsHelper.ts ➔ saveVfsFiles
// 🎯 @KICK  : 가상 파일 목록을 localStorage에 JSON 직렬화하여 저장
// 🛡️ @GUARD : window 부재
// 🚨 @PATCH : 없음
// 🔗 @CALLS : 없음
// ====================================================================
export function saveVfsFiles(files: FileNode[]): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(VFS_FILES_KEY, JSON.stringify(files));
}

/**
 * [ONR-IO-002] 가상 VFS 입출력 핸들러 (vfsReadFile / vfsWriteFile)
 * 가상 파일의 텍스트 내용을 가져옵니다.
 */
// ====================================================================
// 📊 [OMD-FILE-vfsHelper-0003] vfsHelper.ts ➔ vfsReadFile
// 🎯 @KICK  : 가상 파일 텍스트 내용을 localStorage에서 조회
// 🛡️ @GUARD : window 부재, null 반환 시 빈 문자열
// 🚨 @PATCH : 없음
// 🔗 @CALLS : 없음
// ====================================================================
export function vfsReadFile(path: string): string {
  if (typeof window === 'undefined') return '';
  const content = localStorage.getItem(VFS_CONTENT_PREFIX + path);
  return content !== null ? content : '';
}

/**
 * 가상 파일의 내용을 로컬 스토리지에 기록합니다.
 */
export function vfsWriteFile(path: string, content: string): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(VFS_CONTENT_PREFIX + path, content);
}

/**
 * 특정 경로에서 노드를 검색하는 헬퍼 함수
 */
// ====================================================================
// 📊 [OMD-FILE-vfsHelper-0005] vfsHelper.ts ➔ findNodeByPath
// 🎯 @KICK  : 노드 배열에서 path로 노드 재귀 검색
// 🛡️ @GUARD : directory kind 확인, children 순회
// 🚨 @PATCH : 없음
// 🔗 @CALLS : 없음
// ====================================================================
function findNodeByPath(nodes: FileNode[], path: string): FileNode | null {
  for (const node of nodes) {
    if (node.path === path) return node;
    if (node.kind === 'directory' && node.children) {
      const found = findNodeByPath(node.children, path);
      if (found) return found;
    }
  }
  return null;
}

/**
 * 새 파일을 가상 파일 시스템에 추가합니다.
 */
// ====================================================================
// 📊 [OMD-FILE-vfsHelper-0006] vfsHelper.ts ➔ vfsCreateFile
// 🎯 @KICK  : 가상 파일 시스템에 새 .md 파일 생성 (확장자 자동 추가)
// 🛡️ @GUARD : parentPath 분기, findNodeByPath로 부모 폴더 검증, throw Error
// 🚨 @PATCH : 없음
// 🔗 @CALLS : getVfsFiles, saveVfsFiles, vfsWriteFile, findNodeByPath
// ====================================================================
export function vfsCreateFile(parentPath: string, name: string): void {
  const files = getVfsFiles();
  const fileName = name.endsWith('.md') ? name : `${name}.md`;
  const filePath = parentPath ? `${parentPath}/${fileName}` : fileName;
  
  const newFile: FileNode = {
    name: fileName,
    kind: 'file',
    path: filePath
  };

  if (!parentPath) {
    files.push(newFile);
  } else {
    const parent = findNodeByPath(files, parentPath);
    if (parent && parent.kind === 'directory') {
      if (!parent.children) parent.children = [];
      parent.children.push(newFile);
    } else {
      throw new Error('부모 폴더를 찾을 수 없습니다.');
    }
  }

  saveVfsFiles(files);
  vfsWriteFile(filePath, ''); // 빈 파일 생성
}

/**
 * 새 폴더를 가상 파일 시스템에 추가합니다.
 */
// ====================================================================
// 📊 [OMD-FILE-vfsHelper-0007] vfsHelper.ts ➔ vfsCreateFolder
// 🎯 @KICK  : 가상 파일 시스템에 새 폴더 생성
// 🛡️ @GUARD : parentPath 존재 여부에 따른 루트/하위 분기, findNodeByPath로 부모 검증
// 🚨 @PATCH : 없음
// 🔗 @CALLS : getVfsFiles, saveVfsFiles, findNodeByPath
// ====================================================================
export function vfsCreateFolder(parentPath: string, name: string): void {
  const files = getVfsFiles();
  const folderPath = parentPath ? `${parentPath}/${name}` : name;
  
  const newFolder: FileNode = {
    name,
    kind: 'directory',
    path: folderPath,
    children: []
  };

  if (!parentPath) {
    files.push(newFolder);
  } else {
    const parent = findNodeByPath(files, parentPath);
    if (parent && parent.kind === 'directory') {
      if (!parent.children) parent.children = [];
      parent.children.push(newFolder);
    } else {
      throw new Error('부모 폴더를 찾을 수 없습니다.');
    }
  }

  saveVfsFiles(files);
}

/**
 * 파일 및 폴더 구조 내에서 경로를 재귀적으로 수정합니다.
 */
// ====================================================================
// 📊 [OMD-FILE-vfsHelper-0008] vfsHelper.ts ➔ updateChildPaths
// 🎯 @KICK  : 노드 및 하위 노드의 path를 old 접두사에서 new 접두사로 재귀 교체
// 🛡️ @GUARD : directory kind 확인, children 존재 여부
// 🚨 @PATCH : 없음
// 🔗 @CALLS : 없음
// ====================================================================
function updateChildPaths(node: FileNode, oldPathPrefix: string, newPathPrefix: string): void {
  if (node.path) {
    node.path = node.path.replace(oldPathPrefix, newPathPrefix);
  }
  if (node.kind === 'directory' && node.children) {
    for (const child of node.children) {
      updateChildPaths(child, oldPathPrefix, newPathPrefix);
    }
  }
}

/**
 * 가상 파일/폴더의 이름을 변경하고 경로를 수정합니다.
 */
// ====================================================================
// 📊 [OMD-FILE-vfsHelper-0009] vfsHelper.ts ➔ vfsRename
// 🎯 @KICK  : 가상 파일/폴더 이름 변경 및 경로 수정 (하위 콘텐츠 키 마이그레이션)
// 🛡️ @GUARD : file/directory 분기, 하위 경로 updateChildPaths 재귀 호출
// 🚨 @PATCH : 없음
// 🔗 @CALLS : getVfsFiles, vfsReadFile, vfsWriteFile, saveVfsFiles, updateChildPaths
// ====================================================================
export function vfsRename(oldPath: string, newPath: string): void {
  const files = getVfsFiles();
  
  // 변경 대상 노드 탐색 및 수정
  const updateNodeNameAndPath = (nodes: FileNode[]): boolean => {
    for (const node of nodes) {
      if (node.path === oldPath) {
        // 이름 추출
        const newName = newPath.split('/').pop() || newPath;
        
        // 파일인 경우 데이터 복사 후 이전 키 삭제
        if (node.kind === 'file') {
          const content = vfsReadFile(oldPath);
          vfsWriteFile(newPath, content);
          localStorage.removeItem(VFS_CONTENT_PREFIX + oldPath);
        } else if (node.kind === 'directory') {
          // 폴더일 때 하위 파일들의 콘텐츠 키 마이그레이션 및 하위 노드 경로 변경
          const migrateContents = (n: FileNode) => {
            if (n.kind === 'file' && n.path) {
              const childOldPath = n.path;
              const childNewPath = n.path.replace(oldPath, newPath);
              const content = vfsReadFile(childOldPath);
              vfsWriteFile(childNewPath, content);
              localStorage.removeItem(VFS_CONTENT_PREFIX + childOldPath);
            }
            if (n.kind === 'directory' && n.children) {
              n.children.forEach(migrateContents);
            }
          };
          migrateContents(node);
          
          // 하위 경로 노드 업데이트
          updateChildPaths(node, oldPath, newPath);
        }

        node.name = newName;
        node.path = newPath;
        return true;
      }
      if (node.kind === 'directory' && node.children) {
        if (updateNodeNameAndPath(node.children)) return true;
      }
    }
    return false;
  };

  updateNodeNameAndPath(files);
  saveVfsFiles(files);
}

/**
 * 가상 파일/폴더를 삭제합니다. 하위 콘텐츠도 함께 정리합니다.
 */
// ====================================================================
// 📊 [OMD-FILE-vfsHelper-0010] vfsHelper.ts ➔ vfsDelete
// 🎯 @KICK  : 가상 파일/폴더 삭제 (하위 콘텐츠 localStorage 정리 포함)
// 🛡️ @GUARD : 재귀 clearContents로 하위 파일 키 일괄 제거
// 🚨 @PATCH : 없음
// 🔗 @CALLS : getVfsFiles, saveVfsFiles
// ====================================================================
export function vfsDelete(path: string): void {
  const files = getVfsFiles();

  const removeNode = (nodes: FileNode[]): boolean => {
    for (let i = 0; i < nodes.length; i++) {
      const node = nodes[i];
      if (node.path === path) {
        // 삭제 대상 노드의 콘텐츠 정리
        const clearContents = (n: FileNode) => {
          if (n.kind === 'file' && n.path) {
            localStorage.removeItem(VFS_CONTENT_PREFIX + n.path);
          }
          if (n.kind === 'directory' && n.children) {
            n.children.forEach(clearContents);
          }
        };
        clearContents(node);

        nodes.splice(i, 1);
        return true;
      }
      if (node.kind === 'directory' && node.children) {
        if (removeNode(node.children)) return true;
      }
    }
    return false;
  };

  removeNode(files);
  saveVfsFiles(files);
}
