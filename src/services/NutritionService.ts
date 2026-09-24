import {
  NutritionState,
  FoodLog,
  Goals,
  DataPoint,
  InformationType,
  SourceType
} from '../types';

export class NutritionService {
  /**
   * Recalculates nutrition state, remaining macro gaps, and transparent alignment score
   */
  public static calculateNutritionGaps(
    logs: FoodLog[],
    goals: Goals,
    waterConsumedMl: number = 0,
    stepsConsumed: number = 0
  ): {
    nutritionState: NutritionState;
    alignmentScore: number;
    breakdown: { metric: string; score: number; weight: number; comment: string }[];
  } {
    const nowIso = new Date().toISOString();

    let cal = 0;
    let prot = 0;
    let carb = 0;
    let fat = 0;
    let fib = 0;

    for (const log of logs) {
      cal += log.calories.value;
      prot += log.protein.value;
      carb += log.carbs.value;
      fat += log.fat.value;
      fib += log.fiber.value;
    }

    cal = Math.round(cal);
    prot = Math.round(prot * 10) / 10;
    carb = Math.round(carb * 10) / 10;
    fat = Math.round(fat * 10) / 10;
    fib = Math.round(fib * 10) / 10;

    const calRemaining = Math.max(0, Math.round(goals.baselineCalorieTarget - cal));
    const protRemaining = Math.max(0, Math.round((goals.proteinTargetG - prot) * 10) / 10);
    const carbRemaining = Math.max(0, Math.round((goals.carbsTargetG - carb) * 10) / 10);
    const fatRemaining = Math.max(0, Math.round((goals.fatTargetG - fat) * 10) / 10);
    const fibRemaining = Math.max(0, Math.round((goals.fiberTargetG - fib) * 10) / 10);
    const waterRemaining = Math.max(0, goals.waterTargetMl - waterConsumedMl);

    const makeDp = <T>(
      val: T,
      unit: string,
      source: string,
      sourceType: SourceType,
      infoType: InformationType
    ): DataPoint<T> => ({
      value: val,
      unit,
      source,
      sourceType,
      infoType,
      timestamp: nowIso,
      confidence: 'high'
    });

    const nutritionState: NutritionState = {
      caloriesConsumed: makeDp(cal, 'kcal', 'Food Logs Aggregation', 'CALCULATED', 'CALCULATED'),
      proteinConsumed: makeDp(prot, 'g', 'Food Logs Aggregation', 'CALCULATED', 'CALCULATED'),
      carbsConsumed: makeDp(carb, 'g', 'Food Logs Aggregation', 'CALCULATED', 'CALCULATED'),
      fatConsumed: makeDp(fat, 'g', 'Food Logs Aggregation', 'CALCULATED', 'CALCULATED'),
      fiberConsumed: makeDp(fib, 'g', 'Food Logs Aggregation', 'CALCULATED', 'CALCULATED'),
      waterConsumedMl: makeDp(waterConsumedMl, 'ml', 'Hydration Tracker', 'USER_ENTERED', 'MEASURED'),
      caloriesRemaining: makeDp(calRemaining, 'kcal', 'Macro Gap Engine', 'CALCULATED', 'CALCULATED'),
      proteinRemaining: makeDp(protRemaining, 'g', 'Macro Gap Engine', 'CALCULATED', 'CALCULATED'),
      carbsRemaining: makeDp(carbRemaining, 'g', 'Macro Gap Engine', 'CALCULATED', 'CALCULATED'),
      fatRemaining: makeDp(fatRemaining, 'g', 'Macro Gap Engine', 'CALCULATED', 'CALCULATED'),
      fiberRemaining: makeDp(fibRemaining, 'g', 'Macro Gap Engine', 'CALCULATED', 'CALCULATED'),
      waterRemainingMl: makeDp(waterRemaining, 'ml', 'Hydration Gap Engine', 'CALCULATED', 'CALCULATED'),
      loggedMeals: logs
    };

    // Calculate transparent alignment score based on defined weights
    // Protein (35%), Calories (30%), Steps (15%), Hydration (10%), Fiber (10%)
    const proteinRatio = Math.min(1.15, prot / goals.proteinTargetG);
    const proteinScore = Math.round(Math.min(100, (proteinRatio > 1 ? 100 - (proteinRatio - 1) * 30 : proteinRatio * 100)));

    const calorieRatio = cal / goals.baselineCalorieTarget;
    const calorieScore = Math.round(Math.min(100, Math.max(0, 100 - Math.abs(1 - calorieRatio) * 100)));

    const stepRatio = Math.min(1.2, stepsConsumed / goals.dailyStepTarget);
    const stepScore = Math.round(Math.min(100, stepRatio * 100));

    const waterRatio = Math.min(1.1, waterConsumedMl / goals.waterTargetMl);
    const waterScore = Math.round(Math.min(100, waterRatio * 100));

    const fiberRatio = Math.min(1.2, fib / goals.fiberTargetG);
    const fiberScore = Math.round(Math.min(100, fiberRatio * 100));

    const weightedScore = Math.round(
      proteinScore * 0.35 +
      calorieScore * 0.30 +
      stepScore * 0.15 +
      waterScore * 0.10 +
      fiberScore * 0.10
    );

    const breakdown = [
      {
        metric: 'Protein Adherence',
        score: proteinScore,
        weight: 35,
        comment: `${prot}g / ${goals.proteinTargetG}g target (${protRemaining > 0 ? `${protRemaining}g remaining` : 'Target met!'})`
      },
      {
        metric: 'Caloric Pacing',
        score: calorieScore,
        weight: 30,
        comment: `${cal} / ${goals.baselineCalorieTarget} kcal consumed (${calRemaining} kcal remaining)`
      },
      {
        metric: 'Daily Movement (Steps)',
        score: stepScore,
        weight: 15,
        comment: `${stepsConsumed.toLocaleString()} / ${goals.dailyStepTarget.toLocaleString()} steps`
      },
      {
        metric: 'Hydration Target',
        score: waterScore,
        weight: 10,
        comment: `${waterConsumedMl} / ${goals.waterTargetMl} ml consumed`
      },
      {
        metric: 'Fiber Intake',
        score: fiberScore,
        weight: 10,
        comment: `${fib}g / ${goals.fiberTargetG}g daily fiber`
      }
    ];

    return {
      nutritionState,
      alignmentScore: weightedScore,
      breakdown
    };
  }
}
