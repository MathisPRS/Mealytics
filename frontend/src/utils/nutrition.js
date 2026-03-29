/**
 * Calcul du TDEE (Total Daily Energy Expenditure)
 *
 * Modèle à 3 facteurs indépendants :
 *   1. job_activity  — activité journalière / métier
 *   2. sport_activity — fréquence sportive hebdomadaire
 *   3. metabolism     — morphologie / vitesse métabolique
 *
 * Formule scientifique (FAO/WHO/UNU 2001, IOM 2005) :
 *   BMR (Mifflin-St Jeor 1990, PMID 2305711)
 *   × PAL (Physical Activity Level) = PAL_job + PAL_sport_increment, plafonné à 1.90
 *   × metabolism_multiplier (±5%)
 *   + goal_adjustment
 *   = dailyCalories
 *
 * Rétrocompatibilité : si les nouveaux champs sont absents,
 * on retombe sur l'ancien activityLevel.
 */

// ── Activité journalière (métier / mode de vie) ─────────
// `pal` = Physical Activity Level de base (FAO/WHO/UNU 2001)
export const JOB_ACTIVITY_LEVELS = [
  {
    id: 'assis',
    label: 'Principalement assis',
    description: 'Bureau, télétravail, conduite longue durée',
    emoji: '🪑',
    pal: 1.20,
  },
  {
    id: 'debout_leger',
    label: 'Debout / déplacements légers',
    description: 'Enseignant, vendeur, caissier',
    emoji: '🚶',
    pal: 1.375,
  },
  {
    id: 'debout_actif',
    label: 'Debout et actif toute la journée',
    description: 'Serveur, infirmier, technicien',
    emoji: '⚡',
    pal: 1.55,
  },
  {
    id: 'manuel',
    label: 'Travail physique / manuel',
    description: 'Maçon, agriculteur, déménageur',
    emoji: '🔨',
    pal: 1.725,
  },
];

// ── Activité sportive (fréquence hebdomadaire) ──────────
// `palIncrement` = incrément PAL ajouté au PAL de base (Ainsworth Compendium)
export const SPORT_ACTIVITY_LEVELS = [
  {
    id: 'jamais',
    label: 'Pas de sport',
    description: 'Aucune séance structurée',
    emoji: '😴',
    palIncrement: 0.00,
  },
  {
    id: 'leger',
    label: '1-2 séances / semaine',
    description: 'Sport occasionnel, marche, yoga',
    emoji: '🚴',
    palIncrement: 0.10,
  },
  {
    id: 'modere',
    label: '3-4 séances / semaine',
    description: 'Sport régulier, salle de sport',
    emoji: '🏋️',
    palIncrement: 0.175,
  },
  {
    id: 'intensif',
    label: '5-6 séances / semaine',
    description: 'Entraînement soutenu',
    emoji: '🏃',
    palIncrement: 0.25,
  },
  {
    id: 'quotidien',
    label: 'Tous les jours (sport intense)',
    description: 'Athlète, double-séance fréquente',
    emoji: '🥇',
    palIncrement: 0.35,
  },
];

// ── Morphologie / métabolisme ───────────────────────────
export const METABOLISM_TYPES = [
  {
    id: 'lent',
    label: 'Métabolisme lent',
    description: 'Je prends facilement du poids, difficile d\'en perdre',
    emoji: '🐢',
    multiplier: 0.95,
  },
  {
    id: 'normal',
    label: 'Métabolisme normal',
    description: 'Je maintiens mon poids sans trop d\'efforts',
    emoji: '⚖️',
    multiplier: 1.00,
  },
  {
    id: 'rapide',
    label: 'Métabolisme rapide',
    description: 'J\'ai du mal à prendre du poids, je brûle vite',
    emoji: '🔥',
    multiplier: 1.05,
  },
];

// ── Activité legacy (rétrocompatibilité) ─────────────────
export const ACTIVITY_LEVELS = [
  { id: 'sedentaire',  label: 'Sédentaire',           description: 'Peu ou pas d\'exercice',       factor: 1.2   },
  { id: 'leger',       label: 'Légèrement actif',      description: '1-3 jours/semaine',            factor: 1.375 },
  { id: 'modere',      label: 'Modérément actif',      description: '3-5 jours/semaine',            factor: 1.55  },
  { id: 'tres_actif',  label: 'Très actif',            description: '6-7 jours/semaine',            factor: 1.725 },
  { id: 'extreme',     label: 'Extrêmement actif',     description: 'Travail physique + sport',     factor: 1.9   },
];

