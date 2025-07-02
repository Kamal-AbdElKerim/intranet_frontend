import React, { useState, useEffect } from 'react';
import { useAuth } from '../utile/AuthProvider.jsx';

const roleDropdownStyles = `
  .role-dropdown-button {
    background: linear-gradient(135deg, #3b82f6 0%, #6366f1 100%);
    color: white;
    border: none;
    border-radius: 8px;
    padding: 12px 20px;
    font-weight: 500;
    font-size: 14px;
    cursor: pointer;
    transition: all 0.3s ease;
    box-shadow: 0 4px 12px rgba(59, 130, 246, 0.3);
    display: flex;
    align-items: center;
    gap: 8px;
  }
  .role-dropdown-button:hover {
    background: linear-gradient(135deg, #2563eb 0%, #4f46e5 100%);
    transform: translateY(-2px);
    box-shadow: 0 8px 20px rgba(59, 130, 246, 0.4);
  }
  .role-dropdown-button .arrow-icon {
    transition: transform 0.3s ease;
  }
  .group:hover .role-dropdown-button .arrow-icon {
    transform: rotate(180deg);
  }
  .role-dropdown-content {
    position: absolute;
    top: 100%;
    left: 50%;
    transform: translateX(-50%) translateY(-10px);
    margin-top: 8px;
    opacity: 0;
    visibility: hidden;
    transition: all 0.3s ease;
    z-index: 50;
    min-width: 900px;
    max-width: 1300px;
  }
  @media (max-width: 1024px) {
    .role-dropdown-content {
      position: fixed;
      top: 20px;
      left: 50%;
      transform: translateX(-50%) translateY(-10px);
      min-width: auto;
      max-width: calc(100vw - 32px);
      width: calc(100vw - 32px);
      margin: 0;
      max-height: calc(100vh - 40px);
    }
    .group:hover .role-dropdown-content {
      transform: translateX(-50%) translateY(0);
    }
  }
  @media (max-width: 640px) {
    .role-dropdown-content {
      position: fixed;
      top: 20px;
      left: 50%;
      transform: translateX(-50%) translateY(-10px);
      min-width: auto;
      max-width: calc(100vw - 16px);
      width: calc(100vw - 16px);
      margin: 0;
      max-height: calc(100vh - 40px);
    }
    .group:hover .role-dropdown-content {
      transform: translateX(-50%) translateY(0);
    }
    .role-dropdown-panel {
      padding: 20px;
      max-height: calc(100vh - 80px);
      overflow-y: auto;
    }
    .role-view-button {
      padding: 16px;
      flex-direction: column;
      text-align: center;
      gap: 12px;
      margin-bottom: 12px;
    }
    .role-icon-container {
      width: 48px;
      height: 48px;
    }
    .role-view-button h5 {
      font-size: 16px;
      margin-bottom: 4px;
    }
    .role-view-button p {
      font-size: 14px;
      line-height: 1.4;
    }
    .role-section-title {
      font-size: 20px;
      margin-bottom: 12px;
    }
    .role-section-subtitle {
      font-size: 16px;
      margin-bottom: 20px;
    }
  }
  .group:hover .role-dropdown-content {
    opacity: 1;
    visibility: visible;
    transform: translateX(-50%) translateY(0);
  }
  .role-dropdown-panel {
    background: white;
    border: 2px solid #e5e7eb;
    border-radius: 12px;
    box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04);
    padding: 24px;
    backdrop-filter: blur(8px);
    width: 100%;
  }
  .dark .role-dropdown-panel {
    background: #1f2937;
    border-color: #374151;
  }
  .role-section-title {
    font-size: 18px;
    font-weight: 600;
    color: #1f2937;
    margin-bottom: 8px;
    text-align: center;
  }
  .dark .role-section-title {
    color: #f9fafb;
  }
  .role-section-subtitle {
    font-size: 14px;
    color: #6b7280;
    margin-bottom: 16px;
    text-align: center;
  }
  .dark .role-section-subtitle {
    color: #9ca3af;
  }
  .role-view-button {
    position: relative;
    padding: 16px;
    border: 2px solid #e5e7eb;
    border-radius: 12px;
    background: white;
    cursor: pointer;
    transition: all 0.3s ease;
    display: flex;
    align-items: center;
    gap: 12px;
  }
  .role-view-button:hover {
    border-color: #f59e0b;
    box-shadow: 0 4px 12px rgba(245, 158, 11, 0.15);
  }
  .role-view-button.active {
    border-color: #f59e0b;
    background: #fef3c7;
    box-shadow: 0 4px 12px rgba(245, 158, 11, 0.2);
    transform: scale(1.02);
  }
  .dark .role-view-button {
    background: #374151;
    border-color: #4b5563;
  }
  .dark .role-view-button:hover {
    border-color: #f59e0b;
    background: #4b5563;
  }
  .dark .role-view-button.active {
    background: #92400e;
    border-color: #f59e0b;
  }
  .role-icon-container {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 48px;
    height: 48px;
    border-radius: 8px;
    background: #f3f4f6;
    transition: all 0.3s ease;
  }
  .role-view-button.active .role-icon-container {
    background: #fef3c7;
  }
  .dark .role-icon-container {
    background: #4b5563;
  }
  .dark .role-view-button.active .role-icon-container {
    background: #92400e;
  }
  .role-icon {
    font-size: 20px;
    color: #6b7280;
    transition: all 0.3s ease;
  }
  .role-view-button.active .role-icon {
    color: #d97706;
  }
  .dark .role-icon {
    color: #9ca3af;
  }
  .dark .role-view-button.active .role-icon {
    color: #f59e0b;
  }
  .role-info-card {
    display: flex;
    align-items: center;
    gap: 12px;
    padding: 12px;
    border-radius: 8px;
    border: 1px solid;
    margin-bottom: 12px;
  }
  .role-info-card.admin {
    background: linear-gradient(135deg, #dbeafe 0%, #bfdbfe 100%);
    border-color: #93c5fd;
  }
  .role-info-card.chef {
    background: linear-gradient(135deg, #fef3c7 0%, #fed7aa 100%);
    border-color: #fbbf24;
  }
  .role-info-card.directeur {
    background: linear-gradient(135deg, #dcfce7 0%, #bbf7d0 100%);
    border-color: #86efac;
  }
  .dark .role-info-card.admin {
    background: linear-gradient(135deg, #1e3a8a 0%, #1e40af 100%);
    border-color: #3b82f6;
  }
  .dark .role-info-card.chef {
    background: linear-gradient(135deg, #92400e 0%, #a16207 100%);
    border-color: #f59e0b;
  }
  .dark .role-info-card.directeur {
    background: linear-gradient(135deg, #14532d 0%, #15803d 100%);
    border-color: #22c55e;
  }
  .role-info-icon {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 40px;
    height: 40px;
    border-radius: 8px;
    background: rgba(255, 255, 255, 0.8);
    backdrop-filter: blur(4px);
  }
  .dark .role-info-icon {
    background: rgba(0, 0, 0, 0.3);
  }
  .role-info-title {
    font-weight: 600;
    font-size: 16px;
    margin-bottom: 4px;
  }
  .role-info-description {
    font-size: 14px;
    line-height: 1.4;
  }
  .role-info-card.admin .role-info-title {
    color: #1e40af;
  }
  .role-info-card.admin .role-info-description {
    color: #1d4ed8;
  }
  .role-info-card.chef .role-info-title {
    color: #a16207;
  }
  .role-info-card.chef .role-info-description {
    color: #92400e;
  }
  .role-info-card.directeur .role-info-title {
    color: #15803d;
  }
  .role-info-card.directeur .role-info-description {
    color: #16a34a;
  }
  .dark .role-info-card.admin .role-info-title {
    color: #93c5fd;
  }
  .dark .role-info-card.admin .role-info-description {
    color: #bfdbfe;
  }
  .dark .role-info-card.chef .role-info-title {
    color: #fbbf24;
  }
  .dark .role-info-card.chef .role-info-description {
    color: #f59e0b;
  }
  .dark .role-info-card.directeur .role-info-title {
    color: #86efac;
  }
  .dark .role-info-card.directeur .role-info-description {
    color: #22c55e;
  }
  .active-indicator {
    position: absolute;
    top: 8px;
    right: 8px;
    width: 12px;
    height: 12px;
    background: #f59e0b;
    border-radius: 50%;
  }
`;

