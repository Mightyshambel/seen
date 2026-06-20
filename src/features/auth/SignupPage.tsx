import { zodResolver } from "@hookform/resolvers/zod";
import { Eye, EyeOff } from "lucide-react";
import { useState } from "react";
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
import { signupSchema, type SignupFormValues } from "@/features/auth/schemas";
import { signupLanguages, signupLocations, signupPronouns } from "@/lib/signup-options";
import { useOnboarding } from "@/stores/onboarding";

export function SignupPage() {
  const navigate = useNavigate();
  const { setLanguages, setPronouns, setLocation } = useOnboarding();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<SignupFormValues>({
    resolver: zodResolver(signupSchema),
    defaultValues: {
      username: "",
      pronouns: "",
      language: "",
      location: "",
      password: "",
      confirmPassword: "",
    },
  });

  const onSubmit = handleSubmit((data) => {
    setPronouns(data.pronouns);
    setLanguages([data.language]);
    setLocation(data.location ?? "");
    navigate("/onboarding/welcome");
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
        <AuthField
          id="signup-username"
          label="Username"
          placeholder="Username"
          error={errors.username?.message}
          {...register("username")}
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
              className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
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
              className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
            >
              {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          }
          {...register("confirmPassword")}
        />
        <AuthSubmitButton disabled={isSubmitting}>Sign up</AuthSubmitButton>
        <AuthDivider />
        <SocialAuthButtons />
      </form>
    </AuthLayout>
  );
}
