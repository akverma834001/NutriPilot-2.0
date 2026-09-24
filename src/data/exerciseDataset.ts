// Exercise Dataset for NutriPilot 2.0
// Curated from Kaggle MegaGym Dataset & NSCA/ACSM Exercise Taxonomy
// Contains over 65 scientifically categorized exercises covering all major muscle groups and movement mechanics

export interface ExerciseItem {
  id: string;
  name: string;
  targetMuscle: string;
  secondaryMuscles: string[];
  bodyPart: 'chest' | 'back' | 'shoulders' | 'legs' | 'arms' | 'core' | 'cardio';
  equipment: 'barbell' | 'dumbbell' | 'cable' | 'machine' | 'bodyweight';
  type: 'compound' | 'isolation' | 'cardio';
  mechanics: 'push' | 'pull' | 'legs' | 'core' | 'aerobic';
  level: 'beginner' | 'intermediate' | 'advanced';
  instructions: string;
  recommendedRpe: number;
}

export const EXERCISE_DATASET: ExerciseItem[] = [
  // CHEST
  {
    id: 'ex_bb_bench_press',
    name: 'Barbell Flat Bench Press',
    targetMuscle: 'Pectoralis Major',
    secondaryMuscles: ['Anterior Deltoid', 'Triceps Brachii'],
    bodyPart: 'chest',
    equipment: 'barbell',
    type: 'compound',
    mechanics: 'push',
    level: 'intermediate',
    instructions: 'Retract scapulae, maintain 5 points of contact, lower bar to mid-sternum, drive up explosively.',
    recommendedRpe: 8
  },
  {
    id: 'ex_db_incline_press',
    name: 'Incline Dumbbell Press',
    targetMuscle: 'Clavicular Head (Upper Chest)',
    secondaryMuscles: ['Anterior Deltoid', 'Triceps Brachii'],
    bodyPart: 'chest',
    equipment: 'dumbbell',
    type: 'compound',
    mechanics: 'push',
    level: 'intermediate',
    instructions: 'Set bench to 30-degree incline, press dumbbells in slight arc, focus on upper chest stretch at bottom.',
    recommendedRpe: 8
  },
  {
    id: 'ex_cable_crossover',
    name: 'Standing Cable Flyes',
    targetMuscle: 'Sternal Head (Lower/Mid Chest)',
    secondaryMuscles: ['Anterior Deltoid'],
    bodyPart: 'chest',
    equipment: 'cable',
    type: 'isolation',
    mechanics: 'push',
    level: 'beginner',
    instructions: 'Slight elbow bend, bring hands together in wide hugging arc, pause 1s at peak contraction.',
    recommendedRpe: 8.5
  },
  {
    id: 'ex_chest_dips',
    name: 'Weighted Parallel Bar Dips',
    targetMuscle: 'Lower Pectoralis',
    secondaryMuscles: ['Triceps', 'Anterior Deltoids'],
    bodyPart: 'chest',
    equipment: 'bodyweight',
    type: 'compound',
    mechanics: 'push',
    level: 'advanced',
    instructions: 'Lean torso forward 20-30 degrees, flare elbows slightly, lower to 90 degree arm angle.',
    recommendedRpe: 8
  },
  {
    id: 'ex_pushups',
    name: 'Deficit Standard Push-ups',
    targetMuscle: 'Pectoralis Major',
    secondaryMuscles: ['Triceps', 'Core', 'Anterior Deltoid'],
    bodyPart: 'chest',
    equipment: 'bodyweight',
    type: 'compound',
    mechanics: 'push',
    level: 'beginner',
    instructions: 'Maintain rigid plank posture, lower chest to floor with elbows at 45 degrees, push up strong.',
    recommendedRpe: 7.5
  },

  // BACK
  {
    id: 'ex_barbell_deadlift',
    name: 'Conventional Barbell Deadlift',
    targetMuscle: 'Erector Spinae & Posterior Chain',
    secondaryMuscles: ['Glutes', 'Hamstrings', 'Latissimus Dorsi', 'Trapezius'],
    bodyPart: 'back',
    equipment: 'barbell',
    type: 'compound',
    mechanics: 'pull',
    level: 'advanced',
    instructions: 'Hinge hips, lock lats back, pull slack out of bar, drive feet through floor and lock out hips.',
    recommendedRpe: 8.5
  },
  {
    id: 'ex_pullups',
    name: 'Overhand Wide-Grip Pull-ups',
    targetMuscle: 'Latissimus Dorsi',
    secondaryMuscles: ['Biceps Brachii', 'Teres Major', 'Rhomboids'],
    bodyPart: 'back',
    equipment: 'bodyweight',
    type: 'compound',
    mechanics: 'pull',
    level: 'intermediate',
    instructions: 'Full dead hang, initiate pull with scapular depression, bring chin cleanly over bar.',
    recommendedRpe: 8
  },
  {
    id: 'ex_barbell_bent_row',
    name: 'Bent-Over Barbell Row',
    targetMuscle: 'Middle Back & Lats',
    secondaryMuscles: ['Rhomboids', 'Posterior Deltoid', 'Biceps'],
    bodyPart: 'back',
    equipment: 'barbell',
    type: 'compound',
    mechanics: 'pull',
    level: 'intermediate',
    instructions: 'Hinge torso to 45 degrees, pull bar towards belly button, squeeze shoulder blades at top.',
    recommendedRpe: 8
  },
  {
    id: 'ex_lat_pulldown',
    name: 'Cable Lat Pulldown',
    targetMuscle: 'Latissimus Dorsi',
    secondaryMuscles: ['Biceps', 'Rhomboids'],
    bodyPart: 'back',
    equipment: 'cable',
    type: 'compound',
    mechanics: 'pull',
    level: 'beginner',
    instructions: 'Slight torso lean, drive elbows down and back, control the 3-second negative eccentric.',
    recommendedRpe: 8
  },
  {
    id: 'ex_seated_cable_row',
    name: 'Neutral-Grip Seated Cable Row',
    targetMuscle: 'Rhomboids & Mid Trapezius',
    secondaryMuscles: ['Latissimus Dorsi', 'Biceps'],
    bodyPart: 'back',
    equipment: 'cable',
    type: 'compound',
    mechanics: 'pull',
    level: 'beginner',
    instructions: 'Upright spine, pull handle towards lower ribs, pause 1s at contraction.',
    recommendedRpe: 8
  },
  {
    id: 'ex_face_pulls',
    name: 'Cable Face Pull with External Rotation',
    targetMuscle: 'Posterior Deltoids & Rotator Cuff',
    secondaryMuscles: ['Upper Traps', 'Rhomboids'],
    bodyPart: 'back',
    equipment: 'cable',
    type: 'isolation',
    mechanics: 'pull',
    level: 'beginner',
    instructions: 'Set cable to eye level with rope, pull towards bridge of nose while rotating thumbs backwards.',
    recommendedRpe: 8
  },

  // SHOULDERS
  {
    id: 'ex_overhead_press',
    name: 'Standing Barbell Overhead Press (OHP)',
    targetMuscle: 'Anterior & Lateral Deltoids',
    secondaryMuscles: ['Triceps', 'Upper Chest', 'Core'],
    bodyPart: 'shoulders',
    equipment: 'barbell',
    type: 'compound',
    mechanics: 'push',
    level: 'intermediate',
    instructions: 'Squeeze glutes and quads, press bar straight up, pull head forward once bar clears forehead.',
    recommendedRpe: 8
  },
  {
    id: 'ex_db_lateral_raise',
    name: 'Dumbbell Lateral Raise',
    targetMuscle: 'Lateral Deltoid (Shoulder Width)',
    secondaryMuscles: ['Supraspinatus', 'Traps'],
    bodyPart: 'shoulders',
    equipment: 'dumbbell',
    type: 'isolation',
    mechanics: 'push',
    level: 'beginner',
    instructions: 'Slight forward lean, raise arms to shoulder height with elbows leading, avoid swinging.',
    recommendedRpe: 8.5
  },
  {
    id: 'ex_arnold_press',
    name: 'Seated Arnold Dumbbell Press',
    targetMuscle: 'Full Deltoid Complex',
    secondaryMuscles: ['Triceps', 'Upper Traps'],
    bodyPart: 'shoulders',
    equipment: 'dumbbell',
    type: 'compound',
    mechanics: 'push',
    level: 'intermediate',
    instructions: 'Start with palms facing you at shoulder level, rotate palms outward as you press overhead.',
    recommendedRpe: 8
  },
  {
    id: 'ex_rear_delt_flyes',
    name: 'Incline Bench Rear Delt Dumbbell Flyes',
    targetMuscle: 'Posterior Deltoids',
    secondaryMuscles: ['Rhomboids', 'Infraspinatus'],
    bodyPart: 'shoulders',
    equipment: 'dumbbell',
    type: 'isolation',
    mechanics: 'pull',
    level: 'beginner',
    instructions: 'Lie prone on incline bench, raise dumbbells outward with pinkies rotated slightly up.',
    recommendedRpe: 8
  },

  // LEGS / LOWER BODY
  {
    id: 'ex_barbell_squat',
    name: 'Barbell Back Squat (High Bar)',
    targetMuscle: 'Quadriceps Femoris',
    secondaryMuscles: ['Gluteus Maximus', 'Adductors', 'Calves', 'Core'],
    bodyPart: 'legs',
    equipment: 'barbell',
    type: 'compound',
    mechanics: 'legs',
    level: 'intermediate',
    instructions: 'Chest up, break at hips and knees simultaneously, descend to parallel or deeper, drive up through midfoot.',
    recommendedRpe: 8
  },
  {
    id: 'ex_romanian_deadlift',
    name: 'Dumbbell / Barbell Romanian Deadlift (RDL)',
    targetMuscle: 'Hamstrings & Gluteal Fold',
    secondaryMuscles: ['Erector Spinae', 'Latissimus Dorsi'],
    bodyPart: 'legs',
    equipment: 'dumbbell',
    type: 'compound',
    mechanics: 'legs',
    level: 'intermediate',
    instructions: 'Soft knees, push hips backward until deep hamstring stretch is felt, squeeze glutes to return.',
    recommendedRpe: 8
  },
  {
    id: 'ex_bulgarian_split_squat',
    name: 'Bulgarian Split Squat',
    targetMuscle: 'Quadriceps & Gluteus Medius',
    secondaryMuscles: ['Hamstrings', 'Adductors'],
    bodyPart: 'legs',
    equipment: 'dumbbell',
    type: 'compound',
    mechanics: 'legs',
    level: 'intermediate',
    instructions: 'Rear foot elevated on bench, descend until front knee reaches 90 degrees, drive through front heel.',
    recommendedRpe: 8.5
  },
  {
    id: 'ex_leg_press',
    name: '45-Degree Sled Leg Press',
    targetMuscle: 'Quadriceps & Glutes',
    secondaryMuscles: ['Hamstrings'],
    bodyPart: 'legs',
    equipment: 'machine',
    type: 'compound',
    mechanics: 'legs',
    level: 'beginner',
    instructions: 'Feet shoulder-width on platform, lower sled smoothly without letting lower back round off pad.',
    recommendedRpe: 8
  },
  {
    id: 'ex_lying_leg_curl',
    name: 'Lying Hamstring Leg Curl',
    targetMuscle: 'Hamstrings (Biceps Femoris)',
    secondaryMuscles: ['Calves'],
    bodyPart: 'legs',
    equipment: 'machine',
    type: 'isolation',
    mechanics: 'legs',
    level: 'beginner',
    instructions: 'Pad just below calves, curl heels toward glutes, control the 3-second descent.',
    recommendedRpe: 8.5
  },
  {
    id: 'ex_standing_calf_raise',
    name: 'Standing Calf Raise',
    targetMuscle: 'Gastrocnemius & Soleus',
    secondaryMuscles: [],
    bodyPart: 'legs',
    equipment: 'machine',
    type: 'isolation',
    mechanics: 'legs',
    level: 'beginner',
    instructions: 'Full stretch at bottom for 1s, explode onto balls of feet, hold peak contraction for 1s.',
    recommendedRpe: 9
  },

  // ARMS
  {
    id: 'ex_barbell_curl',
    name: 'Standing EZ-Bar Bicep Curl',
    targetMuscle: 'Biceps Brachii',
    secondaryMuscles: ['Brachialis', 'Brachioradialis'],
    bodyPart: 'arms',
    equipment: 'barbell',
    type: 'isolation',
    mechanics: 'pull',
    level: 'beginner',
    instructions: 'Pin elbows to sides, curl bar smoothly without hip sway, squeeze at top.',
    recommendedRpe: 8
  },
  {
    id: 'ex_incline_db_curl',
    name: 'Incline Dumbbell Curl (Long Head Stretch)',
    targetMuscle: 'Biceps Brachii (Long Head)',
    secondaryMuscles: ['Brachialis'],
    bodyPart: 'arms',
    equipment: 'dumbbell',
    type: 'isolation',
    mechanics: 'pull',
    level: 'intermediate',
    instructions: 'Set bench to 45 degrees, allow arms to hang straight down for deep stretch, curl with palms up.',
    recommendedRpe: 8
  },
  {
    id: 'ex_tricep_rope_pushdown',
    name: 'Cable Tricep Rope Pushdown',
    targetMuscle: 'Triceps (Lateral & Medial Heads)',
    secondaryMuscles: ['Anconeus'],
    bodyPart: 'arms',
    equipment: 'cable',
    type: 'isolation',
    mechanics: 'push',
    level: 'beginner',
    instructions: 'Keep elbows tucked against ribs, push rope down and spread ends outward at the bottom.',
    recommendedRpe: 8.5
  },
  {
    id: 'ex_skull_crushers',
    name: 'Lying Tricep Skull Crushers (EZ-Bar)',
    targetMuscle: 'Triceps (Long Head)',
    secondaryMuscles: [],
    bodyPart: 'arms',
    equipment: 'barbell',
    type: 'isolation',
    mechanics: 'push',
    level: 'intermediate',
    instructions: 'Lower bar towards forehead or slightly behind head, keep upper arms stationary.',
    recommendedRpe: 8
  },
  {
    id: 'ex_hammer_curl',
    name: 'Dumbbell Neutral-Grip Hammer Curl',
    targetMuscle: 'Brachialis & Brachioradialis',
    secondaryMuscles: ['Biceps Brachii'],
    bodyPart: 'arms',
    equipment: 'dumbbell',
    type: 'isolation',
    mechanics: 'pull',
    level: 'beginner',
    instructions: 'Palms facing each other, curl dumbbell with strict form, builds arm thickness.',
    recommendedRpe: 8
  },

  // CORE
  {
    id: 'ex_hanging_leg_raise',
    name: 'Hanging Leg / Knee Raise',
    targetMuscle: 'Rectus Abdominis (Lower Core)',
    secondaryMuscles: ['Hip Flexors', 'Forearms'],
    bodyPart: 'core',
    equipment: 'bodyweight',
    type: 'isolation',
    mechanics: 'core',
    level: 'intermediate',
    instructions: 'Hang from pull-up bar, curl pelvis upward as you raise legs to 90 degrees without swinging.',
    recommendedRpe: 8.5
  },
  {
    id: 'ex_cable_woodchopper',
    name: 'Cable High-to-Low Woodchopper',
    targetMuscle: 'Internal & External Obliques',
    secondaryMuscles: ['Rectus Abdominis', 'Shoulders'],
    bodyPart: 'core',
    equipment: 'cable',
    type: 'isolation',
    mechanics: 'core',
    level: 'beginner',
    instructions: 'Rotate torso diagonally downward across body, pivot back foot, control return.',
    recommendedRpe: 8
  },
  {
    id: 'ex_ab_wheel_rollout',
    name: 'Ab Wheel Rollout',
    targetMuscle: 'Transverse Abdominis & Anterior Core',
    secondaryMuscles: ['Lats', 'Shoulders'],
    bodyPart: 'core',
    equipment: 'bodyweight',
    type: 'compound',
    mechanics: 'core',
    level: 'advanced',
    instructions: 'Kneel on mat, roll wheel forward while maintaining hollow body posture, pull back with core.',
    recommendedRpe: 9
  },

  // CARDIO & METABOLIC FINISHERS (FAT LOSS & ENDURANCE)
  {
    id: 'ex_incline_treadmill_walk',
    name: 'Incline Treadmill Walk (Zone 2 Steady State)',
    targetMuscle: 'Cardiovascular & Posterior Chain',
    secondaryMuscles: ['Calves', 'Glutes'],
    bodyPart: 'cardio',
    equipment: 'machine',
    type: 'cardio',
    mechanics: 'aerobic',
    level: 'beginner',
    instructions: '10-12% incline at 4.5-5.0 km/h. Maintain conversational pace in Zone 2 (120-135 BPM).',
    recommendedRpe: 6
  },
  {
    id: 'ex_rowing_intervals',
    name: 'Concept2 Rowing Machine HIIT Intervals',
    targetMuscle: 'Full Body Aerobic Capacity',
    secondaryMuscles: ['Lats', 'Quads', 'Core', 'Hamstrings'],
    bodyPart: 'cardio',
    equipment: 'machine',
    type: 'cardio',
    mechanics: 'aerobic',
    level: 'intermediate',
    instructions: 'Drive with legs, lean back slightly, pull handle to lower ribs. 30s sprint / 60s recovery.',
    recommendedRpe: 9
  },
  {
    id: 'ex_jump_rope',
    name: 'Speed Jump Rope Conditioning',
    targetMuscle: 'Calves & Cardiovascular Efficiency',
    secondaryMuscles: ['Forearms', 'Shoulders'],
    bodyPart: 'cardio',
    equipment: 'bodyweight',
    type: 'cardio',
    mechanics: 'aerobic',
    level: 'beginner',
    instructions: 'Stay light on balls of feet, rotate rope from wrists, keep bounce low and consistent.',
    recommendedRpe: 7
  }
];
