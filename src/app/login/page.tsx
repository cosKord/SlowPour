import Image from "next/image";
import Link from "next/link";
import styles from "./login.module.css";

export const instant = false;

export default async function LoginPage({ searchParams }: { searchParams: Promise<{ error?: string }> }) {
  const { error } = await searchParams;
  const errorMessage = error === "cancelled" ? "Google sign-in was cancelled. Please try again." : error === "unavailable" ? "Google sign-in is not configured yet." : error ? "Google sign-in could not be completed. Please try again." : null;
  return (
    <main className={styles.page}>
      <section className={styles.editorial} aria-label="SlowPour coffee journal">
        <Image className={styles.photo} src="/assets/login-coffee-poster.webp" alt="Vintage-style photograph of a coffee cup on a warm wooden table" fill priority sizes="(max-width: 767px) 100vw, (max-width: 1023px) 50vw, 55vw" />
        <div className={styles.photoShade} aria-hidden="true" />
        <div className={styles.editorialContent}>
          <Link className={styles.wordmark} href="/" aria-label="SlowPour home">SlowPour</Link>
          <div className={styles.story}>
            <h2 aria-label="Coffee. Coffee. Coffee."><span>Coffee.</span><span>Coffee.</span><span>Coffee.</span><span>Coffee.</span><span>Coffee.</span></h2>
            <p>A quiet place for every cup, every recipe, every discovery.</p>
            <div className={styles.caption}><span>SLOWPOUR — EST. 2026</span><span>THE PERSONAL COFFEE JOURNAL</span></div>
          </div>
        </div>
      </section>
      <section className={styles.auth} aria-labelledby="login-title">
        <p className={styles.topLabel}>SLOWPOUR / THE COFFEE JOURNAL</p>
        <div className={styles.authContent}>
          <p className={styles.eyebrow}>YOUR COFFEE JOURNAL</p>
          <h1 id="login-title">A little ritual,<br />every day.</h1>
          <p className={styles.description}>Your brews, recipes and memories, all in one place.</p>
          {errorMessage && <p role="alert" className={styles.error}>{errorMessage}</p>}
          <a className={styles.googleButton} href="/api/auth/google">
            <svg className={styles.googleIcon} viewBox="0 0 24 24" aria-hidden="true" focusable="false"><path fill="#4285F4" d="M21.35 12.25c0-.7-.06-1.37-.18-2.02H12v3.83h5.24a4.48 4.48 0 0 1-1.95 2.94v2.45h3.15c1.84-1.7 2.91-4.19 2.91-7.2Z"/><path fill="#34A853" d="M12 21.75c2.62 0 4.82-.87 6.44-2.3l-3.15-2.45c-.87.59-1.99.94-3.29.94-2.53 0-4.68-1.71-5.45-4.01H3.3v2.53A9.75 9.75 0 0 0 12 21.75Z"/><path fill="#FBBC05" d="M6.55 13.93a5.85 5.85 0 0 1 0-3.86V7.54H3.3a9.75 9.75 0 0 0 0 8.92l3.25-2.53Z"/><path fill="#EA4335" d="M12 6.06c1.43 0 2.71.49 3.72 1.47l2.79-2.79A9.34 9.34 0 0 0 12 2.25a9.75 9.75 0 0 0-8.7 5.29l3.25 2.53c.77-2.3 2.92-4.01 5.45-4.01Z"/></svg>
            <span>Continue with Google</span><span className={styles.arrow} aria-hidden="true">→</span>
          </a>
        </div>
        <p className={styles.closing}>BREW SLOWLY. REMEMBER EVERYTHING.</p>
      </section>
    </main>
  );
}
