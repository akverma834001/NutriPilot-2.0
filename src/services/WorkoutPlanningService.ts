// Workout Planning Model for NutriPilot 2.0
// Grounded in ACSM (American College of Sports Medicine) and NSCA (National Strength & Conditioning Association)
// Periodization Principles: Progressive Overload, Volume Thresholds (10-14 sets/muscle/week), Recovery Fatigue Regulation

import { PersonalProfile, Goals } from '../types';
import { EXERCISE_DATASET, ExerciseItem } from '../data/exerciseDataset';

export interface PrescribedExercise {
  exerciseId: string;
  name: string;
  targetMuscle: string;
  equipment: string;
  sets: number;
  reps: string;
  recommendedRpe: number;
  restSeconds: number;
  tempo: string; // e.g. '3-0-1-0' (3s eccentric)
  techniqueCue: string;
}

export interface PrescribedWorkoutDay {
  dayNumber: number;
  dayName: string;
  focus: string;
  estimatedDurationMin: number;
  targetMuscles: string[];
  exercises: PrescribedExercise[];
  cardioFinisher?: {
    name: string;
    durationMin: number;
    targetZone: string;
    protocol: string;
  };
}

export interface WorkoutPlanContext {
  availableDaysPerWeek: 2 | 3 | 4 | 5 | 6;
  equipment: 'full_gym' | 'dumbbells_only' | 'bodyweight_only';
  sessionDurationMinutes: 30 | 45 | 60 | 75;
  experienceLevel: 'beginner' | 'intermediate' | 'advanced';
  currentRecoveryScore?: number;
}

export interface GeneratedWorkoutPlan {
  id: string;
  title: string;
  subtitle: string;
  splitType: string;
  goal: string;
  currentSituationSummary: string;
  desiredResultSummary: string;
  projectedWeeksToGoal: number;
  weeklyVolumeBreakdown: { muscleGroup: string; weeklySets: number }[];
  scientificRationale: string[];
  fatigueDeloadApplied: boolean;
  schedule: PrescribedWorkoutDay[];
}

