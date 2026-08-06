import { useNavigate } from "react-router-dom";
import { LogOut } from "lucide-react";
import { SettingsLinkRow, SettingsPageIntro } from "@/components/settings/SettingsShell";
import { logout } from "@/lib/api/auth";
import { deleteAccount, exportAccount } from "@/lib/api/users";
import { clearLocalUserData } from "@/lib/session";
import { disconnectWs } from "@/lib/ws-client";
import { queryClient } from "@/app/providers";
import { useAuthStore } from "@/stores/auth";
import { useSettings } from "@/stores/settings";

export function AccountSettings() {
  const navigate = useNavigate();
  const accountEmail = useSettings((s) => s.accountEmail);
  const clearAuth = useAuthStore((s) => s.clear);

  const handleExport = async () => {
    const data = await exportAccount();
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = "seen-data-export.json";
    anchor.click();
    URL.revokeObjectURL(url);
  };

  const handleDelete = async () => {
    const confirmed = window.confirm(
      "This will permanently delete your Seen account and all associated data.",
    );
    if (!confirmed) return;

    await deleteAccount();
    disconnectWs();
    queryClient.clear();
    clearLocalUserData();
    clearAuth();
    navigate("/");
  };

  const handleChangePassword = async () => {
    await logout();
    disconnectWs();
    queryClient.clear();
    clearLocalUserData();
    clearAuth();
    navigate("/reset-password");
  };

  const handleLogout = async () => {
    await logout();
    disconnectWs();
    queryClient.clear();
    clearLocalUserData();
    clearAuth();
    navigate("/login");
  };

  return (
    <>
      <SettingsPageIntro title="Account" description="Manage your account details and data." />

      <div className="space-y-5">
        <div className="surface-card p-8">
          <div className="space-y-6">
            <div>
              <p className="text-[14px] font-medium text-foreground">Email</p>
              <p className="mt-1 text-[14px] text-muted-foreground">{accountEmail}</p>
            </div>
            <div className="border-t border-border/60 pt-6">
              <p className="text-[14px] font-medium text-foreground">Password</p>
              <button
                type="button"
                onClick={() => void handleChangePassword()}
                className="link-muted mt-1 inline-block text-[14px] font-medium hover:text-sage"
              >
                Change password
              </button>
            </div>
          </div>
        </div>

        <SettingsLinkRow label="Export my data" onClick={() => void handleExport()} />
        <SettingsLinkRow label="Delete account" danger onClick={() => void handleDelete()} />

        <button
          type="button"
          onClick={() => void handleLogout()}
          className="link-muted inline-flex items-center gap-2 px-1 text-[14px] font-medium"
        >
          <LogOut className="h-4 w-4" />
          Sign out
        </button>
      </div>
    </>
  );
}
