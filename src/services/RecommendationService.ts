import {
  PersonalProfile,
  NutritionState,
  ActivityState,
  PantryItem,
  BudgetState,
  Recommendation,
  EnvironmentType,
  WorkoutSession,
  FeedbackRecord
} from '../types';
import { FOOD_DATABASE } from '../data/foodDatabase';
import { YouTubeRecipeService } from './YouTubeRecipeService';

export class RecommendationService {
  /**
   * Generates context-aware meal recommendations using deterministic constraints + ranking
   */
  public static generateRecommendations(
    profile: PersonalProfile,
    nutrition: NutritionState,
    activity: ActivityState,
    pantry: PantryItem[],
    budget: BudgetState,
    feedbackHistory: FeedbackRecord[] = [],
    forcedEnvironment?: EnvironmentType,
    maxPrepTime?: number
  ): Recommendation[] {
    const environment = forcedEnvironment || profile.currentEnvironment;
    const caloriesRemaining = nutrition.caloriesRemaining.value;
    const proteinRemaining = nutrition.proteinRemaining.value;
    const budgetRemaining = budget.remainingTodayInr;

    // Check if a workout was completed recently (within last 90 minutes)
    const recentWorkout: WorkoutSession | undefined = activity.lastWorkoutSummary;
    const isPostWorkout = Boolean(recentWorkout);

    const availablePantryNames = pantry
      .filter((p) => p.inStock)
      .map((p) => p.name.toLowerCase());

    // 1. CANDIDATE GENERATION & HARD CONSTRAINT FILTER
    const validCandidates = FOOD_DATABASE.filter((food) => {
      // Hard Constraint 1: Allergy Filter
      for (const allergy of profile.allergies) {
        if (
          food.allergenTags.some((tag) =>
            tag.toLowerCase().includes(allergy.toLowerCase())
          )
        ) {
          return false;
        }
      }

      // Hard Constraint 2: Diet Restrictions
      if (profile.dietPreference === 'strict_vegetarian' && food.dietTags.includes('contains_egg')) {
        return false;
      }
      if (profile.dietPreference === 'vegan' && (food.dietTags.includes('contains_egg') || food.allergenTags.includes('dairy'))) {
        return false;
      }

      // Hard Constraint 3: Disliked Foods
      for (const disliked of profile.dislikedFoods) {
        if (food.name.toLowerCase().includes(disliked.toLowerCase())) {
          return false;
        }
      }

      // Hard Constraint 4: Environment Match
      if (!food.availableEnvironments.includes(environment)) {
        return false;
      }

      // Hard Constraint 5: Prep Time if specified
      if (maxPrepTime && food.prepTimeMinutes > maxPrepTime) {
        return false;
      }

      // Hard Constraint 6: Cost cannot exceed daily remaining budget with some tolerance
      if (budgetRemaining > 0 && food.estimatedCostInr > Math.max(budgetRemaining, budget.mealBudgetGuidelineInr * 1.3)) {
        return false;
      }

      return true;
    });

    // 2. SCORING & NUTRITION VALIDATION
    const scoredCandidates = validCandidates.map((food) => {
      let score = 50; // Base score
      const whyReasons: string[] = [];
      const dataConsidered: string[] = [
        `Target remaining: ${proteinRemaining}g protein, ${caloriesRemaining} kcal`,
        `Environment: ${environment}`,
        `Remaining daily budget: ₹${budgetRemaining}`
      ];

      // Match Pantry Items
      const matchedPantry: string[] = [];
      for (const pantryItem of availablePantryNames) {
        if (
          food.name.toLowerCase().includes(pantryItem.split(' ')[0]) ||
          food.servingSize.toLowerCase().includes(pantryItem.split(' ')[0])
        ) {
          matchedPantry.push(pantryItem);
        }
      }

      if (matchedPantry.length > 0) {
        score += 25;
        whyReasons.push(`Ingredients available in your pantry (${matchedPantry.slice(0, 2).join(', ')})`);
        dataConsidered.push(`Pantry match: ${matchedPantry.join(', ')}`);
      }

      // Protein Gap Relevance
      if (proteinRemaining >= 20) {
        if (food.protein >= 22) {
          score += 30;
          whyReasons.push(`Delivers ~${Math.round(food.protein)}g high-quality protein to close your ${proteinRemaining}g deficit`);
        } else if (food.protein >= 15) {
          score += 15;
        }
      }

      // Post-Workout Timing Benefit
      if (isPostWorkout && recentWorkout) {
        dataConsidered.push(`Recent workout: ${recentWorkout.title} (${recentWorkout.durationMinutes}m, ${recentWorkout.activeKcal.value} kcal)`);
        if (food.protein >= 20 && food.carbs >= 25) {
          score += 20;
          whyReasons.push(`Optimal post-workout ratio (${Math.round(food.protein)}g protein for muscle recovery + carbs for glycogen replenishing)`);
        }
      }

      // Caloric Budget Fit
      if (food.calories <= caloriesRemaining + 50) {
        score += 15;
        whyReasons.push(`Fits comfortably within your ${caloriesRemaining} kcal remaining daily allowance`);
      } else {
        score -= 20; // Slightly penalize exceeding remaining calories
      }

      // Budget friendliness
      if (food.estimatedCostInr <= budget.mealBudgetGuidelineInr) {
        score += 10;
        whyReasons.push(`Cost-effective at ₹${food.estimatedCostInr} (under your ₹${budget.mealBudgetGuidelineInr} meal guideline)`);
      }

      // Convenience / Prep Time
      if (food.prepTimeMinutes <= 10) {
        score += 10;
        whyReasons.push(`Quick ${food.prepTimeMinutes}-minute preparation`);
      }

      // Personalization: check feedback history
      const previousLoved = feedbackHistory.some(
        (f) => f.mealChosenTitle.toLowerCase().includes(food.name.toLowerCase()) && f.rating === 'loved'
      );
      if (previousLoved) {
        score += 10;
        whyReasons.push('Aligns with your previously enjoyed meals');
      }

      const previousRejected = feedbackHistory.some(
        (f) => f.mealChosenTitle.toLowerCase().includes(food.name.toLowerCase()) && f.rating === 'not_for_me'
      );
      if (previousRejected) {
        score -= 25;
      }

      // Compose LLM Explanation string
      const llmExplanation = `Recommended because it supplies ${Math.round(
        food.protein
      )}g of protein (${Math.round(
        (food.protein / Math.max(1, proteinRemaining)) * 100
      )}% of your remaining gap) while staying within your ₹${budgetRemaining} budget and ${
        food.prepTimeMinutes
      }m preparation window at ${environment.toLowerCase()}.`;

      const ytData = YouTubeRecipeService.getBestRecipe(food.name);
      const recommendation: Recommendation = {
        id: `rec_${food.id}_${Date.now()}`,
        title: food.name,
        description: food.servingSize,
        items: [food.name],
        calories: food.calories,
        proteinG: food.protein,
        carbsG: food.carbs,
        fatG: food.fat,
        prepTimeMinutes: food.prepTimeMinutes,
        estimatedCostInr: food.estimatedCostInr,
        environment,
        suitabilityScore: Math.min(99, Math.max(40, score)),
        confidence: food.protein >= 20 && matchedPantry.length > 0 ? 'high' : 'medium',
        whyReasons: whyReasons.slice(0, 4),
        dataConsidered,
        matchedPantryItems: matchedPantry,
        timingContext: isPostWorkout ? 'Post-Workout Recovery Window' : 'Next Scheduled Meal',
        sourceEngine: matchedPantry.length > 0 ? 'pantry_optimizer' : 'deterministic_nutrition_engine',
        llmExplanation,
        youtubeUrl: food.youtubeUrl || ytData.primaryUrl,
        youtubeVideoTitle: food.youtubeVideoTitle || ytData.videoTitle
      };

      return recommendation;
    });

    // Sort by suitability score descending
    scoredCandidates.sort((a, b) => b.suitabilityScore - a.suitabilityScore);

    return scoredCandidates.slice(0, 4);
  }
}
