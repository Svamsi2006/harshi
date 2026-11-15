import React, { useMemo, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { MessageCircleHeart, X, Send, Sparkles, Loader2, ArrowRight } from 'lucide-react';
import { AnimatePresence, motion } from 'motion/react';
import { useStore } from '../../context/StoreContext';
import { formatINR } from '../../utils/format';

interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
}

const STARTER_PROMPTS = [
  'Gift ideas under ₹1,500',
  'How do Custom Orders work?',
  'Show Resin & LED Frames',
  'Shipping & delivery timeline',
];

export const StudioChatbotWidget: React.FC = () => {
  const { storeSettings, products, categories } = useStore();
  const [open, setOpen] = useState(false);
  const [input, setInput] = useState('');
  const [sending, setSending] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'welcome-varni',
      role: 'assistant',
      content:
        'Hi there! I am Varni, your handmade gift companion at varniks_atelier. Looking for a keepsake, custom idea, or gift recommendation?',
    },
  ]);

  const scrollRef = useRef<HTMLDivElement>(null);

  const catalogSummary = useMemo(() => {
    const catList = categories.map((c) => c.label).join(', ');
    const itemList = products
      .slice(0, 12)
      .map((p) => `- ${p.name} (${p.categoryLabel}, ${formatINR(p.price)}, ${p.availabilityLabel})`)
      .join('\n');
    return `Categories: ${catList}\nProducts:\n${itemList}`;
  }, [categories, products]);

  if (storeSettings.chatbotEnabled === false) {
    return null;
  }

  const sendMessage = async (textOverride?: string) => {
    const text = (textOverride ?? input).trim();
    if (!text || sending) return;

    const userMsg: ChatMessage = {
      id: `user-${Date.now()}`,
      role: 'user',
      content: text,
    };

    const nextHistory = [...messages, userMsg];
    setMessages(nextHistory);
    if (!textOverride) setInput('');
    setSending(true);

    window.setTimeout(() => {
      scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' });
    }, 60);

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: nextHistory.map((m) => ({ role: m.role, content: m.content })),
          catalogSummary,
        }),
      });
      const json = await res.json().catch(() => ({}));
      const errText =
        typeof json.error === 'string'
          ? json.error
          : json.error && typeof json.error === 'object' && 'message' in json.error
            ? String((json.error as { message?: unknown }).message || 'Unavailable')
            : '';
      const replyText =
        res.ok && json.reply
          ? String(json.reply)
          : errText
            ? `Oops! Studio assistant hit a snag: ${errText}`
            : 'I could not reach the studio assistant right now. Try browsing Shop All Works or Custom Orders!';

      setMessages((prev) => [
        ...prev,
        {
          id: `assistant-${Date.now()}`,
          role: 'assistant',
          content: replyText,
        },
      ]);
    } catch {
      setMessages((prev) => [
        ...prev,
        {
          id: `assistant-${Date.now()}`,
          role: 'assistant',
          content:
            'It looks like you are offline right now. You can still browse all handmade creations or draft a custom order anytime!',
        },
      ]);
    } finally {
      setSending(false);
      window.setTimeout(() => {
        scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' });
      }, 60);
    }
  };

  return (
    <div className="fixed bottom-5 right-5 z-[45] flex flex-col items-end gap-3">
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 18, scale: 0.94 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 14, scale: 0.95 }}
            transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
            className="w-[330px] sm:w-[375px] rounded-3xl bg-[#FFF9F5] border border-[#E7C7CC] shadow-[0_22px_50px_-14px_rgba(62,47,39,0.32)] overflow-hidden flex flex-col max-h-[520px]"
          >
            {/* Header */}
            <div className="bg-[#6D1836] text-[#FFF9F5] px-4 py-3.5 flex items-center justify-between gap-3">
              <div className="flex items-center gap-2.5 min-w-0">
                <div className="w-9 h-9 rounded-full bg-[#FFF9F5] border border-[#C9A66B] flex items-center justify-center shrink-0">
                  <svg viewBox="0 0 32 32" className="w-6 h-6" aria-hidden="true">
                    <circle cx="16" cy="16" r="14" fill="#E7C7CC" fillOpacity="0.45" />
                    <circle cx="11.5" cy="14" r="1.7" fill="#3E2F27" />
                    <circle cx="20.5" cy="14" r="1.7" fill="#3E2F27" />
                    <circle cx="9.2" cy="17.2" r="1.6" fill="#E7C7CC" />
                    <circle cx="22.8" cy="17.2" r="1.6" fill="#E7C7CC" />
                    <path
                      d="M12.5 18.8C13.7 20.6 18.3 20.6 19.5 18.8"
                      stroke="#6D1836"
                      strokeWidth="1.6"
                      strokeLinecap="round"
                      fill="none"
                    />
                    <path
                      d="M16 4.5C17 3 19.5 3.5 18.8 5.6C18.3 6.9 16 8 16 8C16 8 13.7 6.9 13.2 5.6C12.5 3.5 15 3 16 4.5Z"
                      fill="#C9A66B"
                    />
                  </svg>
                </div>
                <div className="min-w-0">
                  <p className="font-display text-sm font-semibold leading-tight truncate">
                    Varni · Studio Companion
                  </p>
                  <p className="text-[11px] text-[#E7C7CC] truncate">
                    Handmade gift helper &amp; custom guide
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="p-1.5 rounded-full text-[#E7C7CC] hover:text-white hover:bg-white/10 transition-colors"
                aria-label="Close studio assistant"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Messages Area */}
            <div ref={scrollRef} className="flex-1 p-4 space-y-3 overflow-y-auto bg-[#FFF9F5]">
              {messages.map((msg) => (
                <div
                  key={msg.id}
                  className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-[85%] rounded-2xl px-3.5 py-2.5 text-xs leading-relaxed whitespace-pre-wrap ${
                      msg.role === 'user'
                        ? 'bg-[#6D1836] text-[#FFF9F5] rounded-br-xs'
                        : 'bg-white border border-[#E7C7CC] text-[#3E2F27] rounded-bl-xs shadow-xs'
                    }`}
                  >
                    {msg.content}
                  </div>
                </div>
              ))}

              {sending && (
                <div className="flex justify-start">
                  <div className="inline-flex items-center gap-2 px-3.5 py-2 rounded-2xl bg-white border border-[#E7C7CC] text-xs text-[#7A655C]">
                    <Loader2 className="w-3.5 h-3.5 animate-spin text-[#6D1836]" />
                    <span>Varni is thinking...</span>
                  </div>
                </div>
              )}

              {messages.length <= 2 && (
                <div className="pt-1 flex flex-wrap gap-1.5">
                  {STARTER_PROMPTS.map((q) => (
                    <button
                      key={q}
                      type="button"
                      onClick={() => void sendMessage(q)}
                      className="px-2.5 py-1.5 rounded-xl bg-[#F8EFEA] hover:bg-[#E7C7CC]/50 border border-[#E7C7CC] text-[11px] font-medium text-[#3E2F27] transition-colors text-left"
                    >
                      {q}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Footer Link + Input */}
            <div className="border-t border-[#E7C7CC]/70 bg-white p-3 space-y-2">
              <div className="flex items-center justify-between text-[11px] text-[#7A655C] px-1">
                <span>Want a one-of-a-kind gift?</span>
                <Link
                  to="/custom-orders"
                  onClick={() => setOpen(false)}
                  className="inline-flex items-center gap-1 font-semibold text-[#6D1836] hover:underline"
                >
                  <span>Custom Orders</span>
                  <ArrowRight className="w-3 h-3" />
                </Link>
              </div>
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  void sendMessage();
                }}
                className="flex items-center gap-2"
              >
                <input
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder="Ask about gifts, prices, or custom orders..."
                  className="flex-1 min-w-0 px-3 py-2 rounded-xl bg-[#FFF9F5] border border-[#E7C7CC] text-xs text-[#3E2F27] focus:outline-none focus:border-[#6D1836]"
                />
                <button
                  type="submit"
                  disabled={sending || !input.trim()}
                  aria-label="Send message"
                  className="p-2.5 rounded-xl bg-[#6D1836] hover:bg-[#541129] disabled:opacity-45 text-[#FFF9F5] transition-colors shrink-0"
                >
                  <Send className="w-3.5 h-3.5" />
                </button>
              </form>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Floating Cute Launcher Button */}
      <motion.button
        type="button"
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.96 }}
        onClick={() => setOpen((o) => !o)}
        aria-label={open ? 'Close studio chat' : 'Chat with Varni'}
        className="inline-flex items-center gap-2.5 px-4 py-3 rounded-full bg-[#6D1836] hover:bg-[#541129] text-[#FFF9F5] border border-[#C9A66B]/70 shadow-[0_12px_30px_-8px_rgba(109,24,54,0.45)] transition-colors"
      >
        {open ? (
          <X className="w-5 h-5" />
        ) : (
          <>
            <MessageCircleHeart className="w-5 h-5 text-[#E7C7CC]" />
            <span className="text-xs font-semibold tracking-wide hidden sm:inline">Ask Varni</span>
            <Sparkles className="w-3.5 h-3.5 text-[#C9A66B] hidden sm:inline" />
          </>
        )}
      </motion.button>
    </div>
  );
};
