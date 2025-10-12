"use client";

import { useEffect, useMemo, useState } from "react";
import clsx from "clsx";

export default function WorkshopToggleDashboard({ events = [] }) {
  const initialState = useMemo(() => {
    const map = {};
    events.forEach((event) => {
      map[event.slug] = {
        isOpen: true,
        updatedAt: null,
        syncing: false,
        error: "",
      };
    });
    return map;
  }, [events]);

  const [statusMap, setStatusMap] = useState(initialState);
  const [loading, setLoading] = useState(true);
  const [globalError, setGlobalError] = useState("");

  useEffect(() => {
    setStatusMap(initialState);
  }, [initialState]);

  useEffect(() => {
    async function loadSettings() {
      try {
        setGlobalError("");
        setLoading(true);
        const res = await fetch("/api/workshop-registration/settings");
        const payload = await res.json();
        if (!res.ok || !payload?.success) {
          throw new Error(
            payload?.error || "Unable to load workshop toggles."
          );
        }

        setStatusMap((prev) => {
          const next = { ...prev };
          events.forEach((event) => {
            const data = payload.data?.[event.slug] || {};
            next[event.slug] = {
              isOpen:
                typeof data.isOpen === "boolean" ? data.isOpen : true,
              updatedAt: data.updatedAt || null,
              syncing: false,
              error: "",
            };
          });
          return next;
        });
      } catch (error) {
        console.error(error);
        setGlobalError(error.message || "Failed to load settings.");
      } finally {
        setLoading(false);
      }
    }

    if (events.length > 0) {
      loadSettings();
    } else {
      setLoading(false);
    }
  }, [events]);

  const toggleStatus = async (eventSlug) => {
    const current = statusMap[eventSlug] || {
      isOpen: true,
      updatedAt: null,
      syncing: false,
      error: "",
    };
    const nextValue = !current.isOpen;

    setStatusMap((prev) => ({
      ...prev,
      [eventSlug]: {
        ...prev[eventSlug],
        isOpen: nextValue,
        syncing: true,
        error: "",
      },
    }));

    try {
      const res = await fetch("/api/workshop-registration/settings", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ eventSlug, isOpen: nextValue }),
      });
      const payload = await res.json();

      if (!res.ok || !payload?.success) {
        throw new Error(
          payload?.error || "Unable to update workshop toggle."
        );
      }

      setStatusMap((prev) => ({
        ...prev,
        [eventSlug]: {
          ...prev[eventSlug],
          isOpen: nextValue,
          updatedAt: payload.data?.updatedAt || null,
          syncing: false,
          error: "",
        },
      }));
    } catch (error) {
      console.error(error);
      setStatusMap((prev) => ({
        ...prev,
        [eventSlug]: {
          ...prev[eventSlug],
          isOpen: current.isOpen,
          syncing: false,
          error: error.message || "Unable to update toggle.",
        },
      }));
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center py-16">
        <div className="flex items-center gap-3 text-gray-600">
          <span className="icon-[eos-icons--loading] animate-spin text-2xl" />
          <span className="text-lg font-medium">
            Loading workshop toggles...
          </span>
        </div>
      </div>
    );
  }

  if (events.length === 0) {
    return (
      <div className="bg-white border border-gray-200 rounded-lg p-8 text-center text-gray-600">
        No events found in the configuration file.
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <header className="space-y-2">
        <h1 className="text-2xl font-bold text-gray-900">
          Workshop Registration Toggles
        </h1>
        <p className="text-gray-600">
          Flip a switch to instantly open or close workshop registrations.
          Changes are saved immediately.
        </p>
        {globalError && (
          <div className="rounded-md border border-red-200 bg-red-50 px-4 py-3 text-red-600">
            {globalError}
          </div>
        )}
      </header>

      <div className="grid gap-6">
        {events.map((event) => {
          const status = statusMap[event.slug] || {
            isOpen: true,
            updatedAt: null,
            syncing: false,
            error: "",
          };

          const stateLabel = status.isOpen ? "Open" : "Closed";
          const stateColor = status.isOpen
            ? "bg-green-100 text-green-700 border-green-200"
            : "bg-red-100 text-red-700 border-red-200";

          return (
            <div
              key={event.slug}
              className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm"
            >
              <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                <div>
                  <h2 className="text-lg font-semibold text-gray-900">
                    {event.title}
                  </h2>
                  <p className="text-sm text-gray-500">
                    Slug: <code className="text-gray-700">{event.slug}</code>
                  </p>
                  {status.updatedAt && (
                    <p className="text-sm text-gray-500 mt-1">
                      Last updated:{" "}
                      {new Date(status.updatedAt).toLocaleString()}
                    </p>
                  )}
                  {status.error && (
                    <p className="text-sm text-red-600 mt-2">
                      {status.error}
                    </p>
                  )}
                </div>

                <div className="flex items-center gap-4">
                  <span
                    className={clsx(
                      "px-3 py-1 text-sm font-semibold rounded-full border",
                      stateColor
                    )}
                  >
                    {stateLabel}
                  </span>
                  <button
                    onClick={() => toggleStatus(event.slug)}
                    disabled={status.syncing}
                    className={clsx(
                      "relative inline-flex h-10 w-24 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2",
                      status.isOpen
                        ? "bg-green-500 focus:ring-green-400"
                        : "bg-gray-300 focus:ring-gray-400",
                      status.syncing && "opacity-60 cursor-wait"
                    )}
                    aria-pressed={status.isOpen}
                    aria-label={`Toggle registration for ${event.title}`}
                  >
                    <span
                      className={clsx(
                        "inline-block h-8 w-8 transform rounded-full bg-white shadow transition-transform",
                        status.isOpen ? "translate-x-14" : "translate-x-2"
                      )}
                    />
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
