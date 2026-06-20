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
import { loginSchema, type LoginFormValues } from "@/features/auth/schemas";

export function LoginPage() {
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: { username: "", password: "" },
  });

  const onSubmit = handleSubmit(() => {
    navigate("/onboarding/welcome");
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
              className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
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
