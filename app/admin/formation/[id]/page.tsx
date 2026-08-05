// /admin/formation/[id] — lien profond vers une ressource de formation.
//
// Rend la console d'administration habituelle (même layout que /admin) avec la
// ressource <id> pré-ouverte dans le gestionnaire de formations. L'URL change
// dans la structure existante ; ce n'est pas une page séparée.
import { cookies } from "next/headers";
import { ADMIN_COOKIE, isValidSession } from "../../../lib/adminAuth";
import AdminLogin from "../../_components/AdminLogin";
import AdminConsole from "../../_components/AdminConsole";

export const metadata = {
  title: "Console de retours ⎜ Swiss Serenity Plus",
  robots: { index: false, follow: false },
};

export default async function FormationItemPage(
  { params }: { params: Promise<{ id: string }> }
) {
  const token = (await cookies()).get(ADMIN_COOKIE)?.value;
  if (!isValidSession(token)) return <AdminLogin />;

  const { id } = await params;
  return <AdminConsole initialFormation initialFormationId={id} />;
}
