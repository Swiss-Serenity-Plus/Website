// Header — sticky, transparent sur hero puis fond beige au scroll. 3 items nav + CTA.
"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import Button from "../Button/Button";
import styles from "./Header.module.css";

const navItems = [
  { label: "Accueil", href: "/" },
  { label: "Expertise", href: "/#services" },
  { label: "À propos", href: "/a-propos" },
];

export default function Header() {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 60);
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  function handleLogoClick(e: React.MouseEvent<HTMLAnchorElement>) {
    if (pathname === "/") {
      e.preventDefault();
      const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      window.scrollTo({ top: 0, behavior: prefersReducedMotion ? "auto" : "smooth" });
    }
    setMenuOpen(false);
  }

  return (
    <header className={`${styles.header} ${scrolled ? styles.scrolled : ""}`} role="banner">
      <div className={styles.inner}>
        <Link
          href="/"
          className={styles.logo}
          aria-label="Swiss Serenity Plus — Retour en haut de page"
          onClick={handleLogoClick}
        >
          <Image
            src="https://pub-b61ce5a39cc042cabc94943b3c8f74b4.r2.dev/photos-site/Logo%E2%8E%9CDayer%20%3A%20Swiss%20Serenity%20Plus.png"
            alt="Swiss Serenity Plus"
            width={160}
            height={48}
            style={{ objectFit: "contain", height: "40px", width: "auto" }}
            priority
          />
        </Link>

        <nav className={`${styles.nav} ${menuOpen ? styles.navOpen : ""}`} aria-label="Navigation principale">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={styles.navLink}
              onClick={() => setMenuOpen(false)}
            >
              {item.label}
            </Link>
          ))}
          <div className={styles.navCta}>
            <Button href="/contact" variant="dark" size="sm">
              Prendre contact
            </Button>
          </div>
        </nav>

        <button
          className={styles.burger}
          onClick={() => setMenuOpen(!menuOpen)}
          aria-label={menuOpen ? "Fermer le menu" : "Ouvrir le menu"}
          aria-expanded={menuOpen}
        >
          <span className={`${styles.burgerLine} ${menuOpen ? styles.burgerLineOpen : ""}`} />
          <span className={`${styles.burgerLine} ${menuOpen ? styles.burgerLineOpen : ""}`} />
          <span className={`${styles.burgerLine} ${menuOpen ? styles.burgerLineOpen : ""}`} />
        </button>
      </div>
    </header>
  );
}
