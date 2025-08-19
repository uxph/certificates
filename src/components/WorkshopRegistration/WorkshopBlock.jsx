import React from "react";
import WorkshopCard from "./WorkshopCard";

const WorkshopBlock = ({ 
    blockName, 
    workshops, 
    selectedWorkshop, 
    onWorkshopSelect 
}) => {
    // Block metadata including display label and schedule time
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
                {!selectedWorkshop && (
                  <div className="mt-3">
                    <span className="inline-block text-red-500 font-bold text-3xl tracking-wide uppercase">
                        Pick One
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
                    />
                ))}
            </div>
        </div>
    );
};

export default WorkshopBlock;
