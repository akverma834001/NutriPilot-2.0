import React, { useState } from 'react';
import { Recommendation } from '../types';
import { ThumbsUp, ThumbsDown, Smile, X, Check, HeartHandshake } from 'lucide-react';

interface FeedbackModalProps {
  recommendation: Recommendation | null;
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (rating: 'loved' | 'fine' | 'not_for_me', reasons: string[]) => void;
}

export const FeedbackModal: React.FC<FeedbackModalProps> = ({
  recommendation,
  isOpen,
  onClose,
  onSubmit
}) => {
  const [selectedRating, setSelectedRating] = useState<'loved' | 'fine' | 'not_for_me' | null>(null);
  const [selectedReasons, setSelectedReasons] = useState<string[]>([]);

  if (!isOpen || !recommendation) return null;

  const reasonOptions = [
    'Quick preparation',
    'Fits pantry items',
    'Too expensive',
    'Too much prep effort',
    "Didn't like taste profile",
    'Portion size not right',
    'Not available right now'
  ];

  const toggleReason = (reason: string) => {
    if (selectedReasons.includes(reason)) {
      setSelectedReasons(selectedReasons.filter((r) => r !== reason));
    } else {
      setSelectedReasons([...selectedReasons, reason]);
    }
  };

  const handleFinish = () => {
    if (selectedRating) {
      onSubmit(selectedRating, selectedReasons);
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fade-in">
      <div className="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-md p-6 space-y-5 shadow-2xl">
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <div className="flex items-center gap-2">
            <HeartHandshake className="w-5 h-5 text-brand-400" />
            <h3 className="text-base font-bold text-slate-100 font-heading">Recommendation Feedback</h3>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-200 p-1 rounded-lg"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="text-sm text-slate-300">
          How did <span className="font-semibold text-white">"{recommendation.title}"</span> work for your context?
        </div>

        {/* 3 Rating Buttons */}
        <div className="grid grid-cols-3 gap-3">
          <button
            type="button"
            onClick={() => setSelectedRating('loved')}
            className={`p-3 rounded-xl border flex flex-col items-center gap-2 transition-all ${
              selectedRating === 'loved'
                ? 'bg-emerald-500/20 border-emerald-500 text-emerald-300'
                : 'bg-slate-800/60 border-slate-700/80 text-slate-300 hover:bg-slate-800'
            }`}
          >
            <ThumbsUp className="w-5 h-5 text-emerald-400" />
            <span className="text-xs font-semibold">Loved it</span>
          </button>

          <button
            type="button"
            onClick={() => setSelectedRating('fine')}
            className={`p-3 rounded-xl border flex flex-col items-center gap-2 transition-all ${
              selectedRating === 'fine'
                ? 'bg-amber-500/20 border-amber-500 text-amber-300'
                : 'bg-slate-800/60 border-slate-700/80 text-slate-300 hover:bg-slate-800'
            }`}
          >
            <Smile className="w-5 h-5 text-amber-400" />
            <span className="text-xs font-semibold">Fine</span>
          </button>

          <button
            type="button"
            onClick={() => setSelectedRating('not_for_me')}
            className={`p-3 rounded-xl border flex flex-col items-center gap-2 transition-all ${
              selectedRating === 'not_for_me'
                ? 'bg-rose-500/20 border-rose-500 text-rose-300'
                : 'bg-slate-800/60 border-slate-700/80 text-slate-300 hover:bg-slate-800'
            }`}
          >
            <ThumbsDown className="w-5 h-5 text-rose-400" />
            <span className="text-xs font-semibold">Not for me</span>
          </button>
        </div>

        {/* Reason tags */}
        <div className="space-y-2 pt-1">
          <label className="text-xs text-slate-400 font-medium">Any specifics? (Optional)</label>
          <div className="flex flex-wrap gap-1.5">
            {reasonOptions.map((reason) => {
              const active = selectedReasons.includes(reason);
              return (
                <button
                  key={reason}
                  type="button"
                  onClick={() => toggleReason(reason)}
                  className={`px-2.5 py-1 text-xs rounded-lg border transition-all ${
                    active
                      ? 'bg-brand-500/20 border-brand-500 text-brand-300 font-medium'
                      : 'bg-slate-800/60 border-slate-700/60 text-slate-400 hover:text-slate-200'
                  }`}
                >
                  {reason}
                </button>
              );
            })}
          </div>
        </div>

        {/* Note on model feedback safety */}
        <p className="text-[11px] text-slate-500 italic">
          NutriPilot adapts future options based on preference without compromising your nutritional macro requirements.
        </p>

        <div className="flex justify-end gap-2 pt-2 border-t border-slate-800">
          <button
            type="button"
            onClick={onClose}
            className="px-3 py-1.5 text-xs text-slate-400 hover:text-slate-200"
          >
            Skip
          </button>
          <button
            type="button"
            disabled={!selectedRating}
            onClick={handleFinish}
            className="px-4 py-2 text-xs font-semibold rounded-xl bg-brand-500 hover:bg-brand-600 disabled:opacity-40 text-slate-950 transition-colors flex items-center gap-1.5"
          >
            <Check className="w-3.5 h-3.5" />
            Save Feedback
          </button>
        </div>
      </div>
    </div>
  );
};
