// LotusIcon — icône lotus personnalisée au style Lucide (stroke, 24×24, joints arrondis).
// Reproduit les pétales d'un lotus (1 central, 2 internes, 2 externes), sans cercle
// ni ligne d'eau. Trait affiné (strokeWidth fixe par tracé) pour un rendu épuré et
// un poids visuel cohérent avec les autres icônes de la section.
import { createLucideIcon } from "lucide-react";

const STROKE = 1.2;

const LotusIcon = createLucideIcon("Lotus", [
  // Pétale central (droit, pointu)
  ["path", { d: "M12 17 C 10.2 13 10.2 8 12 4.5 C 13.8 8 13.8 13 12 17 Z", strokeWidth: STROKE, key: "center" }],
  // Pétale interne gauche
  ["path", { d: "M12 17 C 9.3 13.8 7 10.5 8 7.5 C 10 9 11.2 13 12 17 Z", strokeWidth: STROKE, key: "inner-left" }],
  // Pétale interne droit
  ["path", { d: "M12 17 C 14.7 13.8 17 10.5 16 7.5 C 14 9 12.8 13 12 17 Z", strokeWidth: STROKE, key: "inner-right" }],
  // Pétale externe gauche
  ["path", { d: "M12 17 C 8.5 16.3 5 14 4.5 11.5 C 6.7 12.8 10 15 12 17 Z", strokeWidth: STROKE, key: "outer-left" }],
  // Pétale externe droit
  ["path", { d: "M12 17 C 15.5 16.3 19 14 19.5 11.5 C 17.3 12.8 14 15 12 17 Z", strokeWidth: STROKE, key: "outer-right" }],
]);

export default LotusIcon;
