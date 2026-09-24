import React, { useState } from 'react';
import { usePersonalState } from '../context/PersonalStateContext';
import { ProvenanceBadge } from '../components/ProvenanceBadge';
import { FeedbackModal } from '../components/FeedbackModal';
import { EnvironmentType, Recommendation } from '../types';
import { YouTubeRecipeService } from '../services/YouTubeRecipeService';
import {
  Sparkles,
  CheckCircle2,
  Clock,
  DollarSign,
  MapPin,
  Filter,
  Check,
  HeartHandshake,
  Database,
  ShieldCheck,
  ChevronDown,
  ExternalLink
} from 'lucide-react';

export const RecommendationsView: React.FC = () => {
  const {
    state,
    acceptRecommendation,
    submitFeedback,
    setEnvironment,
    refreshRecommendations
  } = usePersonalState();

  const [activeFeedbackRec, setActiveFeedbackRec] = useState<Recommendation | null>(null);
  const [selectedMaxTime, setSelectedMaxTime] = useState<number | undefined>(undefined);
  const [justAcceptedId, setJustAcceptedId] = useState<string | null>(null);

  const environments: { key: EnvironmentType; label: string }[] = [
    { key: 'COLLEGE', label: 'College' },
    { key: 'HOME', label: 'Home' },
    { key: 'OFFICE', label: 'Office' },
    { key: 'GYM', label: 'Gym' },
    { key: 'RESTAURANT', label: 'Restaurant' },
    { key: 'TRAVEL', label: 'Travel' }
  ];

  const handleEat = (rec: Recommendation) => {
    acceptRecommendation(rec);
    setJustAcceptedId(rec.id);
    setActiveFeedbackRec(rec);
  };

  const handleEnvChange = (env: EnvironmentType) => {
    setEnvironment(env);
    refreshRecommendations(env, selectedMaxTime);
  };

  const handleTimeFilter = (time?: number) => {
    setSelectedMaxTime(time);
    refreshRecommendations(state.profile.currentEnvironment, time);
  };

  return (
    <div className="space-y-6 pb-12 animate-fade-in">
      {/* Header Banner */}
      <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs uppercase tracking-wider text-brand-400 font-bold">
              Meal & Nutrition Ideas
            </span>
            <span className="text-slate-500">•</span>
            <span className="text-xs text-brand-300 font-medium">Personalized for You</span>
          </div>
          <h1 className="text-2xl font-extrabold text-white font-heading mt-1">
            Recommended Meals for You
          </h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Personalized to your pantry, dietary preferences, remaining calories, and protein targets.
          </p>
        </div>

        {/* Quick Context Chips */}
        <div className="flex flex-wrap gap-2 text-xs">
          <div className="px-3 py-1.5 rounded-xl bg-slate-850 border border-slate-750 text-slate-300">
            Remaining: <span className="font-bold text-white">{state.nutrition.caloriesRemaining.value} kcal</span>
          </div>
          <div className="px-3 py-1.5 rounded-xl bg-brand-500/10 border border-brand-500/30 text-brand-300">
            Protein Gap: <span className="font-bold">{state.nutrition.proteinRemaining.value}g</span>
          </div>
          <div className="px-3 py-1.5 rounded-xl bg-slate-850 border border-slate-750 text-amber-300">
            Budget Left: <span className="font-bold">₹{state.budget.remainingTodayInr}</span>
          </div>
        </div>
      </div>

      {/* FILTER CONTROLS (ENVIRONMENT & PREP TIME) */}
      <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        {/* Environment Pills */}
        <div className="flex items-center gap-2 overflow-x-auto w-full sm:w-auto pb-1 sm:pb-0">
          <span className="text-xs text-slate-400 font-medium flex items-center gap-1 shrink-0">
            <MapPin className="w-3.5 h-3.5 text-brand-400" />
            <span>Environment:</span>
          </span>
          <div className="flex gap-1.5 shrink-0">
            {environments.map((env) => (
              <button
                key={env.key}
                type="button"
                onClick={() => handleEnvChange(env.key)}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                  state.profile.currentEnvironment === env.key
                    ? 'bg-brand-500 text-slate-950 font-bold shadow-md shadow-brand-500/20'
                    : 'bg-slate-850 text-slate-400 hover:text-slate-200 border border-slate-750'
                }`}
              >
                {env.label}
              </button>
            ))}
          </div>
        </div>

        {/* Prep Time Pills */}
        <div className="flex items-center gap-2">
          <span className="text-xs text-slate-400 font-medium flex items-center gap-1 shrink-0">
            <Clock className="w-3.5 h-3.5 text-slate-400" />
            <span>Max Prep:</span>
          </span>
          <div className="flex gap-1.5">
            {[undefined, 10, 15, 20].map((t) => (
              <button
                key={t ?? 'all'}
                type="button"
                onClick={() => handleTimeFilter(t)}
                className={`px-2.5 py-1 rounded-lg text-xs transition-all ${
                  selectedMaxTime === t
                    ? 'bg-slate-750 text-white font-bold border border-slate-600'
                    : 'bg-slate-850 text-slate-400 hover:text-slate-200 border border-slate-800'
                }`}
              >
                {t ? `≤ ${t}m` : 'Any'}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* RECOMMENDATION CANDIDATE CARDS */}
      <div className="space-y-5">
        {state.recommendations.map((rec, index) => {
          const isTopPick = index === 0;
          const isAccepted = justAcceptedId === rec.id;

          return (
            <div
              key={rec.id}
              className={`p-6 rounded-2xl border transition-all ${
                isTopPick
                  ? 'bg-slate-900 border-brand-500/40 shadow-xl ring-1 ring-brand-500/20'
                  : 'bg-slate-900/90 border-slate-800 shadow-md hover:border-slate-700'
              }`}
            >
              <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4 pb-4 border-b border-slate-800">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    {isTopPick && (
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold uppercase bg-brand-500 text-slate-950">
                        TOP RECOMMENDATION
                      </span>
                    )}
                    <span className="text-xs text-slate-400 font-medium">
                      Context: {rec.timingContext}
                    </span>
                    {rec.sourceEngine === 'pantry_optimizer' ? (
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/10 text-emerald-300 border border-emerald-500/20">
                        Pantry Ready
                      </span>
                    ) : (
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-brand-500/10 text-brand-300 border border-brand-500/20">
                        Nutrition Match
                      </span>
                    )}
                  </div>
                  <h3 className="text-xl font-bold text-white font-heading">{rec.title}</h3>
                  <p className="text-xs text-slate-400">{rec.description}</p>

                  {/* YouTube Recipe Video Link */}
                  {rec.youtubeUrl && (
                    <div className="pt-2 flex flex-wrap items-center gap-2">
                      <a
                        href={rec.youtubeUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-red-600/20 hover:bg-red-600/30 border border-red-500/40 text-red-200 hover:text-white text-xs font-bold transition-all shadow-sm group active:scale-95"
                        title={rec.youtubeVideoTitle ? `Watch "${rec.youtubeVideoTitle}" on YouTube` : 'Watch recipe tutorial on YouTube'}
                      >
                        <svg className="w-4 h-4 fill-red-500 group-hover:scale-110 transition-transform shrink-0" viewBox="0 0 24 24">
                          <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
                        </svg>
                        <span>Watch Best Recipe Video</span>
                        <ExternalLink className="w-3 h-3 text-red-400/80" />
                      </a>

                      <a
                        href={`https://www.youtube.com/results?search_query=${encodeURIComponent(YouTubeRecipeService.cleanRecipeTitle(rec.title) + ' recipe tutorial')}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-750 border border-slate-700 text-slate-300 hover:text-white text-xs transition-colors"
                        title="Search all recipe tutorials and variations on YouTube"
                      >
                        <span>All Chef Videos</span>
                        <ExternalLink className="w-2.5 h-2.5 text-slate-400" />
                      </a>

                      {rec.youtubeVideoTitle && (
                        <span className="text-[11px] text-slate-400 font-medium truncate max-w-xs hidden sm:inline">
                          ▶ {rec.youtubeVideoTitle}
                        </span>
                      )}
                    </div>
                  )}
                </div>

                <div className="flex items-center gap-3">
                  <div className="text-right">
                    <span className="text-[10px] text-slate-400 block uppercase tracking-wider font-semibold">Match Score</span>
                    <span className="text-lg font-mono font-extrabold text-brand-400">{rec.suitabilityScore}%</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleEat(rec)}
                    disabled={isAccepted}
                    className={`px-5 py-2.5 rounded-xl font-bold text-xs flex items-center gap-2 transition-all ${
                      isAccepted
                        ? 'bg-emerald-600 text-white cursor-default'
                        : 'bg-brand-500 hover:bg-brand-600 text-slate-950 shadow-md shadow-brand-500/20 active:scale-95'
                    }`}
                  >
                    {isAccepted ? <Check className="w-4 h-4 stroke-[2.5]" /> : <CheckCircle2 className="w-4 h-4" />}
                    <span>{isAccepted ? 'Logged to Today' : 'I Ate This'}</span>
                  </button>
                </div>
              </div>

              {/* Middle: Macro specs */}
              <div className="grid grid-cols-2 sm:grid-cols-5 gap-2.5 py-4 text-xs font-semibold">
                <div className="p-2.5 rounded-xl bg-slate-850 border border-slate-800">
                  <span className="text-[10px] text-slate-400 block font-normal">Calories</span>
                  <span className="text-sm font-bold text-amber-400 font-mono">~{rec.calories} kcal</span>
                </div>
                <div className="p-2.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20">
                  <span className="text-[10px] text-emerald-400 block font-normal">Protein</span>
                  <span className="text-sm font-bold text-emerald-300 font-mono">~{rec.proteinG}g</span>
                </div>
                <div className="p-2.5 rounded-xl bg-slate-850 border border-slate-800">
                  <span className="text-[10px] text-slate-400 block font-normal">Carbs / Fat</span>
                  <span className="text-sm font-bold text-slate-200 font-mono">{rec.carbsG}g / {rec.fatG}g</span>
                </div>
                <div className="p-2.5 rounded-xl bg-slate-850 border border-slate-800">
                  <span className="text-[10px] text-slate-400 block font-normal">Prep Time</span>
                  <span className="text-sm font-bold text-slate-200 font-mono">{rec.prepTimeMinutes} min</span>
                </div>
                <div className="p-2.5 rounded-xl bg-slate-850 border border-slate-800">
                  <span className="text-[10px] text-slate-400 block font-normal">Estimated Cost</span>
                  <span className="text-sm font-bold text-amber-300 font-mono">₹{rec.estimatedCostInr}</span>
                </div>
              </div>

              {/* Bottom: Explainability & Data Used */}
              <div className="pt-3 border-t border-slate-800/80 grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                {/* Why */}
                <div className="space-y-1.5">
                  <span className="text-[11px] uppercase tracking-wider font-bold text-slate-400">
                    Why this fits your day:
                  </span>
                  <ul className="space-y-1 text-slate-300">
                    {rec.whyReasons.map((why, i) => (
                      <li key={i} className="flex items-start gap-1.5">
                        <span className="text-brand-400 mt-0.5">•</span>
                        <span>{why}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Data Used */}
                <div className="space-y-1.5">
                  <span className="text-[11px] uppercase tracking-wider font-bold text-slate-400 flex items-center gap-1">
                    <Database className="w-3 h-3 text-slate-500" />
                    <span>Personalized based on:</span>
                  </span>
                  <ul className="space-y-1 text-slate-400 text-[11px]">
                    {rec.dataConsidered.map((data, i) => (
                      <li key={i} className="flex items-start gap-1.5">
                        <span className="text-slate-600">•</span>
                        <span>{data}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              {/* Feedback CTA */}
              <div className="mt-4 pt-3 border-t border-slate-800/60 flex items-center justify-between text-xs">
                <span className="text-[11px] text-slate-500 italic">
                  ✓ Verified vegetarian & peanut-free
                </span>
                <button
                  type="button"
                  onClick={() => setActiveFeedbackRec(rec)}
                  className="text-slate-400 hover:text-white flex items-center gap-1.5 text-xs font-medium"
                >
                  <HeartHandshake className="w-3.5 h-3.5 text-brand-400" />
                  <span>How did this taste? (Feedback)</span>
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Feedback Modal */}
      <FeedbackModal
        recommendation={activeFeedbackRec}
        isOpen={Boolean(activeFeedbackRec)}
        onClose={() => setActiveFeedbackRec(null)}
        onSubmit={(rating, reasons) => {
          if (activeFeedbackRec) submitFeedback(activeFeedbackRec.id, rating, reasons);
        }}
      />
    </div>
  );
};
