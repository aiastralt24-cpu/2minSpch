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

const careSubjects = [
  "discipline",
  "confidence",
  "curiosity",
  "emotional intelligence",
  "time management",
  "focus",
  "resilience",
  "patience",
  "teamwork",
  "clear communication",
  "listening",
  "self-awareness",
  "adaptability",
  "decision making",
  "creativity",
  "critical thinking",
  "healthy routines",
  "goal setting",
  "feedback",
  "leadership",
  "problem solving",
  "accountability",
  "empathy",
  "continuous learning",
  "planning",
  "prioritization",
  "trust",
  "discipline under pressure",
  "asking better questions",
  "learning from mistakes",
  "work-life balance",
  "public speaking",
  "digital distraction",
  "personal responsibility",
  "collaboration",
  "handling stress",
  "building habits",
  "staying motivated",
  "thinking before reacting",
  "being consistent"
];

const opinionSubjects = [
  "AI in school education",
  "remote work",
  "a four-day workweek",
  "school uniforms",
  "homework",
  "social media limits for teenagers",
  "online learning",
  "public transport investment",
  "college degrees",
  "team sports",
  "video games",
  "smartphones in classrooms",
  "paid internships",
  "flexible work hours",
  "electric vehicles",
  "urban cycling",
  "performance reviews",
  "standardized testing",
  "financial education in schools",
  "coding for every student",
  "AI writing tools",
  "group projects",
  "gap years",
  "entrepreneurship education",
  "mental health days",
  "open-book exams",
  "office meetings",
  "influencer marketing",
  "privacy regulation",
  "automation at work",
  "cashless payments",
  "wearable technology",
  "climate rules for companies",
  "personal branding",
  "short-form video",
  "public speaking classes",
  "learning a second language",
  "workplace dress codes",
  "subscription apps",
  "digital detox weekends"
];

const starSituations = [
  "handled conflict on a team",
  "missed a deadline and recovered",
  "failed and learned from it",
  "led a project under pressure",
  "gave difficult feedback",
  "received difficult feedback",
  "solved a customer problem",
  "managed competing priorities",
  "worked with a difficult teammate",
  "took ownership without being asked",
  "made a mistake at work",
  "improved a process",
  "adapted to a sudden change",
  "dealt with ambiguity",
  "persuaded someone to change their mind",
  "helped a struggling teammate",
  "handled an angry customer",
  "learned a new skill quickly",
  "managed a project with limited resources",
  "found a creative solution",
  "resolved a misunderstanding",
  "led a meeting",
  "balanced quality and speed",
  "used data to make a decision",
  "spotted a risk early",
  "owned a communication gap",
  "improved team morale",
  "supported a high-stakes launch",
  "de-escalated tension",
  "changed your approach after feedback",
  "handled pressure from multiple stakeholders",
  "made a tough tradeoff",
  "mentored someone",
  "recovered from a presentation mistake",
  "coordinated across teams",
  "managed uncertainty",
  "delivered bad news professionally",
  "built trust with a new team",
  "challenged an idea respectfully",
  "turned a weak result into a better one"
];

const lenses = [
  "in everyday life",
  "at work",
  "for students",
  "for leaders",
  "in a team",
  "during stressful situations",
  "when learning something new",
  "while working with others",
  "in modern careers",
  "when making important decisions",
  "during interviews",
  "in remote teams",
  "when building habits",
  "in school or college",
  "when facing uncertainty"
];

const careTemplates: Record<Topic["difficulty"], string[]> = {
  easy: [
    "Why is {subject} important {lens}?",
    "How does {subject} help people {lens}?",
    "What makes {subject} useful {lens}?"
  ],
  medium: [
    "What makes someone strong at {subject} {lens}?",
    "How can a person improve {subject} {lens}?",
    "Why do people struggle with {subject} {lens}?"
  ],
  hard: [
    "How should someone balance {subject} with competing priorities {lens}?",
    "When can too much focus on {subject} become a weakness {lens}?",
    "How does {subject} shape long-term success {lens}?"
  ]
};

const opinionTemplates: Record<Topic["difficulty"], string[]> = {
  easy: [
    "Is {subject} a good idea?",
    "Should more people support {subject}?",
    "Is {subject} helpful overall?"
  ],
  medium: [
    "Should {subject} become more common?",
    "Is {subject} better than the traditional approach?",
    "Does {subject} create more benefits than problems?"
  ],
  hard: [
    "Should society rely more heavily on {subject}?",
    "Would {subject} improve outcomes if used at scale?",
    "Are the risks of {subject} worth the potential benefits?"
  ]
};

const starTemplates: Record<Topic["difficulty"], string[]> = {
  easy: [
    "Tell me about a time you {situation}.",
    "Describe a situation where you {situation}."
  ],
  medium: [
    "Tell me about a time you {situation} and what you learned.",
    "Describe a time you {situation} with a clear outcome."
  ],
  hard: [
    "Tell me about a high-pressure situation where you {situation}.",
    "Describe a time you {situation} when the stakes were high."
  ]
};

function titleCaseId(value: string) {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 70);
}

function buildGeneratedTopics(): Topic[] {
  const topics: Topic[] = [];

  for (const difficulty of ["easy", "medium", "hard"] as const) {
    for (const subject of careSubjects) {
      for (const lens of lenses) {
        const templates = careTemplates[difficulty];
        const template = templates[(subject.length + lens.length) % templates.length];
        const title = template.replace("{subject}", subject).replace("{lens}", lens);
        topics.push({
          id: `generated-care-${difficulty}-${titleCaseId(title)}`,
          title,
          category: "general_thinking",
          difficulty,
          framework: "CARE",
          tags: [subject, lens],
          prompt_style: "reflective",
          is_active: true
        });
      }
    }

    for (const subject of opinionSubjects) {
      for (const template of opinionTemplates[difficulty]) {
        const title = template.replace("{subject}", subject);
        topics.push({
          id: `generated-prep-${difficulty}-${titleCaseId(title)}`,
          title,
          category: "opinion",
          difficulty,
          framework: "PREP",
          tags: [subject],
          prompt_style: "debate",
          is_active: true
        });
      }
    }

    for (const situation of starSituations) {
      for (const template of starTemplates[difficulty]) {
        const title = template.replace("{situation}", situation);
        topics.push({
          id: `generated-star-${difficulty}-${titleCaseId(title)}`,
          title,
          category: "interview",
          difficulty,
          framework: "STAR",
          tags: [situation],
          prompt_style: "behavioral",
          is_active: true
        });
      }
    }
  }

  return topics;
}

export const TOPIC_BANK: Topic[] = [...SEEDED_TOPICS, ...buildGeneratedTopics()];

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

  const candidates = TOPIC_BANK.filter((topic) => {
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
  const randomIndex = pool.length > 0 ? Math.floor(Math.random() * pool.length) : 0;

  return pool[randomIndex] ?? SEEDED_TOPICS[0];
}
