import {
  NutritionState,
  Goals,
  PredictionOutput,
  AutopilotAlert,
  PersonalProfile
} from '../types';

export class PredictionService {
  /**
   * Evaluates time of day and consumption pacing to predict end-of-day nutritional outcome
   */
  public static generatePredictions(
    nutrition: NutritionState,
    goals: Goals,
    profile: PersonalProfile,
    currentHour: number = new Date().getHours()
  ): {
    prediction: PredictionOutput;
    alerts: AutopilotAlert[];
  } {
    const calConsumed = nutrition.caloriesConsumed.value;
    const protConsumed = nutrition.proteinConsumed.value;
    const waterConsumed = nutrition.waterConsumedMl.value;

    const protRemaining = nutrition.proteinRemaining.value;
    const calRemaining = nutrition.caloriesRemaining.value;

    // Remaining hours in active day (assuming bed at 23:00)
    const hoursRemaining = Math.max(1, 23 - currentHour);
    const estimatedRemainingMeals = hoursRemaining > 5 ? 2 : 1;

    // Expected protein per remaining meal
    const proteinRequiredPerMeal = Math.round(protRemaining / estimatedRemainingMeals);

    // Projected end of day based on historical typical evening intake (~25g protein, ~600 kcal)
    const typicalEveningProtein = estimatedRemainingMeals * 24;
    const typicalEveningCalories = estimatedRemainingMeals * 550;

    const projectedEndOfDayProtein = Math.round(protConsumed + typicalEveningProtein);
    const projectedEndOfDayCalories = Math.round(calConsumed + typicalEveningCalories);
    const projectedWater = Math.round(waterConsumed + hoursRemaining * 120);

    const projectedProteinShortfall = Math.max(0, Math.round(goals.proteinTargetG - projectedEndOfDayProtein));

    let proteinGapRisk: 'optimal' | 'moderate_gap' | 'severe_gap' = 'optimal';
    let predictionStatement = 'Your nutritional trajectory is currently well-aligned with your daily targets.';
    const reasons: string[] = [];

    const alerts: AutopilotAlert[] = [];

    // Evaluate protein trajectory
    if (projectedProteinShortfall >= 25) {
      proteinGapRisk = 'severe_gap';
      predictionStatement = `Based on today's intake trajectory and ${estimatedRemainingMeals} remaining meal window(s), you are likely to finish approximately ${projectedProteinShortfall - 5}–${projectedProteinShortfall + 5}g below your ${goals.proteinTargetG}g protein target.`;
      reasons.push(`Breakfast and lunch provided ${Math.round(protConsumed)}g protein against expected pace of ${Math.round(goals.proteinTargetG * 0.7)}g.`);
      reasons.push(`Closing this gap requires ~${proteinRequiredPerMeal}g protein in your next meal.`);

      alerts.push({
        id: `alert_prot_${Date.now()}`,
        type: 'protein_gap',
        severity: 'warning',
        title: 'Projected Protein Gap Detected',
        message: `You're tracking ~${projectedProteinShortfall}g below target. Prioritize a high-protein option for your next meal.`,
        timestamp: 'Just now',
        actionText: 'View High-Protein Options',
        actionPayload: 'RECOMMENDATIONS'
      });
    } else if (projectedProteinShortfall >= 12) {
      proteinGapRisk = 'moderate_gap';
      predictionStatement = `You are slightly trailing your protein pacing. Adding ~15–20g protein to your evening meal will secure your target.`;
      reasons.push(`Current intake is ${protConsumed}g; goal is ${goals.proteinTargetG}g.`);
    }

    // Hydration check
    const waterShortfall = goals.waterTargetMl - waterConsumed;
    if (hoursRemaining <= 4 && waterShortfall >= 1000) {
      alerts.push({
        id: `alert_water_${Date.now()}`,
        type: 'hydration_gap',
        severity: 'info',
        title: 'Hydration Behind Target',
        message: `You are ~${Math.round(waterShortfall / 250)} glasses behind today's hydration target (${waterConsumed} / ${goals.waterTargetMl} ml).`,
        timestamp: '15m ago',
        actionText: 'Log +250ml Water',
        actionPayload: 'LOG_WATER'
      });
    }

    return {
      prediction: {
        predictedEndOfDayCalories: projectedEndOfDayCalories,
        predictedEndOfDayProteinG: projectedEndOfDayProtein,
        predictedEndOfDayWaterMl: projectedWater,
        calorieGapRisk: projectedEndOfDayCalories < goals.baselineCalorieTarget - 300 ? 'deficit_risk' : 'on_track',
        proteinGapRisk,
        projectedProteinShortfallG: projectedProteinShortfall,
        predictionStatement,
        confidence: 'medium', // Stated with clear uncertainty
        reasons
      },
      alerts
    };
  }
}
