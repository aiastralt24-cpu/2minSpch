export type FrameworkKey = "CARE" | "PREP" | "STAR";

export type TopicCategory = "general_thinking" | "opinion" | "interview";

export type Difficulty = "easy" | "medium" | "hard";

export type PracticeMode =
  | "auto"
  | "general"
  | "opinion"
  | "interview"
  | "manual_framework";

export type PracticeStage = "setup" | "prompt" | "speaking" | "feedback";

export type CommunicationMetricKey =
  | "clarity"
  | "confidence"
  | "pacing"
  | "filler_words";

export interface FrameworkDefinition {
  key: FrameworkKey;
  name: string;
  summary: string;
  components: {
    key: string;
    label: string;
    description: string;
  }[];
  useCases: string[];
}

export interface Topic {
  id: string;
  title: string;
  category: TopicCategory;
  difficulty: Difficulty;
  framework: FrameworkKey;
  tags: string[];
  prompt_style: "reflective" | "debate" | "behavioral";
  is_active: boolean;
}

export interface StructuralScore {
  key: string;
  label: string;
  score: number;
  evidence: string;
  feedback: string;
}

export interface CommunicationScore {
  key: CommunicationMetricKey;
  label: string;
  score: number;
  feedback: string;
}

export interface EvaluationResult {
  framework: FrameworkKey;
  overall_score: number;
  structural_scores: StructuralScore[];
  communication_scores: CommunicationScore[];
  missing_components: string[];
  improvement_tips: string[];
  ideal_answer: string;
  transcript: string;
}

export interface PracticeSessionDraft {
  guestKey: string;
  mode: PracticeMode;
  difficulty: Difficulty;
  topic?: Topic;
  transcript: string;
  frameworkOverride?: FrameworkKey;
}

export interface PracticeAttemptRecord {
  id: string;
  guestKey?: string;
  userId?: string;
  topicId: string;
  topicTitle: string;
  framework: FrameworkKey;
  transcript: string;
  overallScore: number;
  evaluation: EvaluationResult;
  createdAt: string;
}

export interface PracticeSessionRecord {
  id: string;
  guestKey?: string;
  userId?: string;
  mode: PracticeMode;
  difficulty: Difficulty;
  framework: FrameworkKey;
  topicId: string;
  status: "topic_generated" | "completed";
  createdAt: string;
  updatedAt: string;
}

export interface ProgressSummary {
  totalAttempts: number;
  averageScore: number;
  frameworkAverages: {
    framework: FrameworkKey;
    averageScore: number;
    attempts: number;
  }[];
  weakestComponents: {
    framework: FrameworkKey;
    component: string;
    averageScore: number;
  }[];
  recentAttempts: PracticeAttemptRecord[];
}

export interface LocalUserProfile {
  id: string;
  name: string;
  email: string;
  createdAt: string;
}

export interface TopicGenerateInput {
  mode: PracticeMode;
  difficulty?: Difficulty;
  category?: TopicCategory;
  frameworkOverride?: FrameworkKey;
  priorTopicIds?: string[];
}
