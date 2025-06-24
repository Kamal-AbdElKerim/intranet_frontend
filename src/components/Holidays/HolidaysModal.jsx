import React from 'react';
import Holidays from './Holidays';

const HolidaysModal = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Overlay with blur and fade-in */}
      <div className="fixed inset-0 bg-black/40 backdrop-blur-sm transition-opacity animate-fadeIn" aria-hidden="true"></div>

      {/* Modal container with scale/fade-in animation */}
      <div className="relative z-10 w-full max-w-3xl mx-auto my-8">
        <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-2xl overflow-hidden transform transition-all animate-scaleIn">
          {/* Modal header */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 dark:border-gray-700 bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm">
            <h3 className="text-lg font-semibold text-gray-800 dark:text-white">Gérer les jours fériés</h3>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-700 dark:hover:text-white transition-colors rounded-full p-2 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
              aria-label="Fermer le modal"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          {/* Modal content */}
          <div className="p-6 bg-white dark:bg-gray-900">
            <Holidays onClose={onClose} />
          </div>
        </div>
      </div>

      {/* Animations */}
      <style>{`
        .animate-fadeIn {
          animation: fadeIn 0.3s ease;
        }
        .animate-scaleIn {
          animation: scaleIn 0.3s cubic-bezier(0.4,0,0.2,1);
        }
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes scaleIn {
          from { opacity: 0; transform: scale(0.95); }
          to { opacity: 1; transform: scale(1); }
        }
      `}</style>
    </div>
  );
};

export default HolidaysModal; 