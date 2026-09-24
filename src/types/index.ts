// NutriPilot 2.0 Central Type System

export type SourceType =
  | 'USER_ENTERED'
  | 'WEARABLE_MEASURED'
  | 'WEARABLE_ESTIMATED'
  | 'DATABASE'
  | 'CALCULATED'
  | 'AI_ESTIMATED'
  | 'AI_PREDICTED'
  | 'IMPORTED';

export type InformationType =
  | 'MEASURED'
  | 'CALCULATED'
  | 'ESTIMATED'
  | 'PREDICTED';

export type ConfidenceLevel = 'high' | 'medium' | 'low';

export interface DataPoint<T> {
  value: T;
  unit: string;
  source: string;
  sourceType: SourceType;
  infoType: InformationType;
  timestamp: string; // ISO string
  confidence: ConfidenceLevel;
  traceability?: string;
  notes?: string;
}

export type GoalType = 'muscle_gain' | 'fat_loss' | 'maintenance' | 'athletic_performance';
export type DietType = 'vegetarian_eggs' | 'strict_vegetarian' | 'vegan' | 'omnivore' | 'pescatarian';
export type EnvironmentType = 'HOME' | 'COLLEGE' | 'OFFICE' | 'GYM' | 'RESTAURANT' | 'TRAVEL';

export interface PersonalProfile {
  name: string;
  age: number;
  sex: 'male' | 'female' | 'other';
  heightCm: number;
  weightKg: number;
  dietPreference: DietType;
  allergies: string[];
  dislikedFoods: string[];
  favoriteFoods: string[];
  typicalSchedule: string;
  currentEnvironment: EnvironmentType;
  dailyBudgetInr: number;
  targetProteinGramsPerKg: number;
}

export interface Goals {
  primaryGoal: GoalType;
  targetWeightKg: number;
  baselineCalorieTarget: number;
  proteinTargetG: number;
  carbsTargetG: number;
  fatTargetG: number;
  fiberTargetG: number;
  waterTargetMl: number;
  dailyStepTarget: number;
  activeEnergyTargetKcal: number;
}

export interface FoodItem {
  id: string;
  name: string;
  servingSize: string;
  servingUnit: string;
  servingQuantity: number;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  fiber: number;
  micronutrients?: {
    ironMg?: number;
    calciumMg?: number;
    vitaminDMcg?: number;
    sodiumMg?: number;
    potassiumMg?: number;
  };
  cuisine: string;
  dietTags: ('vegetarian' | 'contains_egg' | 'vegan' | 'high_protein' | 'dairy_free' | 'gluten_free')[];
  allergenTags: string[];
  prepTimeMinutes: number;
  estimatedCostInr: number;
  availableEnvironments: EnvironmentType[];
  category: 'breakfast' | 'main' | 'snack' | 'drink' | 'supplement';
  imagePlaceholderColor?: string;
  youtubeUrl?: string;
  youtubeVideoTitle?: string;
}

export interface FoodLog {
  id: string;
  timestamp: string;
  foodId: string;
  name: string;
  portion: 'small' | 'medium' | 'large' | 'custom';
  portionMultiplier: number;
  calories: DataPoint<number>;
  protein: DataPoint<number>;
  carbs: DataPoint<number>;
  fat: DataPoint<number>;
  fiber: DataPoint<number>;
  costInr: number;
  mealType: 'breakfast' | 'lunch' | 'dinner' | 'snack';
  source: SourceType;
  environment: EnvironmentType;
}

export interface NutritionState {
  caloriesConsumed: DataPoint<number>;
  proteinConsumed: DataPoint<number>;
  carbsConsumed: DataPoint<number>;
  fatConsumed: DataPoint<number>;
  fiberConsumed: DataPoint<number>;
  waterConsumedMl: DataPoint<number>;
  caloriesRemaining: DataPoint<number>;
  proteinRemaining: DataPoint<number>;
  carbsRemaining: DataPoint<number>;
  fatRemaining: DataPoint<number>;
  fiberRemaining: DataPoint<number>;
  waterRemainingMl: DataPoint<number>;
  loggedMeals: FoodLog[];
}

export type WorkoutType = 'strength' | 'running' | 'cycling' | 'walking' | 'hiit';

export interface WorkoutSession {
  id: string;
  type: WorkoutType;
  title: string;
  startTime: string;
  endTime?: string;
  durationMinutes: number;
  activeKcal: DataPoint<number>;
  avgHeartRate: DataPoint<number>;
  peakHeartRate: DataPoint<number>;
  currentHeartRate?: number;
  stepsCount: number;
  distanceKm?: number;
  paceAvg?: string;
  intensity: 'low' | 'moderate' | 'high' | 'vigorous';
  status: 'active' | 'paused' | 'completed';
  sourceDevice: string;
  heartRateSamples: { timeOffsetSec: number; hr: number }[];
  exerciseDetails?: { exercise: string; sets: number; reps: number; weightKg?: number }[];
}

export interface ActivityState {
  steps: DataPoint<number>;
  activeEnergyKcal: DataPoint<number>;
  distanceKm: DataPoint<number>;
  workoutMinutes: DataPoint<number>;
  currentHeartRate: DataPoint<number>;
  restingHeartRate: DataPoint<number>;
  peakHeartRate: DataPoint<number>;
  avgHeartRate: DataPoint<number>;
  heartRateTrend: { time: string; hr: number }[];
  todayWorkouts: WorkoutSession[];
  lastWorkoutSummary?: WorkoutSession;
  dataFreshnessTimestamp: string;
}

