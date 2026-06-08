"use client";
// Button — variants: primary (bordeaux), secondary (outline bleu nuit), ghost (texte + flèche). Forme pill.
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import styles from "./Button.module.css";

interface ButtonProps {
  children: React.ReactNode;
  variant?: "primary" | "secondary" | "ghost" | "dark";
  size?: "sm" | "md" | "lg";
  href?: string;
  onClick?: () => void;
  type?: "button" | "submit" | "reset";
  className?: string;
  icon?: React.ReactNode;
  id?: string;
  /** Libellé précis pour l'outil de retours (attribut data-fb-label). */
  fbLabel?: string;
}

export default function Button({
  children,
  variant = "primary",
  size = "md",
  href,
  onClick,
  type = "button",
  className = "",
  icon,
  id,
  fbLabel,
}: ButtonProps) {
  const classes = `${styles.btn} ${styles[variant]} ${styles[size]} ${className}`;

  if (href) {
    // Liens d'ancre vers la page courante (ex. « /#services ») : Next.js fait
    // une navigation soft qui ne déclenche pas toujours le scroll natif vers
    // l'ancre (bug intermittent). On gère donc le scroll nous-mêmes de façon
    // fiable quand la cible existe sur la page courante.
    const handleClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
      onClick?.();
      const hashIndex = href.indexOf("#");
      if (hashIndex < 0) return;
      const targetPath = href.slice(0, hashIndex) || "/";
      const targetId = href.slice(hashIndex + 1);
      if (!targetId || window.location.pathname !== targetPath) return;
      const el = document.getElementById(targetId);
      if (!el) return;
      e.preventDefault();
      el.scrollIntoView({ behavior: "smooth", block: "start" });
      window.history.replaceState(null, "", href);
    };
    return (
      <Link href={href} className={classes} id={id} data-fb-label={fbLabel} onClick={handleClick}>
        <span>{children}</span>
        {variant === "ghost" && <ArrowUpRight size={16} className={styles.arrow} aria-hidden="true" strokeWidth={2} />}
        {icon && <span className={styles.iconRight}>{icon}</span>}
      </Link>
    );
  }

  return (
    <button type={type} onClick={onClick} className={classes} id={id} data-fb-label={fbLabel}>
      <span>{children}</span>
      {variant === "ghost" && <ArrowUpRight size={16} className={styles.arrow} aria-hidden="true" strokeWidth={2} />}
      {icon && <span className={styles.iconRight}>{icon}</span>}
    </button>
  );
}
