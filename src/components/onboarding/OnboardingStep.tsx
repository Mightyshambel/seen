import { Link, useNavigate } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import { useEffect, useState } from "react";
import { createPortal } from "react-dom";

interface Props {
  title: React.ReactNode;
  subtitle?: React.ReactNode;
  eyebrow?: string;
  children: React.ReactNode;
  next?: string;
  nextLabel?: string;
  canContinue?: boolean;
  skipTo?: string;
  affirmation?: string;
  onNext?: () => void | Promise<void>;
}

function OnboardingActionBar({
  next,
  nextLabel,
  canContinue,
  skipTo,
  onNext,
}: Pick<Props, "next" | "nextLabel" | "canContinue" | "skipTo" | "onNext">) {
  const navigate = useNavigate();

  const handleContinue = async () => {
    if (!canContinue || !next) return;
    await onNext?.();
    navigate(next);
  };

  return (
    <div className="sticky-bar fixed inset-x-0 bottom-0 z-[60] px-6 py-5 pb-[max(1.25rem,env(safe-area-inset-bottom))]">
      <div className="mx-auto flex max-w-2xl items-center justify-between gap-4">
        {skipTo ? (
          <Link to={skipTo} className="link-muted text-sm">
            Skip for now
          </Link>
        ) : (
          <span />
        )}
        <button
          type="button"
          disabled={!canContinue || !next}
          onClick={handleContinue}
          className="btn-primary min-h-11 px-7 py-3 disabled:cursor-not-allowed disabled:opacity-40"
        >
          {nextLabel}
          <ArrowRight className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}

export function OnboardingStep({
  title,
  subtitle,
  eyebrow,
  children,
  next,
  nextLabel = "Continue",
  canContinue = true,
  skipTo,
  affirmation,
  onNext,
}: Props) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const actionBar = (
    <OnboardingActionBar
      next={next}
      nextLabel={nextLabel}
      canContinue={canContinue}
      skipTo={skipTo}
      onNext={onNext}
    />
  );

  return (
    <div>
      {eyebrow && <p className="eyebrow text-muted-foreground">{eyebrow}</p>}
      <h1 className="display-2 mt-3">{title}</h1>
      {subtitle && (
        <p className="mt-4 max-w-xl text-base leading-relaxed text-muted-foreground">{subtitle}</p>
      )}
      {affirmation && (
        <div className="surface-inset mt-6 p-5 text-sm leading-relaxed text-foreground/85">
          {affirmation}
        </div>
      )}
      <div className="mt-8">{children}</div>
      {mounted ? createPortal(actionBar, document.body) : actionBar}
    </div>
  );
}
