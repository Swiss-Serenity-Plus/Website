// OG image (1200x630) pour les partages sur les réseaux sociaux.
// Image fournie par la cliente (MIR-402), hébergée sur R2 : on la récupère et on
// la sert telle quelle. Si elle n'est pas joignable, repli sur une carte de
// marque sobre générée (le build ne casse jamais). twitter-image.tsx réutilise
// ce module.
import { ImageResponse } from "next/og";

export const alt = "Swiss Serenity Plus — Accompagnement pour PME et particuliers";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

// Image OG fournie par la cliente (uploadée via la console de retours sur R2).
const OG_IMAGE =
  "https://pub-b61ce5a39cc042cabc94943b3c8f74b4.r2.dev/feedback/1781615857957-swiss-serenity-plus-mireille-dayer-accompagnements-pour-pme-.png";

const CREAM = "#f7f5f1";
const NAVY = "#062445";
const TAUPE = "#977b57";

export default async function Image() {
  // On sert l'image fournie telle quelle.
  try {
    const res = await fetch(OG_IMAGE, { cache: "no-store" });
    if (res.ok) {
      const buf = Buffer.from(await res.arrayBuffer());
      return new Response(buf, {
        headers: {
          "Content-Type": res.headers.get("content-type") ?? "image/png",
          "Cache-Control": "public, max-age=86400, immutable",
        },
      });
    }
  } catch {
    /* repli ci-dessous */
  }

  // Repli : carte de marque minimale si l'image n'est pas joignable.
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          backgroundColor: CREAM,
          fontFamily: "sans-serif",
        }}
      >
        <div style={{ display: "flex", color: NAVY, fontSize: 64, fontWeight: 700, letterSpacing: -1 }}>
          Swiss Serenity Plus®
        </div>
        <div style={{ display: "flex", color: TAUPE, fontSize: 28, marginTop: 20 }}>
          Sérénité · Succès · Performance
        </div>
      </div>
    ),
    { ...size }
  );
}
