import { useState, useCallback } from 'react';
import { SpellCheck, SearchCode, AlertTriangle, CheckCircle, Info, Loader2, RefreshCw } from 'lucide-react';

interface WritingAssistantProps {
  isDarkMode: boolean;
  content: string;
  
}

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';

const LABELS: Record<string, Record<string, string>> = {
  spellCheck: { ko: '맞춤법 검사', en: 'Spell Check', ja: 'スペルチェック', zh: '拼写检查' },
  seo: { ko: 'SEO 분석', en: 'SEO Analysis', ja: 'SEO分析', zh: 'SEO分析' },
  checkBtn: { ko: '맞춤법 검사 실행', en: 'Check Spelling', ja: 'チェック実行', zh: '开始检查' },
  checking: { ko: '검사 중...', en: 'Checking...', ja: 'チェック中...', zh: '检查中...' },
  noErrors: { ko: '맞춤법 오류가 없습니다.', en: 'No spelling errors found.', ja: 'スペルミスはありません。', zh: '没有拼写错误。' },
  noContent: { ko: '검사할 내용이 없습니다.', en: 'No content to check.', ja: 'チェックする内容がありません。', zh: '没有要检查的内容。' },
  spellError: { ko: '맞춤법 검사 서비스를 사용할 수 없습니다.', en: 'Spell check service unavailable.', ja: 'スペルチェックサービスを利用できません。', zh: '拼写检查服务不可用。' },
  score: { ko: 'SEO 점수', en: 'SEO Score', ja: 'SEOスコア', zh: 'SEO分数' },
  stats: { ko: '통계', en: 'Statistics', ja: '統計', zh: '统计' },
  issues: { ko: '발견된 문제', en: 'Issues Found', ja: '問題点', zh: '发现的问题' },
  suggestions: { ko: '제안', en: 'Suggestions', ja: '提案', zh: '建议' },
  errors: { ko: '오류', en: 'Errors', ja: 'エラー', zh: '错误' },
  warnings: { ko: '경고', en: 'Warnings', ja: '警告', zh: '警告' },
  info: { ko: '정보', en: 'Info', ja: '情報', zh: '信息' },
};

function t(key: string) {
  return LABELS[key]?.['ko'] || key;
}

function ScoreGauge({ score }: { score: number }) {
  const color = score >= 90 ? 'text-green-500' : score >= 75 ? 'text-blue-500' : score >= 60 ? 'text-yellow-500' : 'text-red-500';
  const bgColor = score >= 90 ? 'stroke-green-500' : score >= 75 ? 'stroke-blue-500' : score >= 60 ? 'stroke-yellow-500' : 'stroke-red-500';
  const r = 36;
  const circ = 2 * Math.PI * r;
  const offset = circ - (score / 100) * circ;

  return (
    <div className="flex items-center justify-center py-2">
      <svg width="96" height="96" className="-rotate-90">
        <circle cx="48" cy="48" r={r} fill="none" stroke="currentColor" strokeWidth="6" className="text-gray-200 dark:text-gray-700" />
        <circle cx="48" cy="48" r={r} fill="none" strokeWidth="6" strokeDasharray={circ} strokeDashoffset={offset} className={bgColor} strokeLinecap="round" />
      </svg>
      <div className="absolute flex flex-col items-center">
        <span className={`text-2xl font-bold ${color}`}>{score}</span>
        <span className={`text-[10px] font-semibold ${color}`}>
          {score >= 90 ? 'A' : score >= 75 ? 'B' : score >= 60 ? 'C' : 'D'}
        </span>
      </div>
    </div>
  );
}

