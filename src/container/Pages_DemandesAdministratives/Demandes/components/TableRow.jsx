'use client';

import React from 'react';

function TableRow({ 
  item, 
  activeTab, 
  handleView, 
  handleShowValidations, 
  handleApprove, 
  handleReject, 
  handleShowFiles,
  setSelectedDemande, 
  setShowReturnModal,
  user
}) {
  if (!item) return null;
  
  const demande = activeTab === 'history' ? item.demande : item;
  if (!demande) return null;

  const isDocumentRequest = demande.type_demande === "Demande des documents administratifs";
  const isLeaveRequest = demande.type_demande === "Demande de congés";
  const isAdminRH = user?.data?.roles?.some(role => role.name === 'Admin RH');
  const status = activeTab === 'history' ? item.status : demande.status;

  const formatDate = (date) => {
    return new Date(date).toLocaleString('fr-FR', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <tr 
      className={`
        relative group transition-all duration-300 border-l-4
        ${isDocumentRequest 
          ? 'bg-blue-50/70 hover:bg-blue-100/80 border-blue-500 dark:bg-blue-900/10 dark:hover:bg-blue-900/20' 
          : isLeaveRequest
            ? 'bg-emerald-50/70 hover:bg-emerald-100/80 border-emerald-500 dark:bg-emerald-900/10 dark:hover:bg-emerald-900/20'
            : 'hover:bg-gray-50 dark:hover:bg-black/20 border-transparent'
        }
      `}
    >
      <td className="px-3 py-4 align-middle">
        <div className="flex items-center">
          <div className={`
            flex-shrink-0 w-8 h-8 rounded-lg flex items-center justify-center mr-3
            ${isDocumentRequest 
              ? 'bg-blue-100 text-blue-600 dark:bg-blue-900/50 dark:text-blue-300' 
              : isLeaveRequest
                ? 'bg-emerald-100 text-emerald-600 dark:bg-emerald-900/50 dark:text-emerald-300'
                : 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-300'
            }
          `}>
            <i className={`text-lg ${
              isDocumentRequest 
                ? 'ri-file-text-line' 
                : isLeaveRequest
                  ? 'ri-calendar-line'
                  : 'ri-file-list-line'
            }`}></i>
          </div>
          <span className={`
            font-medium
            ${isDocumentRequest 
              ? 'text-blue-900 dark:text-blue-300' 
              : isLeaveRequest
                ? 'text-emerald-900 dark:text-emerald-300'
                : 'text-gray-900 dark:text-white'
            }
          `}>
            {`${demande.prenom} ${demande.nom}`}
          </span>
        </div>
      </td>
      <td className="px-3 py-4 align-middle">
        <div className="flex flex-col">
          <span className={`
            font-medium mb-0.5
            ${isDocumentRequest 
              ? 'text-blue-900 dark:text-blue-300' 
              : isLeaveRequest
                ? 'text-emerald-900 dark:text-emerald-300'
                : 'text-gray-900 dark:text-white'
            }
          `}>
            {demande.type_demande}
          </span>
          <span className={`
            text-sm
            ${isDocumentRequest 
              ? 'text-blue-700 dark:text-blue-400' 
              : isLeaveRequest
                ? 'text-emerald-700 dark:text-emerald-400'
                : 'text-gray-600 dark:text-gray-400'
            }
          `}>
            {demande.type_document || demande.type_conge || '-'}
          </span>
        </div>
      </td>
      <td className="px-3 py-4 align-middle">
        <span className={`
          text-sm
          ${isDocumentRequest 
            ? 'text-blue-800 dark:text-blue-400' 
            : isLeaveRequest
              ? 'text-emerald-800 dark:text-emerald-400'
              : 'text-gray-700 dark:text-gray-400'
          }
        `}>
          {formatDate(demande.created_at)}
        </span>
      </td>
      {activeTab === 'history' && (
        <td className="px-3 py-4 align-middle">
          <span className="text-sm text-gray-700 dark:text-gray-400">
            {formatDate(item.validated_at)}
          </span>
        </td>
      )}
      <td className="px-3 py-4 align-middle">
        <div className="flex items-center gap-2">
          <span className={`badge !rounded-full ${
            status === 'En attente'
              ? 'bg-warning/20 text-warning dark:bg-warning/20 dark:text-warning'
              : status === 'Traité'
                ? 'bg-success/20 text-success dark:bg-success/20 dark:text-success'
                : status === 'Refusé'
                  ? 'bg-danger/20 text-danger dark:bg-danger/20 dark:text-danger'
                  : 'bg-info/20 text-info dark:bg-info/20 dark:text-info'
          }`}>
            <i className={`ri-${
              status === 'En attente'
                ? 'time'
                : status === 'Traité'
                  ? 'check'
                  : status === 'Refusé'
                    ? 'close'
                    : 'refresh'
            }-line me-1`}></i>
            {status}
          </span>
          <button
            onClick={(e) => handleShowValidations(demande.id , e)}
            type="button"
            className="ti-btn !p-2 rounded-full bg-gray-100 text-gray-600 hover:bg-gray-200 focus:ring-gray-200 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700"
            title="Voir les validations"
          >
            <i className="ri-eye-line"></i>
          </button>
        </div>
      </td>
      <td className="px-3 py-4 align-middle">
        <div className="flex items-center gap-2">
          <button
            onClick={() => handleView(demande.id)}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-full
              bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600
              transition-all duration-200 relative group"
            title="Voir"
          >
            <i className="ri-eye-line text-base"></i>
          </button>
          {/* Show actions only in pending tab and if user hasn't validated yet */}
          {activeTab === 'pending' && !demande.validations?.find(validation => validation.validated_by === user?.data?.id && validation.demande_id === demande.id) && (
            <>
              <button
                onClick={() => {
                  setSelectedDemande(demande);
                  const modal = document.querySelector('#hs-approve-modal');
                  if (modal) {
                    const HSOverlay = window.HSOverlay;
                    if (HSOverlay) {
                      HSOverlay.open(modal);
                    }
                  }
                }}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-full
                  bg-success/10 text-success hover:bg-success hover:text-white
                  transition-all duration-200 relative group"
                title="Valider"
              >
                <i className="ri-check-line text-base"></i>
              </button>
              <button
                onClick={() => {
                  setSelectedDemande(demande);
                  const modal = document.querySelector('#hs-reject-modal');
                  if (modal) {
                    const HSOverlay = window.HSOverlay;
                    if (HSOverlay) {
                      HSOverlay.open(modal);
                    }
                  }
                }}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-full
                  bg-danger/10 text-danger hover:bg-danger hover:text-white
                  transition-all duration-200"
                title="Rejeter"
              >
                <i className="ri-close-line text-base"></i>
              </button>
              <button
                onClick={() => {
                  setSelectedDemande(demande);
                  setShowReturnModal(true);
                }}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-full
                  bg-orange-500/10 text-orange-500 hover:bg-orange-500 hover:text-orange
                  transition-all duration-200 relative group"
                title="Retourner"
              >
                <i className="ri-arrow-go-back-line text-base"></i>
              </button>
            </>
          )}
          {/* Add Show Files button for Admin RH when status is Traité */}
          {isAdminRH && status === 'Traité' && (
            <button
              onClick={() => handleShowFiles(demande)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-full
              bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600
              transition-all duration-200 relative group"
              title="Voir les fichiers"
            >
              <i className="ri-file-list-line"></i>
            </button>
          )}
        </div>
      </td>
    </tr>
  );
}

export default React.memo(TableRow); 