import crypto from "node:crypto";
import { gateway } from "@ai-sdk/gateway";
import { generateText } from "ai";
import { after } from "next/server";

const GITHUB_WEBHOOK_SECRET = process.env.GITHUB_WEBHOOK_SECRET ?? "";
const GITHUB_TOKEN = process.env.GITHUB_TOKEN ?? "";
const GITHUB_DEFAULT_MODEL =
  process.env.GITHUB_DEFAULT_MODEL ?? "anthropic/claude-sonnet-4-6";
// Set GITHUB_AUTO_REVIEW=true to have Bedda review every opened PR automatically.
// When false (default), Bedda only responds when @bedda is mentioned.
const GITHUB_AUTO_REVIEW = process.env.GITHUB_AUTO_REVIEW === "true";

const MODEL_ALIASES: Record<string, string> = {
  claude: "anthropic/claude-sonnet-4-6",
  "claude-opus": "anthropic/claude-opus-4-8",
  "claude-sonnet": "anthropic/claude-sonnet-4-6",
  "claude-haiku": "anthropic/claude-haiku-4.5",
  gpt: "openai/gpt-5",
  "gpt-5": "openai/gpt-5",
  "gpt-5-mini": "openai/gpt-5-mini",
  "gpt-4o": "openai/gpt-4o",
  "gpt-4o-mini": "openai/gpt-4o-mini",
  gemini: "google/gemini-2.5-flash",
  "gemini-pro": "google/gemini-2.5-pro",
  grok: "xai/grok-4",
  "grok-4": "xai/grok-4",
  mistral: "mistral/mistral-large-latest",
  deepseek: "deepseek/deepseek-r1",
  "deepseek-v3": "deepseek/deepseek-v3.1",
  kimi: "moonshotai/kimi-k2-turbo",
};

// Parse optional model prefix from comment: [alias] question  or  --model=alias question
function parseModelAndText(raw: string): { model: string; text: string } {
  const bracketMatch = raw.match(/^\[([^\]]+)\]\s*([\s\S]*)$/);
  if (bracketMatch) {
    const alias = bracketMatch[1].toLowerCase().trim();
    const model = MODEL_ALIASES[alias];
    if (model) {
      return { model, text: bracketMatch[2].trim() };
    }
  }
  const flagMatch = raw.match(/^--model=(\S+)\s*([\s\S]*)$/i);
  if (flagMatch) {
    const alias = flagMatch[1].toLowerCase();
    const model = MODEL_ALIASES[alias];
    if (model) {
      return { model, text: flagMatch[2].trim() };
    }
  }
  return { model: GITHUB_DEFAULT_MODEL, text: raw };
}

function verifyGitHubSignature(
  secret: string,
  payload: string,
  sig: string
): boolean {
  if (!secret || !sig.startsWith("sha256=")) {
    return false;
  }
  const expected =
    "sha256=" +
    crypto.createHmac("sha256", secret).update(payload).digest("hex");
  try {
    return crypto.timingSafeEqual(Buffer.from(expected), Buffer.from(sig));
  } catch {
    return false;
  }
}

function githubHeaders(): Record<string, string> {
  return {
    Authorization: `Bearer ${GITHUB_TOKEN}`,
    Accept: "application/vnd.github.v3+json",
    "Content-Type": "application/json",
    "X-GitHub-Api-Version": "2022-11-28",
    "User-Agent": "Bedda-AI-Bot/1.0",
  };
}

async function getPRDiff(
  owner: string,
  repo: string,
  prNumber: number
): Promise<string> {
  try {
    const res = await fetch(
      `https://api.github.com/repos/${owner}/${repo}/pulls/${prNumber}`,
      {
        headers: {
          ...githubHeaders(),
          Accept: "application/vnd.github.diff",
        },
      }
    );
    if (!res.ok) {
      return "";
    }
    const diff = await res.text();
    // Truncate to stay within model context limits (~12k chars ≈ 3k tokens)
    return diff.length > 12_000
      ? `${diff.slice(0, 12_000)}\n... (diff truncated)`
      : diff;
  } catch {
    return "";
  }
}

async function postComment(
  owner: string,
  repo: string,
  issueNumber: number,
  body: string
): Promise<void> {
  const res = await fetch(
    `https://api.github.com/repos/${owner}/${repo}/issues/${issueNumber}/comments`,
    {
      method: "POST",
      headers: githubHeaders(),
      body: JSON.stringify({ body }),
    }
  );
  if (!res.ok) {
    console.error("[github] postComment failed:", res.status, await res.text());
  }
}

type GitHubRepo = {
  name: string;
  owner: { login: string };
};

type GitHubPR = {
  number: number;
  title: string;
  body?: string;
  head: { ref: string };
  base: { ref: string };
};

type GitHubIssue = {
  number: number;
  title: string;
  body?: string;
};

type GitHubComment = {
  body?: string;
  user?: { login: string };
  id: number;
};

