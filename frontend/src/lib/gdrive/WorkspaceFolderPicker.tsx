'use client';

import { useEffect, useState } from 'react';
import { createRoot } from 'react-dom/client';
import { listDriveChildren, createDriveFolder, GoogleDriveFileItem } from './googleDriveClient';

type Folder = { id: string; name: string; path?: Array<{ id: string; name: string }> };

function FolderPicker({ token, initialPath, done }: { token: string; initialPath: Folder[]; done: (folder: Folder | null) => void }) {
  const [path, setPath] = useState<Folder[]>(initialPath);
  const [folders, setFolders] = useState<GoogleDriveFileItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [name, setName] = useState('');
  const [creating, setCreating] = useState(false);
  const current = path[path.length - 1];
  useEffect(() => {
    let active = true;
    setLoading(true); setError(''); setFolders([]);
    listDriveChildren(token, current.id).then(items => {
      if (active) setFolders(items.filter(item => item.isFolder));
    }).catch(e => { if (active) setError(e.message || '폴더를 불러오지 못했습니다.'); })
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, [token, current.id]);
  useEffect(() => {
    const close = (event: KeyboardEvent) => { if (event.key === 'Escape') done(null); };
    window.addEventListener('keydown', close);
    return () => window.removeEventListener('keydown', close);
  }, [done]);
  return <div className="fixed inset-0 z-[9999] bg-black/60 flex items-center justify-center p-4">
    <div role="dialog" aria-modal="true" aria-labelledby="drive-workspace-title" className="w-full max-w-lg rounded-xl bg-white text-slate-900 shadow-xl p-6 space-y-4">
      <h2 id="drive-workspace-title" className="text-xl font-semibold">구글 드라이브 작업장 선택</h2>
      <p className="text-sm text-slate-600">온리비가 접근할 수 있는 폴더가 표시됩니다. 폴더를 열고 ‘이 폴더 사용’을 눌러 주세요.</p>
      <div className="flex flex-wrap gap-2 text-sm">{path.map((folder, index) => <button key={folder.id} className="text-blue-700 underline" onClick={() => setPath(path.slice(0, index + 1))}>{folder.name}{index < path.length - 1 ? ' /' : ''}</button>)}</div>
      <div className="h-64 overflow-y-auto border rounded-lg p-2">
        {loading ? <p className="p-3">폴더를 불러오는 중...</p> : error ? <p role="alert" className="text-red-700 p-3">{error}</p> : folders.length ? folders.map(folder => <button key={folder.id} className="block w-full text-left p-3 rounded hover:bg-blue-50 focus:bg-blue-50" onClick={() => setPath([...path, { id: folder.id, name: folder.name }])}>📁 {folder.name}</button>) : <p className="p-3 text-sm text-slate-600">접근 가능한 하위 폴더가 없습니다.</p>}
      </div>
      <form className="flex gap-2" onSubmit={async event => {
        event.preventDefault();
        if (!name.trim() || creating) return;
        setCreating(true); setError('');
        try {
          const id = await createDriveFolder(token, name.trim(), current.id);
          setPath([...path, { id, name: name.trim() }]); setName('');
        } catch (e) { setError(e instanceof Error ? e.message : '폴더를 만들지 못했습니다.'); }
        finally { setCreating(false); }
      }}><input aria-label="새 폴더 이름" placeholder="새 폴더 이름" className="min-w-0 flex-1 border rounded px-3 py-2" value={name} maxLength={100} onChange={event => setName(event.target.value)} /><button disabled={loading || creating || !name.trim()} className="border rounded px-3 py-2 disabled:opacity-50">폴더 만들기</button></form>
      <div className="flex justify-end gap-3"><button autoFocus disabled={creating} className="px-4 py-2 rounded border" onClick={() => done(null)}>취소</button><button disabled={loading || creating || Boolean(error)} className="px-4 py-2 rounded bg-blue-700 text-white disabled:opacity-50" onClick={() => done({ ...current, path })}>이 폴더 사용</button></div>
    </div>
  </div>;
}

export function pickAccessibleDriveFolder(token: string, initialPath: Folder[]): Promise<Folder | null> {
  return new Promise(resolve => {
    const container = document.createElement('div');
    document.body.appendChild(container);
    const root = createRoot(container);
    const previousFocus = document.activeElement as HTMLElement | null;
    let settled = false;
    const done = (folder: Folder | null) => {
      if (settled) return;
      settled = true;
      root.unmount(); container.remove(); previousFocus?.focus(); resolve(folder);
    };
    root.render(<FolderPicker token={token} initialPath={initialPath} done={done} />);
  });
}
