import React, { useState, useMemo } from 'react';
import { usePersonalState } from '../context/PersonalStateContext';
import { ProvenanceBadge } from '../components/ProvenanceBadge';
import { WorkoutType, WorkoutSession } from '../types';
import {
  WorkoutPlanningService,
  WorkoutPlanContext,
  PrescribedWorkoutDay
} from '../services/WorkoutPlanningService';
import confetti from 'canvas-confetti';
import {
  Flame,
  Heart,
  Timer,
  Footprints,
  Play,
  Pause,
  Square,
  CheckCircle2,
  Dumbbell,
  Sparkles,
  ArrowRight,
  TrendingUp,
  ShieldCheck,
  Zap,
  Info,
  Calendar,
  CheckSquare,
  Square as EmptySquare,
  ChevronRight,
  Award,
  Compass,
  AlertCircle,
  Watch,
  Activity,
  BarChart3,
  Sliders,
  RotateCcw
} from 'lucide-react';

interface LiveWorkoutViewProps {
  onNavigateToRecommendations: () => void;
  onOpenFoodModal: () => void;
  onNavigateToDevices?: () => void;
}

export const LiveWorkoutView: React.FC<LiveWorkoutViewProps> = ({
  onNavigateToRecommendations,
  onOpenFoodModal,
  onNavigateToDevices
}) => {
  const {
    state,
    startLiveWorkout,
    pauseLiveWorkout,
    resumeLiveWorkout,
    finishLiveWorkout,
    startPrescribedWorkout,
    prescribedExercises,
    togglePrescribedExercise,
    liveWorkoutTicker,
    isPhonePedometerActive
  } = usePersonalState();

  const [activeTab, setActiveTab] = useState<'live' | 'planner'>('live');
  const [selectedType, setSelectedType] = useState<WorkoutType>('strength');
  const [completedSummary, setCompletedSummary] = useState<WorkoutSession | null>(null);

  // AI Workout Planning Controls
  const [daysPerWeek, setDaysPerWeek] = useState<2 | 3 | 4 | 5 | 6>(4);
  const [equipmentChoice, setEquipmentChoice] = useState<'full_gym' | 'dumbbells_only' | 'bodyweight_only'>('full_gym');
  const [sessionDuration, setSessionDuration] = useState<30 | 45 | 60 | 75>(60);
  const [experienceLevel, setExperienceLevel] = useState<'beginner' | 'intermediate' | 'advanced'>('intermediate');
  const [selectedDayNumber, setSelectedDayNumber] = useState<number>(1);

  const isLive = Boolean(state.currentWorkout);
  const isPaused = state.currentWorkout?.status === 'paused';
  const isWatchConnected = state.connectedDevice?.connected && state.connectedDevice?.status === 'connected';

  // Generate scientific periodization plan from Kaggle & ACSM model
  const planContext: WorkoutPlanContext = useMemo(() => ({
    availableDaysPerWeek: daysPerWeek,
    equipment: equipmentChoice,
    sessionDurationMinutes: sessionDuration,
    experienceLevel,
    currentRecoveryScore: state.recovery?.recoveryScore?.value ?? 80
  }), [daysPerWeek, equipmentChoice, sessionDuration, experienceLevel, state.recovery?.recoveryScore?.value]);

  const generatedPlan = useMemo(() => {
    return WorkoutPlanningService.generatePlan(state.profile, state.goals, planContext);
  }, [state.profile, state.goals, planContext]);

  const activeDayRoutine = useMemo(() => {
    return generatedPlan.schedule.find((d) => d.dayNumber === selectedDayNumber) || generatedPlan.schedule[0];
  }, [generatedPlan, selectedDayNumber]);

  const formatTimer = (totalSeconds: number) => {
    const mins = Math.floor(totalSeconds / 60);
    const secs = totalSeconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const handleStartManual = () => {
    startLiveWorkout(selectedType);
    setActiveTab('live');
  };

  const handleStartDayRoutine = (day: PrescribedWorkoutDay) => {
    startPrescribedWorkout(day);
    setActiveTab('live');
  };

  const handleFinish = () => {
    const summary = finishLiveWorkout();
    setCompletedSummary(summary);

    // Fire celebratory confetti!
    try {
      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.6 }
      });
    } catch (e) {
      // fallback if canvas not available
    }
  };

  const completedExercisesCount = prescribedExercises.filter((e) => e.completed).length;

  return (
    <div className="space-y-6 pb-12 animate-fade-in">
      {/* Top Banner */}
      <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 shadow-xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs uppercase tracking-wider text-rose-400 font-bold">
              Workout Studio
            </span>
            <span className="text-slate-600">•</span>
            {isWatchConnected ? (
              <span className="text-xs text-emerald-400 font-medium flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                {state.connectedDevice.name} Connected
              </span>
            ) : (
              <span className="text-xs text-slate-400 font-medium">
                Smartwatch Sync Ready
              </span>
            )}
          </div>
          <h1 className="text-2xl font-extrabold text-white font-heading mt-1">
            Workout Studio & Training Planner
          </h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Track genuine smartwatch heart rate and steps during live training, or follow your personalized workout program.
          </p>
        </div>

        {/* Navigation Tabs */}
        <div className="flex items-center gap-2 p-1 rounded-xl bg-slate-850 border border-slate-750">
          <button
            type="button"
            onClick={() => setActiveTab('live')}
            className={`px-4 py-2 rounded-lg text-xs font-bold transition-all flex items-center gap-2 ${
              activeTab === 'live'
                ? 'bg-brand-500 text-slate-950 shadow-md'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Activity className="w-4 h-4" />
            <span>Live Session</span>
            {isLive && (
              <span className="w-2 h-2 rounded-full bg-rose-500 animate-ping inline-block" />
            )}
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('planner')}
            className={`px-4 py-2 rounded-lg text-xs font-bold transition-all flex items-center gap-2 ${
              activeTab === 'planner'
                ? 'bg-brand-500 text-slate-950 shadow-md'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Compass className="w-4 h-4" />
            <span>Training Plan</span>
            <span className="text-[10px] px-1.5 py-0.2 rounded bg-brand-400/20 text-brand-300 font-medium">
              Personalized
            </span>
          </button>
        </div>
      </div>

      {/* SENSOR STATUS TELEMETRY ALERT */}
      <div
        className={`p-4 rounded-2xl border flex items-center justify-between gap-3 text-xs ${
          isWatchConnected
            ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300'
            : 'bg-amber-500/10 border-amber-500/30 text-amber-300'
        }`}
      >
        <div className="flex items-center gap-3">
          <div
            className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${
              isWatchConnected
                ? 'bg-emerald-500/20 text-emerald-400'
                : 'bg-amber-500/20 text-amber-400'
            }`}
          >
            <Watch className="w-5 h-5" />
          </div>
          <div>
            <div className="font-bold text-white text-xs sm:text-sm">
              {isWatchConnected
                ? `✓ Smartwatch Connected: ${state.connectedDevice.name}`
                : 'Smartwatch Not Connected'}
            </div>
            <div className="text-[11px] text-slate-400 mt-0.5">
              {isWatchConnected
                ? 'Live active calories and heart rate stream directly from your wearable sensors.'
                : 'Connect your smartwatch via Bluetooth to track genuine heart rate and active calories.'}
            </div>
          </div>
        </div>

        {!isWatchConnected && onNavigateToDevices && (
          <button
            type="button"
            onClick={onNavigateToDevices}
            className="px-3 py-1.5 rounded-lg bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/40 text-xs font-bold transition-colors shrink-0"
          >
            Connect Watch →
          </button>
        )}
      </div>

      {/* TAB 1: LIVE WORKOUT TRACKER */}
      {activeTab === 'live' && (
        <div className="space-y-6">
          {/* WORKOUT TYPE SELECTION IF NOT LIVE & NO COMPLETED SUMMARY */}
          {!isLive && !completedSummary && (
            <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 shadow-md space-y-5">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-bold text-white font-heading">
                    Quick Start Workout
                  </h3>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Or choose a workout from your personalized Training Plan tab.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setActiveTab('planner')}
                  className="text-xs text-brand-400 hover:text-brand-300 font-semibold flex items-center gap-1"
                >
                  <span>View Training Plan</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
                {[
                  { type: 'strength' as WorkoutType, label: 'Strength Training', icon: Dumbbell, desc: 'Hypertrophy & weights' },
                  { type: 'running' as WorkoutType, label: 'Running', icon: Zap, desc: 'Pace, cadence, distance' },
                  { type: 'cycling' as WorkoutType, label: 'Cycling', icon: TrendingUp, desc: 'Speed & active burn' },
                  { type: 'walking' as WorkoutType, label: 'Walking', icon: Footprints, desc: 'Pedometer & steps' },
                  { type: 'hiit' as WorkoutType, label: 'HIIT', icon: Flame, desc: 'High intensity intervals' }
                ].map((item) => {
                  const Icon = item.icon;
                  const isSelected = selectedType === item.type;
                  return (
                    <button
                      key={item.type}
                      type="button"
                      onClick={() => setSelectedType(item.type)}
                      className={`p-4 rounded-xl border text-left flex flex-col justify-between gap-3 transition-all ${
                        isSelected
                          ? 'bg-brand-500/15 border-brand-500 text-white shadow-md'
                          : 'bg-slate-850/80 border-slate-750 text-slate-300 hover:bg-slate-850'
                      }`}
                    >
                      <Icon className={`w-5 h-5 ${isSelected ? 'text-brand-400' : 'text-slate-400'}`} />
                      <div>
                        <div className="text-xs font-bold">{item.label}</div>
                        <div className="text-[10px] text-slate-400 mt-0.5">{item.desc}</div>
                      </div>
                    </button>
                  );
                })}
              </div>

              <div className="flex justify-center pt-2">
                <button
                  type="button"
                  onClick={handleStartManual}
                  className="py-3.5 px-8 rounded-2xl bg-gradient-to-r from-brand-500 to-emerald-400 hover:from-brand-600 hover:to-emerald-500 text-slate-950 font-extrabold text-sm transition-all shadow-xl shadow-brand-500/25 active:scale-95 flex items-center gap-2"
                >
                  <Play className="w-5 h-5 fill-slate-950" />
                  <span>Start Freeform {selectedType.toUpperCase()} Workout</span>
                </button>
              </div>
            </div>
          )}

          {/* LIVE TELEMETRY DISPLAY */}
          {isLive && (
            <div className="p-8 rounded-3xl bg-slate-900 border-2 border-rose-500/30 shadow-2xl space-y-8 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-80 h-80 bg-rose-500/10 rounded-full blur-3xl pointer-events-none" />

              {/* Top Workout Status & Controls */}
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-slate-800 pb-5">
                <div>
                  <span className="text-xs uppercase tracking-widest text-slate-400 font-bold">
                    {state.currentWorkout?.title}
                  </span>
                  <div className="text-4xl sm:text-5xl font-extrabold text-white font-mono mt-1 tracking-tight">
                    {formatTimer(liveWorkoutTicker.durationSec)}
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  {isPaused ? (
                    <button
                      type="button"
                      onClick={resumeLiveWorkout}
                      className="px-5 py-2.5 rounded-xl bg-brand-500 hover:bg-brand-600 text-slate-950 font-bold text-xs flex items-center gap-2 transition-all shadow-md"
                    >
                      <Play className="w-4 h-4 fill-slate-950" />
                      <span>Resume</span>
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={pauseLiveWorkout}
                      className="px-5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-750 text-slate-200 border border-slate-700 font-semibold text-xs flex items-center gap-2 transition-all"
                    >
                      <Pause className="w-4 h-4" />
                      <span>Pause</span>
                    </button>
                  )}

                  <button
                    type="button"
                    onClick={handleFinish}
                    className="px-5 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs flex items-center gap-2 transition-all shadow-lg shadow-rose-600/30 active:scale-95"
                  >
                    <Square className="w-4 h-4 fill-white" />
                    <span>Finish Workout</span>
                  </button>
                </div>
              </div>

              {/* Live Genuine Telemetry Gauges */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
                {/* Live HR */}
                <div className="p-6 rounded-2xl bg-slate-850/90 border border-slate-750 flex items-center justify-between">
                  <div>
                    <span className="text-xs text-slate-400 font-medium">Heart Rate (Watch)</span>
                    <div className="flex items-baseline gap-2 mt-1">
                      <span className="text-4xl font-extrabold text-rose-400 font-heading">
                        {liveWorkoutTicker.currentHr > 0 ? liveWorkoutTicker.currentHr : '--'}
                      </span>
                      <span className="text-xs text-slate-400">BPM</span>
                    </div>
                    <span className="text-[11px] text-slate-400 mt-1 block font-semibold">
                      {isWatchConnected
                        ? liveWorkoutTicker.currentHr > 140
                          ? 'Zone 3/4: High Aerobic'
                          : 'Zone 2: Cardiovascular Base'
                        : 'Wearable Not Streaming'}
                    </span>
                  </div>
                  <div className="w-14 h-14 rounded-2xl bg-rose-500/15 border border-rose-500/30 flex items-center justify-center text-rose-500">
                    <Heart className={`w-8 h-8 fill-rose-500 ${isWatchConnected ? 'animate-pulse' : 'opacity-40'}`} />
                  </div>
                </div>

                {/* Live Active Burn */}
                <div className="p-6 rounded-2xl bg-slate-850/90 border border-slate-750 flex items-center justify-between">
                  <div>
                    <span className="text-xs text-slate-400 font-medium">Genuine Active Burn</span>
                    <div className="flex items-baseline gap-2 mt-1">
                      <span className="text-4xl font-extrabold text-amber-400 font-heading">
                        {Math.round(liveWorkoutTicker.activeKcal)}
                      </span>
                      <span className="text-xs text-slate-400">active kcal</span>
                    </div>
                    <span className="text-[11px] text-slate-400 mt-1 block">
                      {isWatchConnected ? 'Physiological Keytel calculation' : '0 kcal (Watch disconnected)'}
                    </span>
                  </div>
                  <div className="w-14 h-14 rounded-2xl bg-amber-500/15 border border-amber-500/30 flex items-center justify-center text-amber-500">
                    <Flame className={`w-8 h-8 fill-amber-500 ${isWatchConnected ? 'animate-bounce' : 'opacity-40'}`} />
                  </div>
                </div>

                {/* Live Steps */}
                <div className="p-6 rounded-2xl bg-slate-850/90 border border-slate-750 flex items-center justify-between">
                  <div>
                    <span className="text-xs text-slate-400 font-medium">Genuine Steps</span>
                    <div className="flex items-baseline gap-2 mt-1">
                      <span className="text-4xl font-extrabold text-teal-400 font-heading">
                        {liveWorkoutTicker.steps}
                      </span>
                      <span className="text-xs text-slate-400">steps</span>
                    </div>
                    <span className="text-[11px] text-slate-400 mt-1 block">
                      {isWatchConnected || isPhonePedometerActive
                        ? 'Motion sensor / BLE pedometer'
                        : '0 steps (No sensor motion)'}
                    </span>
                  </div>
                  <div className="w-14 h-14 rounded-2xl bg-teal-500/15 border border-teal-500/30 flex items-center justify-center text-teal-500">
                    <Footprints className="w-8 h-8" />
                  </div>
                </div>
              </div>

              {/* PRESCRIBED EXERCISE EXECUTION CHECKLIST */}
              {prescribedExercises && prescribedExercises.length > 0 && (
                <div className="p-6 rounded-2xl bg-slate-850/80 border border-slate-750 space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="text-sm font-bold text-white font-heading">
                        Prescribed Exercise Routine Checklist
                      </h4>
                      <p className="text-xs text-slate-400 mt-0.5">
                        Track your completed sets and follow scientific tempo cues.
                      </p>
                    </div>
                    <span className="text-xs font-bold text-brand-400 bg-brand-500/10 px-3 py-1 rounded-full border border-brand-500/20">
                      {completedExercisesCount} of {prescribedExercises.length} Done
                    </span>
                  </div>

                  {/* Progress bar */}
                  <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
                    <div
                      className="bg-brand-500 h-full transition-all duration-300"
                      style={{
                        width: `${(completedExercisesCount / prescribedExercises.length) * 100}%`
                      }}
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-2">
                    {prescribedExercises.map((ex) => (
                      <div
                        key={ex.exerciseId}
                        onClick={() => togglePrescribedExercise(ex.exerciseId)}
                        className={`p-3.5 rounded-xl border flex items-start gap-3 cursor-pointer transition-all ${
                          ex.completed
                            ? 'bg-emerald-500/10 border-emerald-500/40 text-slate-300'
                            : 'bg-slate-900 border-slate-800 text-white hover:border-slate-700'
                        }`}
                      >
                        <div className="mt-0.5 text-brand-400">
                          {ex.completed ? (
                            <CheckSquare className="w-5 h-5 text-emerald-400" />
                          ) : (
                            <EmptySquare className="w-5 h-5 text-slate-500" />
                          )}
                        </div>

                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between gap-2">
                            <span className={`text-xs font-bold ${ex.completed ? 'line-through text-slate-400' : 'text-white'}`}>
                              {ex.name}
                            </span>
                            <span className="text-[10px] uppercase font-mono px-2 py-0.5 rounded bg-slate-800 text-slate-300">
                              {ex.sets} sets × {ex.reps}
                            </span>
                          </div>

                          <div className="text-[11px] text-slate-400 mt-1 flex items-center gap-2">
                            <span>Muscle: <strong>{ex.targetMuscle}</strong></span>
                            <span>•</span>
                            <span>RPE {ex.recommendedRpe}</span>
                            <span>•</span>
                            <span>Rest {ex.restSeconds}s</span>
                          </div>

                          <div className="text-[10px] text-slate-400 mt-1 italic">
                            💡 Cue: {ex.techniqueCue}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* COMPLETED WORKOUT RECOVERY SUMMARY */}
          {completedSummary && (
            <div className="p-8 rounded-3xl bg-slate-900 border-2 border-emerald-500/30 shadow-2xl space-y-6 animate-fade-in">
              <div className="flex items-center justify-between border-b border-slate-800 pb-5">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-2xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center">
                    <CheckCircle2 className="w-7 h-7" />
                  </div>
                  <div>
                    <span className="text-xs uppercase tracking-widest text-emerald-400 font-bold">
                      Workout Logged & Synchronized
                    </span>
                    <h2 className="text-xl font-extrabold text-white font-heading mt-0.5">
                      {completedSummary.title}
                    </h2>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => setCompletedSummary(null)}
                  className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-750 text-slate-200 text-xs font-bold transition-all"
                >
                  Start Another
                </button>
              </div>

              {/* Exact Metrics Recorded */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs">
                <div className="p-4 rounded-xl bg-slate-850 border border-slate-800">
                  <span className="text-slate-400 block text-[11px]">Duration</span>
                  <span className="text-2xl font-extrabold text-white font-heading mt-1 block">
                    {completedSummary.durationMinutes} min
                  </span>
                </div>

                <div className="p-4 rounded-xl bg-slate-850 border border-slate-800">
                  <span className="text-slate-400 block text-[11px]">Active Calories</span>
                  <span className="text-2xl font-extrabold text-amber-400 font-heading mt-1 block">
                    {completedSummary.activeKcal.value} kcal
                  </span>
                  <span className="text-[10px] text-slate-400">Genuine sensor recorded</span>
                </div>

                <div className="p-4 rounded-xl bg-slate-850 border border-slate-800">
                  <span className="text-slate-400 block text-[11px]">Steps Taken</span>
                  <span className="text-2xl font-extrabold text-teal-400 font-heading mt-1 block">
                    {completedSummary.stepsCount}
                  </span>
                </div>

                <div className="p-4 rounded-xl bg-slate-850 border border-slate-800">
                  <span className="text-slate-400 block text-[11px]">Average Heart Rate</span>
                  <span className="text-2xl font-extrabold text-rose-400 font-heading mt-1 block">
                    {completedSummary.avgHeartRate.value > 0 ? `${completedSummary.avgHeartRate.value} BPM` : 'N/A'}
                  </span>
                </div>
              </div>

              {/* Immediate Post-Workout Recovery Suggestion */}
              <div className="p-5 rounded-2xl bg-brand-500/10 border border-brand-500/30 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-brand-400" />
                    <span className="text-xs uppercase font-bold text-brand-300">
                      NutriPilot Recovery Recommendation
                    </span>
                  </div>
                  <p className="text-xs text-slate-200">
                    High muscle protein synthesis window active. Recommended post-workout refuel: <strong>25-30g protein</strong> (e.g. 4 boiled eggs or 150g paneer wrap) and <strong>500ml water</strong>.
                  </p>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <button
                    type="button"
                    onClick={onOpenFoodModal}
                    className="px-4 py-2 rounded-xl bg-brand-500 hover:bg-brand-600 text-slate-950 font-bold text-xs transition-all shadow-md"
                  >
                    Log Post-Workout Meal
                  </button>
                  <button
                    type="button"
                    onClick={onNavigateToRecommendations}
                    className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-750 text-slate-200 text-xs font-bold transition-all border border-slate-700"
                  >
                    View Food Ideas
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* TAB 2: AI WORKOUT PLANNER (KAGGLE / ACSM PERIODIZATION MODEL) */}
      {activeTab === 'planner' && (
        <div className="space-y-6 animate-fade-in">
          {/* SITUATION TO DESIRED RESULT MAPPING */}
          <div className="p-6 rounded-2xl bg-gradient-to-r from-slate-900 via-slate-850 to-slate-900 border-2 border-brand-500/40 shadow-xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-brand-500/20 text-brand-400 flex items-center justify-center">
                  <Compass className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-white font-heading">
                    Your Personalized Training Progression
                  </h3>
                  <p className="text-[11px] text-slate-400">
                    A customized workout split tailored to your body metrics, recovery state, and target weight.
                  </p>
                </div>
              </div>

              <span className="text-xs font-bold text-brand-400 bg-brand-500/10 px-3 py-1 rounded-full border border-brand-500/20">
                {generatedPlan.splitType}
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
              {/* Current Situation */}
              <div className="p-4 rounded-xl bg-slate-800/80 border border-slate-750 space-y-1.5">
                <span className="text-[11px] uppercase tracking-wider text-slate-400 font-bold block">
                  Current Situation
                </span>
                <div className="text-sm font-bold text-white">
                  {state.profile.weightKg} kg • {state.profile.heightCm} cm • {state.profile.age} yrs
                </div>
                <p className="text-[11px] text-slate-400">
                  {generatedPlan.currentSituationSummary}
                </p>
              </div>

              {/* Goal & Desired Result */}
              <div className="p-4 rounded-xl bg-slate-800/80 border border-slate-750 space-y-1.5">
                <span className="text-[11px] uppercase tracking-wider text-amber-400 font-bold block">
                  Desired Result
                </span>
                <div className="text-sm font-bold text-amber-300">
                  {state.goals.targetWeightKg} kg Target ({state.goals.primaryGoal.replace('_', ' ')})
                </div>
                <p className="text-[11px] text-slate-400">
                  {generatedPlan.desiredResultSummary}
                </p>
              </div>

              {/* Projected Progression Timeline */}
              <div className="p-4 rounded-xl bg-slate-800/80 border border-slate-750 space-y-1.5">
                <span className="text-[11px] uppercase tracking-wider text-emerald-400 font-bold block">
                  Projected Timeline
                </span>
                <div className="text-sm font-bold text-emerald-300">
                  ~{generatedPlan.projectedWeeksToGoal} Weeks to Target
                </div>
                <p className="text-[11px] text-slate-400">
                  Progressive overload cycle with autopilot fatigue deload regulation.
                </p>
              </div>
            </div>
          </div>

          {/* PLAN CUSTOMIZER CONTROLS */}
          <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 shadow-md space-y-4">
            <div className="flex items-center gap-2 pb-2 border-b border-slate-800">
              <Sliders className="w-4 h-4 text-brand-400" />
              <h3 className="text-sm font-bold text-white font-heading">
                Customize Workout Availability & Equipment
              </h3>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {/* Training Days */}
              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1">
                  Days Per Week
                </label>
                <select
                  value={daysPerWeek}
                  onChange={(e) => setDaysPerWeek(Number(e.target.value) as any)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-850 border border-slate-750 text-white text-xs focus:outline-none focus:border-brand-500"
                >
                  <option value={3}>3 Days (Full Body Split)</option>
                  <option value={4}>4 Days (Upper / Lower Split)</option>
                  <option value={5}>5 Days (Push Pull Legs Upper Lower)</option>
                  <option value={6}>6 Days (Push Pull Legs ×2)</option>
                </select>
              </div>

              {/* Available Equipment */}
              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1">
                  Equipment Available
                </label>
                <select
                  value={equipmentChoice}
                  onChange={(e) => setEquipmentChoice(e.target.value as any)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-850 border border-slate-750 text-white text-xs focus:outline-none focus:border-brand-500"
                >
                  <option value="full_gym">Full Commercial Gym (Barbells, Cables, Machines)</option>
                  <option value="dumbbells_only">Dumbbells & Adjustable Bench Only</option>
                  <option value="bodyweight_only">Bodyweight / Calisthenics Only</option>
                </select>
              </div>

              {/* Duration */}
              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1">
                  Session Duration
                </label>
                <select
                  value={sessionDuration}
                  onChange={(e) => setSessionDuration(Number(e.target.value) as any)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-850 border border-slate-750 text-white text-xs focus:outline-none focus:border-brand-500"
                >
                  <option value={30}>30 Minutes (High Density)</option>
                  <option value={45}>45 Minutes (Optimized)</option>
                  <option value={60}>60 Minutes (Standard)</option>
                  <option value={75}>75 Minutes (Comprehensive)</option>
                </select>
              </div>

              {/* Experience Level */}
              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1">
                  Experience Level
                </label>
                <select
                  value={experienceLevel}
                  onChange={(e) => setExperienceLevel(e.target.value as any)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-850 border border-slate-750 text-white text-xs focus:outline-none focus:border-brand-500"
                >
                  <option value="beginner">Beginner (1-2 yrs lifter)</option>
                  <option value="intermediate">Intermediate (2-4 yrs)</option>
                  <option value="advanced">Advanced (4+ yrs)</option>
                </select>
              </div>
            </div>
          </div>

          {/* WEEKLY VOLUME THRESHOLDS BREAKDOWN */}
          <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 shadow-md space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <BarChart3 className="w-4 h-4 text-emerald-400" />
                <h3 className="text-sm font-bold text-white font-heading">
                  Weekly Muscle Group Volume Distribution (ACSM Hypertrophy Range: 10-18 Sets)
                </h3>
              </div>
              <span className="text-xs text-slate-400">Optimized for lean growth</span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-3">
              {generatedPlan.weeklyVolumeBreakdown.map((vol) => (
                <div key={vol.muscleGroup} className="p-3 rounded-xl bg-slate-850 border border-slate-750 text-center">
                  <span className="text-[11px] text-slate-400 block font-medium">
                    {vol.muscleGroup}
                  </span>
                  <div className="text-xl font-extrabold text-white font-heading mt-0.5">
                    {vol.weeklySets}
                  </div>
                  <span className="text-[10px] text-emerald-400 block mt-0.5">sets / wk</span>
                </div>
              ))}
            </div>
          </div>

          {/* DAY-BY-DAY ROUTINE PREVIEW & LAUNCH */}
          <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 shadow-md space-y-5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-800">
              <div>
                <h3 className="text-sm font-bold text-white font-heading">
                  Day-by-Day Prescribed Routines ({generatedPlan.schedule.length} Days)
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  Select a day to inspect exercises and launch live with real smartwatch tracking.
                </p>
              </div>

              {/* Day Selector Buttons */}
              <div className="flex flex-wrap gap-2">
                {generatedPlan.schedule.map((day) => {
                  const isDaySelected = day.dayNumber === selectedDayNumber;
                  return (
                    <button
                      key={day.dayNumber}
                      type="button"
                      onClick={() => setSelectedDayNumber(day.dayNumber)}
                      className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                        isDaySelected
                          ? 'bg-brand-500 text-slate-950 shadow-md'
                          : 'bg-slate-850 text-slate-400 hover:text-white border border-slate-750'
                      }`}
                    >
                      {day.dayName.split(' ')[0]} {day.dayNumber}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Selected Day Routine Card */}
            <div className="p-6 rounded-2xl bg-slate-850 border border-slate-750 space-y-5">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <span className="text-xs uppercase font-mono font-bold text-brand-400">
                    {activeDayRoutine.dayName}
                  </span>
                  <h4 className="text-xl font-extrabold text-white font-heading mt-0.5">
                    {activeDayRoutine.focus}
                  </h4>
                  <div className="text-xs text-slate-400 mt-1 flex items-center gap-2">
                    <span>Duration: ~{activeDayRoutine.estimatedDurationMin} min</span>
                    <span>•</span>
                    <span>Target: {activeDayRoutine.targetMuscles.join(', ')}</span>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => handleStartDayRoutine(activeDayRoutine)}
                  className="py-3 px-6 rounded-xl bg-gradient-to-r from-brand-500 to-emerald-400 hover:from-brand-600 hover:to-emerald-500 text-slate-950 font-bold text-xs transition-all shadow-lg shadow-brand-500/25 active:scale-95 flex items-center gap-2 shrink-0"
                >
                  <Play className="w-4 h-4 fill-slate-950" />
                  <span>Start This Workout Today</span>
                </button>
              </div>

              {/* Prescribed Exercises List */}
              <div className="space-y-3">
                <span className="text-xs font-bold text-slate-300 block uppercase tracking-wider">
                  Prescribed Movements ({activeDayRoutine.exercises.length} Exercises)
                </span>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {activeDayRoutine.exercises.map((ex, idx) => (
                    <div
                      key={ex.exerciseId + idx}
                      className="p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-2 hover:border-slate-700 transition-colors"
                    >
                      <div className="flex items-start justify-between gap-2">
                        <span className="text-xs font-bold text-white font-heading">
                          {idx + 1}. {ex.name}
                        </span>
                        <span className="text-[10px] uppercase font-mono px-2 py-0.5 rounded bg-brand-500/10 text-brand-300 border border-brand-500/20 shrink-0">
                          {ex.sets} sets × {ex.reps}
                        </span>
                      </div>

                      <div className="grid grid-cols-3 gap-2 text-[10px] text-slate-400 pt-1 border-t border-slate-800">
                        <div>
                          <span className="block text-slate-500">Target Muscle:</span>
                          <span className="font-semibold text-slate-300">{ex.targetMuscle}</span>
                        </div>
                        <div>
                          <span className="block text-slate-500">Effort (RPE):</span>
                          <span className="font-semibold text-amber-400">RPE {ex.recommendedRpe}</span>
                        </div>
                        <div>
                          <span className="block text-slate-500">Rest Interval:</span>
                          <span className="font-semibold text-sky-400">{ex.restSeconds} sec</span>
                        </div>
                      </div>

                      <div className="text-[11px] text-slate-400 pt-1 leading-snug">
                        💡 <strong>Technique Cue:</strong> {ex.techniqueCue}
                      </div>
                    </div>
                  ))}
                </div>

                {/* Optional Cardio Finisher */}
                {activeDayRoutine.cardioFinisher && (
                  <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/25 flex items-center justify-between gap-3 text-xs">
                    <div className="flex items-center gap-3">
                      <Flame className="w-5 h-5 text-rose-400 shrink-0" />
                      <div>
                        <div className="font-bold text-white">
                          Cardio Conditioning Finisher: {activeDayRoutine.cardioFinisher.name} ({activeDayRoutine.cardioFinisher.durationMin} min)
                        </div>
                        <div className="text-[11px] text-slate-300 mt-0.5">
                          {activeDayRoutine.cardioFinisher.protocol} • Target: {activeDayRoutine.cardioFinisher.targetZone}
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
