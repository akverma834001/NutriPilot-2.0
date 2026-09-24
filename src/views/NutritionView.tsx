import React, { useState } from 'react';
import { usePersonalState } from '../context/PersonalStateContext';
import { ProvenanceBadge } from '../components/ProvenanceBadge';
import { MacroProgressBar } from '../components/MacroProgressBar';
import {
  Utensils,
  Plus,
  Clock,
  DollarSign,
  TrendingDown,
  Droplets,
  ShieldCheck,
  CheckCircle2,
  Trash2
} from 'lucide-react';

interface NutritionViewProps {
  onOpenFoodModal: () => void;
}

export const NutritionView: React.FC<NutritionViewProps> = ({ onOpenFoodModal }) => {
  const { state, logWater, deleteFoodHistory } = usePersonalState();
  const nutrition = state.nutrition;
  const budget = state.budget;

  return (
    <div className="space-y-6 pb-12 animate-fade-in">
      {/* Top Banner */}
      <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 shadow-xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs uppercase tracking-wider text-brand-400 font-bold font-mono">
              Nutrition & Macros
            </span>
          </div>
          <h1 className="text-2xl font-extrabold text-white font-heading mt-1">
            Today's Food & Nutrition
          </h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Keep track of your daily calories, protein, and nutrients to fuel your workouts and recovery.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={onOpenFoodModal}
            className="px-4 py-2 rounded-xl bg-brand-500 hover:bg-brand-600 text-slate-950 font-bold text-xs flex items-center gap-1.5 transition-all shadow-md shadow-brand-500/20"
          >
            <Plus className="w-4 h-4 stroke-[2.5]" />
            <span>Log Food</span>
          </button>
        </div>
      </div>

      {/* Main Macro Bars Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 shadow-md space-y-4">
          <h3 className="text-sm font-bold text-slate-200 flex items-center justify-between">
            <span>Macronutrient Targets</span>
            <span className="text-xs font-normal text-slate-400">Personalized Goal</span>
          </h3>

          <div className="space-y-4 pt-1">
            <MacroProgressBar
              label="Total Calories"
              consumed={nutrition.caloriesConsumed.value}
              target={state.energyModel.adjustedDailyCalorieTarget.value}
              unit="kcal"
              colorClass="text-amber-400"
              gradientClass="from-amber-500 to-orange-400"
            />

            <MacroProgressBar
              label="Protein (Lean Muscle Synthesis)"
              consumed={nutrition.proteinConsumed.value}
              target={state.goals.proteinTargetG}
              unit="g"
              colorClass="text-emerald-400"
              gradientClass="from-brand-500 to-emerald-400"
            />

            <MacroProgressBar
              label="Carbohydrates (Energy & Glycogen)"
              consumed={nutrition.carbsConsumed.value}
              target={state.goals.carbsTargetG}
              unit="g"
              colorClass="text-blue-400"
              gradientClass="from-blue-500 to-cyan-400"
            />

            <MacroProgressBar
              label="Fats (Hormonal Balance)"
              consumed={nutrition.fatConsumed.value}
              target={state.goals.fatTargetG}
              unit="g"
              colorClass="text-purple-400"
              gradientClass="from-purple-500 to-indigo-400"
            />

            <MacroProgressBar
              label="Dietary Fiber (Digestion & Satiety)"
              consumed={nutrition.fiberConsumed.value}
              target={state.goals.fiberTargetG}
              unit="g"
              colorClass="text-teal-400"
              gradientClass="from-teal-500 to-emerald-400"
            />
          </div>
        </div>

        {/* Right side: Hydration & Budget Tracker */}
        <div className="space-y-5">
          {/* Hydration Card */}
          <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 shadow-md space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Droplets className="w-4 h-4 text-blue-400" />
                <h3 className="text-sm font-bold text-slate-200">Daily Hydration</h3>
              </div>
            </div>

            <div className="flex items-baseline justify-between pt-1">
              <div>
                <span className="text-2xl font-extrabold text-white font-heading">
                  {nutrition.waterConsumedMl.value.toLocaleString()} ml
                </span>
                <span className="text-xs text-slate-400 ml-1.5">/ {state.goals.waterTargetMl.toLocaleString()} ml</span>
              </div>
              <span className="text-xs text-slate-300 font-semibold">
                {nutrition.waterRemainingMl.value} ml remaining
              </span>
            </div>

            <div className="h-2 w-full bg-slate-800 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-blue-500 to-cyan-400 rounded-full transition-all"
                style={{ width: `${Math.min(100, (nutrition.waterConsumedMl.value / state.goals.waterTargetMl) * 100)}%` }}
              />
            </div>

            <div className="flex gap-2 pt-2">
              <button
                type="button"
                onClick={() => logWater(250)}
                className="flex-1 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-750 text-xs font-semibold text-blue-300 border border-slate-700 transition-colors"
              >
                +250 ml (1 glass)
              </button>
              <button
                type="button"
                onClick={() => logWater(500)}
                className="flex-1 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-750 text-xs font-semibold text-blue-300 border border-slate-700 transition-colors"
              >
                +500 ml (1 bottle)
              </button>
            </div>
          </div>

          {/* Budget Card */}
          <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 shadow-md space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <DollarSign className="w-4 h-4 text-amber-400" />
                <h3 className="text-sm font-bold text-slate-200">Daily Food Budget</h3>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-2 text-center text-xs pt-1">
              <div className="p-2.5 rounded-xl bg-slate-850 border border-slate-800">
                <span className="text-[10px] text-slate-400 block">Daily Target</span>
                <span className="text-base font-bold text-white font-heading">₹{budget.dailyBudgetInr}</span>
              </div>
              <div className="p-2.5 rounded-xl bg-slate-850 border border-slate-800">
                <span className="text-[10px] text-slate-400 block">Spent Today</span>
                <span className="text-base font-bold text-amber-400 font-heading">₹{budget.spentTodayInr}</span>
              </div>
              <div className="p-2.5 rounded-xl bg-slate-850 border border-slate-800">
                <span className="text-[10px] text-slate-400 block">Remaining</span>
                <span className="text-base font-bold text-emerald-400 font-heading">₹{budget.remainingTodayInr}</span>
              </div>
            </div>

            <p className="text-[11px] text-slate-400">
              Meal budget guideline: ~₹{budget.mealBudgetGuidelineInr} per meal. All recommendations stay strictly under your remaining allowance.
            </p>
          </div>
        </div>
      </div>

      {/* Logged Meals List */}
      <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 shadow-md space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <div className="flex items-center gap-2">
            <Utensils className="w-4 h-4 text-brand-400" />
            <h3 className="text-sm font-bold text-slate-100 font-heading">
              Logged Meals Today ({nutrition.loggedMeals.length})
            </h3>
          </div>
          <button
            type="button"
            onClick={deleteFoodHistory}
            className="text-xs text-rose-400 hover:text-rose-300 flex items-center gap-1"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>Clear Logs</span>
          </button>
        </div>

        <div className="space-y-3">
          {nutrition.loggedMeals.length > 0 ? (
            nutrition.loggedMeals.map((meal) => (
              <div
                key={meal.id}
                className="p-4 rounded-xl bg-slate-850/80 border border-slate-800 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 transition-colors"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="text-xs uppercase font-extrabold px-2 py-0.5 rounded bg-brand-500/10 text-brand-300 border border-brand-500/20">
                      {meal.mealType}
                    </span>
                    <h4 className="text-sm font-bold text-slate-100">{meal.name}</h4>
                    <ProvenanceBadge infoType={meal.calories.infoType} source={meal.source} confidence={meal.calories.confidence} />
                  </div>
                  <div className="flex items-center gap-3 text-xs text-slate-400">
                    <span className="flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {new Date(meal.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                    <span>Portion: {meal.portion}</span>
                    <span>Cost: ₹{meal.costInr}</span>
                  </div>
                </div>

                <div className="flex items-center gap-3 text-xs font-mono shrink-0">
                  <span className="font-bold text-amber-400">{meal.calories.value} kcal</span>
                  <span className="text-slate-600">|</span>
                  <span className="font-bold text-emerald-400">{meal.protein.value}g P</span>
                  <span className="text-slate-600">|</span>
                  <span className="text-slate-300">{meal.carbs.value}g C</span>
                  <span className="text-slate-600">|</span>
                  <span className="text-slate-400">{meal.fat.value}g F</span>
                </div>
              </div>
            ))
          ) : (
            <div className="text-xs text-slate-400 text-center py-8">
              No meals logged today. Click "+ Log Food" above to get started.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
