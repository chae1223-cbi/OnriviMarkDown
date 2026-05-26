"use client";

import React, { useState } from 'react';
import { Copy, Check } from 'lucide-react';

const CopyButton = ({ text }: { text: string }) => {
  const [copied, setCopied] = useState(false);
  
  const handleCopy = (e: React.MouseEvent) => {
    e.stopPropagation();
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <button 
      onClick={handleCopy}
      className={`p-1.5 rounded-md transition-all active:scale-95 border ${
        copied 
          ? 'bg-green-500/10 border-green-500/50 text-green-600' 
          : 'bg-white/10 border-white/20 text-white/70 hover:bg-white/20 hover:text-white'
      }`}
      title="코드 복사"
    >
      {copied ? <Check size={14} /> : <Copy size={14} />}
    </button>
  );
};

export default CopyButton;
