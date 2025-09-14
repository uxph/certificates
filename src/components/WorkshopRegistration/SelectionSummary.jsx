import React from "react";
import { blockInfo } from "./blockInfo";

const SelectionSummary = ({ selectedWorkshops, workshopBlocks }) => {
  // Using global blockInfo

  // Check if a full-afternoon workshop is selected (takes both blocks)
  const selectedA = workshopBlocks.blockA?.find(
    (w) => w.id === selectedWorkshops.blockA
  );
  const selectedB = workshopBlocks.blockB?.find(
    (w) => w.id === selectedWorkshops.blockB
  );
  const isFullAfternoonSelected = Boolean(
    selectedA?.full_afternoon || selectedB?.full_afternoon
  );
  
  // If full-afternoon is selected, show only one card with combined time
  if (isFullAfternoonSelected) {
    const fullAfternoonWorkshop = selectedA?.full_afternoon ? selectedA : selectedB;
    const speakerNames = Array.isArray(fullAfternoonWorkshop?.speakers)
      ? fullAfternoonWorkshop.speakers
          .map((s) => (typeof s === "string" ? s : s?.name))
          .filter(Boolean)
          .join(", ")
      : fullAfternoonWorkshop?.speaker;
    
    return (
      <div className="max-w-4xl w-full mt-8 mb-6 bg-white">
        <div className=" rounded-lg p-4 border border-gray-600">
          <h3 className="text-2xl font-semibold mb-3 text-center">
            Your workshop
          </h3>
          <div className="text-center">
            <p className="font-bold text-lg text-gray-800 mb-2">
              Full Afternoon Session
            </p>
            <p className="font-medium text-base mb-4">(1:40 PM - 4:25 PM)</p>
            {fullAfternoonWorkshop ? (
              <div className="border border-main rounded p-4 bg-white max-w-md mx-auto">
                <p className="text-main text-lg font-bold">
                  {fullAfternoonWorkshop.title}
                </p>
                {speakerNames && (
                  <p className="text-macopa font-bold">{speakerNames}</p>
                )}
                {fullAfternoonWorkshop.room && (
                  <p className=" text-gray-600">Venue: {fullAfternoonWorkshop.room}</p>
                )}
              </div>
            ) : (
              <div className="border border-gray-300 rounded p-4 bg-gray-50 max-w-md mx-auto">
                <p className="text-red-500 font-bold text-lg uppercase tracking-wide">Workshop Not Found</p>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }
  
  return (
    <div className="max-w-4xl w-full mt-8 mb-6 bg-white">
      <div className=" rounded-lg p-4 border border-gray-600">
        <h3 className="text-2xl font-semibold mb-3 text-center">
          Your workshops
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {Object.entries(selectedWorkshops).map(([blockName, workshopId]) => {
            const selectedWorkshop = workshopBlocks[blockName]?.find(
              (w) => w.id === workshopId
            );
            const speakerNames = Array.isArray(selectedWorkshop?.speakers)
              ? selectedWorkshop.speakers
                  .map((s) => (typeof s === "string" ? s : s?.name))
                  .filter(Boolean)
                  .join(", ")
              : selectedWorkshop?.speaker;
            return (
              <div key={blockName} className="text-center h-full flex flex-col">
                <p className="font-bold text-lg text-gray-800">
                  {blockInfo[blockName]?.label} 
                </p>
                <p className="font-medium text-base mb-2">({blockInfo[blockName]?.time})</p>
                {selectedWorkshop ? (
                  <div className="border border-main rounded p-2 bg-white flex-1 flex flex-col justify-center">
                    <p className="text-main text-lg font-bold">
                      {selectedWorkshop.title}
                    </p>
                    {speakerNames && (
                      <p className="text-macopa font-bold ">{speakerNames}</p>
                    )}
                    {selectedWorkshop.room && (
                      <p className=" text-gray-600">Venue: {selectedWorkshop.room}</p>
                    )}
                  </div>
                ) : (
                  <div className="border border-gray-300 rounded p-2 bg-gray-50 flex-1 flex flex-col justify-center">
                    <p className="text-red-500 font-bold text-lg uppercase tracking-wide">Pick One</p>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default SelectionSummary;
