import { CATEGORY_TO_FRAMEWORK, MODE_TO_CATEGORY } from "@/lib/frameworks";
import { Topic, TopicCategory, TopicGenerateInput } from "@/lib/types";

export const SEEDED_TOPICS: Topic[] = [
  {
    id: "topic-care-time-management",
    title: "Why is time management important in everyday life?",
    category: "general_thinking",
    difficulty: "easy",
    framework: "CARE",
    tags: ["productivity", "self-management"],
    prompt_style: "reflective",
    is_active: true
  },
  {
    id: "topic-care-learning",
    title: "What makes someone a strong lifelong learner?",
    category: "general_thinking",
    difficulty: "medium",
    framework: "CARE",
    tags: ["growth", "mindset"],
    prompt_style: "reflective",
    is_active: true
  },
  {
    id: "topic-care-feedback",
    title: "How should people respond to difficult feedback?",
    category: "general_thinking",
    difficulty: "hard",
    framework: "CARE",
    tags: ["communication", "self-awareness"],
    prompt_style: "reflective",
    is_active: true
  },
  {
    id: "topic-prep-remote-work",
    title: "Is remote work better than office work?",
    category: "opinion",
    difficulty: "easy",
    framework: "PREP",
    tags: ["workplace", "hybrid"],
    prompt_style: "debate",
    is_active: true
  },
  {
    id: "topic-prep-ai-education",
    title: "Should AI be a core part of school education?",
    category: "opinion",
    difficulty: "medium",
    framework: "PREP",
    tags: ["education", "ai"],
    prompt_style: "debate",
    is_active: true
  },
  {
    id: "topic-prep-four-day-week",
    title: "Would a four-day workweek improve productivity?",
    category: "opinion",
    difficulty: "hard",
    framework: "PREP",
    tags: ["future-of-work", "productivity"],
    prompt_style: "debate",
    is_active: true
  },
  {
    id: "topic-star-conflict",
    title: "Tell me about a time you handled conflict on a team.",
    category: "interview",
    difficulty: "medium",
    framework: "STAR",
    tags: ["teamwork", "conflict"],
    prompt_style: "behavioral",
    is_active: true
  },
  {
    id: "topic-star-failure",
    title: "Tell me about a time you failed and what you learned.",
    category: "interview",
    difficulty: "medium",
    framework: "STAR",
    tags: ["growth", "resilience"],
    prompt_style: "behavioral",
    is_active: true
  },
  {
    id: "topic-star-leadership",
    title: "Describe a time you took ownership under pressure.",
    category: "interview",
    difficulty: "hard",
    framework: "STAR",
    tags: ["leadership", "ownership"],
    prompt_style: "behavioral",
    is_active: true
  }
];

const REMIX_PREFIXES = [
  "Explain briefly",
  "Imagine you are answering in a coaching session",
  "Give a concise but thoughtful response to",
  "Respond as if this came up in a high-stakes conversation"
];

export function resolveTopicCategory(input: TopicGenerateInput): TopicCategory {
  if (input.category) {
    return input.category;
  }

  if (input.mode === "manual_framework" && input.frameworkOverride) {
    const category = Object.entries(CATEGORY_TO_FRAMEWORK).find(
      ([, framework]) => framework === input.frameworkOverride
    )?.[0];

    return (category as TopicCategory | undefined) ?? "general_thinking";
  }

  return MODE_TO_CATEGORY[input.mode] ?? "general_thinking";
}

export function selectTopic(input: TopicGenerateInput): Topic {
  const category = resolveTopicCategory(input);
  const difficulty = input.difficulty ?? "medium";
  const excluded = new Set(input.priorTopicIds ?? []);

  const candidates = SEEDED_TOPICS.filter((topic) => {
    if (!topic.is_active) {
      return false;
    }

    if (topic.category !== category) {
      return false;
    }

    if (input.mode === "manual_framework" && input.frameworkOverride) {
      return topic.framework === input.frameworkOverride;
    }

    if (topic.difficulty !== difficulty) {
      return false;
    }

    return true;
  });

  const freshCandidates = candidates.filter((topic) => !excluded.has(topic.id));
  const pool = freshCandidates.length > 0 ? freshCandidates : candidates;

  return remixTopic(pool[0] ?? SEEDED_TOPICS[0]);
}

export function remixTopic(topic: Topic): Topic {
  const hash = topic.title.length % REMIX_PREFIXES.length;
  const prefix = REMIX_PREFIXES[hash];

  return {
    ...topic,
    title: `${prefix}: ${topic.title}`
  };
}
