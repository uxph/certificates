"use client";
import React, { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import WorkshopBlock from "./WorkshopBlock";
import SelectionSummary from "./SelectionSummary";
import RegistrationForm from "./RegistrationForm";
import SuccessModal from "./SuccessModal";
import ConfirmationModal from "./ConfirmationModal";

const WorkshopRegistration = ({
  workshopBlocks,
  title = "Workshop Registration",
  subtitle,
  eventSlug,
  helixpayPattern = "",
  helixpayRegex = "",
  isRegistrationOpen = true,
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
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [successData, setSuccessData] = useState(null);
  const [showConfirmationModal, setShowConfirmationModal] = useState(false);
  const [confirmationWorkshop, setConfirmationWorkshop] = useState(null);

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
    if (!isRegistrationOpen) return;

    // Special handling for full-afternoon workshops which take up both blocks
    const workshop = workshopData[blockName]?.find((w) => w.id === workshopId);
    if (workshop?.full_afternoon) {
      setConfirmationWorkshop(workshop);
      setShowConfirmationModal(true);
      return; // Don't proceed with selection yet
    }
    
    // Normal selection logic
    setSelectedWorkshops((prev) => ({
      ...prev,
      [blockName]: workshopId,
    }));
  };

  const handleDvoA4Confirmation = () => {
    // User confirmed they understand - select the full-afternoon workshop in both blocks
    if (confirmationWorkshop?.id) {
      setSelectedWorkshops({
        blockA: confirmationWorkshop.id,
        blockB: confirmationWorkshop.id,
      });
    }
    setShowConfirmationModal(false);
    setConfirmationWorkshop(null);
  };

  const handleDvoA4Cancellation = () => {
    // User cancelled - don't select anything
    setShowConfirmationModal(false);
    setConfirmationWorkshop(null);
  };

  const handleSubmit = async () => {
    try {
      if (!isRegistrationOpen) {
        setMessage({
          status: "error",
          message: "Workshop registration is currently closed for this event.",
        });
        return;
      }

      setMessage({
        status: "info",
        message: "",
      });
      setLoading(true);
      console.log(
        !(selectedWorkshops["blockA"] && selectedWorkshops["blockB"])
      );
      // Special validation for full-afternoon workshops which take up both blocks
      const selectedA = workshopData?.blockA?.find(
        (w) => w.id === selectedWorkshops["blockA"]
      );
      const selectedB = workshopData?.blockB?.find(
        (w) => w.id === selectedWorkshops["blockB"]
      );
      const isFullAfternoonSelected = Boolean(
        selectedA?.full_afternoon || selectedB?.full_afternoon
      );
      
      if (!isFullAfternoonSelected && !(selectedWorkshops["blockA"] && selectedWorkshops["blockB"])) {
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
          title: subtitle,
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        // If already registered (conflict)
        if (response.status === 409) {
          router.push(
            `/workshop-registration/${eventSlug}/check-registration?helixpayCode=${encodeURIComponent(
              helixpayCode.trim()
            )}`
          );
          return;
        }

        throw new Error(result.error);
      }

      // Set success data and show modal
      setSuccessData({
        ...result.data,
        selectedWorkshops: { ...selectedWorkshops },
      });
      setShowSuccessModal(true);
      setLoading(false);

      // Clear the form
      setSelectedWorkshops({
        blockA: "",
        blockB: "",
      });
      setHelixpayCode("");

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
      <p className="text-base tracking-widest mb-8 text-center">
        Please visit the{" "}
        <a
          className="underline text-main"
          href="https://2025.uxph.org/"
          target="_blank"
          rel="noopener noreferrer"
        >
          website
        </a>{" "}
        for detailed session information.
      </p>
      {/* {subtitle && (
        <p className="text-base tracking-widest mb-8 text-center">{subtitle}</p>
      )} */}

      {!isRegistrationOpen && (
        <div className="max-w-prose w-full mb-8 rounded-md border border-amber-200 bg-amber-50 px-4 py-3 text-center text-amber-700 font-semibold">
          Workshop registration for this event is currently closed.
        </div>
      )}

      <div className="max-w-6xl w-full space-y-16">
        {Object.entries(workshopData).map(([blockName, workshops]) => (
          <WorkshopBlock
            key={blockName}
            blockName={blockName}
            workshops={workshops}
            eventSlug={eventSlug}
            selectedWorkshop={selectedWorkshops[blockName]}
            onWorkshopSelect={(workshopId) =>
              handleWorkshopSelect(blockName, workshopId)
            }
            isDisabled={
              !isRegistrationOpen ||
              (blockName === "blockB" &&
                workshopData?.blockA?.some(
                  (w) => w.id === selectedWorkshops.blockA && w.full_afternoon
                ))
            }
            registrationClosed={!isRegistrationOpen}
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
        isRegistrationOpen={isRegistrationOpen}
        helixpayPattern={helixpayPattern}
      />

      <SuccessModal
        isOpen={showSuccessModal}
        onClose={() => setShowSuccessModal(false)}
        attendeeName={successData?.attendeeName}
        selectedWorkshops={successData?.selectedWorkshops}
        workshopBlocks={workshopData}
      />

      <ConfirmationModal
        isOpen={showConfirmationModal}
        onClose={handleDvoA4Cancellation}
        onConfirm={handleDvoA4Confirmation}
        workshopTitle={confirmationWorkshop?.title || ""}
        speaker={confirmationWorkshop?.speaker || ""}
      />
    </>
  );
};

export default WorkshopRegistration;
