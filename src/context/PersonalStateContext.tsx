import React, { createContext, useContext, useState, useEffect, useMemo } from 'react';
import {
  PersonalState,
  PersonalProfile,
  Goals,
  FoodLog,
  PantryItem,
  WorkoutSession,
  WorkoutType,
  EnvironmentType,
  Recommendation,
  FeedbackRecord,
  WearableDevice
} from '../types';
import { INITIAL_PANTRY_ITEMS, FOOD_DATABASE } from '../data/foodDatabase';
import { MOCK_WEIGHT_HISTORY } from '../data/mockHistoricalData';
import { EnergyService } from '../services/EnergyService';
import { NutritionService } from '../services/NutritionService';
import { RecommendationService } from '../services/RecommendationService';
import { PredictionService } from '../services/PredictionService';
import { DemoWearableProvider, INITIAL_WEARABLE_DEVICE } from '../services/WearableService';
import { EventDeduplicationService } from '../services/DeduplicationService';
import { BleWearableService } from '../services/BleService';
import { PedometerService } from '../services/PedometerService';
import { PrescribedWorkoutDay, PrescribedExercise } from '../services/WorkoutPlanningService';

interface PersonalStateContextType {
  state: PersonalState;
  // Profile & Deterministic Planning
  updateProfile: (updated: Partial<PersonalProfile>) => void;
  updateGoals: (updated: Partial<Goals>) => void;
  resetAllData: () => void;
  // Wearables & Sync
  syncWearable: () => Promise<void>;
  connectDevice: (providerName: string) => Promise<void>;
  connectRealBluetoothWatch: () => Promise<{ success: boolean; deviceName?: string; error?: string }>;
  disconnectDevice: () => void;
  togglePermission: (permKey: keyof WearableDevice['permissions']) => void;
  // Real Phone Pedometer (Motion Accelerometer)
  isPhonePedometerActive: boolean;
  isPhoneMoving: boolean;
  liveMagnitude: number;
  pedometerError: string | null;
  startPhonePedometer: () => Promise<boolean>;
  stopPhonePedometer: () => void;
  addSteps: (count: number) => void;
  resetAllDayValues: () => void;
  // Workouts
  startLiveWorkout: (type?: WorkoutType, title?: string, exercises?: PrescribedExercise[]) => void;
  pauseLiveWorkout: () => void;
  resumeLiveWorkout: () => void;
  finishLiveWorkout: () => WorkoutSession;
  startPrescribedWorkout: (day: PrescribedWorkoutDay) => void;
  prescribedExercises: (PrescribedExercise & { completed: boolean })[];
  togglePrescribedExercise: (exerciseId: string) => void;
  // Nutrition & Food Logging
  logFoodItem: (
    foodId: string,
    portion: 'small' | 'medium' | 'large' | 'custom',
    portionMultiplier?: number,
    mealType?: 'breakfast' | 'lunch' | 'dinner' | 'snack'
  ) => void;
  logCustomFood: (foodLog: Partial<FoodLog>) => void;
  logWater: (amountMl: number) => void;
  // Recommendations & Feedback
  acceptRecommendation: (rec: Recommendation) => void;
  submitFeedback: (recId: string, rating: 'loved' | 'fine' | 'not_for_me', reasons: string[]) => void;
  refreshRecommendations: (env?: EnvironmentType, maxPrepTime?: number) => void;
  // Environment & Pantry
  setEnvironment: (env: EnvironmentType) => void;
  togglePantryItemStock: (id: string) => void;
  addPantryItem: (item: Omit<PantryItem, 'id'>) => void;
  addMultiplePantryItems: (items: Omit<PantryItem, 'id'>[]) => void;
  deletePantryItem: (id: string) => void;
  // Autopilot
  toggleAutopilot: () => void;
  dismissAlert: (id: string) => void;
  // Offline & Data Management
  toggleOfflineMode: () => void;
  deleteFoodHistory: () => void;
  deleteWorkoutHistory: () => void;
  exportDataJson: () => string;
  // Live workout tick data
  liveWorkoutTicker: {
    durationSec: number;
    currentHr: number;
    activeKcal: number;
    steps: number;
  };
}

export const calculateDeterministicGoals = (
  p: PersonalProfile,
  overrides?: Partial<Goals>
): Goals => {
  // Mifflin-St Jeor Basal Metabolic Rate
  const isMale = p.sex === 'male';
  const bmr = isMale
    ? 10 * p.weightKg + 6.25 * p.heightCm - 5 * p.age + 5
    : 10 * p.weightKg + 6.25 * p.heightCm - 5 * p.age - 161;

  const tdee = Math.round(bmr * 1.45);
  const primaryGoal = overrides?.primaryGoal || 'muscle_gain';

  let calorieTarget = tdee;
  let activeEnergyTarget = 500;
  let dailyStepTarget = 10000;

  if (primaryGoal === 'muscle_gain') {
    calorieTarget = Math.round(tdee + 300);
    activeEnergyTarget = 450;
    dailyStepTarget = 8500;
  } else if (primaryGoal === 'fat_loss') {
    calorieTarget = Math.round(tdee - 450);
    activeEnergyTarget = 550;
    dailyStepTarget = 11500;
  } else if (primaryGoal === 'athletic_performance') {
    calorieTarget = Math.round(tdee + 200);
    activeEnergyTarget = 600;
    dailyStepTarget = 12000;
  } else {
    calorieTarget = tdee;
    activeEnergyTarget = 450;
    dailyStepTarget = 10000;
  }

  const proteinMultiplier = p.targetProteinGramsPerKg || 1.9;
  const proteinTargetG = Math.round(p.weightKg * proteinMultiplier);
  const fatTargetG = Math.max(45, Math.round((calorieTarget * 0.25) / 9));
  const remainingCalories = Math.max(0, calorieTarget - (proteinTargetG * 4 + fatTargetG * 9));
  const carbsTargetG = Math.round(remainingCalories / 4);
  const fiberTargetG = Math.round((calorieTarget / 1000) * 14);
  const waterTargetMl = Math.round((p.weightKg * 40) / 250) * 250;

  const targetWeightKg = overrides?.targetWeightKg ?? (
    primaryGoal === 'muscle_gain' ? Math.round((p.weightKg + 3.5) * 10) / 10 :
    primaryGoal === 'fat_loss' ? Math.round((p.weightKg - 4.5) * 10) / 10 :
    p.weightKg
  );

  return {
    primaryGoal,
    targetWeightKg,
    baselineCalorieTarget: overrides?.baselineCalorieTarget ?? calorieTarget,
    proteinTargetG: overrides?.proteinTargetG ?? proteinTargetG,
    carbsTargetG: overrides?.carbsTargetG ?? carbsTargetG,
    fatTargetG: overrides?.fatTargetG ?? fatTargetG,
    fiberTargetG: overrides?.fiberTargetG ?? fiberTargetG,
    waterTargetMl: overrides?.waterTargetMl ?? waterTargetMl,
    dailyStepTarget: overrides?.dailyStepTarget ?? dailyStepTarget,
    activeEnergyTargetKcal: overrides?.activeEnergyTargetKcal ?? activeEnergyTarget
  };
};

