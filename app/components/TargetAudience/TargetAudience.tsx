// TargetAudience — section "à qui ce service s'adresse". Utilisé sur les pages services.
import Image from "next/image";
import Container from "../Container/Container";
import { CheckCircle2 } from "lucide-react";
import styles from "./TargetAudience.module.css";

type Profile = string | { title: string; text: string };

interface TargetAudienceProps {
  eyebrow?: string | null;
  title?: string;
  description: string;
  profiles: Profile[];
  image?: string;
}

export default function TargetAudience({
  eyebrow,
  title = "À qui s'adresse ce service ?",
  description,
  profiles,
  image,
}: TargetAudienceProps) {
  const eyebrowText = eyebrow === undefined ? "Clientèle cible" : eyebrow;
  const profileList = (
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
  );

  if (image) {
    return (
      <section className={styles.section}>
        <Container>
          <div className={`${styles.inner} ${styles.innerPhoto}`}>
            <div className={styles.left}>
              {eyebrowText && <p className="eyebrow">{eyebrowText}</p>}
              <h2 className={styles.title}>{title}</h2>
              <p className={styles.desc}>{description}</p>
              <div className={styles.photo}>
                <Image
                  src={image}
                  alt=""
                  width={1200}
                  height={800}
                  className={styles.photoImg}
                  sizes="(max-width: 1024px) 100vw, 620px"
                />
              </div>
            </div>
            {profileList}
          </div>
        </Container>
      </section>
    );
  }

  return (
    <section className={styles.section}>
      <Container>
        <div className={styles.inner}>
          <div className={styles.left}>
            {eyebrowText && <p className="eyebrow">{eyebrowText}</p>}
            <h2 className={styles.title}>{title}</h2>
            <p className={styles.desc}>{description}</p>
          </div>
          {profileList}
        </div>
      </Container>
    </section>
  );
}
