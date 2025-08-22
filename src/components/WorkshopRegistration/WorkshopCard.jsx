import Image from "next/image";
import React from "react";

const WorkshopCard = ({
  workshop,
  blockName,
  isSelected,
  onSelect,
  isDisabled = false,
}) => {
  const handleClick = () => {
    if (workshop.slotsLeft > 0 && !isDisabled) {
      onSelect(workshop.id);
    }
  };

  return (
    <div
      className={`border rounded-lg p-4 cursor-pointer transition-all duration-200 relative ${
        isSelected
          ? "border-main bg-main/10"
          : "border-gray-600 hover:border-gray-500"
      } ${
        workshop.slotsLeft === 0 || isDisabled
          ? "opacity-60 cursor-not-allowed"
          : ""
      }`}
      onClick={handleClick}
    >
      <div className="flex items-start space-x-3">
        <input
          type="radio"
          name={blockName}
          value={workshop.id}
          checked={isSelected}
          onChange={() => handleClick()}
          disabled={workshop.slotsLeft === 0 || isDisabled}
          className="mt-1 w-4 h-4 text-main bg-gray-800 border-gray-600 focus:ring-main disabled:opacity-50 disabled:cursor-not-allowed"
        />
        <div className="flex-1">
          <div className="flex items-start space-x-3">
            <div className="flex items-center rounded-full w-24 h-24 relative">
              <Image
                alt={workshop.speaker}
                src={`/workshops/${workshop.id}.png`}
                fill={true}
                className="object-contain"
              />
            </div>

            {/* <div className="w-12 h-12 bg-main rounded-full flex items-center justify-center">
              <span className="text-white font-semibold text-lg">
                {workshop.speaker
                  .split(" ")
                  .map((n) => n[0])
                  .join("")}
              </span>
            </div> */}
            <div className="flex-1">
              <h3 className=" font-semibold mb-2 text-xl text-main">
                {workshop.title}
              </h3>
              <p className="font-semibold text-macopa text-lg">
                {workshop.speaker}
              </p>
              {/* <p className="text-base text-gray-500">{workshop.role}</p> */}
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
              {/* Special indicator for dvo-a-4 */}
              {workshop.id === "dvo-a-4" && (
                <div className="px-3 py-1 bg-blue-500/20 text-blue-600 border border-blue-500/30 rounded text-sm font-semibold">
                  Full Afternoon Session
                </div>
              )}

              <span className="text-sm text-gray-600">Slots available:</span>
              <div
                className={`px-2 py-1 rounded text-sm font-semibold ${
                  workshop.slotsLeft === 0
                    ? "bg-red-500/20 text-red-600 border border-red-500/30"
                    : workshop.slotsLeft <= 5
                    ? "bg-yellow-500/20 text-yellow-600 border border-yellow-500/30"
                    : "bg-green-500/20 text-green-600 border border-green-500/30"
                }`}
              >
                {workshop.slotsLeft === 0
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
