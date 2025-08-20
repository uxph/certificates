"use client";

import { useState } from "react";

export default function DatabaseExport() {
  const [isExporting, setIsExporting] = useState(false);
  const [exportStatus, setExportStatus] = useState("");
  const [exportProgress, setExportProgress] = useState("");

  const venues = [
    {
      id: "mini-conf-dvo",
      name: "Davao",
      description: "Export workshop attendees for Davao Mini Conference 2025",
      icon: "🌴",
      eventTitle: "Mini Conference 2025 - DVO"
    },
    {
      id: "mini-conf-ceb",
      name: "Cebu",
      description: "Export workshop attendees for Cebu Mini Conference 2025",
      icon: "🏝️",
      eventTitle: "Mini Conference 2025 - CEB"
    },
    {
      id: "mini-conf-mnl",
      name: "Manila",
      description: "Export workshop attendees for Manila Mini Conference 2025",
      icon: "🏙️",
      eventTitle: "Mini Conference 2025 - MNL"
    },
  ];

  const handleExport = async (venueId) => {
    setIsExporting(true);
    setExportStatus(`Exporting ${venueId} workshop attendees...`);
    setExportProgress("Connecting to database...");

    try {
      setExportProgress("Fetching data from Firebase...");

      const response = await fetch("/api/db-export", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ venue: venueId }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Export failed");
      }

      setExportProgress("Generating Excel file...");

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      
      // Get the venue object to access the event title
      const venueObj = venues.find(v => v.id === venueId);
      const eventName = venueObj ? venueObj.name : venueId;
      
      a.download = `workshop_attendees_${eventName}_${venueId}_${
        new Date().toISOString().split("T")[0]
      }.xlsx`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);

      setExportStatus(
        `✅ Successfully exported ${venueId} workshop attendees`
      );
      setExportProgress("");
    } catch (error) {
      console.error("Export error:", error);
      setExportStatus(
        `❌ Error exporting ${venueId}: ${error.message}`
      );
      setExportProgress("");
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white shadow rounded-lg">
          <div className="px-6 py-8">
            <div className="mb-8">
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                Workshop Attendee Export
              </h1>
              <p className="text-gray-600">
                Export workshop attendees by event venue. Each Excel file will contain multiple sheets - one for each workshop with attendee details.
              </p>
            </div>

            {exportStatus && (
              <div
                className={`mb-6 p-4 rounded-md ${
                  exportStatus.includes("❌")
                    ? "bg-red-50 text-red-700 border border-red-200"
                    : exportStatus.includes("✅")
                    ? "bg-green-50 text-green-700 border border-green-200"
                    : "bg-blue-50 text-blue-700 border border-blue-200"
                }`}
              >
                <div className="font-medium">{exportStatus}</div>
                {exportProgress && (
                  <div className="text-sm mt-1 opacity-75">
                    {exportProgress}
                  </div>
                )}
              </div>
            )}

            <div className="grid gap-6">
              {venues.map((venue) => (
                <div
                  key={venue.id}
                  className="border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <span className="text-2xl">{venue.icon}</span>
                        <div>
                          <h3 className="text-lg font-semibold text-gray-900">
                            {venue.name}
                          </h3>
                          <p className="text-sm text-gray-600">{venue.eventTitle}</p>
                        </div>
                      </div>
                      <p className="text-gray-600 mb-4">{venue.description}</p>
                      <p className="text-sm text-gray-500">
                        Event ID:{" "}
                        <code className="bg-gray-100 px-2 py-1 rounded font-mono">
                          {venue.id}
                        </code>
                      </p>
                    </div>
                    <button
                      onClick={() => handleExport(venue.id)}
                      disabled={isExporting}
                      className={`px-6 py-2 rounded-md font-medium transition-colors ${
                        isExporting
                          ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                          : "bg-blue-600 text-white hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                      }`}
                    >
                      {isExporting ? (
                        <div className="flex items-center gap-2">
                          <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                          Exporting...
                        </div>
                      ) : (
                        "Export to Excel"
                      )}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
