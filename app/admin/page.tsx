// Console d'administration /admin.
// Server Component : lit le cookie de session et affiche soit la page de login,
// soit la console. Protege sur tous les deploiements (production et previews).
import { cookies } from "next/headers";
import { ADMIN_COOKIE, isValidSession } from "../lib/adminAuth";
import AdminLogin from "./_components/AdminLogin";
import AdminConsole from "./_components/AdminConsole";

export const metadata = {
  title: "Console de retours — Swiss Serenity Plus",
  robots: { index: false, follow: false },
};

export default async function AdminPage() {
  const cookieStore = await cookies();
  const token = cookieStore.get(ADMIN_COOKIE)?.value;

  if (!isValidSession(token)) {
    return <AdminLogin />;
  }

  return <AdminConsole />;
}
