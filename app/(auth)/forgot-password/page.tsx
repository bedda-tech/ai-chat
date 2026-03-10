"use client";

import Form from "next/form";
import Link from "next/link";
import { useActionState, useEffect, useState } from "react";

import { SubmitButton } from "@/components/submit-button";
import { toast } from "@/components/toast";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { type ForgotPasswordActionState, forgotPassword } from "../actions";

export default function ForgotPasswordPage() {
  const [isSuccessful, setIsSuccessful] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const [state, formAction] = useActionState<ForgotPasswordActionState, FormData>(
    forgotPassword,
    { status: "idle" }
  );

  useEffect(() => {
    if (state.status === "success") {
      setIsSuccessful(true);
      setSubmitted(true);
    } else if (state.status === "failed") {
      toast({ type: "error", description: "Something went wrong. Please try again." });
    } else if (state.status === "invalid_data") {
      toast({ type: "error", description: "Please enter a valid email address." });
    }
  }, [state.status]);

  if (submitted) {
    return (
      <div className="flex h-dvh w-screen items-start justify-center bg-background pt-12 md:items-center md:pt-0">
        <div className="flex w-full max-w-md flex-col gap-6 overflow-hidden rounded-2xl px-4 sm:px-16 text-center">
          <h3 className="font-semibold text-xl dark:text-zinc-50">Check your email</h3>
          <p className="text-gray-500 text-sm dark:text-zinc-400">
            If an account exists with that email, we sent a password reset link. Check your inbox and follow the instructions.
          </p>
          <Link
            href="/login"
            className="text-sm font-semibold text-gray-800 hover:underline dark:text-zinc-200"
          >
            Back to sign in
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-dvh w-screen items-start justify-center bg-background pt-12 md:items-center md:pt-0">
      <div className="flex w-full max-w-md flex-col gap-12 overflow-hidden rounded-2xl">
        <div className="flex flex-col items-center justify-center gap-2 px-4 text-center sm:px-16">
          <h3 className="font-semibold text-xl dark:text-zinc-50">Forgot password</h3>
          <p className="text-gray-500 text-sm dark:text-zinc-400">
            Enter your email and we&apos;ll send you a reset link.
          </p>
        </div>
        <Form action={formAction} className="flex flex-col gap-4 px-4 sm:px-16">
          <div className="flex flex-col gap-2">
            <Label
              className="font-normal text-zinc-600 dark:text-zinc-400"
              htmlFor="email"
            >
              Email Address
            </Label>
            <Input
              autoComplete="email"
              autoFocus
              className="bg-muted text-md md:text-sm"
              id="email"
              name="email"
              placeholder="user@acme.com"
              required
              type="email"
            />
          </div>
          <SubmitButton isSuccessful={isSuccessful}>Send reset link</SubmitButton>
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
