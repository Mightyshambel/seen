import { Outlet } from "react-router-dom";
import { Toaster } from "sonner";
import { ConsentBanner } from "@/components/common/ConsentBanner";

export function AppShell() {
  return (
    <>
      <Outlet />
      <ConsentBanner />
      <Toaster position="bottom-center" richColors closeButton />
    </>
  );
}
