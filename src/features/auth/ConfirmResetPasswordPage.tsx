import { zodResolver } from "@hookform/resolvers/zod";
import { Eye, EyeOff } from "lucide-react";
import { useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { AuthField, AuthLayout, AuthSubmitButton } from "@/components/auth/AuthLayout";
import { confirmResetPassword } from "@/lib/api/auth";
import { ApiError } from "@/lib/api-client";
import {
  confirmResetPasswordSchema,
  type ConfirmResetPasswordFormValues,
} from "@/features/auth/schemas";

export function ConfirmResetPasswordPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const token = useMemo(() => (searchParams.get("token") ?? "").trim(), [searchParams]);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [done, setDone] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<ConfirmResetPasswordFormValues>({
    resolver: zodResolver(confirmResetPasswordSchema),
    defaultValues: { password: "", confirmPassword: "" },
  });

  const onSubmit = handleSubmit(async (data) => {
    if (!token) {
      setFormError("This reset link is invalid or has expired.");
      return;
    }

    setFormError(null);
    try {
      await confirmResetPassword({
        token,
        password: data.password,
        confirmPassword: data.confirmPassword,
      });
      setDone(true);
    } catch (error) {
      setFormError(
        error instanceof ApiError ? error.message : "Unable to reset your password right now.",
      );
    }
  });

  return (
    <AuthLayout
      title="Choose a new password"
      subtitle="Pick something strong you will remember. This link can only be used once."
      promoTitle="Take it at your own pace."
      activeSlide={2}
      footer={
        <>
          Ready to sign in?{" "}
          <Link to="/login" className="font-semibold text-sage hover:underline">
            Back to login
          </Link>
        </>
      }
    >
      {done ? (
        <div className="rounded-2xl border border-border bg-card p-6 text-center">
          <h2 className="font-serif text-xl">Password updated</h2>
          <p className="mt-2 text-sm text-muted-foreground">
            Your password has been changed. You can sign in with your new password now.
          </p>
          <button
            type="button"
            onClick={() => navigate("/login")}
            className="btn-primary mt-6 min-h-11 px-6"
          >
            Go to login
          </button>
        </div>
      ) : !token ? (
        <div className="rounded-2xl border border-border bg-card p-6 text-center">
          <h2 className="font-serif text-xl">Invalid reset link</h2>
          <p className="mt-2 text-sm text-muted-foreground">
            This password reset link is missing, invalid, or has expired. Request a new one from the
            login page.
          </p>
          <Link to="/reset-password" className="btn-primary mt-6 inline-flex min-h-11 items-center px-6">
            Request a new link
          </Link>
        </div>
      ) : (
        <form onSubmit={onSubmit} className="space-y-4" noValidate>
          {formError && (
            <p className="rounded-xl border border-destructive/30 bg-destructive/5 px-4 py-3 text-sm text-destructive">
              {formError}
            </p>
          )}
          <AuthField
            id="new-password"
            label="New password"
            type={showPassword ? "text" : "password"}
            autoComplete="new-password"
            placeholder="New password"
            error={errors.password?.message}
            trailing={
              <button
                type="button"
                aria-label={showPassword ? "Hide password" : "Show password"}
                onClick={() => setShowPassword((v) => !v)}
                className="absolute right-2 top-1/2 grid h-11 w-11 -translate-y-1/2 place-items-center text-muted-foreground hover:text-foreground"
              >
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            }
            {...register("password")}
          />
          <AuthField
            id="confirm-password"
            label="Confirm password"
            type={showConfirm ? "text" : "password"}
            autoComplete="new-password"
            placeholder="Confirm password"
            error={errors.confirmPassword?.message}
            trailing={
              <button
                type="button"
                aria-label={showConfirm ? "Hide password" : "Show password"}
                onClick={() => setShowConfirm((v) => !v)}
                className="absolute right-2 top-1/2 grid h-11 w-11 -translate-y-1/2 place-items-center text-muted-foreground hover:text-foreground"
              >
                {showConfirm ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            }
            {...register("confirmPassword")}
          />
          <AuthSubmitButton disabled={isSubmitting}>Update password</AuthSubmitButton>
        </form>
      )}
    </AuthLayout>
  );
}
