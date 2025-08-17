"use client";
import React, { useState } from "react";
import WorkshopBlock from "./WorkshopBlock";
import SelectionSummary from "./SelectionSummary";
import RegistrationForm from "./RegistrationForm";

const WorkshopRegistration = ({
  workshopBlocks,
  title = "Workshop Registration",
  subtitle = "Online Workshops",
  eventSlug,
}) => {
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
      console.log(!(selectedWorkshops["blockA"] && selectedWorkshops["blockB"]))
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

      if (!result.success) {
        throw new Error(result.error);
      }

      setMessage({
        status: "success",
        message: `Registration successful! Welcome ${result.data.attendeeName}. You will receive a confirmation email shortly.`,
      });
      setLoading(false);
    } catch (e) {
      setMessage({
        status: "error",
        message:
          e?.message ||
          "An error has occurred. Please contact us",
      });
      setLoading(false);
    }
  };

  return (
    <>
      <h1 className="text-2xl md:text-5xl font-bold mb-4 text-center">
        {title}
      </h1>
      {subtitle && (
        <p className="text-base tracking-widest mb-8 text-center">{subtitle}</p>
      )}

      <div className="max-w-6xl w-full space-y-8">
        {Object.entries(workshopBlocks).map(([blockName, workshops]) => (
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
        workshopBlocks={workshopBlocks}
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
      />
    </>
  );
};

export default WorkshopRegistration;
