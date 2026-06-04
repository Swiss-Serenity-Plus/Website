// DeliverablesList — liste de livrables avec checkmark. Utilisé sur les pages services.
import Container from "../Container/Container";
import { CheckCircle2 } from "lucide-react";
import Divider from "../Divider/Divider";
import styles from "./DeliverablesList.module.css";

interface DeliverablesListProps {
  eyebrow?: string;
  title: string;
  items: string[];
  divider?: boolean;
}

export default function DeliverablesList({ eyebrow = "Ce que vous obtenez", title, items, divider = false }: DeliverablesListProps) {
  return (
    <section className={styles.section} data-fb-container="Section Livrables">
      <Container>
        <div className={styles.header}>
          <p className="eyebrow">{eyebrow}</p>
          {divider && <Divider />}
          <h2 className={styles.title}>{title}</h2>
        </div>
        <ul className={styles.list} role="list">
          {items.map((item, i) => (
            <li key={i} className={styles.item} id={`b-livrable-${i + 1}`} data-fb-label={`Livrable « ${item.length > 45 ? item.slice(0, 45) + "…" : item} »`}>
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