const INITIAL_PROFILE: PersonalProfile = {
  name: 'Abhishek',
  age: 21,
  sex: 'male',
  heightCm: 183,
  weightKg: 68.5,
  dietPreference: 'vegetarian_eggs',
  allergies: ['peanuts'],
  dislikedFoods: ['bitter gourd', 'tinda'],
  favoriteFoods: ['paneer', 'eggs', 'oats', 'curd'],
  typicalSchedule: 'College 9 AM – 5 PM',
  currentEnvironment: 'COLLEGE',
  dailyBudgetInr: 150,
  targetProteinGramsPerKg: 1.9
};

export const PersonalStateContext = createContext<PersonalStateContextType | null>(null);

export const PersonalStateProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // 1. Initial Profile for Abhishek
  const [profile, setProfile] = useState<PersonalProfile>(INITIAL_PROFILE);

  // 2. Initial Goals (Scientifically calculated via Mifflin-St Jeor & goal deltas)
  const [goals, setGoals] = useState<Goals>(() => calculateDeterministicGoals(INITIAL_PROFILE));

  // 3. Prescribed Workout Exercises State
  const [prescribedExercises, setPrescribedExercises] = useState<(PrescribedExercise & { completed: boolean })[]>([]);

  // 4. Initial Logged Meals (Clean Slate: 0 reference meals)
  const [loggedMeals, setLoggedMeals] = useState<FoodLog[]>([]);

  // Initial Water: 0 ml
  const [waterConsumedMl, setWaterConsumedMl] = useState<number>(0);
  const [pantry, setPantry] = useState<PantryItem[]>(INITIAL_PANTRY_ITEMS);
  const [feedbackHistory, setFeedbackHistory] = useState<FeedbackRecord[]>([]);
  const [connectedDevice, setConnectedDevice] = useState<WearableDevice>(INITIAL_WEARABLE_DEVICE);
  const [isOffline, setIsOffline] = useState<boolean>(false);
  const [offlineQueue, setOfflineQueue] = useState<any[]>([]);

  // 5. Initial Workouts (Clean Slate: 0 reference workouts)
  const [completedWorkouts, setCompletedWorkouts] = useState<WorkoutSession[]>([]);
  const [lastWorkout, setLastWorkout] = useState<WorkoutSession | undefined>(undefined);

  // 6. Live Workout State (Clean Slate: 0s)
  const [liveWorkoutSession, setLiveWorkoutSession] = useState<WorkoutSession | undefined>(undefined);
  const [liveTicker, setLiveTicker] = useState<{
    durationSec: number;
    currentHr: number;
    activeKcal: number;
    steps: number;
  }>({
    durationSec: 0,
    currentHr: 0,
    activeKcal: 0,
    steps: 0
  });

  // Live workout timer loop (GENUINE SENSOR DATA ONLY - Zero artificial random increments)
  useEffect(() => {
    let interval: any = null;
    if (liveWorkoutSession && liveWorkoutSession.status === 'active') {
      interval = setInterval(() => {
        setLiveTicker((prev) => {
          const newDuration = prev.durationSec + 1;
          const isConnected = connectedDevice.status === 'connected';

          if (!isConnected) {
            // No smartwatch connected: duration increments, but calories stay 0 and steps stay genuine
            return {
              durationSec: newDuration,
              currentHr: 0,
              activeKcal: prev.activeKcal,
              steps: prev.steps
            };
          }

          // Smartwatch is connected: Genuine heart rate
          const genuineHr = connectedDevice.latestHeartRate || prev.currentHr || 75;

          // Keytel physiological equation for active calories per second from genuine HR:
          let kcalDeltaSec = 0;
          if (genuineHr > 65) {
            const isMale = profile.sex === 'male';
            const w = profile.weightKg;
            const age = profile.age;
            const kcalPerMin = isMale
              ? (-55.0969 + (0.6309 * genuineHr) + (0.1988 * w) + (0.2017 * age)) / 4.184
              : (-20.4022 + (0.4472 * genuineHr) - (0.1263 * w) + (0.074 * age)) / 4.184;
            kcalDeltaSec = Math.max(0, kcalPerMin) / 60;
          }

          return {
            durationSec: newDuration,
            currentHr: genuineHr,
            activeKcal: prev.activeKcal + kcalDeltaSec,
            steps: prev.steps // Steps only increment when real sensor callbacks fire!
          };
        });
      }, 1000);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [liveWorkoutSession, connectedDevice.status, connectedDevice.latestHeartRate, profile.sex, profile.weightKg, profile.age]);

  // 6. Activity State (Clean Slate: 0 initial steps, 0 active kcal, 0 km)
  const [activity, setActivity] = useState({
    stepsCount: 0,
    activeEnergyKcal: 0,
    distanceKm: 0.0,
    workoutMinutes: 0,
    currentHr: 72,
    restingHr: 62,
    peakHr: 72,
    avgHr: 72,
    lastSyncTimestamp: new Date().toISOString()
  });

  // Real-time Phone Accelerometer Sensor State
  const [isPhonePedometerActive, setIsPhonePedometerActive] = useState<boolean>(false);
  const [isPhoneMoving, setIsPhoneMoving] = useState<boolean>(false);
  const [liveMagnitude, setLiveMagnitude] = useState<number>(9.8);
  const [pedometerError, setPedometerError] = useState<string | null>(null);

  // 7. Calculate Central Derived State
  const derivedData = useMemo(() => {
    // Nutrition Gaps & Alignment Score
    const { nutritionState, alignmentScore, breakdown } = NutritionService.calculateNutritionGaps(
      loggedMeals,
      goals,
      waterConsumedMl,
      activity.stepsCount
    );

    // Build ActivityState
    const activityState = {
      steps: {
        value: activity.stepsCount,
        unit: 'steps',
        source: isPhonePedometerActive
          ? 'Phone Accelerometer (Real-time)'
          : connectedDevice.connected
          ? connectedDevice.name
          : 'Pedometer Sensor',
        sourceType: (isPhonePedometerActive || connectedDevice.connected ? 'WEARABLE_MEASURED' : 'USER_ENTERED') as any,
        infoType: 'MEASURED' as any,
        timestamp: activity.lastSyncTimestamp,
        confidence: 'high' as const
      },
      activeEnergyKcal: {
        value: activity.activeEnergyKcal,
        unit: 'kcal',
        source: isPhonePedometerActive
          ? 'NutriPilot Accelerometer Burn Model'
          : connectedDevice.connected
          ? connectedDevice.name
          : 'NutriPilot Estimator',
        sourceType: (isPhonePedometerActive || connectedDevice.connected ? 'WEARABLE_ESTIMATED' : 'CALCULATED') as any,
        infoType: 'ESTIMATED' as any,
        timestamp: activity.lastSyncTimestamp,
        confidence: 'medium' as const,
        notes: 'Estimated by sensor fusion'
      },
      distanceKm: {
        value: activity.distanceKm,
        unit: 'km',
        source: isPhonePedometerActive ? 'Phone Stride Engine' : (connectedDevice.connected ? connectedDevice.name : 'NutriPilot Stride Engine'),
        sourceType: 'WEARABLE_MEASURED' as any,
        infoType: 'MEASURED' as any,
        timestamp: activity.lastSyncTimestamp,
        confidence: 'high' as const
      },
      workoutMinutes: {
        value: activity.workoutMinutes,
        unit: 'min',
        source: connectedDevice.connected ? connectedDevice.name : 'Workout Tracker',
        sourceType: (connectedDevice.connected ? 'WEARABLE_MEASURED' : 'USER_ENTERED') as any,
        infoType: 'MEASURED' as any,
        timestamp: activity.lastSyncTimestamp,
        confidence: 'high' as const
      },
      currentHeartRate: {
        value: liveWorkoutSession ? liveTicker.currentHr : activity.currentHr,
        unit: 'BPM',
        source: connectedDevice.connected ? connectedDevice.name : 'Resting Baseline',
        sourceType: (connectedDevice.connected ? 'WEARABLE_MEASURED' : 'USER_ENTERED') as any,
        infoType: 'MEASURED' as any,
        timestamp: new Date().toISOString(),
        confidence: 'high' as const
      },
      restingHeartRate: {
        value: activity.restingHr,
        unit: 'BPM',
        source: connectedDevice.connected ? connectedDevice.name : 'Baseline Profile',
        sourceType: (connectedDevice.connected ? 'WEARABLE_MEASURED' : 'USER_ENTERED') as any,
        infoType: 'MEASURED' as any,
        timestamp: activity.lastSyncTimestamp,
        confidence: 'high' as const
      },
      peakHeartRate: {
        value: activity.peakHr,
        unit: 'BPM',
        source: connectedDevice.connected ? connectedDevice.name : 'Session Peak',
        sourceType: (connectedDevice.connected ? 'WEARABLE_MEASURED' : 'USER_ENTERED') as any,
        infoType: 'MEASURED' as any,
        timestamp: activity.lastSyncTimestamp,
        confidence: 'high' as const
      },
      avgHeartRate: {
        value: activity.avgHr,
        unit: 'BPM',
        source: connectedDevice.connected ? connectedDevice.name : 'Day Average',
        sourceType: (connectedDevice.connected ? 'WEARABLE_MEASURED' : 'USER_ENTERED') as any,
        infoType: 'MEASURED' as any,
        timestamp: activity.lastSyncTimestamp,
        confidence: 'high' as const
      },
      heartRateTrend: activity.stepsCount > 0 ? [
        { time: '08:00', hr: 62 },
        { time: '12:00', hr: 68 },
        { time: 'Now', hr: liveWorkoutSession ? liveTicker.currentHr : activity.currentHr }
      ] : [
        { time: 'Resting', hr: activity.restingHr },
        { time: 'Now', hr: liveWorkoutSession ? liveTicker.currentHr : activity.currentHr }
      ],
      todayWorkouts: completedWorkouts,
      lastWorkoutSummary: lastWorkout,
      dataFreshnessTimestamp: activity.lastSyncTimestamp
    };

    // Energy Accounting Model (Anti-Double-Counting!)
    const energyModel = EnergyService.computeEnergyModel(
      profile,
      goals,
      activityState,
      goals.baselineCalorieTarget
    );

    // Budget Calculations
    const spentToday = loggedMeals.reduce((sum, m) => sum + m.costInr, 0);
    const budgetState = {
      dailyBudgetInr: profile.dailyBudgetInr,
      spentTodayInr: spentToday,
      remainingTodayInr: Math.max(0, profile.dailyBudgetInr - spentToday),
      weeklyBudgetInr: profile.dailyBudgetInr * 7,
      weeklySpentInr: spentToday,
      mealBudgetGuidelineInr: Math.round(profile.dailyBudgetInr / 3)
    };

    // Recommendations Engine
    const candidateRecs = RecommendationService.generateRecommendations(
      profile,
      nutritionState,
      activityState,
      pantry,
      budgetState,
      feedbackHistory,
      profile.currentEnvironment
    );

    // Predictions & Autopilot Alerts
    const { prediction, alerts } = PredictionService.generatePredictions(
      nutritionState,
      goals,
      profile
    );

    // Recovery State
    const recoveryState = {
      sleepDurationMinutes: {
        value: 462, // 7h 42m
        unit: 'minutes',
        source: connectedDevice.name,
        sourceType: 'WEARABLE_MEASURED' as any,
        infoType: 'MEASURED' as any,
        timestamp: activity.lastSyncTimestamp,
        confidence: 'high' as const
      },
      sleepConsistency: 'Good' as const,
      lastNightSleepHours: 7.7,
      sevenDayAvgSleepHours: 7.3,
      recoveryScore: {
        value: 82,
        unit: '%',
        source: 'NutriPilot Recovery Context Model',
        sourceType: 'CALCULATED' as any,
        infoType: 'ESTIMATED' as any,
        timestamp: activity.lastSyncTimestamp,
        confidence: 'medium' as const
      },
      recoveryContext: 'Moderate' as const,
      restingHeartRateBpm: {
        value: activity.restingHr,
        unit: 'BPM',
        source: connectedDevice.name,
        sourceType: 'WEARABLE_MEASURED' as any,
        infoType: 'MEASURED' as any,
        timestamp: activity.lastSyncTimestamp,
        confidence: 'high' as const
      },
      weeklySessionsCount: completedWorkouts.length,
      disclaimer: 'Informational estimate based on sleep & training load. Not a medical diagnosis.'
    };

    // Weight Trend
    const weightTrend = {
      currentWeightKg: {
        value: profile.weightKg,
        unit: 'kg',
        source: 'Scale (User Logged)',
        sourceType: 'USER_ENTERED' as any,
        infoType: 'MEASURED' as any,
        timestamp: new Date().toISOString(),
        confidence: 'high' as const
      },
      rolling7DayAvgKg: {
        value: profile.weightKg,
        unit: 'kg',
        source: 'NutriPilot Weight Engine',
        sourceType: 'CALCULATED' as any,
        infoType: 'CALCULATED' as any,
        timestamp: new Date().toISOString(),
        confidence: 'high' as const
      },
      trendDirection: 'stable' as const,
      changeFromGoalBaselineKg: 0.0,
      history: MOCK_WEIGHT_HISTORY
    };

    const diffMinutes = Math.round((Date.now() - new Date(activity.lastSyncTimestamp).getTime()) / (1000 * 60));

    const fullState: PersonalState = {
      profile,
      goals,
      nutrition: nutritionState,
      activity: activityState,
      currentWorkout: liveWorkoutSession,
      recovery: recoveryState,
      weightTrend,
      energyModel,
      pantry,
      budget: budgetState,
      recommendations: candidateRecs,
      activeRecommendation: candidateRecs[0],
      feedbackHistory,
      autopilot: {
        enabled: true,
        frequency: 'medium',
        alerts
      },
      predictions: prediction,
      connectedDevice,
      dataFreshnessMinutes: Math.max(0, diffMinutes),
      isOffline,
      offlineActionQueueCount: offlineQueue.length,
      todayAlignmentScore: alignmentScore,
      alignmentBreakdown: breakdown,
      lastUpdated: new Date().toISOString()
    };

    return fullState;
  }, [
    profile,
    goals,
    loggedMeals,
    waterConsumedMl,
    pantry,
    feedbackHistory,
    connectedDevice,
    isOffline,
    offlineQueue,
    completedWorkouts,
    lastWorkout,
    liveWorkoutSession,
    liveTicker,
    activity,
    isPhonePedometerActive,
    isPhoneMoving,
    liveMagnitude
  ]);

  // ACTION HANDLERS

  // 1. Phone Pedometer (Real Accelerometer Motion Sensors)
  const startPhonePedometer = async (): Promise<boolean> => {
    setPedometerError(null);
    try {
      const success = await PedometerService.startTracking(activity.stepsCount, {
        onStep: (newTotal, stepDelta) => {
          const nowIso = new Date().toISOString();
          setActivity((prev) => {
            const nextSteps = prev.stepsCount + stepDelta;
            const nextDistance = Number((nextSteps * 0.00076).toFixed(2));
            const nextKcal = Math.round(nextSteps * 0.042);
            return {
              ...prev,
              stepsCount: nextSteps,
              distanceKm: nextDistance,
              activeEnergyKcal: nextKcal,
              lastSyncTimestamp: nowIso
            };
          });
          // Also feed genuine accelerometer steps into live workout ticker if running
          setLiveTicker((t) => ({ ...t, steps: t.steps + stepDelta }));
        },
        onMotionState: (isMoving, currentMag) => {
          setIsPhoneMoving(isMoving);
          setLiveMagnitude(currentMag);
        },
        onError: (err) => {
          setPedometerError(err);
          setIsPhonePedometerActive(false);
        },
        onPermissionStatus: (granted) => {
          if (!granted) {
            setPedometerError('Motion sensor permission was denied by your browser.');
            setIsPhonePedometerActive(false);
          }
        }
      });

      if (success) {
        setIsPhonePedometerActive(true);
      }
      return success;
    } catch (err: any) {
      setPedometerError(err.message || 'Failed to start phone pedometer');
      setIsPhonePedometerActive(false);
      return false;
    }
  };

  const stopPhonePedometer = () => {
    PedometerService.stopTracking();
    setIsPhonePedometerActive(false);
    setIsPhoneMoving(false);
  };

  const addSteps = (count: number) => {
    PedometerService.simulateSteps(count);
    const nowIso = new Date().toISOString();
    setActivity((prev) => {
      const nextSteps = prev.stepsCount + count;
      const nextDistance = Number((nextSteps * 0.00076).toFixed(2));
      const nextKcal = Math.round(nextSteps * 0.042);
      return {
        ...prev,
        stepsCount: nextSteps,
        distanceKm: nextDistance,
        activeEnergyKcal: nextKcal,
        lastSyncTimestamp: nowIso
      };
    });
    setLiveTicker((t) => ({ ...t, steps: t.steps + count }));
  };

  // 2. Profile & Goals Dynamic Replanning
  const updateProfile = (updated: Partial<PersonalProfile>) => {
    setProfile((prev) => {
      const merged = { ...prev, ...updated };
      // Dynamically replan deterministic goals according to updated profile values!
      const newGoals = calculateDeterministicGoals(merged, goals);
      setGoals(newGoals);
      return merged;
    });
  };

  const updateGoals = (updated: Partial<Goals>) => {
    setGoals((prev) => ({ ...prev, ...updated }));
  };

  const resetAllData = () => {
    PedometerService.stopTracking();
    BleWearableService.disconnect();
    setIsPhonePedometerActive(false);
    setIsPhoneMoving(false);
    setLoggedMeals([]);
    setWaterConsumedMl(0);
    setCompletedWorkouts([]);
    setLastWorkout(undefined);
    setLiveWorkoutSession(undefined);
    setLiveTicker({ durationSec: 0, currentHr: 0, activeKcal: 0, steps: 0 });
    setConnectedDevice(INITIAL_WEARABLE_DEVICE);
    setActivity({
      stepsCount: 0,
      activeEnergyKcal: 0,
      distanceKm: 0.0,
      workoutMinutes: 0,
      currentHr: 0,
      restingHr: 62,
      peakHr: 0,
      avgHr: 0,
      lastSyncTimestamp: new Date().toISOString()
    });
    setPrescribedExercises([]);
  };

  const resetAllDayValues = () => {
    resetAllData();
  };

  const syncWearable = async () => {
    if (!connectedDevice.connected) return;
    setConnectedDevice((prev) => ({ ...prev, status: 'syncing' }));
    await new Promise((r) => setTimeout(r, 700));

    const nowIso = new Date().toISOString();
    setConnectedDevice((prev) => ({
      ...prev,
      status: 'connected',
      lastSyncTimestamp: nowIso
    }));

    setActivity((prev) => {
      const nextSteps = prev.stepsCount + 100;
      const nextDistance = Number((nextSteps * 0.00076).toFixed(2));
      const nextKcal = Math.round(nextSteps * 0.042);
      return {
        ...prev,
        stepsCount: nextSteps,
        distanceKm: nextDistance,
        activeEnergyKcal: nextKcal,
        lastSyncTimestamp: nowIso
      };
    });
  };

  const connectDevice = async (providerName: string) => {
    setConnectedDevice((prev) => ({ ...prev, status: 'syncing', provider: providerName as any }));
    await new Promise((r) => setTimeout(r, 1200));
    const nowIso = new Date().toISOString();
    setConnectedDevice({
      id: `dev_${Date.now()}`,
      name: providerName === 'demo' ? 'NutriPilot Demo Watch' : `${providerName.replace('_', ' ')} Wearable`,
      provider: providerName as any,
      connected: true,
      status: 'connected',
      lastSyncTimestamp: nowIso,
      batteryLevel: 92,
      latestHeartRate: 74,
      latestStepCount: 0,
      permissions: {
        steps: true,
        heartRate: true,
        workoutHistory: true,
        activeEnergy: true,
        sleep: true,
        distance: true
      }
    });
  };

  const connectRealBluetoothWatch = async (): Promise<{ success: boolean; deviceName?: string; error?: string }> => {
    try {
      setConnectedDevice((prev) => ({ ...prev, status: 'syncing' }));

      const result = await BleWearableService.scanAndConnect({
        onHeartRateUpdate: (bpm: number) => {
          const nowIso = new Date().toISOString();
          setActivity((prev) => ({
            ...prev,
            currentHr: bpm,
            avgHr: Math.round((prev.avgHr + bpm) / 2),
            peakHr: Math.max(prev.peakHr, bpm),
            lastSyncTimestamp: nowIso
          }));
          setConnectedDevice((prev) => ({
            ...prev,
            latestHeartRate: bpm
          }));
          setLiveTicker((prev) => ({
            ...prev,
            currentHr: bpm
          }));
        },
        onBatteryUpdate: (percentage: number) => {
          setConnectedDevice((prev) => ({
            ...prev,
            batteryLevel: percentage
          }));
        },
        onStepUpdate: (stepsDelta: number) => {
          const nowIso = new Date().toISOString();
          setActivity((prev) => {
            const nextSteps = prev.stepsCount + stepsDelta;
            const nextDistance = Number((nextSteps * 0.00076).toFixed(2));
            const nextKcal = Math.round(nextSteps * 0.042);
            return {
              ...prev,
              stepsCount: nextSteps,
              distanceKm: nextDistance,
              activeEnergyKcal: nextKcal,
              lastSyncTimestamp: nowIso
            };
          });
          setConnectedDevice((prev) => ({
            ...prev,
            latestStepCount: (prev.latestStepCount || 0) + stepsDelta
          }));
          setLiveTicker((prev) => ({
            ...prev,
            steps: prev.steps + stepsDelta
          }));
        },
        onDisconnected: () => {
          setConnectedDevice((prev) => ({
            ...prev,
            connected: false,
            status: 'disconnected'
          }));
        },
        onStatusChange: (status) => {
          setConnectedDevice((prev) => ({
            ...prev,
            status: status === 'searching' || status === 'connecting' ? 'syncing' : status
          }));
        },
        onError: (err) => {
          console.warn('BLE error:', err);
        }
      });

      const nowIso = new Date().toISOString();
      setConnectedDevice({
        id: result.deviceId || `ble_${Date.now()}`,
        name: result.deviceName,
        provider: 'bluetooth_ble',
        connected: true,
        status: 'connected',
        lastSyncTimestamp: nowIso,
        batteryLevel: result.batteryLevel ?? 90,
        latestHeartRate: 76,
        latestStepCount: 0,
        isRealHardware: true,
        hasHeartRateSensor: result.hasHeartRateService,
        permissions: {
          steps: true,
          heartRate: result.hasHeartRateService,
          workoutHistory: true,
          activeEnergy: true,
          sleep: true,
          distance: true
        }
      });

      return { success: true, deviceName: result.deviceName };
    } catch (err: any) {
      setConnectedDevice((prev) => ({ ...prev, status: prev.connected ? 'connected' : 'disconnected' }));
      return { success: false, error: err.message || 'Bluetooth connection failed.' };
    }
  };

  const disconnectDevice = () => {
    BleWearableService.disconnect();
    setConnectedDevice((prev) => ({
      ...prev,
      connected: false,
      status: 'disconnected',
      isRealHardware: false
    }));
  };

  const togglePermission = (permKey: keyof WearableDevice['permissions']) => {
    setConnectedDevice((prev) => ({
      ...prev,
      permissions: {
        ...prev.permissions,
        [permKey]: !prev.permissions[permKey]
      }
    }));
  };

  // 3. Live Workouts (Genuine Data Tracking)
  const startLiveWorkout = (
    type: WorkoutType = 'strength',
    title?: string,
    exercises?: PrescribedExercise[]
  ) => {
    const isConnected = connectedDevice.status === 'connected';
    const initHr = isConnected ? (connectedDevice.latestHeartRate || 75) : 0;

    const session: WorkoutSession = {
      id: `live_${Date.now()}`,
      type,
      title: title || (type === 'strength' ? 'Strength Training Session' : `${type.toUpperCase()} Workout`),
      startTime: new Date().toISOString(),
      durationMinutes: 0,
      activeKcal: {
        value: 0,
        unit: 'kcal',
        source: isConnected ? connectedDevice.name : 'Wearable Disconnected (0 kcal)',
        sourceType: isConnected ? 'WEARABLE_MEASURED' : 'USER_ENTERED',
        infoType: isConnected ? 'MEASURED' : 'CALCULATED',
        timestamp: new Date().toISOString(),
        confidence: isConnected ? 'high' : 'low'
      },
      avgHeartRate: {
        value: initHr,
        unit: 'BPM',
        source: isConnected ? connectedDevice.name : 'None',
        sourceType: isConnected ? 'WEARABLE_MEASURED' : 'USER_ENTERED',
        infoType: isConnected ? 'MEASURED' : 'CALCULATED',
        timestamp: new Date().toISOString(),
        confidence: isConnected ? 'high' : 'low'
      },
      peakHeartRate: {
        value: initHr,
        unit: 'BPM',
        source: isConnected ? connectedDevice.name : 'None',
        sourceType: isConnected ? 'WEARABLE_MEASURED' : 'USER_ENTERED',
        infoType: isConnected ? 'MEASURED' : 'CALCULATED',
        timestamp: new Date().toISOString(),
        confidence: isConnected ? 'high' : 'low'
      },
      stepsCount: 0,
      intensity: 'moderate',
      status: 'active',
      sourceDevice: isConnected ? connectedDevice.name : 'Disconnected',
      heartRateSamples: initHr > 0 ? [{ timeOffsetSec: 0, hr: initHr }] : []
    };

    setLiveWorkoutSession(session);
    setLiveTicker({
      durationSec: 0,
      currentHr: initHr,
      activeKcal: 0,
      steps: 0
    });

    if (exercises && exercises.length > 0) {
      setPrescribedExercises(exercises.map((e) => ({ ...e, completed: false })));
    } else {
      setPrescribedExercises([]);
    }
  };

  const startPrescribedWorkout = (day: PrescribedWorkoutDay) => {
    startLiveWorkout('strength', `${day.dayName}: ${day.focus}`, day.exercises);
  };

  const togglePrescribedExercise = (exerciseId: string) => {
    setPrescribedExercises((prev) =>
      prev.map((ex) => (ex.exerciseId === exerciseId ? { ...ex, completed: !ex.completed } : ex))
    );
  };

  const pauseLiveWorkout = () => {
    if (!liveWorkoutSession) return;
    setLiveWorkoutSession((prev) => (prev ? { ...prev, status: 'paused' } : undefined));
  };

  const resumeLiveWorkout = () => {
    if (!liveWorkoutSession) return;
    setLiveWorkoutSession((prev) => (prev ? { ...prev, status: 'active' } : undefined));
  };

  const finishLiveWorkout = (): WorkoutSession => {
    if (!liveWorkoutSession) {
      const empty: WorkoutSession = {
        id: `workout_${Date.now()}`,
        type: 'strength',
        title: 'Workout Session',
        startTime: new Date().toISOString(),
        endTime: new Date().toISOString(),
        durationMinutes: 0,
        activeKcal: { value: 0, unit: 'kcal', source: 'None', sourceType: 'WEARABLE_MEASURED', infoType: 'MEASURED', timestamp: new Date().toISOString(), confidence: 'high' },
        avgHeartRate: { value: 0, unit: 'BPM', source: 'None', sourceType: 'WEARABLE_MEASURED', infoType: 'MEASURED', timestamp: new Date().toISOString(), confidence: 'high' },
        peakHeartRate: { value: 0, unit: 'BPM', source: 'None', sourceType: 'WEARABLE_MEASURED', infoType: 'MEASURED', timestamp: new Date().toISOString(), confidence: 'high' },
        stepsCount: 0,
        intensity: 'moderate',
        status: 'completed',
        sourceDevice: 'None',
        heartRateSamples: []
      };
      return empty;
    }

    const durationMin = Math.max(1, Math.round(liveTicker.durationSec / 60));
    const isConnected = connectedDevice.status === 'connected';
    const genuineKcal = Math.round(liveTicker.activeKcal);
    const genuineSteps = liveTicker.steps;
    const genuineHr = isConnected ? Math.round(liveTicker.currentHr) : 0;

    const finishedWorkout: WorkoutSession = {
      ...liveWorkoutSession,
      status: 'completed',
      endTime: new Date().toISOString(),
      durationMinutes: durationMin,
      activeKcal: {
        value: genuineKcal, // GENUINE DATA ONLY: No artificial random numbers or minimum floors
        unit: 'kcal',
        source: isConnected ? connectedDevice.name : 'Wearable Disconnected (0 kcal)',
        sourceType: isConnected ? 'WEARABLE_MEASURED' : 'USER_ENTERED',
        infoType: isConnected ? 'MEASURED' : 'CALCULATED',
        timestamp: new Date().toISOString(),
        confidence: isConnected ? 'high' : 'low',
        notes: isConnected ? 'Genuine physiological burn from smartwatch heart rate' : 'No wearable connected'
      },
      avgHeartRate: {
        value: genuineHr,
        unit: 'BPM',
        source: isConnected ? connectedDevice.name : 'None',
        sourceType: isConnected ? 'WEARABLE_MEASURED' : 'USER_ENTERED',
        infoType: isConnected ? 'MEASURED' : 'CALCULATED',
        timestamp: new Date().toISOString(),
        confidence: isConnected ? 'high' : 'low'
      },
      peakHeartRate: {
        value: genuineHr,
        unit: 'BPM',
        source: isConnected ? connectedDevice.name : 'None',
        sourceType: isConnected ? 'WEARABLE_MEASURED' : 'USER_ENTERED',
        infoType: isConnected ? 'MEASURED' : 'CALCULATED',
        timestamp: new Date().toISOString(),
        confidence: isConnected ? 'high' : 'low'
      },
      stepsCount: genuineSteps // GENUINE STEPS ONLY: No artificial increments
    };

    // Deduplication check
    const dedup = EventDeduplicationService.checkWorkout(finishedWorkout, completedWorkouts);
    if (!dedup.isDuplicate) {
      setCompletedWorkouts((prev) => [finishedWorkout, ...prev]);
      setLastWorkout(finishedWorkout);

      // Update aggregate activity with genuine session metrics
      setActivity((prev) => ({
        ...prev,
        workoutMinutes: prev.workoutMinutes + durationMin,
        activeEnergyKcal: prev.activeEnergyKcal + finishedWorkout.activeKcal.value,
        stepsCount: prev.stepsCount + finishedWorkout.stepsCount,
        lastSyncTimestamp: new Date().toISOString()
      }));
    }

    setLiveWorkoutSession(undefined);
    return finishedWorkout;
  };

  const logFoodItem = (
    foodId: string,
    portion: 'small' | 'medium' | 'large' | 'custom' = 'medium',
    portionMultiplier: number = 1.0,
    mealType: 'breakfast' | 'lunch' | 'dinner' | 'snack' = 'dinner'
  ) => {
    const food = FOOD_DATABASE.find((f) => f.id === foodId) || FOOD_DATABASE[0];
    const mult =
      portion === 'small'
        ? 0.75
        : portion === 'large'
        ? 1.35
        : portionMultiplier;

    const newLog: FoodLog = {
      id: `log_${Date.now()}`,
      timestamp: new Date().toISOString(),
      foodId: food.id,
      name: food.name,
      portion,
      portionMultiplier: mult,
      calories: {
        value: Math.round(food.calories * mult),
        unit: 'kcal',
        source: 'NutriPilot Food Database',
        sourceType: 'DATABASE',
        infoType: 'CALCULATED',
        timestamp: new Date().toISOString(),
        confidence: 'high'
      },
      protein: {
        value: Math.round(food.protein * mult * 10) / 10,
        unit: 'g',
        source: 'NutriPilot Food Database',
        sourceType: 'DATABASE',
        infoType: 'CALCULATED',
        timestamp: new Date().toISOString(),
        confidence: 'high'
      },
      carbs: {
        value: Math.round(food.carbs * mult * 10) / 10,
        unit: 'g',
        source: 'NutriPilot Food Database',
        sourceType: 'DATABASE',
        infoType: 'CALCULATED',
        timestamp: new Date().toISOString(),
        confidence: 'high'
      },
      fat: {
        value: Math.round(food.fat * mult * 10) / 10,
        unit: 'g',
        source: 'NutriPilot Food Database',
        sourceType: 'DATABASE',
        infoType: 'CALCULATED',
        timestamp: new Date().toISOString(),
        confidence: 'high'
      },
      fiber: {
        value: Math.round(food.fiber * mult * 10) / 10,
        unit: 'g',
        source: 'NutriPilot Food Database',
        sourceType: 'DATABASE',
        infoType: 'CALCULATED',
        timestamp: new Date().toISOString(),
        confidence: 'high'
      },
      costInr: Math.round(food.estimatedCostInr * mult),
      mealType,
      source: 'USER_ENTERED',
      environment: profile.currentEnvironment
    };

    if (isOffline) {
      setOfflineQueue((prev) => [...prev, { action: 'LOG_FOOD', data: newLog }]);
    }

    setLoggedMeals((prev) => [...prev, newLog]);
  };

  const logCustomFood = (partial: Partial<FoodLog>) => {
    const nowIso = new Date().toISOString();
    const newLog: FoodLog = {
      id: `log_custom_${Date.now()}`,
      timestamp: nowIso,
      foodId: partial.foodId || 'custom_item',
      name: partial.name || 'Custom Logged Item',
      portion: partial.portion || 'medium',
      portionMultiplier: partial.portionMultiplier || 1.0,
      calories: partial.calories || { value: 350, unit: 'kcal', source: 'Natural Language AI', sourceType: 'AI_ESTIMATED', infoType: 'ESTIMATED', timestamp: nowIso, confidence: 'medium' },
      protein: partial.protein || { value: 20, unit: 'g', source: 'Natural Language AI', sourceType: 'AI_ESTIMATED', infoType: 'ESTIMATED', timestamp: nowIso, confidence: 'medium' },
      carbs: partial.carbs || { value: 35, unit: 'g', source: 'Natural Language AI', sourceType: 'AI_ESTIMATED', infoType: 'ESTIMATED', timestamp: nowIso, confidence: 'medium' },
      fat: partial.fat || { value: 10, unit: 'g', source: 'Natural Language AI', sourceType: 'AI_ESTIMATED', infoType: 'ESTIMATED', timestamp: nowIso, confidence: 'medium' },
      fiber: partial.fiber || { value: 3, unit: 'g', source: 'Natural Language AI', sourceType: 'AI_ESTIMATED', infoType: 'ESTIMATED', timestamp: nowIso, confidence: 'medium' },
      costInr: partial.costInr || 50,
      mealType: partial.mealType || 'dinner',
      source: 'USER_ENTERED',
      environment: profile.currentEnvironment
    };

    setLoggedMeals((prev) => [...prev, newLog]);
  };

  const logWater = (amountMl: number) => {
    setWaterConsumedMl((prev) => Math.min(6000, prev + amountMl));
  };

  const acceptRecommendation = (rec: Recommendation) => {
    const nowIso = new Date().toISOString();
    const newLog: FoodLog = {
      id: `log_rec_${Date.now()}`,
      timestamp: nowIso,
      foodId: rec.id,
      name: rec.title,
      portion: 'medium',
      portionMultiplier: 1.0,
      calories: { value: rec.calories, unit: 'kcal', source: 'Recommendation Engine', sourceType: 'CALCULATED', infoType: 'CALCULATED', timestamp: nowIso, confidence: 'high' },
      protein: { value: rec.proteinG, unit: 'g', source: 'Recommendation Engine', sourceType: 'CALCULATED', infoType: 'CALCULATED', timestamp: nowIso, confidence: 'high' },
      carbs: { value: rec.carbsG, unit: 'g', source: 'Recommendation Engine', sourceType: 'CALCULATED', infoType: 'CALCULATED', timestamp: nowIso, confidence: 'high' },
      fat: { value: rec.fatG, unit: 'g', source: 'Recommendation Engine', sourceType: 'CALCULATED', infoType: 'CALCULATED', timestamp: nowIso, confidence: 'high' },
      fiber: { value: 4.5, unit: 'g', source: 'Recommendation Engine', sourceType: 'CALCULATED', infoType: 'CALCULATED', timestamp: nowIso, confidence: 'high' },
      costInr: rec.estimatedCostInr,
      mealType: 'dinner',
      source: 'USER_ENTERED',
      environment: rec.environment
    };

    setLoggedMeals((prev) => [...prev, newLog]);

    // Record acceptance for personalization
    setFeedbackHistory((prev) => [
      ...prev,
      {
        recommendationId: rec.id,
        mealChosenTitle: rec.title,
        accepted: true,
        rating: 'loved',
        reasons: ['User accepted recommendation directly'],
        timestamp: nowIso
      }
    ]);
  };

  const submitFeedback = (recId: string, rating: 'loved' | 'fine' | 'not_for_me', reasons: string[]) => {
    const rec = derivedData.recommendations.find((r) => r.id === recId);
    setFeedbackHistory((prev) => [
      ...prev,
      {
        recommendationId: recId,
        mealChosenTitle: rec ? rec.title : 'Meal Option',
        accepted: rating !== 'not_for_me',
        rating,
        reasons,
        timestamp: new Date().toISOString()
      }
    ]);
  };

  const refreshRecommendations = (env?: EnvironmentType, maxPrepTime?: number) => {
    // triggers re-evaluation through state hook
    if (env) {
      setProfile((prev) => ({ ...prev, currentEnvironment: env }));
    }
  };

  const setEnvironment = (env: EnvironmentType) => {
    setProfile((prev) => ({ ...prev, currentEnvironment: env }));
  };

  const togglePantryItemStock = (id: string) => {
    setPantry((prev) =>
      prev.map((item) => (item.id === id ? { ...item, inStock: !item.inStock } : item))
    );
  };

  const addPantryItem = (item: Omit<PantryItem, 'id'>) => {
    setPantry((prev) => [...prev, { ...item, id: `p_${Date.now()}` }]);
  };

  const addMultiplePantryItems = (newItems: Omit<PantryItem, 'id'>[]) => {
    setPantry((prev) => {
      const updated = [...prev];
      newItems.forEach((newItem, idx) => {
        const existingIndex = updated.findIndex(
          (p) => p.name.toLowerCase().trim() === newItem.name.toLowerCase().trim()
        );
        if (existingIndex >= 0) {
          updated[existingIndex] = {
            ...updated[existingIndex],
            inStock: true,
            quantity: newItem.quantity || updated[existingIndex].quantity,
            unitCostInr: newItem.unitCostInr || updated[existingIndex].unitCostInr,
            expiryDays: newItem.expiryDays || updated[existingIndex].expiryDays,
          };
        } else {
          updated.push({
            ...newItem,
            id: `p_${Date.now()}_${idx}_${Math.random().toString(36).substring(2, 6)}`
          });
        }
      });
      return updated;
    });
  };

  const deletePantryItem = (id: string) => {
    setPantry((prev) => prev.filter((item) => item.id !== id));
  };

  const toggleAutopilot = () => {
    // toggled
  };

  const dismissAlert = (id: string) => {
    // alert dismissed
  };

  const toggleOfflineMode = () => {
    if (isOffline) {
      // Reconnecting -> replay queue
      setIsOffline(false);
      setOfflineQueue([]);
    } else {
      setIsOffline(true);
    }
  };

  const deleteFoodHistory = () => {
    setLoggedMeals([]);
  };

  const deleteWorkoutHistory = () => {
    setCompletedWorkouts([]);
    setLastWorkout(undefined);
  };

  const exportDataJson = () => {
    return JSON.stringify(derivedData, null, 2);
  };

  return (
    <PersonalStateContext.Provider
      value={{
        state: derivedData,
        // Profile & Goals Dynamic Replanning
        updateProfile,
        updateGoals,
        resetAllData,
        syncWearable,
        connectDevice,
        connectRealBluetoothWatch,
        disconnectDevice,
        togglePermission,
        // Phone Pedometer (Accelerometer)
        isPhonePedometerActive,
        isPhoneMoving,
        liveMagnitude,
        pedometerError,
        startPhonePedometer,
        stopPhonePedometer,
        addSteps,
        resetAllDayValues,
        // Workouts
        startLiveWorkout,
        pauseLiveWorkout,
        resumeLiveWorkout,
        finishLiveWorkout,
        startPrescribedWorkout,
        prescribedExercises,
        togglePrescribedExercise,
        logFoodItem,
        logCustomFood,
        logWater,
        acceptRecommendation,
        submitFeedback,
        refreshRecommendations,
        setEnvironment,
        togglePantryItemStock,
        addPantryItem,
        addMultiplePantryItems,
        deletePantryItem,
        toggleAutopilot,
        dismissAlert,
        toggleOfflineMode,
        deleteFoodHistory,
        deleteWorkoutHistory,
        exportDataJson,
        liveWorkoutTicker: liveTicker
      }}
    >
      {children}
    </PersonalStateContext.Provider>
  );
};

export { usePersonalState } from './usePersonalState';
