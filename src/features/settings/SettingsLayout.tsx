import { Outlet, useLocation } from "react-router-dom";
import { SettingsShell } from "@/components/settings/SettingsShell";

export function SettingsLayout() {
  const { pathname } = useLocation();
  return (
    <SettingsShell activePath={pathname}>
      <Outlet />
    </SettingsShell>
  );
}
