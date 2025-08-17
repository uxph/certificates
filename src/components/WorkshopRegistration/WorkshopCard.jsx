import React from "react";

const WorkshopCard = ({ 
    workshop, 
    blockName, 
    isSelected, 
    onSelect 
}) => {
    const handleClick = () => {
        if (workshop.slotsLeft > 0) {
            onSelect(workshop.id);
        }
    };

    return (
        <div 
            className={`border rounded-lg p-4 cursor-pointer transition-all duration-200 relative ${
                isSelected 
                    ? 'border-[#1b50d8] bg-[#1b50d8]/10' 
                    : 'border-gray-600 hover:border-gray-500'
            } ${workshop.slotsLeft === 0 ? 'opacity-60 cursor-not-allowed' : ''}`}
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
                    className="mt-1 w-4 h-4 text-[#1b50d8] bg-gray-800 border-gray-600 focus:ring-[#1b50d8] disabled:opacity-50 disabled:cursor-not-allowed"
                />
                <div className="flex-1">
                    <h3 className="text-base md:text-lg font-semibold mb-2 text-white">
                        {workshop.title}
                    </h3>
                    <p className="text-gray-300 text-sm mb-3">
                        {workshop.description}
                    </p>
                    
                    <div className="flex items-center space-x-3">
                        <div className="w-8 h-8 bg-[#1b50d8] rounded-full flex items-center justify-center">
                            <span className="text-white font-semibold text-xs">
                                {workshop.speaker.split(' ').map(n => n[0]).join('')}
                            </span>
                        </div>
                        <div className="flex-1">
                            <p className="font-semibold text-[#1b50d8] text-sm">{workshop.speaker}</p>
                            <p className="text-xs text-gray-400">{workshop.role}</p>
                        </div>
                    </div>
                    
                    {/* Slots Left Indicator */}
                    <div className="mt-3 pt-2 border-t border-gray-600">
                        <div className="flex items-center justify-between">
                            <span className="text-xs text-gray-400">Slots available:</span>
                            <div className={`px-2 py-1 rounded text-xs font-semibold ${
                                workshop.slotsLeft === 0 
                                    ? 'bg-red-500/20 text-red-400 border border-red-500/30' 
                                    : workshop.slotsLeft <= 5 
                                        ? 'bg-yellow-500/20 text-yellow-400 border border-yellow-500/30'
                                        : 'bg-green-500/20 text-green-400 border border-green-500/30'
                            }`}>
                                {workshop.slotsLeft === 0 ? 'FULL' : `${workshop.slotsLeft} left`}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default WorkshopCard;
