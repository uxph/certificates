import PasswordProtection from "@/components/PasswordProtection";
import Navigation from "@/components/Navigation";
import CSVUploadEmail from "@/components/CSVUploadEmail";
import { checkAuth } from "../actions/auth";

export default async function CSVUploadEmailPage() {
  const isAuthenticated = await checkAuth();
  if (!isAuthenticated) {
    return <PasswordProtection />;
  }

  return (
    <>
      <Navigation />
      <CSVUploadEmail />
    </>
  );
}

