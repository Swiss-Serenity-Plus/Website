// HighlightBlock — bloc de mise en avant autonome (titre + texte), inséré dans une page service pour donner sa propre place à un accompagnement spécifique.
import Container from "../Container/Container";
import styles from "./HighlightBlock.module.css";

interface HighlightSection {
  heading: string;
  text: string;
}

interface HighlightBlockProps {
  id?: string;
  eyebrow?: string;
  title: string;
  paragraphs?: string[];
  sections?: HighlightSection[];
}

export default function HighlightBlock({ id, eyebrow, title, paragraphs, sections }: HighlightBlockProps) {
  return (
    <section id={id} className={styles.section} data-fb-container={`Bloc « ${title} »`}>
      <Container>
        <div className={styles.panel}>
          {eyebrow && <p className="eyebrow">{eyebrow}</p>}
          <h2 className={styles.title}>{title}</h2>
          {paragraphs?.map((p, i) => (
            <p key={i} className={styles.text}>{p}</p>
          ))}
          {sections?.map((s, i) => (
            <div key={i} className={styles.subSection}>
              <h3 className={styles.subHeading}>{s.heading}</h3>
              <p className={styles.text}>{s.text}</p>
            </div>
          ))}
        </div>
      </Container>
    </section>
  );
}
