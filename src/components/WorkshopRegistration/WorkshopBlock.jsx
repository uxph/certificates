import React from "react";
import WorkshopCard from "./WorkshopCard";

const WorkshopBlock = ({ 
    blockName, 
    workshops, 
    selectedWorkshop, 
    onWorkshopSelect,
    isDisabled = false
}) => {
    // Block metadata including display label and schedule time
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
    return (
        <div className="space-y-4">
            <div className="space-y-1 text-center mb-6">
                <h2 className="text-xl md:text-3xl font-bold text-gray-800">
                    {blockInfo[blockName]?.label || blockName}
                </h2>
                {blockInfo[blockName]?.time && (
                    <p className="text-lg text-gray-600">
                        ({blockInfo[blockName].time})
                    </p>
                )}
                {!selectedWorkshop && !isDisabled && (
                  <div className="mt-3">
                    <span className="inline-block text-red-500 font-bold text-3xl tracking-wide uppercase">
                        Pick One
                    </span>
                  </div>
                )}
                {isDisabled && (
                  <div className="mt-3">
                    <span className="inline-block text-blue-500 font-bold text-lg tracking-wide">
                        Full afternoon session selected - this block is now full
                    </span>
                  </div>
                )}
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {workshops.map((workshop) => (
                    <WorkshopCard
                        key={workshop.id}
                        workshop={workshop}
                        blockName={blockName}
                        isSelected={selectedWorkshop === workshop.id}
                        onSelect={onWorkshopSelect}
                        isDisabled={isDisabled}
                    />
                ))}
            </div>
        </div>
    );
};

export default WorkshopBlock;
