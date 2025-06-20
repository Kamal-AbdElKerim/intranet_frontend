import React, { useState } from 'react';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';

const ActivitiesTimeline = ({ activities }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);

  const getActivityIcon = (action) => {
    switch (action) {
      case 'created':
        return 'ri-add-circle-line text-success';
      case 'updated':
        return 'ri-edit-2-line text-primary';
      case 'deleted':
        return 'ri-delete-bin-line text-danger';
      default:
        return 'ri-information-line text-info';
    }
  };

  const getActivityColor = (action) => {
    switch (action) {
      case 'created':
        return 'bg-success/10 border-success/20';
      case 'updated':
        return 'bg-primary/10 border-primary/20';
      case 'deleted':
        return 'bg-danger/10 border-danger/20';
      default:
        return 'bg-info/10 border-info/20';
    }
  };

  const renderActivitiesContent = () => (
    <div className="relative">
      <div className="absolute left-6 top-0 bottom-0 w-0.5 bg-gray-200 dark:bg-gray-700"></div>
      <div className="space-y-6 p-4">
        {!activities || activities.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-8 text-center">
            <div className="w-16 h-16 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center mb-4">
              <i className="ri-history-line text-2xl text-gray-400"></i>
            </div>
            <h6 className="text-gray-600 dark:text-gray-400 font-medium mb-1">Aucune activité</h6>
            <p className="text-gray-500 dark:text-gray-500 text-sm">Les activités apparaîtront ici</p>
          </div>
        ) : (
          activities.map((activity, index) => (
            <div key={index} className="relative pl-12">
              <div className={`absolute left-4 top-1 w-5 h-5 rounded-full border-4 border-white dark:border-gray-800 ${getActivityColor(activity.action)} flex items-center justify-center`}>
                <i className={`${getActivityIcon(activity.action)} text-sm`}></i>
              </div>
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-100 dark:border-gray-700 p-4 hover:shadow-md transition-shadow duration-200">
                <div className="flex items-start justify-between">
                  <div>
                    <h6 className="font-semibold text-gray-900 dark:text-white mb-1">
                      {activity.description}
                    </h6>
                    <div className="flex items-center gap-2 text-sm">
                      <span className="text-gray-600 dark:text-gray-300">
                        {format(new Date(activity.created_at), "d MMMM yyyy 'à' HH:mm", { locale: fr })}
                      </span>
                      <span className={`inline-flex items-center px-3 py-0.5 rounded-full text-xs font-semibold ring-1 ring-inset ${getActivityColor(activity.action)}`}>
                        {activity.action.charAt(0).toUpperCase() + activity.action.slice(1)}
                      </span>
                    </div>
                    {activity.user && (
                      <div className="mt-2 flex items-center gap-2">
                        <div className="avatar bg-primary/10 text-primary rounded-full w-6 h-6 flex items-center justify-center">
                          <i className="ri-user-line text-xs"></i>
                        </div>
                        <span className="text-sm text-gray-600 dark:text-gray-300">
                          {activity.user.name}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );

  const renderModal = () => {
    if (!isModalOpen) return null;

    return (
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl w-full max-w-4xl mx-auto max-h-[90vh] overflow-hidden transform transition-all duration-300 scale-100">
          {/* Modal Header */}
          <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700 bg-gradient-to-r from-primary/5 to-secondary/5">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                <i className="ri-history-line text-xl text-primary"></i>
              </div>
              <div>
                <h3 className="text-xl font-bold text-gray-900 dark:text-white">Activités récentes</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">Historique des actions effectuées</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="badge bg-primary/10 text-primary text-sm font-semibold py-2 px-3 rounded-full">
                {activities?.length || 0} activités
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-2 rounded-lg text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300 
                transition-all duration-200 hover:bg-gray-100 dark:hover:bg-gray-700 group"
              >
                <i className="ri-close-line text-xl group-hover:scale-110 transition-transform duration-200"></i>
              </button>
            </div>
          </div>

          {/* Modal Body */}
          <div className="overflow-y-auto max-h-[calc(90vh-120px)]">
            {renderActivitiesContent()}
          </div>

          {/* Modal Footer */}
          <div className="flex items-center justify-between p-6 border-t border-gray-200 dark:border-gray-700 bg-gray-50/50 dark:bg-gray-800/50">
            <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
              <i className="ri-information-line"></i>
              <span>Dernière mise à jour: {format(new Date(), "d MMMM yyyy 'à' HH:mm", { locale: fr })}</span>
            </div>
            <button
              onClick={() => setIsModalOpen(false)}
              className="px-6 py-2 bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300 
              rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-all duration-200 font-medium"
            >
              Fermer
            </button>
          </div>
        </div>
      </div>
    );
  };

  return (
    <>
      {/* Button to open modal */}
      <div className="box">
      
          <button
            onClick={() => setIsModalOpen(true)}
            className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 
            transition-all duration-200 flex items-center gap-2 font-medium shadow-lg hover:shadow-primary/30
            transform hover:scale-105 active:scale-95"
          >
            <i className="ri-eye-line"></i>
            <span>Voir toutes les activités</span>
          </button>
        </div>
  

      {/* Modal */}
      {renderModal()}
    </>
  );
};

export default ActivitiesTimeline; 