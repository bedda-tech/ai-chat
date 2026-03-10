"use client";

import Form from "next/form";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useActionState, useEffect, useState } from "react";

import { SubmitButton } from "@/components/submit-button";
import { toast } from "@/components/toast";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { type ResetPasswordActionState, resetPassword } from "../actions";

function ResetPasswordForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get("token") ?? "";

  const [isSuccessful, setIsSuccessful] = useState(false);

  const [state, formAction] = useActionState<ResetPasswordActionState, FormData>(
    resetPassword,
    { status: "idle" }
  );

  useEffect(() => {
    if (state.status === "success") {
      setIsSuccessful(true);
      toast({ type: "success", description: "Password updated! Please sign in." });
      setTimeout(() => router.push("/login"), 2000);
    } else if (state.status === "invalid_token") {
      toast({ type: "error", description: "This reset link is invalid or has already been used." });
    } else if (state.status === "token_expired") {
      toast({ type: "error", description: "This reset link has expired. Please request a new one." });
    } else if (state.status === "failed") {
      toast({ type: "error", description: "Something went wrong. Please try again." });
    } else if (state.status === "invalid_data") {
      toast({ type: "error", description: "Password must be at least 6 characters." });
    }
  }, [state.status, router]);

  if (!token) {
    return (
      <div className="flex h-dvh w-screen items-start justify-center bg-background pt-12 md:items-center md:pt-0">
        <div className="flex w-full max-w-md flex-col gap-6 px-4 sm:px-16 text-center">
          <h3 className="font-semibold text-xl dark:text-zinc-50">Invalid link</h3>
          <p className="text-gray-500 text-sm dark:text-zinc-400">
            This password reset link is invalid.
          </p>
          <Link href="/forgot-password" className="text-sm font-semibold text-gray-800 hover:underline dark:text-zinc-200">
            Request a new link
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-dvh w-screen items-start justify-center bg-background pt-12 md:items-center md:pt-0">
      <div className="flex w-full max-w-md flex-col gap-12 overflow-hidden rounded-2xl">
        <div className="flex flex-col items-center justify-center gap-2 px-4 text-center sm:px-16">
          <h3 className="font-semibold text-xl dark:text-zinc-50">Set new password</h3>
          <p className="text-gray-500 text-sm dark:text-zinc-400">
            Choose a new password for your account.
          </p>
        </div>
        <Form action={formAction} className="flex flex-col gap-4 px-4 sm:px-16">
          <input type="hidden" name="token" value={token} />
          <div className="flex flex-col gap-2">
            <Label
              className="font-normal text-zinc-600 dark:text-zinc-400"
              htmlFor="password"
            >
              New Password
            </Label>
            <Input
              autoFocus
              className="bg-muted text-md md:text-sm"
              id="password"
              name="password"
              required
              type="password"
              minLength={6}
              placeholder="At least 6 characters"
            />
          </div>
          <SubmitButton isSuccessful={isSuccessful}>Update password</SubmitButton>
          <p className="mt-4 text-center text-gray-600 text-sm dark:text-zinc-400">
            <Link
              className="font-semibold text-gray-800 hover:underline dark:text-zinc-200"
              href="/login"
            >
              Back to sign in
            </Link>
          </p>
        </Form>
      </div>
    </div>
  );
}

export default function ResetPasswordPage() {
  return (
    <Suspense>
      <ResetPasswordForm />
    </Suspense>
  );
}
