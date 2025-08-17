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
          Your Selections
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {Object.entries(selectedWorkshops).map(([blockName, workshopId]) => {
            const selectedWorkshop = workshopBlocks[blockName]?.find(
              (w) => w.id === workshopId
            );
            return (
              <div key={blockName} className="text-center">
                <p className="font-semibold text-gray-800 mb-1">
                  {blockCopy[blockName]}
                </p>
                {selectedWorkshop ? (
                  <div className="border rounded p-2">
                    <p className="text-[#ED5D4B] font-bold">
                      {selectedWorkshop.title}
                    </p>
                    <p className="text-[#1b50d8]">{selectedWorkshop.speaker}</p>
                  </div>
                ) : (
                  <div className=" border border-gray-500 rounded p-2">
                    <p className="text-gray-400 text-sm">No selection made</p>
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
