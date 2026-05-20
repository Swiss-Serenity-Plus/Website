// Container — wrapper centré avec padding responsive. Variant "narrow" pour contenu textuel.
import styles from "./Container.module.css";

interface ContainerProps {
  children: React.ReactNode;
  narrow?: boolean;
  className?: string;
}

export default function Container({ children, narrow = false, className = "" }: ContainerProps) {
  return (
    <div className={`${styles.container} ${narrow ? styles.narrow : ""} ${className}`}>
      {children}
    </div>
  );
}
