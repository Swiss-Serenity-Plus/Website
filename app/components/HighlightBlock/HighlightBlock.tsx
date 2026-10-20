// HighlightBlock — bloc de mise en avant autonome (titre + texte), inséré dans une page service pour donner sa propre place à un accompagnement spécifique.
import { LucideIcon } from "lucide-react";
import Container from "../Container/Container";
import styles from "./HighlightBlock.module.css";

interface HighlightSection {
  heading: string;
  text: string;
  Icon?: LucideIcon;
}

interface HighlightBlockProps {
  id?: string;
  eyebrow?: string;
  title: string;
  paragraphs?: string[];
  sections?: HighlightSection[];
}

// Les passages entourés de ** passent en doré. Les espaces devant : ; ? ! deviennent
// insécables pour que la ponctuation ne se retrouve jamais seule en début de ligne.
function richText(text: string) {
  return text.replace(/ ([:;?!])/g, "\u00a0$1").split(/\*\*(.+?)\*\*/).map((part, i) =>
    i % 2 ? <strong key={i} className={styles.strong}>{part}</strong> : part
  );
}

export default function HighlightBlock({ id, eyebrow, title, paragraphs, sections }: HighlightBlockProps) {
  // Comme sur les cartes mises en avant : la partie après « : » passe en doré, sur sa propre ligne.
  const [titleMain, ...titleRest] = title.split(" : ");
  const titleSuffix = titleRest.join(" : ");
  return (
    <section id={id} className={styles.section} data-fb-container={`Bloc « ${title} »`}>
      <Container>
        <div className={styles.panel}>
          {eyebrow && <p className="eyebrow">{eyebrow}</p>}
          <h2 className={styles.title}>
            {titleMain}
            {titleSuffix && (
              <>
                {" : "}
                <span className={`${styles.titleSuffix} ${styles.titleSuffixText}`}>{titleSuffix}</span>
              </>
            )}
          </h2>
          {paragraphs?.map((p, i) => (
            <p key={i} className={styles.text}>{richText(p)}</p>
          ))}
          {sections?.map((s, i) => (
            <div key={i} className={styles.subSection}>
              <h3 className={styles.subHeading}>
                {s.Icon && <s.Icon size={20} strokeWidth={1.5} className={styles.subIcon} aria-hidden="true" />}
                {s.heading}
              </h3>
              {s.text.split("\n\n").map((p, j) => (
                <p key={j} className={styles.text}>{richText(p)}</p>
              ))}
            </div>
          ))}
        </div>
      </Container>
    </section>
  );
}
