import { Metadata } from "next";
import Link from "next/link";
import Header from "../components/Header/Header";
import Footer from "../components/Footer/Footer";
import PageHero from "../components/PageHero/PageHero";
import ContactCTA from "../components/ContactCTA/ContactCTA";
import Container from "../components/Container/Container";
import { getPublishedPosts } from "../lib/blog";
import styles from "./page.module.css";

export const revalidate = 3600;

export const metadata: Metadata = {
  title: "Blog — Actualités & Conseils — Swiss Serenity Plus",
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
    description: "Insights et conseils pour entrepreneurs exigeants en Suisse romande.",
    type: "website",
  },
};

function formatDate(iso: string) {
  if (!iso) return "";
  return new Date(iso).toLocaleDateString("fr-CH", { year: "numeric", month: "long", day: "numeric" });
}
function isPerso(category: string) {
  return /particulier/i.test(category);
}

export default async function BlogPage() {
  const articles = await getPublishedPosts();

  return (
    <>
      <Header />
      <main>
        <PageHero
          eyebrow="Blog"
          title="Actualités & Conseils"
          subtitle="Retrouvez les actualités de Swiss Serenity Plus® ainsi que des conseils pratiques en assistance administrative, coordination, organisation et accompagnement personnalisé. Découvrez également des informations utiles sur les démarches administratives, l'AVS, l'AI, les assurances maladie, les EMS, Homes et les solutions facilitant le quotidien en Suisse romande."
          breadcrumbs={[{ label: "Accueil", href: "/" }, { label: "Blog" }]}
        />

        <section className={styles.section} data-fb-container="Section Blog (liste d'articles)">
          <Container>
            {articles.length === 0 ? (
              <p className={styles.empty}>Les premiers articles arrivent bientôt.</p>
            ) : (
              <div className={styles.grid}>
                {articles.map((article) => (
                  <article
                    key={article.id}
                    className={styles.card}
                    id={`b-article-${article.slug}`}
                    data-fb-container={`Carte article « ${article.title} »`}
                  >
                    {article.coverUrl && (
                      <Link href={`/blog/${article.slug}`} className={styles.cardCover} aria-hidden tabIndex={-1}>
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src={article.coverUrl} alt="" className={styles.cardCoverImg} loading="lazy" />
                      </Link>
                    )}
                    <div className={styles.cardTop}>
                      {article.category && (
                        <span className={`${styles.tag} ${isPerso(article.category) ? styles.tagPerso : styles.tagPro}`} data-fb-label={`Étiquette « ${article.category} »`}>
                          {article.category}
                        </span>
                      )}
                      {article.readingMinutes != null && (
                        <span className={styles.readTime} data-fb-label="Temps de lecture">{article.readingMinutes} min de lecture</span>
                      )}
                    </div>
                    <h2 className={styles.cardTitle}>{article.title}</h2>
                    {article.excerpt && <p className={styles.cardExcerpt}>{article.excerpt}</p>}
                    <div className={styles.cardBottom}>
                      <time className={styles.date} dateTime={article.publishDate} data-fb-label="Date de publication">
                        {formatDate(article.publishDate)}
                      </time>
                      <Link href={`/blog/${article.slug}`} className={styles.readMore} aria-label={`Lire : ${article.title}`}>
                        Lire l&apos;article
                      </Link>
                    </div>
                  </article>
                ))}
              </div>
            )}
          </Container>
        </section>

        <ContactCTA />
      </main>
      <Footer />
    </>
  );
}
