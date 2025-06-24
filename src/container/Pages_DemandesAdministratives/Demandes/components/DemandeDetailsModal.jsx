import React, { useEffect, useState } from 'react';
import { calculateWorkingDays, calculateTotalDays } from '../../../../utils/dateUtils';
import axiosInstance from '../../../../Interceptor/axiosInstance';

// Custom CSS styles for solde validation
const customStyles = `
  .solde-insufficient {
    color: #dc2626 !important;
  }
  
  .solde-sufficient {
    color: #16a34a !important;
  }
  
  .solde-insufficient-dark {
    color: #f87171 !important;
  }
  
  .solde-sufficient-dark {
    color: #4ade80 !important;
  }
  
  .warning-message {
    background-color: #fef2f2;
    border: 1px solid #fecaca;
    border-radius: 8px;
    padding: 8px;
    margin-top: 8px;
  }
  
  .warning-message-dark {
    background-color: rgba(239, 68, 68, 0.1);
    border: 1px solid rgba(239, 68, 68, 0.3);
    border-radius: 8px;
    padding: 8px;
    margin-top: 8px;
  }
  
  .success-message {
    background-color: #f0fdf4;
    border: 1px solid #bbf7d0;
    border-radius: 8px;
    padding: 8px;
    margin-top: 8px;
  }
  
  .success-message-dark {
    background-color: rgba(34, 197, 94, 0.1);
    border: 1px solid rgba(34, 197, 94, 0.3);
    border-radius: 8px;
    padding: 8px;
    margin-top: 8px;
  }
  
  .warning-icon {
    color: #dc2626;
  }
  
  .warning-icon-dark {
    color: #f87171;
  }
  
  .success-icon {
    color: #16a34a;
  }
  
  .success-icon-dark {
    color: #4ade80;
  }
  
  .warning-text {
    color: #dc2626;
    font-weight: 500;
    font-size: 14px;
  }
  
  .warning-text-dark {
    color: #f87171;
    font-weight: 500;
    font-size: 14px;
  }
  
  .success-text {
    color: #16a34a;
    font-weight: 500;
    font-size: 14px;
  }
  
  .success-text-dark {
    color: #4ade80;
    font-weight: 500;
    font-size: 14px;
  }
  
  .warning-color {
    color: #d97706 !important;
  }
  
  .warning-color-dark {
    color: #fbbf24 !important;
  }
  
  .success-color {
    color: #059669 !important;
  }
  
  .success-color-dark {
    color: #34d399 !important;
  }
`;

// Helper function to get max days for special leave types
const getMaxDaysForSpecialLeave = (natureConge) => {
  const maxDaysMap = {
    'Congé pour mariage': 4,
    'Congé pour naissance': 3,
    'Congé pour décès d\'un proche': 3,
    'Congé pour circoncision': 2,
    'Congé de maternité': 98,
    'Congé pour pèlerinage': 30,
    'Congé pour Hospitalisation': 3
  };
  return maxDaysMap[natureConge] || null;
};

