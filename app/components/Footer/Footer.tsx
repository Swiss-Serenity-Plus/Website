// Footer — 3 colonnes fond bleu nuit: Contact / Services / Utilitaires.
import Link from "next/link";
import Image from "next/image";
import styles from "./Footer.module.css";

function LinkedInIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M19 3a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h14ZM8.34 18.34V9.96H5.55v8.38h2.79Zm-1.4-9.54a1.62 1.62 0 1 0 0-3.23 1.62 1.62 0 0 0 0 3.23Zm11.4 9.54v-4.59c0-2.45-1.31-3.6-3.06-3.6-1.41 0-2.04.78-2.39 1.32V9.96h-2.79c.04.79 0 8.38 0 8.38h2.79v-4.68c0-.25.02-.5.09-.68.2-.5.65-1.02 1.42-1.02 1 0 1.4.76 1.4 1.88v4.5h2.54Z" />
    </svg>
  );
}

function FacebookIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M22 12a10 10 0 1 0-11.56 9.88v-6.99H7.9V12h2.54V9.8c0-2.51 1.49-3.9 3.78-3.9 1.1 0 2.24.2 2.24.2v2.46h-1.26c-1.24 0-1.63.77-1.63 1.56V12h2.78l-.45 2.89h-2.33v6.99A10 10 0 0 0 22 12Z" />
    </svg>
  );
}

const socials = [
  { label: "LinkedIn — Swiss Serenity Plus", href: "https://www.linkedin.com/company/swiss-serenity-plus/?viewAsMember=true", Icon: LinkedInIcon },
  { label: "Facebook — Swiss Serenity Plus", href: "https://www.facebook.com/profile.php?id=61562944346390", Icon: FacebookIcon },
];

const services = [
  { label: "Structuration & Organisation", href: "/entreprises/structuration-organisation" },
  { label: "Suivi & Optimisation", href: "/entreprises/suivi-optimisation" },
  { label: "Sourcing & Partenaires", href: "/entreprises/sourcing-partenaires" },
  { label: "Expérience client", href: "/entreprises/experience-client" },
  { label: "Accompagnement des particuliers", href: "/particuliers/accompagnement-administratif" },
];

const utils = [
  { label: "Blog", href: "/blog" },
  { label: "À propos", href: "/a-propos" },
  { label: "Contact", href: "/contact" },
  { label: "Mentions légales", href: "/mentions-legales" },
];

export default function Footer() {
  return (
    <footer className={styles.footer} role="contentinfo">
      <div className={styles.inner}>
        <div className={styles.grid}>
          <div className={styles.col}>
            <Image
              src="https://pub-b61ce5a39cc042cabc94943b3c8f74b4.r2.dev/Logo%20-%20Swiss%20Serenity%20Plus%20-%20Mireille%20Dayer.png"
              alt="Swiss Serenity Plus"
              width={420}
              height={155}
              className={styles.logo}
              priority
            />
            <address className={styles.address}>
              <p>Chemin de Clavoz 18</p>
              <p>1950 Sion, Valais, Suisse</p>
              <p style={{ marginTop: "12px" }}>
                <a href="tel:+41762198513" className={styles.footerLink}>+41 76 219 85 13</a>
              </p>
              <p>
                <a href="mailto:mireille.dayer@swiss-serenity-plus.ch" className={styles.footerLink}>
                  mireille.dayer@swiss-serenity-plus.ch
                </a>
              </p>
            </address>
            <ul className={styles.socials} aria-label="Réseaux sociaux">
              {socials.map((s) => (
                <li key={s.href}>
                  <a
                    href={s.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={s.label}
                    className={styles.socialLink}
                  >
                    <s.Icon />
                  </a>
                </li>
              ))}
            </ul>
          </div>

          <div className={styles.col}>
            <h3 className={styles.colTitle}>Services</h3>
            <ul className={styles.linkList}>
              {services.map((s) => (
                <li key={s.href}>
                  <Link href={s.href} className={styles.footerLink}>{s.label}</Link>
                </li>
              ))}
            </ul>
          </div>

          <div className={styles.col}>
            <h3 className={styles.colTitle}>Informations</h3>
            <ul className={styles.linkList}>
              {utils.map((u) => (
                <li key={u.href}>
                  <Link href={u.href} className={styles.footerLink}>{u.label}</Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className={styles.bottom}>
          <p className={styles.legal}>
            &copy; {new Date().getFullYear()} Swiss Serenity Plus — Raison individuelle — Sion, Valais
          </p>
        </div>
      </div>
    </footer>
  );
}
