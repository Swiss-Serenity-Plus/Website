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
}: ButtonProps) {
  const classes = `${styles.btn} ${styles[variant]} ${styles[size]} ${className}`;

  if (href) {
    return (
      <Link href={href} className={classes}>
        <span>{children}</span>
        {variant === "ghost" && <ArrowUpRight size={16} className={styles.arrow} aria-hidden="true" strokeWidth={2} />}
        {icon && <span className={styles.iconRight}>{icon}</span>}
      </Link>
    );
  }

  return (
    <button type={type} onClick={onClick} className={classes}>
      <span>{children}</span>
      {variant === "ghost" && <ArrowUpRight size={16} className={styles.arrow} aria-hidden="true" strokeWidth={2} />}
      {icon && <span className={styles.iconRight}>{icon}</span>}
    </button>
  );
}
