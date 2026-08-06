import { Link } from "react-router-dom";
import { SeenLogo } from "@/components/brand/SeenLogo";
import type { ReactNode } from "react";

type AuthLayoutProps = {
  title: string;
  subtitle: ReactNode;
  children: ReactNode;
  footer: ReactNode;
  promoTitle: string;
  promoSubtitle?: string;
  activeSlide?: number;
  /** Full-bleed photo for the right panel. Defaults to the landing hero image. */
  promoImage?: string;
};

const AUTH_PROMO_IMAGE = "/images/auth-promo.png";

const slides = [
  {
    title: "Make hard chapters feel less lonely with Seen.",
    subtitle: "Quiet matching with someone who's been where you are.",
    image: AUTH_PROMO_IMAGE,
  },
  {
    title: "Private conversations, gently held.",
    subtitle: "End-to-end encrypted. Human-moderated. Never sold.",
    image: AUTH_PROMO_IMAGE,
  },
  {
    title: "Take it at your own pace.",
    subtitle: "Pause, return, or begin again whenever you're ready.",
    image: AUTH_PROMO_IMAGE,
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
  promoImage,
}: AuthLayoutProps) {
  const slide = slides[activeSlide] ?? slides[0];
  const imageSrc = promoImage ?? slide.image;

  return (
    <div className="min-h-dvh bg-background lg:grid lg:grid-cols-2">
      <div className="flex min-h-dvh flex-col px-6 py-10 sm:px-12 lg:px-16 lg:py-14">
        <Link to="/" className="group inline-flex self-start">
          <SeenLogo className="h-14 transition-transform duration-300 group-hover:scale-105 sm:h-16" />
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

      <aside className="relative hidden overflow-hidden lg:block">
        <img
          src={imageSrc}
          alt=""
          className="absolute inset-0 h-full w-full object-cover object-center"
        />
        <div className="absolute inset-0 bg-sage/55 mix-blend-multiply" />
        <div className="absolute inset-0 bg-gradient-to-b from-sage/70 via-sage/30 to-foreground/80" />
        <div className="absolute inset-0 bg-gradient-to-t from-sage/55 via-transparent to-sage/25" />

        <div className="relative flex h-full min-h-dvh flex-col justify-end px-10 pb-14 pt-16">
          <h2 className="max-w-md font-serif text-3xl leading-snug text-white">
            {promoTitle || slide.title}
          </h2>
          {(promoSubtitle || slide.subtitle) && (
            <p className="mt-4 max-w-sm text-sm leading-relaxed text-white/80">
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
      <label htmlFor={id} className="mb-1.5 block text-sm font-medium text-foreground">
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
      <label htmlFor={id} className="mb-1.5 block text-sm font-medium text-foreground">
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
    <div className="flex flex-col items-center gap-2">
      <div className="flex justify-center gap-4">
        <button
          type="button"
          disabled
          aria-label="Continue with Google (coming soon)"
          title="Coming soon"
          className="grid h-11 w-11 place-items-center rounded-full bg-foreground text-background opacity-40"
        >
          <GoogleIcon />
        </button>
        <button
          type="button"
          disabled
          aria-label="Continue with Apple (coming soon)"
          title="Coming soon"
          className="grid h-11 w-11 place-items-center rounded-full bg-foreground text-background opacity-40"
        >
          <AppleIcon />
        </button>
        <button
          type="button"
          disabled
          aria-label="Continue with Facebook (coming soon)"
          title="Coming soon"
          className="grid h-11 w-11 place-items-center rounded-full bg-foreground text-background opacity-40"
        >
          <FacebookIcon />
        </button>
      </div>
      <p className="text-xs text-muted-foreground">Coming soon</p>
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
