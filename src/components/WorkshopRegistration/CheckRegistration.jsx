"use client";

import React, { useState } from "react";
import Link from "next/link";
import SelectionSummary from "./SelectionSummary";

const CheckRegistration = ({
  workshopBlocks,
  eventSlug,
  initialCode = "",
  helixpayPattern = "",
  helixpayRegex = "",
}) => {
  const [helixpayCode, setHelixpayCode] = useState(initialCode);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [registration, setRegistration] = useState(null);

  const redirectedNotice = initialCode && initialCode.trim() !== "";

  const handleSubmit = async () => {
    try {
      setError("");
      setLoading(true);
      setRegistration(null);

      if (!helixpayCode.trim()) {
        throw new Error("Please enter your Helixpay code.");
      }

      if (helixpayRegex) {
        const regex = new RegExp(helixpayRegex);
        if (!regex.test(helixpayCode.trim())) {
          throw new Error("Invalid Helixpay code format.");
        }
      }

      const res = await fetch(
        `/api/workshop-registration?helixpayCode=${encodeURIComponent(
          helixpayCode.trim()
        )}&eventSlug=${eventSlug}`
      );
      const json = await res.json();

      if (!json.success) {
        throw new Error(json.error || "Unable to fetch registration.");
      }

      if (!json.isRegistered) {
        throw new Error("No registration found for this code.");
      }

      setRegistration(json.data);
      setLoading(false);
    } catch (err) {
      setLoading(false);
      setError(err.message || "An unexpected error occurred");
    }
  };

  return (
    <div className="w-full max-w-xl space-y-6">
      <h1 className="text-2xl md:text-4xl font-bold text-center">
        Check Your Workshop Registration
      </h1>

      {redirectedNotice && (
        <p className="text-center text-green-600">
          You are already registered! Please check your registration by filling in the information below.
        </p>
      )}

      <div className="space-y-4">
        <input
          type="text"
          placeholder={helixpayPattern || "Enter your Helixpay code"}
          value={helixpayCode}
          onChange={(e) => setHelixpayCode(e.target.value)}
          className="w-full p-3 border border-gray-600 rounded"
        />
        <button
          onClick={handleSubmit}
          disabled={loading}
          className="w-full py-3 bg-main text-white font-semibold rounded disabled:opacity-50"
        >
          {loading ? "Checking..." : "Check Registration"}
        </button>
      </div>

      {error && <p className="text-red-500 text-center font-medium">{error}</p>}

      {registration && (
        <SelectionSummary
          selectedWorkshops={{
            blockA: registration.blockA,
            blockB: registration.blockB,
          }}
          workshopBlocks={workshopBlocks}
        />
      )}

      {/* Small CTA link */}
      <div className="text-center">
        <p className="text-sm">
          Haven't registered yet?{" "}
          <Link
            href={`/workshop-registration/${eventSlug}`}
            className="text-main underline font-medium hover:text-main/80"
          >
            Register here
          </Link>
        </p>
      </div>
    </div>
  );
};

export default CheckRegistration;
