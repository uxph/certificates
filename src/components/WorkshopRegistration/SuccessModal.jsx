import React from "react";

const SuccessModal = ({ isOpen, onClose, attendeeName, selectedWorkshops, workshopBlocks }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6 relative">
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 text-2xl font-bold"
        >
          ×
        </button>

        {/* Success content */}
        <div className="text-center">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg
              className="w-8 h-8 text-green-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M5 13l4 4L19 7"
              />
            </svg>
          </div>

          <h2 className="text-2xl font-bold text-gray-900 mb-2">YOU'RE IN!</h2>

          {attendeeName && (
            <p className="text-lg text-gray-700 mb-6">
              Welcome, <span className="font-semibold">{attendeeName}</span>!
            </p>
          )}

          {/* Workshop Selections */}
          <div className="text-left mb-6">
            <h3 className="font-semibold text-gray-900 mb-3 text-center">
              Your Workshops:
            </h3>
            <div className="space-y-3">
              {/* Special handling for dvo-a-4 which takes up both blocks */}
              {selectedWorkshops.blockA === "dvo-a-4" || selectedWorkshops.blockB === "dvo-a-4" ? (
                (() => {
                  const dvoA4Workshop = workshopBlocks.blockA?.find(w => w.id === "dvo-a-4") || 
                                        workshopBlocks.blockB?.find(w => w.id === "dvo-a-4");
                  return (
                    <div className="border border-green-200 rounded p-3 bg-green-50">
                      <p className="font-semibold text-gray-800 mb-1 text-sm">
                        Full Afternoon Session (1:40 PM - 4:25 PM)
                      </p>
                      {dvoA4Workshop && (
                        <>
                          <p className="text-green-700 font-bold text-base">
                            {dvoA4Workshop.title}
                          </p>
                          <p className="text-gray-600 text-sm">
                            {dvoA4Workshop.speaker}
                          </p>
                          {dvoA4Workshop.room && (
                            <p className="text-xs text-gray-500">
                              Venue: {dvoA4Workshop.room}
                            </p>
                          )}
                        </>
                      )}
                    </div>
                  );
                })()
              ) : (
                Object.entries(selectedWorkshops).map(([blockName, workshopId]) => {
                  const selectedWorkshop = workshopBlocks[blockName]?.find(
                    (w) => w.id === workshopId
                  );
                  const blockInfo = {
                    blockA: { label: 'Block A', time: '1:40 PM - 2:55 PM' },
                    blockB: { label: 'Block B', time: '3:10 PM - 4:25 PM' }
                  };
                  const blockLabel = `${blockInfo[blockName]?.label} (${blockInfo[blockName]?.time})`;
                  
                  return (
                    <div key={blockName} className="border border-green-200 rounded p-3 bg-green-50">
                      <p className="font-semibold text-gray-800 mb-1 text-sm">
                        {blockLabel}
                      </p>
                      {selectedWorkshop && (
                        <>
                          <p className="text-green-700 font-bold text-base">
                            {selectedWorkshop.title}
                          </p>
                          <p className="text-gray-600 text-sm">
                            {selectedWorkshop.speaker}
                          </p>
                          {selectedWorkshop.room && (
                            <p className="text-xs text-gray-500">
                              Venue: {selectedWorkshop.room}
                            </p>
                          )}
                        </>
                      )}
                    </div>
                  );
                })
              )}
            </div>
          </div>

          <div className="text-left">
            <h3 className="font-semibold text-gray-900 mb-3 text-center">
              Reminders:
            </h3>
            <ul className="space-y-2 text-gray-700">
              <li className="flex items-start">⏰ Please arrive on time</li>
              <li className="flex items-start">
                🔄 Do not swap around
              </li>
              <li className="flex items-start">
                📒 Bring required materials (if listed)
              </li>
              <li className="flex items-start">
                ✅ Follow other event guidelines
              </li>
            </ul>
          </div>

          <div className="mt-6">
            <button
              onClick={onClose}
              className="w-full text-white py-2 px-4 rounded-md font-semibold bg-main transition-colors"
              // style={{ backgroundColor: 'var(--color-main)' }}
            >
              Got it!
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SuccessModal;
