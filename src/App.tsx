import React, { useState, useEffect } from 'react';
import { PersonalStateProvider } from './context/PersonalStateContext';
import { Header } from './components/Header';
import { Navigation, NavTab } from './components/Navigation';
import { FoodLoggingModal } from './components/FoodLoggingModal';
import { AskNutriPilotDrawer } from './components/AskNutriPilotDrawer';

// Views
import { DashboardView } from './views/DashboardView';
import { NutritionView } from './views/NutritionView';
import { ActivityView } from './views/ActivityView';
import { LiveWorkoutView } from './views/LiveWorkoutView';
import { RecommendationsView } from './views/RecommendationsView';
import { PantryView } from './views/PantryView';
import { InsightsView } from './views/InsightsView';
import { ProgressView } from './views/ProgressView';
import { DevicesView } from './views/DevicesView';
import { ProfileView } from './views/ProfileView';

import { Plus, Bot } from 'lucide-react';

const AppContent: React.FC = () => {
  const [activeTab, setActiveTab] = useState<NavTab>('dashboard');
  const [isFoodModalOpen, setIsFoodModalOpen] = useState(false);
  const [isAiDrawerOpen, setIsAiDrawerOpen] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState<boolean>(() => {
    try {
      const saved = localStorage.getItem('nutripilot_theme');
      return saved !== 'light';
    } catch {
      return true;
    }
  });

  // Sync dark/light class on document element & persist
  useEffect(() => {
    try {
      if (isDarkMode) {
        document.documentElement.classList.add('dark');
        document.documentElement.classList.remove('light');
        localStorage.setItem('nutripilot_theme', 'dark');
      } else {
        document.documentElement.classList.remove('dark');
        document.documentElement.classList.add('light');
        localStorage.setItem('nutripilot_theme', 'light');
      }
    } catch {
      // ignore in restricted env
    }
  }, [isDarkMode]);

  const toggleTheme = () => {
    setIsDarkMode((prev) => !prev);
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-850 dark:text-slate-100 flex flex-col transition-colors duration-200 selection:bg-brand-500 selection:text-white">
      {/* Top Header */}
      <Header
        onOpenFoodModal={() => setIsFoodModalOpen(true)}
        onOpenAiDrawer={() => setIsAiDrawerOpen(true)}
        isDarkMode={isDarkMode}
        onToggleTheme={toggleTheme}
      />

      {/* Primary Navigation */}
      <Navigation
        activeTab={activeTab}
        onSelectTab={(tab) => {
          setActiveTab(tab);
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }}
      />

      {/* Main View Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 py-6 pb-24 lg:pb-12">
        {activeTab === 'dashboard' && (
          <DashboardView
            onNavigateTab={(tab) => setActiveTab(tab)}
            onOpenFoodModal={() => setIsFoodModalOpen(true)}
          />
        )}

        {activeTab === 'nutrition' && (
          <NutritionView
            onOpenFoodModal={() => setIsFoodModalOpen(true)}
          />
        )}

        {activeTab === 'activity' && (
          <ActivityView
            onStartWorkout={() => setActiveTab('workout')}
          />
        )}

        {activeTab === 'workout' && (
          <LiveWorkoutView
            onNavigateToRecommendations={() => setActiveTab('recommendations')}
            onOpenFoodModal={() => setIsFoodModalOpen(true)}
            onNavigateToDevices={() => setActiveTab('devices')}
          />
        )}

        {activeTab === 'recommendations' && (
          <RecommendationsView />
        )}

        {activeTab === 'pantry' && (
          <PantryView
            onNavigateToRecommendations={() => setActiveTab('recommendations')}
          />
        )}

        {activeTab === 'insights' && (
          <InsightsView />
        )}

        {activeTab === 'progress' && (
          <ProgressView />
        )}

        {activeTab === 'devices' && (
          <DevicesView />
        )}

        {activeTab === 'profile' && (
          <ProfileView />
        )}
      </main>

      {/* Floating Action Button for Mobile Quick Food Logging */}
      <div className="lg:hidden fixed bottom-18 right-4 z-40 flex flex-col gap-2.5">
        <button
          type="button"
          onClick={() => setIsAiDrawerOpen(true)}
          className="w-11 h-11 rounded-full bg-slate-900 border border-brand-500/40 text-brand-400 flex items-center justify-center shadow-lg active:scale-95"
          title="Ask NutriPilot"
        >
          <Bot className="w-5 h-5" />
        </button>

        <button
          type="button"
          onClick={() => setIsFoodModalOpen(true)}
          className="w-13 h-13 rounded-full bg-gradient-to-r from-brand-500 to-emerald-400 text-slate-950 flex items-center justify-center shadow-xl shadow-brand-500/30 active:scale-95"
          title="Log Food"
        >
          <Plus className="w-6 h-6 stroke-[3]" />
        </button>
      </div>

      {/* Modals & Drawers */}
      <FoodLoggingModal
        isOpen={isFoodModalOpen}
        onClose={() => setIsFoodModalOpen(false)}
      />

      <AskNutriPilotDrawer
        isOpen={isAiDrawerOpen}
        onClose={() => setIsAiDrawerOpen(false)}
      />
    </div>
  );
};

export const App: React.FC = () => {
  return (
    <PersonalStateProvider>
      <AppContent />
    </PersonalStateProvider>
  );
};

export default App;
