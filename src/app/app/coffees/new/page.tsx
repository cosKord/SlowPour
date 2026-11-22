"use client";
import { useRouter } from "next/navigation";
import { OpenBag } from "@/components/dashboard-dialogs";
export default function NewCoffeePage() {
  const router = useRouter();
  return (
    <OpenBag
      onClose={() => router.push("/app/coffees")}
      onSaved={() => router.push("/app/coffees")}
    />
  );
}
