import React from "react";

const ConfirmationModal = ({ isOpen, onClose, onConfirm, workshopTitle, speaker }) => {
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

        {/* Warning content */}
        <div className="text-center">
          <div className="w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg
              className="w-8 h-8 text-yellow-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z"
              />
            </svg>
          </div>

          <h2 className="text-xl font-bold text-gray-900 mb-3">Important Notice</h2>

          <div className="text-left mb-6">
            <div className="border border-yellow-200 rounded p-3 bg-yellow-50 mb-4">
              <p className="text-yellow-800 font-semibold text-base mb-2">
                {workshopTitle}
              </p>
              <p className="text-yellow-700 text-sm">{speaker}</p>
            </div>
            
            <p className="text-gray-700 text-sm leading-relaxed border-l-4 border-yellow-500 pl-3 py-2 bg-yellow-50 rounded-r">
              This workshop requires both A and B slots (1:40 PM - 4:25 PM). You cannot transfer to a separate workshop or join halfway through by selecting this.
            </p>
          </div>

          <div className="flex gap-3">
            <button
              onClick={onClose}
              className="flex-1 py-2 px-4 border border-gray-300 rounded-md font-semibold text-gray-700 hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={onConfirm}
              className="flex-1 py-2 px-4 rounded-md font-semibold text-white bg-main hover:bg-main/90 transition-colors"
            >
              I understand
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ConfirmationModal;
