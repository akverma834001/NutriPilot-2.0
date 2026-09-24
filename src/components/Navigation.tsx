import React from 'react';
import { usePersonalState } from '../context/PersonalStateContext';
import {
  LayoutDashboard,
  UtensilsCrossed,
  Activity,
  Flame,
  Sparkles,
  ShoppingBag,
  TrendingUp,
  Watch,
  UserCheck,
  CalendarDays
} from 'lucide-react';

export type NavTab =
  | 'dashboard'
  | 'nutrition'
  | 'activity'
  | 'workout'
  | 'recommendations'
  | 'pantry'
  | 'insights'
  | 'progress'
  | 'devices'
  | 'profile';

interface NavigationProps {
  activeTab: NavTab;
  onSelectTab: (tab: NavTab) => void;
}

export const Navigation: React.FC<NavigationProps> = ({ activeTab, onSelectTab }) => {
  const { state } = usePersonalState();
  const isWorkoutLive = Boolean(state.currentWorkout && state.currentWorkout.status === 'active');

  const navItems: { key: NavTab; label: string; icon: React.FC<{ className?: string }>; badge?: string }[] = [
    { key: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { key: 'nutrition', label: 'Nutrition', icon: UtensilsCrossed },
    { key: 'activity', label: 'Activity', icon: Activity },
    {
      key: 'workout',
      label: 'Live Workout',
      icon: Flame,
      badge: isWorkoutLive ? 'LIVE' : undefined
    },
    { key: 'recommendations', label: 'What to Eat', icon: Sparkles },
    { key: 'pantry', label: 'My Pantry', icon: ShoppingBag },
    { key: 'insights', label: 'Weekly Review', icon: CalendarDays },
    { key: 'progress', label: 'Progress', icon: TrendingUp },
    { key: 'devices', label: 'Devices', icon: Watch },
    { key: 'profile', label: 'Profile', icon: UserCheck }
  ];

  return (
    <>
      {/* Desktop Horizontal Navigation Bar */}
      <nav className="hidden lg:block bg-slate-900/60 border-b border-slate-800/80 sticky top-[61px] z-30 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-6 flex items-center justify-between overflow-x-auto">
          <div className="flex space-x-1 py-1.5">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.key;
              return (
                <button
                  key={item.key}
                  type="button"
                  onClick={() => onSelectTab(item.key)}
                  className={`flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-semibold transition-all whitespace-nowrap relative ${
                    isActive
                      ? 'bg-slate-800 text-brand-400 shadow-sm border border-slate-700/80'
                      : 'text-slate-400 hover:text-slate-200 hover:bg-slate-850/60'
                  }`}
                >
                  <Icon className={`w-4 h-4 ${isActive ? 'text-brand-400' : 'text-slate-400'}`} />
                  <span>{item.label}</span>
                  {item.badge && (
                    <span className="px-1.5 py-0.2 text-[9px] font-extrabold uppercase rounded bg-rose-500 text-white animate-pulse">
                      {item.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </div>

          <div className="text-[11px] text-slate-500 font-medium">
            Daily targets updating in real time
          </div>
        </div>
      </nav>

      {/* Mobile Bottom Navigation Bar */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-slate-950/95 border-t border-slate-800 backdrop-blur-xl px-2 py-1.5 flex justify-around items-center">
        {navItems.slice(0, 5).map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.key;
          return (
            <button
              key={item.key}
              type="button"
              onClick={() => onSelectTab(item.key)}
              className={`flex flex-col items-center gap-1 py-1 px-2.5 rounded-xl transition-all relative ${
                isActive ? 'text-brand-400 font-bold' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <div className="relative">
                <Icon className={`w-5 h-5 ${isActive ? 'text-brand-400' : 'text-slate-400'}`} />
                {item.badge && (
                  <span className="absolute -top-1 -right-1 w-2 h-2 rounded-full bg-rose-500 animate-ping" />
                )}
              </div>
              <span className="text-[10px] tracking-tight">{item.label}</span>
            </button>
          );
        })}
        {/* Overflow Menu item for mobile */}
        <button
          type="button"
          onClick={() => onSelectTab('insights')}
          className={`flex flex-col items-center gap-1 py-1 px-2.5 rounded-xl transition-all ${
            ['insights', 'pantry', 'progress', 'devices', 'profile'].includes(activeTab)
              ? 'text-brand-400 font-bold'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <CalendarDays className="w-5 h-5" />
          <span className="text-[10px]">More</span>
        </button>
      </div>
    </>
  );
};
