import { Link } from "react-router-dom";
import { LogOut } from "lucide-react";
import { SettingsLinkRow, SettingsPageIntro } from "@/components/settings/SettingsShell";

export function AccountSettings() {
  return (
    <>
      <SettingsPageIntro title="Account" description="Manage your account details and data." />

      <div className="space-y-5">
        <div className="surface-card p-8">
          <div className="space-y-6">
            <div>
              <p className="text-[14px] font-medium text-foreground">Email</p>
              <p className="mt-1 text-[14px] text-muted-foreground">hello@example.com</p>
            </div>
            <div className="border-t border-border/60 pt-6">
              <p className="text-[14px] font-medium text-foreground">Password</p>
              <Link
                to="/reset-password"
                className="link-muted mt-1 inline-block text-[14px] font-medium hover:text-sage"
              >
                Change password
              </Link>
            </div>
          </div>
        </div>

        <SettingsLinkRow label="Export my data" />
        <SettingsLinkRow label="Delete account" danger />

        <Link
          to="/login"
          className="link-muted inline-flex items-center gap-2 px-1 text-[14px] font-medium"
        >
          <LogOut className="h-4 w-4" />
          Sign out
        </Link>
      </div>
    </>
  );
}
