import React from "react";

const WorkshopCard = ({ workshop, blockName, isSelected, onSelect }) => {
  const handleClick = () => {
    if (workshop.slotsLeft > 0) {
      onSelect(workshop.id);
    }
  };


  return (
    <div
      className={`border rounded-lg p-4 cursor-pointer transition-all duration-200 relative ${
        isSelected
          ? "border-main bg-main/10"
          : "border-gray-600 hover:border-gray-500"
      } ${workshop.slotsLeft === 0 ? "opacity-60 cursor-not-allowed" : ""}`}
      onClick={handleClick}
    >
      <div className="flex items-start space-x-3">
        <input
          type="radio"
          name={blockName}
          value={workshop.id}
          checked={isSelected}
          onChange={() => handleClick()}
          disabled={workshop.slotsLeft === 0}
          className="mt-1 w-4 h-4 text-main bg-gray-800 border-gray-600 focus:ring-main disabled:opacity-50 disabled:cursor-not-allowed"
        />
        <div className="flex-1">
          <h3 className=" font-semibold mb-2 text-lg text-main">
            {workshop.title}
          </h3>

          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-main rounded-full flex items-center justify-center">
              <span className="text-white font-semibold text-xs">
                {workshop.speaker
                  .split(" ")
                  .map((n) => n[0])
                  .join("")}
              </span>
            </div>
            <div className="flex-1">
              <p className="font-semibold text-macopa text-base">
                {workshop.speaker}
              </p>
              {/* <p className="text-sm text-gray-600">{workshop.role}</p> */}
              {workshop.room && (
                <p className="text-sm text-gray-500">Venue: {workshop.room}</p>
              )}
            </div>
          </div>

          {/* Slots Left Indicator */}
          <div className="mt-3 pt-2 border-t border-gray-600">
            <div className="flex items-center justify-end gap-4">
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
