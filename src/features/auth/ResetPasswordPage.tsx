import { zodResolver } from "@hookform/resolvers/zod";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { Link } from "react-router-dom";
import { AuthField, AuthLayout, AuthSubmitButton } from "@/components/auth/AuthLayout";
import { resetPasswordSchema, type ResetPasswordFormValues } from "@/features/auth/schemas";

export function ResetPasswordPage() {
  const [sent, setSent] = useState(false);
  const [submittedUsername, setSubmittedUsername] = useState("");

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<ResetPasswordFormValues>({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: { username: "" },
  });

  const onSubmit = handleSubmit((data) => {
    setSubmittedUsername(data.username);
    setSent(true);
  });

  return (
    <AuthLayout
      title="Reset your password"
      subtitle={
        <>
          Enter your username and we&apos;ll send a gentle reset link to the email on your{" "}
          <strong className="font-semibold text-foreground">Seen</strong> account.
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
          <AuthField
            id="reset-username"
            label="Username"
            placeholder="Username"
            error={errors.username?.message}
            {...register("username")}
          />
          <AuthSubmitButton disabled={isSubmitting}>Send reset link</AuthSubmitButton>
        </form>
      )}
    </AuthLayout>
  );
}
