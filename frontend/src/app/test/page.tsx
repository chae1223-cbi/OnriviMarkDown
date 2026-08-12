// ====================================================================
// 📊 [OMD-TEST-CopilotPlayground-0040] page.tsx ➔ Copilot CLI UI
// 🎯 @KICK  : Copilot CLI 대화창 디자인 시스템 규격을 React 컴포넌트로 완벽 구현.
//             인터랙티브 대화 스트리밍 및 가상 툴 호출 시뮬레이션 제공.
// 🛡️ @GUARD : UI 역할 분리 원칙 적용 (Container, Layout, Core, Manager)
// 🚨 @PATCH : **2026-08-12** — 초기 생성 (사용자 요청 /test 에뮬레이터 탑재)
// 🔗 @CALLS : Lucide Icons, Framer Motion
// ====================================================================
"use client";

import React, { useState, useEffect, useRef } from "react";
import { 
  Terminal, Sparkles, AlertCircle, CheckCircle, AlertTriangle, 
  Send, RefreshCw, ChevronDown, ChevronUp, Copy, Play, Cpu, Layers 
} from "lucide-react";

// ── COLOR & SPACING CONSTANTS (Copilot CLI Design System) ──
const COLORS = {
  primary: "#0E639C", // Copilot Blue
  success: "#4EC9B0", // Green
  warning: "#DCDCAA", // Yellow
  error: "#F48771", // Red
  neutral: "#D4D4D4", // Light Gray
  background: "#1E1E1E", // Dark Bg
  terminalBg: "#181818", // Darker Panel
  border: "#333333"
};

interface ToolCall {
  name: string;
  args: string;
  status: "pending" | "success" | "error";
  result?: string;
}

interface Message {
  id: string;
  sender: "user" | "ai" | "system";
  text: string;
  timestamp: string;
  tools?: ToolCall[];
}

// ────────────────────────────────────────────────────────────────────
// 1. Container (상태 관리, 비즈니스 로직 제어)
// ────────────────────────────────────────────────────────────────────
export default function CopilotTestContainer() {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "1",
      sender: "system",
      text: "Copilot CLI Session Initialized. Ready to assist.",
      timestamp: "09:00:00"
    },
    {
      id: "2",
      sender: "ai",
      text: "안녕하세요! Onrivi Author 보안 및 종속성 분석 어시스턴트입니다. 어떤 검사를 실행할까요?",
      timestamp: "09:00:02"
    }
  ]);
  const [inputValue, setInputValue] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [activeAlert, setActiveAlert] = useState<{ type: "info" | "success" | "error" | "warn"; message: string } | null>(null);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // 가상 응답 생성 시뮬레이터 (마크다운 스트리밍 + 툴 호출 병렬 처리 연출)
  const triggerMockResponse = async (userText: string) => {
    setIsGenerating(true);
    const timeNow = new Date().toLocaleTimeString("ko-KR", { hour12: false });

    // 1. 사용자 메시지 추가 후 입력 초기화
    setMessages(prev => [...prev, {
      id: Date.now().toString(),
      sender: "user",
      text: userText,
      timestamp: timeNow
    }]);
    setInputValue("");

    // 2. 가상 툴 호출 상태 추가 (진행률 노출용)
    await new Promise(r => setTimeout(r, 800));
    const toolId = (Date.now() + 1).toString();
    
    setMessages(prev => [...prev, {
      id: toolId,
      sender: "system",
      text: "스캐너를 구동하여 취약점을 탐색합니다...",
      timestamp: new Date().toLocaleTimeString("ko-KR", { hour12: false }),
      tools: [
        { name: "scan_dependencies", args: JSON.stringify({ path: "./package.json" }, null, 2), status: "pending" }
      ]
    }]);

    // 3. 툴 실행 성공 연출
    await new Promise(r => setTimeout(r, 1200));
    setMessages(prev => prev.map(m => m.id === toolId ? {
      ...m,
      tools: m.tools?.map(t => ({
        ...t,
        status: "success",
        result: JSON.stringify({ status: "done", found: 1, vulnerability: "sharp@0.34.5 (High Severity CVE-2026-35590)" }, null, 2)
      }))
    } : m));

    // 4. AI 요약 보고서 작성 (스트리밍 타이핑 효과 시뮬레이션)
    await new Promise(r => setTimeout(r, 600));
    const aiResponseId = (Date.now() + 2).toString();
    const targetText = `### 🔍 분석 보고서 완료
- **대상**: \`sharp@0.34.5\` (CVE-2026-35590 내포)
- **조치 권고**: 최신 안전 버전인 \`sharp@0.35.3\` 이상으로 업그레이드가 필요합니다.

\`\`\`bash
npm install sharp@latest
\`\`\`

보안 스캔이 완벽하게 완료되었습니다. 즉시 수정 패치를 반영할까요?`;

    setMessages(prev => [...prev, {
      id: aiResponseId,
      sender: "ai",
      text: "",
      timestamp: new Date().toLocaleTimeString("ko-KR", { hour12: false })
    }]);

    // 한 글자씩 스트리밍 타이핑
    let currentText = "";
    const words = targetText.split(" ");
    for (let i = 0; i < words.length; i++) {
      await new Promise(r => setTimeout(r, 45));
      currentText += (i === 0 ? "" : " ") + words[i];
      setMessages(prev => prev.map(m => m.id === aiResponseId ? { ...m, text: currentText } : m));
    }

    setIsGenerating(false);
    setActiveAlert({ type: "success", message: "보안 분석 검사가 성공적으로 완료되었습니다." });
  };

  const handleSend = () => {
    if (!inputValue.trim() || isGenerating) return;
    triggerMockResponse(inputValue);
  };

  const handleQuickAction = (actionText: string) => {
    if (isGenerating) return;
    triggerMockResponse(actionText);
  };

  return (
    <CopilotLayout>
      <CopilotCore 
        messages={messages}
        inputValue={inputValue}
        setInputValue={setInputValue}
        isGenerating={isGenerating}
        handleSend={handleSend}
        handleQuickAction={handleQuickAction}
        messagesEndRef={messagesEndRef}
      />
      <CopilotAlertManager 
        alert={activeAlert} 
        onClose={() => setActiveAlert(null)} 
      />
    </CopilotLayout>
  );
}

