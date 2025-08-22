import React from "react";

const SelectionSummary = ({ selectedWorkshops, workshopBlocks }) => {
  const blockInfo = {
    blockA: {
      label: "Block A",
      time: "1:40 PM - 2:55 PM",
    },
    blockB: {
      label: "Block B",
      time: "3:10 PM - 4:25 PM",
    },
  };

  // Check if dvo-a-4 is selected (which takes up both blocks)
  const isDvoA4Selected = selectedWorkshops.blockA === "dvo-a-4" || selectedWorkshops.blockB === "dvo-a-4";
  
  // If dvo-a-4 is selected, show only one card with combined time
  if (isDvoA4Selected) {
    const dvoA4Workshop = workshopBlocks.blockA?.find(w => w.id === "dvo-a-4") || 
                          workshopBlocks.blockB?.find(w => w.id === "dvo-a-4");
    
    return (
      <div className="max-w-4xl w-full mt-8 mb-6">
        <div className=" rounded-lg p-4 border border-gray-600">
          <h3 className="text-2xl font-semibold mb-3 text-center">
            Your workshop
          </h3>
          <div className="text-center">
            <p className="font-bold text-lg text-gray-800 mb-2">
              Full Afternoon Session
            </p>
            <p className="font-medium text-base mb-4">(1:40 PM - 4:25 PM)</p>
            {dvoA4Workshop ? (
              <div className="border border-main rounded p-4 bg-main/5 max-w-md mx-auto">
                <p className="text-main text-lg font-bold">
                  {dvoA4Workshop.title}
                </p>
                <p className="text-macopa font-bold">{dvoA4Workshop.speaker}</p>
                {dvoA4Workshop.room && (
                  <p className=" text-gray-600">Venue: {dvoA4Workshop.room}</p>
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
