import React from "react";
import WorkshopCard from "./WorkshopCard";

const WorkshopBlock = ({ 
    blockName, 
    workshops, 
    selectedWorkshop, 
    onWorkshopSelect 
}) => {
    return (
        <div className="space-y-4">
            <h2 className="text-xl md:text-2xl font-bold text-center text-gray-800 mb-6">
                {blockName}
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
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
