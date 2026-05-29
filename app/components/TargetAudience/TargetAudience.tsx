// TargetAudience — section "à qui ce service s'adresse". Utilisé sur les pages services.
import Container from "../Container/Container";
import { CheckCircle2 } from "lucide-react";
import styles from "./TargetAudience.module.css";

type Profile = string | { title: string; text: string };

interface TargetAudienceProps {
  eyebrow?: string | null;
  title?: string;
  description: string;
  profiles: Profile[];
}

export default function TargetAudience({
  eyebrow,
  title = "À qui s'adresse ce service ?",
  description,
  profiles,
}: TargetAudienceProps) {
  const eyebrowText = eyebrow === undefined ? "Clientèle cible" : eyebrow;
  return (
    <section className={styles.section}>
      <Container>
        <div className={styles.inner}>
          <div className={styles.left}>
            {eyebrowText && <p className="eyebrow">{eyebrowText}</p>}
            <h2 className={styles.title}>{title}</h2>
            <p className={styles.desc}>{description}</p>
          </div>
          <ul className={styles.profiles} role="list">
            {profiles.map((p, i) => (
              <li key={i} className={styles.profile}>
                <CheckCircle2 size={18} color="var(--c-accent-secondary)" strokeWidth={1.5} aria-hidden="true" className={styles.profileIcon} />
                {typeof p === "string" ? (
                  <span className={styles.profileText}>{p}</span>
                ) : (
                  <div className={styles.profileStructured}>
                    <strong className={styles.profileTitle}>{p.title}</strong>
                    <span className={styles.profileDesc}>{p.text}</span>
                  </div>
                )}
              </li>
            ))}
          </ul>
        </div>
      </Container>
    </section>
  );
}
