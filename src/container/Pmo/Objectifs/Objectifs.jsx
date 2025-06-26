import { Fragment, useState, useEffect } from 'react';
import Pageheader from '../../../components/common/pageheader/pageheader';
import ToastService from '../../../components/utile/toastService';
import CustomPagination from '../../../components/utile/CustomPagination';
import '../../../styles/table.css';
import '../../../styles/error.css';
import axiosInstance from '../../../Interceptor/axiosInstance';
import { ToastContainer } from 'react-toastify';

// Custom styles for range slider and select
const rangeSliderStyles = `
  input[type="range"] {
    -webkit-appearance: none;
    appearance: none;
    height: 8px;
    border-radius: 4px;
    outline: none;
    cursor: pointer;
    background: linear-gradient(to right, 
      #26bf94 0%, #26bf94 20%, 
      #f5b849 20%, #f5b849 50%, 
      #ffa505 50%, #ffa505 80%, 
      #e6533c 80%, #e6533c 100%);
  }
  input[type="range"]::-webkit-slider-thumb {
    -webkit-appearance: none;
    appearance: none;
    width: 20px;
    height: 20px;
    border-radius: 50%;
    background: var(--primary);
    cursor: pointer;
    border: 2px solid white;
    box-shadow: 0 2px 4px rgba(0,0,0,0.2);
    transition: all 0.2s ease;
  }
  input[type="range"]::-webkit-slider-thumb:hover {
    transform: scale(1.1);
    box-shadow: 0 4px 8px rgba(0,0,0,0.3);
  }
  input[type="range"]::-moz-range-thumb {
    width: 20px;
    height: 20px;
    border-radius: 50%;
    background: var(--primary);
    cursor: pointer;
    border: 2px solid white;
    box-shadow: 0 2px 4px rgba(0,0,0,0.2);
    transition: all 0.2s ease;
  }
  input[type="range"]::-moz-range-thumb:hover {
    transform: scale(1.1);
    box-shadow: 0 4px 8px rgba(0,0,0,0.3);
  }
  input[type="range"]::-moz-range-track {
    height: 8px;
    border-radius: 4px;
    border: none;
    background: linear-gradient(to right, 
      #26bf94 0%, #26bf94 20%, 
      #f5b849 20%, #f5b849 50%, 
      #ffa505 50%, #ffa505 80%, 
      #e6533c 80%, #e6533c 100%);
  }
  .custom-select { position: relative; display: inline-block; width: 100%; }
  .custom-select select { appearance: none; -webkit-appearance: none; -moz-appearance: none; background: white; border: 2px solid #e5e7eb; border-radius: 12px; padding: 12px 16px; padding-right: 48px; font-size: 14px; font-weight: 500; color: #374151; cursor: pointer; transition: all 0.3s ease; box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1); background-image: url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%236b7280' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='m6 8 4 4 4-4'/%3e%3c/svg%3e"); background-position: right 12px center; background-repeat: no-repeat; background-size: 16px; }
  .custom-select select:hover { border-color: #3b82f6; box-shadow: 0 4px 12px rgba(59, 130, 246, 0.15); transform: translateY(-1px); }
  .custom-select select:focus { outline: none; border-color: #3b82f6; box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1), 0 4px 12px rgba(59, 130, 246, 0.15); }
  .custom-select select:disabled { background-color: #f9fafb; color: #9ca3af; cursor: not-allowed; opacity: 0.6; }
  .dark .custom-select select { background-color: #374151; border-color: #4b5563; color: #f9fafb; background-image: url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%39ca3af' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='m6 8 4 4 4-4'/%3e%3c/svg%3e"); }
  .dark .custom-select select:hover { border-color: #60a5fa; box-shadow: 0 4px 12px rgba(96, 165, 250, 0.15); }
  .dark .custom-select select:focus { border-color: #60a5fa; box-shadow: 0 0 0 3px rgba(96, 165, 250, 0.1), 0 4px 12px rgba(96, 165, 250, 0.15); }
  .custom-select.status-select select { border-color: #3b82f6; }
  .custom-select.status-select select:hover { border-color: #2563eb; box-shadow: 0 4px 12px rgba(37, 99, 235, 0.15); }
  .custom-select.status-select select:focus { border-color: #2563eb; box-shadow: 0 0 0 3px rgba(37, 99, 235, 0.1), 0 4px 12px rgba(37, 99, 235, 0.15); }
  .custom-select.year-select select { border-color: #10b981; }
  .custom-select.year-select select:hover { border-color: #059669; box-shadow: 0 4px 12px rgba(5, 150, 105, 0.15); }
  .custom-select.year-select select:focus { border-color: #059669; box-shadow: 0 0 0 3px rgba(5, 150, 105, 0.1), 0 4px 12px rgba(5, 150, 105, 0.15); }
  .custom-select.form-select select { border-color: #6b7280; }
  .custom-select.form-select select:hover { border-color: #4b5563; box-shadow: 0 4px 12px rgba(75, 85, 99, 0.15); }
  .custom-select.form-select select:focus { border-color: #4b5563; box-shadow: 0 0 0 3px rgba(75, 85, 99, 0.1), 0 4px 12px rgba(75, 85, 99, 0.15); }
  .custom-select select option { padding: 8px 12px; font-size: 14px; background: white; color: #374151; }
  .dark .custom-select select option { background: #374151; color: #f9fafb; }
`;

