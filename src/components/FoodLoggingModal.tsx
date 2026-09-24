import React, { useState } from 'react';
import { usePersonalState } from '../context/PersonalStateContext';
import { FOOD_DATABASE } from '../data/foodDatabase';
import { AIService, ParsedFoodEntry } from '../services/AIService';
import { FoodItem } from '../types';
import {
  X,
  Search,
  MessageSquare,
  Mic,
  Camera,
  Check,
  Sparkles,
  Utensils,
  ChevronRight,
  Info,
  DollarSign
} from 'lucide-react';
import { ProvenanceBadge } from './ProvenanceBadge';

interface FoodLoggingModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const FoodLoggingModal: React.FC<FoodLoggingModalProps> = ({ isOpen, onClose }) => {
  const { logFoodItem, logCustomFood } = usePersonalState();
  const [activeTab, setActiveTab] = useState<'nlp' | 'voice' | 'image' | 'database'>('nlp');

  // Database search state
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFood, setSelectedFood] = useState<FoodItem | null>(null);
  const [selectedPortion, setSelectedPortion] = useState<'small' | 'medium' | 'large' | 'custom'>('medium');
  const [customMultiplier, setCustomMultiplier] = useState(1.0);
  const [mealType, setMealType] = useState<'breakfast' | 'lunch' | 'dinner' | 'snack'>('dinner');

  // NLP text state
  const [nlpInput, setNlpInput] = useState('3 eggs and two rotis');
  const [parsedNlp, setParsedNlp] = useState<ParsedFoodEntry | null>(null);

  // Voice logging state
  const [isRecording, setIsRecording] = useState(false);
  const [voiceQuery, setVoiceQuery] = useState('');
  const [parsedVoice, setParsedVoice] = useState<ParsedFoodEntry | null>(null);

  // Image recognition state
  const [imageSample, setImageSample] = useState<string | null>(null);
  const [isAnalyzingImage, setIsAnalyzingImage] = useState(false);
  const [imageResult, setImageResult] = useState<any | null>(null);

  if (!isOpen) return null;

  // Search filtered foods
  const filteredFoods = FOOD_DATABASE.filter(
    (f) =>
      f.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      f.cuisine.toLowerCase().includes(searchQuery.toLowerCase()) ||
      f.category.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleParseNlp = () => {
    if (!nlpInput.trim()) return;
    const parsed = AIService.parseNaturalLanguageFood(nlpInput);
    setParsedNlp(parsed);
  };

  const handleConfirmNlp = () => {
    if (!parsedNlp) return;
    for (const item of parsedNlp.matchedItems) {
      logFoodItem(item.foodItem.id, 'custom', item.portionMultiplier, mealType);
    }
    onClose();
  };

  const handleSimulateVoice = (sampleVoice: string) => {
    setIsRecording(true);
    setVoiceQuery(sampleVoice);
    setTimeout(() => {
      setIsRecording(false);
      const parsed = AIService.parseNaturalLanguageFood(sampleVoice);
      setParsedVoice(parsed);
    }, 1200);
  };

  const handleConfirmVoice = () => {
    if (!parsedVoice) return;
    for (const item of parsedVoice.matchedItems) {
      logFoodItem(item.foodItem.id, 'custom', item.portionMultiplier, mealType);
    }
    onClose();
  };

  const handleSimulateImage = (imageTitle: string, foodId: string, portionLabel: string) => {
    setImageSample(imageTitle);
    setIsAnalyzingImage(true);
    setTimeout(() => {
      setIsAnalyzingImage(false);
      const food = FOOD_DATABASE.find((f) => f.id === foodId) || FOOD_DATABASE[0];
      setImageResult({
        detectedFood: food,
        detectedTitle: imageTitle,
        portionLabel,
        confidence: 'medium',
        calories: food.calories,
        protein: food.protein,
        carbs: food.carbs,
        fat: food.fat,
        cost: food.estimatedCostInr
      });
    }, 1400);
  };

  const handleConfirmImage = () => {
    if (!imageResult) return;
    logFoodItem(imageResult.detectedFood.id, 'medium', 1.0, mealType);
    onClose();
  };

  const handleLogFromDatabase = () => {
    if (!selectedFood) return;
    const mult =
      selectedPortion === 'small'
        ? 0.75
        : selectedPortion === 'large'
        ? 1.35
        : selectedPortion === 'custom'
        ? customMultiplier
        : 1.0;
    logFoodItem(selectedFood.id, selectedPortion, mult, mealType);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fade-in">
      <div className="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-2xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden">
        {/* Modal Header */}
        <div className="p-5 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-brand-500/15 border border-brand-500/30 flex items-center justify-center text-brand-400">
              <Utensils className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-100 font-heading">Log Food Intake</h2>
              <p className="text-xs text-slate-400">Natural language, Voice, Image recognition, or Database</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-slate-800"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Switcher */}
        <div className="flex border-b border-slate-800 bg-slate-900/60 p-1.5 gap-1.5">
          <button
            type="button"
            onClick={() => setActiveTab('nlp')}
            className={`flex-1 py-2 px-3 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 transition-all ${
              activeTab === 'nlp'
                ? 'bg-slate-800 text-brand-400 border border-slate-700 shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <MessageSquare className="w-3.5 h-3.5" />
            <span>Text / AI</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('voice')}
            className={`flex-1 py-2 px-3 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 transition-all ${
              activeTab === 'voice'
                ? 'bg-slate-800 text-brand-400 border border-slate-700 shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Mic className="w-3.5 h-3.5" />
            <span>Voice</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('image')}
            className={`flex-1 py-2 px-3 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 transition-all ${
              activeTab === 'image'
                ? 'bg-slate-800 text-brand-400 border border-slate-700 shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Camera className="w-3.5 h-3.5" />
            <span>Image Vision</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('database')}
            className={`flex-1 py-2 px-3 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 transition-all ${
              activeTab === 'database'
                ? 'bg-slate-800 text-brand-400 border border-slate-700 shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Search className="w-3.5 h-3.5" />
            <span>Database</span>
          </button>
        </div>

        {/* Meal Type Selector (Shared) */}
        <div className="px-6 pt-3 flex items-center justify-between text-xs text-slate-400">
          <span>Meal Window:</span>
          <div className="flex gap-1.5">
            {(['breakfast', 'lunch', 'dinner', 'snack'] as const).map((m) => (
              <button
                key={m}
                type="button"
                onClick={() => setMealType(m)}
                className={`px-2.5 py-1 rounded-lg capitalize text-xs transition-colors ${
                  mealType === m
                    ? 'bg-brand-500/20 text-brand-300 border border-brand-500/40 font-semibold'
                    : 'bg-slate-800/60 text-slate-400 border border-slate-700/50 hover:text-slate-200'
                }`}
              >
                {m}
              </button>
            ))}
          </div>
        </div>

        {/* Tab Body */}
        <div className="p-6 overflow-y-auto space-y-4 flex-1">
          {/* TAB 1: NLP NATURAL LANGUAGE */}
          {activeTab === 'nlp' && (
            <div className="space-y-4">
              <div className="space-y-2">
                <label className="text-xs text-slate-300 font-medium flex items-center justify-between">
                  <span>Describe what you ate in natural language:</span>
                  <span className="text-[11px] text-slate-500">e.g. "3 eggs and two rotis"</span>
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={nlpInput}
                    onChange={(e) => setNlpInput(e.target.value)}
                    placeholder="e.g. 1 bowl of rice with paneer curry and 1 glass of milk"
                    className="flex-1 bg-slate-850 border border-slate-700 rounded-xl px-4 py-2.5 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-brand-500"
                  />
                  <button
                    type="button"
                    onClick={handleParseNlp}
                    className="px-4 py-2.5 rounded-xl bg-brand-500 hover:bg-brand-600 text-slate-950 font-semibold text-xs transition-colors flex items-center gap-1.5 shrink-0"
                  >
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>Parse</span>
                  </button>
                </div>
              </div>

              {/* Sample NLP Prompts */}
              <div className="flex flex-wrap gap-1.5 text-xs">
                <span className="text-slate-500 self-center text-[11px]">Try:</span>
                {[
                  '3 eggs and two rotis',
                  'two bananas and one glass of milk',
                  'paneer curry with rice',
                  '1 bowl rolled oats with milk'
                ].map((sample) => (
                  <button
                    key={sample}
                    type="button"
                    onClick={() => {
                      setNlpInput(sample);
                      const parsed = AIService.parseNaturalLanguageFood(sample);
                      setParsedNlp(parsed);
                    }}
                    className="px-2.5 py-1 rounded-lg bg-slate-800 text-slate-300 hover:text-white border border-slate-700 text-xs"
                  >
                    "{sample}"
                  </button>
                ))}
              </div>

              {/* Parsed Result Confirmation Card */}
              {parsedNlp && (
                <div className="p-4 rounded-xl bg-slate-850 border border-slate-750 space-y-3 animate-fade-in">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-300 uppercase tracking-wider">
                      Detected Entities ({parsedNlp.matchedItems.length})
                    </span>
                    <ProvenanceBadge
                      infoType="ESTIMATED"
                      source="NLP Parser Engine"
                      confidence={parsedNlp.confidence}
                    />
                  </div>

                  <div className="space-y-2">
                    {parsedNlp.matchedItems.map((item, idx) => (
                      <div key={idx} className="p-2.5 rounded-lg bg-slate-800/80 border border-slate-700/60 flex items-center justify-between">
                        <div>
                          <div className="text-sm font-semibold text-slate-200">{item.portionLabel}</div>
                          <div className="text-xs text-slate-400">
                            ~{item.estimatedCalories} kcal • {item.estimatedProtein}g protein • {item.estimatedCarbs}g carbs • {item.estimatedFat}g fat
                          </div>
                        </div>
                        <span className="text-xs font-medium text-brand-400 px-2 py-0.5 rounded bg-brand-500/10 border border-brand-500/20">
                          Confirmed
                        </span>
                      </div>
                    ))}
                  </div>

                  <div className="pt-2 border-t border-slate-800 flex items-center justify-between text-xs text-slate-300">
                    <div>
                      Total: <span className="font-bold text-white text-sm">~{parsedNlp.totalCalories} kcal</span> • <span className="font-bold text-brand-400 text-sm">~{parsedNlp.totalProtein}g protein</span>
                    </div>
                    <div className="flex gap-2">
                      <button
                        type="button"
                        onClick={() => setParsedNlp(null)}
                        className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs"
                      >
                        Edit
                      </button>
                      <button
                        type="button"
                        onClick={handleConfirmNlp}
                        className="px-4 py-1.5 rounded-lg bg-brand-500 hover:bg-brand-600 text-slate-950 font-bold text-xs transition-colors flex items-center gap-1.5"
                      >
                        <Check className="w-3.5 h-3.5" />
                        Confirm & Log
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* TAB 2: VOICE LOGGING */}
          {activeTab === 'voice' && (
            <div className="space-y-4">
              <div className="p-5 rounded-xl bg-slate-850 border border-slate-800 flex flex-col items-center text-center space-y-3">
                <div className={`w-16 h-16 rounded-full flex items-center justify-center transition-all ${
                  isRecording
                    ? 'bg-rose-500/20 text-rose-400 ring-4 ring-rose-500/30 animate-pulse'
                    : 'bg-brand-500/15 text-brand-400 border border-brand-500/30'
                }`}>
                  <Mic className="w-8 h-8" />
                </div>

                <div className="space-y-1">
                  <h4 className="text-sm font-bold text-slate-200">
                    {isRecording ? 'Listening...' : 'Voice Nutrition Capture'}
                  </h4>
                  <p className="text-xs text-slate-400 max-w-sm">
                    Speak naturally. Say what you had and approximate portions.
                  </p>
                </div>

                <div className="flex gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => handleSimulateVoice('I had two bananas and one glass of milk')}
                    className="px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-750 text-xs text-slate-200 border border-slate-700"
                  >
                    Simulate: "Two bananas and one glass of milk"
                  </button>
                  <button
                    type="button"
                    onClick={() => handleSimulateVoice('3 whole boiled eggs with toast')}
                    className="px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-750 text-xs text-slate-200 border border-slate-700"
                  >
                    Simulate: "3 boiled eggs with toast"
                  </button>
                </div>
              </div>

              {parsedVoice && (
                <div className="p-4 rounded-xl bg-slate-850 border border-slate-750 space-y-3 animate-fade-in">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold text-slate-300">
                      Voice Transcribed: <span className="text-white italic">"{voiceQuery}"</span>
                    </span>
                    <ProvenanceBadge infoType="ESTIMATED" source="Voice Audio Transcriber" confidence="high" />
                  </div>

                  <div className="space-y-2">
                    {parsedVoice.matchedItems.map((item, idx) => (
                      <div key={idx} className="p-2.5 rounded-lg bg-slate-800/80 border border-slate-700/60 flex items-center justify-between text-xs">
                        <span className="font-semibold text-slate-200">{item.portionLabel}</span>
                        <span className="text-slate-300 font-mono">~{item.estimatedCalories} kcal | {item.estimatedProtein}g protein</span>
                      </div>
                    ))}
                  </div>

                  <div className="flex justify-end gap-2 pt-2 border-t border-slate-800">
                    <button
                      type="button"
                      onClick={() => setParsedVoice(null)}
                      className="px-3 py-1.5 rounded-lg text-xs text-slate-400 hover:text-slate-200"
                    >
                      Retry
                    </button>
                    <button
                      type="button"
                      onClick={handleConfirmVoice}
                      className="px-4 py-1.5 rounded-lg bg-brand-500 hover:bg-brand-600 text-slate-950 font-bold text-xs flex items-center gap-1.5"
                    >
                      <Check className="w-3.5 h-3.5" />
                      Confirm Voice Log
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* TAB 3: IMAGE FOOD RECOGNITION */}
          {activeTab === 'image' && (
            <div className="space-y-4">
              <div className="p-4 rounded-xl bg-slate-850 border border-slate-800 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-300 uppercase tracking-wider">
                    Select Sample Food Image to Detect
                  </span>
                  <ProvenanceBadge infoType="ESTIMATED" source="Visual Portion Vision Pipeline" confidence="medium" />
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                  <button
                    type="button"
                    onClick={() => handleSimulateImage('Paneer Curry & Steamed Rice', 'food_paneer_curd_rice', '1 medium bowl (100g paneer + 1.5 cup rice)')}
                    className="p-3 rounded-xl bg-slate-800 hover:bg-slate-750 border border-slate-700 text-left space-y-1 transition-all"
                  >
                    <div className="h-16 rounded-lg bg-amber-500/20 border border-amber-500/30 flex items-center justify-center text-amber-300 font-bold text-xs">
                      Paneer & Rice
                    </div>
                    <div className="text-xs font-semibold text-slate-200">Paneer & Rice Plate</div>
                    <div className="text-[11px] text-slate-400">Indian Lunch</div>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleSimulateImage('Boiled Eggs with Multigrain Toast', 'food_boiled_eggs_toast', '3 large whole eggs + 2 slices toast')}
                    className="p-3 rounded-xl bg-slate-800 hover:bg-slate-750 border border-slate-700 text-left space-y-1 transition-all"
                  >
                    <div className="h-16 rounded-lg bg-orange-500/20 border border-orange-500/30 flex items-center justify-center text-orange-300 font-bold text-xs">
                      Boiled Eggs
                    </div>
                    <div className="text-xs font-semibold text-slate-200">3 Eggs & Toast</div>
                    <div className="text-[11px] text-slate-400">High Protein Breakfast</div>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleSimulateImage('Moong Sprout Salad Bowl', 'food_sprouts_chaat', '1 medium bowl (150g)')}
                    className="p-3 rounded-xl bg-slate-800 hover:bg-slate-750 border border-slate-700 text-left space-y-1 transition-all"
                  >
                    <div className="h-16 rounded-lg bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center text-emerald-300 font-bold text-xs">
                      Sprout Bowl
                    </div>
                    <div className="text-xs font-semibold text-slate-200">Sprouts Chaat</div>
                    <div className="text-[11px] text-slate-400">Mid-day Fiber & Micronutrients</div>
                  </button>
                </div>
              </div>

              {isAnalyzingImage && (
                <div className="p-6 rounded-xl bg-slate-850 border border-slate-800 flex flex-col items-center justify-center gap-2 text-slate-300 animate-pulse">
                  <Sparkles className="w-6 h-6 text-brand-400 animate-spin" />
                  <span className="text-xs font-medium">Vision Model: Detecting food items, estimating volume & portions...</span>
                </div>
              )}

              {imageResult && !isAnalyzingImage && (
                <div className="p-4 rounded-xl bg-slate-850 border border-slate-750 space-y-3 animate-fade-in">
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="text-xs text-slate-400">Visual Recognition:</span>
                      <h4 className="text-sm font-bold text-white">{imageResult.detectedTitle}</h4>
                    </div>
                    <span className="text-xs font-semibold text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/20">
                      Medium Confidence
                    </span>
                  </div>

                  <div className="p-3 rounded-lg bg-slate-800/80 border border-slate-700 text-xs space-y-1.5">
                    <div className="text-slate-200 font-medium">
                      Estimated Portion: <span className="text-brand-300">{imageResult.portionLabel}</span>
                    </div>
                    <div className="text-slate-400 flex gap-4">
                      <span>Calories: ~{imageResult.calories} kcal</span>
                      <span>Protein: ~{imageResult.protein}g</span>
                      <span>Estimated Cost: ₹{imageResult.cost}</span>
                    </div>
                  </div>

                  <p className="text-[11px] text-slate-500">
                    AI visual portions are estimates. You can edit before saving.
                  </p>

                  <div className="flex justify-end gap-2 pt-2 border-t border-slate-800">
                    <button
                      type="button"
                      onClick={() => setImageResult(null)}
                      className="px-3 py-1.5 rounded-lg text-xs text-slate-400 hover:text-slate-200"
                    >
                      Retake
                    </button>
                    <button
                      type="button"
                      onClick={handleConfirmImage}
                      className="px-4 py-1.5 rounded-lg bg-brand-500 hover:bg-brand-600 text-slate-950 font-bold text-xs flex items-center gap-1.5"
                    >
                      <Check className="w-3.5 h-3.5" />
                      Confirm & Log
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* TAB 4: STRUCTURED DATABASE SEARCH */}
          {activeTab === 'database' && (
            <div className="space-y-4">
              <div className="relative">
                <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search food database (e.g. paneer, eggs, oats, dal)..."
                  className="w-full bg-slate-850 border border-slate-700 rounded-xl pl-10 pr-4 py-2 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-brand-500"
                />
              </div>

              {/* Food List */}
              <div className="max-h-56 overflow-y-auto space-y-2 pr-1">
                {filteredFoods.map((food) => {
                  const isSelected = selectedFood?.id === food.id;
                  return (
                    <div
                      key={food.id}
                      onClick={() => setSelectedFood(food)}
                      className={`p-3 rounded-xl border cursor-pointer transition-all ${
                        isSelected
                          ? 'bg-brand-500/15 border-brand-500 text-white'
                          : 'bg-slate-850/60 border-slate-800 text-slate-300 hover:bg-slate-850'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-semibold">{food.name}</span>
                        <span className="text-xs font-bold text-brand-400">{food.calories} kcal</span>
                      </div>
                      <div className="flex items-center justify-between text-xs text-slate-400 mt-1">
                        <span>{food.servingSize}</span>
                        <span>{food.protein}g protein • ₹{food.estimatedCostInr}</span>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Portion Selector if selected */}
              {selectedFood && (
                <div className="p-4 rounded-xl bg-slate-850 border border-slate-750 space-y-3 animate-fade-in">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-semibold text-slate-200">Portion Size:</span>
                    <span className="text-brand-400 font-mono">
                      {selectedPortion === 'small' ? '0.75x' : selectedPortion === 'large' ? '1.35x' : '1.0x'}
                    </span>
                  </div>

                  <div className="grid grid-cols-3 gap-2">
                    {(['small', 'medium', 'large'] as const).map((portion) => (
                      <button
                        key={portion}
                        type="button"
                        onClick={() => setSelectedPortion(portion)}
                        className={`py-1.5 px-3 rounded-lg text-xs capitalize font-medium transition-all ${
                          selectedPortion === portion
                            ? 'bg-brand-500 text-slate-950 font-bold'
                            : 'bg-slate-800 text-slate-300 border border-slate-700 hover:bg-slate-750'
                        }`}
                      >
                        {portion}
                      </button>
                    ))}
                  </div>

                  <div className="flex justify-between items-center pt-2 border-t border-slate-800">
                    <div className="text-xs text-slate-400">
                      Cost: <span className="text-white font-semibold">₹{selectedFood.estimatedCostInr}</span>
                    </div>
                    <button
                      type="button"
                      onClick={handleLogFromDatabase}
                      className="px-4 py-2 rounded-xl bg-brand-500 hover:bg-brand-600 text-slate-950 font-bold text-xs flex items-center gap-1.5"
                    >
                      <Check className="w-3.5 h-3.5" />
                      Log This Item
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
