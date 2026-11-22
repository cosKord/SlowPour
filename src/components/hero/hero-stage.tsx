"use client";

import { motion,useReducedMotion,useScroll,useTransform } from "motion/react";
import { ArrowRight } from "lucide-react";
import { useRef } from "react";
import { ButtonLink } from "@/components/ui/button";
import { dur,ease,stagger } from "@/lib/motion";
import { HeroBeans } from "./hero-beans";
import { HeroCup } from "./hero-cup";
import { HeroRibbon } from "./hero-ribbon";

function AnimatedWord({word,className}:{word:string;className:string}){return <span className={className}>{word.split("").map((letter,index)=><span className="hero-letter-mask" key={`${letter}-${index}`}><motion.span aria-hidden="true" initial={{y:"112%",opacity:0}} animate={{y:0,opacity:1}} transition={{duration:dur.hero,delay:.15+index*stagger.letters,ease:ease.out}}>{letter}</motion.span></span>)}</span>}

export function HeroStage(){const ref=useRef<HTMLElement>(null);const reducedMotion=useReducedMotion();const{scrollYProgress}=useScroll({target:ref,offset:["start start","end start"]});const archY=useTransform(scrollYProgress,[0,.6],[0,-45]);const cupY=useTransform(scrollYProgress,[0,.6],[0,-90]);const beansY=useTransform(scrollYProgress,[0,.6],[0,-145]);return <section className="hero-stage" ref={ref}>
  <div className="hero-scene" style={{backgroundImage:"url('/assets/hero-ivory-paper.webp')",backgroundSize:"cover",backgroundPosition:"center",backgroundRepeat:"no-repeat"}}>
  <motion.div className="hero-arch" aria-hidden="true" style={{y:reducedMotion?0:archY}}/><div className="hero-shell hero-shell--terra" aria-hidden="true"/><div className="hero-shell hero-shell--sand" aria-hidden="true"/>
  <HeroRibbon><div className="hero-wordmark" aria-hidden="true" style={{top:"46%"}}><span><AnimatedWord word="Slow" className="hero-word hero-word--slow"/></span><span><AnimatedWord word="Pour" className="hero-word hero-word--pour"/></span></div></HeroRibbon>
  <motion.div style={{position:"absolute",zIndex:4,inset:0,y:reducedMotion?0:cupY,pointerEvents:"none"}}><HeroCup/></motion.div><motion.div style={{position:"absolute",zIndex:5,inset:0,y:reducedMotion?0:beansY,pointerEvents:"none"}}><HeroBeans/></motion.div>
  <a className="hero-scroll" href="#hero-story"><span/>Scroll to explore</a>
  </div>
  <motion.div id="hero-story" className="hero-copy" initial={reducedMotion?false:{opacity:0,y:32}} whileInView={{opacity:1,y:0}} viewport={{once:true,amount:.35}} transition={{duration:reducedMotion?0:.7,ease:ease.out}}><h1>Every cup has <span className="editorial">a story.</span></h1><p>Keep your coffee collection, recipes, and brewing notes in one thoughtful place, then make the next cup even better.</p><div className="hero-actions"><ButtonLink href="/login">Start your coffee journal <ArrowRight size={16}/></ButtonLink><ButtonLink href="#journal" variant="secondary">See how it works</ButtonLink></div></motion.div>
</section>}