const statusOptions = [
  { value: 'open', label: 'Ouvert', icon: 'ri-checkbox-circle-line', color: 'emerald' },
  { value: 'planned', label: 'Planifié', icon: 'ri-calendar-line', color: 'blue' },
  { value: 'completed', label: 'Terminé', icon: 'ri-check-double-line', color: 'green' },
  { value: 'hold', label: 'En attente', icon: 'ri-pause-circle-line', color: 'yellow' },
  { value: 'canceled', label: 'Annulé', icon: 'ri-close-circle-line', color: 'red' },
  { value: 'not_started', label: 'Non commencé', icon: 'ri-time-line', color: 'gray' },
  { value: 'continuous_action', label: 'Action continue', icon: 'ri-refresh-line', color: 'purple' },
  { value: 'archived', label: 'Archivé', icon: 'ri-archive-line', color: 'slate' },
];

// Date formatting function
const formatDate = (dateString) => {
  if (!dateString) return '-';
  const date = new Date(dateString);
  const months = [
    'janvier', 'février', 'mars', 'avril', 'mai', 'juin',
    'juillet', 'août', 'septembre', 'octobre', 'novembre', 'décembre'
  ];
  const day = date.getDate();
  const month = months[date.getMonth()];
  const year = date.getFullYear();
  const hours = date.getHours().toString().padStart(2, '0');
  const minutes = date.getMinutes().toString().padStart(2, '0');
  return `${day} ${month} ${year} à ${hours}:${minutes}`;
};

// Helper function to format date for HTML date input (YYYY-MM-DD)
const formatDateForInput = (dateString) => {
  if (!dateString) return '';
  const date = new Date(dateString);
  if (isNaN(date.getTime())) return '';
  const year = date.getFullYear();
  const month = (date.getMonth() + 1).toString().padStart(2, '0');
  const day = date.getDate().toString().padStart(2, '0');
  return `${year}-${month}-${day}`;
};

// Poids range indicator with slider
const getPoidsRange = (poids) => {
  if (poids <= 20) return { label: 'Faible', color: '#26bf94', bgColor: 'rgba(38, 191, 148, 0.1)', textColor: '#26bf94' };
  if (poids <= 50) return { label: 'Moyen', color: '#f5b849', bgColor: 'rgba(245, 184, 73, 0.1)', textColor: '#f5b849' };
  if (poids <= 80) return { label: 'Élevé', color: '#ffa505', bgColor: 'rgba(255, 165, 5, 0.1)', textColor: '#ffa505' };
  return { label: 'Critique', color: '#e6533c', bgColor: 'rgba(230, 83, 60, 0.1)', textColor: '#e6533c' };
};

