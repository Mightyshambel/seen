import { Link } from "react-router-dom";
import { Heart } from "lucide-react";
import type { ReactNode } from "react";

type AuthLayoutProps = {
  title: string;
  subtitle: ReactNode;
  children: ReactNode;
  footer: ReactNode;
  promoTitle: string;
  promoSubtitle?: string;
  activeSlide?: number;
};

const slides = [
  {
    title: "Make hard chapters feel less lonely with Seen.",
    subtitle: "Quiet matching with someone who's been where you are.",
  },
  {
    title: "Private conversations, gently held.",
    subtitle: "End-to-end encrypted. Human-moderated. Never sold.",
  },
  {
    title: "Take it at your own pace.",
    subtitle: "Pause, return, or begin again whenever you're ready.",
  },
];

export function AuthLayout({
  title,
  subtitle,
  children,
  footer,
  promoTitle,
  promoSubtitle,
  activeSlide = 0,
}: AuthLayoutProps) {
  const slide = slides[activeSlide] ?? slides[0];

  return (
    <div className="min-h-dvh bg-background lg:grid lg:grid-cols-2">
      <div className="flex min-h-dvh flex-col px-6 py-10 sm:px-12 lg:px-16 lg:py-14">
        <Link to="/" className="group inline-flex items-center gap-2.5 self-start">
          <span className="logo-mark h-9 w-9 transition-transform duration-300 group-hover:scale-105">
            <Heart className="h-4 w-4 text-sage" strokeWidth={1.6} />
          </span>
          <span className="font-serif text-[1.35rem] tracking-tight">Seen</span>
        </Link>

        <div className="mx-auto flex w-full max-w-md flex-1 flex-col justify-center py-12">
          <h1 className="font-serif text-[2.5rem] leading-[1.08] tracking-tight text-foreground sm:text-[2.85rem]">
            {title}
          </h1>
          <p className="mt-4 text-sm leading-relaxed text-muted-foreground sm:text-base">{subtitle}</p>
          <div className="mt-10">{children}</div>
          <p className="mt-10 text-center text-sm text-muted-foreground">{footer}</p>
        </div>
      </div>

      <aside className="relative hidden overflow-hidden bg-gradient-to-br from-sage-soft/80 via-sage-soft/50 to-lavender-soft/30 p-10 lg:flex lg:flex-col lg:justify-between">
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 opacity-40"
          style={{
            background:
              "radial-gradient(50% 40% at 20% 20%, color-mix(in oklab, var(--sage) 20%, transparent), transparent 70%)," +
              "radial-gradient(45% 35% at 80% 80%, color-mix(in oklab, var(--lavender) 15%, transparent), transparent 65%)",
          }}
        />
        <div className="relative flex flex-1 items-center justify-center">
          <div className="relative w-full max-w-md">
            <div className="surface-glass absolute -left-2 top-8 px-5 py-4 shadow-[var(--shadow-elevated)]">
              <p className="text-xs font-semibold">Peer match</p>
              <p className="mt-1 text-[11px] text-muted-foreground">94% understanding</p>
              <div className="mt-3 h-1.5 w-28 overflow-hidden rounded-full bg-muted">
                <div className="h-full w-[84%] rounded-full bg-sage shadow-[var(--shadow-glow-sage)]" />
              </div>
            </div>

            <div className="mx-auto flex h-56 w-56 items-end justify-center rounded-[2rem] border border-border/30 bg-card/70 shadow-[var(--shadow-elevated)] backdrop-blur-xl">
              <svg viewBox="0 0 200 220" className="h-52 w-52" aria-hidden>
                <circle cx="100" cy="58" r="24" fill="none" stroke="currentColor" strokeWidth="3" />
                <path
                  d="M72 92c8-18 48-18 56 0v8c-12 8-44 8-56 0v-8Z"
                  fill="var(--sage-soft)"
                  stroke="currentColor"
                  strokeWidth="3"
                />
                <path
                  d="M68 118c6 34 58 34 64 0"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="3"
                  strokeLinecap="round"
                />
                <path
                  d="M82 150c8 24 28 24 36 0"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="3"
                  strokeLinecap="round"
                />
                <circle cx="145" cy="72" r="10" fill="var(--sage-soft)" stroke="currentColor" strokeWidth="2" />
                <circle cx="58" cy="86" r="8" fill="var(--lavender-soft)" stroke="currentColor" strokeWidth="2" />
              </svg>
            </div>

            <div className="absolute -right-1 bottom-10 rounded-full border border-border/40 bg-card/90 px-4 py-2.5 text-xs shadow-[var(--shadow-soft)] backdrop-blur-md">
              Available now
            </div>
          </div>
        </div>

        <div className="text-center">
          <div className="mb-6 flex justify-center gap-2">
            {slides.map((_, i) => (
              <span
                key={i}
                className={
                  "h-2 w-2 rounded-full transition-all duration-300 " +
                  (i === activeSlide ? "w-6 bg-foreground" : "bg-foreground/20")
                }
              />
            ))}
          </div>
          <h2 className="font-serif text-2xl leading-snug text-foreground">
            {promoTitle || slide.title}
          </h2>
          {(promoSubtitle || slide.subtitle) && (
            <p className="mx-auto mt-3 max-w-sm text-sm text-muted-foreground">
              {promoSubtitle || slide.subtitle}
            </p>
          )}
        </div>
      </aside>
    </div>
  );
}

