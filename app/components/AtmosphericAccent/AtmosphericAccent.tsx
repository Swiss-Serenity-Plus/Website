// AtmosphericAccent — silhouettes de montagnes floues, échos visuels du Hero,
// utilisées en filigrane sur certaines sections pour donner du rythme au scroll.
import styles from "./AtmosphericAccent.module.css";

interface AtmosphericAccentProps {
  side?: "left" | "right";
  tone?: "warm" | "cool";
  intensity?: "subtle" | "medium";
}

export default function AtmosphericAccent({
  side = "left",
  tone = "warm",
  intensity = "subtle",
}: AtmosphericAccentProps) {
  const classes = [
    styles.accent,
    side === "right" ? styles.right : styles.left,
    intensity === "medium" ? styles.medium : styles.subtle,
  ].join(" ");

  const startColor = tone === "cool" ? "#d8dee2" : "#e6e1dc";
  const endColor = tone === "cool" ? "#8fa3a8" : "#cfc9c2";
  const gradId = `accent-${side}-${tone}-${intensity}`;

  return (
    <svg
      className={classes}
      viewBox="0 0 600 400"
      preserveAspectRatio={side === "right" ? "xMaxYMid slice" : "xMinYMid slice"}
      aria-hidden="true"
    >
      <defs>
        <linearGradient id={gradId} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor={startColor} />
          <stop offset="100%" stopColor={endColor} />
        </linearGradient>
        <filter id={`${gradId}-blur-strong`}>
          <feGaussianBlur stdDeviation="14" />
        </filter>
        <filter id={`${gradId}-blur-soft`}>
          <feGaussianBlur stdDeviation="6" />
        </filter>
      </defs>

      <g filter={`url(#${gradId}-blur-strong)`} opacity="0.55">
        <path
          d="M0 230 C90 130, 200 130, 280 230 C200 200, 100 220, 0 250 Z"
          fill={`url(#${gradId})`}
        />
      </g>
      <g filter={`url(#${gradId}-blur-soft)`} opacity="0.65">
        <path
          d="M0 270 C120 180, 250 180, 360 270 C250 240, 130 260, 0 290 Z"
          fill={`url(#${gradId})`}
        />
      </g>
    </svg>
  );
}
