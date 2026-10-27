export type TabKey = 'home' | 'map' | 'modules' | 'music' | 'history' | 'settings';

export type HistoryEntry = {
  date: string;
  intention: string;
  completedSteps: string[];
  totalSteps: number;
};

export type MicroStep = {
  id: string;
  text: string;
  done: boolean;
};

export type DailyData = {
  date: string;
  intention: string;
  steps: MicroStep[];
};

export type ControlLevel = 'in_control' | 'can_influence' | 'out_of_control';

export type MapPoint = {
  id: string;
  text: string;
  level: ControlLevel;
  released?: boolean;
};

export type Goal = {
  id: string;
  title: string;
  points: MapPoint[];
  createdAt: number;
};

export type ModuleId =
  | 'life_areas'
  | 'self_talk'
  | 'expectations'
  | 'change_process'
  | 'values_clarification'
  | 'stress_recovery'
  | 'relationship_boundaries'
  | 'self_compassion';

export type SaveState = 'idle' | 'saving' | 'saved';

// ---- Module 1: Life areas ----
export type LifeArea = {
  key: string;
  label: string;
  rating: number; // 1-10
};

// ---- Module 2: Self talk ----
export type ReframeEntry = {
  id: string;
  critic: string;
  mentor: string;
};

// ---- Module 3: Expectations ----
export type ExpectationItem = {
  id: string;
  text: string;
  kind: 'duty' | 'will';
};

// ---- Module 4: Decision balance ----
export type DecisionField = 'stay_pros' | 'stay_cons' | 'change_pros' | 'change_cons';

// ---- Legacy modules (kept for storage cleanup) ----
export type EnergyItem = {
  id: string;
  text: string;
  category: 'source' | 'drain' | null;
};

export type ModuleStateV1 = {
  noResponses?: string[];
  energyItems?: EnergyItem[];
  energyNewText?: string;
  eveningAnswers?: { question: string; answer: string }[];
  eveningDate?: string;
  openedAt?: number | null;
  completedAt?: number | null;
};

export type ModuleState = {
  openedAt: number | null;
  completedAt: number | null;
  // module 1
  lifeAreas?: LifeArea[];
  lifeFocus?: string;
  // module 2
  reframes?: ReframeEntry[];
  // module 3
  expectations?: ExpectationItem[];
  noTemplate?: string;
  // module 4
  decision?: Partial<Record<DecisionField, string>>;
  decisionGoal?: string;
  // module 5: values clarification
  valuesRanked?: string[];
  valuesActions?: string;
  // module 6: stress & recovery
  energySources?: string[];
  energyDrains?: string[];
  recoveryPlan?: string;
  // module 7: relationship boundaries
  boundaryEntries?: BoundaryEntry[];
  // module 8: self-compassion
  compassionEntries?: CompassionEntry[];
  compassionLetter?: string;
};

export type BoundaryEntry = {
  id: string;
  situation: string;
  boundary: string;
};

export type CompassionEntry = {
  id: string;
  struggle: string;
  kindResponse: string;
};
