import React, { useState } from 'react';
import { usePersonalState } from '../context/PersonalStateContext';
import { FeedbackModal } from '../components/FeedbackModal';
import {
  Activity,
  Flame,
  Moon,
  Sparkles,
  ArrowRight,
  CheckCircle2,
  Clock,
  ChevronRight,
  Droplets,
  Heart,
  Dumbbell,
  Utensils,
  Plus,
  ExternalLink,
  Calendar,
  Check,
  Footprints,
  Compass,
  AlertCircle
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
    addSteps
  } = usePersonalState();

  const [feedbackRec, setFeedbackRec] = useState<Recommendation | null>(null);

  const primaryRec = state.activeRecommendation || state.recommendations[0];
  const nutrition = state.nutrition;
  const activity = state.activity;
  const energy = state.energyModel;
  const recovery = state.recovery;

  // Calorie & Macro calculations
  const calTarget = energy.adjustedDailyCalorieTarget.value || state.goals.baselineCalorieTarget || 2000;
  const calConsumed = nutrition.caloriesConsumed.value || 0;
  const calRemaining = Math.max(0, calTarget - calConsumed);
  const calPct = Math.min(100, Math.round((calConsumed / calTarget) * 100));

  const proTarget = state.goals.proteinTargetG || 130;
  const proConsumed = nutrition.proteinConsumed.value || 0;
  const proRemaining = Math.max(0, proTarget - proConsumed);
  const proPct = Math.min(100, Math.round((proConsumed / proTarget) * 100));

  const carbTarget = state.goals.carbsTargetG || 220;
  const carbConsumed = nutrition.carbsConsumed.value || 0;
  const carbPct = Math.min(100, Math.round((carbConsumed / carbTarget) * 100));

  const fatTarget = state.goals.fatTargetG || 60;
  const fatConsumed = nutrition.fatConsumed.value || 0;
  const fatPct = Math.min(100, Math.round((fatConsumed / fatTarget) * 100));

  const waterTarget = state.goals.waterTargetMl || 2500;
  const waterConsumed = nutrition.waterConsumedMl.value || 0;
  const waterPct = Math.min(100, Math.round((waterConsumed / waterTarget) * 100));

  const stepTarget = state.goals.dailyStepTarget || 10000;
  const stepCount = activity.steps.value || 0;
  const stepPct = Math.min(100, Math.round((stepCount / stepTarget) * 100));

  const isWatchConnected = state.connectedDevice?.connected;
  const todayDateStr = new Date().toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'short',
    day: 'numeric'
  });

  // Group logged meals
  const breakfastMeals = nutrition.loggedMeals.filter((m) => m.mealType === 'breakfast');
  const lunchMeals = nutrition.loggedMeals.filter((m) => m.mealType === 'lunch');
  const dinnerMeals = nutrition.loggedMeals.filter((m) => m.mealType === 'dinner');
  const snackMeals = nutrition.loggedMeals.filter((m) => m.mealType === 'snack');

  const handleEatThis = (rec: Recommendation) => {
    acceptRecommendation(rec);
    setFeedbackRec(rec);
  };

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 18) return 'Good afternoon';
    return 'Good evening';
  };
  const userName = state.profile.name ? state.profile.name.split(' ')[0] : 'there';
  const goalLabel = state.goals.primaryGoal ? state.goals.primaryGoal.replace('_', ' ') : 'fitness';

  return (
    <div className="space-y-6 pb-12 animate-fade-in">
      {/* 1. WELCOME HEADER & QUICK ACTIONS */}
      <div className="p-6 sm:p-7 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-5">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
              {todayDateStr}
            </span>
            {isWatchConnected && (
              <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20 flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse" />
                {state.connectedDevice.name} Connected
              </span>
            )}
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white font-heading tracking-tight">
            {getGreeting()}, {userName} 👋
          </h1>
          <p className="text-sm text-slate-600 dark:text-slate-300 max-w-xl">
            {calRemaining > 0
              ? `You have ${calRemaining.toLocaleString()} kcal and ${proRemaining}g protein left for today's goal.`
              : `You've achieved your daily calorie target! Keep hydrated and rest well tonight.`}
          </p>
        </div>

        {/* Quick Actions */}
        <div className="flex flex-wrap items-center gap-2.5 w-full md:w-auto">
          <button
            type="button"
            onClick={onOpenFoodModal}
            className="flex-1 md:flex-none px-4 py-2.5 rounded-xl bg-brand-500 hover:bg-brand-600 text-slate-950 font-bold text-xs flex items-center justify-center gap-1.5 transition-all shadow-md shadow-brand-500/20 active:scale-95"
          >
            <Plus className="w-4 h-4 stroke-[2.5]" />
            <span>Log Food</span>
          </button>

          <button
            type="button"
            onClick={() => logWater(250)}
            className="flex-1 md:flex-none px-3.5 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-750 text-blue-600 dark:text-blue-300 font-semibold text-xs flex items-center justify-center gap-1.5 transition-colors border border-slate-200 dark:border-slate-700"
            title="Add a glass of water (250 ml)"
          >
            <Droplets className="w-4 h-4 text-blue-500" />
            <span>+250ml Water</span>
          </button>

          <button
            type="button"
            onClick={() => onNavigateTab('workout')}
            className="flex-1 md:flex-none px-3.5 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-750 text-slate-700 dark:text-slate-200 font-semibold text-xs flex items-center justify-center gap-1.5 transition-colors border border-slate-200 dark:border-slate-700"
          >
            <Flame className="w-4 h-4 text-orange-500" />
            <span>Workout</span>
          </button>
        </div>
      </div>

      {/* 2. TODAY'S CALORIES & MACRO PROGRESS (THE MAIN HEALTH CARD) */}
      <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-6">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
          <div>
            <h2 className="text-base font-bold text-slate-900 dark:text-white font-heading">
              Daily Nutrition Progress
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Tracked against your personalized {goalLabel} target
            </p>
          </div>
          <button
            type="button"
            onClick={() => onNavigateTab('nutrition')}
            className="text-xs font-semibold text-brand-600 dark:text-brand-400 hover:underline flex items-center gap-1"
          >
            <span>Detailed Breakdown</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
          {/* Left: Calorie Big Number & Progress */}
          <div className="lg:col-span-4 p-5 rounded-2xl bg-slate-50 dark:bg-slate-850 border border-slate-200 dark:border-slate-800 flex flex-col justify-between space-y-4">
            <div>
              <span className="text-xs uppercase font-bold tracking-wider text-slate-500 dark:text-slate-400 block">
                Remaining Today
              </span>
              <div className="flex items-baseline gap-2 mt-1">
                <span className="text-4xl font-extrabold text-slate-900 dark:text-white font-heading">
                  {calRemaining.toLocaleString()}
                </span>
                <span className="text-sm font-semibold text-slate-500 dark:text-slate-400">kcal</span>
              </div>
            </div>

            <div className="space-y-2">
              <div className="w-full bg-slate-200 dark:bg-slate-700 h-2.5 rounded-full overflow-hidden">
                <div
                  className="bg-brand-500 h-full rounded-full transition-all duration-500"
                  style={{ width: `${calPct}%` }}
                />
              </div>

              <div className="flex justify-between text-xs text-slate-500 dark:text-slate-400">
                <span>Eaten: <strong className="text-slate-800 dark:text-slate-200">{calConsumed.toLocaleString()}</strong></span>
                <span>Target: <strong className="text-slate-800 dark:text-slate-200">{calTarget.toLocaleString()}</strong></span>
              </div>
            </div>

            <div className="pt-2 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
              <span className="flex items-center gap-1">
                <Flame className="w-3.5 h-3.5 text-amber-500" />
                Active Burn: <strong className="text-slate-700 dark:text-slate-300">{activity.activeEnergyKcal.value} kcal</strong>
              </span>
            </div>
          </div>

          {/* Right: Macro Gauges (Protein, Carbs, Fats) */}
          <div className="lg:col-span-8 space-y-4">
            {/* Protein Bar */}
            <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-850 border border-slate-200 dark:border-slate-800 space-y-2">
              <div className="flex justify-between items-center text-xs">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
                  <span className="font-bold text-slate-800 dark:text-slate-200">Protein</span>
                </div>
                <span className="font-semibold text-slate-600 dark:text-slate-300">
                  <strong className="text-emerald-600 dark:text-emerald-400">{proConsumed}g</strong> / {proTarget}g ({proPct}%)
                </span>
              </div>
              <div className="w-full bg-slate-200 dark:bg-slate-700 h-2 rounded-full overflow-hidden">
                <div
                  className="bg-emerald-500 h-full rounded-full transition-all duration-500"
                  style={{ width: `${proPct}%` }}
                />
              </div>
              <div className="flex justify-between text-[11px] text-slate-500 dark:text-slate-400">
                <span>{proRemaining > 0 ? `${proRemaining}g remaining to hit goal` : 'Goal achieved!'}</span>
                <span>Target: 1.6g per kg</span>
              </div>
            </div>

            {/* Carbs & Fat Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {/* Carbs */}
              <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-850 border border-slate-200 dark:border-slate-800 space-y-1.5">
                <div className="flex justify-between items-center text-xs">
                  <div className="flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-blue-500" />
                    <span className="font-bold text-slate-800 dark:text-slate-200">Carbs</span>
                  </div>
                  <span className="font-semibold text-slate-600 dark:text-slate-300 text-xs">
                    {carbConsumed}g / {carbTarget}g
                  </span>
                </div>
                <div className="w-full bg-slate-200 dark:bg-slate-700 h-1.5 rounded-full overflow-hidden">
                  <div className="bg-blue-500 h-full rounded-full" style={{ width: `${carbPct}%` }} />
                </div>
              </div>

              {/* Fats */}
              <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-850 border border-slate-200 dark:border-slate-800 space-y-1.5">
                <div className="flex justify-between items-center text-xs">
                  <div className="flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-purple-500" />
                    <span className="font-bold text-slate-800 dark:text-slate-200">Fats</span>
                  </div>
                  <span className="font-semibold text-slate-600 dark:text-slate-300 text-xs">
                    {fatConsumed}g / {fatTarget}g
                  </span>
                </div>
                <div className="w-full bg-slate-200 dark:bg-slate-700 h-1.5 rounded-full overflow-hidden">
                  <div className="bg-purple-500 h-full rounded-full" style={{ width: `${fatPct}%` }} />
                </div>
              </div>
            </div>

            {/* Hydration Bar */}
            <div className="p-3.5 rounded-xl bg-blue-50/60 dark:bg-slate-850 border border-blue-200/60 dark:border-slate-800 flex items-center justify-between gap-3 text-xs">
              <div className="flex items-center gap-2">
                <Droplets className="w-4 h-4 text-blue-500 shrink-0" />
                <span className="text-slate-700 dark:text-slate-300 font-medium">
                  Water: <strong className="text-blue-600 dark:text-blue-400">{waterConsumed} ml</strong> / {waterTarget} ml ({waterPct}%)
                </span>
              </div>
              <button
                type="button"
                onClick={() => logWater(250)}
                className="px-2.5 py-1 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-sm transition-all active:scale-95"
              >
                + Drink Glass
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* 3. RECOMMENDED MEAL (WHAT TO EAT NEXT) */}
      {primaryRec && (
        <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border-2 border-brand-500/40 shadow-sm space-y-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100 dark:border-slate-800">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-brand-500/15 text-brand-600 dark:text-brand-400 flex items-center justify-center font-bold">
                <Utensils className="w-4 h-4" />
              </div>
              <div>
                <span className="text-[11px] font-bold uppercase tracking-wider text-brand-600 dark:text-brand-400">
                  Recommended For You
                </span>
                <h2 className="text-lg font-bold text-slate-900 dark:text-white font-heading">
                  What to Eat Next
                </h2>
              </div>
            </div>

            <span className="text-xs font-semibold px-3 py-1 rounded-full bg-brand-500/10 text-brand-600 dark:text-brand-400 border border-brand-500/20 w-fit">
              {primaryRec.suitabilityScore}% Match for your goals
            </span>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
            {/* Left: Meal title & macros */}
            <div className="lg:col-span-7 space-y-3">
              <div>
                <h3 className="text-xl font-bold text-slate-900 dark:text-white font-heading">
                  {primaryRec.title}
                </h3>
                <p className="text-xs text-slate-600 dark:text-slate-400 mt-0.5">
                  {primaryRec.description}
                </p>
              </div>

              {/* Macro pills */}
              <div className="flex flex-wrap gap-2 text-xs">
                <div className="px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-850 border border-slate-200 dark:border-slate-800 font-semibold text-slate-700 dark:text-slate-200">
                  🔥 ~{primaryRec.calories} kcal
                </div>
                <div className="px-3 py-1.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 font-bold text-emerald-600 dark:text-emerald-300">
                  💪 ~{primaryRec.proteinG}g protein
                </div>
                <div className="px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-850 border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-300">
                  🌾 ~{primaryRec.carbsG}g carbs
                </div>
                <div className="px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-850 border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-300 flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5 text-slate-400" />
                  <span>{primaryRec.prepTimeMinutes} min prep</span>
                </div>
                <div className="px-3 py-1.5 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-700 dark:text-amber-300 font-semibold">
                  ₹{primaryRec.estimatedCostInr} cost
                </div>
              </div>

              {/* Why it fits */}
              {primaryRec.whyReasons && primaryRec.whyReasons.length > 0 && (
                <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-850 border border-slate-200 dark:border-slate-800 text-xs text-slate-600 dark:text-slate-300 space-y-1">
                  <span className="font-bold text-slate-800 dark:text-slate-200 block text-[11px]">
                    Why this is a great choice:
                  </span>
                  <p>{primaryRec.whyReasons[0]}</p>
                </div>
              )}
            </div>

            {/* Right: Actions */}
            <div className="lg:col-span-5 flex flex-col gap-2.5 justify-center p-4 rounded-xl bg-slate-50 dark:bg-slate-850 border border-slate-200 dark:border-slate-800">
              <button
                type="button"
                onClick={() => handleEatThis(primaryRec)}
                className="w-full py-3 px-4 rounded-xl bg-brand-500 hover:bg-brand-600 text-slate-950 font-bold text-sm transition-all shadow-md shadow-brand-500/20 active:scale-95 flex items-center justify-center gap-2"
              >
                <CheckCircle2 className="w-4 h-4 stroke-[2.5]" />
                <span>I Ate This (Log to Today)</span>
              </button>

              {primaryRec.youtubeUrl && (
                <a
                  href={primaryRec.youtubeUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full py-2.5 px-3 rounded-xl bg-red-600 hover:bg-red-700 text-white font-bold text-xs transition-all flex items-center justify-center gap-2 shadow-sm active:scale-95"
                >
                  <svg className="w-4 h-4 fill-white shrink-0" viewBox="0 0 24 24">
                    <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
                  </svg>
                  <span>Watch Recipe Video</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
              )}

              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => onNavigateTab('recommendations')}
                  className="flex-1 py-2 px-3 rounded-xl bg-white dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-750 text-slate-700 dark:text-slate-300 font-semibold text-xs transition-colors border border-slate-200 dark:border-slate-700 text-center"
                >
                  Other Options ({state.recommendations.length - 1})
                </button>
                <button
                  type="button"
                  onClick={onOpenFoodModal}
                  className="flex-1 py-2 px-3 rounded-xl bg-white dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-750 text-slate-700 dark:text-slate-300 font-semibold text-xs transition-colors border border-slate-200 dark:border-slate-700 text-center"
                >
                  Custom Meal
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 4. TODAY'S ACTIVITY, WORKOUT & SLEEP (3 CONSUMER-FRIENDLY CARDS) */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {/* CARD 1: STEPS & WALKING */}
        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4 flex flex-col justify-between">
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-blue-500/10 text-blue-500 flex items-center justify-center">
                  <Footprints className="w-4 h-4" />
                </div>
                <h3 className="text-sm font-bold text-slate-900 dark:text-white">Daily Steps</h3>
              </div>
              <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">
                Goal: {stepTarget.toLocaleString()}
              </span>
            </div>

            <div>
              <div className="flex items-baseline gap-1.5">
                <span className="text-3xl font-extrabold text-slate-900 dark:text-white font-heading">
                  {stepCount.toLocaleString()}
                </span>
                <span className="text-xs text-slate-500 dark:text-slate-400">steps</span>
              </div>

              <div className="w-full bg-slate-200 dark:bg-slate-700 h-2 rounded-full overflow-hidden mt-2">
                <div
                  className="bg-blue-500 h-full rounded-full transition-all duration-300"
                  style={{ width: `${stepPct}%` }}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2 text-xs">
              <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-850 border border-slate-200 dark:border-slate-800">
                <span className="text-slate-500 dark:text-slate-400 text-[11px] block">Distance</span>
                <span className="font-bold text-slate-800 dark:text-slate-200 text-sm">
                  {activity.distanceKm.value} km
                </span>
              </div>
              <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-850 border border-slate-200 dark:border-slate-800">
                <span className="text-slate-500 dark:text-slate-400 text-[11px] block">Active Burn</span>
                <span className="font-bold text-amber-600 dark:text-amber-400 text-sm">
                  {activity.activeEnergyKcal.value} kcal
                </span>
              </div>
            </div>
          </div>

          <button
            type="button"
            onClick={() => onNavigateTab('activity')}
            className="w-full py-2 text-xs font-semibold text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-slate-800 rounded-lg transition-colors text-center"
          >
            View Activity History →
          </button>
        </div>

        {/* CARD 2: WORKOUT SESSION */}
        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4 flex flex-col justify-between">
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-orange-500/10 text-orange-500 flex items-center justify-center">
                  <Dumbbell className="w-4 h-4" />
                </div>
                <h3 className="text-sm font-bold text-slate-900 dark:text-white">Workout Session</h3>
              </div>
              <span className="text-xs font-semibold text-orange-600 dark:text-orange-400">
                {activity.lastWorkoutSummary ? 'Completed' : 'Today'}
              </span>
            </div>

            {activity.lastWorkoutSummary ? (
              <div className="space-y-2">
                <h4 className="text-base font-bold text-slate-900 dark:text-white">
                  {activity.lastWorkoutSummary.title}
                </h4>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  {activity.lastWorkoutSummary.durationMinutes} min session • Moderate intensity
                </p>

                <div className="grid grid-cols-2 gap-2 text-xs pt-1">
                  <div className="p-2 rounded-xl bg-slate-50 dark:bg-slate-850 border border-slate-200 dark:border-slate-800">
                    <span className="text-[10px] text-slate-500 dark:text-slate-400 block">Avg Heart Rate</span>
                    <span className="font-bold text-rose-500">{activity.lastWorkoutSummary.avgHeartRate.value} BPM</span>
                  </div>
                  <div className="p-2 rounded-xl bg-slate-50 dark:bg-slate-850 border border-slate-200 dark:border-slate-800">
                    <span className="text-[10px] text-slate-500 dark:text-slate-400 block">Active Burn</span>
                    <span className="font-bold text-amber-500">{activity.lastWorkoutSummary.activeKcal.value} kcal</span>
                  </div>
                </div>
              </div>
            ) : (
              <div className="py-4 text-center space-y-1">
                <p className="text-xs text-slate-500 dark:text-slate-400">No workout logged yet today.</p>
                <p className="text-[11px] text-slate-400 dark:text-slate-500">Ready to start today's training?</p>
              </div>
            )}
          </div>

          <button
            type="button"
            onClick={() => onNavigateTab('workout')}
            className="w-full py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-750 text-slate-800 dark:text-slate-200 font-bold text-xs transition-colors flex items-center justify-center gap-1.5"
          >
            <Flame className="w-3.5 h-3.5 text-orange-500" />
            <span>{activity.lastWorkoutSummary ? 'Start Another Workout' : 'Start Today\'s Workout'}</span>
          </button>
        </div>

        {/* CARD 3: SLEEP & RECOVERY */}
        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4 flex flex-col justify-between">
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-indigo-500/10 text-indigo-500 flex items-center justify-center">
                  <Moon className="w-4 h-4" />
                </div>
                <h3 className="text-sm font-bold text-slate-900 dark:text-white">Sleep & Recovery</h3>
              </div>
              <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
                {recovery.recoveryScore.value}/100 Score
              </span>
            </div>

            <div>
              <div className="flex items-baseline gap-1.5">
                <span className="text-3xl font-extrabold text-slate-900 dark:text-white font-heading">
                  7h 42m
                </span>
                <span className="text-xs text-slate-500 dark:text-slate-400">last night</span>
              </div>
              <span className="text-xs text-emerald-600 dark:text-emerald-400 font-medium mt-0.5 block">
                ✓ Good consistency • Well recovered
              </span>
            </div>

            <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-850 border border-slate-200 dark:border-slate-800 space-y-1.5 text-xs">
              <div className="flex justify-between">
                <span className="text-slate-500 dark:text-slate-400">Resting Heart Rate:</span>
                <span className="font-semibold text-rose-500 flex items-center gap-1">
                  <Heart className="w-3 h-3 fill-rose-500" />
                  {recovery.restingHeartRateBpm.value} BPM
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500 dark:text-slate-400">7-Day Average:</span>
                <span className="font-semibold text-slate-700 dark:text-slate-300">{recovery.sevenDayAvgSleepHours}h per night</span>
              </div>
            </div>
          </div>

          <div className="text-[11px] text-slate-500 dark:text-slate-400 text-center">
            {recovery.recoveryContext}: Optimal condition for today's targets
          </div>
        </div>
      </div>

      {/* 5. TODAY'S MEALS LOGGED (CONSUMER MEAL TIMELINE) */}
      <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
          <div>
            <h2 className="text-base font-bold text-slate-900 dark:text-white font-heading">
              Today's Meals
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              {nutrition.loggedMeals.length} {nutrition.loggedMeals.length === 1 ? 'item' : 'items'} logged today
            </p>
          </div>
          <button
            type="button"
            onClick={onOpenFoodModal}
            className="px-3 py-1.5 rounded-lg bg-brand-500 hover:bg-brand-600 text-slate-950 font-bold text-xs flex items-center gap-1 shadow-sm transition-all"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add Meal</span>
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Breakfast */}
          <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-850 border border-slate-200 dark:border-slate-800 space-y-2 flex flex-col justify-between">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
                  <span>🌅</span> Breakfast
                </span>
                <span className="text-xs text-slate-500">
                  {breakfastMeals.reduce((acc, m) => acc + m.calories.value, 0)} kcal
                </span>
              </div>

              {breakfastMeals.length > 0 ? (
                <div className="space-y-1.5">
                  {breakfastMeals.map((m) => (
                    <div key={m.id} className="text-xs flex justify-between text-slate-700 dark:text-slate-300">
                      <span className="truncate max-w-[140px]">{m.name}</span>
                      <span className="font-semibold text-slate-900 dark:text-white shrink-0">{m.calories.value} kcal</span>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-xs text-slate-400 dark:text-slate-500 italic py-2">
                  No breakfast logged
                </p>
              )}
            </div>

            <button
              type="button"
              onClick={onOpenFoodModal}
              className="text-xs text-brand-600 dark:text-brand-400 font-semibold hover:underline text-left pt-2 border-t border-slate-200 dark:border-slate-800"
            >
              + Log Breakfast
            </button>
          </div>

          {/* Lunch */}
          <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-850 border border-slate-200 dark:border-slate-800 space-y-2 flex flex-col justify-between">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
                  <span>☀️</span> Lunch
                </span>
                <span className="text-xs text-slate-500">
                  {lunchMeals.reduce((acc, m) => acc + m.calories.value, 0)} kcal
                </span>
              </div>

              {lunchMeals.length > 0 ? (
                <div className="space-y-1.5">
                  {lunchMeals.map((m) => (
                    <div key={m.id} className="text-xs flex justify-between text-slate-700 dark:text-slate-300">
                      <span className="truncate max-w-[140px]">{m.name}</span>
                      <span className="font-semibold text-slate-900 dark:text-white shrink-0">{m.calories.value} kcal</span>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-xs text-slate-400 dark:text-slate-500 italic py-2">
                  No lunch logged
                </p>
              )}
            </div>

            <button
              type="button"
              onClick={onOpenFoodModal}
              className="text-xs text-brand-600 dark:text-brand-400 font-semibold hover:underline text-left pt-2 border-t border-slate-200 dark:border-slate-800"
            >
              + Log Lunch
            </button>
          </div>

          {/* Dinner */}
          <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-850 border border-slate-200 dark:border-slate-800 space-y-2 flex flex-col justify-between">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
                  <span>🌙</span> Dinner
                </span>
                <span className="text-xs text-slate-500">
                  {dinnerMeals.reduce((acc, m) => acc + m.calories.value, 0)} kcal
                </span>
              </div>

              {dinnerMeals.length > 0 ? (
                <div className="space-y-1.5">
                  {dinnerMeals.map((m) => (
                    <div key={m.id} className="text-xs flex justify-between text-slate-700 dark:text-slate-300">
                      <span className="truncate max-w-[140px]">{m.name}</span>
                      <span className="font-semibold text-slate-900 dark:text-white shrink-0">{m.calories.value} kcal</span>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-xs text-slate-400 dark:text-slate-500 italic py-2">
                  Ready for dinner recommendation!
                </p>
              )}
            </div>

            <button
              type="button"
              onClick={onOpenFoodModal}
              className="text-xs text-brand-600 dark:text-brand-400 font-semibold hover:underline text-left pt-2 border-t border-slate-200 dark:border-slate-800"
            >
              + Log Dinner
            </button>
          </div>

          {/* Snacks */}
          <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-850 border border-slate-200 dark:border-slate-800 space-y-2 flex flex-col justify-between">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
                  <span>🍎</span> Snacks
                </span>
                <span className="text-xs text-slate-500">
                  {snackMeals.reduce((acc, m) => acc + m.calories.value, 0)} kcal
                </span>
              </div>

              {snackMeals.length > 0 ? (
                <div className="space-y-1.5">
                  {snackMeals.map((m) => (
                    <div key={m.id} className="text-xs flex justify-between text-slate-700 dark:text-slate-300">
                      <span className="truncate max-w-[140px]">{m.name}</span>
                      <span className="font-semibold text-slate-900 dark:text-white shrink-0">{m.calories.value} kcal</span>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-xs text-slate-400 dark:text-slate-500 italic py-2">
                  No snacks logged
                </p>
              )}
            </div>

            <button
              type="button"
              onClick={onOpenFoodModal}
              className="text-xs text-brand-600 dark:text-brand-400 font-semibold hover:underline text-left pt-2 border-t border-slate-200 dark:border-slate-800"
            >
              + Log Snack
            </button>
          </div>
        </div>
      </div>

      {/* 6. DAILY NUTRITION TIP / INSIGHT (FRIENDLY BANNER) */}
      <div className="p-5 rounded-2xl bg-purple-50/70 dark:bg-slate-900 border border-purple-200/80 dark:border-slate-800 shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-start gap-3.5">
          <div className="w-9 h-9 rounded-xl bg-purple-500/15 flex items-center justify-center text-purple-600 dark:text-purple-400 shrink-0">
            <Sparkles className="w-5 h-5" />
          </div>
          <div className="space-y-0.5">
            <span className="text-xs font-bold text-purple-700 dark:text-purple-300 block">
              Daily Nutrition Tip
            </span>
            <p className="text-xs sm:text-sm text-slate-800 dark:text-slate-200 font-medium">
              {state.predictions.predictionStatement || 'Your calorie pacing and protein intake are in good balance today.'}
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={() => onNavigateTab('recommendations')}
          className="px-4 py-2 rounded-xl bg-white dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-750 border border-purple-200 dark:border-slate-700 text-xs font-bold text-purple-700 dark:text-brand-400 shrink-0 transition-colors shadow-sm"
        >
          View Recommended Meals →
        </button>
      </div>

      {/* Feedback Modal */}
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
