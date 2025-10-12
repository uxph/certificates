import path from "path";
import fs from "fs/promises";

import Navigation from "@/components/Navigation";
import PasswordProtection from "@/components/PasswordProtection";
import WorkshopToggleDashboard from "@/components/WorkshopToggleDashboard";
import { checkAuth } from "../actions/auth";

async function getWorkshopEvents() {
  const filePath = path.join(process.cwd(), "data/events.json");
  const data = JSON.parse(await fs.readFile(filePath, "utf-8"));

  const currentYear = new Date().getFullYear().toString();
  const eventsByYear = data[currentYear] || data["2025"] || {};

  return Object.entries(eventsByYear)
    .filter(([slug]) => slug !== "business-of-design")
    .map(([slug, info]) => ({
      slug,
      title: info?.title || slug,
    }));
}

export default async function WorkshopTogglePage() {
  const isAuthenticated = await checkAuth();
  if (!isAuthenticated) {
    return <PasswordProtection />;
  }

  const events = await getWorkshopEvents();

  return (
    <>
      <Navigation />
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <WorkshopToggleDashboard events={events} />
      </div>
    </>
  );
}
