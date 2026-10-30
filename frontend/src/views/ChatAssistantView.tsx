import React, { useState, useRef, useEffect } from 'react';
import { ChatMessage, NavSection, UserProfile } from '../types';
import {
  Send,
  Bot,
  User,
  Sparkles,
  Play,
  RotateCcw,
  Cpu,
  Activity,
  CheckCircle2,
  Clock,
  HeartPulse
} from 'lucide-react';
import { api } from '../services/api';

interface ChatAssistantViewProps {
  onStartActivity: (activityId: string) => void;
  onNavigate: (section: NavSection) => void;
}

export const ChatAssistantView: React.FC<ChatAssistantViewProps> = ({
  onStartActivity,
  onNavigate
}) => {
  // Retrieve saved profile name
  const [profile, setProfile] = useState<UserProfile | null>(() => {
    try {
      const saved = localStorage.getItem('vybe_user_session');
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });

  const userName = profile?.name ? profile.name.split(' ')[0] : 'there';
  const userRole = profile?.role || 'Software Engineer';

  const defaultGreeting: ChatMessage = {
    role: 'assistant',
    content: `Hello ${userName}! 👋 I'm VYBE, your workplace wellness companion.

I read your messages, analyze your physical and cognitive fatigue, and recommend the best science-backed rhythm resets for your workday.

Whether you've been coding for hours, have 2 minutes before a call, or feel tension in your neck or eyes, tell me what you're experiencing!`,
    source: 'rule_engine'
  };

  const [messages, setMessages] = useState<ChatMessage[]>(() => {
    try {
      const saved = localStorage.getItem('vybe_chat_messages');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch {}
    return [defaultGreeting];
  });

  const [input, setInput] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const samplePrompts = [
    "I have been staring at code for 3 hours.",
    "My neck and shoulders are really stiff.",
    "I only have 2 minutes before my next meeting.",
    "I'm feeling stressed and overwhelmed.",
    "I'm exhausted and can't focus.",
    "I don't want to walk. Give me another option.",
    "What activities did I complete today?"
  ];

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
    try {
      localStorage.setItem('vybe_chat_messages', JSON.stringify(messages));
    } catch {}
  }, [messages]);

  const handleSend = async (textToSend?: string) => {
    const query = (textToSend || input).trim();
    if (!query || loading) return;

    setInput('');
    const userMsg: ChatMessage = { role: 'user', content: query };
    const newHistory = [...messages, userMsg];
    setMessages(newHistory);
    setLoading(true);

    try {
      // Small natural pause for thinking simulation
      await new Promise((r) => setTimeout(r, 400));
      const resp = await api.sendChat(query, profile?.user_id || 'default_user', newHistory);
      setMessages((prev) => [...prev, resp]);
    } catch (e) {
      setMessages((prev) => [
        ...prev,
        {
          role: 'assistant',
          content: 'I had trouble processing that request. Please try selecting a quick action from the dashboard.',
          source: 'rule_engine'
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleActionClick = (actionStr: string) => {
    if (actionStr.startsWith('start_')) {
      const actId = actionStr.replace('start_', '');
      onStartActivity(actId);
    } else if (actionStr === 'navigate_planner') {
      onNavigate('planner');
    } else if (actionStr === 'navigate_journey') {
      onNavigate('journey');
    }
  };

  // Helper to format markdown bold and highlight headers
  const renderFormattedContent = (content: string) => {
    const lines = content.split('\n');
    return lines.map((line, lIdx) => {
      // Check for Analysis header
      if (line.includes('🔍 **Conversation Analysis')) {
        return (
          <div key={lIdx} className="my-2 p-2.5 rounded-xl bg-vybe-mint/40 border border-vybe-teal/20 text-vybe-navy font-medium text-[11px] flex items-center gap-2">
            <HeartPulse className="w-4 h-4 text-vybe-teal shrink-0" />
            <span>{line.replace(/🔍|\*\*/g, '').trim()}</span>
          </div>
        );
      }
      // Check for Recommendation header
      if (line.includes('💡 **Best Recommendation')) {
        return (
          <div key={lIdx} className="my-2 p-2.5 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 font-semibold text-[11px] flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-amber-600 shrink-0" />
            <span>{line.replace(/💡|\*\*/g, '').trim()}</span>
          </div>
        );
      }

      // Format bold spans
      const parts = line.split(/(\*\*.*?\*\*)/g);
      return (
        <div key={lIdx} className={line.trim() === '' ? 'h-2' : 'leading-relaxed'}>
          {parts.map((p, pIdx) => {
            if (p.startsWith('**') && p.endsWith('**')) {
              return (
                <strong key={pIdx} className="font-bold text-vybe-navy">
                  {p.slice(2, -2)}
                </strong>
              );
            }
            return <span key={pIdx}>{p}</span>;
          })}
        </div>
      );
    });
  };

  return (
    <div className="max-w-4xl mx-auto h-[calc(100vh-140px)] flex flex-col bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden animate-fade-in">
      {/* Header */}
      <div className="p-4 sm:p-5 border-b border-slate-100 bg-slate-50/80 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-vybe-navy flex items-center justify-center text-vybe-teal shadow-md">
            <Bot className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-base font-extrabold text-vybe-navy">Talk to VYBE</h2>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                Rhythm Analyzer Active
              </span>
            </div>
            <p className="text-[11px] text-slate-500 font-medium">
              Personalized wellness companion for <strong className="text-vybe-navy">{userName}</strong> ({userRole})
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => {
              setMessages([defaultGreeting]);
              try {
                localStorage.removeItem('vybe_chat_messages');
              } catch {}
            }}
            title="Reset conversation"
            className="p-2 text-slate-400 hover:text-slate-700 rounded-lg hover:bg-slate-200/60 transition-colors"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Messages Scroll Area */}
      <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4">
        {messages.map((msg, idx) => {
          const isUser = msg.role === 'user';
          return (
            <div
              key={idx}
              className={`flex items-start gap-3 ${isUser ? 'flex-row-reverse' : 'flex-row'}`}
            >
              <div
                className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 text-xs font-bold ${
                  isUser
                    ? 'bg-vybe-teal text-white'
                    : 'bg-vybe-navy text-vybe-teal shadow-sm'
                }`}
              >
                {isUser ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
              </div>

              <div
                className={`max-w-[85%] sm:max-w-xl rounded-2xl p-4 text-xs leading-relaxed ${
                  isUser
                    ? 'bg-vybe-navy text-white rounded-tr-none'
                    : 'bg-slate-50 border border-slate-200/90 text-slate-800 rounded-tl-none shadow-sm'
                }`}
              >
                {isUser ? (
                  <div className="whitespace-pre-wrap">{msg.content}</div>
                ) : (
                  <div>{renderFormattedContent(msg.content)}</div>
                )}

                {/* Structured Suggested Actions / Activity Buttons */}
                {!isUser && msg.suggested_actions && msg.suggested_actions.length > 0 && (
                  <div className="flex flex-wrap gap-2 mt-3 pt-3 border-t border-slate-200/60">
                    {msg.suggested_actions.map((act, actIdx) => (
                      <button
                        key={actIdx}
                        onClick={() => handleActionClick(act.action)}
                        className="py-1.5 px-3 rounded-lg bg-vybe-teal hover:bg-vybe-teal-dark text-white font-semibold text-[11px] shadow-sm flex items-center gap-1.5 transition-all active:scale-95"
                      >
                        <Play className="w-3 h-3 fill-white" />
                        <span>{act.label}</span>
                      </button>
                    ))}
                  </div>
                )}

                {/* Source attribution badge */}
                {!isUser && (
                  <div className="mt-2 flex items-center gap-1 text-[9px] text-slate-400 font-mono">
                    <Cpu className="w-2.5 h-2.5" />
                    <span>Engine: Intelligent Rhythm Analysis & Adaptive Recommendations</span>
                  </div>
                )}
              </div>
            </div>
          );
        })}

        {loading && (
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl bg-vybe-navy flex items-center justify-center text-vybe-teal">
              <Bot className="w-4 h-4 animate-spin" />
            </div>
            <div className="bg-slate-50 rounded-2xl p-3 border border-slate-200 text-xs text-slate-500 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-vybe-teal animate-bounce"></span>
              <span>VYBE is reading your message and analyzing fatigue levels...</span>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Suggested Quick Prompt Chips */}
      <div className="px-4 py-2 border-t border-slate-100 bg-slate-50/50 flex items-center gap-1.5 overflow-x-auto text-[11px] no-scrollbar">
        <span className="font-bold text-slate-400 shrink-0 text-[10px] uppercase">Quick Inquiries:</span>
        {samplePrompts.map((p, idx) => (
          <button
            key={idx}
            onClick={() => handleSend(p)}
            className="px-2.5 py-1 rounded-full bg-white border border-slate-200 hover:border-vybe-teal text-slate-600 hover:text-vybe-navy whitespace-nowrap transition-colors shadow-2xs shrink-0"
          >
            {p}
          </button>
        ))}
      </div>

      {/* Input Field */}
      <div className="p-3 sm:p-4 bg-white border-t border-slate-100">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSend();
          }}
          className="flex items-center gap-2"
        >
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder={`Message VYBE (e.g., 'My eyes burn and neck is tight', 'I have 2 mins')...`}
            className="flex-1 py-3 px-4 rounded-xl border border-slate-200 focus:outline-none focus:border-vybe-teal text-xs text-slate-800 placeholder:text-slate-400"
          />
          <button
            type="submit"
            disabled={!input.trim() || loading}
            className="p-3 rounded-xl bg-vybe-teal hover:bg-vybe-teal-dark disabled:bg-slate-200 text-white shadow-sm transition-all active:scale-95 flex items-center justify-center"
          >
            <Send className="w-4 h-4" />
          </button>
        </form>
      </div>
    </div>
  );
};
