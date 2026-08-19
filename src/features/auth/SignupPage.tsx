import { zodResolver } from "@hookform/resolvers/zod";
import { Eye, EyeOff } from "lucide-react";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { Link, useNavigate } from "react-router-dom";
import {
  AuthDivider,
  AuthField,
  AuthLayout,
  AuthSelect,
  AuthSubmitButton,
  SocialAuthButtons,
} from "@/components/auth/AuthLayout";
import { signup } from "@/lib/api/auth";
import { ApiError } from "@/lib/api-client";
import { routeAfterAuth } from "@/lib/auth-routing";
import { clearLocalUserData, completeAuthSession } from "@/lib/session";
import { signupSchema, type SignupFormValues } from "@/features/auth/schemas";
import { signupLanguages, signupLocations, signupPronouns } from "@/lib/signup-options";
import { useOnboarding } from "@/stores/onboarding";

export function SignupPage() {
  const navigate = useNavigate();
  const { setLanguages, setPronouns, setLocation } = useOnboarding();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  useEffect(() => {
    clearLocalUserData();
  }, []);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<SignupFormValues>({
    resolver: zodResolver(signupSchema),
    defaultValues: {
      username: "",
      email: "",
      pronouns: "",
      language: "",
      location: "",
      password: "",
      confirmPassword: "",
    },
  });

  const onSubmit = handleSubmit(async (data) => {
    setFormError(null);
    try {
      const response = await signup({
        username: data.username,
        email: data.email,
        pronouns: data.pronouns,
        language: data.language,
        location: data.location,
        password: data.password,
        confirmPassword: data.confirmPassword,
      });
      setPronouns(data.pronouns);
      setLanguages([data.language]);
      setLocation(data.location ?? "");
      await completeAuthSession(response.user);
      navigate(routeAfterAuth(response.user));
    } catch (error) {
      setFormError(error instanceof ApiError ? error.message : "Unable to create your account right now.");
    }
  });

  return (
    <AuthLayout
      title="Create your account"
      subtitle={
        <>
          Join <strong className="font-semibold text-foreground">Seen</strong> and get matched with
          someone who&apos;s been through what you&apos;re going through. It&apos;s free to begin.
        </>
      }
      promoTitle="Private conversations, gently held."
      activeSlide={1}
      footer={
        <>
          Already a member?{" "}
          <Link to="/login" className="font-semibold text-sage hover:underline">
            Login
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
          id="signup-username"
          label="Username"
          placeholder="Username"
          error={errors.username?.message}
          {...register("username")}
        />
        <AuthField
          id="signup-email"
          label="Email"
          type="email"
          placeholder="you@example.com"
          error={errors.email?.message}
          {...register("email")}
        />
        <AuthSelect
          id="signup-pronouns"
          label="Pronouns"
          placeholder="Select pronouns"
          options={signupPronouns}
          error={errors.pronouns?.message}
          {...register("pronouns")}
        />
        <AuthSelect
          id="signup-language"
          label="Language"
          placeholder="Select language"
          options={signupLanguages}
          error={errors.language?.message}
          {...register("language")}
        />
        <AuthSelect
          id="signup-location"
          label="Location (optional)"
          placeholder="Select location (optional)"
          options={signupLocations}
          required={false}
          error={errors.location?.message}
          {...register("location")}
        />
        <AuthField
          id="signup-password"
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
        <AuthField
          id="signup-confirm-password"
          label="Confirm password"
          type={showConfirmPassword ? "text" : "password"}
          placeholder="Confirm password"
          error={errors.confirmPassword?.message}
          trailing={
            <button
              type="button"
              aria-label={showConfirmPassword ? "Hide password" : "Show password"}
              onClick={() => setShowConfirmPassword((v) => !v)}
              className="absolute right-2 top-1/2 grid h-11 w-11 -translate-y-1/2 place-items-center text-muted-foreground hover:text-foreground"
            >
              {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          }
          {...register("confirmPassword")}
        />
        {/* "I'm not a robot" gate */}
        <label className="flex items-center gap-3 rounded-xl border border-border bg-card px-4 py-3.5 transition-colors hover:bg-muted/40">
          <span
            role="checkbox"
            aria-checked={notRobot}
            tabIndex={0}
            onClick={() => setNotRobot((v) => !v)}
            onKeyDown={(e) => e.key === " " && setNotRobot((v) => !v)}
            className={`grid h-5 w-5 shrink-0 place-items-center rounded border-2 transition-colors ${
              notRobot ? "border-sage bg-sage" : "border-border bg-background"
            }`}
          >
            {notRobot && (
              <svg viewBox="0 0 10 8" className="h-3 w-3 text-primary-foreground" fill="none" stroke="currentColor" strokeWidth={1.8}>
                <path d="M1 4l2.5 2.5L9 1" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            )}
          </span>
          <span className="text-sm text-foreground">I'm not a robot</span>
        </label>

        <AuthSubmitButton disabled={isSubmitting || !notRobot}>Sign up</AuthSubmitButton>
        <AuthDivider />
        <SocialAuthButtons />
      </form>
    </AuthLayout>
  );
}
