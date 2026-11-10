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
    shortDescription: "***Chaque client compte***\n\nAccueil, aménagement de vos espaces, signalétique, suivi des demandes, gestion des réclamations : chaque point de contact est repensé pour refléter l'excellence de votre image de marque.\n\nVos clients se sentent écoutés et reconnus, vos équipes se concentrent sur leur cœur de métier.\n\n_***Des clients qui reviennent, une réputation qui rayonne***_",
    href: "/entreprises/experience-client",
    iconImage: "https://pub-b61ce5a39cc042cabc94943b3c8f74b4.r2.dev/icons/Icon%20%3A%20Exp%C3%A9rience%20Client%20%3A%20Swiss%20Serenity%20Plus.png",
    iconScale: 1.2,
    audience: "pro" as const,
  },
  {
    title: "Accompagnement aux Particuliers",
    shortDescription: "***Chaque étape de vie, en toute sérénité***\n\nEntrée en EMS, perte d'autonomie d'un proche, installation entre la Suisse et la France, dossiers AVS, AI ou caisse maladie : un accompagnement sur le terrain, de la première démarche à la solution en place.\n\nVous décidez, nous nous chargeons du reste.\n\n_***Votre sérénité, notre engagement***_",
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
