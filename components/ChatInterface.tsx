'use client';
import { useState, useRef, useEffect, useCallback } from 'react';
import { Send, ThumbsUp, ThumbsDown, Download, Loader2, Sparkles } from 'lucide-react';
import { cn, formatRelative } from '@/lib/utils';
import type { ChatMessage, ChatResponse, SearchResult } from '@/lib/types';

const WELCOME: ChatMessage = {
  id: 'welcome',
  role: 'healer',
  content: `Welcome, dear one. 🌿\n\nI'm here to help you explore the mind-body connection through Louise Hay's timeless wisdom.\n\nYou might share something like:\n• *"I've been having lower back pain and feel financially stressed"*\n• *"I struggle with anxiety and can't stop worrying"*\n• *"I have chronic headaches and am very self-critical"*\n\nSpeak from your heart — there is no wrong way to begin.`,
  timestamp: Date.now(),
};

function parseMarkdown(text: string): string {
  return text
    .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
    .replace(/\*(.*?)\*/g, '<em>$1</em>')
    .replace(/^> (.+)$/gm, '<blockquote class="border-l-2 border-lavender-300 pl-3 italic text-lavender-700 dark:text-lavender-400 my-1">$1</blockquote>')
    .replace(/^• (.+)$/gm, '<li class="ml-4 list-disc">$1</li>')
    .replace(/\n\n/g, '</p><p class="mt-2">')
    .replace(/\n/g, '<br/>');
}

function ResultCard({ result, onFeedback }: { result: SearchResult; onFeedback: (id: string, helpful: boolean) => void }) {
  const [voted, setVoted] = useState<boolean | null>(null);
  const vote = (helpful: boolean) => {
    setVoted(helpful);
    onFeedback(result.entry.id, helpful);
  };

  return (
    <div className="bg-lavender-50 dark:bg-purple-950/40 border border-lavender-100 dark:border-purple-800/40 rounded-xl p-3 text-sm">
      <div className="flex items-center justify-between mb-1">
        <span className="font-semibold text-lavender-700 dark:text-lavender-400 text-xs">{result.entry.ailment}</span>
        <span className="text-[10px] text-neutral-400 bg-white/60 dark:bg-purple-900/30 px-1.5 py-0.5 rounded-full">
          {result.entry.body_part}
        </span>
      </div>
      <p className="text-[11px] text-neutral-500 dark:text-purple-400 italic mb-1">{result.entry.probable_cause}</p>
      <p className="text-[11px] text-sage-700 dark:text-green-400 font-medium">"{result.entry.affirmation}"</p>
      <div className="flex items-center gap-2 mt-2">
        <span className="text-[10px] text-neutral-400">Helpful?</span>
        <button onClick={() => vote(true)}  className={cn('p-1 rounded transition-colors', voted === true  ? 'text-sage-500' : 'text-neutral-300 hover:text-sage-400')}><ThumbsUp className="w-3 h-3" /></button>
        <button onClick={() => vote(false)} className={cn('p-1 rounded transition-colors', voted === false ? 'text-blush-400' : 'text-neutral-300 hover:text-blush-300')}><ThumbsDown className="w-3 h-3" /></button>
      </div>
    </div>
  );
}

