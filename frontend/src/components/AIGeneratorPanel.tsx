import { useState, useCallback, useRef, useEffect } from 'react';
import { Sparkles, Send, RotateCcw, Copy, Check, Loader2 } from 'lucide-react';

interface AIGeneratorPanelProps {
  isDarkMode: boolean;
  onInsert: (content: string) => void;
  onInsertWithTitle: (title: string, content: string) => void;
  
}

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';

const t = (key: string, lang: string) => {
  const labels: Record<string, Record<string, string>> = {
    title: { ko: 'AI 글 생성', en: 'AI Blog Writer', ja: 'AI記事生成', zh: 'AI文章生成' },
    keyword: { ko: '주제/키워드', en: 'Topic / Keyword', ja: 'テーマ/キーワード', zh: '主题/关键词' },
    keywordPlaceholder: { ko: '예: 자동매매 트레이딩 시스템, 주식 ...', en: 'e.g. automated trading, stocks ...', ja: '例: 自動売買システム、株式...', zh: '例如：自动交易系统、股票...' },
    category: { ko: '카테고리 (선택)', en: 'Category (optional)', ja: 'カテゴリ(任意)', zh: '分类(可选)' },
    tone: { ko: '말투/스타일 (선택)', en: 'Tone (optional)', ja: '文体(任意)', zh: '语调(可选)' },
    length: { ko: '분량', en: 'Length', ja: '分量', zh: '篇幅' },
    short: { ko: '짧게 (~1500자)', en: 'Short (~1500 chars)', ja: '短め(~1500字)', zh: '短篇(~1500字)' },
    medium: { ko: '보통 (2000~3000자)', en: 'Medium (2K~3K chars)', ja: '普通(2000~3000字)', zh: '中篇(2000~3000字)' },
    long: { ko: '길게 (3000~5000자)', en: 'Long (3K~5K chars)', ja: '長め(3000~5000字)', zh: '长篇(3000~5000字)' },
    generate: { ko: '글 생성하기', en: 'Generate', ja: '記事を生成', zh: '生成文章' },
    generating: { ko: '생성 중...', en: 'Generating...', ja: '生成中...', zh: '生成中...' },
    insert: { ko: '에디터에 삽입', en: 'Insert into Editor', ja: 'エディタに挿入', zh: '插入到编辑器' },
    inserted: { ko: '삽입 완료', en: 'Inserted', ja: '挿入完了', zh: '插入完成' },
    error: { ko: '생성 실패', en: 'Generation failed', ja: '生成失敗', zh: '生成失败' },
    result: { ko: '생성 결과', en: 'Result', ja: '生成結果', zh: '生成结果' },
    titleLabel: { ko: '제목', en: 'Title', ja: 'タイトル', zh: '标题' },
    tags: { ko: '태그', en: 'Tags', ja: 'タグ', zh: '标签' },
    regenerate: { ko: '다시 생성', en: 'Regenerate', ja: '再生成', zh: '重新生成' },
    newTopic: { ko: '새 주제 입력', en: 'New Topic', ja: '新しいテーマ', zh: '新主题' },
    noContent: { ko: '아직 생성된 글이 없습니다.', en: 'No content generated yet.', ja: 'まだ記事が生成されていません。', zh: '尚未生成文章。' },
  };
  return labels[key]?.[lang] || labels[key]?.ko || key;
};