export default function WritingAssistant({ isDarkMode, content }: WritingAssistantProps) {
  const [tab, setTab] = useState<'spell' | 'seo'>('spell');
  const [spellErrors, setSpellErrors] = useState<{ wrong: string; correct: string; type: string; desc?: string }[]>([]);
  const [spellLoading, setSpellLoading] = useState(false);
  const [spellDone, setSpellDone] = useState(false);
  const [spellError, setSpellError] = useState('');

  const [seoResult, setSeoResult] = useState<any>(null);
  const [seoLoading, setSeoLoading] = useState(false);

  const handleSpellCheck = useCallback(async () => {
    if (!content.trim()) return;
    setSpellLoading(true);
    setSpellError('');
    setSpellDone(false);

    try {
      const res = await fetch(`${API_BASE}/api/spellcheck`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: content }),
      });
      const data = await res.json();
      if (data.errors) setSpellErrors(data.errors);
      if (data.error) setSpellError(data.error);
    } catch {
      setSpellError(t('spellError'));
    } finally {
      setSpellLoading(false);
      setSpellDone(true);
    }
  }, [content]);

  const handleRunSEO = useCallback(async () => {
    if (!content.trim()) return;
    setSeoLoading(true);

    try {
      const res = await fetch(`${API_BASE}/api/seo/analyze`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content }),
      });
      const data = await res.json();
      setSeoResult(data);
    } catch {
      setSeoResult(null);
    } finally {
      setSeoLoading(false);
    }
  }, [content]);

  const tabClass = (t: string) =>
    `flex-1 py-1.5 text-center rounded-md text-xs font-medium transition-all ${
      tab === t
        ? 'bg-white dark:bg-zinc-800 text-blue-600 dark:text-blue-400 shadow-sm'
        : 'text-gray-400'
    }`;

  const panelBg = isDarkMode ? 'bg-gray-800/50 border-gray-700' : 'bg-white border-gray-200';
  const textColor = isDarkMode ? 'text-gray-100' : 'text-gray-800';
  const mutedColor = isDarkMode ? 'text-gray-400' : 'text-gray-500';

  return (
    <div className="flex flex-col h-full">
      <div className={`p-3 border-b ${isDarkMode ? 'border-gray-700' : 'border-gray-200'}`}>
        <div className="flex gap-1 bg-zinc-50 dark:bg-zinc-900/50 rounded-lg p-0.5">
          <button onClick={() => setTab('spell')} className={tabClass('spell')}>
            {t('spellCheck')}
          </button>
          <button onClick={() => { setTab('seo'); if (!seoResult && !seoLoading) handleRunSEO(); }} className={tabClass('seo')}>
            {t('seo')}
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-3 space-y-3">
        {tab === 'spell' && (
          <>
            <button
              onClick={handleSpellCheck}
              disabled={spellLoading || !content.trim()}
              className={`w-full flex items-center justify-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all disabled:opacity-50 ${
                isDarkMode ? 'bg-blue-600 hover:bg-blue-500 text-white' : 'bg-blue-600 hover:bg-blue-700 text-white'
              }`}
            >
              {spellLoading ? <Loader2 size={14} className="animate-spin" /> : <SpellCheck size={14} />}
              {spellLoading ? t('checking') : t('checkBtn')}
            </button>

            {spellError && (
              <div className={`p-3 rounded-lg text-xs ${isDarkMode ? 'bg-yellow-900/30 text-yellow-300' : 'bg-yellow-50 text-yellow-700'}`}>
                {spellError}
              </div>
            )}

            {spellDone && !spellError && (
              <div className={`p-3 rounded-lg text-xs text-center ${isDarkMode ? 'bg-gray-800' : 'bg-gray-50'}`}>
                {spellErrors.length === 0 ? (
                  <div className="flex items-center justify-center gap-2 text-green-500">
                    <CheckCircle size={16} />
                    {t('noErrors')}
                  </div>
                ) : (
                  <div className="space-y-2">
                    <div className={`flex items-center gap-2 font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                      <AlertTriangle size={14} className="text-yellow-500" />
                      {spellErrors.length}개의 오류 발견
                    </div>
                    {spellErrors.map((err, i) => (
                      <div key={i} className={`p-2 rounded text-left ${isDarkMode ? 'bg-gray-700' : 'bg-gray-100'}`}>
                        <div className="flex items-center justify-between">
                          <div>
                            <span className="line-through text-red-400 text-xs">{err.wrong}</span>
                            <span className="mx-1 text-gray-400">→</span>
                            <span className="text-green-500 text-xs font-medium">{err.correct}</span>
                          </div>
                          <span className="text-[10px] text-gray-400 ml-2 whitespace-nowrap">{err.type}</span>
                        </div>
                        {err.desc && <div className={`text-[10px] mt-1 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>{err.desc}</div>}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {!spellDone && !spellError && content.trim() && (
              <div className={`text-center py-8 text-xs ${mutedColor}`}>
                <SpellCheck size={28} className="mx-auto mb-2 opacity-30" />
                <p>맞춤법 검사를 실행하세요.</p>
              </div>
            )}

            {!content.trim() && (
              <div className={`text-center py-8 text-xs ${mutedColor}`}>
                <p>{t('noContent')}</p>
              </div>
            )}
          </>
        )}

        {tab === 'seo' && (
          <>
            {seoLoading && (
              <div className="flex items-center justify-center py-8">
                <Loader2 size={24} className="animate-spin text-blue-500" />
              </div>
            )}

            {seoResult && !seoLoading && (
              <div className="space-y-4">
                <div className="flex flex-col items-center relative">
                  <ScoreGauge score={seoResult.score} />
                  <div className={`text-xs font-medium ${mutedColor}`}>{seoResult.label}</div>
                </div>

                <div className={`grid grid-cols-3 gap-2 text-center ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                  {[
                    { label: '글자수', value: seoResult.stats.charCount.toLocaleString() },
                    { label: '단어수', value: seoResult.stats.wordCount.toLocaleString() },
                    { label: 'H2', value: seoResult.stats.h2Count },
                    { label: 'H3', value: seoResult.stats.h3Count },
                    { label: '이미지', value: seoResult.stats.imageCount },
                    { label: '링크', value: seoResult.stats.linkCount },
                  ].map(s => (
                    <div key={s.label} className={`p-2 rounded ${isDarkMode ? 'bg-gray-800' : 'bg-gray-50'}`}>
                      <div className="text-lg font-semibold">{s.value}</div>
                      <div className="text-[10px] text-gray-400">{s.label}</div>
                    </div>
                  ))}
                </div>

                {seoResult.issues.length > 0 && (
                  <div>
                    <div className={`text-xs font-semibold mb-2 ${mutedColor}`}>{t('issues')}</div>
                    <div className="space-y-1.5">
                      {seoResult.issues.map((issue: any, i: number) => (
                        <div key={i} className={`flex items-start gap-2 p-2 rounded text-xs ${
                          issue.type === 'error'
                            ? isDarkMode ? 'bg-red-900/20 text-red-300' : 'bg-red-50 text-red-600'
                            : issue.type === 'warning'
                              ? isDarkMode ? 'bg-yellow-900/20 text-yellow-300' : 'bg-yellow-50 text-yellow-700'
                              : isDarkMode ? 'bg-blue-900/20 text-blue-300' : 'bg-blue-50 text-blue-700'
                        }`}>
                          {issue.type === 'error' ? <AlertTriangle size={12} className="mt-0.5 shrink-0" /> :
                           issue.type === 'warning' ? <Info size={12} className="mt-0.5 shrink-0" /> :
                           <CheckCircle size={12} className="mt-0.5 shrink-0" />}
                          <span>{issue.message}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            <button
              onClick={handleRunSEO}
              disabled={seoLoading || !content.trim()}
              className={`w-full flex items-center justify-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all disabled:opacity-50 ${
                isDarkMode ? 'bg-gray-700 hover:bg-gray-600 text-gray-100' : 'bg-gray-200 hover:bg-gray-300 text-gray-800'
              }`}
            >
              <RefreshCw size={14} className={seoLoading ? 'animate-spin' : ''} />
              {seoLoading ? '분석 중...' : 'SEO 재분석'}
            </button>
          </>
        )}
      </div>
    </div>
  );
}
