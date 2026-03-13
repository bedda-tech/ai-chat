export type PromptCategory =
  | "writing"
  | "coding"
  | "analysis"
  | "research"
  | "creative"
  | "business";

export type PromptTemplate = {
  id: string;
  title: string;
  prompt: string;
  category: PromptCategory;
  modelId?: string;
};

export const PROMPT_CATEGORIES: { id: PromptCategory; label: string; emoji: string }[] = [
  { id: "writing", label: "Writing", emoji: "✍️" },
  { id: "coding", label: "Coding", emoji: "💻" },
  { id: "analysis", label: "Analysis", emoji: "📊" },
  { id: "research", label: "Research", emoji: "🔍" },
  { id: "creative", label: "Creative", emoji: "🎨" },
  { id: "business", label: "Business", emoji: "💼" },
];

export const PROMPT_TEMPLATES: PromptTemplate[] = [
  // Writing
  {
    id: "writing-blog-post",
    category: "writing",
    title: "Blog post draft",
    prompt:
      "Write a compelling blog post about [topic]. Include an engaging introduction, 3-5 main points with supporting details, and a strong conclusion with a call to action. Target audience: [audience]. Tone: [tone].",
  },
  {
    id: "writing-email",
    category: "writing",
    title: "Professional email",
    prompt:
      "Write a professional email to [recipient] about [subject]. The email should be concise, polite, and clearly communicate [main goal]. Include a subject line.",
  },
  {
    id: "writing-cover-letter",
    category: "writing",
    title: "Cover letter",
    prompt:
      "Write a cover letter for a [job title] position at [company]. Highlight my experience in [key skills/experience]. Make it compelling, personalized, and under 300 words.",
  },
  {
    id: "writing-summary",
    category: "writing",
    title: "Summarize text",
    prompt:
      "Summarize the following text in 3-5 bullet points, capturing the key ideas and main takeaways:\n\n[paste your text here]",
  },
  {
    id: "writing-improve",
    category: "writing",
    title: "Improve my writing",
    prompt:
      "Please improve the following text for clarity, grammar, and style. Keep the original meaning and tone. Show the revised version and briefly explain the key changes:\n\n[paste your text here]",
  },

  // Coding
  {
    id: "coding-react-component",
    category: "coding",
    title: "React component",
    prompt:
      "Write a React component with TypeScript for [description]. Include proper types, handle loading/error states, and follow best practices. Use Tailwind CSS for styling.",
    modelId: "xai-grok-code-fast-1",
  },
  {
    id: "coding-api-endpoint",
    category: "coding",
    title: "API endpoint",
    prompt:
      "Write a [language/framework] API endpoint for [functionality]. Include input validation, error handling, and proper HTTP status codes. Add a brief usage example.",
    modelId: "xai-grok-code-fast-1",
  },
  {
    id: "coding-debug",
    category: "coding",
    title: "Debug my code",
    prompt:
      "I have a bug in my code. Here's what it's supposed to do: [description]. Here's the error I'm getting: [error]. Here's the code:\n\n```\n[paste code here]\n```\n\nWhat's wrong and how do I fix it?",
  },
  {
    id: "coding-explain",
    category: "coding",
    title: "Explain code",
    prompt:
      "Explain what this code does step by step. Include what each part does and any potential issues or improvements:\n\n```\n[paste code here]\n```",
  },
  {
    id: "coding-sql",
    category: "coding",
    title: "SQL query",
    prompt:
      "Write a SQL query to [description]. The database has the following tables:\n\n[describe tables/schema]\n\nOptimize the query for performance if possible.",
  },
  {
    id: "coding-regex",
    category: "coding",
    title: "Write a regex",
    prompt:
      "Write a regular expression that matches [description]. Explain how it works and provide example inputs that should match and ones that should not.",
  },

  // Analysis
  {
    id: "analysis-data",
    category: "analysis",
    title: "Analyze data",
    prompt:
      "Analyze the following data and provide key insights, trends, and actionable recommendations:\n\n[paste data here]",
  },
  {
    id: "analysis-pros-cons",
    category: "analysis",
    title: "Pros and cons",
    prompt:
      "Give me a thorough pros and cons analysis of [topic/decision]. Consider short-term and long-term implications, and provide a recommendation at the end.",
  },
  {
    id: "analysis-compare",
    category: "analysis",
    title: "Compare options",
    prompt:
      "Compare [option A] vs [option B] across the following dimensions: [criteria]. Present this as a structured comparison table followed by a recommendation.",
  },
  {
    id: "analysis-feedback",
    category: "analysis",
    title: "Critical feedback",
    prompt:
      "Give me critical, honest feedback on the following. Don't hold back — I want to know the weaknesses, gaps, and what could be improved:\n\n[paste content here]",
  },

  // Research
  {
    id: "research-explain",
    category: "research",
    title: "Explain a concept",
    prompt:
      "Explain [concept] in simple terms that a smart non-expert would understand. Include: what it is, why it matters, how it works, and a real-world analogy.",
    modelId: "anthropic-claude-sonnet-4.5",
  },
  {
    id: "research-literature",
    category: "research",
    title: "Research overview",
    prompt:
      "Give me a comprehensive overview of the current state of research on [topic]. Cover the main findings, open questions, key researchers/papers, and practical implications.",
    modelId: "anthropic-claude-sonnet-4.5",
  },
  {
    id: "research-fact-check",
    category: "research",
    title: "Fact check a claim",
    prompt:
      'Fact-check the following claim: "[claim]". What does the evidence say? Is it true, false, misleading, or nuanced? Explain your reasoning.',
  },
  {
    id: "research-history",
    category: "research",
    title: "Historical context",
    prompt:
      "Give me the historical context and background of [event/topic]. What led up to it, what happened, what were the consequences, and what can we learn from it?",
  },

  // Creative
  {
    id: "creative-image",
    category: "creative",
    title: "Generate an image",
    prompt:
      "Create a detailed, photorealistic image of [description]. The scene should have [lighting], [mood], and [style].",
    modelId: "google-gemini-2.5-flash-image-preview",
  },
  {
    id: "creative-story",
    category: "creative",
    title: "Short story",
    prompt:
      "Write a short story (500-800 words) about [premise]. Genre: [genre]. Include vivid descriptions, interesting characters, and a satisfying ending.",
  },
  {
    id: "creative-brainstorm",
    category: "creative",
    title: "Brainstorm ideas",
    prompt:
      "Brainstorm 15 creative ideas for [topic]. Be bold and think outside the box. Include both safe/practical options and wilder, unconventional ones.",
  },
  {
    id: "creative-names",
    category: "creative",
    title: "Name ideas",
    prompt:
      "Generate 20 name ideas for [product/company/project]. It should evoke [feeling/attribute]. Include: modern/tech names, classic names, made-up words, and descriptive names.",
  },
  {
    id: "creative-poem",
    category: "creative",
    title: "Write a poem",
    prompt:
      "Write a poem about [subject]. Style: [haiku/sonnet/free verse/etc]. Tone: [tone]. Make it evocative and memorable.",
  },

  // Business
  {
    id: "business-pitch",
    category: "business",
    title: "Startup pitch",
    prompt:
      "Write a compelling one-page startup pitch for [idea]. Include: the problem, your solution, target market, business model, traction (or potential), and why now.",
  },
  {
    id: "business-marketing",
    category: "business",
    title: "Marketing copy",
    prompt:
      "Write marketing copy for [product/service]. Target audience: [audience]. Channel: [website/ad/email/social]. Tone: [tone]. Emphasize the key benefit: [benefit]. Include a strong CTA.",
  },
  {
    id: "business-plan",
    category: "business",
    title: "Business plan outline",
    prompt:
      "Create a detailed business plan outline for [business idea]. Include: executive summary, market analysis, competitive landscape, go-to-market strategy, operations, and financial projections structure.",
  },
  {
    id: "business-job-description",
    category: "business",
    title: "Job description",
    prompt:
      "Write a compelling job description for a [role] at [company type]. Include: responsibilities, requirements (must-have vs nice-to-have), what makes this role exciting, and your company culture.",
  },
  {
    id: "business-okrs",
    category: "business",
    title: "OKRs / Goal setting",
    prompt:
      "Help me create OKRs (Objectives and Key Results) for [team/department/company] for [time period]. Our main focus areas are: [areas]. Make them ambitious but achievable.",
  },
];

export function getPromptsByCategory(category: PromptCategory): PromptTemplate[] {
  return PROMPT_TEMPLATES.filter((t) => t.category === category);
}
