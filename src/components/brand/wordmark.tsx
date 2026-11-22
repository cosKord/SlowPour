import Link from "next/link";
import { cn } from "@/lib/utils";

export function Wordmark({ inverse = false, className }: { inverse?: boolean; className?: string }) {
  return <Link href="/" className={cn("wordmark", inverse && "text-cream", className)} aria-label="SlowPour home">SlowPour<span aria-hidden="true">.</span></Link>;
}
