import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  MessageCircle,
  Phone,
  Bot,
  X,
  Send,
  Sparkles,
  MapPin,
  ShieldCheck,
  Landmark,
  Car,
  Calendar,
  ExternalLink,
  ChevronRight,
  User,
} from 'lucide-react';
import { KriyaaLogo } from '../KriyaaLogo';
import { KRIYAA_KNOWLEDGE_BASE } from '../../data/publicData';
import { AssistantMessage } from '../../types';

interface PublicQuickActionsProps {
  onOpenConsultation: () => void;
  onOpenCabBooking: () => void;
  onNavigateToProjects: () => void;
}

export const PublicQuickActions: React.FC<PublicQuickActionsProps> = ({
  onOpenConsultation,
  onOpenCabBooking,
  onNavigateToProjects,
}) => {
  const [isBotOpen, setIsBotOpen] = useState(false);
  const [inputValue, setInputValue] = useState('');
  const [messages, setMessages] = useState<AssistantMessage[]>([
    {
      id: 'msg-1',
      sender: 'assistant',
      text: 'Vanakkam! 🙏 I am your **Kriyaa Assistant**. Ask me anything about Golden City, Chidambaram Plots, Pondy Heights, DTCP sanctions, bank loans, or booking a free site visit.',
      timestamp: 'Just now',
      suggestedPrompts: [
        'Golden City details',
        'Plot pricing & sizes',
        '80% Bank Loan info',
        'DTCP & Patta details',
        'Book Free Site Visit',
      ],
    },
  ]);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (isBotOpen) {
      scrollToBottom();
    }
  }, [messages, isBotOpen]);

  // Client-side keyword knowledge base lookup
  const findAnswer = (question: string): { response: string; prompts: string[] } => {
    const qLower = question.toLowerCase();

    // Check knowledge base
    for (const entry of KRIYAA_KNOWLEDGE_BASE) {
      const match = entry.keywords.some((kw) => qLower.includes(kw));
      if (match) {
        return {
          response: entry.response,
          prompts: ['Show more plots', 'Talk to Rajesh RTR on WhatsApp', 'Book Free Site Visit'],
        };
      }
    }

    // Default friendly response
    return {
      response:
        `Thank you for your question! Rajesh RTR and our Kriyaa Promoters executive desk are ready to assist you personally.\n\n` +
        `• Call / WhatsApp: +91 94432 78899\n` +
        `• Office: No. 7, Kamaraj Salai, Cuddalore\n` +
        `• DTCP Approved Layouts: Golden City (Cuddalore), Chidambaram Plots, and Pondy Heights (ECR).`,
      prompts: ['Explore Master Plan', 'Contact Rajesh RTR', 'Bank Loan info'],
    };
  };

  const handleSendMessage = (textToSend?: string) => {
    const query = (textToSend || inputValue).trim();
    if (!query) return;

    const userMsg: AssistantMessage = {
      id: `usr-${Date.now()}`,
      sender: 'user',
      text: query,
      timestamp: 'Now',
    };

    setMessages((prev) => [...prev, userMsg]);
    if (!textToSend) setInputValue('');

    // Trigger instant client-side answer with slight typing simulation
    setTimeout(() => {
      const { response, prompts } = findAnswer(query);
      const botMsg: AssistantMessage = {
        id: `bot-${Date.now()}`,
        sender: 'assistant',
        text: response,
        timestamp: 'Now',
        suggestedPrompts: prompts,
      };
      setMessages((prev) => [...prev, botMsg]);
    }, 300);
  };

  const handlePromptClick = (prompt: string) => {
    if (prompt === 'Book Free Site Visit' || prompt === 'Book Free Cab' || prompt === 'Book Free Site Visit Cab') {
      setIsBotOpen(false);
      onOpenCabBooking();
      return;
    }
    if (prompt === 'Show more plots' || prompt === 'Explore Master Plan') {
      setIsBotOpen(false);
      onNavigateToProjects();
      return;
    }
    if (prompt === 'Talk to Rajesh RTR on WhatsApp' || prompt === 'Contact Rajesh RTR') {
      window.open(
        'https://wa.me/919443278899?text=Hello%20Rajesh%20RTR,%20I%20have%20an%20inquiry%20regarding%20Kriyaa%20Promoters%20plots.',
        '_blank'
      );
      return;
    }
    handleSendMessage(prompt);
  };

  const handleDirectWhatsApp = () => {
    const message =
      'Hello Rajesh RTR (Managing Director), I am browsing Kriyaa Promoters website and would like information regarding DTCP plots in Golden City / Pondy Heights.';
    window.open(`https://wa.me/919443278899?text=${encodeURIComponent(message)}`, '_blank');
  };

  const handleDirectCall = () => {
    window.location.href = 'tel:+919443278899';
  };

  return (
    <>
      {/* ─────────────────────────────────────────────────────────────
          PERSISTENT FLOATING QUICK ACTION CLUSTER
          Pinned bottom-right, elevated z-index, safe clearance
          ───────────────────────────────────────────────────────────── */}
      <aside aria-label="Quick Actions" className="fixed bottom-20 md:bottom-6 right-4 sm:right-6 z-40 flex flex-col items-end gap-2.5 pointer-events-auto">
        {/* 1. Direct 1-tap WhatsApp Chat to MD Rajesh RTR */}
        <motion.button
          whileHover={{ scale: 1.08 }}
          whileTap={{ scale: 0.94 }}
          onClick={handleDirectWhatsApp}
          className="w-12 h-12 sm:w-13 sm:h-13 rounded-full bg-[#25D366] hover:bg-[#20bd5a] text-white shadow-xl shadow-[#25D366]/30 flex items-center justify-center cursor-pointer relative group transition-all"
          title="Direct WhatsApp to MD Rajesh RTR (+91 94432 78899)"
          aria-label="WhatsApp Rajesh RTR"
        >
          <MessageCircle className="w-6 h-6 fill-white text-[#25D366]" />
          {/* Tooltip on Desktop */}
          <span className="hidden md:group-hover:flex absolute right-14 whitespace-nowrap bg-slate-900 text-white text-xs font-semibold px-3 py-1.5 rounded-xl shadow-lg border border-slate-800 items-center gap-1.5 pointer-events-none">
            <span>WhatsApp MD Rajesh RTR</span>
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
          </span>
        </motion.button>

        {/* 2. Direct 1-tap Phone Call dialer (+91 94432 78899) */}
        <motion.button
          whileHover={{ scale: 1.08 }}
          whileTap={{ scale: 0.94 }}
          onClick={handleDirectCall}
          className="w-12 h-12 sm:w-13 sm:h-13 rounded-full bg-[#113B24] hover:bg-[#15803D] text-[#EAB308] border-2 border-[#EAB308]/60 shadow-xl shadow-black/40 flex items-center justify-center cursor-pointer relative group transition-all"
          title="Call Promoter Rajesh RTR: +91 94432 78899"
          aria-label="Call Rajesh RTR"
        >
          <Phone className="w-5 h-5 fill-current" />
          {/* Tooltip on Desktop */}
          <span className="hidden md:group-hover:flex absolute right-14 whitespace-nowrap bg-slate-900 text-white text-xs font-semibold px-3 py-1.5 rounded-xl shadow-lg border border-slate-800 items-center gap-1.5 pointer-events-none">
            <span>Call +91 94432 78899</span>
          </span>
        </motion.button>

        {/* 3. Interactive "Kriyaa Assistant" Bot Trigger */}
        <motion.button
          whileHover={{ scale: 1.08 }}
          whileTap={{ scale: 0.94 }}
          onClick={() => setIsBotOpen(!isBotOpen)}
          className="relative w-13 h-13 sm:w-14 sm:h-14 rounded-full bg-gradient-to-tr from-[#113B24] via-[#15803D] to-[#CA8A04] text-white p-0.5 shadow-2xl shadow-emerald-950/60 flex items-center justify-center cursor-pointer group"
          title="Open Kriyaa Assistant Bot"
          aria-label="Kriyaa Assistant Bot"
        >
          {/* Pulsing Aura */}
          <span className="absolute -inset-1 rounded-full bg-emerald-400/30 animate-ping opacity-60" />

          <div className="w-full h-full rounded-full bg-[#0B2516] flex items-center justify-center border border-[#EAB308]/50">
            {isBotOpen ? (
              <X className="w-6 h-6 text-[#EAB308]" />
            ) : (
              <Bot className="w-7 h-7 text-[#EAB308]" />
            )}
          </div>

          {/* Badge indicator */}
          {!isBotOpen && (
            <span className="absolute -top-1 -right-1 w-4 h-4 bg-[#EAB308] text-slate-950 text-[10px] font-black rounded-full flex items-center justify-center shadow-md border border-slate-900">
              AI
            </span>
          )}
        </motion.button>
      </aside>

      {/* ─────────────────────────────────────────────────────────────
          INTERACTIVE KRIYAA ASSISTANT CHAT MODAL / DRAWER
          Client-side instant knowledge base, zero external APIs
          ───────────────────────────────────────────────────────────── */}
      <AnimatePresence>
        {isBotOpen && (
          <motion.div
            initial={{ opacity: 0, y: 30, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.96 }}
            transition={{ duration: 0.25, ease: 'easeOut' }}
            className="fixed bottom-24 sm:bottom-24 right-3 sm:right-6 z-50 w-[calc(100vw-24px)] sm:w-[400px] max-h-[82vh] h-[580px] bg-white dark:bg-[#0B2516] border-2 border-[#1E5D32] rounded-3xl shadow-2xl flex flex-col overflow-hidden text-slate-900 dark:text-slate-100"
          >
            {/* Header: Deep Forest Green (#113B24) */}
            <div className="bg-[#113B24] p-4 text-white flex items-center justify-between border-b border-[#1E5D32] shrink-0">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-[#0B2516] border border-[#EAB308]/60 p-1 flex items-center justify-center shrink-0">
                  <KriyaaLogo className="w-full h-full" />
                </div>
                <div>
                  <h3 className="text-sm font-black tracking-wide flex items-center gap-1.5">
                    <span>Kriyaa Assistant</span>
                    <Sparkles className="w-3.5 h-3.5 text-[#EAB308]" />
                  </h3>
                  <p className="text-[10px] text-[#EAB308] font-medium">
                    Instant Plot & DTCP Guide · MD Rajesh RTR
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setIsBotOpen(false)}
                className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-colors cursor-pointer"
                aria-label="Close Assistant"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Quick Fast-Action Ribbon */}
            <div className="bg-emerald-50 dark:bg-emerald-950/40 px-3 py-2 border-b border-emerald-100 dark:border-emerald-900/60 flex items-center justify-between text-[11px] font-semibold text-[#15803D] dark:text-emerald-300 shrink-0">
              <span className="flex items-center gap-1">
                <ShieldCheck className="w-3.5 h-3.5 text-[#15803D]" />
                <span>Zero Wait Time · 100% Instant Answers</span>
              </span>
              <button
                type="button"
                onClick={onOpenCabBooking}
                className="text-[10.5px] bg-[#15803D] hover:bg-[#113B24] text-white px-2.5 py-0.5 rounded-md font-bold cursor-pointer transition-colors"
              >
                Site Visit
              </button>
            </div>

            {/* Chat Messages Body */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3.5 bg-slate-50 dark:bg-[#081B10]">
              {messages.map((msg) => {
                const isUser = msg.sender === 'user';
                return (
                  <div
                    key={msg.id}
                    className={`flex flex-col ${isUser ? 'items-end' : 'items-start'} space-y-1.5`}
                  >
                    <div
                      className={`max-w-[85%] rounded-2xl p-3 text-xs leading-relaxed ${
                        isUser
                          ? 'bg-[#15803D] text-white rounded-br-xs shadow-md'
                          : 'bg-white dark:bg-[#112F1C] text-slate-800 dark:text-slate-100 border border-slate-200 dark:border-[#1E5D32] rounded-bl-xs shadow-sm'
                      }`}
                    >
                      {/* Formatted body with bold and bullets */}
                      <div className="whitespace-pre-line space-y-1">
                        {msg.text.split('\n').map((line, i) => (
                          <p key={i}>
                            {line.startsWith('•') ? (
                              <span className="font-medium text-emerald-800 dark:text-emerald-300">
                                {line}
                              </span>
                            ) : (
                              line
                            )}
                          </p>
                        ))}
                      </div>
                    </div>

                    <span className="text-[9.5px] text-slate-400 dark:text-emerald-300/60 px-1 font-mono">
                      {msg.timestamp}
                    </span>

                    {/* Suggested Prompt Chips */}
                    {msg.suggestedPrompts && msg.suggestedPrompts.length > 0 && (
                      <div className="flex flex-wrap gap-1.5 pt-1.5 max-w-[92%]">
                        {msg.suggestedPrompts.map((prompt, idx) => (
                          <button
                            key={idx}
                            type="button"
                            onClick={() => handlePromptClick(prompt)}
                            className="text-[10.5px] font-semibold px-2.5 py-1 rounded-full bg-white dark:bg-[#133A23] hover:bg-emerald-50 dark:hover:bg-[#1A4F30] text-[#113B24] dark:text-[#EAB308] border border-emerald-300 dark:border-emerald-700/60 shadow-xs transition-all cursor-pointer flex items-center gap-1 active:scale-95"
                          >
                            <span>{prompt}</span>
                            <ChevronRight className="w-2.5 h-2.5 opacity-60" />
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                );
              })}
              <div ref={messagesEndRef} />
            </div>

            {/* Input Bar */}
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleSendMessage();
              }}
              className="p-3 bg-white dark:bg-[#0B2516] border-t border-slate-200 dark:border-[#1E5D32] flex items-center gap-2 shrink-0"
            >
              <input
                type="text"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                placeholder="Ask about Golden City, loans, pricing..."
                className="flex-1 text-xs px-3.5 py-2.5 rounded-xl bg-slate-100 dark:bg-[#112F1C] border border-slate-300 dark:border-[#1E5D32] text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-[#15803D]"
              />
              <button
                type="submit"
                disabled={!inputValue.trim()}
                className="w-10 h-10 rounded-xl bg-[#15803D] hover:bg-[#113B24] disabled:opacity-40 text-white flex items-center justify-center transition-all cursor-pointer shrink-0 shadow-md"
                aria-label="Send message"
              >
                <Send className="w-4 h-4" />
              </button>
            </form>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};
