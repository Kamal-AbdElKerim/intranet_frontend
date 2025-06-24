import { useState } from 'react';
import PropTypes from 'prop-types';

// ReturnMessageModal component
const ReturnMessageModal = ({ isOpen, onClose, message }) => {
  if (!isOpen) return null;
  

  return (
    <div className="fixed inset-0 z-[70] overflow-y-auto">
      <div className="flex min-h-screen items-center justify-center px-4 pt-4 pb-20 text-center sm:block sm:p-0">
        {/* Background overlay */}
        <div className="fixed inset-0 transition-opacity" aria-hidden="true">
          <div className="absolute inset-0 bg-gray-500 opacity-75 dark:bg-gray-900/90"></div>
        </div>

        {/* Modal panel */}
        <div className="inline-block align-bottom rounded-xl bg-white dark:bg-gray-800 text-left shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-2xl w-full">
          <div className="flex flex-col bg-white dark:bg-gray-800 rounded-xl">
            <div className="flex items-center justify-between border-b border-gray-200 dark:border-gray-700 px-4 py-3">
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 rounded-full bg-orange-500/10 flex items-center justify-center">
                  <i className="ri-message-3-line text-lg text-orange-500"></i>
                </div>
                <h3 className="text-base font-semibold text-gray-800 dark:text-white">
                  Message de Retour
                </h3>
              </div>
              <button 
                onClick={onClose}
                className="text-gray-400 hover:text-gray-500 dark:text-gray-600 dark:hover:text-gray-400"
              >
                <span className="sr-only">Fermer</span>
                <i className="ri-close-line text-xl"></i>
              </button>
            </div>
            <div className="max-h-[60vh] overflow-y-auto custom-scrollbar p-6">
              <div className="prose prose-sm dark:prose-invert max-w-none" dangerouslySetInnerHTML={{ __html: message }} />
            </div>
            <div className="border-t border-gray-200 dark:border-gray-700 px-4 py-3 sm:flex sm:flex-row-reverse">
              <button
                type="button"
                className="ti-btn ti-btn-danger !font-medium !rounded-full px-6 py-2.5"
                onClick={onClose}
              >
                <span className="flex items-center">
                  <i className="ri-close-line me-2"></i>
                  Fermer
                </span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const ValidationModal = ({ isOpen, onClose, validations = [] }) => {
    const [showReturnMessage, setShowReturnMessage] = useState(false);
    const [selectedMessage, setSelectedMessage] = useState('');
  
    if (!isOpen) return null;
  
    // Ensure validations is an array and filter out any null entries
    const validationsArray = Array.isArray(validations) ? validations : [];
    
    // Sort validations by validation date in descending order (newest first)
    const sortedValidations = [...validationsArray]
      .filter(validation => validation) // Filter out null/undefined entries
      .sort((a, b) => 
        new Date(b.validated_at || Date.now()) - new Date(a.validated_at || Date.now())
      );
  
    const handleShowMessage = (message) => {
      setSelectedMessage(message);
      setShowReturnMessage(true);
    };
  
    return (
      <>
        <div 
          className="fixed inset-0 z-[60] overflow-y-auto"
          aria-labelledby="modal-title" 
          role="dialog" 
          aria-modal="true"
        >
          <div className="flex min-h-screen items-end justify-center px-4 pt-4 pb-20 text-center sm:block sm:p-0">
            {/* Background overlay */}
            <div 
              className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity ease-out duration-300" 
              onClick={onClose}
              aria-hidden="true"
            ></div>
  
            {/* Modal positioning */}
            <span className="hidden sm:inline-block sm:h-screen sm:align-middle" aria-hidden="true">&#8203;</span>
  
            {/* Modal content */}
            <div 
              className="relative inline-block transform overflow-hidden rounded-lg bg-white text-left align-bottom shadow-xl transition-all duration-300 ease-out sm:my-8 sm:w-full sm:max-w-2xl sm:align-middle dark:bg-gray-800 animate-modal-show"
              style={{
                animation: 'modalShow 0.3s ease-out'
              }}
            >
              <style>{`
                @keyframes modalShow {
                  from {
                    opacity: 0;
                    transform: scale(0.95) translateY(10px);
                  }
                  to {
                    opacity: 1;
                    transform: scale(1) translateY(0);
                  }
                }
              `}</style>
  
              {/* Modal Header */}
              <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4 dark:bg-gray-800">
                <div className="sm:flex sm:items-start">
                  <div className="mt-3 text-center sm:mt-0 sm:text-left w-full">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-lg font-medium leading-6 text-gray-900 dark:text-white flex items-center">
                        <i className="ri-shield-check-line mr-2 text-primary"></i>
                        Circuit de validation
                      </h3>
                      <button 
                        onClick={onClose}
                        className="text-gray-400 hover:text-gray-500 dark:text-gray-500 dark:hover:text-gray-400 transition-colors"
                      >
                        <i className="ri-close-line text-2xl"></i>
                      </button>
                    </div>
  
                    {/* Validation Info */}
                    <div className="mt-4">
                      {sortedValidations && sortedValidations.length > 0 ? (
                        <div className="relative pb-8">
                          {/* Timeline Line */}
                          <div className="absolute left-6 top-0 h-full w-0.5 bg-gray-200 dark:bg-gray-700"></div>
  
                          {sortedValidations.map((validation, index) => (
                            <div key={validation.id} className="relative mb-8 last:mb-0">
                              {/* Timeline Dot */}
                              <div className={`absolute left-4 -translate-x-1/2 w-4 h-4 rounded-full border-2 ${
                                validation.status === 'Approuvé'
                                  ? 'bg-primary border-primary'
                                  : validation.status === 'Traité'
                                    ? 'bg-success border-success'
                                    : validation.status === 'En attente'
                                      ? 'bg-warning border-warning'
                                      : 'bg-danger border-danger'
                              }`}></div>
  
                              {/* Content */}
                              <div className="ml-10 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4">
                                <div className="flex items-start justify-between">
                                  <div className="space-y-1">
                                    <div className="flex items-center gap-2">
                                      <span className="font-medium text-gray-900 dark:text-white">
                                        {validation.validator?.name || 'Validateur non spécifié'}
                                      </span>
                                      <span className={`badge !rounded-full text-xs ${
                                        validation.status === 'Approuvé'
                                          ? 'bg-primary/20 text-primary'
                                          : validation.status === 'Traité'
                                            ? 'bg-success/20 text-success'
                                            : validation.status === 'En attente'
                                              ? 'bg-warning/20 text-warning'
                                              : validation.status === 'Retourné'
                                                ? 'bg-danger/20 text-danger border border-danger/30'
                                                : 'bg-danger/20 text-danger'
                                      }`}>
                                        <i className={`ri-${
                                          validation.status === 'Approuvé'
                                            ? 'check'
                                            : validation.status === 'Traité'
                                              ? 'check'
                                              : validation.status === 'En attente'
                                                ? 'time'
                                                : validation.status === 'Retourné'
                                                  ? 'arrow-go-back'
                                                  : 'close'
                                        }-line me-1`}></i>
                                        {validation.status}
                                      </span>
                                    </div>
                                    <div className="flex items-center text-sm text-gray-500 dark:text-gray-400">
                                      <i className="ri-briefcase-line mr-2"></i>
                                      <span>{validation.role || 'Rôle non spécifié'}</span>
                                    </div>
                                    <div className="flex items-center text-xs text-gray-500 dark:text-gray-400">
                                      <i className="ri-time-line mr-2"></i>
                                      <span>
                                        {new Date(validation.validated_at).toLocaleDateString('fr-FR', {
                                          day: '2-digit',
                                          month: '2-digit',
                                          year: 'numeric',
                                          hour: '2-digit',
                                          minute: '2-digit'
                                        })}
                                      </span>
                                    </div>
                                    {validation.status === 'Retourné' && validation.message && (
                                      <div className="mt-3">
                                        <button 
                                          type="button" 
                                          onClick={() => handleShowMessage(validation.message)}
                                          className="ti-btn ti-btn-outline-warning !py-1 !px-3 !text-xs !rounded-full relative hover:!bg-warning hover:!text-white transition-all duration-200"
                                        >
                                          <i className="ri-message-3-line me-1.5"></i>
                                          Voir le message
                                          <span className="absolute -top-1.5 -end-2 w-5 h-5 flex items-center justify-center rounded-full bg-warning text-[10px] text-white shadow-sm">
                                            1
                                          </span>
                                        </button>
                                      </div>
                                    )}
                                  </div>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="text-center py-6">
                          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-gray-100 dark:bg-gray-700">
                            <i className="ri-file-list-3-line text-xl text-gray-500 dark:text-gray-400"></i>
                          </div>
                          <p className="mt-3 text-sm text-gray-500 dark:text-gray-400">Aucune validation trouvée</p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
  
              {/* Modal Footer */}
              <div className="bg-gray-50 dark:bg-gray-700/50 px-4 py-3 sm:flex sm:flex-row-reverse sm:px-6">
                <button
                  type="button"
                  onClick={onClose}
                  className="mt-3 inline-flex w-full justify-center rounded-md bg-white dark:bg-gray-800 px-3 py-2 text-sm font-semibold text-gray-900 dark:text-white shadow-sm ring-1 ring-inset ring-gray-300 dark:ring-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700 sm:mt-0 sm:w-auto"
                >
                  <i className="ri-close-line mr-2"></i>
                  Fermer
                </button>
              </div>
            </div>
          </div>
        </div>
  
        {/* Return Message Modal */}
        <ReturnMessageModal
          isOpen={showReturnMessage}
          onClose={() => setShowReturnMessage(false)}
          message={selectedMessage}
        />
      </>
    );
  };

ValidationModal.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  validations: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
      status: PropTypes.string,
      validated_at: PropTypes.string,
      message: PropTypes.string,
      validator: PropTypes.shape({
        name: PropTypes.string,
      }),
      role: PropTypes.string,
    })
  ),
};

export default ValidationModal;