export function ChatInterface() {
  const [messages, setMessages] = useState<ChatMessage[]>([WELCOME]);
  const [input, setInput]       = useState('');
  const [loading, setLoading]   = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef  = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const sendFeedback = useCallback(async (id: string, helpful: boolean) => {
    await fetch('/api/feedback', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ resultId: id, helpful, query: '' }),
    });
  }, []);

  const send = async () => {
    const q = input.trim();
    if (!q || loading) return;
    setInput('');

    const userMsg: ChatMessage = {
      id: `u_${Date.now()}`,
      role: 'user',
      content: q,
      timestamp: Date.now(),
    };
    setMessages(prev => [...prev, userMsg]);
    setLoading(true);

    try {
      const res  = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query: q }),
      });
      const data: ChatResponse = await res.json();

      const healerMsg: ChatMessage = {
        id: `h_${Date.now()}`,
        role: 'healer',
        content: data.message,
        timestamp: Date.now(),
        results: data.results,
        affirmation: data.affirmation,
      };
      setMessages(prev => [...prev, healerMsg]);
    } catch {
      setMessages(prev => [...prev, {
        id: `err_${Date.now()}`,
        role: 'healer',
        content: 'Something went gently wrong. Please try again.',
        timestamp: Date.now(),
      }]);
    } finally {
      setLoading(false);
      inputRef.current?.focus();
    }
  };

  const exportPDF = async () => {
    const { jsPDF } = await import('jspdf');
    const doc = new jsPDF();
    doc.setFont('helvetica');
    doc.setFontSize(16);
    doc.text('Daily Healer — Conversation Export', 20, 20);
    doc.setFontSize(10);
    doc.text(`Exported: ${new Date().toLocaleString()}`, 20, 28);

    let y = 40;
    for (const msg of messages) {
      if (msg.id === 'welcome') continue;
      const label = msg.role === 'user' ? 'You' : 'Daily Healer';
      const plain = msg.content.replace(/\*\*(.*?)\*\*/g, '$1').replace(/\*(.*?)\*/g, '$1').replace(/^> /gm, '').replace(/^• /gm, '- ');
      const lines = doc.splitTextToSize(`${label}: ${plain}`, 170) as string[];
      if (y + lines.length * 5 > 280) { doc.addPage(); y = 20; }
      doc.setFont('helvetica', msg.role === 'user' ? 'bold' : 'normal');
      doc.text(lines, 20, y);
      y += lines.length * 5 + 6;
    }
    doc.save(`daily-healer-${Date.now()}.pdf`);
  };

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center justify-between px-6 py-4 border-b border-lavender-100 dark:border-purple-900/40">
        <div className="flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-lavender-400" />
          <h1 className="font-serif text-lg text-lavender-800 dark:text-lavender-300">Healing Chat</h1>
        </div>
        <button onClick={exportPDF} className="flex items-center gap-1.5 text-xs text-neutral-400 hover:text-lavender-500 transition-colors px-3 py-1.5 rounded-lg hover:bg-lavender-50 dark:hover:bg-purple-950/40">
          <Download className="w-3.5 h-3.5" /> Export PDF
        </button>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto custom-scroll px-4 md:px-6 py-4 space-y-4">
        {messages.map(msg => (
          <div key={msg.id} className={cn('flex animate-slide-up', msg.role === 'user' ? 'justify-end' : 'justify-start')}>
            <div className="max-w-[85%] space-y-2">
              {msg.role === 'healer' && (
                <div className="flex items-center gap-1.5 mb-1">
                  <div className="w-5 h-5 rounded-full bg-gradient-to-br from-lavender-400 to-sage-400 flex items-center justify-center">
                    <span className="text-[8px] text-white">✿</span>
                  </div>
                  <span className="text-[11px] text-neutral-400 dark:text-purple-400">Daily Healer · {formatRelative(msg.timestamp)}</span>
                </div>
              )}

              <div className={msg.role === 'user' ? 'chat-bubble-user' : 'chat-bubble-healer'}>
                <div
                  className="text-sm leading-relaxed"
                  dangerouslySetInnerHTML={{ __html: `<p>${parseMarkdown(msg.content)}</p>` }}
                />
              </div>

              {msg.results && msg.results.length > 0 && (
                <div className="space-y-1.5 mt-2">
                  <p className="text-[11px] text-neutral-400 dark:text-purple-400 font-medium pl-1">Related patterns:</p>
                  {msg.results.slice(0, 3).map(r => (
                    <ResultCard key={r.entry.id} result={r} onFeedback={sendFeedback} />
                  ))}
                </div>
              )}
            </div>
          </div>
        ))}

        {loading && (
          <div className="flex justify-start animate-fade-in">
            <div className="chat-bubble-healer flex items-center gap-2">
              <Loader2 className="w-4 h-4 animate-spin text-lavender-400" />
              <span className="text-sm text-neutral-400 dark:text-purple-400 italic">Reflecting with love…</span>
            </div>
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <div className="px-4 md:px-6 py-4 border-t border-lavender-100 dark:border-purple-900/40">
        <div className="flex gap-3 items-end">
          <textarea
            ref={inputRef}
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); send(); } }}
            placeholder="Describe what you're experiencing — physically, emotionally, or both…"
            rows={2}
            className="flex-1 resize-none rounded-2xl border border-lavender-200 dark:border-purple-800/60 bg-white/80 dark:bg-purple-950/40 px-4 py-3 text-sm text-neutral-700 dark:text-purple-100 placeholder:text-neutral-400 dark:placeholder:text-purple-600 focus:outline-none focus:ring-2 focus:ring-lavender-300 dark:focus:ring-purple-700 transition-all custom-scroll"
          />
          <button
            onClick={send}
            disabled={!input.trim() || loading}
            className="flex-shrink-0 w-11 h-11 rounded-2xl bg-gradient-to-br from-lavender-500 to-sage-500 text-white flex items-center justify-center shadow-sm hover:shadow-md disabled:opacity-40 disabled:cursor-not-allowed transition-all hover:scale-105 active:scale-95"
          >
            <Send className="w-4 h-4" />
          </button>
        </div>
        <p className="text-[10px] text-neutral-400 dark:text-purple-600 text-center mt-2">
          For personal growth only · Not medical advice · Always consult a healthcare professional
        </p>
      </div>
    </div>
  );
}
