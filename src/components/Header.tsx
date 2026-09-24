import React from 'react';
import { usePersonalState } from '../context/PersonalStateContext';
import { EnvironmentType } from '../types';
import {
  Compass,
  RefreshCw,
  Plus,
  Bot,
  Wifi,
  WifiOff,
  Sun,
  Moon,
  MapPin,
  Flame,
  ShieldAlert
} from 'lucide-react';

interface HeaderProps {
  onOpenFoodModal: () => void;
  onOpenAiDrawer: () => void;
  isDarkMode: boolean;
  onToggleTheme: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  onOpenFoodModal,
  onOpenAiDrawer,
  isDarkMode,
  onToggleTheme
}) => {
  const { state, syncWearable, setEnvironment, toggleOfflineMode } = usePersonalState();
  const [isSyncing, setIsSyncing] = React.useState(false);

  const handleSync = async () => {
    setIsSyncing(true);
    await syncWearable();
    setIsSyncing(false);
  };

  const environments: { key: EnvironmentType; label: string }[] = [
    { key: 'COLLEGE', label: 'College' },
    { key: 'HOME', label: 'Home' },
    { key: 'OFFICE', label: 'Office' },
    { key: 'GYM', label: 'Gym' },
    { key: 'RESTAURANT', label: 'Restaurant' },
    { key: 'TRAVEL', label: 'Travel' }
  ];

  const freshnessMin = state.dataFreshnessMinutes;
  const isStale = freshnessMin > 60;

  return (
    <header className="sticky top-0 z-40 bg-slate-950/85 backdrop-blur-xl border-b border-slate-800/80 px-4 sm:px-6 py-3 transition-colors">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
        {/* Logo and Tagline */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-brand-600 via-emerald-500 to-teal-400 p-0.5 shadow-lg shadow-brand-500/20 flex items-center justify-center shrink-0">
            <div className="w-full h-full bg-slate-950 rounded-[14px] flex items-center justify-center">
              <Compass className="w-5 h-5 text-brand-400 animate-spin-slow" />
            </div>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-extrabold text-lg tracking-tight text-white font-heading">
                NutriPilot <span className="text-brand-400 text-xs px-1.5 py-0.5 rounded-full bg-brand-500/10 border border-brand-500/30">2.0</span>
              </span>
            </div>
            <p className="text-[11px] text-slate-400 hidden sm:block font-medium">
              Your body. Your activity. Your food. One intelligent system.
            </p>
          </div>
        </div>

        {/* Central Controls: Environment Pill & Watch Freshness */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Environment Selector */}
          <div className="flex items-center gap-1.5 bg-slate-900/90 border border-slate-750 px-2.5 py-1.5 rounded-xl text-xs">
            <MapPin className="w-3.5 h-3.5 text-brand-400 shrink-0" />
            <select
              value={state.profile.currentEnvironment}
              onChange={(e) => setEnvironment(e.target.value as EnvironmentType)}
              className="bg-transparent text-slate-200 font-semibold text-xs focus:outline-none cursor-pointer"
            >
              {environments.map((env) => (
                <option key={env.key} value={env.key} className="bg-slate-900 text-slate-200">
                  {env.label}
                </option>
              ))}
            </select>
          </div>

          {/* Wearable Sync Status Badge */}
          {state.connectedDevice.connected ? (
            <div
              className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl text-xs border transition-all ${
                isStale
                  ? 'bg-amber-500/10 border-amber-500/30 text-amber-300'
                  : 'bg-slate-900/90 border-slate-750 text-slate-300'
              }`}
            >
              <span
                className={`w-2 h-2 rounded-full shrink-0 ${
                  isStale
                    ? 'bg-amber-400 animate-pulse'
                    : 'bg-emerald-400 shadow-[0_0_8px_#34d399]'
                }`}
              />
              <span className="hidden md:inline text-[11px]">
                {freshnessMin === 0 ? 'Synced just now' : `Watch synced ${freshnessMin}m ago`}
              </span>
              <button
                type="button"
                onClick={handleSync}
                title="Sync wearable data now"
                disabled={isSyncing}
                className="hover:text-white p-0.5 transition-transform"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${isSyncing ? 'animate-spin text-brand-400' : 'text-slate-400'}`} />
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl text-xs bg-slate-900 border border-slate-800 text-slate-400">
              <span className="w-2 h-2 rounded-full bg-slate-500" />
              <span className="text-[11px]">No Watch</span>
            </div>
          )}

          {/* Offline Mode Toggle Simulator */}
          <button
            type="button"
            onClick={toggleOfflineMode}
            className={`p-2 rounded-xl border text-xs flex items-center gap-1.5 transition-all ${
              state.isOffline
                ? 'bg-amber-500/20 border-amber-500 text-amber-300'
                : 'bg-slate-900/90 border-slate-750 text-slate-400 hover:text-slate-200'
            }`}
            title={state.isOffline ? 'Offline mode active (queueing actions)' : 'Online mode'}
          >
            {state.isOffline ? <WifiOff className="w-4 h-4 text-amber-400" /> : <Wifi className="w-4 h-4" />}
            {state.isOffline && <span className="text-[10px] font-bold">Offline</span>}
          </button>

          {/* Segmented Theme Toggle */}
          <button
            type="button"
            onClick={onToggleTheme}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-xs font-semibold transition-all shadow-sm active:scale-95 cursor-pointer ${
              isDarkMode
                ? 'bg-slate-850 hover:bg-slate-800 border-slate-700 text-slate-200'
                : 'bg-white hover:bg-slate-100 border-slate-300 text-slate-800 shadow-sm'
            }`}
            title={isDarkMode ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
            aria-label="Toggle light or dark theme"
          >
            {isDarkMode ? (
              <>
                <Sun className="w-3.5 h-3.5 text-amber-400 fill-amber-400/20" />
                <span className="text-[11px] font-medium hidden sm:inline">Light</span>
              </>
            ) : (
              <>
                <Moon className="w-3.5 h-3.5 text-indigo-600 fill-indigo-600/20" />
                <span className="text-[11px] font-medium hidden sm:inline text-slate-800">Dark</span>
              </>
            )}
          </button>

          {/* Ask AI Trigger */}
          <button
            type="button"
            onClick={onOpenAiDrawer}
            className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-850 hover:bg-slate-800 border border-brand-500/30 text-brand-300 font-semibold text-xs transition-all shadow-sm"
          >
            <Bot className="w-4 h-4 text-brand-400" />
            <span>Ask NutriPilot</span>
          </button>

          {/* Quick Log CTA */}
          <button
            type="button"
            onClick={onOpenFoodModal}
            className="flex items-center gap-1.5 px-3 py-1.5 sm:px-4 sm:py-2 rounded-xl bg-gradient-to-r from-brand-500 to-emerald-400 hover:from-brand-600 hover:to-emerald-500 text-slate-950 font-bold text-xs transition-all shadow-md shadow-brand-500/20 active:scale-95"
          >
            <Plus className="w-4 h-4 stroke-[2.5]" />
            <span>Log Food</span>
          </button>
        </div>
      </div>
    </header>
  );
};
