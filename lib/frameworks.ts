import { FrameworkDefinition, FrameworkKey, TopicCategory } from "@/lib/types";

export const FRAMEWORK_DEFINITIONS: Record<FrameworkKey, FrameworkDefinition> = {
  CARE: {
    key: "CARE",
    name: "CARE",
    summary: "Great for structured thinking prompts where you need a grounded answer.",
    components: [
      { key: "context", label: "Context", description: "Set up the situation or lens." },
      { key: "answer", label: "Answer", description: "State your main answer clearly." },
      { key: "reason", label: "Reason", description: "Explain the logic behind it." },
      { key: "example", label: "Example", description: "Make it concrete with a real example." }
    ],
    useCases: ["General thinking", "Clear explanations", "Reflection"]
  },
  PREP: {
    key: "PREP",
    name: "PREP",
    summary: "Best for opinions and persuasive answers that need a strong stance.",
    components: [
      { key: "point_open", label: "Point", description: "Lead with your opinion or stance." },
      { key: "reason", label: "Reason", description: "Explain why you think that." },
      { key: "example", label: "Example", description: "Back it up with a concrete example." },
      { key: "point_close", label: "Re-point", description: "Restate the point with confidence." }
    ],
    useCases: ["Opinions", "Quick persuasion", "Debate prompts"]
  },
  STAR: {
    key: "STAR",
    name: "STAR",
    summary: "Ideal for behavioral and interview storytelling with outcome focus.",
    components: [
      { key: "situation", label: "Situation", description: "Describe the setting and challenge." },
      { key: "task", label: "Task", description: "Clarify your responsibility." },
      { key: "action", label: "Action", description: "Explain what you did." },
      { key: "result", label: "Result", description: "Show the outcome and impact." }
    ],
    useCases: ["Behavioral interviews", "Story-based responses", "Leadership examples"]
  }
};

export const CATEGORY_TO_FRAMEWORK: Record<TopicCategory, FrameworkKey> = {
  general_thinking: "CARE",
  opinion: "PREP",
  interview: "STAR"
};

export const MODE_TO_CATEGORY: Partial<Record<string, TopicCategory>> = {
  general: "general_thinking",
  opinion: "opinion",
  interview: "interview"
};

export const FRAMEWORK_GUIDANCE = Object.values(FRAMEWORK_DEFINITIONS).map((framework) => ({
  key: framework.key,
  title: framework.name,
  summary: framework.summary,
  bullets: framework.components.map((component) => `${component.label}: ${component.description}`)
}));