// ── Objectifs ────────────────────────────────────────────
export const GOALS = [
  { id: 'perte_poids',       label: 'Perte de poids',    description: '-500 kcal/jour',      calAdjust: -500, emoji: '📉' },
  { id: 'perte_poids_douce', label: 'Perte douce',       description: '-250 kcal/jour',      calAdjust: -250, emoji: '🎯' },
  { id: 'maintien',          label: 'Maintien',          description: 'Équilibre calorique', calAdjust:    0, emoji: '⚖️' },
  { id: 'prise_muscle',      label: 'Prise de muscle',   description: '+250 kcal/jour',      calAdjust:  250, emoji: '💪' },
  { id: 'prise_poids',       label: 'Prise de poids',    description: '+500 kcal/jour',      calAdjust:  500, emoji: '📈' },
];

// ── BMR — Mifflin-St Jeor ────────────────────────────────
export function calcBMR(gender, weight, height, age) {
  if (gender === 'homme') {
    return (10 * weight) + (6.25 * height) - (5 * age) + 5;
  }
  return (10 * weight) + (6.25 * height) - (5 * age) - 161;
}

// ── TDEE — modèle PAL scientifique (FAO/WHO/UNU 2001) ────
// PAL_final = min(PAL_job + PAL_sport_increment, 1.90)
// TDEE = BMR × PAL_final × metabolism_multiplier
export function calcTDEEFull(gender, weight, height, age, jobId, sportId, metabolismId) {
  const bmr = calcBMR(gender, weight, height, age);

  const job   = JOB_ACTIVITY_LEVELS.find(j => j.id === jobId);
  const sport = SPORT_ACTIVITY_LEVELS.find(s => s.id === sportId);
  const meta  = METABOLISM_TYPES.find(m => m.id === metabolismId);

  const jobPAL      = job?.pal          ?? 1.375; // défaut : debout_leger
  const sportIncr   = sport?.palIncrement ?? 0.10; // défaut : leger
  const metaMult    = meta?.multiplier  ?? 1.00;

  // Plafonné à 1.90 (maximum physiologique validé FAO/WHO/UNU)
  const pal = Math.min(jobPAL + sportIncr, 1.90);

  return Math.round(bmr * pal * metaMult);
}

// ── TDEE — legacy (rétrocompatibilité) ───────────────────
export function calcTDEE(gender, weight, height, age, activityId) {
  const bmr = calcBMR(gender, weight, height, age);
  const activity = ACTIVITY_LEVELS.find(a => a.id === activityId) || ACTIVITY_LEVELS[1];
  return Math.round(bmr * activity.factor);
}

// ── Calories journalières ────────────────────────────────
export function calcDailyCalories(gender, weight, height, age, activityId, goalId) {
  const tdee = calcTDEE(gender, weight, height, age, activityId);
  const goal = GOALS.find(g => g.id === goalId) || GOALS[2];
  return Math.round(tdee + goal.calAdjust);
}

// ── Macros ───────────────────────────────────────────────
export function calcMacros(dailyCalories, goalId) {
  let proteinPct, fatPct, carbPct;
  switch (goalId) {
    case 'prise_muscle':
      proteinPct = 0.30; fatPct = 0.25; carbPct = 0.45; break;
    case 'perte_poids':
    case 'perte_poids_douce':
      proteinPct = 0.35; fatPct = 0.30; carbPct = 0.35; break;
    default:
      proteinPct = 0.25; fatPct = 0.30; carbPct = 0.45;
  }
  return {
    protein: Math.round((dailyCalories * proteinPct) / 4),
    fat:     Math.round((dailyCalories * fatPct)     / 9),
    carbs:   Math.round((dailyCalories * carbPct)    / 4),
  };
}

// ── calcUserNeeds — point d'entrée principal ─────────────
// Accepte les nouveaux champs (jobActivity, sportActivity, metabolism)
// ET les anciens (activityLevel) pour la rétrocompatibilité.
export function calcUserNeeds(profile) {
  const {
    gender, weight, height, age,
    jobActivity, sportActivity, metabolism,
    activityLevel, // legacy
    goal,
    customCalories,
  } = profile;

  if (!gender || !weight || !height || !age) return null;

  let tdee;
  if (jobActivity && sportActivity && metabolism) {
    // Nouveau modèle
    tdee = calcTDEEFull(gender, weight, height, age, jobActivity, sportActivity, metabolism);
  } else {
    // Fallback legacy
    tdee = calcTDEE(gender, weight, height, age, activityLevel);
  }

  const goalObj = GOALS.find(g => g.id === goal) || GOALS[2];
  const rawCalories = Math.round(tdee + goalObj.calAdjust);
  const dailyCalories = customCalories ? parseInt(customCalories, 10) : rawCalories;

  const macros = calcMacros(dailyCalories, goal);
  return { dailyCalories, ...macros };
}
