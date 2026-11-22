import { AppShell } from "@/components/layout/app-shell";
import { DashboardProvider } from "@/components/dashboard-store";
import { Suspense } from "react";
import "@fontsource-variable/inter";
export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <Suspense fallback={<p>Opening your journal…</p>}>
      <DashboardProvider>
        <AppShell>{children}</AppShell>
      </DashboardProvider>
    </Suspense>
  );
}
