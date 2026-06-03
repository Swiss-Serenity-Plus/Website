// Divider — filet doré décoratif avec losange central (aère entre eyebrow et titre).
import styles from "./Divider.module.css";

export default function Divider() {
  return (
    <div className={styles.divider} aria-hidden="true">
      <span className={styles.line} />
      <svg className={styles.diamond} viewBox="0 0 24 24" fill="currentColor">
        <path d="M12 1.5 13.4 10.6 22.5 12 13.4 13.4 12 22.5 10.6 13.4 1.5 12 10.6 10.6Z" />
      </svg>
      <span className={styles.line} />
    </div>
  );
}
