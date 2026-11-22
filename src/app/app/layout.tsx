import { AppShell } from "@/components/layout/app-shell";
import { DashboardProvider } from "@/components/dashboard-store";
import { Suspense } from "react";
import "@fontsource-variable/inter";
import { redirect } from "next/navigation";
import { userIdFromSession } from "@/lib/server/auth";
export const instant = false;
export default async function Layout({ children }: { children: React.ReactNode }) {
  if (!process.env.DATABASE_URL || !(await userIdFromSession())) redirect("/login");
  return (
    <Suspense fallback={<p>Opening your journal…</p>}>
      <DashboardProvider>
        <AppShell>{children}</AppShell>
      </DashboardProvider>
    </Suspense>
  );
}