// RoleDropdown component for PMO Projects
const RoleDropdown = ({
  fetchProjects,
  searchTerm = '',
  statusFilter = '',
  yearFilter = '',
  projectTypeFilter = '',
  onRoleViewChange
}) => {
  const { user } = useAuth();

  // Helper function to check user roles
  const hasRole = (roleName) => {
    const userData = user?.data || user;
    if (!user) return false;
    if (!userData) return false;
    if (!userData.roles) return false;
    if (!Array.isArray(userData.roles)) return false;
    return userData.roles.some(role => role.name === roleName);
  };

  const isAdmin = hasRole('Pmo_Admin');
  const isChefDeProjet = hasRole('Pmo_Chef de projet');
  const isDirecteurGeneral = hasRole('Pmo_Directeur general');
  const hasPmoRoles = isAdmin || isChefDeProjet || isDirecteurGeneral;
  const hasMultipleRoles = [isAdmin, isChefDeProjet, isDirecteurGeneral].filter(Boolean).length > 1;

  // roleView state
  const [roleView, setRoleView] = useState(() => {
    const saved = localStorage.getItem('pmo_role_view');
    return saved || (isAdmin ? 'admin' : isChefDeProjet ? 'chef' : isDirecteurGeneral ? 'directeur' : 'chef');
  });

  // Validate and correct role view based on user's actual roles
  useEffect(() => {
    if (user) {
      const currentIsAdmin = hasRole('Pmo_Admin');
      const currentIsChefDeProjet = hasRole('Pmo_Chef de projet');
      const currentIsDirecteurGeneral = hasRole('Pmo_Directeur general');
      const currentHasPmoRoles = currentIsAdmin || currentIsChefDeProjet || currentIsDirecteurGeneral;
      const isValidRoleView =
        (roleView === 'admin' && currentIsAdmin) ||
        (roleView === 'chef' && (currentIsChefDeProjet || !currentHasPmoRoles)) ||
        (roleView === 'directeur' && currentIsDirecteurGeneral);
      if (!isValidRoleView) {
        if (currentIsAdmin) setRoleView('admin');
        else if (currentIsChefDeProjet) setRoleView('chef');
        else if (currentIsDirecteurGeneral) setRoleView('directeur');
        else setRoleView('chef');
      }
    }
    // eslint-disable-next-line
  }, [user]);

  // Save roleView to localStorage and notify parent
  useEffect(() => {
    localStorage.setItem('pmo_role_view', roleView);
    if (onRoleViewChange) onRoleViewChange(roleView);
    if (fetchProjects) fetchProjects(1, searchTerm, statusFilter, yearFilter, projectTypeFilter, '', roleView);
    // eslint-disable-next-line
  }, [roleView]);

  return (
    <>
      <style>{roleDropdownStyles}</style>
      <div className="relative group">
        <button className="role-dropdown-button">
          <i className="ri-user-settings-line text-lg"></i>
          <span>Rôles</span>
          <i className="ri-arrow-down-s-line arrow-icon"></i>
        </button>
        {/* Dropdown Content */}
        <div className="role-dropdown-content">
          <div className="role-dropdown-panel">
            {hasMultipleRoles ? (
              // User has multiple roles - show role view selector
              <div className="space-y-4">
                <div className="text-center mb-4">
                  <h3 className="role-section-title">Sélectionner une Vue</h3>
                  <p className="role-section-subtitle">Choisissez la vue qui correspond à vos besoins</p>
                </div>
                {/* Role View Selector */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Vue Admin - Admin view */}
                  {isAdmin && (
                    <button
                      onClick={() => setRoleView('admin')}
                      className={`role-view-button ${roleView === 'admin' ? 'active' : ''}`}
                    >
                      <div className="role-icon-container">
                        <i className="role-icon ri-shield-star-line"></i>
                      </div>
                      <div className="text-left">
                        <h5 className="font-semibold">Vue Admin</h5>
                        <p className="text-sm">Affiche tous les projets avec les privilèges d'administrateur PMO.</p>
                      </div>
                      {roleView === 'admin' && (
                        <div className="active-indicator"></div>
                      )}
                    </button>
                  )}
                  {/* Vue Chef - Chef view */}
                  {(isChefDeProjet || !hasPmoRoles) && (
                    <button
                      onClick={() => setRoleView('chef')}
                      className={`role-view-button ${roleView === 'chef' ? 'active' : ''}`}
                    >
                      <div className="role-icon-container">
                        <i className="role-icon ri-user-star-line"></i>
                      </div>
                      <div className="text-left">
                        <h5 className="font-semibold">Vue Chef</h5>
                        <p className="text-sm">Affiche uniquement les projets que vous avez créés ou dont vous êtes membre.</p>
                      </div>
                      {roleView === 'chef' && (
                        <div className="active-indicator"></div>
                      )}
                    </button>
                  )}
                  {/* Vue Directeur - Directeur view */}
                  {isDirecteurGeneral && (
                    <button
                      onClick={() => setRoleView('directeur')}
                      className={`role-view-button ${roleView === 'directeur' ? 'active' : ''}`}
                    >
                      <div className="role-icon-container">
                        <i className="role-icon ri-user-star-line"></i>
                      </div>
                      <div className="text-left">
                        <h5 className="font-semibold">Vue Directeur</h5>
                        <p className="text-sm">Affiche les projets de votre entité et des entités liées (parent et enfants).</p>
                      </div>
                      {roleView === 'directeur' && (
                        <div className="active-indicator"></div>
                      )}
                    </button>
                  )}
                </div>
              </div>
            ) : (
              // User has only one role
              <div className="space-y-4">
                <div className="text-center mb-4">
                  <h3 className="role-section-title">Votre Rôle</h3>
                  <p className="role-section-subtitle">Informations sur vos permissions actuelles</p>
                </div>
                <>
                  {isAdmin && (
                    <div className="role-info-card admin">
                      <div className="role-info-icon">
                        <i className="ri-shield-star-line text-xl"></i>
                      </div>
                      <div>
                        <h4 className="role-info-title">Administrateur PMO</h4>
                        <p className="role-info-description">
                          Vous avez accès à tous les projets et objectifs du système PMO.
                        </p>
                      </div>
                    </div>
                  )}
                  {(isChefDeProjet || (!hasPmoRoles && !isAdmin)) && (
                    <div className="role-info-card chef">
                      <div className="role-info-icon">
                        <i className="ri-user-star-line text-xl"></i>
                      </div>
                      <div>
                        <h4 className="role-info-title">
                          {isChefDeProjet ? 'Chef de Projet PMO' : 'Utilisateur Standard'}
                        </h4>
                        <p className="role-info-description">
                          {isChefDeProjet 
                            ? 'Vous pouvez voir uniquement les projets de votre entité où vous êtes membre participant.'
                            : 'Vous pouvez voir uniquement les projets que vous avez créés ou dont vous êtes membre.'
                          }
                        </p>
                      </div>
                    </div>
                  )}
                  {isDirecteurGeneral && !isAdmin && !isChefDeProjet && hasPmoRoles && (
                    <div className="role-info-card directeur">
                      <div className="role-info-icon">
                        <i className="ri-user-star-line text-xl"></i>
                      </div>
                      <div>
                        <h4 className="role-info-title">Directeur Général PMO</h4>
                        <p className="role-info-description">
                          Vous pouvez voir tous les projets et objectifs du système PMO.
                        </p>
                      </div>
                    </div>
                  )}
                </>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
};

export default RoleDropdown; 