export class WorkoutPlanningService {
  /**
   * Generates tailored, periodized workout plan from the person's current situation to their desired result
   */
  public static generatePlan(
    profile: PersonalProfile,
    goals: Goals,
    context: WorkoutPlanContext
  ): GeneratedWorkoutPlan {
    const { availableDaysPerWeek, equipment, sessionDurationMinutes, experienceLevel, currentRecoveryScore = 80 } = context;
    const isFatLoss = goals.primaryGoal === 'fat_loss';
    const isMuscleGain = goals.primaryGoal === 'muscle_gain';
    const isPerformance = goals.primaryGoal === 'athletic_performance';

    // Calculate weight delta to goal
    const weightDelta = Math.round((goals.targetWeightKg - profile.weightKg) * 10) / 10;
    let projectedWeeks = 8;
    if (isMuscleGain && weightDelta > 0) {
      projectedWeeks = Math.max(4, Math.round(weightDelta / 0.3)); // ~0.3kg/week lean gain
    } else if (isFatLoss && weightDelta < 0) {
      projectedWeeks = Math.max(4, Math.round(Math.abs(weightDelta) / 0.55)); // ~0.55kg/week fat loss
    }

    // Fatigue regulation rule (Requirement: Grounded in Recovery Telemetry)
    const isHighFatigue = currentRecoveryScore < 55;

    // Filter exercises by user's available equipment
    const filterByEquipment = (items: ExerciseItem[]): ExerciseItem[] => {
      if (equipment === 'full_gym') return items;
      if (equipment === 'dumbbells_only') {
        return items.filter((e) => e.equipment === 'dumbbell' || e.equipment === 'bodyweight');
      }
      return items.filter((e) => e.equipment === 'bodyweight');
    };

    const eligible = filterByEquipment(EXERCISE_DATASET);

    const findEx = (id: string, fallbackId: string): ExerciseItem => {
      return eligible.find((e) => e.id === id) || eligible.find((e) => e.id === fallbackId) || eligible[0];
    };

    // Determine Set/Rep Architecture
    const getSetRepScheme = (isCompound: boolean) => {
      let sets = isCompound ? 4 : 3;
      if (sessionDurationMinutes <= 30) sets = Math.max(2, sets - 1);
      if (isHighFatigue) sets = Math.max(2, sets - 1); // 25-30% volume reduction for deload

      if (isMuscleGain) {
        return {
          sets,
          reps: isCompound ? '6–10 reps' : '10–12 reps',
          rpe: isHighFatigue ? 6.5 : (isCompound ? 8 : 8.5),
          restSeconds: isCompound ? 120 : 75,
          tempo: '3-0-1-0'
        };
      } else if (isFatLoss) {
        return {
          sets,
          reps: isCompound ? '10–12 reps' : '12–15 reps',
          rpe: isHighFatigue ? 6.5 : 7.5,
          restSeconds: isCompound ? 90 : 60,
          tempo: '2-0-1-0'
        };
      } else if (isPerformance) {
        return {
          sets: sets + 1,
          reps: isCompound ? '4–6 reps' : '8–10 reps',
          rpe: isHighFatigue ? 7 : 9,
          restSeconds: isCompound ? 180 : 90,
          tempo: '2-1-X-0'
        };
      } else {
        return {
          sets,
          reps: '15–20 reps',
          rpe: 7,
          restSeconds: 45,
          tempo: '2-0-1-0'
        };
      }
    };

    const makePrescribedExercise = (item: ExerciseItem): PrescribedExercise => {
      const scheme = getSetRepScheme(item.type === 'compound');
      return {
        exerciseId: item.id,
        name: item.name,
        targetMuscle: item.targetMuscle,
        equipment: item.equipment,
        sets: scheme.sets,
        reps: scheme.reps,
        recommendedRpe: scheme.rpe,
        restSeconds: scheme.restSeconds,
        tempo: scheme.tempo,
        techniqueCue: item.instructions
      };
    };

    // Build Days based on Available Days Split
    const schedule: PrescribedWorkoutDay[] = [];

    if (availableDaysPerWeek === 3) {
      // 3-Day Full Body Hypertrophy Routine
      schedule.push({
        dayNumber: 1,
        dayName: 'Day 1: Full Body A (Quad & Horizontal Push/Pull)',
        focus: 'Chest, Upper Back, Quadriceps',
        estimatedDurationMin: sessionDurationMinutes,
        targetMuscles: ['Chest', 'Back', 'Quads', 'Triceps'],
        exercises: [
          findEx('ex_bb_bench_press', 'ex_pushups'),
          findEx('ex_barbell_bent_row', 'ex_seated_cable_row'),
          findEx('ex_barbell_squat', 'ex_bulgarian_split_squat'),
          findEx('ex_tricep_rope_pushdown', 'ex_pushups')
        ].map(makePrescribedExercise),
        cardioFinisher: isFatLoss ? {
          name: 'Incline Treadmill Walk',
          durationMin: 15,
          targetZone: 'Zone 2 (120–135 BPM)',
          protocol: '10% Incline at 4.8 km/h. Keep conversational pace.'
        } : undefined
      });

      schedule.push({
        dayNumber: 2,
        dayName: 'Day 2: Full Body B (Posterior Chain & Vertical Mechanics)',
        focus: 'Hamstrings, Glutes, Lats, Shoulders',
        estimatedDurationMin: sessionDurationMinutes,
        targetMuscles: ['Hamstrings', 'Lats', 'Shoulders', 'Biceps'],
        exercises: [
          findEx('ex_pullups', 'ex_lat_pulldown'),
          findEx('ex_overhead_press', 'ex_arnold_press'),
          findEx('ex_romanian_deadlift', 'ex_bulgarian_split_squat'),
          findEx('ex_barbell_curl', 'ex_hammer_curl')
        ].map(makePrescribedExercise),
        cardioFinisher: isFatLoss ? {
          name: 'Rowing Machine Conditioning',
          durationMin: 12,
          targetZone: 'Zone 3 Aerobic Interval',
          protocol: '1 min moderate pace / 30s brisk sprint x 8 rounds.'
        } : undefined
      });

      schedule.push({
        dayNumber: 3,
        dayName: 'Day 3: Full Body C (Hypertrophy & Core Isolation)',
        focus: 'Chest Incline, Back Thickness, Glutes, Core',
        estimatedDurationMin: sessionDurationMinutes,
        targetMuscles: ['Upper Chest', 'Mid Back', 'Glutes', 'Abs'],
        exercises: [
          findEx('ex_db_incline_press', 'ex_pushups'),
          findEx('ex_seated_cable_row', 'ex_pullups'),
          findEx('ex_bulgarian_split_squat', 'ex_barbell_squat'),
          findEx('ex_hanging_leg_raise', 'ex_ab_wheel_rollout')
        ].map(makePrescribedExercise)
      });
    } else if (availableDaysPerWeek === 4) {
      // 4-Day Upper / Lower Periodization (Gold Standard for Recomp/Muscle Gain)
      schedule.push({
        dayNumber: 1,
        dayName: 'Day 1: Upper Body Power & Chest Hypertrophy',
        focus: 'Chest, Back, Shoulders, Triceps',
        estimatedDurationMin: sessionDurationMinutes,
        targetMuscles: ['Pectorals', 'Lats', 'Deltoids', 'Triceps'],
        exercises: [
          findEx('ex_bb_bench_press', 'ex_pushups'),
          findEx('ex_pullups', 'ex_lat_pulldown'),
          findEx('ex_overhead_press', 'ex_arnold_press'),
          findEx('ex_cable_crossover', 'ex_pushups'),
          findEx('ex_tricep_rope_pushdown', 'ex_pushups')
        ].map(makePrescribedExercise),
        cardioFinisher: isFatLoss ? {
          name: 'Incline Treadmill Strides',
          durationMin: 15,
          targetZone: 'Zone 2 (120-135 BPM)',
          protocol: 'Steady state fat oxidation walk.'
        } : undefined
      });

      schedule.push({
        dayNumber: 2,
        dayName: 'Day 2: Lower Body Quad & Core Dominant',
        focus: 'Quadriceps, Adductors, Calves, Core',
        estimatedDurationMin: sessionDurationMinutes,
        targetMuscles: ['Quads', 'Glutes', 'Calves', 'Abs'],
        exercises: [
          findEx('ex_barbell_squat', 'ex_bulgarian_split_squat'),
          findEx('ex_leg_press', 'ex_bulgarian_split_squat'),
          findEx('ex_standing_calf_raise', 'ex_standing_calf_raise'),
          findEx('ex_hanging_leg_raise', 'ex_ab_wheel_rollout')
        ].map(makePrescribedExercise)
      });

      schedule.push({
        dayNumber: 3,
        dayName: 'Day 3: Upper Body Hypertrophy & Back Density',
        focus: 'Upper Chest, Mid-Back, Lateral Delts, Biceps',
        estimatedDurationMin: sessionDurationMinutes,
        targetMuscles: ['Back', 'Upper Chest', 'Side Delts', 'Arms'],
        exercises: [
          findEx('ex_db_incline_press', 'ex_pushups'),
          findEx('ex_barbell_bent_row', 'ex_seated_cable_row'),
          findEx('ex_db_lateral_raise', 'ex_db_lateral_raise'),
          findEx('ex_barbell_curl', 'ex_hammer_curl'),
          findEx('ex_face_pulls', 'ex_rear_delt_flyes')
        ].map(makePrescribedExercise),
        cardioFinisher: isFatLoss ? {
          name: 'Rowing Intervals',
          durationMin: 12,
          targetZone: 'Zone 3 Cardio',
          protocol: '30s hard / 60s cruise.'
        } : undefined
      });

      schedule.push({
        dayNumber: 4,
        dayName: 'Day 4: Lower Body Posterior Chain & Hamstrings',
        focus: 'Hamstrings, Glute Max, Core Stabilizers',
        estimatedDurationMin: sessionDurationMinutes,
        targetMuscles: ['Hamstrings', 'Glutes', 'Erectors', 'Abs'],
        exercises: [
          findEx('ex_romanian_deadlift', 'ex_bulgarian_split_squat'),
          findEx('ex_bulgarian_split_squat', 'ex_barbell_squat'),
          findEx('ex_lying_leg_curl', 'ex_romanian_deadlift'),
          findEx('ex_ab_wheel_rollout', 'ex_hanging_leg_raise')
        ].map(makePrescribedExercise)
      });
    } else {
      // 5 or 6 Days: Push / Pull / Legs (PPL) Split
      schedule.push({
        dayNumber: 1,
        dayName: 'Day 1: Push A (Chest, Shoulders, Triceps)',
        focus: 'Horizontal & Incline Pressing, Triceps',
        estimatedDurationMin: sessionDurationMinutes,
        targetMuscles: ['Chest', 'Shoulders', 'Triceps'],
        exercises: [
          findEx('ex_bb_bench_press', 'ex_pushups'),
          findEx('ex_db_incline_press', 'ex_pushups'),
          findEx('ex_db_lateral_raise', 'ex_db_lateral_raise'),
          findEx('ex_tricep_rope_pushdown', 'ex_pushups')
        ].map(makePrescribedExercise)
      });

      schedule.push({
        dayNumber: 2,
        dayName: 'Day 2: Pull A (Back Width, Traps, Biceps)',
        focus: 'Vertical Pulling, Rows, Posterior Deltoid',
        estimatedDurationMin: sessionDurationMinutes,
        targetMuscles: ['Lats', 'Upper Back', 'Biceps', 'Rear Delts'],
        exercises: [
          findEx('ex_pullups', 'ex_lat_pulldown'),
          findEx('ex_barbell_bent_row', 'ex_seated_cable_row'),
          findEx('ex_face_pulls', 'ex_rear_delt_flyes'),
          findEx('ex_barbell_curl', 'ex_hammer_curl')
        ].map(makePrescribedExercise)
      });

      schedule.push({
        dayNumber: 3,
        dayName: 'Day 3: Legs A (Squat Dominant, Quads & Calves)',
        focus: 'Quadriceps, Adductors, Gastrocnemius',
        estimatedDurationMin: sessionDurationMinutes,
        targetMuscles: ['Quads', 'Glutes', 'Calves', 'Abs'],
        exercises: [
          findEx('ex_barbell_squat', 'ex_bulgarian_split_squat'),
          findEx('ex_leg_press', 'ex_bulgarian_split_squat'),
          findEx('ex_lying_leg_curl', 'ex_romanian_deadlift'),
          findEx('ex_standing_calf_raise', 'ex_standing_calf_raise')
        ].map(makePrescribedExercise)
      });

      schedule.push({
        dayNumber: 4,
        dayName: 'Day 4: Push B / Upper Volume (Shoulder & Tricep Focus)',
        focus: 'Overhead Pressing, Upper Chest, Long-head Triceps',
        estimatedDurationMin: sessionDurationMinutes,
        targetMuscles: ['Shoulders', 'Chest', 'Triceps'],
        exercises: [
          findEx('ex_overhead_press', 'ex_arnold_press'),
          findEx('ex_cable_crossover', 'ex_pushups'),
          findEx('ex_skull_crushers', 'ex_tricep_rope_pushdown'),
          findEx('ex_db_lateral_raise', 'ex_db_lateral_raise')
        ].map(makePrescribedExercise)
      });

      schedule.push({
        dayNumber: 5,
        dayName: 'Day 5: Pull B & Posterior Chain (Deadlift & Arm Hypertrophy)',
        focus: 'Erectors, Lats, Brachialis, Core',
        estimatedDurationMin: sessionDurationMinutes,
        targetMuscles: ['Hamstrings', 'Lats', 'Biceps', 'Core'],
        exercises: [
          findEx('ex_romanian_deadlift', 'ex_bulgarian_split_squat'),
          findEx('ex_seated_cable_row', 'ex_pullups'),
          findEx('ex_incline_db_curl', 'ex_hammer_curl'),
          findEx('ex_hanging_leg_raise', 'ex_ab_wheel_rollout')
        ].map(makePrescribedExercise)
      });
    }

    // Weekly Volume Accounting
    const volumeMap: Record<string, number> = {
      Chest: 0,
      Back: 0,
      Shoulders: 0,
      Quadriceps: 0,
      Hamstrings: 0,
      Arms: 0,
      Core: 0
    };

    schedule.forEach((day) => {
      day.exercises.forEach((ex) => {
        const t = ex.targetMuscle.toLowerCase();
        if (t.includes('pect') || t.includes('chest')) volumeMap['Chest'] += ex.sets;
        else if (t.includes('lat') || t.includes('back') || t.includes('rhomboid')) volumeMap['Back'] += ex.sets;
        else if (t.includes('delt') || t.includes('shoulder')) volumeMap['Shoulders'] += ex.sets;
        else if (t.includes('quad')) volumeMap['Quadriceps'] += ex.sets;
        else if (t.includes('hamstring') || t.includes('glute') || t.includes('chain')) volumeMap['Hamstrings'] += ex.sets;
        else if (t.includes('bicep') || t.includes('tricep') || t.includes('brach')) volumeMap['Arms'] += ex.sets;
        else if (t.includes('ab') || t.includes('core')) volumeMap['Core'] += ex.sets;
      });
    });

    const weeklyVolumeBreakdown = Object.entries(volumeMap)
      .filter(([_, sets]) => sets > 0)
      .map(([muscleGroup, weeklySets]) => ({ muscleGroup, weeklySets }));

    const scientificRationale = [
      `Grounded in ACSM/NSCA guidelines recommending ≥10 weekly sets per muscle group for hypertrophy.`,
      `Exercises ordered from high CNS-demanding multi-joint compounds to lower-fatigue isolation.`,
      `Prescribed RPE (7.5–9) leaves 1–2 reps in reserve to optimize stimulus-to-fatigue ratio without excessive systemic exhaustion.`,
      isFatLoss
        ? `Preserved resistance training intensity to signal lean muscle retention during caloric deficit; paired with low-impact Zone 2 conditioning.`
        : `Targeted 3-second eccentric tempo to maximize mechanical tension and mTOR activation for lean hypertrophy.`
    ];

    if (isHighFatigue) {
      scientificRationale.push(
        `Automated Autopilot Deload: Current physiological recovery (${currentRecoveryScore}%) triggered a 25% set volume reduction to protect tendons and prevent overreaching.`
      );
    }

    return {
      id: `plan_${profile.name.toLowerCase()}_${Date.now()}`,
      title: `${availableDaysPerWeek}-Day ${isMuscleGain ? 'Hypertrophy & Lean Mass' : isFatLoss ? 'Metabolic Shred & Muscle Retention' : 'Strength & Athletic Recomp'} Split`,
      subtitle: `Scientifically tailored for ${profile.name} (${profile.age}y, ${profile.weightKg} kg → Goal: ${goals.targetWeightKg} kg)`,
      splitType: `${availableDaysPerWeek}-Day ${availableDaysPerWeek === 4 ? 'Upper/Lower' : availableDaysPerWeek === 3 ? 'Full Body' : 'PPL'}`,
      goal: goals.primaryGoal,
      currentSituationSummary: `${profile.weightKg} kg, ${profile.heightCm} cm (${profile.sex}), ${experienceLevel} level, ${equipment.replace('_', ' ')} equipment`,
      desiredResultSummary: `${goals.targetWeightKg} kg ${isMuscleGain ? 'Lean Muscle Mass' : isFatLoss ? 'Cut & Definition' : 'Performance Target'} (${weightDelta >= 0 ? '+' : ''}${weightDelta} kg)`,
      projectedWeeksToGoal: projectedWeeks,
      weeklyVolumeBreakdown,
      scientificRationale,
      fatigueDeloadApplied: isHighFatigue,
      schedule
    };
  }
}
