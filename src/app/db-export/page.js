import PasswordProtection from "@/components/PasswordProtection";
import DatabaseExport from "@/components/DatabaseExport";
import Navigation from "@/components/Navigation";
import { checkAuth } from "../actions/auth";

export default async function DatabaseExportPage() {
  const isAuthenticated = await checkAuth();
  if (!isAuthenticated) {
    return <PasswordProtection />;
  }

  return (
    <>
      <Navigation />
      <DatabaseExport />
    </>
  );
}
