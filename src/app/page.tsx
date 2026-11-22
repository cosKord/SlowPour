import { ArrowRight, Check } from "lucide-react";
import { CoffeeBagArt } from "@/components/coffee/coffee-bag-art";
import { HeroStage } from "@/components/hero/hero-stage";
import { PublicNavbar } from "@/components/layout/public-navbar";
import { LandingAccents } from "@/components/landing/landing-accents";
import { ButtonLink } from "@/components/ui/button";
import { landingCoffees } from "@/data/landing-coffees";
import styles from "./landing.module.css";

const chapters = [
  { title: "Collect", copy: "Keep every bag, origin, process, and tasting note close.", href: "#collection" },
  { title: "Brew", copy: "Turn a favourite recipe into a real cup without losing the details.", href: "#journal" },
  { title: "Learn", copy: "See what changed, what worked, and where your palate is heading.", href: "#palate" },
];
const taste = [["Sweetness", 86], ["Acidity", 72], ["Body", 64], ["Clarity", 91], ["Finish", 78]] as const;

export default function Home() {
  return <main className="landing">
    <PublicNavbar />
    <HeroStage />

    <nav className={styles.chapters} aria-label="Explore SlowPour">
      {chapters.map(({ title, copy, href }) => <a href={href} className={styles.chapter} key={title}>
        <span className={styles.chapterTitle}>{title}<ArrowRight size={18} aria-hidden="true" /></span>
        <span className={styles.chapterCopy}>{copy}</span>
      </a>)}
    </nav>

    <section id="collection" className={styles.collection} aria-labelledby="collection-title">
      <LandingAccents variant="collection" />
      <div className={styles.collectionIntro}>
        <div><h2 id="collection-title">A shelf that remembers more than the label.</h2><p>Every bag keeps its origin, roast, open date, recipes, and the cups you brewed from it—so good coffee never becomes a vague memory.</p></div>
        <ButtonLink href="/login" variant="secondary">Enter demo to explore <ArrowRight size={16}/></ButtonLink>
      </div>
      <div className={styles.catalogue} aria-label="Four illustrative sample coffees shown on this landing page">
        {landingCoffees.map((coffee,index) => <article className={styles.catalogueItem} key={coffee.id}>
          <div className={styles.catalogueArt}><CoffeeBagArt coffee={coffee} tilt={[-5,4,-3,5][index]} className={styles.catalogueBag}/></div>
          <div className={styles.catalogueDetails}><span className={styles.catalogueIndex}>0{index + 1} / 04</span><h3>{coffee.name}</h3><p>{coffee.origin} · {coffee.process} · {coffee.roast} roast</p><span className={styles.catalogueNotes}>{coffee.notes.join(" · ")}</span></div>
        </article>)}
      </div>
    </section>

    <section id="journal" className={styles.journal} aria-labelledby="journal-title">
      <LandingAccents variant="journal" />
      <div className={styles.journalInner}>
        <div className={styles.journalIntro}><h2 id="journal-title">Write down the cup you actually made.</h2><p>Recipes are intentions. Brews are what happened. SlowPour keeps both, without making your morning feel like data entry.</p><ul><li><Check size={16} aria-hidden="true"/> Fast, focused brew logging</li><li><Check size={16} aria-hidden="true"/> Taste scores with useful context</li><li><Check size={16} aria-hidden="true"/> A clear note for next time</li></ul></div>
        <div className={styles.journalBook} aria-label="Example brew log">
          <div className={styles.journalPage}><div className={styles.pageTop}><span>Today’s brew</span><span>V60</span></div><h3>Kibingo<br/>Hills</h3><p className={styles.pageOrigin}>Kayanza, Burundi · Natural</p><div className={styles.recipeGrid}><div><small>Dose</small><strong>15 g</strong></div><div><small>Water</small><strong>250 g</strong></div><div><small>Temp</small><strong>94 °C</strong></div></div><div className={styles.pageFoot}>A cup, remembered.</div></div>
          <div className={`${styles.journalPage} ${styles.journalPageRight}`}><div className={styles.pageTop}><span>Tasting notes</span><span>4 / 5</span></div><blockquote>“Red currant up front, cocoa as it cooled.”</blockquote><div className={styles.scoreRow}><span>Sweetness</span><span aria-label="4 out of 5">● ● ● ● ○</span></div><div className={styles.nextNote}><small>Try next</small><strong>One click finer. Keep the bloom gentle.</strong></div><div className={styles.pageFoot}>SlowPour · Example entry</div></div>
        </div>
      </div>
    </section>

    <section id="palate" className={styles.palate} aria-labelledby="palate-title"><LandingAccents variant="palate" /><div className={styles.palateInner}>
      <div className={styles.palateIntro}><h2 id="palate-title">Your palate becomes a picture.</h2><p>SlowPour turns tasting notes into a quiet signal: the coffees you return to, the recipes that open them up, and the flavours you’re learning to notice.</p></div>
      <div className={styles.profile}><div className={styles.profileHeading}><span>Kibingo Hills</span><strong>4.6 / 5</strong></div><svg viewBox="0 0 420 420" role="img" aria-labelledby="radar-title radar-desc" className={styles.radar}><title id="radar-title">Kibingo Hills taste profile</title><desc id="radar-desc">High clarity and sweetness, with balanced acidity, body, and finish.</desc>{[1,2,3,4,5].map((ring)=><polygon key={ring} points={radarPoints(ring*18)} className={styles.radarGrid}/>)}{taste.map(([,],index)=><line key={index} x1="210" y1="210" x2={axisPoint(index).x} y2={axisPoint(index).y} className={styles.radarGrid}/>)}<polygon points={radarDataPoints(taste.map(([,value])=>value))} className={styles.radarFill}/>{taste.map(([label,value],index)=>{const p=axisPoint(index,122);return <g key={label}><text x={p.x} y={p.y-5} textAnchor="middle" className={styles.radarLabel}>{label}</text><text x={p.x} y={p.y+15} textAnchor="middle" className={styles.radarValue}>{value}</text></g>;})}</svg><p className={styles.profileFoot}>An example of what your brews can reveal.</p></div>
    </div></section>

    <section className={styles.process} aria-labelledby="process-title"><div className={styles.processInner}><h2 id="process-title">From shelf to next cup.</h2><div className={styles.processSteps}>{[["Choose a coffee","Open the bag you’re brewing and start from a recipe you trust."],["Log what changed","Capture the real dose, water, time, grind, and how the cup tasted."],["Return with a plan","See the full story and carry one useful adjustment into tomorrow."]].map(([title,copy])=><article key={title}><h3>{title}</h3><p>{copy}</p></article>)}</div></div></section>

    <section className={styles.closing} aria-labelledby="closing-title"><div className={styles.closingInner}><p>One cup at a time.</p><h2 id="closing-title">Make tomorrow’s cup <span className="editorial">worth remembering.</span></h2><ButtonLink href="/login" className="button--inverted">Start your coffee journal <ArrowRight size={16}/></ButtonLink><footer><span>SlowPour</span><span>Local-first demo · Your notes stay in this browser</span></footer></div></section>
  </main>;
}

function axisPoint(index:number,radius=94){const angle=-Math.PI/2+index*Math.PI*2/5;return{x:210+Math.cos(angle)*radius,y:210+Math.sin(angle)*radius};}
function radarPoints(radius:number){return Array.from({length:5},(_,index)=>{const p=axisPoint(index,radius);return `${p.x},${p.y}`;}).join(" ");}
function radarDataPoints(values:readonly number[]){return values.map((value,index)=>{const p=axisPoint(index,value*.9);return `${p.x},${p.y}`;}).join(" ");}
