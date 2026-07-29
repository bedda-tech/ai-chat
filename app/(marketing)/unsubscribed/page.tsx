import Link from "next/link";

export const metadata = {
  title: "Unsubscribed — Bedda",
  robots: { index: false },
};

export default async function UnsubscribedPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const { error } = await searchParams;

  if (error) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center px-6 py-24 text-center">
        <div className="max-w-md">
          <h1 className="mb-4 font-bold text-2xl">Invalid link</h1>
          <p className="mb-8 text-gray-600">
            This unsubscribe link is invalid or has expired. If you&apos;d like
            to stop receiving emails, please reply to any Bedda email and ask to
            be removed.
          </p>
          <Link
            className="rounded-lg bg-black px-6 py-3 font-semibold text-sm text-white"
            href="/home"
          >
            Go to Bedda
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center px-6 py-24 text-center">
      <div className="max-w-md">
        <h1 className="mb-4 font-bold text-2xl">
          You&apos;ve been unsubscribed
        </h1>
        <p className="mb-8 text-gray-600">
          You won&apos;t receive any more marketing emails from Bedda. Your
          account remains active and you can still use all features.
        </p>
        <Link
          className="rounded-lg bg-black px-6 py-3 font-semibold text-sm text-white"
          href="/"
        >
          Go to Bedda
        </Link>
      </div>
    </div>
  );
}