// ────────────────────────────────────────────────────────────────────
// 2. Layout (구조 프레임 껍데기 설정)
// ────────────────────────────────────────────────────────────────────
function CopilotLayout({ children }: { children: React.ReactNode }) {
  return (
    <div 
      className="flex flex-col h-screen w-full select-none"
      style={{ background: COLORS.background, color: COLORS.neutral, fontFamily: "Inter, sans-serif" }}
    >
      {/* ── TOP HEADER ── */}
      <header 
        className="flex items-center justify-between px-6 py-4 border-b shrink-0"
        style={{ borderColor: COLORS.border, background: COLORS.terminalBg }}
      >
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-sky-500/10 text-sky-400">
            <Terminal size={18} />
          </div>
          <div>
            <h1 className="text-sm font-bold tracking-tight text-white flex items-center gap-1.5">
              Copilot CLI Simulator <span className="text-[10px] bg-sky-500/20 text-sky-300 px-2 py-0.5 rounded font-mono">v1.2.0</span>
            </h1>
            <p className="text-[11px] text-zinc-500">Active Session: chae1-cbi-onrivi</p>
          </div>
        </div>
        <div className="flex items-center gap-4 text-xs font-mono">
          <span className="flex items-center gap-1.5 text-emerald-400 font-bold">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            AGENT ONLINE
          </span>
        </div>
      </header>

      {/* ── BODY WRAPPER ── */}
      <div className="flex-1 flex overflow-hidden relative">
        {children}
      </div>
    </div>
  );
}

// ────────────────────────────────────────────────────────────────────
// 3. Core (핵심 대화 피드 및 입력 컨트롤)
// ────────────────────────────────────────────────────────────────────
interface CopilotCoreProps {
  messages: Message[];
  inputValue: string;
  setInputValue: (val: string) => void;
  isGenerating: boolean;
  handleSend: () => void;
  handleQuickAction: (action: string) => void;
  messagesEndRef: React.RefObject<HTMLDivElement>;
}

