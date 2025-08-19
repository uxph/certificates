import React from "react";

const SelectionSummary = ({ selectedWorkshops, workshopBlocks }) => {
  const blockCopy = {
    blockA: "Block A",
    blockB: "Block B",
  };
  return (
    <div className="max-w-4xl w-full mt-8 mb-6">
      <div className=" rounded-lg p-4 border border-gray-600">
        <h3 className="text-lg font-semibold mb-3 text-center">
          Your workshops
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {Object.entries(selectedWorkshops).map(([blockName, workshopId]) => {
            const selectedWorkshop = workshopBlocks[blockName]?.find(
              (w) => w.id === workshopId
            );
            return (
              <div key={blockName} className="text-center">
                <p className="font-bold text-lg text-gray-800 mb-2">
                  {blockCopy[blockName]}
                </p>
                {selectedWorkshop ? (
                  <div className="border-2 border-green-500 rounded p-2 bg-green-50">
                    <p className="text-macopa font-bold">
                      {selectedWorkshop.title}
                    </p>
                    <p className="text-main">{selectedWorkshop.speaker}</p>
                    {selectedWorkshop.room && (
                      <p className="text-xs text-gray-500">Venue: {selectedWorkshop.room}</p>
                    )}
                  </div>
                ) : (
                  <div className="border border-gray-300 rounded p-2 bg-gray-50">
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
