import { zodResolver } from "@hookform/resolvers/zod";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { Link } from "react-router-dom";
import { AuthField, AuthLayout, AuthSubmitButton } from "@/components/auth/AuthLayout";
import { resetPassword } from "@/lib/api/auth";
import { ApiError } from "@/lib/api-client";
import { resetPasswordSchema, type ResetPasswordFormValues } from "@/features/auth/schemas";

export function ResetPasswordPage() {
  const [sent, setSent] = useState(false);
  const [submittedUsername, setSubmittedUsername] = useState("");
  const [formError, setFormError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<ResetPasswordFormValues>({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: { username: "" },
  });

  const onSubmit = handleSubmit(async (data) => {
    setFormError(null);
    try {
      await resetPassword(data.username);
      setSubmittedUsername(data.username);
      setSent(true);
    } catch (error) {
      setFormError(error instanceof ApiError ? error.message : "Unable to send reset instructions right now.");
    }
  });

  return (
    <AuthLayout
      title="Reset your password"
      subtitle={
        <>
          Enter your username or the email you used to sign up. We&apos;ll send a reset link to that
          account&apos;s email.
        </>
      }
      promoTitle="Take it at your own pace."
      activeSlide={2}
      footer={
        <>
          Remember your password?{" "}
          <Link to="/login" className="font-semibold text-sage hover:underline">
            Back to login
          </Link>
        </>
      }
    >
      {sent ? (
        <div className="rounded-2xl border border-border bg-card p-6 text-center">
          <h2 className="font-serif text-xl">Check your inbox</h2>
          <p className="mt-2 text-sm text-muted-foreground">
            If an account exists for <strong className="text-foreground">{submittedUsername}</strong>,
            we&apos;ve sent password reset instructions.
          </p>
        </div>
      ) : (
        <form onSubmit={onSubmit} className="space-y-4" noValidate>
          {formError && (
            <p className="rounded-xl border border-destructive/30 bg-destructive/5 px-4 py-3 text-sm text-destructive">
              {formError}
            </p>
          )}
          <AuthField
            id="reset-username"
            label="Username or email"
            placeholder="Username or email"
            autoComplete="username"
            error={errors.username?.message}
            {...register("username")}
          />
          <AuthSubmitButton disabled={isSubmitting}>Send reset link</AuthSubmitButton>
        </form>
      )}
    </AuthLayout>
  );
}
