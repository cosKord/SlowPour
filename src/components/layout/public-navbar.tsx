"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { Wordmark } from "@/components/brand/wordmark";
import { ButtonLink } from "@/components/ui/button";

export function PublicNavbar() {
  const [scrolled,setScrolled]=useState(false);
  useEffect(()=>{const update=()=>setScrolled(window.scrollY>80);update();window.addEventListener("scroll",update,{passive:true});return()=>window.removeEventListener("scroll",update)},[]);
  return <header className={`public-nav${scrolled?" public-nav--scrolled":""}`}><Wordmark/><nav aria-label="Primary navigation"><Link href="/#journal">Journal</Link><Link href="/#collection">Collection</Link><Link href="/about">About</Link></nav><ButtonLink href="/login" className="nav-cta">Enter demo</ButtonLink></header>;
}
