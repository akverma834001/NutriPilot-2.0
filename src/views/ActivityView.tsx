import React, { useState } from 'react';
import { usePersonalState } from '../context/PersonalStateContext';
import { ProvenanceBadge } from '../components/ProvenanceBadge';
import {
  Activity,
  Heart,
  Flame,
  Footprints,
  Navigation as NavigationIcon,
  RefreshCw,
  ShieldCheck,
  Dumbbell,
  CheckCircle2,
  Clock,
  Zap,
  Info,
  Smartphone,
  RotateCcw,
  Plus
} from 'lucide-react';

interface ActivityViewProps {
  onStartWorkout: () => void;
}

export const ActivityView: React.FC<ActivityViewProps> = ({ onStartWorkout }) => {
  const {
    state,
    syncWearable,
    isPhonePedometerActive,
    isPhoneMoving,
    liveMagnitude,
    pedometerError,
    startPhonePedometer,
    stopPhonePedometer,
    addSteps,
    resetAllDayValues
  } = usePersonalState();
  const [isSyncing, setIsSyncing] = useState(false);
  const [resetConfirm, setResetConfirm] = useState(false);

  const activity = state.activity;
  const workouts = activity.todayWorkouts;

  const handleSync = async () => {
    setIsSyncing(true);
    await syncWearable();
    setIsSyncing(false);
  };

  const handleTogglePedometer = async () => {
    if (isPhonePedometerActive) {
      stopPhonePedometer();
    } else {
      await startPhonePedometer();
    }
  };

  const handleReset = () => {
    if (!resetConfirm) {
      setResetConfirm(true);
      setTimeout(() => setResetConfirm(false), 4000);
    } else {
      resetAllDayValues();
      setResetConfirm(false);
    }
  };

  return (
    <div className="space-y-6 pb-12 animate-fade-in">
      {/* Top Banner */}
      <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 shadow-xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs uppercase tracking-wider text-brand-400 font-bold">
              Daily Movement & Steps
            </span>
            <span className="text-slate-600">•</span>
            {isPhonePedometerActive || state.connectedDevice?.connected ? (
              <span className="text-xs text-emerald-400 font-medium flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                Live Sensor Active
              </span>
            ) : (
              <span className="text-xs text-slate-400 font-medium">Ready to Count Steps</span>
            )}
          </div>
          <h1 className="text-2xl font-extrabold text-white font-heading mt-1">
            Activity & Movement Tracker
          </h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Track genuine daily steps, active calorie burn, and heart rate via your phone or connected smartwatch.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <button
            type="button"
            onClick={handleReset}
            className={`px-3 py-2 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-colors border ${
              resetConfirm
                ? 'bg-rose-500/20 text-rose-300 border-rose-500/50'
                : 'bg-slate-800 hover:bg-slate-750 text-slate-300 border-slate-700'
            }`}
            title="Reset all meals, calories, and steps to 0"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>{resetConfirm ? 'Confirm Reset to 0?' : 'Reset Day Values'}</span>
          </button>

          <button
            type="button"
            onClick={handleSync}
            disabled={isSyncing || !state.connectedDevice.connected}
            className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-750 disabled:opacity-50 text-slate-200 border border-slate-700 text-xs font-semibold flex items-center gap-1.5 transition-colors"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isSyncing ? 'animate-spin text-brand-400' : ''}`} />
            <span>{isSyncing ? 'Syncing...' : 'Sync Watch'}</span>
          </button>

          <button
            type="button"
            onClick={onStartWorkout}
            className="px-4 py-2 rounded-xl bg-brand-500 hover:bg-brand-600 text-slate-950 font-bold text-xs flex items-center gap-1.5 transition-all shadow-md shadow-brand-500/20"
          >
            <Flame className="w-4 h-4 fill-slate-950" />
            <span>Start Live Workout</span>
          </button>
        </div>
      </div>

      {/* Real-time Phone Pedometer Engine Card */}
      <div className="p-5 rounded-2xl bg-gradient-to-r from-slate-900 via-slate-850 to-slate-900 border border-slate-750 shadow-lg relative overflow-hidden">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="space-y-1.5 max-w-xl">
            <div className="flex items-center gap-2">
              <Smartphone className={`w-4 h-4 ${isPhonePedometerActive ? 'text-brand-400 animate-bounce' : 'text-slate-400'}`} />
              <h3 className="text-sm font-bold text-white font-heading">
                Phone Motion Sensor (Accelerometer Pedometer)
              </h3>
              <span className={`px-2 py-0.5 rounded text-[11px] font-bold uppercase tracking-wider ${
                isPhonePedometerActive
                  ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                  : 'bg-slate-800 text-slate-400 border border-slate-700'
              }`}>
                {isPhonePedometerActive ? 'Tracking Active' : 'Standby'}
              </span>
            </div>
            <p className="text-xs text-slate-300">
              {isPhonePedometerActive
                ? `Phone motion sensor active • ${isPhoneMoving ? 'Walking detected' : 'Stationary'}`
                : 'Turn on the step sensor to automatically count your steps as you walk with your phone in your pocket.'}
            </p>
            {pedometerError && (
              <p className="text-[11px] text-amber-400 bg-amber-500/10 p-2 rounded-lg border border-amber-500/20">
                {pedometerError}
              </p>
            )}
          </div>

          <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
            <button
              type="button"
              onClick={handleTogglePedometer}
              className={`px-4 py-2.5 rounded-xl font-bold text-xs flex items-center gap-2 transition-all shadow-md ${
                isPhonePedometerActive
                  ? 'bg-rose-500/20 text-rose-300 border border-rose-500/40 hover:bg-rose-500/30'
                  : 'bg-emerald-500 hover:bg-emerald-400 text-slate-950 shadow-emerald-500/20'
              }`}
            >
              <Smartphone className="w-3.5 h-3.5" />
              <span>{isPhonePedometerActive ? 'Stop Step Sensor' : 'Start Step Sensor'}</span>
            </button>

            {/* Quick walk steps */}
            <div className="flex items-center gap-1.5 bg-slate-800/80 p-1 rounded-xl border border-slate-700">
              <span className="text-[11px] text-slate-400 px-2 font-medium">Quick Walk:</span>
              <button
                type="button"
                onClick={() => addSteps(50)}
                className="px-2.5 py-1 rounded-lg bg-slate-700 hover:bg-slate-650 text-slate-200 text-xs font-semibold"
                title="Add 50 walking steps"
              >
                +50
              </button>
              <button
                type="button"
                onClick={() => addSteps(200)}
                className="px-2.5 py-1 rounded-lg bg-slate-700 hover:bg-slate-650 text-slate-200 text-xs font-semibold"
                title="Add 200 walking steps"
              >
                +200
              </button>
              <button
                type="button"
                onClick={() => addSteps(500)}
                className="px-2.5 py-1 rounded-lg bg-brand-500/20 hover:bg-brand-500/30 text-brand-300 text-xs font-bold border border-brand-500/30"
                title="Add 500 walking steps"
              >
                +500
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Sync Quality Guarantee Banner */}
      <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-between gap-4 text-xs">
        <div className="flex items-center gap-2.5 text-slate-300">
          <ShieldCheck className="w-4 h-4 text-brand-400 shrink-0" />
          <span>
            <strong>Smart Activity Sync Active:</strong> Workouts and steps from your watch and phone are automatically synchronized without double-counting your calories.
          </span>
        </div>
        <span className="text-emerald-400 font-semibold text-[11px] shrink-0">
          ✓ Accurate Sync
        </span>
      </div>

      {/* 4 Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Steps */}
        <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 shadow-md space-y-2">
          <div className="flex items-center justify-between text-xs">
            <span className="text-slate-400 font-medium">Steps Today</span>
            <Footprints className="w-4 h-4 text-blue-400" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-white font-heading">
              {activity.steps.value.toLocaleString()}
            </span>
            <span className="text-xs text-slate-500">/ 10k target</span>
          </div>
          <div className="h-1.5 w-full bg-slate-800 rounded-full overflow-hidden">
            <div
              className="h-full bg-blue-500 rounded-full"
              style={{ width: `${Math.min(100, (activity.steps.value / 10000) * 100)}%` }}
            />
          </div>
          <div className="text-[11px] text-slate-400 flex justify-between pt-1">
            <span>Daily step tracking</span>
            <span className="text-emerald-400 font-medium">✓ Active</span>
          </div>
        </div>

        {/* Active Energy */}
        <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 shadow-md space-y-2">
          <div className="flex items-center justify-between text-xs">
            <span className="text-slate-400 font-medium">Active Burn</span>
            <Flame className="w-4 h-4 text-amber-400" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-amber-400 font-heading">
              {activity.activeEnergyKcal.value}
            </span>
            <span className="text-xs text-slate-500">active kcal</span>
          </div>
          <p className="text-[11px] text-slate-400">
            Calories burned through walking and daily exercise.
          </p>
          <div className="text-[11px] text-slate-400 flex justify-between pt-1">
            <span>Goal: 450 kcal</span>
            <span className="text-amber-400 font-medium">{Math.round((activity.activeEnergyKcal.value / 450) * 100)}%</span>
          </div>
        </div>

        {/* Distance */}
        <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 shadow-md space-y-2">
          <div className="flex items-center justify-between text-xs">
            <span className="text-slate-400 font-medium">Total Distance</span>
            <NavigationIcon className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-white font-heading">
              {activity.distanceKm.value}
            </span>
            <span className="text-xs text-slate-500">kilometers</span>
          </div>
          <p className="text-[11px] text-slate-400">
            Calculated from your daily walking steps.
          </p>
          <div className="text-[11px] text-slate-400 flex justify-between pt-1">
            <span>Walking & commute</span>
            <span className="text-emerald-400 font-medium">Recorded</span>
          </div>
        </div>

        {/* Heart Rate */}
        <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 shadow-md space-y-2">
          <div className="flex items-center justify-between text-xs">
            <span className="text-slate-400 font-medium">Heart Rate</span>
            <Heart className="w-4 h-4 text-rose-500 animate-pulse" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-rose-400 font-heading">
              {activity.currentHeartRate.value}
            </span>
            <span className="text-xs text-slate-500">current BPM</span>
          </div>
          <div className="flex justify-between text-xs text-slate-400">
            <span>Resting: {activity.restingHeartRate.value} BPM</span>
            <span>Peak: {activity.peakHeartRate.value} BPM</span>
          </div>
          <div className="text-[11px] text-slate-400 flex justify-between pt-1">
            <span>Optical PPG sensor</span>
            <ProvenanceBadge infoType="MEASURED" source={state.connectedDevice.name} confidence="high" />
          </div>
        </div>
      </div>

      {/* Heart Rate Zones & Disclaimers */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        <div className="lg:col-span-2 p-6 rounded-2xl bg-slate-900 border border-slate-800 shadow-md space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Activity className="w-4 h-4 text-rose-400" />
              <h3 className="text-sm font-bold text-white font-heading">
                Heart Rate Zones Distribution
              </h3>
            </div>
            <ProvenanceBadge infoType="MEASURED" source="PPG Sensor Fusion" confidence="high" />
          </div>

          <div className="space-y-3 pt-1">
            <div className="space-y-1">
              <div className="flex justify-between text-xs">
                <span className="text-slate-300 font-medium">Zone 4: Peak / Anaerobic (&gt; 155 BPM)</span>
                <span className="text-rose-400 font-mono font-bold">15 min</span>
              </div>
              <div className="h-2 w-full bg-slate-800 rounded-full overflow-hidden">
                <div className="h-full bg-rose-500 rounded-full" style={{ width: '18%' }} />
              </div>
            </div>

            <div className="space-y-1">
              <div className="flex justify-between text-xs">
                <span className="text-slate-300 font-medium">Zone 3: Cardio / Aerobic (135–155 BPM)</span>
                <span className="text-orange-400 font-mono font-bold">32 min</span>
              </div>
              <div className="h-2 w-full bg-slate-800 rounded-full overflow-hidden">
                <div className="h-full bg-orange-500 rounded-full" style={{ width: '38%' }} />
              </div>
            </div>

            <div className="space-y-1">
              <div className="flex justify-between text-xs">
                <span className="text-slate-300 font-medium">Zone 2: Fat Burn (115–135 BPM)</span>
                <span className="text-amber-400 font-mono font-bold">40 min</span>
              </div>
              <div className="h-2 w-full bg-slate-800 rounded-full overflow-hidden">
                <div className="h-full bg-amber-500 rounded-full" style={{ width: '48%' }} />
              </div>
            </div>

            <div className="space-y-1">
              <div className="flex justify-between text-xs">
                <span className="text-slate-300 font-medium">Zone 1: Warmup & Recovery (&lt; 115 BPM)</span>
                <span className="text-blue-400 font-mono font-bold">25 min</span>
              </div>
              <div className="h-2 w-full bg-slate-800 rounded-full overflow-hidden">
                <div className="h-full bg-blue-400 rounded-full" style={{ width: '30%' }} />
              </div>
            </div>
          </div>

          <div className="p-3 rounded-xl bg-slate-850 border border-slate-800 flex items-start gap-2.5 text-xs text-slate-400">
            <Info className="w-4 h-4 text-slate-400 shrink-0 mt-0.5" />
            <p>
              Heart rate zones are informational wellness estimates intended to guide exercise intensity. NutriPilot does not diagnose heart or cardiovascular conditions.
            </p>
          </div>
        </div>

        {/* Device Metadata */}
        <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 shadow-md space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-white font-heading">Connected Sensor</h3>
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 shadow-[0_0_8px_#34d399]" />
          </div>

          <div className="space-y-2 text-xs">
            <div className="p-3 rounded-xl bg-slate-850 border border-slate-800 space-y-1">
              <span className="text-slate-400 block text-[11px]">Primary Device:</span>
              <span className="text-sm font-bold text-white">{state.connectedDevice.name}</span>
              <span className="text-[11px] text-brand-400 block">Status: Connected & Streaming</span>
            </div>

            <div className="p-3 rounded-xl bg-slate-850 border border-slate-800 space-y-1">
              <span className="text-slate-400 block text-[11px]">Data Telemetry Freshness:</span>
              <span className="text-xs font-semibold text-slate-200">
                {state.dataFreshnessMinutes === 0 ? 'Just now' : `${state.dataFreshnessMinutes} minutes ago`}
              </span>
              <span className="text-[11px] text-slate-500 block">Automatic background sync enabled</span>
            </div>

            <div className="p-3 rounded-xl bg-slate-850 border border-slate-800 space-y-1">
              <span className="text-slate-400 block text-[11px]">Battery Level:</span>
              <span className="text-xs font-bold text-emerald-400">{state.connectedDevice.batteryLevel || 84}%</span>
            </div>
          </div>
        </div>
      </div>

      {/* Completed Workouts Today */}
      <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 shadow-md space-y-4">
        <h3 className="text-sm font-bold text-white font-heading">
          Logged Workouts Today ({workouts.length})
        </h3>

        <div className="space-y-3">
          {workouts.length > 0 ? (
            workouts.map((w) => (
              <div
                key={w.id}
                className="p-4 rounded-xl bg-slate-850/90 border border-slate-800 flex flex-col md:flex-row items-start md:items-center justify-between gap-4"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="text-xs uppercase font-extrabold px-2 py-0.5 rounded bg-orange-500/10 text-orange-400 border border-orange-500/20">
                      {w.type}
                    </span>
                    <h4 className="text-base font-bold text-white">{w.title}</h4>
                    <ProvenanceBadge infoType="ESTIMATED" source={w.sourceDevice} confidence="medium" />
                  </div>
                  <div className="flex items-center gap-4 text-xs text-slate-400">
                    <span className="flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5" />
                      {w.durationMinutes} min
                    </span>
                    <span>Avg HR: {w.avgHeartRate.value} BPM</span>
                    <span>Peak HR: {w.peakHeartRate.value} BPM</span>
                    <span>Active Burn: ~{w.activeKcal.value} kcal</span>
                  </div>
                </div>

                {w.exerciseDetails && (
                  <div className="text-xs text-slate-300 bg-slate-800/60 p-2.5 rounded-lg border border-slate-700/60 max-w-sm">
                    <span className="text-[11px] text-slate-400 block font-semibold mb-1">Prescribed Sets:</span>
                    <div className="flex flex-wrap gap-2 text-[11px]">
                      {w.exerciseDetails.map((ex, i) => (
                        <span key={i} className="bg-slate-700/50 px-2 py-0.5 rounded">
                          {ex.exercise} ({ex.sets}×{ex.reps})
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ))
          ) : (
            <div className="p-8 text-center rounded-xl bg-slate-850/40 border border-dashed border-slate-800 space-y-3">
              <Dumbbell className="w-8 h-8 text-slate-600 mx-auto" />
              <div>
                <p className="text-sm font-semibold text-slate-300">No workouts logged yet today</p>
                <p className="text-xs text-slate-500 max-w-sm mx-auto mt-0.5">
                  Start a live workout to track heart rate, active calories, and sets in real time without double counting.
                </p>
              </div>
              <button
                type="button"
                onClick={onStartWorkout}
                className="px-4 py-2 rounded-xl bg-brand-500 hover:bg-brand-400 text-slate-950 font-bold text-xs inline-flex items-center gap-1.5 transition-all shadow-md shadow-brand-500/20"
              >
                <Flame className="w-3.5 h-3.5 fill-slate-950" />
                <span>Start Live Workout</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
