import {
  WearableDevice,
  WorkoutSession,
  WorkoutType,
  DataPoint
} from '../types';

export interface WearableSyncResult {
  steps: number;
  activeKcal: number;
  distanceKm: number;
  currentHr: number;
  restingHr: number;
  sleepMinutes: number;
  lastWorkout?: WorkoutSession;
  syncTimestamp: string;
}

export interface WearableProvider {
  id: string;
  name: string;
  connect(): Promise<boolean>;
  disconnect(): Promise<boolean>;
  syncData(): Promise<WearableSyncResult>;
  getStatus(): 'connected' | 'disconnected' | 'syncing' | 'error';
}

export class DemoWearableProvider implements WearableProvider {
  public id = 'demo_provider';
  public name = 'NutriPilot Demo Watch';
  private status: 'connected' | 'disconnected' | 'syncing' | 'error' = 'connected';

  public async connect(): Promise<boolean> {
    this.status = 'syncing';
    await new Promise((resolve) => setTimeout(resolve, 800));
    this.status = 'connected';
    return true;
  }

  public async disconnect(): Promise<boolean> {
    this.status = 'disconnected';
    return true;
  }

  public getStatus(): 'connected' | 'disconnected' | 'syncing' | 'error' {
    return this.status;
  }

  public async syncData(): Promise<WearableSyncResult> {
    this.status = 'syncing';
    await new Promise((resolve) => setTimeout(resolve, 600));
    this.status = 'connected';

    const now = new Date();
    return {
      steps: 8642,
      activeKcal: 486,
      distanceKm: 6.4,
      currentHr: 72,
      restingHr: 62,
      sleepMinutes: 462, // 7h 42m
      syncTimestamp: now.toISOString()
    };
  }

  /**
   * Generates a realistic simulated completed workout session
   */
  public static createSampleWorkout(type: WorkoutType = 'strength', durationMin: number = 47): WorkoutSession {
    const now = new Date();
    const startTime = new Date(now.getTime() - durationMin * 60 * 1000).toISOString();

    const makeDp = <T>(val: T, unit: string): DataPoint<T> => ({
      value: val,
      unit,
      source: 'NutriPilot Demo Watch',
      sourceType: 'WEARABLE_ESTIMATED',
      infoType: 'ESTIMATED',
      timestamp: now.toISOString(),
      confidence: 'medium',
      notes: 'Demo wearable simulated session'
    });

    return {
      id: `w_${Date.now()}`,
      type,
      title: type === 'strength' ? 'Strength Training (Chest & Triceps)' : 'High Intensity Cardio',
      startTime,
      endTime: now.toISOString(),
      durationMinutes: durationMin,
      activeKcal: makeDp(286, 'kcal'),
      avgHeartRate: makeDp(136, 'BPM'),
      peakHeartRate: makeDp(158, 'BPM'),
      currentHeartRate: 74,
      stepsCount: 1420,
      intensity: 'moderate',
      status: 'completed',
      sourceDevice: 'NutriPilot Demo Watch',
      heartRateSamples: [
        { timeOffsetSec: 0, hr: 88 },
        { timeOffsetSec: 300, hr: 118 },
        { timeOffsetSec: 600, hr: 135 },
        { timeOffsetSec: 1200, hr: 144 },
        { timeOffsetSec: 1800, hr: 152 },
        { timeOffsetSec: 2400, hr: 158 },
        { timeOffsetSec: 2820, hr: 124 }
      ],
      exerciseDetails: [
        { exercise: 'Barbell Bench Press', sets: 4, reps: 8, weightKg: 65 },
        { exercise: 'Incline Dumbbell Press', sets: 3, reps: 10, weightKg: 22 },
        { exercise: 'Cable Chest Flyes', sets: 3, reps: 12, weightKg: 15 },
        { exercise: 'Tricep Rope Pushdowns', sets: 3, reps: 12, weightKg: 20 }
      ]
    };
  }
}

export const INITIAL_WEARABLE_DEVICE: WearableDevice = {
  id: 'device_standby',
  name: 'No Wearable Connected',
  provider: 'demo',
  connected: false,
  status: 'disconnected',
  lastSyncTimestamp: new Date().toISOString(),
  batteryLevel: 0,
  permissions: {
    steps: true,
    heartRate: true,
    workoutHistory: true,
    activeEnergy: true,
    sleep: true,
    distance: true
  }
};