export interface RecoveryState {
  sleepDurationMinutes: DataPoint<number>;
  sleepConsistency: 'Excellent' | 'Good' | 'Fair' | 'Poor';
  lastNightSleepHours: number;
  sevenDayAvgSleepHours: number;
  recoveryScore: DataPoint<number>; // 0 - 100
  recoveryContext: 'Low' | 'Moderate' | 'High';
  restingHeartRateBpm: DataPoint<number>;
  weeklySessionsCount: number;
  disclaimer: string;
}

export interface WeightRecord {
  id: string;
  date: string;
  weightKg: number;
  rollingAvgKg: number;
  source: SourceType;
}

export interface WeightTrend {
  currentWeightKg: DataPoint<number>;
  rolling7DayAvgKg: DataPoint<number>;
  trendDirection: 'decreasing' | 'stable' | 'increasing';
  changeFromGoalBaselineKg: number;
  history: WeightRecord[];
}

export interface EnergyModelOutput {
  baselineExpenditureKcal: DataPoint<number>; // BMR / Sedentary baseline
  activityContributionKcal: DataPoint<number>; // Additional beyond baseline
  wearableActiveKcal: DataPoint<number>; // Raw device estimate
  totalEnergyExpenditureKcal: DataPoint<number>; // TDEE
  adjustedDailyCalorieTarget: DataPoint<number>; // Smooth calorie target
  targetChangeDelta: number;
  smoothingApplied: boolean;
  methodology: string;
  explanationSteps: { factor: string; deltaKcal: string; explanation: string }[];
  avoidedDoubleCountingExplanation: string;
}

export interface PantryItem {
  id: string;
  name: string;
  category: 'protein' | 'dairy' | 'grain' | 'vegetable' | 'fruit' | 'staple' | 'spice';
  quantity: string;
  expiryDays: number;
  inStock: boolean;
  unitCostInr: number;
}

export interface BudgetState {
  dailyBudgetInr: number;
  spentTodayInr: number;
  remainingTodayInr: number;
  weeklyBudgetInr: number;
  weeklySpentInr: number;
  mealBudgetGuidelineInr: number;
}

export interface Recommendation {
  id: string;
  title: string;
  description: string;
  items: string[];
  calories: number;
  proteinG: number;
  carbsG: number;
  fatG: number;
  prepTimeMinutes: number;
  estimatedCostInr: number;
  environment: EnvironmentType;
  suitabilityScore: number; // 0-100
  confidence: ConfidenceLevel;
  whyReasons: string[];
  dataConsidered: string[];
  matchedPantryItems: string[];
  timingContext: string;
  sourceEngine: 'deterministic_nutrition_engine' | 'pantry_optimizer';
  llmExplanation: string;
  youtubeUrl?: string;
  youtubeVideoTitle?: string;
}

export interface FeedbackRecord {
  recommendationId: string;
  rating: 'loved' | 'fine' | 'not_for_me';
  reasons: string[];
  accepted: boolean;
  timestamp: string;
  mealChosenTitle: string;
}

export interface AutopilotAlert {
  id: string;
  type: 'protein_gap' | 'hydration_gap' | 'workout_recovery' | 'calorie_pacing' | 'meal_timing' | 'device_stale';
  severity: 'warning' | 'info' | 'critical';
  title: string;
  message: string;
  timestamp: string;
  actionText?: string;
  actionPayload?: string;
}

export interface AutopilotSettings {
  enabled: boolean;
  frequency: 'low' | 'medium' | 'high';
  alerts: AutopilotAlert[];
}

export interface PredictionOutput {
  predictedEndOfDayCalories: number;
  predictedEndOfDayProteinG: number;
  predictedEndOfDayWaterMl: number;
  calorieGapRisk: 'on_track' | 'deficit_risk' | 'surplus_risk';
  proteinGapRisk: 'optimal' | 'moderate_gap' | 'severe_gap';
  projectedProteinShortfallG: number;
  predictionStatement: string;
  confidence: ConfidenceLevel;
  reasons: string[];
}

export interface WearableDevice {
  id: string;
  name: string;
  provider: 'demo' | 'bluetooth_ble' | 'apple_health' | 'health_connect' | 'fitbit' | 'garmin' | 'samsung_health';
  connected: boolean;
  status: 'connected' | 'disconnected' | 'syncing' | 'error';
  lastSyncTimestamp: string;
  batteryLevel?: number;
  latestHeartRate?: number;
  latestStepCount?: number;
  isRealHardware?: boolean;
  hasHeartRateSensor?: boolean;
  permissions: {
    steps: boolean;
    heartRate: boolean;
    workoutHistory: boolean;
    activeEnergy: boolean;
    sleep: boolean;
    distance: boolean;
  };
}

// THE CENTRAL PERSONAL NUTRITION & ACTIVITY STATE
export interface PersonalState {
  profile: PersonalProfile;
  goals: Goals;
  nutrition: NutritionState;
  activity: ActivityState;
  currentWorkout?: WorkoutSession;
  recovery: RecoveryState;
  weightTrend: WeightTrend;
  energyModel: EnergyModelOutput;
  pantry: PantryItem[];
  budget: BudgetState;
  recommendations: Recommendation[];
  activeRecommendation?: Recommendation;
  feedbackHistory: FeedbackRecord[];
  autopilot: AutopilotSettings;
  predictions: PredictionOutput;
  connectedDevice: WearableDevice;
  dataFreshnessMinutes: number;
  isOffline: boolean;
  offlineActionQueueCount: number;
  todayAlignmentScore: number; // Transparently calculated 0-100
  alignmentBreakdown: { metric: string; score: number; weight: number; comment: string }[];
  lastUpdated: string;
}
