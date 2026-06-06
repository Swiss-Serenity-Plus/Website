import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Header from "../../components/Header/Header";
import Footer from "../../components/Footer/Footer";
import Container from "../../components/Container/Container";
import PageHero from "../../components/PageHero/PageHero";
import { getPublishedPosts, getPostBySlug, getPostBlocks } from "../../lib/blog";
import { SITE_URL } from "../../lib/seo";
import styles from "./article.module.css";

export const revalidate = 3600;

export async function generateStaticParams() {
  const posts = await getPublishedPosts();
  return posts.map((p) => ({ slug: p.slug }));
}

export async function generateMetadata(
  { params }: { params: Promise<{ slug: string }> }
): Promise<Metadata> {
  const { slug } = await params;
  const post = await getPostBySlug(slug);
  if (!post) {
    return { title: "Article introuvable — Swiss Serenity Plus", robots: { index: false } };
  }
  const description = post.metaDescription || post.excerpt;
  const url = `${SITE_URL}/blog/${post.slug}`;
  return {
    title: `${post.title} — Swiss Serenity Plus`,
    description,
    alternates: { canonical: url },
    openGraph: {
      title: post.title,
      description,
      url,
      type: "article",
      ...(post.coverUrl ? { images: [{ url: post.coverUrl }] } : {}),
    },
    twitter: {
      card: "summary_large_image",
      title: post.title,
      description,
      ...(post.coverUrl ? { images: [post.coverUrl] } : {}),
    },
  };
}

function formatDate(iso: string) {
  if (!iso) return "";
  return new Date(iso).toLocaleDateString("fr-CH", { year: "numeric", month: "long", day: "numeric" });
}

export default async function ArticlePage(
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params;
  const post = await getPostBySlug(slug);
  if (!post) notFound();

  const bodyHtml = await getPostBlocks(post.id);

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    headline: post.title,
    description: post.metaDescription || post.excerpt,
    ...(post.coverUrl ? { image: post.coverUrl } : {}),
    ...(post.publishDate ? { datePublished: post.publishDate } : {}),
    author: { "@type": "Person", name: post.author || "Mireille Dayer" },
    publisher: { "@type": "Organization", name: "Swiss Serenity Plus" },
    mainEntityOfPage: `${SITE_URL}/blog/${post.slug}`,
  };

  return (
    <>
      <Header />
      <main>
        <PageHero
          eyebrow={post.category || "Blog"}
          title={post.title}
          breadcrumbs={[{ label: "Accueil", href: "/" }, { label: "Blog", href: "/blog" }, { label: post.title }]}
        />

        <article className={styles.article}>
          <Container>
            <div className={styles.inner}>
              <p className={styles.meta}>
                {post.author && <span>{post.author}</span>}
                {post.publishDate && <span>{formatDate(post.publishDate)}</span>}
                {post.readingMinutes != null && <span>{post.readingMinutes} min de lecture</span>}
              </p>

              {post.coverUrl && (
                <div className={styles.cover}>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={post.coverUrl} alt={post.title} className={styles.coverImg} />
                </div>
              )}

              {post.excerpt && <p className={styles.lead}>{post.excerpt}</p>}

              <div className={styles.prose} dangerouslySetInnerHTML={{ __html: bodyHtml }} />

              {post.tags.length > 0 && (
                <div className={styles.tags}>
                  {post.tags.map((t) => <span key={t} className={styles.tag}>{t}</span>)}
                </div>
              )}
            </div>
          </Container>
        </article>
      </main>
      <Footer />

      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
    </>
  );
}
