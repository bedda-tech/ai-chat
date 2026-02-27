import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Privacy Policy | bedda.ai",
  description:
    "Learn how bedda.ai collects, uses, and protects your personal information.",
};

export default function PrivacyPage() {
  return (
    <div className="container py-12 md:py-24">
      <div className="mx-auto max-w-3xl space-y-8">
        <div>
          <h1 className="font-bold text-3xl md:text-4xl">Privacy Policy</h1>
          <p className="mt-2 text-muted-foreground">
            Effective date: February 28, 2026
          </p>
        </div>

        <p className="text-muted-foreground leading-relaxed">
          Bedda Tech (&quot;we&quot;, &quot;us&quot;, or &quot;our&quot;)
          operates bedda.ai. This Privacy Policy explains how we collect, use,
          and protect your information when you use our service.
        </p>

        <section className="space-y-3">
          <h2 className="font-semibold text-xl">1. Information We Collect</h2>
          <h3 className="font-medium text-base">Account Information</h3>
          <p className="text-muted-foreground leading-relaxed">
            When you create an account, we collect your email address and
            authentication credentials. If you sign in via a third-party
            provider (e.g., Google, GitHub), we receive your name and email from
            that provider.
          </p>
          <h3 className="font-medium text-base">Chat Messages</h3>
          <p className="text-muted-foreground leading-relaxed">
            We store the messages you send and receive through our service to
            provide chat history and enable features like conversation search and
            projects. Messages are sent to third-party AI model providers for
            processing.
          </p>
          <h3 className="font-medium text-base">Usage Data</h3>
          <p className="text-muted-foreground leading-relaxed">
            We collect information about how you use the service, including
            models used, message counts, feature usage, and general interaction
            patterns. This helps us improve the service and enforce usage limits.
          </p>
          <h3 className="font-medium text-base">Uploaded Files</h3>
          <p className="text-muted-foreground leading-relaxed">
            Files you upload (images, documents) are stored securely and
            processed as part of your conversations. Files are associated with
            your account and the relevant conversation.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="font-semibold text-xl">2. How We Use Your Data</h2>
          <ul className="list-disc space-y-2 pl-6 text-muted-foreground">
            <li>Providing and maintaining the service</li>
            <li>Processing your messages through AI model providers</li>
            <li>Enforcing usage limits and subscription tiers</li>
            <li>Improving and developing new features</li>
            <li>Sending service-related communications</li>
            <li>Preventing abuse and ensuring security</li>
          </ul>
        </section>

        <section className="space-y-3">
          <h2 className="font-semibold text-xl">3. Third-Party Services</h2>
          <p className="text-muted-foreground leading-relaxed">
            We use the following third-party services to operate bedda.ai:
          </p>
          <ul className="list-disc space-y-2 pl-6 text-muted-foreground">
            <li>
              <strong className="text-foreground">Supabase</strong> &mdash;
              Authentication and database hosting
            </li>
            <li>
              <strong className="text-foreground">Vercel</strong> &mdash;
              Application hosting and AI model gateway
            </li>
            <li>
              <strong className="text-foreground">AI Model Providers</strong>{" "}
              &mdash; Your messages are sent to providers such as Anthropic,
              OpenAI, Google, xAI, and DeepSeek to generate responses. Each
              provider has its own data handling policies.
            </li>
            <li>
              <strong className="text-foreground">Stripe</strong> &mdash;
              Payment processing (we do not store your payment card details)
            </li>
          </ul>
        </section>

        <section className="space-y-3">
          <h2 className="font-semibold text-xl">4. Data Retention</h2>
          <p className="text-muted-foreground leading-relaxed">
            We retain your data for as long as your account is active. You can
            delete individual conversations at any time. If you delete your
            account, we will remove your personal data within 30 days, except
            where retention is required by law.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="font-semibold text-xl">5. Data Security</h2>
          <p className="text-muted-foreground leading-relaxed">
            We use industry-standard security measures to protect your data,
            including encryption in transit (TLS) and at rest. Access to user
            data is restricted to authorized personnel only.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="font-semibold text-xl">6. Cookies</h2>
          <p className="text-muted-foreground leading-relaxed">
            We use essential cookies for authentication and session management.
            We may use analytics cookies to understand how the service is used.
            You can control cookie settings through your browser.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="font-semibold text-xl">7. Your Rights</h2>
          <p className="text-muted-foreground leading-relaxed">
            You have the right to:
          </p>
          <ul className="list-disc space-y-2 pl-6 text-muted-foreground">
            <li>Access the personal data we hold about you</li>
            <li>Request correction of inaccurate data</li>
            <li>Request deletion of your data</li>
            <li>Export your conversation history</li>
            <li>Withdraw consent for data processing</li>
          </ul>
          <p className="text-muted-foreground leading-relaxed">
            To exercise these rights, contact us at{" "}
            <Link
              className="font-medium underline underline-offset-4"
              href="mailto:hello@bedda.ai"
            >
              hello@bedda.ai
            </Link>
            .
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="font-semibold text-xl">
            8. Children&apos;s Privacy
          </h2>
          <p className="text-muted-foreground leading-relaxed">
            Our service is not directed to children under 13. We do not
            knowingly collect personal information from children under 13. If we
            become aware that we have collected such data, we will delete it
            promptly.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="font-semibold text-xl">9. Changes to This Policy</h2>
          <p className="text-muted-foreground leading-relaxed">
            We may update this Privacy Policy from time to time. We will notify
            you of material changes by posting the new policy on this page and
            updating the effective date. Your continued use of the service after
            changes constitutes acceptance of the updated policy.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="font-semibold text-xl">10. Contact Us</h2>
          <p className="text-muted-foreground leading-relaxed">
            If you have any questions about this Privacy Policy, please contact
            us at{" "}
            <Link
              className="font-medium underline underline-offset-4"
              href="mailto:hello@bedda.ai"
            >
              hello@bedda.ai
            </Link>
            .
          </p>
        </section>
      </div>
    </div>
  );
}
