import React, { useState } from 'react';
import { usePersonalState } from '../context/PersonalStateContext';
import { ProvenanceBadge } from '../components/ProvenanceBadge';
import { MacroProgressBar } from '../components/MacroProgressBar';
import { TransparencyModal } from '../components/TransparencyModal';
import { FeedbackModal } from '../components/FeedbackModal';
import {
  Activity,
  Flame,
  Moon,
  Sparkles,
  ArrowRight,
  CheckCircle2,
  TrendingDown,
  AlertCircle,
  Clock,
  DollarSign,
  ChevronRight,
  Droplets,
  Heart,
  Dumbbell,
  ShieldCheck,
  HelpCircle,
  Utensils,
  Smartphone,
  ExternalLink
} from 'lucide-react';
import { Recommendation } from '../types';
import { YouTubeRecipeService } from '../services/YouTubeRecipeService';

interface DashboardViewProps {
  onNavigateTab: (tab: any) => void;
  onOpenFoodModal: () => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({ onNavigateTab, onOpenFoodModal }) => {
  const {
    state,
    acceptRecommendation,
    submitFeedback,
    logWater,
    startLiveWorkout,
    addSteps,
    isPhonePedometerActive,
    startPhonePedometer,
    stopPhonePedometer
  } = usePersonalState();

  const [showTransparencyModal, setShowTransparencyModal] = useState(false);
  const [feedbackRec, setFeedbackRec] = useState<Recommendation | null>(null);
  const [showAlignmentBreakdown, setShowAlignmentBreakdown] = useState(false);

  const primaryRec = state.activeRecommendation || state.recommendations[0];
  const nutrition = state.nutrition;
  const activity = state.activity;
  const energy = state.energyModel;
  const recovery = state.recovery;

  const handleEatThis = (rec: Recommendation) => {
    acceptRecommendation(rec);
    setFeedbackRec(rec);
  };

  return (
    <div className="space-y-6 pb-12 animate-fade-in">
      {/* 1. HERO SECTION & TRANSPARENT ALIGNMENT */}
      <div className="p-6 rounded-2xl bg-gradient-to-br from-slate-900 via-slate-850 to-slate-900 border border-slate-750 shadow-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 -mt-10 -mr-10 w-64 h-64 bg-brand-500/5 rounded-full blur-3xl pointer-events-none" />

        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 relative z-10">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <span className="text-xs uppercase tracking-wider text-brand-400 font-bold font-mono">
                Today's Health Summary
              </span>
              <span className="text-slate-500">•</span>
              <span className="text-xs text-slate-400">Environment: <strong className="text-slate-200">{state.profile.currentEnvironment}</strong></span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white font-heading tracking-tight">
              Good evening, Abhishek
            </h1>
            <p className="text-sm text-slate-300 max-w-2xl leading-relaxed">
              {state.todayAlignmentScore >= 80
                ? "Your nutrition and activity are currently well aligned with your muscle gain plan."
                : state.todayAlignmentScore >= 65
                ? "Your calorie pacing and steps are solid, but protein intake requires a focused evening meal."
                : "You have several nutrient and activity targets trailing today. Check your Next Best Action."}
            </p>
          </div>

          {/* Alignment Score Gauge */}
          <div
            onClick={() => setShowAlignmentBreakdown(!showAlignmentBreakdown)}
            className="p-4 rounded-xl bg-slate-900/90 border border-slate-700/80 shadow-md flex items-center gap-4 cursor-pointer hover:border-brand-500/50 transition-all shrink-0 w-full sm:w-auto"
            title="Click to view daily alignment breakdown"
          >
            <div className="relative w-14 h-14 flex items-center justify-center">
              <svg className="w-14 h-14 -rotate-90" viewBox="0 0 36 36">
                <path
                  className="text-slate-800"
                  strokeWidth="3.5"
                  stroke="currentColor"
                  fill="none"
                  d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                />
                <path
                  className="text-brand-400"
                  strokeDasharray={`${state.todayAlignmentScore}, 100`}
                  strokeWidth="3.5"
                  strokeLinecap="round"
                  stroke="currentColor"
                  fill="none"
                  d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                />
              </svg>
              <span className="absolute text-sm font-extrabold text-white font-heading">
                {state.todayAlignmentScore}%
              </span>
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="text-xs font-bold text-slate-200">Daily Alignment</span>
                <HelpCircle className="w-3.5 h-3.5 text-slate-400" />
              </div>
              <span className="text-[11px] text-slate-400 block">
                Health Score (Click for breakdown)
              </span>
            </div>
          </div>
        </div>

        {/* Alignment Breakdown Accordion */}
        {showAlignmentBreakdown && (
          <div className="mt-5 pt-4 border-t border-slate-800 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 animate-fade-in">
            {state.alignmentBreakdown.map((item, idx) => (
              <div key={idx} className="p-3 rounded-lg bg-slate-900/60 border border-slate-800 text-xs space-y-1">
                <div className="flex justify-between font-semibold">
                  <span className="text-slate-300">{item.metric}</span>
                  <span className="text-brand-400 font-mono">{item.score}% (wt {item.weight}%)</span>
                </div>
                <div className="text-[11px] text-slate-400">{item.comment}</div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* 2. AUTOPILOT PROACTIVE ALERTS (If any) */}
      {state.autopilot.enabled && state.autopilot.alerts.length > 0 && (
        <div className="space-y-2">
          {state.autopilot.alerts.map((alert) => (
            <div
              key={alert.id}
              className={`p-4 rounded-xl border flex items-center justify-between gap-4 transition-all ${
                alert.severity === 'warning'
                  ? 'bg-amber-500/10 border-amber-500/30 text-amber-200'
                  : 'bg-blue-500/10 border-blue-500/30 text-blue-200'
              }`}
            >
              <div className="flex items-center gap-3">
                <AlertCircle className={`w-5 h-5 shrink-0 ${alert.severity === 'warning' ? 'text-amber-400' : 'text-blue-400'}`} />
                <div className="space-y-0.5">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold uppercase tracking-wider text-slate-300">Smart Alert:</span>
                    <h4 className="text-xs font-semibold text-white">{alert.title}</h4>
                  </div>
                  <p className="text-xs text-slate-300">{alert.message}</p>
                </div>
              </div>
              {alert.actionText && (
                <button
                  type="button"
                  onClick={() => {
                    if (alert.actionPayload === 'LOG_WATER') {
                      logWater(250);
                    } else if (alert.actionPayload === 'RECOMMENDATIONS') {
                      onNavigateTab('recommendations');
                    }
                  }}
                  className="px-3 py-1.5 rounded-lg text-xs font-bold bg-slate-850 hover:bg-slate-800 border border-slate-700 text-slate-200 shrink-0"
                >
                  {alert.actionText}
                </button>
              )}
            </div>
          ))}
        </div>
      )}

      {/* 3. YOUR NEXT BEST ACTION CARD */}
      {primaryRec && (
        <div className="p-6 rounded-2xl bg-slate-900 border-2 border-brand-500/40 shadow-xl space-y-5 relative">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-800">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-brand-500/20 text-brand-400 border border-brand-500/40 flex items-center justify-center font-bold">
                <Sparkles className="w-4 h-4" />
              </div>
              <div>
                <span className="text-[10px] font-extrabold uppercase tracking-widest text-brand-400">
                  Recommended Next Meal
                </span>
                <h2 className="text-lg font-bold text-white font-heading">
                  What to Eat Next
                </h2>
              </div>
            </div>

            <div className="flex items-center gap-2 text-xs">
              <span className="text-slate-400">Suitability:</span>
              <span className="font-bold text-brand-400 bg-brand-500/10 px-2 py-0.5 rounded border border-brand-500/20 font-mono">
                {primaryRec.suitabilityScore}/100
              </span>
              <ProvenanceBadge
                infoType="PREDICTED"
                source={primaryRec.sourceEngine}
                confidence={primaryRec.confidence}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
            {/* Left: Meal title & macros */}
            <div className="lg:col-span-7 space-y-3">
              <div className="space-y-1">
                <h3 className="text-xl font-bold text-white font-heading">{primaryRec.title}</h3>
                <p className="text-xs text-slate-400">{primaryRec.description}</p>
              </div>

              {/* Macro pills */}
              <div className="flex flex-wrap gap-2.5 text-xs">
                <div className="px-3 py-1.5 rounded-xl bg-slate-850 border border-slate-750 font-semibold text-slate-200">
                  🔥 ~{primaryRec.calories} kcal
                </div>
                <div className="px-3 py-1.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 font-bold text-emerald-300">
                  💪 ~{primaryRec.proteinG}g protein
                </div>
                <div className="px-3 py-1.5 rounded-xl bg-slate-850 border border-slate-750 text-slate-300">
                  🌾 ~{primaryRec.carbsG}g carbs
                </div>
                <div className="px-3 py-1.5 rounded-xl bg-slate-850 border border-slate-750 text-slate-300">
                  ⏱️ {primaryRec.prepTimeMinutes} min prep
                </div>
                <div className="px-3 py-1.5 rounded-xl bg-slate-850 border border-slate-750 text-amber-300 font-semibold">
                  ₹{primaryRec.estimatedCostInr} cost
                </div>
              </div>

              {/* Why reasons */}
              <div className="space-y-1.5 pt-1">
                <span className="text-[11px] uppercase tracking-wider font-bold text-slate-400">
                  Why this fits your day:
                </span>
                <ul className="space-y-1 text-xs text-slate-300">
                  {primaryRec.whyReasons.map((why, idx) => (
                    <li key={idx} className="flex items-start gap-2">
                      <span className="text-brand-400 mt-0.5">•</span>
                      <span>{why}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            {/* Right: Actions */}
            <div className="lg:col-span-5 flex flex-col gap-2.5 justify-center p-4 rounded-xl bg-slate-850/80 border border-slate-750">
              <button
                type="button"
                onClick={() => handleEatThis(primaryRec)}
                className="w-full py-3 px-4 rounded-xl bg-brand-500 hover:bg-brand-600 text-slate-950 font-bold text-sm transition-all shadow-md shadow-brand-500/20 active:scale-95 flex items-center justify-center gap-2"
              >
                <CheckCircle2 className="w-4 h-4 stroke-[2.5]" />
                <span>I Ate This</span>
              </button>

              <button
                type="button"
                onClick={() => onNavigateTab('recommendations')}
                className="w-full py-2.5 px-4 rounded-xl bg-slate-800 hover:bg-slate-750 text-slate-200 font-semibold text-xs transition-colors border border-slate-700 flex items-center justify-center gap-2"
              >
                <span>View Alternatives ({state.recommendations.length - 1} more)</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>

              {primaryRec.youtubeUrl && (
                <div className="flex flex-col sm:flex-row gap-2">
                  <a
                    href={primaryRec.youtubeUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex-1 py-2.5 px-3 rounded-xl bg-red-600/20 hover:bg-red-600/30 text-red-200 hover:text-white border border-red-500/40 font-bold text-xs transition-all flex items-center justify-center gap-2 group active:scale-95 shadow-sm"
                  >
                    <svg className="w-4 h-4 fill-red-500 group-hover:scale-110 transition-transform shrink-0" viewBox="0 0 24 24">
                      <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
                    </svg>
                    <span>Watch Best Recipe Video</span>
                    <ExternalLink className="w-3.5 h-3.5 text-red-400/80" />
                  </a>

                  <a
                    href={`https://www.youtube.com/results?search_query=${encodeURIComponent(YouTubeRecipeService.cleanRecipeTitle(primaryRec.title) + ' recipe tutorial')}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="py-2.5 px-3 rounded-xl bg-slate-800 hover:bg-slate-750 text-slate-300 hover:text-white border border-slate-700 font-semibold text-xs transition-all flex items-center justify-center gap-1.5 shrink-0"
                    title="Search all recipe tutorials on YouTube"
                  >
                    <span>All Chef Videos</span>
                    <ExternalLink className="w-3 h-3 text-slate-400" />
                  </a>
                </div>
              )}

              <button
                type="button"
                onClick={onOpenFoodModal}
                className="w-full py-2 px-4 rounded-xl text-slate-400 hover:text-slate-200 text-xs text-center transition-colors"
              >
                Already ate something else? Log custom food
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 4. MAIN METRICS GRID (NUTRITION, ACTIVITY, WORKOUT, RECOVERY) */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
        {/* CARD 1: NUTRITION STATE */}
        <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 shadow-md space-y-4 flex flex-col justify-between">
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Utensils className="w-4 h-4 text-brand-400" />
                <h3 className="text-sm font-bold text-slate-200">Today's Nutrition</h3>
              </div>
              <ProvenanceBadge infoType="CALCULATED" source="Aggregated Logs" confidence="high" />
            </div>

            <div className="pt-2 space-y-3">
              <MacroProgressBar
                label="Calories"
                consumed={nutrition.caloriesConsumed.value}
                target={energy.adjustedDailyCalorieTarget.value}
                unit="kcal"
                colorClass="text-amber-400"
                gradientClass="from-amber-500 to-orange-400"
              />

              <MacroProgressBar
                label="Protein"
                consumed={nutrition.proteinConsumed.value}
                target={state.goals.proteinTargetG}
                unit="g"
                colorClass="text-emerald-400"
                gradientClass="from-brand-500 to-emerald-400"
              />

              <MacroProgressBar
                label="Carbohydrates"
                consumed={nutrition.carbsConsumed.value}
                target={state.goals.carbsTargetG}
                unit="g"
                colorClass="text-blue-400"
                gradientClass="from-blue-500 to-cyan-400"
              />

              <MacroProgressBar
                label="Fats"
                consumed={nutrition.fatConsumed.value}
                target={state.goals.fatTargetG}
                unit="g"
                colorClass="text-purple-400"
                gradientClass="from-purple-500 to-indigo-400"
              />
            </div>
          </div>

          <div className="pt-3 border-t border-slate-800 flex items-center justify-between text-xs">
            <button
              type="button"
              onClick={() => setShowTransparencyModal(true)}
              className="text-brand-400 hover:text-brand-300 font-semibold flex items-center gap-1 text-[11px]"
            >
              <span>Why did target change?</span>
              <ArrowRight className="w-3 h-3" />
            </button>
            <button
              type="button"
              onClick={() => onNavigateTab('nutrition')}
              className="text-slate-400 hover:text-white text-[11px]"
            >
              View meal logs ({nutrition.loggedMeals.length})
            </button>
          </div>
        </div>

        {/* CARD 2: ACTIVITY CARD */}
        <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 shadow-md space-y-4 flex flex-col justify-between">
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Activity className="w-4 h-4 text-blue-400" />
                <h3 className="text-sm font-bold text-slate-200">Today's Activity</h3>
              </div>
              <ProvenanceBadge
                infoType="MEASURED"
                source={activity.steps.source}
                confidence="high"
              />
            </div>

            <div className="space-y-3 pt-1">
              <div>
                <div className="flex items-baseline justify-between">
                  <div>
                    <span className="text-2xl font-extrabold text-white font-heading">
                      {activity.steps.value.toLocaleString()}
                    </span>
                    <span className="text-xs text-slate-400 ml-1.5">/ {state.goals.dailyStepTarget.toLocaleString()} steps</span>
                  </div>
                  {isPhonePedometerActive && (
                    <span className="text-[10px] font-bold text-emerald-400 flex items-center gap-1 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
                      Phone Sensor Active
                    </span>
                  )}
                </div>
                <div className="h-1.5 w-full bg-slate-800 rounded-full mt-1.5 overflow-hidden">
                  <div
                    className="h-full bg-blue-500 rounded-full transition-all duration-300"
                    style={{ width: `${Math.min(100, (activity.steps.value / state.goals.dailyStepTarget) * 100)}%` }}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2 text-xs">
                <div className="p-2 rounded-xl bg-slate-850 border border-slate-800">
                  <span className="text-slate-400 block text-[11px]">Active Burn:</span>
                  <span className="text-sm font-bold text-amber-400 font-heading">
                    {activity.activeEnergyKcal.value} kcal
                  </span>
                  <span className="text-[10px] text-slate-500 block">Deduplicated net burn</span>
                </div>

                <div className="p-2 rounded-xl bg-slate-850 border border-slate-800">
                  <span className="text-slate-400 block text-[11px]">Distance:</span>
                  <span className="text-sm font-bold text-slate-200 font-heading">
                    {activity.distanceKm.value} km
                  </span>
                  <span className="text-[10px] text-slate-500 block">Real stride calculation</span>
                </div>
              </div>

              {/* Quick Step Buttons */}
              <div className="p-2 rounded-xl bg-slate-850/80 border border-slate-800 flex items-center justify-between text-xs">
                <span className="text-[11px] text-slate-400">Quick Walk Boost:</span>
                <div className="flex items-center gap-1">
                  <button
                    type="button"
                    onClick={() => addSteps(25)}
                    className="px-2 py-0.5 rounded bg-slate-700 hover:bg-slate-650 text-slate-200 text-[11px] font-semibold transition-colors"
                    title="Add 25 walking steps"
                  >
                    +25
                  </button>
                  <button
                    type="button"
                    onClick={() => addSteps(100)}
                    className="px-2 py-0.5 rounded bg-blue-500/20 hover:bg-blue-500/30 text-blue-300 text-[11px] font-bold border border-blue-500/30 transition-colors"
                    title="Add 100 walking steps"
                  >
                    +100
                  </button>
                  <button
                    type="button"
                    onClick={async () => {
                      if (isPhonePedometerActive) {
                        stopPhonePedometer();
                      } else {
                        await startPhonePedometer();
                      }
                    }}
                    className={`px-2 py-0.5 rounded text-[11px] font-bold transition-colors ${
                      isPhonePedometerActive
                        ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                        : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                    }`}
                    title="Toggle real phone accelerometer"
                  >
                    {isPhonePedometerActive ? 'Stop Sensor' : '📱 Phone Sensor'}
                  </button>
                </div>
              </div>
            </div>
          </div>

          <div className="pt-3 border-t border-slate-800 flex items-center justify-between text-xs text-slate-400">
            <span className="text-[11px] truncate max-w-[180px]">Source: {activity.steps.source}</span>
            <button
              type="button"
              onClick={() => onNavigateTab('activity')}
              className="text-brand-400 hover:text-brand-300 font-semibold text-[11px]"
            >
              Details →
            </button>
          </div>
        </div>

        {/* CARD 3: WORKOUT CARD */}
        <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 shadow-md space-y-4 flex flex-col justify-between">
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Dumbbell className="w-4 h-4 text-orange-400" />
                <h3 className="text-sm font-bold text-slate-200">Last Workout</h3>
              </div>
              <ProvenanceBadge infoType="ESTIMATED" source="Demo Wearable Session" confidence="medium" />
            </div>

            {activity.lastWorkoutSummary ? (
              <div className="space-y-2.5 pt-1">
                <div>
                  <h4 className="text-sm font-bold text-white">{activity.lastWorkoutSummary.title}</h4>
                  <span className="text-xs text-slate-400">{activity.lastWorkoutSummary.durationMinutes} min session • Moderate intensity</span>
                </div>

                <div className="grid grid-cols-3 gap-1.5 text-center text-xs">
                  <div className="p-2 rounded-xl bg-slate-850 border border-slate-800">
                    <span className="text-[10px] text-slate-400 block">Avg HR</span>
                    <span className="font-bold text-rose-400">{activity.lastWorkoutSummary.avgHeartRate.value} BPM</span>
                  </div>
                  <div className="p-2 rounded-xl bg-slate-850 border border-slate-800">
                    <span className="text-[10px] text-slate-400 block">Peak HR</span>
                    <span className="font-bold text-rose-500">{activity.lastWorkoutSummary.peakHeartRate.value} BPM</span>
                  </div>
                  <div className="p-2 rounded-xl bg-slate-850 border border-slate-800">
                    <span className="text-[10px] text-slate-400 block">Active Kcal</span>
                    <span className="font-bold text-amber-400">{activity.lastWorkoutSummary.activeKcal.value}</span>
                  </div>
                </div>

                <p className="text-[11px] text-slate-400 italic">
                  Workout incorporated into estimated energy state without double counting.
                </p>
              </div>
            ) : (
              <div className="text-xs text-slate-400 py-6 text-center">
                No workouts logged today.
              </div>
            )}
          </div>

          <div className="pt-3 border-t border-slate-800 flex items-center justify-between text-xs">
            <button
              type="button"
              onClick={() => onNavigateTab('workout')}
              className="text-brand-400 hover:text-brand-300 font-semibold text-[11px]"
            >
              Start Live Workout →
            </button>
            <span className="text-[11px] text-slate-500">4 sessions this week</span>
          </div>
        </div>

        {/* CARD 4: RECOVERY & SLEEP CARD */}
        <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 shadow-md space-y-4 flex flex-col justify-between">
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Moon className="w-4 h-4 text-indigo-400" />
                <h3 className="text-sm font-bold text-slate-200">Recovery & Sleep</h3>
              </div>
              <ProvenanceBadge infoType="MEASURED" source={state.connectedDevice.name} confidence="high" />
            </div>

            <div className="space-y-2.5 pt-1">
              <div className="flex items-baseline justify-between">
                <div>
                  <span className="text-2xl font-extrabold text-white font-heading">
                    7h 42m
                  </span>
                  <span className="text-xs text-slate-400 ml-1.5">last night</span>
                </div>
                <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                  {recovery.sleepConsistency} Consistency
                </span>
              </div>

              <div className="p-2.5 rounded-xl bg-slate-850 border border-slate-800 space-y-1.5 text-xs">
                <div className="flex justify-between">
                  <span className="text-slate-400">Recovery Context:</span>
                  <span className="font-bold text-brand-300">{recovery.recoveryContext} (Score: {recovery.recoveryScore.value}/100)</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">7-Day Sleep Average:</span>
                  <span className="font-semibold text-slate-200">{recovery.sevenDayAvgSleepHours}h</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Resting HR:</span>
                  <span className="font-semibold text-rose-400">{recovery.restingHeartRateBpm.value} BPM</span>
                </div>
              </div>

              <p className="text-[10px] text-slate-500 leading-tight">
                {recovery.disclaimer}
              </p>
            </div>
          </div>

          <div className="pt-3 border-t border-slate-800 flex items-center justify-between text-xs text-slate-400">
            <span className="text-[11px]">Hydration: {nutrition.waterConsumedMl.value} / {state.goals.waterTargetMl} ml</span>
            <button
              type="button"
              onClick={() => logWater(250)}
              className="text-blue-400 hover:text-blue-300 font-semibold text-[11px] flex items-center gap-1"
            >
              <Droplets className="w-3 h-3" />
              <span>+250ml</span>
            </button>
          </div>
        </div>
      </div>

      {/* 5. TODAY'S NUTRITION TRAJECTORY FORECAST */}
      <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 shadow-md flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-start gap-3.5">
          <div className="w-9 h-9 rounded-xl bg-purple-500/15 border border-purple-500/30 flex items-center justify-center text-purple-400 shrink-0">
            <Sparkles className="w-5 h-5" />
          </div>
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold uppercase tracking-wider text-purple-300">
                Today's Nutrition Forecast
              </span>
              <ProvenanceBadge infoType="PREDICTED" source="Forecast Model" confidence="medium" />
            </div>
            <p className="text-xs sm:text-sm text-slate-200 font-medium">
              {state.predictions.predictionStatement}
            </p>
            {state.predictions.reasons.length > 0 && (
              <p className="text-xs text-slate-400">
                {state.predictions.reasons[0]}
              </p>
            )}
          </div>
        </div>

        <button
          type="button"
          onClick={() => onNavigateTab('recommendations')}
          className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-750 border border-slate-700 text-xs font-bold text-brand-400 shrink-0 transition-colors"
        >
          View Recommended Meals →
        </button>
      </div>

      {/* Modals */}
      <TransparencyModal
        isOpen={showTransparencyModal}
        onClose={() => setShowTransparencyModal(false)}
      />

      <FeedbackModal
        recommendation={feedbackRec}
        isOpen={Boolean(feedbackRec)}
        onClose={() => setFeedbackRec(null)}
        onSubmit={(rating, reasons) => {
          if (feedbackRec) submitFeedback(feedbackRec.id, rating, reasons);
        }}
      />
    </div>
  );
};
