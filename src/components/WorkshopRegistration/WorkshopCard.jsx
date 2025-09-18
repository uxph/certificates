import Image from "next/image";
import React from "react";
import clsx from "clsx";

const WorkshopCard = ({
  workshop,
  blockName,
  isSelected,
  onSelect,
  eventSlug,
  isDisabled = false,
}) => {
  const handleClick = () => {
    if (workshop.slotsLeft > 0 && !isDisabled) {
      onSelect(workshop.id);
    }
  };

  const speakerList = Array.isArray(workshop?.speakers)
    ? workshop.speakers
    : workshop?.speaker
    ? [{ name: workshop.speaker, role: workshop.role }]
    : [];

  const speakerNames = speakerList
    .map((s) => (typeof s === "string" ? s : s?.name))
    .filter(Boolean)
    .join(", ");

  const rolesCombined = speakerList
    .map((s) => (typeof s === "object" ? s?.role : undefined))
    .filter(Boolean)
    .join(" • ");

  const isPanel = workshop.isPanel;
  const isMultipleSpeakers =  Array.isArray(workshop?.speakers) && workshop.speakers.length > 1;

  return (
    <div
      className={clsx(
        "border rounded-lg p-4 cursor-pointer transition-all duration-200 bg-white relative",
        isSelected ? "border-main bg-main/10" : "border-gray-600 hover:border-gray-500",
        (workshop.slotsLeft <= 0 || isDisabled) && "opacity-60 cursor-not-allowed"
      )}
      onClick={handleClick}
    >
      <div className="flex items-start space-x-3">
        <input
          type="radio"
          name={blockName}
          value={workshop.id}
          checked={isSelected}
          onChange={() => handleClick()}
          disabled={workshop.slotsLeft <= 0 || isDisabled}
          className="mt-1 w-4 h-4 text-main bg-gray-800 border-gray-600 focus:ring-main disabled:opacity-50 disabled:cursor-not-allowed"
        />
        <div className="flex-1">
          <div className={clsx("flex items-start", !isMultipleSpeakers && "space-x-3")}>
            {!isMultipleSpeakers && (
              <div className="flex items-center rounded-full w-24 h-24 relative">
                <Image
                  alt={speakerNames || workshop.title}
                  src={`/workshops/${eventSlug}/${workshop.id}.png`}
                  fill={true}
                  className="object-contain"
                />
              </div>
            )}

            {/* <div className="w-12 h-12 bg-main rounded-full flex items-center justify-center">
              <span className="text-white font-semibold text-lg">
                {workshop.speaker
                  .split(" ")
                  .map((n) => n[0])
                  .join("")}
              </span>
            </div> */}
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-2">
                <h3 className="font-semibold text-xl text-main">{workshop.title}</h3>
              </div>
              {isMultipleSpeakers ? (
                <div className="mt-1 grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {speakerList.map((sp, idx) => {
                    const name = typeof sp === "string" ? sp : sp?.name;
                    const role = typeof sp === "object" ? sp?.role : undefined;
                    const letter = String.fromCharCode(97 + idx); // a,b,c,d...
                    const src = `/workshops/${eventSlug}/${workshop.id}-${letter}.png`;
                    return (
                      <div key={idx} className="flex items-center gap-3">
                        <div className="relative w-12 h-12 md:w-14 md:h-14 rounded overflow-hidden">
                          <Image alt={name || workshop.title} src={src} fill={true} className="object-cover" />
                        </div>
                        <div className="leading-tight">
                          <div className="font-semibold text-macopa text-xl md:text-2xl">{name}</div>
                          {role && <div className="text-lg md:text-xl text-gray-500">{role}</div>}
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <>
                  {speakerNames && (
                    <p className="font-semibold text-macopa text-lg">{speakerNames}</p>
                  )}
                  {rolesCombined && (
                    <p className="text-base text-gray-500">{rolesCombined}</p>
                  )}
                </>
              )}
              {workshop.room && (
                <p className="text-base text-gray-600">
                  Venue: {workshop.room}
                </p>
              )}
            </div>
          </div>

          {/* Slots Left Indicator */}
          <div className="mt-3 pt-2 border-t border-gray-600">
            <div className="flex items-center justify-end gap-4">
              {/* Indicators (aligned): full-afternoon and panel */}
              {isPanel && (
                <div className="px-3 py-1 bg-purple-500/20 text-purple-600 border border-purple-500/30 rounded text-sm font-semibold">
                  Panel
                </div>
              )}
              {workshop.full_afternoon && (
                <div className="px-3 py-1 bg-blue-500/20 text-blue-600 border border-blue-500/30 rounded text-sm font-semibold">
                  Occupies 2 slots
                </div>
              )}

              <span className="text-sm text-gray-600">Slots available:</span>
              <div
                className={clsx(
                  "px-2 py-1 rounded text-sm font-semibold",
                  workshop.slotsLeft <= 0
                    ? "bg-red-500/20 text-red-600 border border-red-500/30"
                    : workshop.slotsLeft > 0 && workshop.slotsLeft <= 5
                    ? "bg-yellow-500/20 text-yellow-600 border border-yellow-500/30"
                    : "bg-green-500/20 text-green-600 border border-green-500/30"
                )}
              >
                {workshop.slotsLeft <= 0
                  ? "FULL"
                  : `${workshop.slotsLeft} left`}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default WorkshopCard;