function CopilotCore({
  messages,
  inputValue,
  setInputValue,
  isGenerating,
  handleSend,
  handleQuickAction,
  messagesEndRef
}: CopilotCoreProps) {
  return (
    <div className="flex-1 flex flex-col h-full overflow-hidden">
      {/* ── CHAT SCREEN ── */}
      <div className="flex-1 overflow-y-auto px-6 py-6 space-y-6">
        {messages.map((msg) => (
          <div key={msg.id} className="flex flex-col gap-1 max-w-3xl">
            {/* Header info */}
            <div className="flex items-center gap-2 text-[11px] font-bold text-zinc-500">
              <span style={{ color: msg.sender === "user" ? "#50a2ff" : (msg.sender === "ai" ? COLORS.success : "#888") }}>
                {msg.sender === "user" ? "👤 YOU" : (msg.sender === "ai" ? "🤖 COPILOT" : "⚙️ SYSTEM")}
              </span>
              <span>•</span>
              <span className="font-mono">{msg.timestamp}</span>
            </div>

            {/* Message Body */}
            {msg.sender === "system" ? (
              <div 
                className="text-xs p-3 rounded-lg border bg-zinc-900/60 font-mono"
                style={{ borderColor: COLORS.border, color: COLORS.neutral }}
              >
                {msg.text}
                
                {/* 🛠️ Tool Call Panel (함수 호출 토글 디스플레이) */}
                {msg.tools && msg.tools.map((t, idx) => (
                  <ToolCallPanel key={idx} tool={t} />
                ))}
              </div>
            ) : (
              <div 
                className="text-xs p-4 rounded-xl leading-relaxed whitespace-pre-wrap select-text cursor-text"
                style={{ 
                  background: msg.sender === "user" ? "rgba(14, 99, 156, 0.15)" : "#252526",
                  border: `1px solid ${msg.sender === "user" ? "rgba(14, 99, 156, 0.3)" : COLORS.border}`
                }}
              >
                {/* 마크다운 코드블록 간이 파싱 처리 */}
                {msg.text.includes("```") ? (
                  <RichTextWithCode content={msg.text} />
                ) : (
                  <span>{msg.text}</span>
                )}
              </div>
            )}
          </div>
        ))}
        {isGenerating && (
          <div className="flex items-center gap-2 text-xs text-sky-400 font-mono animate-pulse">
            <RefreshCw className="animate-spin" size={12} />
            <span>Copilot가 코드를 추론하는 중입니다...</span>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* ── INTERACTION INPUT AREA ── */}
      <div 
        className="px-6 py-4 border-t shrink-0 flex flex-col gap-3"
        style={{ borderColor: COLORS.border, background: COLORS.terminalBg }}
      >
        {/* Quick Action Quick Buttons */}
        <div className="flex flex-wrap gap-2">
          <button 
            onClick={() => handleQuickAction("보안 진단 실행해줘")}
            disabled={isGenerating}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-md border text-[11px] font-bold border-zinc-700 bg-zinc-800 text-zinc-300 hover:bg-zinc-700 transition-colors disabled:opacity-50"
          >
            <Play size={10} /> 보안 스캔
          </button>
          <button 
            onClick={() => handleQuickAction("sharp 패키지 버전 체크")}
            disabled={isGenerating}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-md border text-[11px] font-bold border-zinc-700 bg-zinc-800 text-zinc-300 hover:bg-zinc-700 transition-colors disabled:opacity-50"
          >
            <Cpu size={10} /> 종속성 검사
          </button>
          <button 
            onClick={() => handleQuickAction("프로모션 테이블 RLS 정책 쿼리")}
            disabled={isGenerating}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-md border text-[11px] font-bold border-zinc-700 bg-zinc-800 text-zinc-300 hover:bg-zinc-700 transition-colors disabled:opacity-50"
          >
            <Layers size={10} /> SQL RLS 확인
          </button>
        </div>

        {/* Real Input field */}
        <div className="flex gap-2">
          <input 
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSend()}
            disabled={isGenerating}
            placeholder={isGenerating ? "응답 대기 중..." : "Copilot에게 분석 명령을 전송하세요..."}
            className="flex-1 px-4 py-3 rounded-lg border text-xs focus:outline-none focus:ring-2 focus:ring-sky-500/50 bg-zinc-900 border-zinc-700 text-white placeholder-zinc-500 transition-all disabled:opacity-50"
          />
          <button 
            onClick={handleSend}
            disabled={!inputValue.trim() || isGenerating}
            className="px-4 py-3 rounded-lg bg-sky-600 hover:bg-sky-500 text-white flex items-center justify-center transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Send size={14} />
          </button>
        </div>
      </div>
    </div>
  );
}

