import { HeartHandshake } from "lucide-react";

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
    shortDescription: "Renforcer vos actions commerciales, développer vos relations clients et soutenir la croissance de votre activité.",
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
    shortDescription: "***Chaque contact compte.*** Suivi des demandes, relances, gestion des réclamations, enquêtes de satisfaction : la relation avec vos clients est prise en charge avec rigueur et sens du détail. Vos clients se sentent écoutés, vos équipes se concentrent sur leur cœur de métier. ***Des clients fidèles, une réputation renforcée.***",
    href: "/entreprises/experience-client",
    iconImage: "https://pub-b61ce5a39cc042cabc94943b3c8f74b4.r2.dev/icons/Icon%20%3A%20Exp%C3%A9rience%20Client%20%3A%20Swiss%20Serenity%20Plus.png",
    iconScale: 1.2,
    audience: "pro" as const,
  },
  {
    title: "Accompagnement aux Particuliers",
    shortDescription: "***AVS, AI, caisse maladie, courriers officiels :*** vos papiers et vos dossiers sont pris en charge, classés et suivis, sans stress ni retard. Un proche entre en EMS ou perd en autonomie ? Vous préparez un projet de vie entre la Suisse et la France ? Un accompagnement clair, à chaque étape. ***L'esprit libre, vos démarches en ordre.***",
    href: "/particuliers/accompagnement-administratif#profils-particuliers",
    slug: "accompagnement-administratif",
    iconImage: "https://pub-b61ce5a39cc042cabc94943b3c8f74b4.r2.dev/icons/Icon%20%22Accomapgnemnt%20au%20particulier%22.png",
    iconScale: 1.6,
    audience: "perso" as const,
  },
  {
    title: "Le Fil Conducteur",
    shortDescription: "***À titre privé***, vous manquez de temps pour vos démarches administratives, pour accompagner un proche âgé, malade ou en situation de handicap, ou pour préparer un changement de pays entre la Suisse et la France ?\n\nBien plus qu'une simple aide administrative, le **Fil Conducteur** est ***votre tiers de confiance sur le terrain***. Il mène chaque démarche jusqu'au bout à votre place, sans que vous ayez à vous déplacer, et vous gardez la main sur chaque décision.\n\n***Chefs d'entreprise***, profitez d'un bras droit externalisé, sans salaire fixe ni charges sociales, et ***offrez à vos équipes une banque d'heures*** pour leurs démarches privées, en toute confidentialité : plus de présence, plus de bien-être au travail.\n\n_***Du temps gagné, la sérénité en plus***_",
    href: "/particuliers/accompagnement-administratif#fil-conducteur",
    slug: "fil-conducteur-seniors-familles",
    tag: "Tiers de confiance",
    Icon: HeartHandshake,
    audience: "perso" as const,
  },
];

export const PRO_SERVICES = ALL_SERVICES.filter((s) => s.audience === "pro");
export const PERSO_SERVICES = ALL_SERVICES.filter((s) => s.audience === "perso");
