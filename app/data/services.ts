import { HeartHandshake } from "lucide-react";

export const ALL_SERVICES = [
  {
    title: "Coordination & Optimisation",
    shortDescription: "***Une organisation qui tourne, même en votre absence***\n\nCirculation de l'information, procédures, outils de suivi, lien entre les différents intervenants : la coordination administrative et opérationnelle de votre structure est clarifiée et tenue à jour.\n\nLes relances inutiles et les doublons disparaissent, chacun sait qui fait quoi.\n\n_***Une structure fluide, l'esprit libre***_",
    href: "/entreprises/structuration-organisation",
    iconImage: "https://pub-b61ce5a39cc042cabc94943b3c8f74b4.r2.dev/icons/Icon%20%3A%20Coordination%20%26%20Optimisation%20%3A%20Swiss%20Serenity%20Plus.png",
    iconScale: 1.5,
    audience: "pro" as const,
  },
  {
    title: "Développement commercial",
    shortDescription: "***De nouvelles perspectives pour votre activité***\n\nAnalyse de l'existant, repérage des leviers de croissance, nouvelles offres, partenariats et marchés à conquérir, outils de suivi commercial : votre développement est structuré et piloté avec méthode.\n\nUn appui expérimenté, aux côtés de la direction, pour transformer les opportunités en résultats.\n\n_***Une stratégie claire, une croissance maîtrisée***_",
    href: "/entreprises/suivi-optimisation",
    iconImage: "https://pub-b61ce5a39cc042cabc94943b3c8f74b4.r2.dev/icons/IconPerformance-removebg-preview.png",
    iconScale: 1.2,
    audience: "pro" as const,
  },
  {
    title: "Sourcing & Partenaires",
    shortDescription: "***Les bons partenaires, au bon moment***\n\nRecherche de fournisseurs et de nouveaux produits, comparaison des offres, sélection selon vos critères, mise en relation et suivi des collaborations.\n\nDes heures de recherche épargnées, et des partenaires fiables pour travailler en confiance.\n\n_***Des collaborations solides, une qualité maîtrisée***_",
    href: "/entreprises/sourcing-partenaires",
    iconImage: "https://pub-b61ce5a39cc042cabc94943b3c8f74b4.r2.dev/icons/Icon%20%3A%20Sourcing%20%26%20Partenaires%20%3A%20Swiss%20Serenity%20Plus.png",
    iconScale: 1.5,
    audience: "pro" as const,
  },
  {
    title: "Expérience client",
    shortDescription: "***Chaque client compte***\n\nAccueil, relation client, suivi des demandes et des réclamations, aménagement des espaces, signalétique : tous vos points de contact sont repensés pour refléter l'excellence de votre image de marque.\n\nVos interlocuteurs se sentent écoutés et reconnus, vos équipes se concentrent sur leur cœur de métier. Vos clients reviennent, votre réputation rayonne.\n\n_***Une image soignée, la fidélité en plus***_",
    href: "/entreprises/experience-client",
    iconImage: "https://pub-b61ce5a39cc042cabc94943b3c8f74b4.r2.dev/icons/Icon%20%3A%20Exp%C3%A9rience%20Client%20%3A%20Swiss%20Serenity%20Plus.png",
    iconScale: 1.2,
    audience: "pro" as const,
  },
  {
    title: "Démarches & projets de vie",
    shortDescription: "***Tout est pris en charge, de A à Z***\n\nFormalités administratives, dossiers AVS, AI ou caisse maladie, entrée en EMS, perte d'autonomie d'un proche, installation entre la Suisse et la France : un accompagnement sur le terrain, de la première démarche à la solution en place.\n\nEn tiers de confiance, Swiss Serenity Plus agit à votre place : vous décidez, vous suivez l'avancement, tout est conduit jusqu'au bout.\n\n_***Du quotidien aux étapes clés de la vie***_",
    href: "/particuliers/accompagnement-administratif#profils-particuliers",
    slug: "accompagnement-administratif",
    iconImage: "https://pub-b61ce5a39cc042cabc94943b3c8f74b4.r2.dev/icons/Icon%20%22Accomapgnemnt%20au%20particulier%22.png",
    iconScale: 1.6,
    audience: "perso" as const,
  },
  {
    title: "Le Fil Conducteur",
    shortDescription: "***À titre privé***, vous manquez de temps pour vos démarches administratives, pour accompagner un proche âgé, malade ou en situation de handicap, ou pour préparer un changement de pays entre la Suisse et la France ?\n\nBien plus qu'une simple aide administrative, le **Fil Conducteur** est ***votre tiers de confiance sur le terrain***. Il mène chaque démarche jusqu'au bout à votre place, sans que vous ayez à vous déplacer, et vous gardez la main sur chaque décision.\n\n***Chefs d'entreprise***, profitez d'un bras droit externalisé, sans salaire fixe ni charges sociales, et ***offrez à vos équipes une banque d'heures*** pour leurs démarches privées, y compris lorsqu'elles accompagnent un proche, en toute confidentialité : un levier concret pour votre politique RH et RSE.\n\n_***Du temps gagné, la sérénité en plus***_",
    href: "/particuliers/accompagnement-administratif#fil-conducteur",
    slug: "fil-conducteur-seniors-familles",
    tag: "Tiers de confiance",
    Icon: HeartHandshake,
    audience: "perso" as const,
  },
];

export const PRO_SERVICES = ALL_SERVICES.filter((s) => s.audience === "pro");
export const PERSO_SERVICES = ALL_SERVICES.filter((s) => s.audience === "perso");
