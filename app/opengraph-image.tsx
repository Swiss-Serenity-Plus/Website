// OG image générée — recréation du hero desktop (1200x630) pour les partages
// sur les réseaux sociaux. La photo paysage R2 est embarquée à la génération
// (côté Vercel, où R2 est accessible) ; si elle n'est pas joignable, on rend
// une carte de marque sobre en repli (le build ne casse jamais).
import { ImageResponse } from "next/og";

export const alt = "Swiss Serenity Plus — Sérénité · Succès · Performance";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

const HERO_PHOTO =
  "https://pub-b61ce5a39cc042cabc94943b3c8f74b4.r2.dev/Paysage%20-%20Swiss%20Serenity%20Plus%20-%20Mireille%20Dayer.png";

const CREAM = "#f7f5f1";
const NAVY = "#062445";
const MUTED = "#4a5a6f";
const TAUPE = "#977b57";

export default async function Image() {
  let photoSrc: string | null = null;
  try {
    const res = await fetch(HERO_PHOTO, { cache: "no-store" });
    if (res.ok) {
      const buf = Buffer.from(await res.arrayBuffer());
      photoSrc = `data:image/png;base64,${buf.toString("base64")}`;
    }
  } catch {
    photoSrc = null;
  }

  return new ImageResponse(
    (
      <div
        style={{
          position: "relative",
          width: "100%",
          height: "100%",
          display: "flex",
          backgroundColor: CREAM,
          fontFamily: "sans-serif",
        }}
      >
        {photoSrc && (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={photoSrc}
            alt=""
            width={780}
            height={630}
            style={{
              position: "absolute",
              top: 0,
              right: 0,
              width: "65%",
              height: "100%",
              objectFit: "cover",
              objectPosition: "60% 50%",
            }}
          />
        )}

        {/* Fondu crème large et progressif (diagonale douce facon hero) :
            le crème reste opaque sur toute la zone de texte (gauche) puis se
            dissout lentement dans la photo, sans couture ni arete. */}
        <div
          style={{
            position: "absolute",
            inset: 0,
            display: "flex",
            backgroundImage: `linear-gradient(107deg, ${CREAM} 0%, ${CREAM} 47%, rgba(247,245,241,0.88) 55%, rgba(247,245,241,0.45) 66%, rgba(247,245,241,0) 82%)`,
          }}
        />

        {/* Bloc texte (gauche) entierement pose sur le creme opaque */}
        <div
          style={{
            position: "relative",
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            height: "100%",
            padding: "0 76px",
            maxWidth: 540,
          }}
        >
          <div
            style={{
              display: "flex",
              color: TAUPE,
              fontSize: 22,
              letterSpacing: 3,
              textTransform: "uppercase",
              fontWeight: 600,
              marginBottom: 24,
            }}
          >
            Votre partenaire de confiance
          </div>
          <div
            style={{
              display: "flex",
              color: NAVY,
              fontSize: 54,
              fontWeight: 700,
              lineHeight: 1.1,
              letterSpacing: -1,
            }}
          >
            Sérénité · Succès · Performance
          </div>
          <div
            style={{
              display: "flex",
              color: MUTED,
              fontSize: 25,
              lineHeight: 1.45,
              marginTop: 26,
              maxWidth: 430,
            }}
          >
            Bras droit business externalisé pour dirigeants, PME et particuliers en Suisse romande.
          </div>
          <div style={{ display: "flex", alignItems: "center", marginTop: 42 }}>
            <div style={{ display: "flex", width: 44, height: 3, backgroundColor: TAUPE, marginRight: 18 }} />
            <div style={{ display: "flex", color: NAVY, fontSize: 25, fontWeight: 600 }}>
              Swiss Serenity Plus®
            </div>
          </div>
        </div>
      </div>
    ),
    { ...size }
  );
}
