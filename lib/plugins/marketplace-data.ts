export type MarketplaceCategory =
  | "Productivity"
  | "Developer"
  | "Data"
  | "Communication"
  | "Finance";

export type MarketplaceParam = {
  name: string;
  label: string;
  placeholder: string;
  required: boolean;
  secret?: boolean;
};

export type MarketplacePlugin = {
  id: string;
  name: string;
  description: string;
  category: MarketplaceCategory;
  author: string;
  icon: string;
  webhookUrlTemplate: string;
  webhookToolName: string;
  webhookToolDescription: string;
  params: MarketplaceParam[];
  parametersSchema: Record<string, unknown>;
};

export const MARKETPLACE_PLUGINS: MarketplacePlugin[] = [
  // Productivity
  {
    id: "notion-create-page",
    name: "Notion Page Creator",
    description:
      "Create Notion pages directly from chat. Tell the AI to save notes, summaries, or research to your Notion workspace.",
    category: "Productivity",
    author: "Bedda",
    icon: "📝",
    webhookUrlTemplate: "https://api.notion.com/v1/pages",
    webhookToolName: "create_notion_page",
    webhookToolDescription:
      "Create a new Notion page with the given title and content",
    params: [
      {
        name: "notionToken",
        label: "Notion Integration Token",
        placeholder: "secret_...",
        required: true,
        secret: true,
      },
      {
        name: "parentPageId",
        label: "Parent Page ID",
        placeholder: "xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx",
        required: true,
      },
    ],
    parametersSchema: {
      type: "object",
      properties: {
        title: { type: "string", description: "Page title" },
        content: { type: "string", description: "Page content in plain text" },
      },
      required: ["title", "content"],
    },
  },
  {
    id: "todoist-task",
    name: "Todoist Task Creator",
    description:
      "Add tasks to Todoist from chat. Ask the AI to capture action items or to-dos directly to your task list.",
    category: "Productivity",
    author: "Bedda",
    icon: "✅",
    webhookUrlTemplate: "https://api.todoist.com/rest/v2/tasks",
    webhookToolName: "create_todoist_task",
    webhookToolDescription: "Create a new task in Todoist",
    params: [
      {
        name: "todoistApiKey",
        label: "Todoist API Token",
        placeholder: "your-api-token",
        required: true,
        secret: true,
      },
      {
        name: "projectId",
        label: "Project ID (optional)",
        placeholder: "leave blank for inbox",
        required: false,
      },
    ],
    parametersSchema: {
      type: "object",
      properties: {
        content: { type: "string", description: "Task content" },
        due_string: {
          type: "string",
          description: "Due date in natural language, e.g. 'tomorrow'",
        },
        priority: { type: "number", description: "Priority 1-4 (4=urgent)" },
      },
      required: ["content"],
    },
  },
  {
    id: "google-calendar-event",
    name: "Google Calendar Event",
    description:
      "Schedule events in Google Calendar from chat. Ask the AI to book meetings, set reminders, or create calendar entries.",
    category: "Productivity",
    author: "Bedda",
    icon: "📅",
    webhookUrlTemplate: "https://hooks.zapier.com/hooks/catch/{your-zap-id}/",
    webhookToolName: "create_calendar_event",
    webhookToolDescription:
      "Create an event in Google Calendar via Zapier webhook",
    params: [
      {
        name: "zapierWebhookUrl",
        label: "Zapier Webhook URL",
        placeholder: "https://hooks.zapier.com/hooks/catch/...",
        required: true,
      },
    ],
    parametersSchema: {
      type: "object",
      properties: {
        title: { type: "string", description: "Event title" },
        start_time: {
          type: "string",
          description: "Start time in ISO 8601 format",
        },
        end_time: {
          type: "string",
          description: "End time in ISO 8601 format",
        },
        description: { type: "string", description: "Event description" },
      },
      required: ["title", "start_time", "end_time"],
    },
  },
  {
    id: "linear-issue",
    name: "Linear Issue Creator",
    description:
      "Create Linear issues from chat. Capture bugs, feature requests, and tasks directly in your Linear workspace.",
    category: "Productivity",
    author: "Bedda",
    icon: "🎯",
    webhookUrlTemplate: "https://api.linear.app/graphql",
    webhookToolName: "create_linear_issue",
    webhookToolDescription: "Create a new issue in Linear",
    params: [
      {
        name: "linearApiKey",
        label: "Linear API Key",
        placeholder: "lin_api_...",
        required: true,
        secret: true,
      },
      {
        name: "teamId",
        label: "Team ID",
        placeholder: "your-team-id",
        required: true,
      },
    ],
    parametersSchema: {
      type: "object",
      properties: {
        title: { type: "string", description: "Issue title" },
        description: { type: "string", description: "Issue description" },
        priority: {
          type: "number",
          description: "Priority 0-4 (0=no priority, 1=urgent)",
        },
      },
      required: ["title"],
    },
  },
  {
    id: "obsidian-note",
    name: "Obsidian Note Creator",
    description:
      "Save AI-generated content directly to your Obsidian vault using the Local REST API plugin.",
    category: "Productivity",
    author: "Bedda",
    icon: "🧠",
    webhookUrlTemplate: "https://127.0.0.1:27124/vault/{note-path}",
    webhookToolName: "create_obsidian_note",
    webhookToolDescription:
      "Create or update a note in Obsidian via the Local REST API plugin",
    params: [
      {
        name: "obsidianApiKey",
        label: "Obsidian REST API Key",
        placeholder: "your-api-key",
        required: true,
        secret: true,
      },
      {
        name: "obsidianHost",
        label: "Obsidian Host URL",
        placeholder: "https://127.0.0.1:27124",
        required: true,
      },
    ],
    parametersSchema: {
      type: "object",
      properties: {
        filename: {
          type: "string",
          description: "Note filename (e.g. 'Notes/my-note.md')",
        },
        content: { type: "string", description: "Note content in Markdown" },
      },
      required: ["filename", "content"],
    },
  },

  // Developer
  {
    id: "github-issue",
    name: "GitHub Issue Creator",
    description:
      "File GitHub issues from chat. Capture bugs, ideas, and feature requests to any GitHub repo without leaving the conversation.",
    category: "Developer",
    author: "Bedda",
    icon: "🐙",
    webhookUrlTemplate: "https://api.github.com/repos/{owner}/{repo}/issues",
    webhookToolName: "create_github_issue",
    webhookToolDescription:
      "Create a GitHub issue in the configured repository",
    params: [
      {
        name: "githubToken",
        label: "GitHub Personal Access Token",
        placeholder: "ghp_...",
        required: true,
        secret: true,
      },
      {
        name: "owner",
        label: "Repo Owner",
        placeholder: "octocat",
        required: true,
      },
      {
        name: "repo",
        label: "Repository Name",
        placeholder: "my-repo",
        required: true,
      },
    ],
    parametersSchema: {
      type: "object",
      properties: {
        title: { type: "string", description: "Issue title" },
        body: { type: "string", description: "Issue body in Markdown" },
        labels: {
          type: "array",
          items: { type: "string" },
          description: "Labels to apply",
        },
      },
      required: ["title"],
    },
  },
  {
    id: "vercel-deploy",
    name: "Vercel Deploy Trigger",
    description:
      "Trigger Vercel deployments from chat. Kick off redeploys by asking the AI to deploy your latest changes.",
    category: "Developer",
    author: "Bedda",
    icon: "▲",
    webhookUrlTemplate:
      "https://api.vercel.com/v1/integrations/deploy/{deploy-hook-id}",
    webhookToolName: "trigger_vercel_deploy",
    webhookToolDescription: "Trigger a Vercel deployment via deploy hook",
    params: [
      {
        name: "vercelDeployHookUrl",
        label: "Vercel Deploy Hook URL",
        placeholder: "https://api.vercel.com/v1/integrations/deploy/...",
        required: true,
        secret: true,
      },
    ],
    parametersSchema: {
      type: "object",
      properties: {
        reason: { type: "string", description: "Reason for the deployment" },
      },
      required: [],
    },
  },
  {
    id: "sentry-issue-lookup",
    name: "Sentry Issue Lookup",
    description:
      "Query Sentry for recent errors from chat. Ask the AI to fetch and explain the latest production errors.",
    category: "Developer",
    author: "Bedda",
    icon: "🔍",
    webhookUrlTemplate:
      "https://sentry.io/api/0/projects/{org}/{project}/issues/",
    webhookToolName: "query_sentry_issues",
    webhookToolDescription: "Fetch recent issues from Sentry",
    params: [
      {
        name: "sentryAuthToken",
        label: "Sentry Auth Token",
        placeholder: "sntrys_...",
        required: true,
        secret: true,
      },
      {
        name: "sentryOrg",
        label: "Sentry Organization Slug",
        placeholder: "my-org",
        required: true,
      },
      {
        name: "sentryProject",
        label: "Sentry Project Slug",
        placeholder: "my-project",
        required: true,
      },
    ],
    parametersSchema: {
      type: "object",
      properties: {
        query: { type: "string", description: "Sentry issue search query" },
        limit: {
          type: "number",
          description: "Number of issues to return (max 25)",
        },
      },
      required: [],
    },
  },
  {
    id: "pagerduty-alert",
    name: "PagerDuty Alert",
    description:
      "Create PagerDuty incidents from chat. Escalate issues and page on-call engineers directly from your conversation.",
    category: "Developer",
    author: "Bedda",
    icon: "🚨",
    webhookUrlTemplate: "https://events.pagerduty.com/v2/enqueue",
    webhookToolName: "create_pagerduty_alert",
    webhookToolDescription: "Trigger a PagerDuty incident",
    params: [
      {
        name: "pagerdutyRoutingKey",
        label: "PagerDuty Integration Key",
        placeholder: "your-routing-key",
        required: true,
        secret: true,
      },
    ],
    parametersSchema: {
      type: "object",
      properties: {
        summary: { type: "string", description: "Alert summary" },
        severity: {
          type: "string",
          enum: ["critical", "error", "warning", "info"],
          description: "Alert severity",
        },
        source: { type: "string", description: "Source system" },
      },
      required: ["summary", "severity"],
    },
  },
  {
    id: "make-scenario",
    name: "Make (Integromat) Trigger",
    description:
      "Trigger any Make scenario from chat. Connect to 1000+ apps via Make webhooks with a single message.",
    category: "Developer",
    author: "Bedda",
    icon: "⚙️",
    webhookUrlTemplate: "https://hook.eu1.make.com/{scenario-id}",
    webhookToolName: "trigger_make_scenario",
    webhookToolDescription: "Trigger a Make (Integromat) scenario via webhook",
    params: [
      {
        name: "makeWebhookUrl",
        label: "Make Webhook URL",
        placeholder: "https://hook.eu1.make.com/...",
        required: true,
      },
    ],
    parametersSchema: {
      type: "object",
      properties: {
        data: {
          type: "object",
          description: "Payload to send to the Make scenario",
        },
      },
      required: ["data"],
    },
  },

  // Data
  {
    id: "airtable-record",
    name: "Airtable Record Creator",
    description:
      "Add records to Airtable from chat. Capture structured data, form entries, and AI outputs directly into your Airtable bases.",
    category: "Data",
    author: "Bedda",
    icon: "🗃️",
    webhookUrlTemplate: "https://api.airtable.com/v0/{base-id}/{table-name}",
    webhookToolName: "create_airtable_record",
    webhookToolDescription: "Create a new record in an Airtable table",
    params: [
      {
        name: "airtableApiKey",
        label: "Airtable Personal Access Token",
        placeholder: "pat...",
        required: true,
        secret: true,
      },
      {
        name: "baseId",
        label: "Base ID",
        placeholder: "appXXXXXXXXXXXXXX",
        required: true,
      },
      {
        name: "tableName",
        label: "Table Name",
        placeholder: "My Table",
        required: true,
      },
    ],
    parametersSchema: {
      type: "object",
      properties: {
        fields: {
          type: "object",
          description: "Record fields as key-value pairs",
        },
      },
      required: ["fields"],
    },
  },
  {
    id: "google-sheets-append",
    name: "Google Sheets Row Appender",
    description:
      "Append rows to Google Sheets from chat. Log AI outputs, capture data, and build spreadsheets via conversation.",
    category: "Data",
    author: "Bedda",
    icon: "📊",
    webhookUrlTemplate: "https://hooks.zapier.com/hooks/catch/{your-zap-id}/",
    webhookToolName: "append_google_sheets_row",
    webhookToolDescription: "Append a row to a Google Sheet via Zapier webhook",
    params: [
      {
        name: "zapierWebhookUrl",
        label: "Zapier Webhook URL",
        placeholder: "https://hooks.zapier.com/hooks/catch/...",
        required: true,
      },
    ],
    parametersSchema: {
      type: "object",
      properties: {
        row: {
          type: "array",
          items: { type: "string" },
          description: "Row values as an array of strings",
        },
        sheet: { type: "string", description: "Sheet name (optional)" },
      },
      required: ["row"],
    },
  },
  {
    id: "supabase-insert",
    name: "Supabase Row Insert",
    description:
      "Insert rows into Supabase tables from chat. Store AI-generated data directly to your Postgres backend.",
    category: "Data",
    author: "Bedda",
    icon: "🐘",
    webhookUrlTemplate: "https://{project-ref}.supabase.co/rest/v1/{table}",
    webhookToolName: "insert_supabase_row",
    webhookToolDescription: "Insert a row into a Supabase table",
    params: [
      {
        name: "supabaseUrl",
        label: "Supabase Project URL",
        placeholder: "https://xxxx.supabase.co",
        required: true,
      },
      {
        name: "supabaseAnonKey",
        label: "Supabase Anon Key",
        placeholder: "eyJhbGci...",
        required: true,
        secret: true,
      },
      {
        name: "tableName",
        label: "Table Name",
        placeholder: "my_table",
        required: true,
      },
    ],
    parametersSchema: {
      type: "object",
      properties: {
        record: { type: "object", description: "Row data as key-value pairs" },
      },
      required: ["record"],
    },
  },
  {
    id: "webhook-logger",
    name: "Webhook Logger",
    description:
      "Log any data to a custom endpoint. Use with RequestBin, webhook.site, or your own logging service.",
    category: "Data",
    author: "Bedda",
    icon: "📋",
    webhookUrlTemplate: "https://webhook.site/{your-uuid}",
    webhookToolName: "log_to_webhook",
    webhookToolDescription: "Send arbitrary data to a webhook logging endpoint",
    params: [
      {
        name: "webhookUrl",
        label: "Webhook URL",
        placeholder: "https://webhook.site/your-uuid",
        required: true,
      },
    ],
    parametersSchema: {
      type: "object",
      properties: {
        message: { type: "string", description: "Message to log" },
        data: { type: "object", description: "Additional structured data" },
      },
      required: ["message"],
    },
  },

  // Communication
  {
    id: "slack-message",
    name: "Slack Message Sender",
    description:
      "Send messages to Slack channels from chat. Share AI summaries, alerts, and updates directly to your team.",
    category: "Communication",
    author: "Bedda",
    icon: "💬",
    webhookUrlTemplate: "https://hooks.slack.com/services/{your-webhook-id}",
    webhookToolName: "send_slack_message",
    webhookToolDescription:
      "Send a message to a Slack channel via incoming webhook",
    params: [
      {
        name: "slackWebhookUrl",
        label: "Slack Incoming Webhook URL",
        placeholder: "https://hooks.slack.com/services/...",
        required: true,
        secret: true,
      },
    ],
    parametersSchema: {
      type: "object",
      properties: {
        text: {
          type: "string",
          description: "Message text (supports Slack markdown)",
        },
        username: {
          type: "string",
          description: "Bot display name (optional)",
        },
      },
      required: ["text"],
    },
  },
  {
    id: "discord-message",
    name: "Discord Message Sender",
    description:
      "Post messages to Discord channels from chat. Share AI responses, summaries, and data directly to your Discord server.",
    category: "Communication",
    author: "Bedda",
    icon: "🎮",
    webhookUrlTemplate:
      "https://discord.com/api/webhooks/{webhook-id}/{webhook-token}",
    webhookToolName: "send_discord_message",
    webhookToolDescription: "Send a message to a Discord channel via webhook",
    params: [
      {
        name: "discordWebhookUrl",
        label: "Discord Webhook URL",
        placeholder: "https://discord.com/api/webhooks/...",
        required: true,
        secret: true,
      },
    ],
    parametersSchema: {
      type: "object",
      properties: {
        content: { type: "string", description: "Message content" },
        username: {
          type: "string",
          description: "Override username (optional)",
        },
      },
      required: ["content"],
    },
  },
  {
    id: "telegram-bot",
    name: "Telegram Bot Messenger",
    description:
      "Send messages via Telegram bot from chat. Forward AI outputs, alerts, and summaries to any Telegram chat or group.",
    category: "Communication",
    author: "Bedda",
    icon: "✈️",
    webhookUrlTemplate: "https://api.telegram.org/bot{token}/sendMessage",
    webhookToolName: "send_telegram_message",
    webhookToolDescription: "Send a message via Telegram bot",
    params: [
      {
        name: "telegramBotToken",
        label: "Telegram Bot Token",
        placeholder: "1234567890:AAF...",
        required: true,
        secret: true,
      },
      {
        name: "chatId",
        label: "Chat ID",
        placeholder: "-1001234567890",
        required: true,
      },
    ],
    parametersSchema: {
      type: "object",
      properties: {
        text: {
          type: "string",
          description: "Message text (supports Markdown)",
        },
        parse_mode: {
          type: "string",
          enum: ["Markdown", "HTML"],
          description: "Formatting mode",
        },
      },
      required: ["text"],
    },
  },
  {
    id: "sendgrid-email",
    name: "SendGrid Email Sender",
    description:
      "Send emails from chat via SendGrid. Use the AI to draft and send emails, notifications, and reports.",
    category: "Communication",
    author: "Bedda",
    icon: "📧",
    webhookUrlTemplate: "https://api.sendgrid.com/v3/mail/send",
    webhookToolName: "send_email_sendgrid",
    webhookToolDescription: "Send an email via SendGrid",
    params: [
      {
        name: "sendgridApiKey",
        label: "SendGrid API Key",
        placeholder: "SG.xxxx",
        required: true,
        secret: true,
      },
      {
        name: "fromEmail",
        label: "From Email",
        placeholder: "you@yourdomain.com",
        required: true,
      },
    ],
    parametersSchema: {
      type: "object",
      properties: {
        to: { type: "string", description: "Recipient email address" },
        subject: { type: "string", description: "Email subject" },
        body: {
          type: "string",
          description: "Email body (plain text or HTML)",
        },
      },
      required: ["to", "subject", "body"],
    },
  },
  {
    id: "twilio-sms",
    name: "Twilio SMS Sender",
    description:
      "Send SMS messages from chat via Twilio. Use the AI to draft and send text messages to any phone number.",
    category: "Communication",
    author: "Bedda",
    icon: "📱",
    webhookUrlTemplate:
      "https://api.twilio.com/2010-04-01/Accounts/{AccountSid}/Messages.json",
    webhookToolName: "send_twilio_sms",
    webhookToolDescription: "Send an SMS via Twilio",
    params: [
      {
        name: "twilioAccountSid",
        label: "Twilio Account SID",
        placeholder: "ACxxxxxxxxxxxxxxxx",
        required: true,
      },
      {
        name: "twilioAuthToken",
        label: "Twilio Auth Token",
        placeholder: "your-auth-token",
        required: true,
        secret: true,
      },
      {
        name: "fromNumber",
        label: "Twilio Phone Number",
        placeholder: "+1234567890",
        required: true,
      },
    ],
    parametersSchema: {
      type: "object",
      properties: {
        to: {
          type: "string",
          description: "Recipient phone number in E.164 format",
        },
        body: { type: "string", description: "SMS message body" },
      },
      required: ["to", "body"],
    },
  },

  // Finance
  {
    id: "stripe-payment-link",
    name: "Stripe Payment Link Creator",
    description:
      "Generate Stripe payment links from chat. Create checkout links for products, invoices, or custom amounts on the fly.",
    category: "Finance",
    author: "Bedda",
    icon: "💳",
    webhookUrlTemplate: "https://api.stripe.com/v1/payment_links",
    webhookToolName: "create_stripe_payment_link",
    webhookToolDescription: "Create a Stripe payment link",
    params: [
      {
        name: "stripeSecretKey",
        label: "Stripe Secret Key",
        placeholder: "sk_live_...",
        required: true,
        secret: true,
      },
    ],
    parametersSchema: {
      type: "object",
      properties: {
        amount: {
          type: "number",
          description: "Amount in cents (e.g. 2999 = $29.99)",
        },
        currency: { type: "string", description: "Currency code (e.g. usd)" },
        description: {
          type: "string",
          description: "Product or payment description",
        },
      },
      required: ["amount", "currency", "description"],
    },
  },
  {
    id: "quickbooks-invoice",
    name: "QuickBooks Invoice Creator",
    description:
      "Create QuickBooks invoices from chat. Generate client invoices via a Zapier or Make automation.",
    category: "Finance",
    author: "Bedda",
    icon: "🧾",
    webhookUrlTemplate: "https://hooks.zapier.com/hooks/catch/{your-zap-id}/",
    webhookToolName: "create_quickbooks_invoice",
    webhookToolDescription: "Create a QuickBooks invoice via Zapier webhook",
    params: [
      {
        name: "zapierWebhookUrl",
        label: "Zapier Webhook URL",
        placeholder: "https://hooks.zapier.com/hooks/catch/...",
        required: true,
      },
    ],
    parametersSchema: {
      type: "object",
      properties: {
        customer_name: { type: "string", description: "Customer name" },
        amount: { type: "number", description: "Invoice amount" },
        description: { type: "string", description: "Line item description" },
        due_date: {
          type: "string",
          description: "Due date in YYYY-MM-DD format",
        },
      },
      required: ["customer_name", "amount", "description"],
    },
  },
  {
    id: "coinbase-price",
    name: "Coinbase Crypto Price Checker",
    description:
      "Fetch live cryptocurrency prices from chat. Ask the AI for real-time BTC, ETH, or any crypto price via Coinbase.",
    category: "Finance",
    author: "Bedda",
    icon: "₿",
    webhookUrlTemplate:
      "https://api.coinbase.com/v2/prices/{currency}-USD/spot",
    webhookToolName: "get_crypto_price",
    webhookToolDescription:
      "Fetch the current spot price of a cryptocurrency from Coinbase",
    params: [],
    parametersSchema: {
      type: "object",
      properties: {
        currency: {
          type: "string",
          description: "Cryptocurrency symbol (e.g. BTC, ETH, SOL)",
        },
      },
      required: ["currency"],
    },
  },
];

export const MARKETPLACE_CATEGORIES: MarketplaceCategory[] = [
  "Productivity",
  "Developer",
  "Data",
  "Communication",
  "Finance",
];
