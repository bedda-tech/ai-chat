"use server";

import crypto from "node:crypto";
import { z } from "zod";

import {
  createPasswordResetToken,
  createUser,
  getPasswordResetToken,
  getUser,
  markPasswordResetTokenUsed,
  updateUserPassword,
} from "@/lib/db/queries";
import { sendPasswordResetEmail } from "@/lib/email/send-password-reset";
import { sendWelcomeEmail } from "@/lib/email/send-welcome-email";

import { signIn } from "./auth";

const authFormSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
});

export type LoginActionState = {
  status:
    | "idle"
    | "in_progress"
    | "success"
    | "failed"
    | "invalid_data"
    | "oauth_account";
};

export const login = async (
  _: LoginActionState,
  formData: FormData
): Promise<LoginActionState> => {
  try {
    const validatedData = authFormSchema.parse({
      email: formData.get("email"),
      password: formData.get("password"),
    });

    const [existingUser] = await getUser(validatedData.email);
    if (existingUser && !existingUser.password) {
      return { status: "oauth_account" };
    }

    await signIn("credentials", {
      email: validatedData.email,
      password: validatedData.password,
      redirect: false,
    });

    return { status: "success" };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return { status: "invalid_data" };
    }

    return { status: "failed" };
  }
};

export type RegisterActionState = {
  status:
    | "idle"
    | "in_progress"
    | "success"
    | "failed"
    | "user_exists"
    | "invalid_data";
};

export const register = async (
  _: RegisterActionState,
  formData: FormData
): Promise<RegisterActionState> => {
  try {
    const validatedData = authFormSchema.parse({
      email: formData.get("email"),
      password: formData.get("password"),
    });

    const [user] = await getUser(validatedData.email);

    if (user) {
      return { status: "user_exists" } as RegisterActionState;
    }
    const ref = formData.get("ref") as string | null;
    await createUser(
      validatedData.email,
      validatedData.password,
      ref ?? undefined
    );
    // Fire welcome email (don't block sign-in on failure)
    sendWelcomeEmail(validatedData.email).catch(() => {});
    await signIn("credentials", {
      email: validatedData.email,
      password: validatedData.password,
      redirect: false,
    });

    return { status: "success" };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return { status: "invalid_data" };
    }

    return { status: "failed" };
  }
};

// ---- Forgot Password ----

export type ForgotPasswordActionState = {
  status: "idle" | "in_progress" | "success" | "failed" | "invalid_data";
};

const forgotPasswordSchema = z.object({
  email: z.string().email(),
});

export const forgotPassword = async (
  _: ForgotPasswordActionState,
  formData: FormData
): Promise<ForgotPasswordActionState> => {
  try {
    const { email } = forgotPasswordSchema.parse({
      email: formData.get("email"),
    });

    const [existingUser] = await getUser(email);

    // Always return success to avoid email enumeration
    if (!existingUser) {
      return { status: "success" };
    }

    const token = crypto.randomBytes(32).toString("hex");
    const tokenHash = crypto.createHash("sha256").update(token).digest("hex");
    const expiresAt = new Date(Date.now() + 60 * 60 * 1000); // 1 hour

    await createPasswordResetToken(existingUser.id, tokenHash, expiresAt);

    const baseUrl = process.env.NEXT_PUBLIC_APP_URL ?? "https://bedda.ai";
    const resetUrl = `${baseUrl}/reset-password?token=${token}`;
    await sendPasswordResetEmail(email, resetUrl);

    return { status: "success" };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return { status: "invalid_data" };
    }
    console.error("[forgot-password]", error);
    return { status: "failed" };
  }
};

// ---- Reset Password ----

export type ResetPasswordActionState = {
  status:
    | "idle"
    | "in_progress"
    | "success"
    | "failed"
    | "invalid_data"
    | "invalid_token"
    | "token_expired";
};

const resetPasswordSchema = z.object({
  token: z.string().min(1),
  password: z.string().min(6),
});

export const resetPassword = async (
  _: ResetPasswordActionState,
  formData: FormData
): Promise<ResetPasswordActionState> => {
  try {
    const { token, password } = resetPasswordSchema.parse({
      token: formData.get("token"),
      password: formData.get("password"),
    });

    const tokenHash = crypto.createHash("sha256").update(token).digest("hex");
    const [record] = await getPasswordResetToken(tokenHash);

    if (!record || record.usedAt) {
      return { status: "invalid_token" };
    }

    if (new Date() > record.expiresAt) {
      return { status: "token_expired" };
    }

    await updateUserPassword(record.userId, password);
    await markPasswordResetTokenUsed(record.id);

    return { status: "success" };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return { status: "invalid_data" };
    }
    return { status: "failed" };
  }
};
