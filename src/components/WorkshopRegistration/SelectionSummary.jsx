import React from "react";

const SelectionSummary = ({ selectedWorkshops, workshopBlocks }) => {
  const blockInfo = {
    blockA: {
      label: "Block A",
      time: "9:00 AM - 10:30 AM",
    },
    blockB: {
      label: "Block B",
      time: "10:45 AM - 12:15 PM",
    },
  };
  
  return (
    <div className="max-w-4xl w-full mt-8 mb-6">
      <div className=" rounded-lg p-4 border border-gray-600">
        <h3 className="text-2xl font-semibold mb-3 text-center">
          Your workshops
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {Object.entries(selectedWorkshops).map(([blockName, workshopId]) => {
            const selectedWorkshop = workshopBlocks[blockName]?.find(
              (w) => w.id === workshopId
            );
            return (
              <div key={blockName} className="text-center h-full flex flex-col">
                <p className="font-bold text-lg text-gray-800">
                  {blockInfo[blockName]?.label} 
                </p>
                <p className="font-medium text-base mb-2">({blockInfo[blockName]?.time})</p>
                {selectedWorkshop ? (
                  <div className="border border-main rounded p-2 bg-main/5 flex-1 flex flex-col justify-center">
                    <p className="text-main text-lg font-bold">
                      {selectedWorkshop.title}
                    </p>
                    <p className="text-macopa font-bold ">{selectedWorkshop.speaker}</p>
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
