import Link from "next/link";
import Image from "next/image";
import { cn } from "@/lib/utils";

export function Wordmark({ inverse = false, className }: { inverse?: boolean; className?: string }) {
  return <Link href="/" className={cn("wordmark", inverse && "text-cream", className)} aria-label="SlowPour home"><Image src="/slowpour-logo.png" alt="" width={32} height={32} className="wordmark-logo" />SlowPour<span aria-hidden="true">.</span></Link>;
}
