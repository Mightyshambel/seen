import { zodResolver } from "@hookform/resolvers/zod";
import { Eye, EyeOff } from "lucide-react";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { Link, useNavigate } from "react-router-dom";
import {
  AuthDivider,
  AuthField,
  AuthLayout,
  AuthSubmitButton,
  SocialAuthButtons,
} from "@/components/auth/AuthLayout";
import { login } from "@/lib/api/auth";
import { ApiError } from "@/lib/api-client";
import { routeAfterAuth } from "@/lib/auth-routing";
import { completeAuthSession } from "@/lib/session";
import { loginSchema, type LoginFormValues } from "@/features/auth/schemas";

export function LoginPage() {
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: { username: "", password: "" },
  });

  const onSubmit = handleSubmit(async (data) => {
    setFormError(null);
    try {
      const response = await login(data);
      await completeAuthSession(response.user);
      navigate(routeAfterAuth(response.user));
    } catch (error) {
      setFormError(error instanceof ApiError ? error.message : "Unable to sign in right now.");
    }
  });

  return (
    <AuthLayout
      title="Welcome back!"
      subtitle={
        <>
          Continue your Seen journey with{" "}
          <strong className="font-semibold text-foreground">Seen</strong>. Sign in to reconnect with
          your match and pick up where you left off.
        </>
      }
      promoTitle="Make hard chapters feel less lonely with Seen."
      activeSlide={0}
      footer={
        <>
          Not a member?{" "}
          <Link to="/signup" className="font-semibold text-sage hover:underline">
            Register now
          </Link>
        </>
      }
    >
      <form onSubmit={onSubmit} className="space-y-4" noValidate>
        {formError && (
          <p className="rounded-xl border border-destructive/30 bg-destructive/5 px-4 py-3 text-sm text-destructive">
            {formError}
          </p>
        )}
        <AuthField
          id="login-username"
          label="Username"
          placeholder="Username"
          error={errors.username?.message}
          {...register("username")}
        />
        <AuthField
          id="login-password"
          label="Password"
          type={showPassword ? "text" : "password"}
          placeholder="Password"
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
        <div className="flex justify-end">
          <Link to="/reset-password" className="text-sm font-semibold text-foreground hover:underline">
            Forgot Password?
          </Link>
        </div>
        <AuthSubmitButton disabled={isSubmitting}>Login</AuthSubmitButton>
        <AuthDivider />
        <SocialAuthButtons />
      </form>
    </AuthLayout>
  );
}
