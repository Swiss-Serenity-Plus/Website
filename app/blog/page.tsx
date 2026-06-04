import { Metadata } from "next";
import Link from "next/link";
import Header from "../components/Header/Header";
import Footer from "../components/Footer/Footer";
import PageHero from "../components/PageHero/PageHero";
import ContactCTA from "../components/ContactCTA/ContactCTA";
import Container from "../components/Container/Container";
import styles from "./page.module.css";

export const metadata: Metadata = {
  title: "Blog — Conseils & Insights — Swiss Serenity Plus",
  description:
    "Conseils pratiques pour dirigeants de PME et particuliers en Suisse romande : structuration, organisation, bras droit externalisé, gestion administrative et performance.",
  keywords: [
    "bras droit externalisé",
    "conseils dirigeants PME Suisse",
    "organisation entreprise Valais",
    "accompagnement administratif Suisse romande",
    "partenaire stratégique externalisé",
  ].join(", "),
  openGraph: {
    title: "Blog — Swiss Serenity Plus",
    description:
      "Insights et conseils pour entrepreneurs exigeants en Suisse romande.",
    type: "website",
  },
};

const articles = [
  {
    slug: "bras-droit-externalise-pourquoi-ca-change-tout",
    category: "Entreprises",
    date: "2026-05-20",
    title: "Pourquoi externaliser son bras droit change tout pour un dirigeant de PME",
    excerpt:
      "Libérer du temps stratégique sans recruter : comment un bras droit externalisé permet aux dirigeants de se concentrer sur leur croissance sans les contraintes d'un poste interne.",
    readTime: "5 min",
  },
  {
    slug: "structurer-son-activite-etape-par-etape",
    category: "Entreprises",
    date: "2026-05-20",
    title: "Structurer son activité étape par étape : la méthode pour gagner en sérénité",
    excerpt:
      "L'audit, la cartographie des processus et la mise en place d'outils adaptés : les étapes clés pour transformer une organisation floue en un fonctionnement fluide et fiable.",
    readTime: "6 min",
  },
  {
    slug: "seniors-demarches-administratives-suisse",
    category: "Particuliers",
    date: "2026-05-20",
    title: "Démarches administratives pour seniors en Suisse : comment s'y retrouver sans stress",
    excerpt:
      "AVS, caisse maladie, assurances : un guide clair pour accompagner les seniors et leurs proches à travers les étapes administratives importantes de la vie.",
    readTime: "4 min",
  },
  {
    slug: "sourcing-partenaires-commerciaux-pme",
    category: "Entreprises",
    date: "2026-05-20",
    title: "Comment sélectionner et gérer ses partenaires commerciaux avec rigueur",
    excerpt:
      "La sélection rigoureuse des fournisseurs et partenaires est un levier sous-estimé de performance. Méthodes et critères pour sécuriser vos collaborations en Suisse romande.",
    readTime: "5 min",
  },
];

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("fr-CH", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

export default function BlogPage() {
  return (
    <>
      <Header />
      <main>
        <PageHero
          eyebrow="Blog"
          title="Conseils & Insights"
          subtitle="Ressources pratiques pour dirigeants de PME exigeants et particuliers en Suisse romande — organisation, performance, accompagnement administratif."
          breadcrumbs={[
            { label: "Accueil", href: "/" },
            { label: "Blog" },
          ]}
        />

        <section className={styles.section} data-fb-container="Section Blog (liste d'articles)">
          <Container>
            <div className={styles.grid}>
              {articles.map((article) => (
                <article key={article.slug} className={styles.card} id={`b-article-${article.slug}`} data-fb-container={`Carte article « ${article.title} »`}>
                  <div className={styles.cardTop}>
                    <span className={`${styles.tag} ${article.category === "Particuliers" ? styles.tagPerso : styles.tagPro}`} data-fb-label={`Étiquette « ${article.category} »`}>
                      {article.category}
                    </span>
                    <span className={styles.readTime} data-fb-label="Temps de lecture">{article.readTime} de lecture</span>
                  </div>
                  <h2 className={styles.cardTitle}>{article.title}</h2>
                  <p className={styles.cardExcerpt}>{article.excerpt}</p>
                  <div className={styles.cardBottom}>
                    <time className={styles.date} dateTime={article.date} data-fb-label="Date de publication">
                      {formatDate(article.date)}
                    </time>
                    <Link href={`/blog/${article.slug}`} className={styles.readMore} aria-label={`Lire : ${article.title}`}>
                      Lire l&apos;article
                    </Link>
                  </div>
                </article>
              ))}
            </div>
          </Container>
        </section>

        <ContactCTA />
      </main>
      <Footer />
    </>
  );
}
