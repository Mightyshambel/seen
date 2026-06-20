import { z } from "zod";

export const loginSchema = z.object({
  username: z.string().trim().min(1, "Username is required"),
  password: z.string().min(1, "Password is required"),
});

export type LoginFormValues = z.infer<typeof loginSchema>;

export const signupSchema = z
  .object({
    username: z.string().trim().min(2, "Username must be at least 2 characters"),
    pronouns: z.string().min(1, "Please select your pronouns"),
    language: z.string().min(1, "Please select a language"),
    location: z.string().optional(),
    password: z.string().min(8, "Password must be at least 8 characters"),
    confirmPassword: z.string().min(1, "Please confirm your password"),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ["confirmPassword"],
  });

export type SignupFormValues = z.infer<typeof signupSchema>;

export const resetPasswordSchema = z.object({
  username: z.string().trim().min(1, "Username is required"),
});

export type ResetPasswordFormValues = z.infer<typeof resetPasswordSchema>;
