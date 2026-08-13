import { LifeBuoy, ShieldCheck } from "lucide-react";
import { Link } from "react-router-dom";
import { OnboardingStep } from "@/components/onboarding/OnboardingStep";
import { useOnboarding } from "@/stores/onboarding";

export function OnboardingSafetyPage() {
  const {
    acknowledgedSafety,
    acknowledgedModeration,
    acknowledgedAge18,
    acknowledgeSafety,
    setAcknowledgedModeration,
    setAcknowledgedAge18,
  } = useOnboarding();

  const canContinue = acknowledgedSafety && acknowledgedModeration && acknowledgedAge18;

  return (
    <OnboardingStep
      eyebrow="A gentle note about safety"
      title="Seen is peer support — not a crisis service."
      subtitle="If you're in crisis or thinking about harming yourself, please reach out to a trained professional. We'll always make those resources one tap away."
      next="/matching"
      canContinue={canContinue}
      nextLabel="Find my match"
    >
      <div className="space-y-3">
        <div className="rounded-2xl border border-clay/30 bg-clay-soft p-5">
          <div className="flex items-start gap-3">
            <LifeBuoy className="mt-0.5 h-5 w-5 text-clay" />
            <div>
              <p className="font-medium text-foreground">If today is heavy</p>
              <p className="mt-1 text-sm text-muted-foreground">
                You can reach a trained human, 24/7, at <strong>988</strong> in the US,{" "}
                <strong>116 123</strong> (Samaritans) in the UK, or visit our{" "}
                <Link to="/support" className="underline">
                  crisis resources page
                </Link>
                .
              </p>
            </div>
          </div>
        </div>
        <div className="rounded-2xl border border-border bg-card p-5">
          <div className="flex items-start gap-3">
            <ShieldCheck className="mt-0.5 h-5 w-5 text-sage" />
            <div>
              <p className="font-medium text-foreground">Inside Seen</p>
              <p className="mt-1 text-sm text-muted-foreground">
                Conversations are encrypted. You can block, mute, or pause any conversation. Trained
                moderators review every report.
              </p>
            </div>
          </div>
        </div>
        <SafetyCheckbox
          checked={acknowledgedSafety}
          onChange={acknowledgeSafety}
          label="I understand Seen is peer support and not a replacement for professional care."
        />
        <SafetyCheckbox
          checked={acknowledgedModeration}
          onChange={() => setAcknowledgedModeration(!acknowledgedModeration)}
          label="My conversations may be reviewed by human moderators for safety purposes."
        />
        <SafetyCheckbox
          checked={acknowledgedAge18}
          onChange={() => setAcknowledgedAge18(!acknowledgedAge18)}
          label="I am 18 years of age or older."
        />
      </div>
    </OnboardingStep>
  );
}

function SafetyCheckbox({
  checked,
  onChange,
  label,
}: {
  checked: boolean;
  onChange: () => void;
  label: string;
}) {
  return (
    <label className="flex items-start gap-3 rounded-2xl border border-border bg-card p-5">
      <input
        type="checkbox"
        checked={checked}
        onChange={onChange}
        className="mt-0.5 h-4 w-4 accent-foreground"
      />
      <span className="text-sm text-foreground">{label}</span>
    </label>
  );
}