export function AuthDivider() {
  return (
    <div className="relative my-6">
      <div className="absolute inset-0 flex items-center">
        <span className="w-full border-t border-border" />
      </div>
      <div className="relative flex justify-center text-xs uppercase tracking-wide">
        <span className="bg-background px-3 text-muted-foreground">or continue with</span>
      </div>
    </div>
  );
}

export function AuthField({
  id,
  label,
  type = "text",
  placeholder,
  error,
  trailing,
  ...inputProps
}: {
  id: string;
  label: string;
  type?: string;
  placeholder: string;
  error?: string;
  trailing?: ReactNode;
} & React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <div>
      <label htmlFor={id} className="sr-only">
        {label}
      </label>
      <div className="relative">
        <input
          id={id}
          type={type}
          placeholder={placeholder}
          aria-invalid={error ? true : undefined}
          aria-describedby={error ? `${id}-error` : undefined}
          className="field-soft pr-12"
          {...inputProps}
        />
        {trailing}
      </div>
      {error && (
        <p id={`${id}-error`} className="mt-1.5 text-xs text-destructive" role="alert">
          {error}
        </p>
      )}
    </div>
  );
}

export function AuthSelect({
  id,
  label,
  placeholder,
  error,
  options,
  ...selectProps
}: {
  id: string;
  label: string;
  placeholder: string;
  error?: string;
  options: { value: string; label: string }[];
} & React.SelectHTMLAttributes<HTMLSelectElement>) {
  return (
    <div>
      <label htmlFor={id} className="sr-only">
        {label}
      </label>
      <select
        id={id}
        aria-invalid={error ? true : undefined}
        aria-describedby={error ? `${id}-error` : undefined}
        className="field-soft appearance-none bg-[length:1rem] bg-[right_1.25rem_center] bg-no-repeat pr-12"
        style={{
          backgroundImage:
            "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='16' height='16' viewBox='0 0 24 24' fill='none' stroke='%236b7280' stroke-width='2'%3E%3Cpath d='m6 9 6 6 6-6'/%3E%3C/svg%3E\")",
        }}
        {...selectProps}
      >
        <option value="" disabled={selectProps.required !== false}>
          {placeholder}
        </option>
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
      {error && (
        <p id={`${id}-error`} className="mt-1.5 text-xs text-destructive" role="alert">
          {error}
        </p>
      )}
    </div>
  );
}

export function AuthSubmitButton({ children, disabled }: { children: ReactNode; disabled?: boolean }) {
  return (
    <button type="submit" disabled={disabled} className="btn-primary mt-6 h-12 w-full disabled:opacity-50">
      {children}
    </button>
  );
}