export default function AIGeneratorPanel({ isDarkMode, onInsert, onInsertWithTitle }: AIGeneratorPanelProps) {
  const [keyword, setKeyword] = useState('');
  const [category, setCategory] = useState('');
  const [tone, setTone] = useState('');
  const [length, setLength] = useState<'short' | 'medium' | 'long'>('medium');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<{ title: string; content_markdown: string; tags: string[] } | null>(null);
  const [error, setError] = useState('');
  const [copied, setCopied] = useState(false);
  const [inserted, setInserted] = useState(false);
  const resultRef = useRef<HTMLDivElement>(null);

  const handleGenerate = useCallback(async () => {
    if (!keyword.trim()) return;
    setLoading(true);
    setError('');
    setResult(null);
    setInserted(false);

    try {
      const res = await fetch(`${API_BASE}/api/ai/generate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ keyword: keyword.trim(), category: category.trim() || undefined, tone: tone.trim() || undefined, length }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "오류");
      setResult(data);
      setTimeout(() => resultRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 100);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [keyword, category, tone, length]);

  const handleInsert = useCallback(() => {
    if (!result) return;
    onInsertWithTitle(result.title, result.content_markdown);
    setInserted(true);
    setTimeout(() => setInserted(false), 2000);
  }, [result, onInsertWithTitle]);

  const handleCopy = useCallback(() => {
    if (!result) return;
    navigator.clipboard.writeText(result.content_markdown);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }, [result]);

  const inputClass = `w-full px-3 py-2 rounded-lg border text-sm outline-none transition-colors ${
    isDarkMode
      ? 'bg-gray-800 border-gray-600 text-gray-100 placeholder-gray-400 focus:border-blue-500'
      : 'bg-white border-gray-300 text-gray-800 placeholder-gray-400 focus:border-blue-500'
  }`;

  const btnClass = `flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg font-medium text-sm transition-all disabled:opacity-50 ${
    isDarkMode
      ? 'bg-blue-600 hover:bg-blue-500 text-white'
      : 'bg-blue-600 hover:bg-blue-700 text-white'
  }`;

  return (
    <div className="flex flex-col h-full">
      <div className={`p-4 border-b ${isDarkMode ? 'border-gray-700' : 'border-gray-200'}`}>
        <div className="flex items-center gap-2 mb-1">
          <Sparkles size={16} className="text-blue-500" />
          <span className={`font-semibold text-sm ${isDarkMode ? 'text-gray-100' : 'text-gray-800'}`}>
            {'title'}
          </span>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        <div>
          <label className={`block text-xs font-medium mb-1 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
            {'keyword'}
          </label>
          <input
            className={inputClass}
            value={keyword}
            onChange={e => setKeyword(e.target.value)}
            placeholder={'keywordPlaceholder'}
            onKeyDown={e => e.key === 'Enter' && !loading && handleGenerate()}
          />
        </div>

        <div>
          <label className={`block text-xs font-medium mb-1 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
            {'category'}
          </label>
          <input className={inputClass} value={category} onChange={e => setCategory(e.target.value)} />
        </div>

        <div>
          <label className={`block text-xs font-medium mb-1 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
            {'tone'}
          </label>
          <input className={inputClass} value={tone} onChange={e => setTone(e.target.value)} />
        </div>

        <div>
          <label className={`block text-xs font-medium mb-1 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
            {'length'}
          </label>
          <div className="flex gap-2">
            {(['short', 'medium', 'long'] as const).map(l => (
              <button
                key={l}
                onClick={() => setLength(l)}
                className={`flex-1 px-3 py-2 rounded-lg text-xs font-medium transition-all ${
                  length === l
                    ? isDarkMode
                      ? 'bg-blue-600 text-white'
                      : 'bg-blue-600 text-white'
                    : isDarkMode
                      ? 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                {l}
              </button>
            ))}
          </div>
        </div>

        <button className={btnClass} onClick={handleGenerate} disabled={loading || !keyword.trim()}>
          {loading ? <Loader2 size={16} className="animate-spin" /> : <Send size={16} />}
          {loading ? 'generating' : 'generate'}
        </button>

        {error && (
          <div className={`p-3 rounded-lg text-sm ${isDarkMode ? 'bg-red-900/30 text-red-300' : 'bg-red-50 text-red-600'}`}>
            {error}
          </div>
        )}

        {result && (
          <div ref={resultRef} className={`rounded-lg border p-4 space-y-3 ${isDarkMode ? 'border-gray-600 bg-gray-800/50' : 'border-gray-200 bg-gray-50'}`}>
            <div className="flex items-center justify-between">
              <span className={`text-xs font-semibold ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                {'result'}
              </span>
              <div className="flex gap-1">
                <button
                  onClick={handleCopy}
                  className={`p-1.5 rounded transition-colors ${isDarkMode ? 'hover:bg-gray-700 text-gray-400' : 'hover:bg-gray-200 text-gray-500'}`}
                  title="Copy"
                >
                  {copied ? <Check size={14} className="text-green-500" /> : <Copy size={14} />}
                </button>
                <button
                  onClick={handleGenerate}
                  className={`p-1.5 rounded transition-colors ${isDarkMode ? 'hover:bg-gray-700 text-gray-400' : 'hover:bg-gray-200 text-gray-500'}`}
                  title={'regenerate'}
                >
                  <RotateCcw size={14} />
                </button>
              </div>
            </div>

            <div>
              <div className={`text-xs font-medium mb-1 ${isDarkMode ? 'text-gray-500' : 'text-gray-400'}`}>
                {'titleLabel'}
              </div>
              <div className={`text-sm font-semibold ${isDarkMode ? 'text-gray-100' : 'text-gray-800'}`}>
                {result.title}
              </div>
            </div>

            {result.tags.length > 0 && (
              <div>
                <div className={`text-xs font-medium mb-1 ${isDarkMode ? 'text-gray-500' : 'text-gray-400'}`}>
                  {'tags'}
                </div>
                <div className="flex flex-wrap gap-1">
                  {result.tags.map(tag => (
                    <span key={tag} className={`px-2 py-0.5 rounded text-xs ${isDarkMode ? 'bg-blue-900/40 text-blue-300' : 'bg-blue-100 text-blue-700'}`}>
                      #{tag}
                    </span>
                  ))}
                </div>
              </div>
            )}

            <button
              onClick={handleInsert}
              className={`w-full flex items-center justify-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                inserted
                  ? 'bg-green-600 text-white'
                  : isDarkMode
                    ? 'bg-gray-700 hover:bg-gray-600 text-gray-100'
                    : 'bg-gray-200 hover:bg-gray-300 text-gray-800'
              }`}
            >
              {inserted ? <><Check size={16} /> {'inserted'}</> : 'insert'}
            </button>
          </div>
        )}

        {!result && !loading && !error && (
          <div className={`text-center py-8 ${isDarkMode ? 'text-gray-500' : 'text-gray-400'}`}>
            <Sparkles size={32} className="mx-auto mb-2 opacity-30" />
            <p className="text-xs">{'noContent'}</p>
          </div>
        )}
      </div>
    </div>
  );
}
