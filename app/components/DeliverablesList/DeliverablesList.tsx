// DeliverablesList — liste de livrables avec checkmark. Utilisé sur les pages services.
import Container from "../Container/Container";
import { CheckCircle2 } from "lucide-react";
import styles from "./DeliverablesList.module.css";

interface DeliverablesListProps {
  eyebrow?: string;
  title: string;
  items: string[];
}

export default function DeliverablesList({ eyebrow = "Ce que vous obtenez", title, items }: DeliverablesListProps) {
  return (
    <section className={styles.section}>
      <Container>
        <div className={styles.header}>
          <p className="eyebrow">{eyebrow}</p>
          <h2 className={styles.title}>{title}</h2>
        </div>
        <ul className={styles.list} role="list">
          {items.map((item, i) => (
            <li key={i} className={styles.item}>
              <div className={styles.iconWrap} aria-hidden="true">
                <CheckCircle2 size={22} color="var(--c-accent-secondary)" strokeWidth={1.5} />
              </div>
              <span>{item}</span>
            </li>
          ))}
        </ul>
      </Container>
    </section>
  );
}
