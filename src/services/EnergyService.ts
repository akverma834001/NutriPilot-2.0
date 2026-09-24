import {
  PersonalProfile,
  Goals,
  ActivityState,
  EnergyModelOutput,
  DataPoint
} from '../types';

export class EnergyService {
  /**
   * Calculates Basal Metabolic Rate using Mifflin-St Jeor formula
   */
  public static calculateBMR(profile: PersonalProfile): number {
    const { weightKg, heightCm, age, sex } = profile;
    if (sex === 'male') {
      return Math.round(10 * weightKg + 6.25 * heightCm - 5 * age + 5);
    } else {
      return Math.round(10 * weightKg + 6.25 * heightCm - 5 * age - 161);
    }
  }

  /**
   * Computes comprehensive energy accounting model without double-counting
   */
  public static computeEnergyModel(
    profile: PersonalProfile,
    goals: Goals,
    activity: ActivityState,
    previousTarget: number = 2450
  ): EnergyModelOutput {
    const nowIso = new Date().toISOString();
    const bmr = this.calculateBMR(profile);

    // 1. Sedentary Baseline (BMR * 1.2 for resting metabolism + non-exercise minimal activity)
    const baselineExpenditure = Math.round(bmr * 1.2);

    // 2. Wearable Active Energy (from steps and workouts reported by wearable)
    const wearableActive = activity.activeEnergyKcal.value;

    // 3. Non-Double-Counting Activity Contribution Calculation:
    // Wearables measure gross active energy during movement periods.
    // However, the sedentary baseline factor already accounts for ~20% above resting BMR.
    // To prevent double counting, the net activity contribution isolates exertion beyond the sedentary baseline allowance.
    const sedentaryHourlyAllowance = (baselineExpenditure - bmr) / 24;
    const estimatedActiveHours = Math.max(0.5, (activity.workoutMinutes.value + (activity.steps.value / 1000) * 12) / 60);
    const baselineOffsetForActiveTime = Math.round(sedentaryHourlyAllowance * estimatedActiveHours);

    // Net activity contribution above baseline
    const netActivityContribution = Math.max(0, Math.round(wearableActive - baselineOffsetForActiveTime));

    // 4. Total Energy Expenditure (TDEE)
    const totalExpenditure = baselineExpenditure + netActivityContribution;

    // 5. Goal Adjustment
    let goalAdjustment = 0;
    if (goals.primaryGoal === 'muscle_gain') {
      goalAdjustment = +280; // Lean surplus
    } else if (goals.primaryGoal === 'fat_loss') {
      goalAdjustment = -400; // Moderate sustainable deficit
    }

    const rawTarget = totalExpenditure + goalAdjustment;

    // 6. Target Stability Smoothing Rules (Requirement #16):
    // Prevents dramatic swing (e.g. 2,400 -> 2,850 from one quick walk).
    // Uses an exponential moving smoothing factor (alpha = 0.45) relative to baseline goal target.
    const smoothingWeight = 0.45;
    const smoothedTarget = Math.round(
      previousTarget * (1 - smoothingWeight) + rawTarget * smoothingWeight
    );

    const targetDelta = smoothedTarget - previousTarget;

    const explanationSteps = [
      {
        factor: 'Sedentary Baseline (BMR × 1.2)',
        deltaKcal: `${baselineExpenditure} kcal`,
        explanation: `Calculated from Mifflin-St Jeor formula (${bmr} kcal BMR) for age ${profile.age}, ${profile.heightCm}cm, ${profile.weightKg}kg.`
      },
      {
        factor: 'Wearable Active Energy',
        deltaKcal: `+${wearableActive} kcal`,
        explanation: `Reported by ${activity.activeEnergyKcal.source} (${activity.steps.value.toLocaleString()} steps + ${activity.workoutMinutes.value}m workout). Estimated by device.`
      },
      {
        factor: 'Double-Counting Deduction',
        deltaKcal: `-${baselineOffsetForActiveTime} kcal`,
        explanation: 'Sedentary allowance already baked into the 1.2 baseline during active hours has been deducted to protect calorie accuracy.'
      },
      {
        factor: 'Goal Alignment (Lean Muscle Gain)',
        deltaKcal: `+${goalAdjustment} kcal`,
        explanation: 'Controlled caloric surplus targeted for lean hypertrophy without excess fat gain.'
      },
      {
        factor: 'Stability Smoothing Applied',
        deltaKcal: `${targetDelta >= 0 ? '+' : ''}${targetDelta} kcal adjustment`,
        explanation: 'Smoothed to prevent erratic swings after individual training sessions or fluctuating step counts.'
      }
    ];

    const makeDataPoint = <T>(
      val: T,
      unit: string,
      source: string,
      sourceType: any,
      infoType: any,
      confidence: any,
      notes?: string
    ): DataPoint<T> => ({
      value: val,
      unit,
      source,
      sourceType,
      infoType,
      timestamp: nowIso,
      confidence,
      notes
    });

    return {
      baselineExpenditureKcal: makeDataPoint(
        baselineExpenditure,
        'kcal',
        'Mifflin-St Jeor Energy Model',
        'CALCULATED',
        'CALCULATED',
        'high',
        'Based on age, sex, height, weight'
      ),
      activityContributionKcal: makeDataPoint(
        netActivityContribution,
        'kcal',
        'NutriPilot Energy Accounting Layer',
        'CALCULATED',
        'CALCULATED',
        'medium',
        'Deduplicated net activity above baseline'
      ),
      wearableActiveKcal: makeDataPoint(
        wearableActive,
        'kcal',
        activity.activeEnergyKcal.source,
        'WEARABLE_ESTIMATED',
        'ESTIMATED',
        'medium',
        'Estimated by device sensor fusion'
      ),
      totalEnergyExpenditureKcal: makeDataPoint(
        totalExpenditure,
        'kcal',
        'NutriPilot Energy Engine',
        'CALCULATED',
        'ESTIMATED',
        'medium',
        'Baseline + Net Activity'
      ),
      adjustedDailyCalorieTarget: makeDataPoint(
        smoothedTarget,
        'kcal',
        'NutriPilot Stability Engine',
        'CALCULATED',
        'CALCULATED',
        'high',
        'Smoothed target with muscle gain surplus'
      ),
      targetChangeDelta: targetDelta,
      smoothingApplied: true,
      methodology: 'MSJ Sedentary Baseline + Wearable Active Differential with Double-Count Offset',
      explanationSteps,
      avoidedDoubleCountingExplanation:
        'NutriPilot isolates your active energy from baseline expenditure instead of simply stacking watch calories on top of an already active multiplier.'
    };
  }
}
