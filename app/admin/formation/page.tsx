// /admin/formation — console d'administration avec le gestionnaire de
// formations ouvert (vue liste). Même layout que /admin ; seule l'URL change.
import { cookies } from "next/headers";
import { ADMIN_COOKIE, isValidSession } from "../../lib/adminAuth";
import AdminLogin from "../_components/AdminLogin";
import AdminConsole from "../_components/AdminConsole";

export const metadata = {
  title: "Console de retours — Swiss Serenity Plus",
  robots: { index: false, follow: false },
};

export default async function FormationListPage() {
  const token = (await cookies()).get(ADMIN_COOKIE)?.value;
  if (!isValidSession(token)) return <AdminLogin />;

  return <AdminConsole initialFormation />;
}
