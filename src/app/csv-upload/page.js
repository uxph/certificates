import PasswordProtection from "@/components/PasswordProtection";
import CSVUpload from "@/components/CSVUpload";
import { checkAuth } from "../actions/auth";

export default async function CSVUploadPage() {
  const isAuthenticated = await checkAuth();
  if (!isAuthenticated) {
    return <PasswordProtection />;
  }

  return <CSVUpload />;
}
