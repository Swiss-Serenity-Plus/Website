// Route dédiée d'une ressource de formation : /admin/formation/[id]
//
// Le contenu de formation est réservé à l'admin : on lit le cookie de session
// (même mécanisme que /admin) et on affiche l'écran de connexion si la session
// est absente. Une fois connecté, la page affiche la vidéo Tella et le corps de
// la ressource (blocs Notion convertis en HTML). L'identifiant Notion de la page
// sert de slug.
import { cookies } from "next/headers";
import { notFound } from "next/navigation";
import { ADMIN_COOKIE, isValidSession } from "../../../lib/adminAuth";
import { getTrainingResource } from "../../../lib/training";
import AdminLogin from "../../_components/AdminLogin";
import FormationResourceView from "./FormationResourceView";

export const metadata = {
  title: "Formation — Swiss Serenity Plus",
  robots: { index: false, follow: false },
};

// Contenu propre à chaque session admin + dépendant de Notion → pas de cache.
export const dynamic = "force-dynamic";

export default async function FormationResourcePage(
  { params }: { params: Promise<{ id: string }> }
) {
  const cookieStore = await cookies();
  const token = cookieStore.get(ADMIN_COOKIE)?.value;
  if (!isValidSession(token)) {
    return <AdminLogin />;
  }

  const { id } = await params;
  const resource = await getTrainingResource(id);
  if (!resource) notFound();

  return (
    <FormationResourceView
      title={resource.title}
      tellaUrl={resource.tellaUrl}
      html={resource.html}
    />
  );
}
