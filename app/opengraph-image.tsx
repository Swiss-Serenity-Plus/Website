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
            width={720}
            height={630}
            style={{
              position: "absolute",
              top: 0,
              right: 0,
              width: "60%",
              height: "100%",
              objectFit: "cover",
            }}
          />
        )}

        {/* Fondu crème en diagonale sur le bord gauche de la photo */}
        <div
          style={{
            position: "absolute",
            inset: 0,
            display: "flex",
            backgroundImage: `linear-gradient(105deg, ${CREAM} 42%, rgba(247,245,241,0.55) 53%, rgba(247,245,241,0) 67%)`,
          }}
        />

        {/* Bloc texte (gauche, sur le crème) */}
        <div
          style={{
            position: "relative",
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            height: "100%",
            padding: "0 72px",
            maxWidth: 660,
          }}
        >
          <div
            style={{
              display: "flex",
              color: TAUPE,
              fontSize: 23,
              letterSpacing: 3,
              textTransform: "uppercase",
              fontWeight: 600,
              marginBottom: 26,
            }}
          >
            Votre partenaire de confiance
          </div>
          <div
            style={{
              display: "flex",
              color: NAVY,
              fontSize: 58,
              fontWeight: 700,
              lineHeight: 1.08,
              letterSpacing: -1,
            }}
          >
            Sérénité · Succès · Performance
          </div>
          <div
            style={{
              display: "flex",
              color: MUTED,
              fontSize: 27,
              lineHeight: 1.45,
              marginTop: 28,
              maxWidth: 540,
            }}
          >
            Bras droit business externalisé pour dirigeants, PME et particuliers en Suisse romande.
          </div>
          <div style={{ display: "flex", alignItems: "center", marginTop: 46 }}>
            <div style={{ display: "flex", width: 44, height: 3, backgroundColor: TAUPE, marginRight: 18 }} />
            <div style={{ display: "flex", color: NAVY, fontSize: 26, fontWeight: 600 }}>
              Swiss Serenity Plus®
            </div>
          </div>
        </div>
      </div>
    ),
    { ...size }
  );
}
