import React, { useState } from 'react';
import { usePersonalState } from '../context/PersonalStateContext';
import { AIService } from '../services/AIService';
import {
  Bot,
  X,
  Send,
  Sparkles,
  ShieldCheck,
  HelpCircle,
  Database,
  ArrowRight
} from 'lucide-react';
import { ProvenanceBadge } from './ProvenanceBadge';

interface AskNutriPilotDrawerProps {
  isOpen: boolean;
  onClose: () => void;
}

interface Message {
  sender: 'user' | 'assistant';
  text: string;
  citations?: string[];
  timestamp: string;
}

export const AskNutriPilotDrawer: React.FC<AskNutriPilotDrawerProps> = ({ isOpen, onClose }) => {
  const { state } = usePersonalState();
  const [messages, setMessages] = useState<Message[]>([
    {
      sender: 'assistant',
      text: `Hello Abhishek! I am your NutriPilot Intelligence Assistant. I am directly grounded in your live biometric data, nutrition logs, pantry inventory, and budget. How can I assist you right now?`,
      timestamp: 'Just now'
    }
  ]);
  const [inputValue, setInputValue] = useState('');

  if (!isOpen) return null;

  const quickPrompts = [
    'What should I eat after today\'s workout?',
    'How much protein do I need?',
    'Why did my target change?',
    'What can I make with my pantry?'
  ];

  const handleSend = (textToSend?: string) => {
    const query = textToSend || inputValue;
    if (!query.trim()) return;

    const userMsg: Message = {
      sender: 'user',
      text: query,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMessages((prev) => [...prev, userMsg]);
    if (!textToSend) setInputValue('');

    // Answer deterministically & grounded
    setTimeout(() => {
      const response = AIService.answerUserQuery(query, state);
      const aiMsg: Message = {
        sender: 'assistant',
        text: response.answer,
        citations: response.dataPointsCitations,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      setMessages((prev) => [...prev, aiMsg]);
    }, 400);
  };

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-slate-950/70 backdrop-blur-sm animate-fade-in">
      <div className="w-full max-w-lg bg-slate-900 border-l border-slate-700 h-full flex flex-col shadow-2xl">
        {/* Header */}
        <div className="p-4 border-b border-slate-800 flex items-center justify-between bg-slate-900/90 backdrop-blur-md">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-brand-600 to-emerald-400 p-0.5 shadow-md flex items-center justify-center text-slate-950 font-bold">
              <Bot className="w-5 h-5 text-slate-950" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <h3 className="text-sm font-bold text-white font-heading">Ask NutriPilot</h3>
                <ProvenanceBadge infoType="CALCULATED" source="State-Grounded Engine" confidence="high" />
              </div>
              <p className="text-[11px] text-slate-400">Context-Aware AI • Zero Hallucinations</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Message Stream */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4 text-xs">
          {messages.map((msg, idx) => (
            <div
              key={idx}
              className={`flex flex-col ${msg.sender === 'user' ? 'items-end' : 'items-start'} space-y-1.5`}
            >
              <div
                className={`max-w-[88%] p-3.5 rounded-2xl leading-relaxed ${
                  msg.sender === 'user'
                    ? 'bg-brand-500 text-slate-950 font-medium rounded-tr-none'
                    : 'bg-slate-850 text-slate-200 border border-slate-750 rounded-tl-none space-y-2'
                }`}
              >
                <div className="whitespace-pre-line">{msg.text}</div>

                {/* Grounding Citations */}
                {msg.citations && msg.citations.length > 0 && (
                  <div className="pt-2.5 mt-2 border-t border-slate-750 space-y-1 text-[11px] text-slate-400">
                    <div className="flex items-center gap-1 font-semibold text-slate-300">
                      <Database className="w-3 h-3 text-brand-400" />
                      <span>Data Grounding Citations:</span>
                    </div>
                    <ul className="list-disc list-inside space-y-0.5 text-slate-400">
                      {msg.citations.map((cite, cIdx) => (
                        <li key={cIdx} className="leading-tight">{cite}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
              <span className="text-[10px] text-slate-500 px-1">{msg.timestamp}</span>
            </div>
          ))}
        </div>

        {/* Quick Prompts */}
        <div className="p-3 border-t border-slate-800/80 bg-slate-900/60">
          <div className="text-[11px] text-slate-400 font-semibold mb-1.5 flex items-center gap-1">
            <Sparkles className="w-3 h-3 text-brand-400" />
            <span>Recommended contextual questions:</span>
          </div>
          <div className="flex flex-wrap gap-1.5">
            {quickPrompts.map((q) => (
              <button
                key={q}
                type="button"
                onClick={() => handleSend(q)}
                className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-750 text-slate-300 hover:text-white border border-slate-700/80 text-[11px] transition-colors"
              >
                {q}
              </button>
            ))}
          </div>
        </div>

        {/* Chat Input */}
        <div className="p-4 border-t border-slate-800 bg-slate-900">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSend();
            }}
            className="flex items-center gap-2"
          >
            <input
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              placeholder="Ask anything about your nutrition, workout, or pantry..."
              className="flex-1 bg-slate-850 border border-slate-700 rounded-xl px-4 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-brand-500"
            />
            <button
              type="submit"
              disabled={!inputValue.trim()}
              className="p-2.5 rounded-xl bg-brand-500 hover:bg-brand-600 disabled:opacity-40 text-slate-950 font-bold transition-colors"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>
          <div className="text-[10px] text-slate-500 text-center mt-2 flex items-center justify-center gap-1">
            <ShieldCheck className="w-3 h-3 text-brand-400" />
            <span>NutriPilot answers strictly from structured user state. Wellness support only, not medical diagnosis.</span>
          </div>
        </div>
      </div>
    </div>
  );
};