const Objectifs = () => {
  const [objectifs, setObjectifs] = useState([]);
  const [entities, setEntities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [yearFilter, setYearFilter] = useState('');
  const [sortConfig, setSortConfig] = useState({ key: 'create_date', direction: 'desc' });
  const [pagination, setPagination] = useState({
    current: 1,
    total: 0,
    perPage: 10,
    lastPage: 1
  });
  const [formData, setFormData] = useState({
    titre: '',
    id_entite: '',
    date_debut: '',
    date_fin: '',
    poids: '',
    status: 'open',
    observation: ''
  });
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isUpdated, setIsUpdated] = useState(false);
  const [objectifToUpdate, setObjectifToUpdate] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [objectifToDelete, setObjectifToDelete] = useState(null);

  // Fetch objectifs
  const fetchObjectifs = async (page = 1, search = '', status = '', year = '') => {
    try {
      setLoading(true);
      const queryParams = new URLSearchParams({
        page,
        per_page: pagination.perPage,
        search: search || '',
        sort_key: sortConfig.key || '',
        sort_direction: sortConfig.direction || 'desc',
        status: status || '',
        year: year || ''
      }).toString();
      const response = await axiosInstance.get(`/pmo/objectifs?${queryParams}`);
      if (response.data?.status === 'success' && response.data?.data) {
        const { data, current_page, per_page, total, last_page } = response.data.data;
        setObjectifs(data || []);
        setPagination({
          current: current_page,
          perPage: per_page,
          total,
          lastPage: last_page
        });
      } else {
        ToastService.error('Format de données invalide du serveur');
        setObjectifs([]);
      }
    } catch (error) {
      ToastService.error(error.response?.data?.message || 'Erreur lors du chargement des objectifs');
      setObjectifs([]);
    } finally {
      setLoading(false);
    }
  };

  // Fetch entities
  const fetchEntities = async () => {
    try {
      const response = await axiosInstance.get('/pmo/entites');
      if (Array.isArray(response.data)) {
        setEntities(response.data);
      } else {
        ToastService.error('Format de données des entités invalide');
        setEntities([]);
      }
    } catch (error) {
      ToastService.error('Erreur lors du chargement des entités');
      setEntities([]);
    }
  };

  useEffect(() => {
    fetchObjectifs(1, '', '', '');
    fetchEntities();
    // eslint-disable-next-line
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const validateForm = () => {
    const newErrors = {};
    
    // Titre validation
    if (!formData.titre || formData.titre.trim() === '') {
      newErrors.titre = 'Le titre est requis';
    } else if (formData.titre.length > 255) {
      newErrors.titre = 'Le titre ne peut pas dépasser 255 caractères';
    }
    
    // Entité validation
    if (!formData.id_entite || formData.id_entite === '') {
      newErrors.id_entite = 'L\'entité est requise';
    }
    
    // Date début validation
    if (!formData.date_debut || formData.date_debut === '') {
      newErrors.date_debut = 'La date de début est requise';
    } else {
      const dateDebut = new Date(formData.date_debut);
      if (isNaN(dateDebut.getTime())) {
        newErrors.date_debut = 'La date de début doit être une date valide';
      }
    }
    
    // Date fin validation
    if (!formData.date_fin || formData.date_fin === '') {
      newErrors.date_fin = 'La date de fin est requise';
    } else {
      const dateFin = new Date(formData.date_fin);
      if (isNaN(dateFin.getTime())) {
        newErrors.date_fin = 'La date de fin doit être une date valide';
      } else if (formData.date_debut && new Date(formData.date_debut) >= dateFin) {
        newErrors.date_fin = 'La date de fin doit être postérieure à la date de début';
      }
    }
    
    // Poids validation
    if (!formData.poids || formData.poids === '' || formData.poids === 0) {
      newErrors.poids = 'Le poids est requis';
    } else {
      const poids = parseInt(formData.poids);
      if (isNaN(poids) || poids < 1 || poids > 100) {
        newErrors.poids = 'Le poids doit être un nombre entre 1 et 100';
      }
    }
    
    // Status validation
    if (!formData.status || formData.status === '') {
      newErrors.status = 'Le statut est requis';
    } else {
      const validStatuses = ['open', 'planned', 'completed', 'hold', 'canceled', 'not_started', 'continuous_action', 'archived'];
      if (!validStatuses.includes(formData.status)) {
        newErrors.status = 'Le statut sélectionné n\'est pas valide';
      }
    }
    
    // Observation validation (optional but with length limit)
    if (formData.observation && formData.observation.length > 1000) {
      newErrors.observation = 'L\'observation ne peut pas dépasser 1000 caractères';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    if (!validateForm()) {
      setIsSubmitting(false);
      ToastService.error('Veuillez corriger les erreurs de validation avant de continuer');
      return;
    }
    try {
      let response;
      if (isUpdated && objectifToUpdate) {
        console.log('Updating objective with data:', formData);
        response = await axiosInstance.put(`/pmo/objectifs/${objectifToUpdate.id}`, formData);
        console.log('Update response:', response.data);
      } else {
        console.log('Creating objective with data:', formData);
        response = await axiosInstance.post('/pmo/objectifs', formData);
        console.log('Create response:', response.data);
      }
      
      if (response.data?.status === 'success') {
        ToastService.success(isUpdated ? 'Objectif modifié avec succès' : 'Objectif créé avec succès');
        setShowModal(false);
        
        // Add a small delay to ensure backend has processed the update
        setTimeout(() => {
          console.log('Refreshing data...');
          fetchObjectifs(pagination.current, searchTerm, statusFilter, yearFilter);
        }, 500);
      } else {
        console.error('Response not successful:', response.data);
        ToastService.error(response.data?.message || 'Erreur lors de la soumission');
      }
    } catch (error) {
      console.error('Submit error:', error);
      console.error('Error response:', error.response?.data);
      ToastService.error(error.response?.data?.message || 'Erreur lors de la soumission');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handlePageChange = (page) => {
    fetchObjectifs(page, searchTerm, statusFilter, yearFilter);
  };

  const handleSort = (key) => {
    const direction = sortConfig.key === key && sortConfig.direction === 'asc' ? 'desc' : 'asc';
    setSortConfig({ key, direction });
    fetchObjectifs(1, searchTerm, statusFilter, yearFilter);
  };

  const handleSearch = () => {
    fetchObjectifs(1, searchTerm, statusFilter, yearFilter);
  };

  const handleClearSearch = () => {
    setSearchTerm('');
    fetchObjectifs(1, '', statusFilter, yearFilter);
  };

  const handleStatusFilter = (status) => {
    setStatusFilter(status);
    fetchObjectifs(1, searchTerm, status, yearFilter);
  };

  const handleYearFilter = (year) => {
    setYearFilter(year);
    fetchObjectifs(1, searchTerm, statusFilter, year);
  };

  const handleClearFilters = () => {
    setSearchTerm('');
    setStatusFilter('');
    setYearFilter('');
    fetchObjectifs(1, '', '', '');
  };

  const handleAddObjectif = () => {
    setIsUpdated(false);
    setObjectifToUpdate(null);
    setFormData({
      titre: '',
      id_entite: '',
      date_debut: '',
      date_fin: '',
      poids: '',
      status: 'open',
      observation: ''
    });
    setErrors({});
    setShowModal(true);
  };

  const handleUpdate = (objectif) => {
    setIsUpdated(true);
    setObjectifToUpdate(objectif);
    setFormData({
      titre: objectif.titre || '',
      id_entite: objectif.id_entite || '',
      date_debut: formatDateForInput(objectif.date_debut) || '',
      date_fin: formatDateForInput(objectif.date_fin) || '',
      poids: objectif.poids || '',
      status: objectif.status || 'open',
      observation: objectif.observation || ''
    });
    setErrors({});
    setShowModal(true);
  };

  const handleDelete = (objectif) => {
    setObjectifToDelete(objectif);
  };

  const handleDeleteConfirm = async () => {
    if (!objectifToDelete) return;
    try {
      const response = await axiosInstance.delete(`/pmo/objectifs/${objectifToDelete.id}`);
      if (response.data?.status === 'success') {
        ToastService.success('Objectif supprimé avec succès');
        setObjectifToDelete(null);
        fetchObjectifs(pagination.current, searchTerm, statusFilter, yearFilter);
      } else {
        ToastService.error(response.data?.message || 'Erreur lors de la suppression');
      }
    } catch (error) {
      ToastService.error(error.response?.data?.message || 'Erreur lors de la suppression');
    }
  };

  // Export functions
  const handleExportExcel = async () => {
    try {
      const queryParams = new URLSearchParams({
        search: searchTerm || '',
        status: statusFilter || '',
        year: yearFilter || '',
        export: 'excel'
      }).toString();
      
      const response = await axiosInstance.get(`/pmo/objectifs/export?${queryParams}`, {
        responseType: 'blob'
      });
      
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `objectifs_${new Date().toISOString().split('T')[0]}.xlsx`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
      
      ToastService.success('Export Excel réussi');
    } catch (error) {
      ToastService.error('Erreur lors de l\'export Excel');
    }
  };

  const handleExportPDF = async () => {
    try {
      const queryParams = new URLSearchParams({
        search: searchTerm || '',
        status: statusFilter || '',
        year: yearFilter || '',
        export: 'pdf'
      }).toString();
      
      const response = await axiosInstance.get(`/pmo/objectifs/export?${queryParams}`, {
        responseType: 'blob'
      });
      
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `objectifs_${new Date().toISOString().split('T')[0]}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
      
      ToastService.success('Export PDF réussi');
    } catch (error) {
      ToastService.error('Erreur lors de l\'export PDF');
    }
  };

  return (
    <Fragment>
      <style>{rangeSliderStyles}</style>
      <Pageheader currentpage="Objectifs" activepage="PMO" mainpage="Objectifs" />
      <ToastContainer position="top-right" autoClose={3000} hideProgressBar={false} newestOnTop closeOnClick rtl={false} pauseOnFocusLoss draggable pauseOnHover theme="colored" />
      <div className="grid grid-cols-12 gap-6">
        <div className="xl:col-span-12 col-span-12">
          <div className="box custom-box">
            <div className="box-header flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-gray-200 dark:border-gray-700 px-6 py-4">
              <div className="flex flex-col sm:flex-row items-center justify-between w-full gap-4">
                <div className="box-title text-xl font-semibold text-gray-800 dark:text-white">
                  Gestion des Objectifs
                </div>
                <div className="flex flex-col sm:flex-row items-center gap-4 w-full sm:w-auto">
                  <div className="relative w-full sm:w-64">
                    <div className="flex items-center gap-2">
                      <div className="relative flex-1">
                        <input
                          type="text"
                          placeholder="Rechercher un objectif..."
                          value={searchTerm}
                          onChange={e => setSearchTerm(e.target.value)}
                          className="w-full pl-10 pr-10 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary dark:bg-gray-700 dark:text-white"
                        />
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                          <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                          </svg>
                        </div>
                        {searchTerm && (
                          <button
                            onClick={handleClearSearch}
                            className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                          >
                            <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                            </svg>
                          </button>
                        )}
                      </div>
                      <button
                        onClick={handleSearch}
                        className="p-2 bg-primary text-white rounded-lg hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 transition-colors"
                        title="Rechercher"
                      >
                        <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                        </svg>
                      </button>
                    </div>
                  </div>
                  <button
                    onClick={handleAddObjectif}
                    className="ti-btn ti-btn-primary-full"
                  >
                    Ajouter un Objectif
                  </button>
                </div>
              </div>
              
              {/* Filters Section */}
              <div className="w-full mt-5 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-gray-800 dark:to-gray-900 border border-blue-200 dark:border-gray-700 rounded-xl p-6 shadow-sm">
                <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
                  {/* Filter Header */}
                  <div className="flex items-center gap-3">
                    <div className="flex items-center justify-center w-10 h-10 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                      <i className="ri-filter-3-line text-blue-600 dark:text-blue-400 text-lg"></i>
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Filtres</h3>
                      <p className="text-sm text-gray-600 dark:text-gray-400">Affinez votre recherche</p>
                    </div>
                  </div>
                  
                  {/* Filter Controls */}
                  <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4 flex-1">
                    {/* Status Filter */}
                    <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 min-w-[200px]">
                      <label className="text-sm font-medium text-gray-700 dark:text-gray-300 whitespace-nowrap">
                        <i className="ri-checkbox-multiple-line mr-1 text-blue-500"></i>
                        Statut
                      </label>
                      <div className="custom-select status-select">
                        <select
                          value={statusFilter}
                          onChange={(e) => handleStatusFilter(e.target.value)}
                          className="custom-select select"
                        >
                          <option value="">Tous les statuts</option>
                          {statusOptions.map(opt => (
                            <option key={opt.value} value={opt.value}>{opt.label}</option>
                          ))}
                        </select>
                      </div>
                    </div>
                    
                    {/* Year Filter */}
                    <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 min-w-[180px]">
                      <label className="text-sm font-medium text-gray-700 dark:text-gray-300 whitespace-nowrap">
                        <i className="ri-calendar-line mr-1 text-green-500"></i>
                        Année
                      </label>
                      <div className="custom-select year-select">
                        <select
                          value={yearFilter}
                          onChange={(e) => handleYearFilter(e.target.value)}
                          className="custom-select select"
                        >
                          <option value="">Toutes les années</option>
                          {(() => {
                            const currentYear = new Date().getFullYear();
                            const years = [];
                            for (let year = currentYear + 2; year >= currentYear - 5; year--) {
                              years.push(year);
                            }
                            return years.map(year => (
                              <option key={year} value={year}>{year}</option>
                            ));
                          })()}
                        </select>
                      </div>
                    </div>
                    
                    {/* Export Buttons */}
                    <div className="flex items-center gap-3">
                      {/* Excel Export Button */}
                      <button
                        onClick={handleExportExcel}
                        disabled={loading || objectifs.length === 0}
                        className="flex items-center gap-2 px-4 py-2.5 bg-emerald-500 hover:bg-emerald-600 disabled:bg-emerald-300 text-white rounded-lg font-medium text-sm transition-all duration-200 shadow-sm hover:shadow-md disabled:cursor-not-allowed disabled:opacity-50 group"
                        title="Exporter vers Excel"
                      >
                        <i className="ri-file-excel-2-line text-lg group-hover:scale-110 transition-transform"></i>
                        <span>Excel</span>
                      </button>
                      
                      {/* PDF Export Button */}
                      <button
                        onClick={handleExportPDF}
                        disabled={loading || objectifs.length === 0}
                        className="flex items-center gap-2 px-4 py-2.5 bg-red-500 hover:bg-red-600 disabled:bg-red-300 text-white rounded-lg font-medium text-sm transition-all duration-200 shadow-sm hover:shadow-md disabled:cursor-not-allowed disabled:opacity-50 group"
                        title="Télécharger PDF"
                      >
                        <i className="ri-file-pdf-line text-lg group-hover:scale-110 transition-transform"></i>
                        <span>PDF</span>
                      </button>
                    </div>
                    
                    {/* Clear Filters Button */}
                    {(statusFilter || yearFilter || searchTerm) && (
                      <button
                        onClick={handleClearFilters}
                        className="flex items-center justify-center gap-2 px-4 py-2.5 text-sm font-medium text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg hover:bg-red-100 dark:hover:bg-red-900/30 transition-all duration-200 min-w-[140px]"
                      >
                        <i className="ri-refresh-line"></i>
                        Effacer les filtres
                      </button>
                    )}
                  </div>
                </div>
                
                {/* Active Filters Indicator */}
                {(statusFilter || yearFilter || searchTerm) && (
                  <div className="mt-4 pt-4 border-t border-blue-200 dark:border-gray-700">
                    <div className="flex items-center gap-3">
                      <div className="flex items-center gap-2 px-3 py-1.5 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 rounded-full text-sm font-medium">
                        <i className="ri-check-line"></i>
                        <span>Filtres actifs:</span>
                        <span className="bg-blue-200 dark:bg-blue-800 text-blue-800 dark:text-blue-200 px-2 py-0.5 rounded-full text-xs">
                          {[statusFilter, yearFilter, searchTerm].filter(Boolean).length}
                        </span>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {searchTerm && (
                          <span className="inline-flex items-center gap-1 px-2 py-1 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-md text-xs">
                            <i className="ri-search-line"></i>
                            "{searchTerm}"
                          </span>
                        )}
                        {statusFilter && (
                          <span className="inline-flex items-center gap-1 px-2 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 rounded-md text-xs">
                            <i className="ri-checkbox-line"></i>
                            {statusOptions.find(opt => opt.value === statusFilter)?.label || statusFilter}
                          </span>
                        )}
                        {yearFilter && (
                          <span className="inline-flex items-center gap-1 px-2 py-1 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 rounded-md text-xs">
                            <i className="ri-calendar-line"></i>
                            {yearFilter}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
            <div className="box-body px-6 py-4">
              <div className="overflow-x-auto">
                <div className="min-w-full inline-block align-middle">
                  {loading ? (
                    <div className="flex justify-center items-center min-h-[300px]">
                      <div className="animate-spin rounded-full h-10 w-10 border-4 border-primary border-l-transparent"></div>
                    </div>
                  ) : (
                    <>
                      <div className="mb-4 flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <div className="flex items-center gap-2 px-4 py-2 bg-primary/10 text-primary rounded-lg">
                            <i className="ri-flag-line text-xl"></i>
                            <span className="font-medium">Total Objectifs:</span>
                            <span className="font-bold">{pagination.total}</span>
                          </div>
                          {(statusFilter || yearFilter || searchTerm) && (
                            <div className="flex items-center gap-2 px-3 py-1 bg-amber-50 dark:bg-amber-900/20 text-amber-700 dark:text-amber-300 rounded-lg text-sm">
                              <i className="ri-filter-line"></i>
                              <span>Filtres actifs</span>
                              <span className="bg-amber-200 dark:bg-amber-800 text-amber-800 dark:text-amber-200 px-2 py-0.5 rounded-full text-xs font-medium">
                                {[statusFilter, yearFilter, searchTerm].filter(Boolean).length}
                              </span>
                            </div>
                          )}
                        </div>
                      </div>
                      <div className="overflow-hidden rounded-lg border border-gray-200 dark:border-gray-700">
                        <div className="overflow-x-auto">
                          <table className="ti-custom-table ti-custom-table-head w-full text-sm">
                            <thead className="bg-gray-50 dark:bg-black/20">
                              <tr className="h-14">
                                <th className="px-4 py-4 text-left font-semibold text-gray-700 dark:text-gray-300 cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors min-w-[200px]" onClick={() => handleSort('titre')}>
                                  <div className="flex items-center gap-2">
                                    Titre
                                    <i className="ri-arrow-up-down-line text-gray-400"></i>
                                  </div>
                                </th>
                                <th className="px-4 py-4 text-left font-semibold text-gray-700 dark:text-gray-300 cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors min-w-[180px]" onClick={() => handleSort('id_entite')}>
                                  <div className="flex items-center gap-2">
                                    Entité
                                    <i className="ri-arrow-up-down-line text-gray-400"></i>
                                  </div>
                                </th>
                                <th className="px-4 py-4 text-left font-semibold text-gray-700 dark:text-gray-300 cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors min-w-[180px]" onClick={() => handleSort('date_debut')}>
                                  <div className="flex items-center gap-2">
                                    Date début
                                    <i className="ri-arrow-up-down-line text-gray-400"></i>
                                  </div>
                                </th>
                                <th className="px-4 py-4 text-left font-semibold text-gray-700 dark:text-gray-300 cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors min-w-[180px]" onClick={() => handleSort('date_fin')}>
                                  <div className="flex items-center gap-2">
                                    Date fin
                                    <i className="ri-arrow-up-down-line text-gray-400"></i>
                                  </div>
                                </th>
                                <th className="px-4 py-4 text-left font-semibold text-gray-700 dark:text-gray-300 cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors min-w-[80px]" onClick={() => handleSort('poids')}>
                                  <div className="flex items-center gap-2">
                                    Poids
                                    <i className="ri-arrow-up-down-line text-gray-400"></i>
                                  </div>
                                </th>
                                <th className="px-4 py-4 text-left font-semibold text-gray-700 dark:text-gray-300 cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors min-w-[120px]" onClick={() => handleSort('status')}>
                                  <div className="flex items-center gap-2">
                                    <span>Statut</span>
                                    <div className="flex items-center gap-1">
                                      <span className="w-2 h-2 rounded-full bg-emerald-500" title="Ouvert"></span>
                                      <span className="w-2 h-2 rounded-full bg-blue-500" title="Planifié"></span>
                                      <span className="w-2 h-2 rounded-full bg-green-500" title="Terminé"></span>
                                      <span className="w-2 h-2 rounded-full bg-yellow-500" title="En attente"></span>
                                      <span className="w-2 h-2 rounded-full bg-red-500" title="Annulé"></span>
                                      <span className="w-2 h-2 rounded-full bg-gray-500" title="Non commencé"></span>
                                      <span className="w-2 h-2 rounded-full bg-purple-500" title="Action continue"></span>
                                      <span className="w-2 h-2 rounded-full bg-slate-500" title="Archivé"></span>
                                    </div>
                                    <i className="ri-arrow-up-down-line text-gray-400"></i>
                                  </div>
                                </th>
                                <th className="px-4 py-4 text-left font-semibold text-gray-700 dark:text-gray-300 min-w-[200px]">
                                  Observation
                                </th>
                                <th className="px-4 py-4 text-right font-semibold text-gray-700 dark:text-gray-300 min-w-[120px]">
                                  Actions
                                </th>
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                              {objectifs.length > 0 ? (
                                objectifs.map((objectif) => (
                                  <tr key={objectif.id} className="hover:bg-gray-50 dark:hover:bg-black/20 h-16 transition-colors">
                                    <td className="px-4 py-4 text-gray-900 dark:text-white font-medium">
                                      <div className="max-w-[180px] truncate" title={objectif.titre}>
                                        {objectif.titre}
                                      </div>
                                    </td>
                                    <td className="px-4 py-4 text-gray-700 dark:text-gray-300">
                                      <div className="max-w-[160px] truncate" title={objectif.entite?.company_name || '-'}>
                                        {objectif.entite?.company_name || '-'}
                                      </div>
                                    </td>
                                    <td className="px-4 py-4 text-gray-700 dark:text-gray-300">
                                      <div className="text-xs font-medium">
                                        <div className="text-gray-900 dark:text-white">{formatDate(objectif.date_debut)}</div>
                                      </div>
                                    </td>
                                    <td className="px-4 py-4 text-gray-700 dark:text-gray-300">
                                      <div className="text-xs font-medium">
                                        <div className="text-gray-900 dark:text-white">{formatDate(objectif.date_fin)}</div>
                                      </div>
                                    </td>
                                    <td className="px-4 py-4 text-gray-700 dark:text-gray-300">
                                      <div className="flex flex-col gap-2">
                                        <div className="flex items-center justify-between">
                                          <span className="text-sm font-semibold text-gray-900 dark:text-white">
                                            {objectif.poids}
                                          </span>
                                          <span className="text-xs font-medium px-2 py-1 rounded-full" style={{
                                            backgroundColor: getPoidsRange(objectif.poids).bgColor,
                                            color: getPoidsRange(objectif.poids).textColor
                                          }}>
                                            {getPoidsRange(objectif.poids).label}
                                          </span>
                                        </div>
                                        <div className="relative">
                                          <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                                            <div 
                                              className="h-2 rounded-full transition-all duration-300"
                                              style={{ 
                                                width: `${objectif.poids}%`,
                                                backgroundColor: getPoidsRange(objectif.poids).color
                                              }}
                                            ></div>
                                          </div>
                                          <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400 mt-1">
                                            <span>0</span>
                                            <span>50</span>
                                            <span>100</span>
                                          </div>
                                        </div>
                                      </div>
                                    </td>
                                    <td className="px-4 py-4">
                                      {(() => {
                                        const statusOption = statusOptions.find(opt => opt.value === objectif.status);
                                        const colorClasses = {
                                          'open': 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-900/20 dark:text-emerald-300 dark:border-emerald-700',
                                          'planned': 'bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-900/20 dark:text-blue-300 dark:border-blue-700',
                                          'completed': 'bg-green-50 text-green-700 border-green-200 dark:bg-green-900/20 dark:text-green-300 dark:border-green-700',
                                          'hold': 'bg-yellow-50 text-yellow-700 border-yellow-200 dark:bg-yellow-900/20 dark:text-yellow-300 dark:border-yellow-700',
                                          'canceled': 'bg-red-50 text-red-700 border-red-200 dark:bg-red-900/20 dark:text-red-300 dark:border-red-700',
                                          'not_started': 'bg-gray-50 text-gray-700 border-gray-200 dark:bg-gray-900/20 dark:text-gray-300 dark:border-gray-700',
                                          'continuous_action': 'bg-purple-50 text-purple-700 border-purple-200 dark:bg-purple-900/20 dark:text-purple-300 dark:border-purple-700',
                                          'archived': 'bg-slate-50 text-slate-700 border-slate-200 dark:bg-slate-900/20 dark:text-slate-300 dark:border-slate-700'
                                        };
                                        
                                        return (
                                          <span className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium border ${colorClasses[objectif.status] || colorClasses['not_started']}`}>
                                            <i className={`${statusOption?.icon || 'ri-question-line'}`}></i>
                                            {statusOption?.label || objectif.status}
                                          </span>
                                        );
                                      })()}
                                    </td>
                                    <td className="px-4 py-4 text-gray-600 dark:text-gray-400">
                                      <div className="max-w-[180px] truncate" title={objectif.observation || 'Aucune observation'}>
                                        {objectif.observation || '-'}
                                      </div>
                                    </td>
                                    <td className="px-4 py-4 text-right">
                                      <div className="flex justify-end space-x-2">
                                        <button
                                          onClick={() => handleUpdate(objectif)}
                                          className="ti-btn rounded-full bg-primary/10 text-primary hover:bg-primary hover:text-white transition-all duration-200 w-8 h-8 flex items-center justify-center"
                                          title="Modifier l'objectif"
                                        >
                                          <i className="ri-pencil-line text-sm"></i>
                                        </button>
                                        <button
                                          onClick={() => handleDelete(objectif)}
                                          className="ti-btn rounded-full bg-danger/10 text-danger hover:bg-danger hover:text-white transition-all duration-200 w-8 h-8 flex items-center justify-center"
                                          title="Supprimer l'objectif"
                                        >
                                          <i className="ri-delete-bin-line text-sm"></i>
                                        </button>
                                      </div>
                                    </td>
                                  </tr>
                                ))
                              ) : (
                                <tr>
                                  <td colSpan="8" className="px-6 py-16 text-center">
                                    <div className="flex flex-col items-center justify-center text-gray-500 dark:text-gray-400">
                                      <i className="ri-inbox-line text-4xl mb-4 text-gray-300 dark:text-gray-600"></i>
                                      <p className="text-lg font-medium mb-2">Aucun objectif trouvé</p>
                                      <p className="text-sm">Commencez par créer votre premier objectif</p>
                                    </div>
                                  </td>
                                </tr>
                              )}
                            </tbody>
                          </table>
                        </div>
                      </div>
                    </>
                  )}
                </div>
              </div>
              {objectifs.length > 0 && (
                <div className="mt-6 sm:mt-8 border-t border-gray-200 dark:border-gray-700 pt-6">
                  <CustomPagination
                    current={pagination.current}
                    total={pagination.total}
                    perPage={pagination.perPage}
                    lastPage={pagination.lastPage}
                    onPageChange={handlePageChange}
                    className="w-full overflow-x-auto flex justify-center"
                  />
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Modal for Create/Edit Objectif */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg w-full max-w-lg p-6">
            <h3 className="text-xl font-semibold mb-4 text-gray-800 dark:text-white">
              {isUpdated ? 'Modifier l\'Objectif' : 'Créer un Objectif'}
            </h3>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Titre <span className="Attention-text">*</span></label>
                <input
                  type="text"
                  name="titre"
                  value={formData.titre}
                  onChange={handleInputChange}
                  className={`w-full px-4 border rounded-lg focus:ring-2 dark:bg-gray-700 dark:text-white ${errors.titre ? 'input-error' : 'border-gray-300 dark:border-gray-600 focus:ring-primary focus:border-primary'}`}
                />
                {errors.titre && (
                  <div className="error-message">
                    <i className="ri-error-warning-line error-icon"></i>
                    <span className="error-text">{errors.titre}</span>
                  </div>
                )}
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Entité <span className="Attention-text">*</span></label>
                <div className="custom-select form-select">
                  <select
                    name="id_entite"
                    value={formData.id_entite}
                    onChange={handleInputChange}
                    className="custom-select select"
                  >
                    <option value="">Sélectionner une entité</option>
                    {entities.map(ent => (
                      <option key={ent.id} value={ent.id}>{ent.company_name}</option>
                    ))}
                  </select>
                </div>
                {errors.id_entite && (
                  <div className="error-message">
                    <i className="ri-error-warning-line error-icon"></i>
                    <span className="error-text">{errors.id_entite}</span>
                  </div>
                )}
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Date début <span className="Attention-text">*</span></label>
                  <input
                    type="date"
                    name="date_debut"
                    value={formatDateForInput(formData.date_debut)}
                    onChange={handleInputChange}
                    className={`w-full px-4 border rounded-lg focus:ring-2 dark:bg-gray-700 dark:text-white ${errors.date_debut ? 'input-error' : 'border-gray-300 dark:border-gray-600 focus:ring-primary focus:border-primary'}`}
                  />
                  {errors.date_debut && (
                    <div className="error-message">
                      <i className="ri-error-warning-line error-icon"></i>
                      <span className="error-text">{errors.date_debut}</span>
                    </div>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Date fin <span className="Attention-text">*</span></label>
                  <input
                    type="date"
                    name="date_fin"
                    value={formatDateForInput(formData.date_fin)}
                    onChange={handleInputChange}
                    className={`w-full px-4 border rounded-lg focus:ring-2 dark:bg-gray-700 dark:text-white ${errors.date_fin ? 'input-error' : 'border-gray-300 dark:border-gray-600 focus:ring-primary focus:border-primary'}`}
                  />
                  {errors.date_fin && (
                    <div className="error-message">
                      <i className="ri-error-warning-line error-icon"></i>
                      <span className="error-text">{errors.date_fin}</span>
                    </div>
                  )}
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Poids <span className="Attention-text">*</span></label>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-semibold" style={{color: 'var(--default-text-color)'}}>
                        {formData.poids || 0}
                      </span>
                      <span className="text-xs font-medium px-2 py-1 rounded-full" style={{
                        backgroundColor: formData.poids ? getPoidsRange(formData.poids).bgColor : 'rgba(134, 153, 163, 0.1)',
                        color: formData.poids ? getPoidsRange(formData.poids).textColor : 'var(--gray)'
                      }}>
                        {formData.poids ? getPoidsRange(formData.poids).label : 'Non défini'}
                      </span>
                    </div>
                    <div className="relative">
                      <input
                        type="range"
                        name="poids"
                        min="1"
                        max="100"
                        value={formData.poids || 0}
                        onChange={handleInputChange}
                        className="w-full h-2 rounded-lg appearance-none cursor-pointer"
                      />
                      <div className="flex justify-between text-xs mt-2" style={{color: 'var(--text-muted)'}}>
                        <span>1</span>
                        <span>25</span>
                        <span>50</span>
                        <span>75</span>
                        <span>100</span>
                      </div>
                    </div>
                    <input
                      type="hidden"
                      name="poids"
                      value={formData.poids || ''}
                      onChange={handleInputChange}
                    />
                  </div>
                  {errors.poids && (
                    <div className="error-message">
                      <i className="ri-error-warning-line error-icon"></i>
                      <span className="error-text">{errors.poids}</span>
                    </div>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Statut <span className="Attention-text">*</span></label>
                  <div className="custom-select form-select">
                    <select
                      name="status"
                      value={formData.status}
                      onChange={handleInputChange}
                      className="custom-select select"
                    >
                      <option value="">Sélectionner un statut</option>
                      {statusOptions.map(opt => (
                        <option key={opt.value} value={opt.value}>{opt.label}</option>
                      ))}
                    </select>
                  </div>
                  {errors.status && (
                    <div className="error-message">
                      <i className="ri-error-warning-line error-icon"></i>
                      <span className="error-text">{errors.status}</span>
                    </div>
                  )}
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Observation</label>
                <textarea
                  name="observation"
                  value={formData.observation}
                  onChange={handleInputChange}
                  className={`w-full px-4 border rounded-lg focus:ring-2 dark:bg-gray-700 dark:text-white ${errors.observation ? 'input-error' : 'border-gray-300 dark:border-gray-600 focus:ring-primary focus:border-primary'}`}
                  rows={3}
                  placeholder="Description optionnelle de l'objectif..."
                />
                {errors.observation && (
                  <div className="error-message">
                    <i className="ri-error-warning-line error-icon"></i>
                    <span className="error-text">{errors.observation}</span>
                  </div>
                )}
              </div>
              <div className="flex justify-end gap-2 mt-4">
                <button
                  type="button"
                  className="ti-btn ti-btn-secondary-full"
                  onClick={() => setShowModal(false)}
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className={`ti-btn ti-btn-primary-full ${isSubmitting ? 'opacity-50 cursor-wait' : ''}`}
                >
                  {isSubmitting ? (isUpdated ? 'Modification...' : 'Création...') : (isUpdated ? 'Modifier' : 'Créer')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {objectifToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg w-full max-w-md p-6">
            <h3 className="text-lg font-semibold mb-4 text-gray-800 dark:text-white">Confirmer la Suppression</h3>
            <p className="mb-4">Êtes-vous sûr de vouloir supprimer l'objectif <span className="font-bold">{objectifToDelete.titre}</span> ? Cette action ne peut pas être annulée.</p>
            <div className="flex justify-end gap-2">
              <button
                type="button"
                className="ti-btn ti-btn-secondary-full"
                onClick={() => setObjectifToDelete(null)}
              >
                Annuler
              </button>
              <button
                type="button"
                className="ti-btn ti-btn-danger-full"
                onClick={handleDeleteConfirm}
              >
                Supprimer
              </button>
            </div>
          </div>
        </div>
      )}
    </Fragment>
  );
};

export default Objectifs; 