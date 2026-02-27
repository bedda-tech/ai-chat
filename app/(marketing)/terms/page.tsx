import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Terms of Use | bedda.ai",
  description: "Terms and conditions for using bedda.ai.",
};

export default function TermsPage() {
  return (
    <div className="container py-12 md:py-24">
      <div className="mx-auto max-w-3xl space-y-8">
        <div>
          <h1 className="font-bold text-3xl md:text-4xl">Terms of Use</h1>
          <p className="mt-2 text-muted-foreground">
            Effective date: February 28, 2026
          </p>
        </div>

        <p className="text-muted-foreground leading-relaxed">
          These Terms of Use (&quot;Terms&quot;) govern your use of bedda.ai,
          operated by Bedda Tech (&quot;we&quot;, &quot;us&quot;, or
          &quot;our&quot;). By using our service, you agree to these Terms.
        </p>

        <section className="space-y-3">
          <h2 className="font-semibold text-xl">1. Service Description</h2>
          <p className="text-muted-foreground leading-relaxed">
            bedda.ai is an AI chat platform that provides access to multiple AI
            models from various providers through a unified interface. We offer
            features including text conversations, image generation, file
            uploads, web search, and code execution.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="font-semibold text-xl">2. Account Responsibilities</h2>
          <p className="text-muted-foreground leading-relaxed">
            You are responsible for maintaining the security of your account
            credentials. You must provide accurate information when creating an
            account. You are responsible for all activity that occurs under your
            account. Notify us immediately if you suspect unauthorized access.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="font-semibold text-xl">3. Acceptable Use</h2>
          <p className="text-muted-foreground leading-relaxed">
            You agree not to use the service to:
          </p>
          <ul className="list-disc space-y-2 pl-6 text-muted-foreground">
            <li>Violate any applicable laws or regulations</li>
            <li>
              Generate content that is harmful, abusive, threatening, or
              harassing
            </li>
            <li>Generate child sexual abuse material or non-consensual intimate imagery</li>
            <li>Impersonate others or misrepresent your identity</li>
            <li>
              Attempt to gain unauthorized access to the service or its systems
            </li>
            <li>Interfere with or disrupt the service for other users</li>
            <li>
              Use automated means to access the service beyond provided APIs
            </li>
            <li>Circumvent usage limits or subscription restrictions</li>
          </ul>
        </section>

        <section className="space-y-3">
          <h2 className="font-semibold text-xl">4. Intellectual Property</h2>
          <p className="text-muted-foreground leading-relaxed">
            You retain ownership of the content you create and input into the
            service. We do not claim ownership of your conversations or uploaded
            files. The bedda.ai platform, including its design, code, and
            branding, is owned by Bedda Tech and protected by intellectual
            property laws.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="font-semibold text-xl">
            5. AI-Generated Content
          </h2>
          <p className="text-muted-foreground leading-relaxed">
            AI-generated responses are produced by third-party AI models and may
            contain inaccuracies, errors, or biases. You are responsible for
            reviewing and verifying any AI-generated content before relying on
            it. We do not guarantee the accuracy, completeness, or suitability
            of AI-generated content for any particular purpose.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="font-semibold text-xl">
            6. Subscriptions and Payments
          </h2>
          <p className="text-muted-foreground leading-relaxed">
            Paid plans are billed on a monthly basis. You can cancel your
            subscription at any time from your account settings. Cancellation
            takes effect at the end of the current billing period. We offer a
            7-day money-back guarantee for new subscriptions. Prices are subject
            to change with 30 days notice.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="font-semibold text-xl">7. Usage Limits</h2>
          <p className="text-muted-foreground leading-relaxed">
            Each subscription tier has specific usage limits (daily messages,
            image generations, etc.) as described on our{" "}
            <Link
              className="font-medium underline underline-offset-4"
              href="/pricing"
            >
              pricing page
            </Link>
            . We reserve the right to enforce these limits and may throttle or
            suspend access if limits are exceeded or abuse is detected.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="font-semibold text-xl">
            8. Service Availability
          </h2>
          <p className="text-muted-foreground leading-relaxed">
            We strive to maintain high availability but do not guarantee
            uninterrupted access. The service may be temporarily unavailable due
            to maintenance, updates, or circumstances beyond our control. We are
            not liable for any downtime or service interruptions.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="font-semibold text-xl">
            9. Limitation of Liability
          </h2>
          <p className="text-muted-foreground leading-relaxed">
            To the maximum extent permitted by law, Bedda Tech shall not be
            liable for any indirect, incidental, special, consequential, or
            punitive damages, including loss of profits, data, or goodwill,
            arising from your use of or inability to use the service. Our total
            liability shall not exceed the amount you paid us in the 12 months
            preceding the claim.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="font-semibold text-xl">
            10. Disclaimer of Warranties
          </h2>
          <p className="text-muted-foreground leading-relaxed">
            The service is provided &quot;as is&quot; and &quot;as
            available&quot; without warranties of any kind, whether express or
            implied, including but not limited to implied warranties of
            merchantability, fitness for a particular purpose, and
            non-infringement.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="font-semibold text-xl">11. Termination</h2>
          <p className="text-muted-foreground leading-relaxed">
            We may suspend or terminate your access to the service at any time
            for violation of these Terms or for any other reason at our
            discretion. You may delete your account at any time. Upon
            termination, your right to use the service ceases immediately.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="font-semibold text-xl">12. Changes to These Terms</h2>
          <p className="text-muted-foreground leading-relaxed">
            We may update these Terms from time to time. We will notify you of
            material changes by posting the updated Terms on this page and
            updating the effective date. Your continued use of the service after
            changes constitutes acceptance of the updated Terms.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="font-semibold text-xl">13. Governing Law</h2>
          <p className="text-muted-foreground leading-relaxed">
            These Terms shall be governed by and construed in accordance with the
            laws of the State of Delaware, United States, without regard to its
            conflict of law provisions.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="font-semibold text-xl">14. Contact Us</h2>
          <p className="text-muted-foreground leading-relaxed">
            If you have any questions about these Terms, please contact us at{" "}
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
