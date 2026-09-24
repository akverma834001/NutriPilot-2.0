import React, { useState, useEffect, useMemo } from 'react';
import { usePersonalState } from '../context/PersonalStateContext';
import { calculateDeterministicGoals } from '../context/PersonalStateContext';
import { ProvenanceBadge } from '../components/ProvenanceBadge';
import {
  PersonalProfile,
  GoalType,
  DietType,
  EnvironmentType
} from '../types';
import {
  ShieldCheck,
  AlertTriangle,
  Download,
  Trash2,
  Lock,
  RotateCcw,
  Save,
  Sparkles,
  Check,
  Plus,
  X,
  Scale,
  Calendar,
  MapPin,
  Flame,
  Droplets,
  Target,
  DollarSign,
  Activity,
  Heart,
  CheckCircle2,
  RefreshCw,
  Zap,
  Key,
  Copy,
  Eye,
  EyeOff
} from 'lucide-react';
import { APP_CONFIG } from '../config/apiConfig';

const COMMON_ALLERGIES = [
  'peanuts',
  'tree nuts',
  'dairy/lactose',
  'gluten',
  'shellfish',
  'soy',
  'eggs',
  'fish'
];

export const ProfileView: React.FC = () => {
  const {
    state,
    updateProfile,
    updateGoals,
    resetAllData,
    deleteFoodHistory,
    deleteWorkoutHistory,
    exportDataJson,
    disconnectDevice
  } = usePersonalState();

  // Local form state cloned from central state
  const [formData, setFormData] = useState<PersonalProfile>({ ...state.profile });
  const [primaryGoal, setPrimaryGoal] = useState<GoalType>(state.goals.primaryGoal);
  const [targetWeightKg, setTargetWeightKg] = useState<number>(state.goals.targetWeightKg);

  // New tag inputs
  const [customAllergyInput, setCustomAllergyInput] = useState('');
  const [dislikedInput, setDislikedInput] = useState('');
  const [favoriteInput, setFavoriteInput] = useState('');

  // UI state
  const [saveSuccessMessage, setSaveSuccessMessage] = useState<string | null>(null);
  const [resetDone, setResetDone] = useState(false);
  const [exportMessage, setExportMessage] = useState(false);
  const [showKey, setShowKey] = useState(false);
  const [copiedKey, setCopiedKey] = useState(false);

  // Synchronize with external changes if needed
  useEffect(() => {
    setFormData({ ...state.profile });
    setPrimaryGoal(state.goals.primaryGoal);
    setTargetWeightKg(state.goals.targetWeightKg);
  }, [state.profile.weightKg, state.profile.dailyBudgetInr, state.goals.primaryGoal]);

  // Live preview calculation of what targets will be based on current form inputs
  const livePreviewGoals = useMemo(() => {
    return calculateDeterministicGoals(formData, {
      primaryGoal,
      targetWeightKg
    });
  }, [formData, primaryGoal, targetWeightKg]);

  // Handle saving and recalculating entire plan
  const handleSaveAndRecalculate = (e?: React.FormEvent) => {
    if (e) e.preventDefault();

    // 1. Update central profile state
    updateProfile(formData);

    // 2. Update deterministic goals based on scientific Mifflin-St Jeor formula
    updateGoals({
      primaryGoal,
      targetWeightKg,
      baselineCalorieTarget: livePreviewGoals.baselineCalorieTarget,
      proteinTargetG: livePreviewGoals.proteinTargetG,
      carbsTargetG: livePreviewGoals.carbsTargetG,
      fatTargetG: livePreviewGoals.fatTargetG,
      fiberTargetG: livePreviewGoals.fiberTargetG,
      waterTargetMl: livePreviewGoals.waterTargetMl,
      dailyStepTarget: livePreviewGoals.dailyStepTarget,
      activeEnergyTargetKcal: livePreviewGoals.activeEnergyTargetKcal
    });

    const goalLabel =
      primaryGoal === 'muscle_gain'
        ? 'Muscle Gain'
        : primaryGoal === 'fat_loss'
        ? 'Fat Loss'
        : primaryGoal === 'athletic_performance'
        ? 'Athletic Performance'
        : 'Maintenance';

    setSaveSuccessMessage(
      `Plan Recalculated! Calorie target updated to ${livePreviewGoals.baselineCalorieTarget} kcal with ${livePreviewGoals.proteinTargetG}g protein (${formData.targetProteinGramsPerKg}g/kg) for your ${goalLabel} goal.`
    );

    setTimeout(() => {
      setSaveSuccessMessage(null);
    }, 6000);
  };

  // Allergy toggle
  const toggleAllergy = (allergy: string) => {
    const lower = allergy.toLowerCase().trim();
    if (formData.allergies.map((a) => a.toLowerCase()).includes(lower)) {
      setFormData({
        ...formData,
        allergies: formData.allergies.filter((a) => a.toLowerCase() !== lower)
      });
    } else {
      setFormData({
        ...formData,
        allergies: [...formData.allergies, lower]
      });
    }
  };

  const addCustomAllergy = () => {
    if (!customAllergyInput.trim()) return;
    const lower = customAllergyInput.toLowerCase().trim();
    if (!formData.allergies.map((a) => a.toLowerCase()).includes(lower)) {
      setFormData({
        ...formData,
        allergies: [...formData.allergies, lower]
      });
    }
    setCustomAllergyInput('');
  };

  // Disliked food handlers
  const addDislikedFood = () => {
    if (!dislikedInput.trim()) return;
    const lower = dislikedInput.toLowerCase().trim();
    if (!formData.dislikedFoods.map((f) => f.toLowerCase()).includes(lower)) {
      setFormData({
        ...formData,
        dislikedFoods: [...formData.dislikedFoods, lower]
      });
    }
    setDislikedInput('');
  };

  const removeDislikedFood = (food: string) => {
    setFormData({
      ...formData,
      dislikedFoods: formData.dislikedFoods.filter((f) => f.toLowerCase() !== food.toLowerCase())
    });
  };

  // Favorite food handlers
  const addFavoriteFood = () => {
    if (!favoriteInput.trim()) return;
    const lower = favoriteInput.toLowerCase().trim();
    if (!formData.favoriteFoods.map((f) => f.toLowerCase()).includes(lower)) {
      setFormData({
        ...formData,
        favoriteFoods: [...formData.favoriteFoods, lower]
      });
    }
    setFavoriteInput('');
  };

  const removeFavoriteFood = (food: string) => {
    setFormData({
      ...formData,
      favoriteFoods: formData.favoriteFoods.filter((f) => f.toLowerCase() !== food.toLowerCase())
    });
  };

  // JSON export
  const handleExport = () => {
    const jsonStr = exportDataJson();
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `NutriPilot-PersonalState-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
    setExportMessage(true);
    setTimeout(() => setExportMessage(false), 3000);
  };

  return (
    <div className="space-y-6 pb-12 animate-fade-in">
      {/* Top Banner */}
      <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 shadow-xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs uppercase tracking-wider text-brand-400 font-bold">
              Your Personal Profile
            </span>
            <span className="text-slate-600">•</span>
            <span className="text-xs text-brand-300 font-medium">Customized Plan</span>
          </div>
          <h1 className="text-2xl font-extrabold text-white font-heading mt-1">
            Profile & Goal Settings
          </h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Update your body measurements, goals, or diet preferences below to automatically personalize your daily targets.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleExport}
            className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-750 text-slate-200 border border-slate-700 text-xs font-semibold flex items-center gap-1.5 transition-colors"
          >
            <Download className="w-3.5 h-3.5 text-brand-400" />
            <span>{exportMessage ? 'Downloaded JSON ✓' : 'Backup My Data (JSON)'}</span>
          </button>
        </div>
      </div>

      {/* SUCCESS NOTIFICATION TOAST */}
      {saveSuccessMessage && (
        <div className="p-4 rounded-2xl bg-gradient-to-r from-emerald-500/20 via-brand-500/20 to-emerald-500/10 border-2 border-emerald-500/50 shadow-xl flex items-center justify-between gap-3 animate-fade-in">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-emerald-500/20 flex items-center justify-center text-emerald-400 shrink-0">
              <CheckCircle2 className="w-5 h-5" />
            </div>
            <div>
              <div className="text-sm font-bold text-white font-heading">
                Profile Updated & Nutrition Targets Refreshed!
              </div>
              <div className="text-xs text-emerald-200/90 mt-0.5">{saveSuccessMessage}</div>
            </div>
          </div>
          <button
            type="button"
            onClick={() => setSaveSuccessMessage(null)}
            className="p-1.5 rounded-lg hover:bg-white/10 text-slate-300"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* DYNAMIC RE-PLANNING LIVE PREVIEW CARD */}
      <div className="p-6 rounded-2xl bg-gradient-to-br from-slate-900 via-slate-850 to-slate-900 border-2 border-brand-500/30 shadow-xl space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-brand-500/20 flex items-center justify-center text-brand-400">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-white font-heading">
                Your Daily Nutrition & Calorie Targets
              </h2>
              <p className="text-[11px] text-slate-400">
                Calculated live for {formData.weightKg} kg, {formData.heightCm} cm, {formData.age} yrs, and {primaryGoal.replace('_', ' ')} goal.
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={() => handleSaveAndRecalculate()}
            className="py-2.5 px-6 rounded-xl bg-gradient-to-r from-brand-500 to-emerald-400 hover:from-brand-600 hover:to-emerald-500 text-slate-950 font-bold text-xs transition-all shadow-lg shadow-brand-500/25 active:scale-95 flex items-center gap-2"
          >
            <Save className="w-4 h-4 fill-slate-950" />
            <span>Save & Update Targets</span>
          </button>
        </div>

        {/* Real-time Target Gauges */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          <div className="p-3 rounded-xl bg-slate-800/80 border border-slate-700/60">
            <span className="text-[10px] text-slate-400 font-medium block">Daily Calories</span>
            <div className="flex items-baseline gap-1 mt-0.5">
              <span className="text-xl font-extrabold text-amber-400 font-heading">
                {livePreviewGoals.baselineCalorieTarget}
              </span>
              <span className="text-[10px] text-slate-400">kcal</span>
            </div>
            <span className="text-[10px] text-emerald-400 mt-1 block">
              {primaryGoal === 'muscle_gain' ? '+300 surplus' : primaryGoal === 'fat_loss' ? '-450 deficit' : 'Maintenance'}
            </span>
          </div>

          <div className="p-3 rounded-xl bg-slate-800/80 border border-slate-700/60">
            <span className="text-[10px] text-slate-400 font-medium block">Protein Target</span>
            <div className="flex items-baseline gap-1 mt-0.5">
              <span className="text-xl font-extrabold text-emerald-400 font-heading">
                {livePreviewGoals.proteinTargetG}
              </span>
              <span className="text-[10px] text-slate-400">g</span>
            </div>
            <span className="text-[10px] text-slate-400 mt-1 block">
              {formData.targetProteinGramsPerKg} g/kg
            </span>
          </div>

          <div className="p-3 rounded-xl bg-slate-800/80 border border-slate-700/60">
            <span className="text-[10px] text-slate-400 font-medium block">Carbs Target</span>
            <div className="flex items-baseline gap-1 mt-0.5">
              <span className="text-xl font-extrabold text-sky-400 font-heading">
                {livePreviewGoals.carbsTargetG}
              </span>
              <span className="text-[10px] text-slate-400">g</span>
            </div>
            <span className="text-[10px] text-slate-400 mt-1 block">Glycogen fueling</span>
          </div>

          <div className="p-3 rounded-xl bg-slate-800/80 border border-slate-700/60">
            <span className="text-[10px] text-slate-400 font-medium block">Fats Target</span>
            <div className="flex items-baseline gap-1 mt-0.5">
              <span className="text-xl font-extrabold text-rose-400 font-heading">
                {livePreviewGoals.fatTargetG}
              </span>
              <span className="text-[10px] text-slate-400">g</span>
            </div>
            <span className="text-[10px] text-slate-400 mt-1 block">Hormonal balance</span>
          </div>

          <div className="p-3 rounded-xl bg-slate-800/80 border border-slate-700/60">
            <span className="text-[10px] text-slate-400 font-medium block">Hydration Target</span>
            <div className="flex items-baseline gap-1 mt-0.5">
              <span className="text-xl font-extrabold text-blue-400 font-heading">
                {livePreviewGoals.waterTargetMl}
              </span>
              <span className="text-[10px] text-slate-400">ml</span>
            </div>
            <span className="text-[10px] text-slate-400 mt-1 block">40ml / kg bodywt</span>
          </div>

          <div className="p-3 rounded-xl bg-slate-800/80 border border-slate-700/60">
            <span className="text-[10px] text-slate-400 font-medium block">Daily Steps</span>
            <div className="flex items-baseline gap-1 mt-0.5">
              <span className="text-xl font-extrabold text-teal-400 font-heading">
                {livePreviewGoals.dailyStepTarget.toLocaleString()}
              </span>
            </div>
            <span className="text-[10px] text-slate-400 mt-1 block">Non-exercise NEAT</span>
          </div>
        </div>
      </div>

      {/* MAIN EDITABLE SECTIONS FORM */}
      <form onSubmit={handleSaveAndRecalculate} className="space-y-6">
        {/* SECTION 1: BIOMETRICS & PERSONAL IDENTITY */}
        <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 shadow-md space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
            <div className="flex items-center gap-2">
              <Activity className="w-4 h-4 text-brand-400" />
              <h3 className="text-sm font-bold text-white font-heading">
                1. Body Measurements & Details
              </h3>
            </div>
            <span className="text-xs text-slate-400">Used to calculate your daily energy needs</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
            <div>
              <label className="text-xs font-semibold text-slate-300 block mb-1">Full Name</label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full px-3 py-2 rounded-xl bg-slate-850 border border-slate-750 text-white text-xs focus:outline-none focus:border-brand-500"
                placeholder="e.g. Abhishek"
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-300 block mb-1">Age (Years)</label>
              <input
                type="number"
                min="14"
                max="95"
                value={formData.age}
                onChange={(e) => setFormData({ ...formData, age: Number(e.target.value) || 21 })}
                className="w-full px-3 py-2 rounded-xl bg-slate-850 border border-slate-750 text-white text-xs focus:outline-none focus:border-brand-500"
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-300 block mb-1">Biological Sex</label>
              <select
                value={formData.sex}
                onChange={(e) => setFormData({ ...formData, sex: e.target.value as any })}
                className="w-full px-3 py-2 rounded-xl bg-slate-850 border border-slate-750 text-white text-xs focus:outline-none focus:border-brand-500"
              >
                <option value="male">Male</option>
                <option value="female">Female</option>
                <option value="other">Other</option>
              </select>
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-300 block mb-1">Height (cm)</label>
              <input
                type="number"
                min="120"
                max="230"
                value={formData.heightCm}
                onChange={(e) => setFormData({ ...formData, heightCm: Number(e.target.value) || 175 })}
                className="w-full px-3 py-2 rounded-xl bg-slate-850 border border-slate-750 text-white text-xs focus:outline-none focus:border-brand-500"
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-300 block mb-1">
                Current Weight (kg)
              </label>
              <input
                type="number"
                step="0.1"
                min="35"
                max="220"
                value={formData.weightKg}
                onChange={(e) => setFormData({ ...formData, weightKg: Number(e.target.value) || 68.5 })}
                className="w-full px-3 py-2 rounded-xl bg-slate-850 border border-slate-750 text-white text-xs font-bold text-emerald-400 focus:outline-none focus:border-brand-500"
              />
            </div>
          </div>
        </div>

        {/* SECTION 2: PRIMARY GOAL & TARGET WEIGHT */}
        <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 shadow-md space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
            <div className="flex items-center gap-2">
              <Target className="w-4 h-4 text-amber-400" />
              <h3 className="text-sm font-bold text-white font-heading">
                2. Fitness Goals & Target Weight
              </h3>
            </div>
            <span className="text-xs text-slate-400">Sets your calorie target and protein goal</span>
          </div>

          {/* Goal Selector Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            {[
              {
                id: 'muscle_gain' as GoalType,
                title: 'Muscle Gain & Hypertrophy',
                desc: 'Hypercaloric (+300 kcal), 1.8-2.2g/kg protein, progressive overload focus',
                badge: 'Surplus (+300)'
              },
              {
                id: 'fat_loss' as GoalType,
                title: 'Fat Loss & Recomposition',
                desc: 'Moderate deficit (-450 kcal), high protein preservation, elevated NEAT steps',
                badge: 'Deficit (-450)'
              },
              {
                id: 'maintenance' as GoalType,
                title: 'Maintenance & Vitality',
                desc: 'Isocaloric baseline, stable bodyweight, lifestyle balance and recovery',
                badge: 'Isocaloric (0)'
              },
              {
                id: 'athletic_performance' as GoalType,
                title: 'Athletic Performance',
                desc: 'High carb replenishment (+200 kcal), VO2 max endurance, cardiovascular conditioning',
                badge: 'Endurance (+200)'
              }
            ].map((item) => {
              const isSelected = primaryGoal === item.id;
              return (
                <div
                  key={item.id}
                  onClick={() => setPrimaryGoal(item.id)}
                  className={`p-4 rounded-xl border cursor-pointer transition-all ${
                    isSelected
                      ? 'bg-brand-500/15 border-brand-500 text-white shadow-lg shadow-brand-500/10'
                      : 'bg-slate-850/80 border-slate-750 text-slate-300 hover:bg-slate-800'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-xs font-bold font-heading">{item.title}</span>
                    <span
                      className={`text-[10px] px-2 py-0.5 rounded font-mono font-bold ${
                        isSelected ? 'bg-brand-500 text-slate-950' : 'bg-slate-700 text-slate-300'
                      }`}
                    >
                      {item.badge}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-400 leading-relaxed">{item.desc}</p>
                </div>
              );
            })}
          </div>

          {/* Goal Numeric Inputs */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
            <div>
              <label className="text-xs font-semibold text-slate-300 block mb-1">
                Target Weight (kg)
              </label>
              <div className="relative">
                <input
                  type="number"
                  step="0.1"
                  min="35"
                  max="220"
                  value={targetWeightKg}
                  onChange={(e) => setTargetWeightKg(Number(e.target.value) || formData.weightKg)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-850 border border-slate-750 text-white text-xs font-bold focus:outline-none focus:border-brand-500"
                />
                <span className="absolute right-3 top-2.5 text-xs text-slate-400">
                  {targetWeightKg > formData.weightKg
                    ? `+${(targetWeightKg - formData.weightKg).toFixed(1)} kg gain`
                    : targetWeightKg < formData.weightKg
                    ? `${(targetWeightKg - formData.weightKg).toFixed(1)} kg loss`
                    : 'Maintain current'}
                </span>
              </div>
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-300 block mb-1">
                Target Protein Ratio (g per kg bodyweight)
              </label>
              <div className="flex items-center gap-3">
                <input
                  type="range"
                  min="1.2"
                  max="2.4"
                  step="0.1"
                  value={formData.targetProteinGramsPerKg}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      targetProteinGramsPerKg: Number(e.target.value)
                    })
                  }
                  className="flex-1 accent-emerald-500"
                />
                <span className="text-xs font-bold text-emerald-400 w-16 text-right">
                  {formData.targetProteinGramsPerKg} g/kg
                </span>
              </div>
              <span className="text-[10px] text-slate-400 mt-1 block">
                Resulting protein target: {Math.round(formData.weightKg * formData.targetProteinGramsPerKg)}g / day
              </span>
            </div>
          </div>
        </div>

        {/* SECTION 3: DIETARY PREFERENCES, ALLERGIES & FOOD TASTES */}
        <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 shadow-md space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-rose-400" />
              <h3 className="text-sm font-bold text-white font-heading">
                3. Food Preferences & Allergies
              </h3>
            </div>
            <span className="text-xs text-slate-400">Strictly filters food recommendations</span>
          </div>

          {/* Diet Preference Dropdown */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-semibold text-slate-300 block mb-1">
                Dietary Preference Type
              </label>
              <select
                value={formData.dietPreference}
                onChange={(e) => setFormData({ ...formData, dietPreference: e.target.value as DietType })}
                className="w-full px-3 py-2 rounded-xl bg-slate-850 border border-slate-750 text-white text-xs focus:outline-none focus:border-brand-500"
              >
                <option value="vegetarian_eggs">Vegetarian + Eggs (Ovo-Vegetarian)</option>
                <option value="strict_vegetarian">Strict Vegetarian (Lacto-Vegetarian / No Eggs)</option>
                <option value="vegan">100% Vegan (Plant-Based)</option>
                <option value="omnivore">Omnivore (Chicken, Fish, Eggs, Dairy, Plant)</option>
                <option value="pescatarian">Pescatarian (Vegetarian + Fish & Seafood)</option>
              </select>
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-300 block mb-1">
                Confirmed Food Allergies (Hard Safety Lock)
              </label>
              <p className="text-[11px] text-slate-400 mb-2">
                Click to toggle confirmed allergens. The engine strictly excludes these from all recommendations.
              </p>
            </div>
          </div>

          {/* Common Allergy Toggle Pills */}
          <div>
            <div className="flex flex-wrap gap-2 mb-3">
              {COMMON_ALLERGIES.map((allergy) => {
                const isSelected = formData.allergies.map((a) => a.toLowerCase()).includes(allergy);
                return (
                  <button
                    key={allergy}
                    type="button"
                    onClick={() => toggleAllergy(allergy)}
                    className={`px-3 py-1.5 rounded-full text-xs font-semibold flex items-center gap-1.5 transition-all ${
                      isSelected
                        ? 'bg-rose-500/20 text-rose-300 border border-rose-500/50 shadow-sm'
                        : 'bg-slate-800 text-slate-400 border border-slate-750 hover:bg-slate-750'
                    }`}
                  >
                    {isSelected && <Lock className="w-3 h-3 text-rose-400" />}
                    <span className="capitalize">{allergy}</span>
                    {isSelected ? <Check className="w-3 h-3 text-rose-400" /> : <Plus className="w-3 h-3" />}
                  </button>
                );
              })}
            </div>

            {/* Custom Allergy Input */}
            <div className="flex gap-2 max-w-sm">
              <input
                type="text"
                value={customAllergyInput}
                onChange={(e) => setCustomAllergyInput(e.target.value)}
                placeholder="Add other allergen (e.g. sesame)"
                className="flex-1 px-3 py-1.5 rounded-xl bg-slate-850 border border-slate-750 text-white text-xs focus:outline-none focus:border-rose-500"
              />
              <button
                type="button"
                onClick={addCustomAllergy}
                className="px-3 py-1.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold transition-colors"
              >
                Add
              </button>
            </div>
          </div>

          {/* Disliked & Favorite Foods Chips */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
            {/* Disliked Foods */}
            <div className="p-4 rounded-xl bg-slate-850 border border-slate-800 space-y-2.5">
              <label className="text-xs font-bold text-slate-300 block">
                Disliked Foods (Engine will avoid or de-prioritize)
              </label>
              <div className="flex flex-wrap gap-1.5 min-h-[36px]">
                {formData.dislikedFoods.map((food) => (
                  <span
                    key={food}
                    className="px-2.5 py-1 rounded-lg bg-slate-800 text-slate-300 text-xs flex items-center gap-1.5 border border-slate-700"
                  >
                    <span className="capitalize">{food}</span>
                    <button
                      type="button"
                      onClick={() => removeDislikedFood(food)}
                      className="text-slate-400 hover:text-rose-400"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                ))}
              </div>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={dislikedInput}
                  onChange={(e) => setDislikedInput(e.target.value)}
                  placeholder="e.g. karela, tinda, brinjal"
                  className="flex-1 px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-750 text-white text-xs focus:outline-none focus:border-brand-500"
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      addDislikedFood();
                    }
                  }}
                />
                <button
                  type="button"
                  onClick={addDislikedFood}
                  className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-750 text-slate-200 text-xs font-semibold"
                >
                  Add
                </button>
              </div>
            </div>

            {/* Favorite Foods */}
            <div className="p-4 rounded-xl bg-slate-850 border border-slate-800 space-y-2.5">
              <label className="text-xs font-bold text-slate-300 block">
                Favorite High-Affinity Foods (Engine will prioritize)
              </label>
              <div className="flex flex-wrap gap-1.5 min-h-[36px]">
                {formData.favoriteFoods.map((food) => (
                  <span
                    key={food}
                    className="px-2.5 py-1 rounded-lg bg-brand-500/15 text-brand-300 text-xs flex items-center gap-1.5 border border-brand-500/30"
                  >
                    <span className="capitalize">{food}</span>
                    <button
                      type="button"
                      onClick={() => removeFavoriteFood(food)}
                      className="text-slate-400 hover:text-rose-400"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                ))}
              </div>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={favoriteInput}
                  onChange={(e) => setFavoriteInput(e.target.value)}
                  placeholder="e.g. paneer, oats, eggs"
                  className="flex-1 px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-750 text-white text-xs focus:outline-none focus:border-brand-500"
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      addFavoriteFood();
                    }
                  }}
                />
                <button
                  type="button"
                  onClick={addFavoriteFood}
                  className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-750 text-slate-200 text-xs font-semibold"
                >
                  Add
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* SECTION 4: SCHEDULE & DAILY ENVIRONMENT */}
        <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 shadow-md space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4 text-sky-400" />
              <h3 className="text-sm font-bold text-white font-heading">
                4. Daily Routine & Setting
              </h3>
            </div>
            <span className="text-xs text-slate-400">Helps tailor meal convenience</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-semibold text-slate-300 block mb-1">
                Typical Schedule / Routine
              </label>
              <input
                type="text"
                value={formData.typicalSchedule}
                onChange={(e) => setFormData({ ...formData, typicalSchedule: e.target.value })}
                placeholder="e.g. College 9 AM – 5 PM, Gym at 6 PM"
                className="w-full px-3 py-2 rounded-xl bg-slate-850 border border-slate-750 text-white text-xs focus:outline-none focus:border-brand-500"
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-300 block mb-1">
                Current Location Context
              </label>
              <select
                value={formData.currentEnvironment}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    currentEnvironment: e.target.value as EnvironmentType
                  })
                }
                className="w-full px-3 py-2 rounded-xl bg-slate-850 border border-slate-750 text-white text-xs focus:outline-none focus:border-brand-500"
              >
                <option value="COLLEGE">COLLEGE (Canteen, Hostel, Grab & Go)</option>
                <option value="HOME">HOME (Full Kitchen & Pantry Access)</option>
                <option value="OFFICE">OFFICE (Desk Meals, Microwave Only)</option>
                <option value="GYM">GYM (Pre/Post Workout Nutrition)</option>
                <option value="RESTAURANT">RESTAURANT (Dining Out & Smart Ordering)</option>
                <option value="TRAVEL">TRAVEL (Portable snacks & high convenience)</option>
              </select>
            </div>
          </div>
        </div>

        {/* SECTION 5: DAILY BUDGET & ECONOMIC ENGINE */}
        <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 shadow-md space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
            <div className="flex items-center gap-2">
              <DollarSign className="w-4 h-4 text-emerald-400" />
              <h3 className="text-sm font-bold text-white font-heading">
                5. Daily Food Budget (₹ INR)
              </h3>
            </div>
            <span className="text-xs text-slate-400">Ensures affordable nutrition suggestions</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-semibold text-slate-300 block mb-1">
                Daily Food & Protein Budget (₹ INR)
              </label>
              <div className="relative">
                <span className="absolute left-3 top-2.5 text-xs font-bold text-emerald-400">₹</span>
                <input
                  type="number"
                  min="50"
                  max="3000"
                  step="10"
                  value={formData.dailyBudgetInr}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      dailyBudgetInr: Number(e.target.value) || 150
                    })
                  }
                  className="w-full pl-7 pr-3 py-2 rounded-xl bg-slate-850 border border-slate-750 text-white text-xs font-bold focus:outline-none focus:border-emerald-500"
                />
              </div>
              <span className="text-[10px] text-slate-400 mt-1 block">
                Target meal allocation: ~₹{Math.round(formData.dailyBudgetInr / 3)} per meal
              </span>
            </div>

            <div className="p-4 rounded-xl bg-slate-850 border border-slate-800 flex items-center justify-between">
              <div>
                <span className="text-xs text-slate-400 block font-medium">
                  Economic High-Protein Ratio
                </span>
                <div className="text-sm font-bold text-emerald-400 mt-0.5">
                  ₹{(formData.dailyBudgetInr / Math.max(1, livePreviewGoals.proteinTargetG)).toFixed(2)} / gram protein
                </div>
                <span className="text-[10px] text-slate-400">
                  Optimized for eggs, paneer, sprouts, curd, and sattu.
                </span>
              </div>
              <div className="w-10 h-10 rounded-xl bg-emerald-500/10 flex items-center justify-center text-emerald-400">
                <DollarSign className="w-5 h-5" />
              </div>
            </div>
          </div>
        </div>

        {/* SAVE & SUBMIT ACTION BAR */}
        <div className="flex flex-col sm:flex-row items-center justify-end gap-3 pt-2">
          <button
            type="button"
            onClick={() => {
              setFormData({ ...state.profile });
              setPrimaryGoal(state.goals.primaryGoal);
              setTargetWeightKg(state.goals.targetWeightKg);
            }}
            className="w-full sm:w-auto px-5 py-3 rounded-xl bg-slate-800 hover:bg-slate-750 text-slate-300 text-xs font-semibold transition-colors"
          >
            Cancel / Revert Unsaved Changes
          </button>

          <button
            type="submit"
            className="w-full sm:w-auto py-3.5 px-8 rounded-xl bg-gradient-to-r from-brand-500 to-emerald-400 hover:from-brand-600 hover:to-emerald-500 text-slate-950 font-extrabold text-sm transition-all shadow-xl shadow-brand-500/25 active:scale-95 flex items-center justify-center gap-2"
          >
            <Save className="w-4 h-4 fill-slate-950" />
            <span>Save Profile & Update Plan</span>
          </button>
        </div>
      </form>

      {/* API & UPI INTELLIGENCE INTEGRATION CARD */}
      <div className="p-6 rounded-2xl bg-gradient-to-br from-slate-900 via-slate-850 to-slate-900 border border-indigo-500/30 shadow-xl space-y-4">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pb-3 border-b border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl bg-indigo-500/15 border border-indigo-500/30 flex items-center justify-center text-indigo-400">
              <Key className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-bold text-white font-heading">
                  Active API & UPI Intelligence Key
                </h3>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  Active & Connected
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Powers automated grocery receipt scanning, pantry sync, UPI budget ledger, and recipe intelligence.
              </p>
            </div>
          </div>
          <span className="text-xs font-mono text-indigo-400/90 bg-indigo-950/40 px-2.5 py-1 rounded-lg border border-indigo-900/40">
            UPI Ref: {APP_CONFIG.formatUpiTxnRef('SYS')}
          </span>
        </div>

        <div className="p-4 rounded-xl bg-slate-950/80 border border-slate-800 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div className="space-y-1">
            <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">
              Configured Access Key
            </span>
            <div className="font-mono text-xs text-white break-all">
              {showKey ? APP_CONFIG.apiKey : APP_CONFIG.maskedKey}
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              type="button"
              onClick={() => setShowKey(!showKey)}
              className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-750 text-slate-300 text-xs flex items-center gap-1.5 border border-slate-700"
            >
              {showKey ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
              <span>{showKey ? 'Hide' : 'Reveal'}</span>
            </button>

            <button
              type="button"
              onClick={() => {
                navigator.clipboard.writeText(APP_CONFIG.apiKey);
                setCopiedKey(true);
                setTimeout(() => setCopiedKey(false), 2000);
              }}
              className="px-3 py-1.5 rounded-lg bg-indigo-500/15 hover:bg-indigo-500/25 border border-indigo-500/30 text-indigo-300 text-xs font-bold flex items-center gap-1.5"
            >
              {copiedKey ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copiedKey ? 'Copied!' : 'Copy Key'}</span>
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 pt-1 text-xs">
          <div className="p-3 rounded-xl bg-slate-850/60 border border-slate-800">
            <div className="flex items-center gap-1.5 text-emerald-400 font-semibold mb-1">
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>Grocery Bill Scanner</span>
            </div>
            <p className="text-[11px] text-slate-400">
              Receipt OCR & eatables filtering authorized with active key.
            </p>
          </div>

          <div className="p-3 rounded-xl bg-slate-850/60 border border-slate-800">
            <div className="flex items-center gap-1.5 text-sky-400 font-semibold mb-1">
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>UPI Budget & Expense Sync</span>
            </div>
            <p className="text-[11px] text-slate-400">
              Automated ₹ INR food transaction ledger & balance calculation.
            </p>
          </div>

          <div className="p-3 rounded-xl bg-slate-850/60 border border-slate-800">
            <div className="flex items-center gap-1.5 text-amber-400 font-semibold mb-1">
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>Recipe Intelligence</span>
            </div>
            <p className="text-[11px] text-slate-400">
              Direct landing on best YouTube chef tutorials (Ranveer Brar, Kabita's).
            </p>
          </div>
        </div>
      </div>

      {/* HEALTH SAFETY MANDATE */}
      <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 shadow-md space-y-3">
        <div className="flex items-center gap-2.5 text-amber-400">
          <AlertTriangle className="w-5 h-5 shrink-0" />
          <h3 className="text-sm font-bold text-white font-heading">
            Health & Safety Principles (Wellness Support Only)
          </h3>
        </div>

        <p className="text-xs text-slate-300 leading-relaxed">
          NutriPilot 2.0 is an intelligent wellness decision engine designed to help active individuals balance their meals, activity, and budget. It is <strong>NOT a medical device</strong> and does not diagnose illnesses, heart conditions, or metabolic disorders, nor does it prescribe medication or therapeutic diets. Wearable sensor metrics are estimates and should not be treated as clinical diagnostic truth. For medical conditions or clinical dietary requirements, always consult a qualified healthcare professional.
        </p>
      </div>

      {/* DATA MANAGEMENT & PRIVACY */}
      <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 shadow-md space-y-4">
        <div className="flex items-center gap-2">
          <ShieldCheck className="w-5 h-5 text-brand-400" />
          <h3 className="text-sm font-bold text-white font-heading">
            Data Privacy & User Sovereignty
          </h3>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          <button
            type="button"
            onClick={() => {
              resetAllData();
              setResetDone(true);
              setTimeout(() => setResetDone(false), 3500);
            }}
            className="p-3.5 rounded-xl bg-slate-850 hover:bg-brand-500/10 hover:border-brand-500/40 text-slate-300 hover:text-brand-300 border border-slate-800 text-xs font-semibold flex items-center justify-center gap-2 transition-all shadow-sm"
          >
            <RotateCcw className="w-4 h-4 text-brand-400" />
            <span>{resetDone ? 'All Values Reset to 0 ✓' : 'Reset Everything to 0'}</span>
          </button>

          <button
            type="button"
            onClick={deleteFoodHistory}
            className="p-3.5 rounded-xl bg-slate-850 hover:bg-rose-500/10 hover:border-rose-500/40 text-slate-300 hover:text-rose-300 border border-slate-800 text-xs font-semibold flex items-center justify-center gap-2 transition-all shadow-sm"
          >
            <Trash2 className="w-4 h-4 text-rose-400" />
            <span>Delete Food Logs</span>
          </button>

          <button
            type="button"
            onClick={deleteWorkoutHistory}
            className="p-3.5 rounded-xl bg-slate-850 hover:bg-rose-500/10 hover:border-rose-500/40 text-slate-300 hover:text-rose-300 border border-slate-800 text-xs font-semibold flex items-center justify-center gap-2 transition-all shadow-sm"
          >
            <Trash2 className="w-4 h-4 text-rose-400" />
            <span>Delete Workout History</span>
          </button>

          <button
            type="button"
            onClick={disconnectDevice}
            className="p-3.5 rounded-xl bg-slate-850 hover:bg-amber-500/10 hover:border-amber-500/40 text-slate-300 hover:text-amber-300 border border-slate-800 text-xs font-semibold flex items-center justify-center gap-2 transition-all shadow-sm"
          >
            <Lock className="w-4 h-4 text-amber-400" />
            <span>Disconnect Wearable</span>
          </button>
        </div>
      </div>
    </div>
  );
};
