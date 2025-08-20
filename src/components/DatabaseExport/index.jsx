"use client";

import { useState } from "react";

export default function DatabaseExport() {
  const [isExporting, setIsExporting] = useState(false);
  const [exportStatus, setExportStatus] = useState("");
  const [exportProgress, setExportProgress] = useState("");

  const collections = [
    { 
      id: "helixpay_event_attendees", 
      name: "Event Attendees", 
      description: "All event attendees data from HelixPay events",
      icon: "👥"
    },
    { 
      id: "workshop_registrations", 
      name: "Workshop Registrations", 
      description: "Workshop registration data and participant information",
      icon: "🎓"
    },
    { 
      id: "onsite_registrations", 
      name: "Onsite Registrations", 
      description: "Onsite registration data from physical events",
      icon: "📝"
    },
  ];

  const handleExport = async (collectionId) => {
    setIsExporting(true);
    setExportStatus(`Exporting ${collectionId}...`);
    setExportProgress("Connecting to database...");

    try {
      setExportProgress("Fetching data from Firebase...");
      
      const response = await fetch("/api/db-export", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ collection: collectionId }),
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
      a.download = `${collectionId}_${new Date().toISOString().split("T")[0]}.xlsx`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);

      setExportStatus(`✅ Successfully exported ${collectionId}`);
      setExportProgress("");
    } catch (error) {
      console.error("Export error:", error);
      setExportStatus(`❌ Error exporting ${collectionId}: ${error.message}`);
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
                Database Export
              </h1>
              <p className="text-gray-600">
                Export database collections to XLSX format using ExcelJS for analysis and reporting.
              </p>
            </div>

            {exportStatus && (
              <div className={`mb-6 p-4 rounded-md ${
                exportStatus.includes("❌") 
                  ? "bg-red-50 text-red-700 border border-red-200" 
                  : exportStatus.includes("✅") 
                    ? "bg-green-50 text-green-700 border border-green-200"
                    : "bg-blue-50 text-blue-700 border border-blue-200"
              }`}>
                <div className="font-medium">{exportStatus}</div>
                {exportProgress && (
                  <div className="text-sm mt-1 opacity-75">{exportProgress}</div>
                )}
              </div>
            )}

            <div className="grid gap-6">
              {collections.map((collection) => (
                <div
                  key={collection.id}
                  className="border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <span className="text-2xl">{collection.icon}</span>
                        <h3 className="text-lg font-semibold text-gray-900">
                          {collection.name}
                        </h3>
                      </div>
                      <p className="text-gray-600 mb-4">
                        {collection.description}
                      </p>
                      <p className="text-sm text-gray-500">
                        Collection ID: <code className="bg-gray-100 px-2 py-1 rounded font-mono">{collection.id}</code>
                      </p>
                    </div>
                    <button
                      onClick={() => handleExport(collection.id)}
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
                        "Export to XLSX"
                      )}
                    </button>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-8 p-4 bg-gray-50 rounded-lg">
              <h4 className="font-medium text-gray-900 mb-2">Export Features</h4>
              <ul className="text-sm text-gray-600 space-y-1">
                <li>• Server-side processing using ExcelJS for security</li>
                <li>• Automatic column width adjustment based on content</li>
                <li>• Formatted headers with styling</li>
                <li>• Handles complex data types (objects, arrays)</li>
                <li>• Files include collection ID and export date</li>
                <li>• Direct download to your device</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
