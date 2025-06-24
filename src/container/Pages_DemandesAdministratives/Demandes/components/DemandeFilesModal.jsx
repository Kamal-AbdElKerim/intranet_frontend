import React, { useEffect, useState } from 'react';
import axiosInstance from '../../../../Interceptor/axiosInstance';
import ToastService from '../../../../components/utile/toastService';

const DemandeFilesModal = ({ demande, onClose }) => {
  const [files, setFiles] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (demande?.id) {
      fetchFiles();
    }
  }, [demande]);

  const fetchFiles = async () => {
    try {
      setLoading(true);
      const response = await axiosInstance.get(`/filesParAdmin/${demande.id}/files`);
      setFiles(response.data.data || []);
    } catch (error) {
      // console.error('Error fetching files:', error);
      ToastService.error('Erreur lors du chargement des fichiers');
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
      ToastService.error('Erreur lors du téléchargement du fichier');
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

  return (
    <div id="hs-demande-files-modal" className="hs-overlay hidden ti-modal">
      <div className="hs-overlay-open:mt-7 ti-modal-box mt-0 ease-out">
        <div className="ti-modal-content">
          <div className="ti-modal-header">
            <h5 className="ti-modal-title">
            les documents envoyés par RH
            </h5>
            <button type="button" className="hs-dropdown-toggle ti-modal-close-btn" data-hs-overlay="#hs-demande-files-modal">
              <span className="sr-only">Close</span>
              <i className="ri-close-line"></i>
            </button>
          </div>
          <div className="ti-modal-body">
            {loading ? (
              <div className="flex justify-center items-center h-32">
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
          <div className="ti-modal-footer">
            <button
              type="button"
              className="hs-dropdown-toggle ti-btn ti-btn-danger"
              data-hs-overlay="#hs-demande-files-modal"
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
  );
};

export default DemandeFilesModal; 