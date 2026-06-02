import { LayoutGrid, TrendingUp, Users, FileText } from "lucide-react";

export const ALL_SERVICES = [
  {
    title: "Coordination & Optimisation",
    shortDescription: "Simplifier et fluidifier votre organisation pour vous concentrer sur votre activité principale.",
    href: "/entreprises/structuration-organisation",
    Icon: LayoutGrid,
    audience: "pro" as const,
  },
  {
    title: "Développement commercial",
    shortDescription: "Animation et optimisation de votre activité au quotidien avec continuité et précision.",
    href: "/entreprises/suivi-optimisation",
    Icon: TrendingUp,
    audience: "pro" as const,
  },
  {
    title: "Sourcing & Partenaires",
    shortDescription: "Identifier et coordonner les bons partenaires pour gagner en efficacité et en qualité.",
    href: "/entreprises/sourcing-partenaires",
    Icon: Users,
    audience: "pro" as const,
  },
  {
    title: "Expérience client",
    shortDescription: "Renforcer la satisfaction et la fidélisation de vos clients avec rigueur et sens du détail.",
    href: "/entreprises/experience-client",
    iconImage: "/icons/experience-client-main.svg",
    audience: "pro" as const,
  },
  {
    title: "Accompagnement aux Particuliers",
    shortDescription: "Un soutien discret et bienveillant dans vos démarches administratives et étapes clés.",
    href: "/particuliers/accompagnement-administratif",
    Icon: FileText,
    audience: "perso" as const,
  },
];

export const PRO_SERVICES = ALL_SERVICES.filter((s) => s.audience === "pro");
export const PERSO_SERVICES = ALL_SERVICES.filter((s) => s.audience === "perso");
