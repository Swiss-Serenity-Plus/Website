// Header — sticky, transparent sur hero puis fond beige au scroll. 3 items nav + CTA.
"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import Button from "../Button/Button";
import PageTreeNav from "../PageTreeNav/PageTreeNav";
import { fbSlug } from "../../lib/fbToken";
import styles from "./Header.module.css";

const navItems = [
  { label: "Accueil", href: "/" },
  { label: "Prestations", href: "/#services" },
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

  function handleHomeClick(e: React.MouseEvent<HTMLAnchorElement>) {
    // Logo + lien « Accueil » : si déjà sur la home, on remonte en haut
    // avec un défilement fluide (premium), sinon navigation normale vers /.
    if (pathname === "/") {
      e.preventDefault();
      const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      window.scrollTo({ top: 0, behavior: prefersReducedMotion ? "auto" : "smooth" });
      // Nettoie le hash (#services) laisse par « Prestations » : sans cela, la barre
      // d'adresse reste sur /#services et recliquer sur « Prestations » ne fait rien
      // (lien identique a l'URL courante).
      if (window.location.hash) {
        window.history.replaceState(null, "", window.location.pathname + window.location.search);
      }
    }
    setMenuOpen(false);
  }

  return (
    <header className={`${styles.header} ${scrolled ? styles.scrolled : ""} ${menuOpen ? styles.menuOpen : ""}`} role="banner" data-fb-container="En-tête">
      <div className={styles.inner}>
        <Link
          href="/"
          className={styles.logo}
          aria-label="Swiss Serenity Plus — Retour en haut de page"
          onClick={handleHomeClick}
          id="b-header-logo"
          data-fb-label="Image avec le logo"
        >
          <span className={styles.logoCrop}>
            <Image
              src="https://pub-b61ce5a39cc042cabc94943b3c8f74b4.r2.dev/Logo%20Swiss%20Serenity%20Plus.png"
              alt="Swiss Serenity Plus"
              width={440}
              height={120}
              className={styles.logoImg}
              priority
            />
          </span>
        </Link>

        <nav className={`${styles.nav} ${menuOpen ? styles.navOpen : ""}`} aria-label="Navigation principale">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={styles.navLink}
              onClick={item.href === "/" ? handleHomeClick : () => setMenuOpen(false)}
              id={`b-nav-${fbSlug(item.label)}`}
              data-fb-label={`Lien de navigation « ${item.label} »`}
            >
              {item.label}
            </Link>
          ))}
          <PageTreeNav />
          <div className={styles.navCta}>
            <Button href="/contact" variant="dark" size="sm" id="b-nav-cta-contact" fbLabel="Bouton « Prendre contact »">
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