const DemandeDetailsModal = ({ selectedDemande }) => {
  const [files, setFiles] = useState([]);
  const [loading, setLoading] = useState(false);

  // Inject custom CSS
  useEffect(() => {
    const styleElement = document.createElement('style');
    styleElement.textContent = customStyles;
    document.head.appendChild(styleElement);

    return () => {
      document.head.removeChild(styleElement);
    };
  }, []);

  // Check if dark mode is active
  const isDarkMode = document.documentElement.classList.contains('dark');

  useEffect(() => {
    if (selectedDemande?.id) {
      fetchFiles();
    }
  }, [selectedDemande]);

  const fetchFiles = async () => {
    try {
      setLoading(true);
      const response = await axiosInstance.get(`/demandes/${selectedDemande.id}/files`);
      setFiles(response.data.data || []);
    } catch (error) {
      // console.error('Error fetching files:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = async (fileId, fileName) => {
    try {
      const response = await axiosInstance.get(`/demande-files/${fileId}/download`, {
        responseType: 'blob'
      });
      
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', fileName);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      // console.error('Error downloading file:', error);
    }
  };

  const handleFilesClick = async () => {
    await fetchFiles(); // Refresh files data
    const viewModal = document.querySelector('#hs-view-demande-modal');
    const filesModal = document.querySelector('#hs-files-modal');
    if (viewModal && filesModal) {
      const HSOverlay = window.HSOverlay;
      if (HSOverlay) {
        HSOverlay.close(viewModal);
        setTimeout(() => {
          HSOverlay.open(filesModal);
        }, 100);
      }
    }
  };

  // Add useEffect for modal initialization
  useEffect(() => {
    const initModals = async () => {
      try {
        const { HSOverlay } = await import('preline');
        HSOverlay.init();
      } catch (error) {
        // console.error('Error initializing modals:', error);
      }
    };
    
    initModals();
  }, []);

  // Add this new function to handle modal transitions
  const handleModalTransition = () => {
    const fullMessageModal = document.querySelector('#hs-full-message-modal');
    const viewDemandeModal = document.querySelector('#hs-view-demande-modal');
    
    if (fullMessageModal && viewDemandeModal) {
      const HSOverlay = window.HSOverlay;
      if (HSOverlay) {
        HSOverlay.close(fullMessageModal);
        
        // Small delay to ensure smooth transition
        setTimeout(() => {
          HSOverlay.open(viewDemandeModal);
        }, 100);
      }
    }
  };

  const handleInterimClick = () => {
    const viewModal = document.querySelector('#hs-view-demande-modal');
    const interimModal = document.querySelector('#hs-interim-modal');
    if (viewModal && interimModal) {
      const HSOverlay = window.HSOverlay;
      if (HSOverlay) {
        HSOverlay.close(viewModal);
        setTimeout(() => {
          HSOverlay.open(interimModal);
        }, 100);
      }
    }
  };

  const handleMotifClick = () => {
    const viewModal = document.querySelector('#hs-view-demande-modal');
    const motifModal = document.querySelector('#hs-motif-modal');
    if (viewModal && motifModal) {
      const HSOverlay = window.HSOverlay;
      if (HSOverlay) {
        HSOverlay.close(viewModal);
        setTimeout(() => {
          HSOverlay.open(motifModal);
        }, 100);
      }
    }
  };

  return (
    <>
      {/* Full Message Modal */}
      <div id="hs-full-message-modal" className="hs-overlay hidden ti-modal">
        <div className="hs-overlay-open:mt-7 ti-modal-box mt-0 ease-out h-[calc(100%-3.5rem)] max-h-full w-full sm:w-[600px] sm:max-w-[600px] mx-auto">
          <div className="ti-modal-content h-full flex flex-col bg-white dark:bg-gray-800 shadow-xl rounded-xl">
            <div className="ti-modal-header sticky top-0 z-50 flex items-center justify-between border-b border-gray-200 dark:border-gray-700 px-6 py-4 bg-white dark:bg-gray-800">
              <div className="flex items-center">
                <div className="w-10 h-10 rounded-full bg-teal-100 dark:bg-teal-900/30 flex items-center justify-center">
                  <i className="ri-message-3-line text-xl text-teal-600 dark:text-teal-400"></i>
                </div>
                <h3 className="ml-3 text-lg font-semibold text-gray-800 dark:text-white">
                  Message Complet
                </h3>
              </div>
              <button 
                type="button" 
                className="hs-dropdown-toggle ti-modal-close-btn"
                onClick={handleModalTransition}
              >
                <span className="sr-only">Fermer</span>
                <i className="ri-close-line text-xl"></i>
              </button>
            </div>
            <div className="ti-modal-body p-6 overflow-y-auto flex-1 custom-scrollbar">
              {selectedDemande && (
                <div className="prose prose-lg max-w-none text-gray-900 dark:text-white"
                     dangerouslySetInnerHTML={{ __html: selectedDemande.message }} />
              )}
            </div>
            <div className="ti-modal-footer sticky bottom-0 z-50 flex justify-end gap-3 bg-gray-50 dark:bg-gray-700/50 px-6 py-4 border-t border-gray-200 dark:border-gray-700">
              <button
                type="button"
                className="ti-btn ti-btn-danger !font-medium !rounded-full px-6 py-2.5 transition-all duration-300 hover:bg-danger/80 hover:shadow-lg hover:shadow-danger/30 focus:ring-2 focus:ring-danger/30 active:bg-danger/90"
                onClick={handleModalTransition}
              >
                <span className="flex items-center">
                  <i className="ri-arrow-left-line me-2"></i>
                  Retour
                </span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Motif Modal */}
      <div id="hs-motif-modal" className="hs-overlay hidden ti-modal">
        <div className="hs-overlay-open:mt-7 ti-modal-box mt-0 ease-out h-[calc(100%-3.5rem)] max-h-full w-full sm:w-[600px] sm:max-w-[600px] mx-auto">
          <div className="ti-modal-content h-full flex flex-col bg-white dark:bg-gray-800 shadow-xl rounded-xl">
            <div className="ti-modal-header sticky top-0 z-50 flex items-center justify-between border-b border-gray-200 dark:border-gray-700 px-6 py-4 bg-white dark:bg-gray-800">
              <div className="flex items-center">
                <div className="w-10 h-10 rounded-full bg-yellow-100 dark:bg-yellow-900/30 flex items-center justify-center">
                  <i className="ri-file-text-line text-xl text-yellow-600 dark:text-yellow-400"></i>
                </div>
                <h3 className="ml-3 text-lg font-semibold text-gray-800 dark:text-white">
                  Motif du congé
                </h3>
              </div>
              <button 
                type="button" 
                className="hs-dropdown-toggle ti-modal-close-btn"
                onClick={() => {
                  const motifModal = document.querySelector('#hs-motif-modal');
                  const viewModal = document.querySelector('#hs-view-demande-modal');
                  if (motifModal && viewModal) {
                    const HSOverlay = window.HSOverlay;
                    if (HSOverlay) {
                      HSOverlay.close(motifModal);
                      setTimeout(() => {
                        HSOverlay.open(viewModal);
                      }, 100);
                    }
                  }
                }}
              >
                <span className="sr-only">Fermer</span>
                <i className="ri-close-line text-xl"></i>
              </button>
            </div>
            <div className="ti-modal-body p-6 overflow-y-auto flex-1 custom-scrollbar">
              {selectedDemande && (
                <div className="prose prose-lg max-w-none text-gray-900 dark:text-white">
                  {selectedDemande.motif_conge || 'Non spécifié'}
                </div>
              )}
            </div>
            <div className="ti-modal-footer sticky bottom-0 z-50 flex justify-end gap-3 bg-gray-50 dark:bg-gray-700/50 px-6 py-4 border-t border-gray-200 dark:border-gray-700">
              <button
                type="button"
                className="ti-btn ti-btn-danger !font-medium !rounded-full px-6 py-2.5"
                onClick={() => {
                  const motifModal = document.querySelector('#hs-motif-modal');
                  const viewModal = document.querySelector('#hs-view-demande-modal');
                  if (motifModal && viewModal) {
                    const HSOverlay = window.HSOverlay;
                    if (HSOverlay) {
                      HSOverlay.close(motifModal);
                      setTimeout(() => {
                        HSOverlay.open(viewModal);
                      }, 100);
                    }
                  }
                }}
              >
                <span className="flex items-center">
                  <i className="ri-arrow-left-line me-2"></i>
                  Retour
                </span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Interim Modal */}
      <div id="hs-interim-modal" className="hs-overlay hidden ti-modal">
        <div className="hs-overlay-open:mt-7 ti-modal-box mt-0 ease-out h-[calc(100%-3.5rem)] max-h-full w-full sm:w-[600px] sm:max-w-[600px] mx-auto">
          <div className="ti-modal-content h-full flex flex-col bg-white dark:bg-gray-800 shadow-xl rounded-xl">
            <div className="ti-modal-header sticky top-0 z-50 flex items-center justify-between border-b border-gray-200 dark:border-gray-700 px-6 py-4 bg-white dark:bg-gray-800">
              <div className="flex items-center">
                <div className="w-10 h-10 rounded-full bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center">
                  <i className="ri-user-follow-line text-xl text-purple-600 dark:text-purple-400"></i>
                </div>
                <h3 className="ml-3 text-lg font-semibold text-gray-800 dark:text-white">
                  Intérimaire Proposé
                </h3>
              </div>
              <button 
                type="button" 
                className="hs-dropdown-toggle ti-modal-close-btn"
                onClick={() => {
                  const interimModal = document.querySelector('#hs-interim-modal');
                  const viewModal = document.querySelector('#hs-view-demande-modal');
                  if (interimModal && viewModal) {
                    const HSOverlay = window.HSOverlay;
                    if (HSOverlay) {
                      HSOverlay.close(interimModal);
                      setTimeout(() => {
                        HSOverlay.open(viewModal);
                      }, 100);
                    }
                  }
                }}
              >
                <span className="sr-only">Fermer</span>
                <i className="ri-close-line text-xl"></i>
              </button>
            </div>
            <div className="ti-modal-body p-6 overflow-y-auto flex-1 custom-scrollbar">
              {selectedDemande && (
                <div className="prose prose-lg max-w-none text-gray-900 dark:text-white">
                  {selectedDemande.interim || 'Non spécifié'}
                </div>
              )}
            </div>
            <div className="ti-modal-footer sticky bottom-0 z-50 flex justify-end gap-3 bg-gray-50 dark:bg-gray-700/50 px-6 py-4 border-t border-gray-200 dark:border-gray-700">
              <button
                type="button"
                className="ti-btn ti-btn-danger !font-medium !rounded-full px-6 py-2.5"
                onClick={() => {
                  const interimModal = document.querySelector('#hs-interim-modal');
                  const viewModal = document.querySelector('#hs-view-demande-modal');
                  if (interimModal && viewModal) {
                    const HSOverlay = window.HSOverlay;
                    if (HSOverlay) {
                      HSOverlay.close(interimModal);
                      setTimeout(() => {
                        HSOverlay.open(viewModal);
                      }, 100);
                    }
                  }
                }}
              >
                <span className="flex items-center">
                  <i className="ri-arrow-left-line me-2"></i>
                  Retour
                </span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Files Modal */}
      <div id="hs-files-modal" className="hs-overlay hidden ti-modal">
        <div className="hs-overlay-open:mt-7 ti-modal-box mt-0 ease-out h-[calc(100%-3.5rem)] max-h-full w-full sm:w-[600px] sm:max-w-[600px] mx-auto">
          <div className="ti-modal-content h-full flex flex-col bg-white dark:bg-gray-800 shadow-xl rounded-xl">
            <div className="ti-modal-header sticky top-0 z-50 flex items-center justify-between border-b border-gray-200 dark:border-gray-700 px-6 py-4 bg-white dark:bg-gray-800">
              <div className="flex items-center">
                <div className="w-10 h-10 rounded-full bg-indigo-100 dark:bg-indigo-900/30 flex items-center justify-center">
                  <i className="ri-file-list-3-line text-xl text-indigo-600 dark:text-indigo-400"></i>
                </div>
                <h3 className="ml-3 text-lg font-semibold text-gray-800 dark:text-white">
                  Fichiers Attachés
                </h3>
              </div>
              <button 
                type="button" 
                className="hs-dropdown-toggle ti-modal-close-btn"
                onClick={() => {
                  const filesModal = document.querySelector('#hs-files-modal');
                  const viewModal = document.querySelector('#hs-view-demande-modal');
                  if (filesModal && viewModal) {
                    const HSOverlay = window.HSOverlay;
                    if (HSOverlay) {
                      HSOverlay.close(filesModal);
                      setTimeout(() => {
                        HSOverlay.open(viewModal);
                      }, 100);
                    }
                  }
                }}
              >
                <span className="sr-only">Fermer</span>
                <i className="ri-close-line text-xl"></i>
              </button>
            </div>
            <div className="ti-modal-body p-6 overflow-y-auto flex-1 custom-scrollbar">
              {loading ? (
                <div className="flex items-center justify-center h-40">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                </div>
              ) : files.length > 0 ? (
                <div className="space-y-4">
                  {files.map((file) => (
                    <div key={file.id} className="flex items-center justify-between p-4 bg-gray-50 dark:bg-black/20 rounded-xl hover:bg-gray-100 dark:hover:bg-black/30 transition-colors">
                      <div className="flex items-center space-x-3 min-w-0">
                        <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                          <i className="ri-file-line text-xl text-primary"></i>
                        </div>
                        <div className="min-w-0">
                          <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                            {file.file_name}
                          </p>
                          <p className="text-xs text-gray-500 dark:text-gray-400">
                            {(file.file_size / 1024).toFixed(2)} KB
                          </p>
                        </div>
                      </div>
                      <button
                        onClick={() => handleDownload(file.id, file.file_name)}
                        className="ti-btn ti-btn-primary !rounded-full !py-2 !px-3 transition-all duration-200 hover:shadow-lg hover:shadow-primary/30"
                      >
                        <i className="ri-download-line"></i>
                      </button>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center h-40 text-gray-500 dark:text-gray-400">
                  <i className="ri-file-warning-line text-4xl mb-2"></i>
                  <p>Aucun fichier attaché</p>
                </div>
              )}
            </div>
            <div className="ti-modal-footer sticky bottom-0 z-50 flex justify-end gap-3 bg-gray-50 dark:bg-gray-700/50 px-6 py-4 border-t border-gray-200 dark:border-gray-700">
              <button
                type="button"
                className="ti-btn ti-btn-danger !font-medium !rounded-full px-6 py-2.5"
                onClick={() => {
                  const filesModal = document.querySelector('#hs-files-modal');
                  const viewModal = document.querySelector('#hs-view-demande-modal');
                  if (filesModal && viewModal) {
                    const HSOverlay = window.HSOverlay;
                    if (HSOverlay) {
                      HSOverlay.close(filesModal);
                      setTimeout(() => {
                        HSOverlay.open(viewModal);
                      }, 100);
                    }
                  }
                }}
              >
                <span className="flex items-center">
                  <i className="ri-arrow-left-line me-2"></i>
                  Retour
                </span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main View Modal */}
      <div id="hs-view-demande-modal" className="hs-overlay hidden ti-modal">
        <style>{`
          /* Custom scrollbar styles */
          .custom-scrollbar::-webkit-scrollbar {
            width: 8px;
          }

          .custom-scrollbar::-webkit-scrollbar-track {
            background: #f1f1f1;
            border-radius: 4px;
          }

          .custom-scrollbar::-webkit-scrollbar-thumb {
            background: #888;
            border-radius: 4px;
          }

          .custom-scrollbar::-webkit-scrollbar-thumb:hover {
            background: #555;
          }

          /* Dark mode scrollbar */
          .dark .custom-scrollbar::-webkit-scrollbar-track {
            background: #2d3748;
          }

          .dark .custom-scrollbar::-webkit-scrollbar-thumb {
            background: #4a5568;
          }

          .dark .custom-scrollbar::-webkit-scrollbar-thumb:hover {
            background: #718096;
          }

          @media (max-width: 640px) {
            .ti-modal-box {
              margin: 0.5rem !important;
              height: calc(100% - 1rem) !important;
              width: calc(100% - 1rem) !important;
            }
          }

          @media (min-width: 641px) and (max-width: 1024px) {
            .ti-modal-box {
              width: 90% !important;
              max-width: 800px !important;
              height: 90vh !important;
            }
          }

          @media (min-width: 1025px) {
            .ti-modal-box {
              width: 80% !important;
              max-width: 1000px !important;
              height: 85vh !important;
            }
          }
        `}</style>

        <div className="hs-overlay-open:mt-7 ti-modal-box mt-0 ease-out mx-auto bg-white dark:bg-gray-800 shadow-xl rounded-2xl">
          <div className="ti-modal-content h-full flex flex-col">
            <div className="ti-modal-header sticky top-0 z-50 flex items-center justify-between border-b border-gray-200 dark:border-gray-700 px-6 py-4 bg-white dark:bg-gray-800">
              <div className="flex items-center">
                <div className="flex-shrink-0 w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                  <i className="ri-file-list-3-line text-xl text-primary"></i>
                </div>
                <div className="ml-4">
                  <h3 className="text-lg font-semibold text-gray-800 dark:text-white">
                    Détails de la Demande
                  </h3>
                  {selectedDemande && (
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      {selectedDemande.nom} {selectedDemande.prenom}
                    </p>
                  )}
                </div>
              </div>
              <button type="button" className="hs-dropdown-toggle ti-modal-close-btn" data-hs-overlay="#hs-view-demande-modal">
                <span className="sr-only">Fermer</span>
                <i className="ri-close-line text-xl"></i>
              </button>
            </div>
            <div className="ti-modal-body custom-scrollbar p-6 overflow-y-auto flex-1 overscroll-contain">
              {selectedDemande && (
                <div className="space-y-4">
                  {/* First Row: Collaborateur and Type de demande */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
                    {/* Collaborateur */}
                    <div className="flex items-start space-x-4 p-4 bg-gray-50 dark:bg-black/20 rounded-xl hover:bg-gray-100 dark:hover:bg-black/30 transition-all duration-200">
                      <div className="w-10 h-10 rounded-full bg-primary/10 flex-shrink-0 flex items-center justify-center">
                        <i className="ri-user-line text-xl text-primary"></i>
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="text-sm font-medium text-gray-500 dark:text-gray-400">Collaborateur</h4>
                        <p className="text-base font-semibold text-gray-900 dark:text-white truncate">
                          {selectedDemande.nom} {selectedDemande.prenom}
                        </p>
                        <div className="flex flex-wrap items-center gap-y-1 gap-x-2 mt-1 text-sm text-gray-600 dark:text-gray-400">
                          <div className="flex items-center">
                            <i className="ri-briefcase-line mr-1"></i>
                            <span className="truncate">{selectedDemande.poste}</span>
                          </div>
                          <span className="hidden sm:inline">•</span>
                          <div className="flex items-center">
                            <i className="ri-building-line mr-1"></i>
                            <span className="truncate">{selectedDemande.bu_direction}</span>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Type de demande */}
                    <div className="flex items-start space-x-4 p-4 bg-gray-50 dark:bg-black/20 rounded-xl hover:bg-gray-100 dark:hover:bg-black/30 transition-all duration-200">
                      <div className="w-10 h-10 rounded-lg bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center flex-shrink-0">
                        <i className="ri-file-list-line text-xl text-blue-600 dark:text-blue-400"></i>
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Type de demande</p>
                        <p className="text-base font-semibold text-gray-900 dark:text-white truncate">{selectedDemande.type_demande}</p>
                      </div>
                    </div>
                  </div>

                  {/* Second Row: Type de document/Type de congé and Période */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
                    {/* Type de congé - Only show for leave requests */}
                    {selectedDemande.type_demande === "Demande de congés" && selectedDemande.type_conge && (
                      <div className="flex items-start space-x-4 p-4 bg-gray-50 dark:bg-black/20 rounded-xl hover:bg-gray-100 dark:hover:bg-black/30 transition-all duration-200">
                        <div className="w-10 h-10 rounded-lg bg-orange-100 dark:bg-orange-900/30 flex items-center justify-center flex-shrink-0">
                          <i className="ri-calendar-event-line text-xl text-orange-600 dark:text-orange-400"></i>
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Type de congé</p>
                          <p className="text-base font-semibold text-gray-900 dark:text-white truncate">{selectedDemande.type_conge}</p>
                          {selectedDemande.nature_conge && (
                            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1 truncate">{selectedDemande.nature_conge}</p>
                          )}
                        </div>
                      </div>
                    )}

                    {/* Période - Only show for non-document requests */}
                    {selectedDemande.type_demande !== "Demande des documents administratifs" && (
                      <div className="flex items-start space-x-4 p-4 bg-gray-50 dark:bg-black/20 rounded-xl hover:bg-gray-100 dark:hover:bg-black/30 transition-all duration-200">
                        <div className="w-10 h-10 rounded-lg bg-green-100 dark:bg-green-900/30 flex items-center justify-center flex-shrink-0">
                          <i className="ri-calendar-line text-xl text-green-600 dark:text-green-400"></i>
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Période</p>
                          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                            Du {new Date(selectedDemande.date_debut).toLocaleDateString()}
                          </p>
                          <p className="text-sm text-gray-600 dark:text-gray-400">
                            Au {new Date(selectedDemande.date_fin).toLocaleDateString()}
                          </p>
                          <p className="text-sm text-primary dark:text-primary mt-2">
                            {selectedDemande.duree} jour(s) ouvrables
                            {/* {calculateWorkingDays(selectedDemande.date_debut, selectedDemande.date_fin, holidays)} jour(s) ouvrables */}
                          </p>
                          <div className="flex items-center gap-2 mt-2">
                            <span className={`text-sm   `}>
                              Solde Disponible Pour {selectedDemande.user?.name} :
                            </span>
                            <span className={`text-base font-semibold ${(selectedDemande.user?.solde || 0) < selectedDemande.duree ? (isDarkMode ? 'solde-insufficient-dark' : 'solde-insufficient') : (isDarkMode ? 'solde-sufficient-dark' : 'solde-sufficient')}`}>
                              {selectedDemande.user?.solde || 0} jours
                            </span>
                          </div>
                          {/* Check for special leave type limits first */}
                          {selectedDemande.type_conge === "Congé spécial" && selectedDemande.nature_conge && (() => {
                            const maxDays = getMaxDaysForSpecialLeave(selectedDemande.nature_conge);
                            const requestedDays = parseInt(selectedDemande.duree) || 0;
                            
                            // console.log('DemandeDetailsModal - Special leave validation:', {
                            //   type: selectedDemande.type_conge,
                            //   nature: selectedDemande.nature_conge,
                            //   maxDays: maxDays,
                            //   requestedDays: requestedDays,
                            //   duree: selectedDemande.duree,
                            //   shouldShowWarning: maxDays && requestedDays > maxDays,
                            //   condition1: selectedDemande.type_conge === "Congé spécial",
                            //   condition2: selectedDemande.nature_conge,
                            //   condition3: maxDays,
                            //   condition4: requestedDays > maxDays
                            // });
                            
                            if (maxDays && requestedDays > maxDays) {
                              // console.log('DemandeDetailsModal - Showing special leave warning');
                              return (
                                <div className={isDarkMode ? 'warning-message-dark' : 'warning-message'}>
                                  <div className="flex items-center gap-2">
                                    <i className={`ri-error-warning-line ${isDarkMode ? 'warning-icon-dark' : 'warning-icon'}`}></i>
                                    <span className={isDarkMode ? 'warning-text-dark' : 'warning-text'}>
                                      Attention: La durée demandée ({requestedDays} jours) dépasse la limite autorisée pour {selectedDemande.nature_conge} ({maxDays} jours maximum)
                                    </span>
                                  </div>
                                </div>
                              );
                            }
                            // console.log('DemandeDetailsModal - Not showing special leave warning');
                            return null;
                          })()}
                          {/* Warning message when solde is insufficient (only for non-special leave types and not Congé sans solde) */}
                          {selectedDemande.type_conge !== "Congé spécial" && selectedDemande.type_conge !== "Congé sans solde" && (selectedDemande.user?.solde || 0) < selectedDemande.duree && (
                            <div className={isDarkMode ? 'warning-message-dark' : 'warning-message'}>
                              <div className="flex items-center gap-2">
                                <i className={`ri-error-warning-line ${isDarkMode ? 'warning-icon-dark' : 'warning-icon'}`}></i>
                                <span className={isDarkMode ? 'warning-text-dark' : 'warning-text'}>
                                  Attention: Le solde disponible ({selectedDemande.user?.solde || 0} jours) est insuffisant pour cette demande ({selectedDemande.duree} jours)
                                </span>
                              </div>
                            </div>
                          )}
                          {/* Success message when solde is sufficient (only for non-special leave types and not Congé sans solde) */}
                          {selectedDemande.type_conge !== "Congé spécial" && selectedDemande.type_conge !== "Congé sans solde" && (selectedDemande.user?.solde || 0) >= selectedDemande.duree && (
                            <div className={isDarkMode ? 'success-message-dark' : 'success-message'}>
                              <div className="flex items-center gap-2">
                                <i className={`ri-check-line ${isDarkMode ? 'success-icon-dark' : 'success-icon'}`}></i>
                                <span className={isDarkMode ? 'success-text-dark' : 'success-text'}>
                                  Solde suffisant: {selectedDemande.user?.solde || 0} jours disponibles pour {selectedDemande.duree} jours demandés
                                </span>
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Third Row: For document requests - Type de document and Message, For leave requests - Motif and Interim */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
                    {selectedDemande.type_demande === "Demande des documents administratifs" ? (
                      <>
                        {/* Type de document */}
                        <div className="flex items-start space-x-4 p-4 bg-gray-50 dark:bg-black/20 rounded-xl hover:bg-gray-100 dark:hover:bg-black/30 transition-all duration-200">
                          <div className="w-10 h-10 rounded-lg bg-orange-100 dark:bg-orange-900/30 flex items-center justify-center flex-shrink-0">
                            <i className="ri-file-paper-line text-xl text-orange-600 dark:text-orange-400"></i>
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Type de document</p>
                            <p className="text-base font-semibold text-gray-900 dark:text-white truncate">{selectedDemande.type_document}</p>
                          </div>
                        </div>

                        {/* Fourth Row: Message */}
                        <div className="flex items-start space-x-4 p-4 bg-gray-50 dark:bg-black/20 rounded-xl hover:bg-gray-100 dark:hover:bg-black/30 transition-all duration-200">
                          <div className="w-10 h-10 rounded-lg bg-teal-100 dark:bg-teal-900/30 flex items-center justify-center flex-shrink-0">
                            <i className="ri-message-3-line text-xl text-teal-600 dark:text-teal-400"></i>
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between">
                              <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Message</p>
                              <button
                                type="button"
                                className="ti-btn !py-1.5 !px-3 !rounded-full border-2 border-teal-200 bg-teal-50 text-teal-600 hover:bg-teal-100 hover:border-teal-300 dark:bg-teal-900/30 dark:border-teal-700 dark:text-teal-400 dark:hover:bg-teal-800/50 dark:hover:border-teal-600 transition-all duration-300 hover:shadow-lg hover:shadow-teal-500/20 focus:ring-2 focus:ring-teal-500/30"
                                data-hs-overlay="#hs-full-message-modal"
                              >
                                <span className="flex items-center gap-1.5">
                                  <i className="ri-fullscreen-line"></i>
                                  <span>Afficher</span>
                                </span>
                              </button>
                            </div>
                            <div className="prose prose-sm max-w-none text-gray-900 dark:text-white mt-2 line-clamp-3" 
                                 dangerouslySetInnerHTML={{ __html: selectedDemande.message }} />
                          </div>
                        </div>
                      </>
                    ) : (
                      <>
                        {/* Motif du congé - Only show for Congé sans solde */}
                        {selectedDemande.type_demande === "Demande de congés" && selectedDemande.type_conge === "Congé sans solde" && selectedDemande.motif_conge && (
                          <div className="flex items-start space-x-4 p-4 bg-gray-50 dark:bg-black/20 rounded-xl hover:bg-gray-100 dark:hover:bg-black/30 transition-all duration-200">
                            <div className="w-10 h-10 rounded-lg bg-yellow-100 dark:bg-yellow-900/30 flex items-center justify-center flex-shrink-0">
                              <i className="ri-file-text-line text-xl text-yellow-600 dark:text-yellow-400"></i>
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="relative group inline-block">
                                <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Motif du congé</p>
                              </div>
                              <div className="flex items-center gap-2 mt-0.5">
                                <div className="min-w-0 flex-1">
                                  <p className="text-base font-semibold text-gray-900 dark:text-white truncate">
                                    {selectedDemande.motif_conge.length > 50
                                      ? `${selectedDemande.motif_conge.substring(0, 50)}...`
                                      : selectedDemande.motif_conge}
                                  </p>
                                </div>
                                <button
                                  type="button"
                                  className="text-primary hover:text-primary/80 flex-shrink-0 -mt-0.5 transition-colors duration-200"
                                  onClick={handleMotifClick}
                                >
                                  <i className="ri-eye-line text-lg"></i>
                                </button>
                              </div>
                            </div>
                          </div>
                        )}

                        {/* Fifth Row: Message */}
                        <div className="flex items-start space-x-4 p-4 bg-gray-50 dark:bg-black/20 rounded-xl hover:bg-gray-100 dark:hover:bg-black/30 transition-all duration-200">
                          <div className="w-10 h-10 rounded-lg bg-teal-100 dark:bg-teal-900/30 flex items-center justify-center flex-shrink-0">
                            <i className="ri-message-3-line text-xl text-teal-600 dark:text-teal-400"></i>
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between">
                              <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Message</p>
                              <button
                                type="button"
                                className="ti-btn !py-1.5 !px-3 !rounded-full border-2 border-teal-200 bg-teal-50 text-teal-600 hover:bg-teal-100 hover:border-teal-300 dark:bg-teal-900/30 dark:border-teal-700 dark:text-teal-400 dark:hover:bg-teal-800/50 dark:hover:border-teal-600 transition-all duration-300 hover:shadow-lg hover:shadow-teal-500/20 focus:ring-2 focus:ring-teal-500/30"
                                data-hs-overlay="#hs-full-message-modal"
                              >
                                <span className="flex items-center gap-1.5">
                                  <i className="ri-fullscreen-line"></i>
                                  <span>Afficher</span>
                                </span>
                              </button>
                            </div>
                            <div className="prose prose-sm max-w-none text-gray-900 dark:text-white mt-2 line-clamp-3" 
                                 dangerouslySetInnerHTML={{ __html: selectedDemande.message }} />
                          </div>
                        </div>
                      </>
                    )}
                  </div>

                  {/* Fourth Row: Intérimaire and Files (for leave requests) */}
                  {selectedDemande.type_demande === "Demande de congés" && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
                      {/* Intérimaire Proposé */}
                      <div className="flex items-start space-x-4 p-4 bg-gray-50 dark:bg-black/20 rounded-xl hover:bg-gray-100 dark:hover:bg-black/30 transition-all duration-200">
                        <div className="w-10 h-10 rounded-lg bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center flex-shrink-0">
                          <i className="ri-user-follow-line text-xl text-purple-600 dark:text-purple-400"></i>
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="relative group inline-block">
                            <p className="text-sm font-medium text-gray-500 dark:text-gray-400 truncate cursor-default">Intérimaire Prop...</p>
                            <div className="invisible opacity-0 group-hover:visible group-hover:opacity-100 transition-opacity absolute z-10 py-2 px-3 text-sm font-medium text-white bg-gray-900 rounded-lg shadow-sm dark:bg-gray-700 -bottom-2 left-0 transform translate-y-full whitespace-nowrap">
                              Intérimaire Proposé
                            </div>
                          </div>
                          <div className="flex items-center gap-2 mt-0.5">
                            <div className="min-w-0 flex-1">
                              <p className="text-base font-semibold text-gray-900 dark:text-white truncate">
                                {selectedDemande.interim ? (
                                  selectedDemande.interim.length > 50 ?
                                    `${selectedDemande.interim.substring(0, 50)}...` :
                                    selectedDemande.interim
                                ) : 'Non spécifié'}
                              </p>
                            </div>
                            <button
                              type="button"
                              className="text-primary hover:text-primary/80 flex-shrink-0 -mt-0.5 transition-colors duration-200"
                              onClick={handleInterimClick}
                            >
                              <i className="ri-eye-line text-lg"></i>
                            </button>
                          </div>
                        </div>
                      </div>

                      {/* Files Section */}
                      <div className="flex items-start space-x-4 p-4 bg-gray-50 dark:bg-black/20 rounded-xl hover:bg-gray-100 dark:hover:bg-black/30 transition-all duration-200">
                        <div className="w-10 h-10 rounded-lg bg-indigo-100 dark:bg-indigo-900/30 flex items-center justify-center flex-shrink-0">
                          <i className="ri-file-list-3-line text-xl text-indigo-600 dark:text-indigo-400"></i>
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center justify-between">
                            <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Fichiers attachés</p>
                            <button
                              type="button"
                              className="ti-btn !py-1.5 !px-3 !rounded-full border-2 border-indigo-200 bg-indigo-50 text-indigo-600 hover:bg-indigo-100 hover:border-indigo-300 dark:bg-indigo-900/30 dark:border-indigo-700 dark:text-indigo-400 dark:hover:bg-indigo-800/50 dark:hover:border-indigo-600 transition-all duration-300 hover:shadow-lg hover:shadow-indigo-500/20 focus:ring-2 focus:ring-indigo-500/30"
                              onClick={handleFilesClick}
                            >
                              <span className="flex items-center gap-1.5">
                                <i className="ri-folder-line"></i>
                                <span>Afficher</span>
                              </span>
                            </button>
                          </div>
                          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                            {loading ? 'Chargement...' : `${files.length} fichier(s)`}
                          </p>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Fifth Row: Date de création with Status */}
                  <div className="flex items-start space-x-4 p-4 bg-gray-50 dark:bg-black/20 rounded-xl hover:bg-gray-100 dark:hover:bg-black/30 transition-all duration-200">
                    <div className="w-10 h-10 rounded-lg bg-gray-100 dark:bg-gray-900/30 flex items-center justify-center flex-shrink-0">
                      <i className="ri-time-line text-xl text-gray-600 dark:text-gray-400"></i>
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Date de création</p>
                        {selectedDemande && (
                          <span className={`badge !rounded-full inline-flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium ${
                            selectedDemande.status === 'En attente' 
                              ? 'bg-warning/10 text-warning dark:bg-warning/20' 
                              : selectedDemande.status === 'Traité' || selectedDemande.status === 'Approuvée'
                                ? 'bg-success/10 text-success dark:bg-success/20'
                                : 'bg-danger/10 text-danger dark:bg-danger/20'
                          }`}>
                            <i className={`text-lg ${
                              selectedDemande.status === 'En attente' 
                                ? 'ri-time-line' 
                                : selectedDemande.status === 'Traité' || selectedDemande.status === 'Approuvée'
                                  ? 'ri-checkbox-circle-line'
                                  : 'ri-close-circle-line'
                            }`}></i>
                            {selectedDemande.status}
                          </span>
                        )}
                      </div>
                      <p className="text-base font-semibold text-gray-900 dark:text-white mt-1">
                        {selectedDemande?.created_at ? new Date(selectedDemande.created_at).toLocaleString('fr-FR', {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit'
                        }) : '-'}
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>
            <div className="ti-modal-footer sticky bottom-0 z-50 flex justify-end gap-3 bg-gray-50 dark:bg-gray-700/50 px-6 py-4 border-t border-gray-200 dark:border-gray-700">
              <button
                type="button"
                className="ti-btn ti-btn-danger !font-medium !rounded-full px-6 py-2.5 transition-all duration-300 hover:bg-danger/80 hover:shadow-lg hover:shadow-danger/30 focus:ring-2 focus:ring-danger/30 active:bg-danger/90"
                data-hs-overlay="#hs-view-demande-modal"
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
    </>
  );
};

export default DemandeDetailsModal; 