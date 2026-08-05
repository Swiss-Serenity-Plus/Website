import { Metadata } from "next";
import Header from "../components/Header/Header";
import Footer from "../components/Footer/Footer";
import PageHero from "../components/PageHero/PageHero";
import Container from "../components/Container/Container";
import styles from "./page.module.css";

export const metadata: Metadata = {
  title: "Mentions légales ⎜ Swiss Serenity Plus",
  description: "Mentions légales et informations juridiques du site Swiss Serenity Plus, raison individuelle basée à Sion en Valais.",
};

export default function MentionsLegalesPage() {
  return (
    <>
      <Header />
      <main>
        <PageHero
          eyebrow="Juridique"
          title="Mentions légales"
          breadcrumbs={[
            { label: "Accueil", href: "/" },
            { label: "Mentions légales" },
          ]}
        />
        <section className={styles.section} data-fb-container="Section Mentions légales">
          <Container narrow>
            <article className={styles.content}>
              <section className={styles.block}>
                <h2 className={styles.h2}>Éditeur du site</h2>
                <p>
                  Swiss Serenity Plus<br />
                  Raison individuelle<br />
                  Fondatrice : Mireille Dayer<br />
                  Chemin de Clavoz 18, 1950 Sion, Valais, Suisse<br />
                  Téléphone :{" "}
                  <a href="tel:+41762198513" className={styles.link}>+41 76 219 85 13</a><br />
                  Email :{" "}
                  <a href="mailto:mireille.dayer@swiss-serenity-plus.ch" className={styles.link}>
                    mireille.dayer@swiss-serenity-plus.ch
                  </a>
                </p>
              </section>

              <section className={styles.block}>
                <h2 className={styles.h2}>Marque protégée</h2>
                <p>
                  La dénomination « Swiss Serenity Plus » ainsi que les éléments visuels associés (logo, identité graphique, signes distinctifs) constituent une marque protégée. Toute utilisation sans autorisation préalable est strictement interdite.
                </p>
              </section>

              <section className={styles.block}>
                <h2 className={styles.h2}>Nature des prestations</h2>
                <p>
                  Swiss Serenity Plus propose des prestations de coordination, d'accompagnement organisationnel, d'office management, d'assistance administrative et commerciale ainsi que de conseil et de soutien opérationnel destinés aux professionnels et aux particuliers.
                </p>
                <p>
                  L'accompagnement repose sur une approche humaine, discrète, structurée, personnalisée et orientée qualité de service.
                </p>
              </section>

              <section className={styles.block}>
                <h2 className={styles.h2}>Cadre d'intervention</h2>
                <p>
                  Les prestations fournies consistent exclusivement en des services d'accompagnement administratif, organisationnel, commercial et de conseil.
                </p>
                <p>
                  Elles excluent toute activité fiduciaire, fiscale, comptable, juridique ou assimilée, ainsi que toute représentation légale auprès d'autorités, d'organismes ou de tiers.
                </p>
                <p>
                  Les prestations liées à l'expérience client, à l'organisation, à la coordination ou à l'optimisation de fonctionnement n'incluent aucune réalisation de travaux, aucune intervention technique, réglementaire ou de mise en conformité.
                </p>
              </section>

              <section className={styles.block}>
                <h2 className={styles.h2}>Responsabilité du client</h2>
                <p>
                  Le client demeure seul décisionnaire des actions entreprises sur la base des informations, recommandations ou accompagnements fournis.
                </p>
              </section>

              <section className={styles.block}>
                <h2 className={styles.h2}>Limitation de responsabilité</h2>
                <p>
                  Les prestations proposées n'impliquent aucune obligation de résultat.
                </p>
                <p>
                  Swiss Serenity Plus ne peut être tenue responsable des décisions prises par le client ni des conséquences liées à leur mise en œuvre.
                </p>
              </section>

              <section className={styles.block}>
                <h2 className={styles.h2}>Propriété intellectuelle</h2>
                <p>
                  Le contenu du site, les textes, éléments visuels, logos, graphismes et signes distinctifs sont protégés. Toute reproduction, diffusion ou utilisation, totale ou partielle, sans autorisation préalable, est interdite.
                </p>
              </section>

              <section className={styles.block}>
                <h2 className={styles.h2}>Protection des données</h2>
                <p>
                  Les données transmises via le site ou le formulaire de contact sont utilisées uniquement dans le cadre du traitement des demandes adressées à Swiss Serenity Plus et ne sont pas transmises à des tiers sans consentement préalable, sauf obligation légale.
                </p>
                <p>
                  Conformément à la loi fédérale suisse sur la protection des données (LPD), vous disposez d'un droit d'accès, de rectification et de suppression de vos données. Pour exercer ce droit, contactez-nous à{" "}
                  <a href="mailto:mireille.dayer@swiss-serenity-plus.ch" className={styles.link}>
                    mireille.dayer@swiss-serenity-plus.ch
                  </a>.
                </p>
              </section>
            </article>
          </Container>
        </section>
      </main>
      <Footer />
    </>
  );
}