export async function POST(req: Request) {
  if (!GITHUB_WEBHOOK_SECRET || !GITHUB_TOKEN) {
    return new Response("GitHub credentials not configured", { status: 503 });
  }

  const rawBody = await req.text();
  const sig = req.headers.get("X-Hub-Signature-256") ?? "";
  const event = req.headers.get("X-GitHub-Event") ?? "";

  if (!verifyGitHubSignature(GITHUB_WEBHOOK_SECRET, rawBody, sig)) {
    return new Response("Invalid signature", { status: 401 });
  }

  const payload = JSON.parse(rawBody) as Record<string, unknown>;
  const action = payload.action as string;
  const repo = payload.repository as GitHubRepo;
  const owner = repo.owner.login;
  const repoName = repo.name;

  // PR opened → code review (if auto-review enabled or @bedda in PR body/title)
  if (event === "pull_request" && action === "opened") {
    const pr = payload.pull_request as GitHubPR;
    const prTitle = pr.title;
    const prBody = pr.body ?? "";
    const mentionedInPR =
      prTitle.toLowerCase().includes("@bedda") ||
      prBody.toLowerCase().includes("@bedda");

    if (!GITHUB_AUTO_REVIEW && !mentionedInPR) {
      return new Response("OK");
    }

    after(async () => {
      try {
        const diff = await getPRDiff(owner, repoName, pr.number);
        const { text } = await generateText({
          model: gateway.languageModel(GITHUB_DEFAULT_MODEL),
          system:
            "You are Bedda, an AI code reviewer with access to Claude, GPT, Gemini, Grok, and 36+ models. Review pull requests concisely. Focus on bugs, security, and code quality. Use GitHub Markdown. Keep reviews under 600 words.",
          messages: [
            {
              role: "user",
              content: `Review this PR:\n\n**Title**: ${prTitle}\n**Branch**: ${pr.head.ref} → ${pr.base.ref}\n**Description**: ${prBody || "(none)"}\n\n**Diff**:\n\`\`\`diff\n${diff || "(diff unavailable)"}\n\`\`\``,
            },
          ],
          maxOutputTokens: 900,
        });
        await postComment(
          owner,
          repoName,
          pr.number,
          `## 🤖 Bedda AI Code Review\n\n${text}\n\n---\n*Powered by [Bedda AI](https://bedda.ai) — multi-model AI for your team*`
        );
      } catch (err) {
        console.error("[github] PR review error:", err);
      }
    });

    return new Response("OK");
  }

  // Issue opened with @bedda mention → triage / answer
  if (event === "issues" && action === "opened") {
    const issue = payload.issue as GitHubIssue;
    const issueTitle = issue.title;
    const issueBody = issue.body ?? "";

    if (
      !issueTitle.toLowerCase().includes("@bedda") &&
      !issueBody.toLowerCase().includes("@bedda")
    ) {
      return new Response("OK");
    }

    const question = issueBody.replace(/@bedda/gi, "").trim() || issueTitle;
    const { model, text: userText } = parseModelAndText(question);

    after(async () => {
      try {
        const { text } = await generateText({
          model: gateway.languageModel(model),
          system:
            "You are Bedda, an AI assistant inside GitHub. Help with code questions, bug reports, and issue triage. Use GitHub Markdown. Be concise and technical.",
          messages: [{ role: "user", content: userText }],
          maxOutputTokens: 800,
        });
        await postComment(owner, repoName, issue.number, text);
      } catch (err) {
        console.error("[github] issue response error:", err);
      }
    });

    return new Response("OK");
  }

  // @bedda mentioned in an issue comment → reply
  if (event === "issue_comment" && action === "created") {
    const comment = payload.comment as GitHubComment;
    const commentBody = comment.body ?? "";

    if (!commentBody.toLowerCase().includes("@bedda")) {
      return new Response("OK");
    }

    const issue = payload.issue as GitHubIssue;
    const question = commentBody.replace(/@bedda/gi, "").trim();
    if (!question) {
      return new Response("OK");
    }

    const { model, text: userText } = parseModelAndText(question);

    after(async () => {
      try {
        const { text } = await generateText({
          model: gateway.languageModel(model),
          system:
            "You are Bedda, an AI assistant inside GitHub. Help with code questions, PR reviews, and issue triage. Use GitHub Markdown. Be concise and technical. Users can prefix messages with [model-alias] to choose a model, e.g. [gpt-5], [claude-opus], [grok-4], [gemini].",
          messages: [{ role: "user", content: userText }],
          maxOutputTokens: 800,
        });
        await postComment(owner, repoName, issue.number, text);
      } catch (err) {
        console.error("[github] comment response error:", err);
      }
    });

    return new Response("OK");
  }

  // @bedda mentioned in a PR review comment → reply
  if (event === "pull_request_review_comment" && action === "created") {
    const comment = payload.comment as GitHubComment;
    const commentBody = comment.body ?? "";

    if (!commentBody.toLowerCase().includes("@bedda")) {
      return new Response("OK");
    }

    const pr = payload.pull_request as GitHubPR;
    const question = commentBody.replace(/@bedda/gi, "").trim();
    if (!question) {
      return new Response("OK");
    }

    const { model, text: userText } = parseModelAndText(question);

    after(async () => {
      try {
        const { text } = await generateText({
          model: gateway.languageModel(model),
          system:
            "You are Bedda, an AI code reviewer inside GitHub. Answer questions about code changes in pull request review comments. Use GitHub Markdown. Be concise and technical.",
          messages: [{ role: "user", content: userText }],
          maxOutputTokens: 800,
        });
        await postComment(owner, repoName, pr.number, text);
      } catch (err) {
        console.error("[github] PR review comment response error:", err);
      }
    });

    return new Response("OK");
  }

  return new Response("OK");
}
