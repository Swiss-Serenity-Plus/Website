export const ALL_SERVICES = [
  {
    title: "Coordination & Optimisation",
    shortDescription: "Fluidifier les échanges, structurer les processus et améliorer la coordination administrative et opérationnelle entre les différents intervenants.",
    href: "/entreprises/structuration-organisation",
    iconImage: "https://pub-b61ce5a39cc042cabc94943b3c8f74b4.r2.dev/icons/Icon%20%3A%20Coordination%20%26%20Optimisation%20%3A%20Swiss%20Serenity%20Plus.png",
    iconScale: 1.5,
    audience: "pro" as const,
  },
  {
    title: "Développement commercial",
    shortDescription: "Soutenir vos actions commerciales et renforcer la qualité de vos relations clients.",
    href: "/entreprises/suivi-optimisation",
    iconImage: "https://pub-b61ce5a39cc042cabc94943b3c8f74b4.r2.dev/icons/IconPerformance-removebg-preview.png",
    iconScale: 1.2,
    audience: "pro" as const,
  },
  {
    title: "Sourcing & Partenaires",
    shortDescription: "Identifier et coordonner les bons partenaires pour gagner en efficacité et en qualité.",
    href: "/entreprises/sourcing-partenaires",
    iconImage: "https://pub-b61ce5a39cc042cabc94943b3c8f74b4.r2.dev/icons/Icon%20%3A%20Sourcing%20%26%20Partenaires%20%3A%20Swiss%20Serenity%20Plus.png",
    iconScale: 1.5,
    audience: "pro" as const,
  },
  {
    title: "Expérience client",
    shortDescription: "Renforcer la satisfaction et la fidélisation de vos clients avec rigueur et sens du détail.",
    href: "/entreprises/experience-client",
    iconImage: "https://pub-b61ce5a39cc042cabc94943b3c8f74b4.r2.dev/icons/Icon%20%3A%20Exp%C3%A9rience%20Client%20%3A%20Swiss%20Serenity%20Plus.png",
    iconScale: 1.2,
    audience: "pro" as const,
  },
  {
    title: "Accompagnement aux Particuliers",
    shortDescription: "Vous aider à avancer sereinement dans vos démarches administratives et vos projets de vie.",
    href: "/particuliers/accompagnement-administratif",
    iconImage: "https://pub-b61ce5a39cc042cabc94943b3c8f74b4.r2.dev/icons/Icon%20%22Accomapgnemnt%20au%20particulier%22.png",
    iconScale: 1.6,
    audience: "perso" as const,
  },
];

export const PRO_SERVICES = ALL_SERVICES.filter((s) => s.audience === "pro");
export const PERSO_SERVICES = ALL_SERVICES.filter((s) => s.audience === "perso");
