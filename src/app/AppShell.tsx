import { Outlet } from "react-router-dom";
import { Toaster } from "sonner";
import { AccessibilitySync } from "@/components/common/AccessibilitySync";
import { ConsentBanner } from "@/components/common/ConsentBanner";
import { CallOverlayHost } from "@/components/calls/CallOverlay";

export function AppShell() {
  return (
    <>
      <AccessibilitySync />
      <Outlet />
      <CallOverlayHost />
      <ConsentBanner />
      <Toaster position="bottom-center" richColors closeButton />
    </>
  );
}
