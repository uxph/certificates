"use client";
import React, { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import WorkshopBlock from "./WorkshopBlock";
import SelectionSummary from "./SelectionSummary";
import RegistrationForm from "./RegistrationForm";

const WorkshopRegistration = ({
  workshopBlocks,
  title = "Workshop Registration",
  subtitle = "Online Workshops",
  eventSlug,
  helixpayPattern = "",
  helixpayRegex = "",
}) => {
  const router = useRouter();
  const [workshopData, setWorkshopData] = useState(workshopBlocks);
  const [selectedWorkshops, setSelectedWorkshops] = useState({
    blockA: "",
    blockB: "",
  });
  const [helixpayCode, setHelixpayCode] = useState("");
  const [message, setMessage] = useState({
    status: "info",
    message: "",
  });
  const [loading, setLoading] = useState(false);

  // Fetch latest slotsLeft from server
  const refreshSlots = useCallback(async () => {
    try {
      if (!eventSlug) return;

      const res = await fetch(`/api/workshop-slots?eventSlug=${eventSlug}`);
      const json = await res.json();

      if (!json.success) throw new Error(json.error || "Unable to fetch slots");

      setWorkshopData((prev) => {
        const updated = {};
        for (const [blockName, workshops] of Object.entries(prev)) {
          updated[blockName] = workshops.map((w) => ({
            ...w,
            slotsLeft: json.data?.[w.id] ?? w.slotsLeft,
          }));
        }
        return updated;
      });
    } catch (err) {
      console.error("Refresh slots error", err);
    }
  }, [eventSlug]);

  // Initial fetch on mount
  useEffect(() => {
    refreshSlots();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleWorkshopSelect = (blockName, workshopId) => {
    setSelectedWorkshops((prev) => ({
      ...prev,
      [blockName]: workshopId,
    }));
  };

  const handleSubmit = async () => {
    try {
      setMessage({
        status: "info",
        message: "",
      });
      setLoading(true);
      console.log(
        !(selectedWorkshops["blockA"] && selectedWorkshops["blockB"])
      );
      if (!(selectedWorkshops["blockA"] && selectedWorkshops["blockB"])) {
        throw new Error(
          "Please select one workshop from both Block A and Block B to continue."
        );
      }

      if (!helixpayCode.trim()) {
        throw new Error(
          "Please enter your Helixpay code to proceed with registration."
        );
      }

      // Validate Helixpay format if regex provided
      if (helixpayRegex) {
        const regex = new RegExp(helixpayRegex);
        if (!regex.test(helixpayCode.trim())) {
          throw new Error(
            "Invalid Helixpay code format. Please follow the required pattern."
          );
        }
      }

      if (!eventSlug) {
        throw new Error(
          "Event information is missing. Please refresh the page and try again."
        );
      }

      // Call the workshop registration API
      const response = await fetch("/api/workshop-registration", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          eventSlug: eventSlug,
          helixpayCode: helixpayCode.trim(),
          workshopSelections: selectedWorkshops,
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        // If already registered (conflict)
        if (response.status === 409) {
          router.push(
            `/workshop-registration/${eventSlug}/online/check-registration?helixpayCode=${encodeURIComponent(
              helixpayCode.trim()
            )}`
          );
          return;
        }

        throw new Error(result.error);
      }

      setMessage({
        status: "success",
        message: `Registration successful! Welcome ${result.data.attendeeName}. You will receive a confirmation email shortly.`,
      });
      setLoading(false);

      // Refresh slots after successful registration
      await refreshSlots();
    } catch (e) {
      setMessage({
        status: "error",
        message: e?.message || "An error has occurred. Please contact us",
      });
      setLoading(false);
    }
  };

  return (
    <>
      <h1 className="text-2xl md:text-4xl font-bold mb-4 text-center">
        {title}
      </h1>
      {subtitle && (
        <p className="text-base tracking-widest mb-8 text-center">{subtitle}</p>
      )}

      <div className="max-w-6xl w-full space-y-8">
        {Object.entries(workshopData).map(([blockName, workshops]) => (
          <WorkshopBlock
            key={blockName}
            blockName={blockName}
            workshops={workshops}
            selectedWorkshop={selectedWorkshops[blockName]}
            onWorkshopSelect={(workshopId) =>
              handleWorkshopSelect(blockName, workshopId)
            }
          />
        ))}
      </div>

      <SelectionSummary
        selectedWorkshops={selectedWorkshops}
        workshopBlocks={workshopData}
      />

      <RegistrationForm
        helixpayCode={helixpayCode}
        setHelixpayCode={setHelixpayCode}
        selectedWorkshops={selectedWorkshops}
        loading={loading}
        message={message}
        onSubmit={handleSubmit}
        setMessage={setMessage}
        eventSlug={eventSlug}
        helixpayPattern={helixpayPattern}
      />
    </>
  );
};

export default WorkshopRegistration;
