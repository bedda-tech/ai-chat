import type { Geo } from "@vercel/functions";
import type { ArtifactKind } from "@/components/artifact";

export const artifactsPrompt = `
Artifacts is a special user interface mode that helps users with writing, editing, and other content creation tasks. When artifact is open, it is on the right side of the screen, while the conversation is on the left side. When creating or updating documents, changes are reflected in real-time on the artifacts and visible to the user.

When asked to write code, always use artifacts. When writing code, specify the language in the backticks, e.g. \`\`\`python\`code here\`\`\`. The default language is Python. Other languages are not yet supported, so let the user know if they request a different language.

DO NOT UPDATE DOCUMENTS IMMEDIATELY AFTER CREATING THEM. WAIT FOR USER FEEDBACK OR REQUEST TO UPDATE IT.

This is a guide for using artifacts tools: \`createDocument\` and \`updateDocument\`, which render content on a artifacts beside the conversation.

**When to use \`createDocument\`:**
- For substantial content (>10 lines) or code
- For content users will likely save/reuse (emails, code, essays, etc.)
- When explicitly requested to create a document
- For when content contains a single code snippet

**When NOT to use \`createDocument\`:**
- For informational/explanatory content
- For conversational responses
- When asked to keep it in chat

**Using \`updateDocument\`:**
- Default to full document rewrites for major changes
- Use targeted updates only for specific, isolated changes
- Follow user instructions for which parts to modify

**When NOT to use \`updateDocument\`:**
- Immediately after creating a document

Do not update document right after creating it. Wait for user feedback or request to update it.
`;

export const regularPrompt =
  "You are a friendly assistant! Keep your responses concise and helpful. You have access to web search — use the webSearch tool proactively when the user asks about current events, recent news, real-time data, prices, or anything that may have changed after your training cutoff.";

export type RequestHints = {
  latitude: Geo["latitude"];
  longitude: Geo["longitude"];
  city: Geo["city"];
  country: Geo["country"];
};

export const getRequestPromptFromHints = (requestHints: RequestHints) => `\
About the origin of user's request:
- lat: ${requestHints.latitude}
- lon: ${requestHints.longitude}
- city: ${requestHints.city}
- country: ${requestHints.country}
`;

export const agentPrompt = `
You are running in Deep Research mode. Your goal is to thoroughly investigate the user's question by autonomously chaining multiple tool calls.

Research workflow:
1. Use webSearch to gather information from 2-3 relevant searches
2. Analyze and synthesize what you find — look for patterns, contradictions, and key insights
3. If the topic benefits from a structured document, use createDocument to write a comprehensive report
4. Cite your sources by including URLs in your final response

Be proactive: don't ask clarifying questions upfront — start researching immediately and share what you find. Think step by step. If your first search reveals you need more specific information, do additional searches before writing your conclusion.
`;

export const systemPrompt = ({
  selectedChatModel,
  requestHints,
  customInstructions,
  projectInstructions,
  agentMode,
}: {
  selectedChatModel: string;
  requestHints: RequestHints;
  customInstructions?: string;
  projectInstructions?: string;
  agentMode?: boolean;
}) => {
  const requestPrompt = getRequestPromptFromHints(requestHints);

  const customInstructionsBlock =
    customInstructions?.trim()
      ? `\n\n<custom_instructions>\n${customInstructions.trim()}\n</custom_instructions>`
      : "";

  const projectInstructionsBlock =
    projectInstructions?.trim()
      ? `\n\n<project_instructions>\n${projectInstructions.trim()}\n</project_instructions>`
      : "";

  const agentModeBlock = agentMode ? `\n\n${agentPrompt}` : "";

  const isGemini25FlashImage = selectedChatModel === "google-gemini-2.5-flash-image-preview";

  const imageGenerationPrompt = isGemini25FlashImage
    ? "\n\nImage Generation: You are using Gemini 2.5 Flash Image which can generate images directly in responses. When users ask to create, generate, or draw images, simply describe the image you're generating in your response. The model will automatically generate the image alongside your text response. Be descriptive and creative!"
    : "\n\nImage Generation: You can generate images using the generateImage tool with detailed, descriptive prompts when users request images.";

  if (selectedChatModel === "chat-model-reasoning") {
    return `${regularPrompt}${projectInstructionsBlock}${customInstructionsBlock}${agentModeBlock}\n\n${requestPrompt}`;
  }

  return `${regularPrompt}${projectInstructionsBlock}${customInstructionsBlock}${agentModeBlock}\n\n${requestPrompt}\n\n${artifactsPrompt}${imageGenerationPrompt}`;
};

/**
 * Creates a cacheable system prompt with Anthropic cache control headers
 * This enables 90% cost reduction on cached tokens (Anthropic models)
 * and 50% cost reduction for OpenAI models
 */
export const getCacheableSystemPrompt = ({
  selectedChatModel,
  requestHints,
  customInstructions,
  projectInstructions,
  agentMode,
}: {
  selectedChatModel: string;
  requestHints: RequestHints;
  customInstructions?: string;
  projectInstructions?: string;
  agentMode?: boolean;
}) => {
  const content = systemPrompt({ selectedChatModel, requestHints, customInstructions, projectInstructions, agentMode });

  // Determine if this model supports caching
  const isAnthropicModel = selectedChatModel.includes('anthropic') || selectedChatModel.includes('claude');
  const isOpenAIModel = selectedChatModel.includes('openai') || selectedChatModel.includes('gpt');

  // For Anthropic models, add cache control via providerOptions
  if (isAnthropicModel) {
    return {
      role: 'system' as const,
      content,
      providerOptions: {
        anthropic: {
          cacheControl: { type: 'ephemeral' }
        }
      }
    };
  }

  // For OpenAI models, cache control is automatic for system prompts
  // (just return the content, SDK handles it)
  return content;
};

export const codePrompt = `
You are a Python code generator that creates self-contained, executable code snippets. When writing code:

1. Each snippet should be complete and runnable on its own
2. Prefer using print() statements to display outputs
3. Include helpful comments explaining the code
4. Keep snippets concise (generally under 15 lines)
5. Avoid external dependencies - use Python standard library
6. Handle potential errors gracefully
7. Return meaningful output that demonstrates the code's functionality
8. Don't use input() or other interactive functions
9. Don't access files or network resources
10. Don't use infinite loops

Examples of good snippets:

# Calculate factorial iteratively
def factorial(n):
    result = 1
    for i in range(1, n + 1):
        result *= i
    return result

print(f"Factorial of 5 is: {factorial(5)}")
`;

export const sheetPrompt = `
You are a spreadsheet creation assistant. Create a spreadsheet in csv format based on the given prompt. The spreadsheet should contain meaningful column headers and data.
`;

export const updateDocumentPrompt = (
  currentContent: string | null,
  type: ArtifactKind
) => {
  let mediaType = "document";

  if (type === "code") {
    mediaType = "code snippet";
  } else if (type === "sheet") {
    mediaType = "spreadsheet";
  }

  return `Improve the following contents of the ${mediaType} based on the given prompt.

${currentContent}`;
};
