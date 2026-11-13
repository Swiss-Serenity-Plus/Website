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
    shortDescription: "***De nouvelles perspectives pour votre activité***\n\nAnalyse de l'existant, repérage des leviers de croissance, nouvelles offres, partenariats et marchés à conquérir, outils de suivi commercial : votre développement est structuré et piloté avec méthode.\n\nUn appui expérimenté aux côtés de la direction, sans recrutement ni charges salariales, pour transformer les opportunités en résultats.\n\n_***Un cap clair, une croissance solide***_",
    href: "/entreprises/suivi-optimisation",
    iconImage: "https://pub-b61ce5a39cc042cabc94943b3c8f74b4.r2.dev/icons/IconPerformance-removebg-preview.png",
    iconScale: 1.2,
    audience: "pro" as const,
  },
  {
    title: "Sourcing & Partenaires",
    shortDescription: "***Les bons partenaires, au bon moment***\n\nRecherche de fournisseurs et de nouveaux produits, comparaison des offres, sélection selon vos critères, mise en relation et suivi des collaborations.\n\nDes heures de recherche épargnées, et des partenaires fiables pour travailler en confiance.\n\n_***Des choix sûrs, une qualité constante***_",
    href: "/entreprises/sourcing-partenaires",
    iconImage: "https://pub-b61ce5a39cc042cabc94943b3c8f74b4.r2.dev/icons/Icon%20%3A%20Sourcing%20%26%20Partenaires%20%3A%20Swiss%20Serenity%20Plus.png",
    iconScale: 1.5,
    audience: "pro" as const,
  },
  {
    title: "Expérience client",
    shortDescription: "***Chaque client compte***\n\nAccueil, relation client, suivi des demandes et des réclamations, aménagement des espaces, signalétique : tous vos points de contact sont repensés pour refléter l'excellence de votre image de marque.\n\nVos interlocuteurs se sentent écoutés et reconnus, vos équipes se concentrent sur leur cœur de métier. Vos clients reviennent, votre réputation rayonne.\n\n_***Une image soignée, des clients fidèles***_",
    href: "/entreprises/experience-client",
    iconImage: "https://pub-b61ce5a39cc042cabc94943b3c8f74b4.r2.dev/icons/Icon%20%3A%20Exp%C3%A9rience%20Client%20%3A%20Swiss%20Serenity%20Plus.png",
    iconScale: 1.2,
    audience: "pro" as const,
  },
  {
    title: "Démarches & projets de vie",
    shortDescription: "***Tout est pris en charge, de A à Z***\n\nFormalités administratives, dossiers AVS, AI ou caisse maladie, préparation de la retraite, entrée en EMS, installation entre la Suisse et la France : un accompagnement sur le terrain, de la première démarche à la solution en place.\n\nPour un dossier précis ou une étape de vie, Swiss Serenity Plus® intervient à la demande : vous décidez, vous suivez l'avancement.\n\n_***Du quotidien aux étapes clés de la vie***_",
    href: "/particuliers/accompagnement-administratif#profils-particuliers",
    slug: "accompagnement-administratif",
    iconImage: "https://pub-b61ce5a39cc042cabc94943b3c8f74b4.r2.dev/icons/Icon%20%22Accomapgnemnt%20au%20particulier%22.png",
    iconScale: 1.6,
    audience: "perso" as const,
  },
  {
    title: "Le Fil Conducteur",
    shortDescription: "***Votre tiers de confiance sur le terrain***\n\nÀ titre privé, un interlocuteur attitré suit votre situation dans la durée : démarches, accompagnement d'un proche en perte d'autonomie ou en situation de handicap, changement de pays, chaque dossier est mené jusqu'au bout à votre place.\n\nChefs d'entreprise, profitez d'un bras droit externalisé et offrez à vos équipes une banque d'heures pour leurs démarches privées, en toute confidentialité : des absences évitées, des collaborateurs disponibles, un avantage social tangible pour votre politique RH et RSE.\n\n_***Du temps gagné, la sérénité en plus***_",
    href: "/particuliers/accompagnement-administratif#fil-conducteur",
    slug: "fil-conducteur-seniors-familles",
    tag: "Tiers de confiance",
    Icon: HeartHandshake,
    audience: "perso" as const,
  },
];

export const PRO_SERVICES = ALL_SERVICES.filter((s) => s.audience === "pro");
export const PERSO_SERVICES = ALL_SERVICES.filter((s) => s.audience === "perso");
