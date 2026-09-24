import { WorkoutSession } from '../types';

export interface DeduplicationResult {
  isDuplicate: boolean;
  isOverlapping: boolean;
  overlapPercentage: number;
  canonicalWorkout?: WorkoutSession;
  reason?: string;
}

export class EventDeduplicationService {
  /**
   * Evaluates a candidate workout against existing workouts to prevent double-counting
   * of energy expenditure from multiple devices or overlapping records.
   */
  public static checkWorkout(
    candidate: WorkoutSession,
    existingWorkouts: WorkoutSession[]
  ): DeduplicationResult {
    const candidateStart = new Date(candidate.startTime).getTime();
    const candidateEnd = candidate.endTime
      ? new Date(candidate.endTime).getTime()
      : candidateStart + candidate.durationMinutes * 60 * 1000;

    for (const existing of existingWorkouts) {
      if (existing.id === candidate.id) continue;

      const existingStart = new Date(existing.startTime).getTime();
      const existingEnd = existing.endTime
        ? new Date(existing.endTime).getTime()
        : existingStart + existing.durationMinutes * 60 * 1000;

      // 1. Exact match duplicate check (same time window within 2 minutes and same type)
      const startDiffMin = Math.abs(candidateStart - existingStart) / (1000 * 60);
      const durationDiffMin = Math.abs(candidate.durationMinutes - existing.durationMinutes);

      if (startDiffMin <= 2 && durationDiffMin <= 3 && existing.type === candidate.type) {
        return {
          isDuplicate: true,
          isOverlapping: true,
          overlapPercentage: 100,
          canonicalWorkout: existing,
          reason: `Exact duplicate detected from ${existing.sourceDevice}. Keeping the primary wearable record.`
        };
      }

      // 2. Overlapping check: (StartA < EndB) and (EndA > StartB)
      const overlapStart = Math.max(candidateStart, existingStart);
      const overlapEnd = Math.min(candidateEnd, existingEnd);

      if (overlapEnd > overlapStart) {
        const overlapDurationMin = (overlapEnd - overlapStart) / (1000 * 60);
        const minDuration = Math.min(candidate.durationMinutes, existing.durationMinutes);
        const overlapPct = Math.round((overlapDurationMin / minDuration) * 100);

        if (overlapPct >= 40) {
          return {
            isDuplicate: false,
            isOverlapping: true,
            overlapPercentage: overlapPct,
            canonicalWorkout: existing,
            reason: `Overlapping workout detected (${overlapPct}% overlap with "${existing.title}"). Deduplication active energy applied to prevent double counting.`
          };
        }
      }
    }

    return {
      isDuplicate: false,
      isOverlapping: false,
      overlapPercentage: 0
    };
  }
}