export function SocialAuthButtons() {
  return (
    <div className="flex justify-center gap-4">
      <button
        type="button"
        aria-label="Continue with Google"
        className="grid h-11 w-11 place-items-center rounded-full bg-foreground text-background shadow-[0_8px_20px_-8px_oklch(0.24_0.02_268_/_0.35)] transition-all duration-300 hover:-translate-y-0.5 hover:shadow-[0_12px_28px_-8px_oklch(0.24_0.02_268_/_0.4)] active:scale-95"
      >
        <GoogleIcon />
      </button>
      <button
        type="button"
        aria-label="Continue with Apple"
        className="grid h-11 w-11 place-items-center rounded-full bg-foreground text-background shadow-[0_8px_20px_-8px_oklch(0.24_0.02_268_/_0.35)] transition-all duration-300 hover:-translate-y-0.5 hover:shadow-[0_12px_28px_-8px_oklch(0.24_0.02_268_/_0.4)] active:scale-95"
      >
        <AppleIcon />
      </button>
      <button
        type="button"
        aria-label="Continue with Facebook"
        className="grid h-11 w-11 place-items-center rounded-full bg-foreground text-background shadow-[0_8px_20px_-8px_oklch(0.24_0.02_268_/_0.35)] transition-all duration-300 hover:-translate-y-0.5 hover:shadow-[0_12px_28px_-8px_oklch(0.24_0.02_268_/_0.4)] active:scale-95"
      >
        <FacebookIcon />
      </button>
    </div>
  );
}

function GoogleIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-5 w-5" aria-hidden>
      <path
        fill="currentColor"
        d="M21.8 12.2c0-.7-.1-1.4-.2-2H12v3.8h5.5a4.8 4.8 0 0 1-2.1 3.1v2.6h3.4c2-1.8 3-4.5 3-6.5Z"
      />
      <path
        fill="currentColor"
        d="M12 22c2.8 0 5.2-.9 6.9-2.5l-3.4-2.6c-.9.6-2.1 1-3.5 1-2.7 0-5-1.8-5.8-4.3H3.1v2.7A10 10 0 0 0 12 22Z"
      />
      <path
        fill="currentColor"
        d="M6.2 13.6A6 6 0 0 1 6 12c0-.6.1-1.2.2-1.6V7.7H3.1a10 10 0 0 0 0 8.6l3.1-2.7Z"
      />
      <path
        fill="currentColor"
        d="M12 5.8c1.5 0 2.8.5 3.9 1.5l2.9-2.9A10 10 0 0 0 3.1 7.7l3.1 2.7C7.1 7.6 9.3 5.8 12 5.8Z"
      />
    </svg>
  );
}

function AppleIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-5 w-5" aria-hidden>
      <path
        fill="currentColor"
        d="M16.7 12.7c0-2.4 2-3.5 2.1-3.6-1.1-1.7-2.9-1.9-3.5-2-1.5-.2-2.9.9-3.7.9s-1.9-.9-3.2-.9c-1.6 0-3.1.9-4 2.3-1.7 2.9-1.4 7.3.4 9.7.9 1.3 2 2.8 3.4 2.7 1.4-.1 1.9-.9 3.6-.9s2.1.9 3.5.9c1.4 0 2.3-1.3 3.2-2.6.6-.9 1.3-2 1.6-3.1-3.4-1.3-2.8-5.2-2.8-5.3Z"
      />
      <path
        fill="currentColor"
        d="M14.9 4.8c.8-1 1.3-2.3 1.1-3.7-1.1.1-2.4.7-3.2 1.7-.7.8-1.3 2.1-1.1 3.4 1.2.1 2.4-.6 3.2-1.4Z"
      />
    </svg>
  );
}

function FacebookIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-5 w-5" aria-hidden>
      <path
        fill="currentColor"
        d="M13.5 22v-8h2.7l.4-3h-3.1V9.1c0-.9.2-1.5 1.5-1.5H17V5.1c-.3 0-1.2-.1-2.3-.1-2.3 0-3.8 1.4-3.8 4v2.2H8.5v3h2.4v8h2.6Z"
      />
    </svg>
  );
}