// 🛠️ Tool Call Panel (JSON 인자 펼치기 지원)
function ToolCallPanel({ tool }: { tool: ToolCall }) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="mt-2 border rounded-md border-zinc-800 overflow-hidden">
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between px-3 py-2 bg-zinc-950/60 hover:bg-zinc-950 text-[10px] font-bold font-mono transition-colors"
      >
        <span className="flex items-center gap-1.5">
          <span className="w-1.5 h-1.5 rounded-full" style={{ background: tool.status === "success" ? COLORS.success : (tool.status === "error" ? COLORS.error : "#aaa") }} />
          🛠️ Tool: {tool.name}
        </span>
        <span className="flex items-center gap-1.5 text-[10px] text-zinc-500">
          ({tool.status.toUpperCase()})
          {isOpen ? <ChevronUp size={10} /> : <ChevronDown size={10} />}
        </span>
      </button>
      {isOpen && (
        <div className="p-3 bg-zinc-950/80 border-t border-zinc-800 text-[11px] font-mono space-y-2">
          <div>
            <p className="text-[10px] text-zinc-500 font-bold mb-1">📥 Arguments:</p>
            <pre className="text-zinc-400 overflow-x-auto p-1.5 bg-black/40 rounded">{tool.args}</pre>
          </div>
          {tool.result && (
            <div>
              <p className="text-[10px] text-zinc-500 font-bold mb-1">📤 Result:</p>
              <pre className="text-sky-300 overflow-x-auto p-1.5 bg-black/40 rounded">{tool.result}</pre>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// ── CODE BLOCK & REGULAR TEXT DIVISION ──
function RichTextWithCode({ content }: { content: string }) {
  const parts = content.split("```");
  return (
    <div className="space-y-3">
      {parts.map((part, idx) => {
        if (idx % 2 === 1) {
          // Code Block
          const lines = part.trim().split("\n");
          const lang = lines[0];
          const code = lines.slice(1).join("\n");
          return (
            <div key={idx} className="border border-zinc-800 rounded-lg overflow-hidden my-2">
              <div className="bg-zinc-950 px-3 py-1.5 flex items-center justify-between border-b border-zinc-800">
                <span className="text-[10px] font-mono text-zinc-500 font-bold uppercase">{lang || "code"}</span>
                <button 
                  onClick={() => navigator.clipboard.writeText(code)}
                  className="text-[10px] text-zinc-500 hover:text-zinc-300 flex items-center gap-1 font-bold"
                >
                  <Copy size={10} /> Copy
                </button>
              </div>
              <pre className="p-3 bg-black/40 text-[11px] font-mono text-emerald-400 overflow-x-auto whitespace-pre">{code}</pre>
            </div>
          );
        }
        // General text
        return <span key={idx} className="block whitespace-pre-wrap">{part}</span>;
      })}
    </div>
  );
}

// ────────────────────────────────────────────────────────────────────
// 4. Manager (오버레이 및 알림 관리)
// ────────────────────────────────────────────────────────────────────
interface CopilotAlertManagerProps {
  alert: { type: "info" | "success" | "error" | "warn"; message: string } | null;
  onClose: () => void;
}

function CopilotAlertManager({ alert, onClose }: CopilotAlertManagerProps) {
  useEffect(() => {
    if (!alert) return;
    const timer = setTimeout(onClose, 4000);
    return () => clearTimeout(timer);
  }, [alert, onClose]);

  if (!alert) return null;

  const styleMap = {
    info: { bg: "bg-sky-500/10", border: "border-sky-500/30", text: "text-sky-300", icon: <AlertCircle size={14} /> },
    success: { bg: "bg-emerald-500/10", border: "border-emerald-500/30", text: "text-emerald-300", icon: <CheckCircle size={14} /> },
    warn: { bg: "bg-amber-500/10", border: "border-amber-500/30", text: "text-amber-300", icon: <AlertTriangle size={14} /> },
    error: { bg: "bg-rose-500/10", border: "border-rose-500/30", text: "text-rose-300", icon: <AlertCircle size={14} /> }
  };

  const scheme = styleMap[alert.type];

  return (
    <div className="absolute top-6 right-6 z-[999] animate-in fade-in slide-in-from-top-4 duration-300">
      <div 
        className={`flex items-center gap-2.5 px-4 py-3 rounded-lg border text-xs font-bold ${scheme.bg} ${scheme.border} ${scheme.text} shadow-lg`}
      >
        {scheme.icon}
        <span>{alert.message}</span>
      </div>
    </div>
  );
}
