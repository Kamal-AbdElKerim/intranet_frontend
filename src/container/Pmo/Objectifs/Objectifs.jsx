import { Fragment, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Pageheader from '../../../components/common/pageheader/pageheader';
import ToastService from '../../../components/utile/toastService';
import CustomPagination from '../../../components/utile/CustomPagination';
import '../../../styles/table.css';
import '../../../styles/error.css';
import axiosInstance from '../../../Interceptor/axiosInstance';
import { ToastContainer } from 'react-toastify';
import * as XLSX from 'xlsx';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

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
  { value: 'open', label: 'Ouvert', icon: 'ri-checkbox-circle-line', color: 'emerald', customColor: '#12c60c' },
  { value: 'planned', label: 'Planifié', icon: 'ri-calendar-line', color: 'blue', customColor: '#1e90ff' },
  { value: 'completed', label: 'Terminé', icon: 'ri-check-double-line', color: 'green', customColor: '#0cbf4d' },
  { value: 'hold', label: 'En attente', icon: 'ri-pause-circle-line', color: 'yellow', customColor: '#f5b849' },
  { value: 'canceled', label: 'Annulé', icon: 'ri-close-circle-line', color: 'red', customColor: '#e6533c' },
  { value: 'not_started', label: 'Non commencé', icon: 'ri-time-line', color: 'gray', customColor: '#6b7280' },
  { value: 'continuous_action', label: 'Action continue', icon: 'ri-refresh-line', color: 'purple', customColor: '#a259e6' },
  { value: 'archived', label: 'Archivé', icon: 'ri-archive-line', color: 'slate', customColor: '#64748b' },
];

// Date formatting function
const formatDate = (dateString) => {
  if (!dateString) return '-';
  const date = new Date(dateString);
  if (isNaN(date.getTime())) return '-';
  
  const year = date.getFullYear();
  const month = (date.getMonth() + 1).toString().padStart(2, '0');
  const day = date.getDate().toString().padStart(2, '0');
  
  return `${year}/${month}/${day}`;
};

// Helper function to format date for HTML date input (YYYY-MM-DD)
const formatDateForInput = (dateString) => {
  if (!dateString) return '';
  const date = new Date(dateString);
  if (isNaN(date.getTime())) return '';
  const inputYear = date.getFullYear();
  const inputMonth = (date.getMonth() + 1).toString().padStart(2, '0');
  const inputDay = date.getDate().toString().padStart(2, '0');
  return `${inputYear}-${inputMonth}-${inputDay}`;
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
  const [exportingExcel, setExportingExcel] = useState(false);
  const [exportingPDF, setExportingPDF] = useState(false);
  const [objectifToView, setObjectifToView] = useState(null);
  const [showViewModal, setShowViewModal] = useState(false);
  const [showProjectsModal, setShowProjectsModal] = useState(false);
  const [years, setYears] = useState([]);

  const navigate = useNavigate();

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
        console.log(data);
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

  // Fetch years from database
  const fetchYears = async () => {
    try {
      const response = await axiosInstance.get('/pmo/objectifs/years');
      console.log(response.data);
      if (response.data?.status === 'success' && Array.isArray(response.data.data)) {
        setYears(response.data.data);
        if (response.data.data.length === 0) {
          console.log('No years found in database');
        }
      } else {
        console.error('Invalid response format:', response.data);
        ToastService.error('Format de données des années invalide');
        setYears([]);
      }
    } catch (error) {
      console.error('Error fetching years:', error);
      ToastService.error('Erreur lors du chargement des années');
      setYears([]);
    }
  };

  useEffect(() => {
    fetchObjectifs(1, '', '', '');
    fetchEntities();
    fetchYears();
    // eslint-disable-next-line
  }, []);

  // Prevent body scroll when modals are open
  useEffect(() => {
    if (showModal || showViewModal || showProjectsModal) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }

    // Cleanup function to restore scroll when component unmounts
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [showModal, showViewModal, showProjectsModal]);

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

  const handleView = (objectif) => {
    setObjectifToView(objectif);
    setShowViewModal(true);
  };

  const handleProjectNavigation = (project) => {
    setShowProjectsModal(false);
    setShowViewModal(false);
    navigate(`/Pmo/Projects/${project.id}`);
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
      setExportingExcel(true);
      
      // Fetch ALL filtered data for export (not just current page)
      const queryParams = new URLSearchParams({
        page: 1,
        per_page: 10000, // Large number to get all data
        search: searchTerm || '',
        sort_key: sortConfig.key || '',
        sort_direction: sortConfig.direction || 'desc',
        status: statusFilter || '',
        year: yearFilter || '',
        export: 'true' // Flag to indicate this is for export
      }).toString();
      
      const response = await axiosInstance.get(`/pmo/objectifs?${queryParams}`);
      
      if (response.data?.status !== 'success' || !response.data?.data?.data) {
        throw new Error('Erreur lors de la récupération des données');
      }
      
      const allObjectifs = response.data.data.data;
      
      // Create Excel data from ALL filtered objectifs - simple table format
      const excelData = allObjectifs.map(objectif => ({
        'Titre': objectif.titre || '',
        'Entité': objectif.entite?.company_name || '',
        'Date début': formatDate(objectif.date_debut) || '',
        'Date fin': formatDate(objectif.date_fin) || '',
        'Poids': objectif.poids || '',
        'Statut': statusOptions.find(opt => opt.value === objectif.status)?.label || objectif.status || '',
        'Observation': objectif.observation || ''
      }));

      // Create workbook and worksheet with headers
      const workbook = XLSX.utils.book_new();
      const worksheet = XLSX.utils.json_to_sheet(excelData);

      // Set column widths
      const columnWidths = [
        { wch: 35 }, // Titre
        { wch: 25 }, // Entité
        { wch: 20 }, // Date début
        { wch: 20 }, // Date fin
        { wch: 10 }, // Poids
        { wch: 15 }, // Statut
        { wch: 40 }  // Observation
      ];
      worksheet['!cols'] = columnWidths;

      // Add worksheet to workbook
      XLSX.utils.book_append_sheet(workbook, worksheet, 'Objectifs');

      // Generate filename with filters
      let filename = 'objectifs';
      if (statusFilter) filename += `_${statusFilter}`;
      if (yearFilter) filename += `_${yearFilter}`;
      if (searchTerm) filename += `_recherche`;
      filename += `_${new Date().toISOString().split('T')[0]}.xlsx`;

      // Save file
      XLSX.writeFile(workbook, filename);
      
      ToastService.success(`Export Excel réussi: ${allObjectifs.length} objectifs exportés`);
    } catch (error) {
      console.error('Export Excel error:', error);
      ToastService.error('Erreur lors de l\'export Excel: ' + (error.message || 'Erreur inconnue'));
    } finally {
      setExportingExcel(false);
    }
  };

  const handleExportPDF = async () => {
    try {
      setExportingPDF(true);
      
      // Fetch ALL filtered data for export (not just current page)
      const queryParams = new URLSearchParams({
        page: 1,
        per_page: 10000, // Large number to get all data
        search: searchTerm || '',
        sort_key: sortConfig.key || '',
        sort_direction: sortConfig.direction || 'desc',
        status: statusFilter || '',
        year: yearFilter || '',
        export: 'true' // Flag to indicate this is for export
      }).toString();
      
      const response = await axiosInstance.get(`/pmo/objectifs?${queryParams}`);
      
      if (response.data?.status !== 'success' || !response.data?.data?.data) {
        throw new Error('Erreur lors de la récupération des données');
      }
      
      const allObjectifs = response.data.data.data;
      
      const doc = new jsPDF();
      
      // Add title
      doc.setFontSize(16);
      doc.setTextColor(59, 130, 246); // Blue color
      doc.text('Objectifs', 14, 22);
      
      // Prepare table data - simple format like Excel
      const tableData = allObjectifs.map(objectif => [
        objectif.titre || '-',
        objectif.entite?.company_name || '-',
        formatDate(objectif.date_debut) || '-',
        formatDate(objectif.date_fin) || '-',
        objectif.poids || '-',
        statusOptions.find(opt => opt.value === objectif.status)?.label || objectif.status || '-',
        objectif.observation || '-'
      ]);
      
      // Add table with simple styling
      autoTable(doc, {
        head: [['Titre', 'Entité', 'Date début', 'Date fin', 'Poids', 'Statut', 'Observation']],
        body: tableData,
        startY: 30,
        styles: {
          fontSize: 9,
          cellPadding: 3,
        },
        headStyles: {
          fillColor: [59, 130, 246],
          textColor: 255,
          fontStyle: 'bold',
        },
        columnStyles: {
          0: { cellWidth: 40 }, // Titre
          1: { cellWidth: 30 }, // Entité
          2: { cellWidth: 25 }, // Date début
          3: { cellWidth: 25 }, // Date fin
          4: { cellWidth: 15 }, // Poids
          5: { cellWidth: 20 }, // Statut
          6: { cellWidth: 30 }, // Observation
        },
        didDrawPage: function (data) {
          // Add page number
          doc.setFontSize(10);
          doc.setTextColor(107, 114, 128);
          doc.text(
            `Page ${doc.internal.getNumberOfPages()}`,
            data.settings.margin.left,
            doc.internal.pageSize.height - 10
          );
        }
      });
      
      // Generate filename with filters
      let filename = 'objectifs';
      if (statusFilter) filename += `_${statusFilter}`;
      if (yearFilter) filename += `_${yearFilter}`;
      if (searchTerm) filename += `_recherche`;
      filename += `_${new Date().toISOString().split('T')[0]}.pdf`;
      
      // Save file
      doc.save(filename);
      
      ToastService.success(`Export PDF réussi: ${allObjectifs.length} objectifs exportés`);
    } catch (error) {
      console.error('Export PDF error:', error);
      ToastService.error('Erreur lors de l\'export PDF: ' + (error.message || 'Erreur inconnue'));
    } finally {
      setExportingPDF(false);
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
              
    {/* Export Buttons */}
    <div className="flex items-center gap-3">
                      {/* Excel Export Button */}
                      <button
                        onClick={handleExportExcel}
                        disabled={loading || objectifs.length === 0 || exportingExcel}
                        className="relative flex items-center gap-2 px-5 py-3 bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 disabled:from-emerald-300 disabled:to-emerald-400 text-white rounded-xl font-semibold text-sm transition-all duration-300 shadow-lg hover:shadow-xl disabled:cursor-not-allowed disabled:opacity-50 group overflow-hidden"
                        title="Exporter vers Excel"
                      >
                        {/* Loading spinner */}
                        {exportingExcel && (
                          <div className="absolute inset-0 bg-emerald-600/80 flex items-center justify-center rounded-xl">
                            <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent"></div>
                          </div>
                        )}
                        
                        {/* Button content */}
                        <div className="flex items-center gap-2">
                          <i className={`ri-file-excel-2-line text-lg transition-transform ${exportingExcel ? 'animate-pulse' : 'group-hover:scale-110'}`}></i>
                          <span>{exportingExcel ? 'Export...' : 'Excel'}</span>
                        </div>
                        
                        {/* Shine effect */}
                        <div className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/20 to-transparent group-hover:translate-x-full transition-transform duration-1000"></div>
                      </button>
                      
                      {/* PDF Export Button */}
                      <button
                        onClick={handleExportPDF}
                        disabled={loading || objectifs.length === 0 || exportingPDF}
                        className="relative flex items-center gap-2 px-5 py-3 bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 disabled:from-red-300 disabled:to-red-400 text-white rounded-xl font-semibold text-sm transition-all duration-300 shadow-lg hover:shadow-xl disabled:cursor-not-allowed disabled:opacity-50 group overflow-hidden"
                        title="Télécharger PDF" 
                        style={{
                          background: 'rgb(129 22 22 / 96%)',
                        }}
                      >
                        {/* Loading spinner */}
                        {exportingPDF && (
                          <div className="absolute inset-0 bg-red-600/80 flex items-center justify-center rounded-xl">
                            <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent"></div>
                          </div>
                        )}
                        
                        {/* Button content */}
                        <div className="flex items-center gap-2">
                          <i className={`ri-file-pdf-line text-lg transition-transform ${exportingPDF ? 'animate-pulse' : 'group-hover:scale-110'}`}></i>
                          <span>{exportingPDF ? 'Export...' : 'PDF'}</span>
                        </div>
                        
                        {/* Shine effect */}
                        <div className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/20 to-transparent group-hover:translate-x-full transition-transform duration-1000"></div>
                      </button>
                      
                      {/* Export Info Tooltip */}
                      {/* {(objectifs.length > 0) && (
                        <div className="flex items-center gap-1 px-3 py-1.5 bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300 rounded-lg text-xs font-medium border border-blue-200 dark:border-blue-700">
                          <i className="ri-information-line"></i>
                          <span>Export complet avec filtres</span>
                        </div>
                      )} */}
                    </div>

                  <button
                    onClick={handleAddObjectif}
                    className="ti-btn ti-btn-primary-full ti-btn-wave"
                  >
                    <i className="ri-add-line me-2"></i>
                    Ajouter un Objectif
                  </button>
                </div>
              </div>
              
              {/* Filters Section */}
              <div className="w-full mt-5 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-gray-800 dark:to-gray-900 border border-blue-200 dark:border-gray-700 rounded-xl p-6 shadow-sm">
                <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
                  {/* Search Input */}
                  <div className="flex items-center gap-2 w-full lg:w-auto lg:min-w-[300px]">
                    <div className="relative flex-1 lg:flex-none lg:w-64">
                      <input
                        type="text"
                        placeholder="Rechercher un objectif..."
                        value={searchTerm}
                        onChange={e => setSearchTerm(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') {
                            handleSearch();
                          }
                        }}
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
                      className="ti-btn ti-btn-icon ti-btn-primary-full ti-btn-wave"
                      title="Rechercher"
                    >
                      <i className="ri-search-line"></i>
                    </button>
                  </div>
                  
                  {/* Filter Controls */}
                  <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4 w-full lg:w-auto">
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
                          {years.map(year => (
                            <option key={year} value={year}>{year}</option>
                          ))}
                        </select>
                      </div>
                    </div>
                    
                    {/* Clear Filters Button */}
                    {(statusFilter || yearFilter || searchTerm) && (
                      <button
                        onClick={handleClearFilters}
                        className="ti-btn ti-btn-outline-danger ti-btn-wave"
                      >
                        <i className="ri-refresh-line"></i>
                        {/* Effacer les filtres */}
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
                                        const customColor = statusOption?.customColor;
                                        return (
                                          <span
                                            className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium border ${!customColor ? (colorClasses[objectif.status] || colorClasses['not_started']) : ''}`}
                                            style={customColor ? {
                                              backgroundColor: customColor + '20', // transparent bg
                                              color: customColor,
                                              borderColor: customColor
                                            } : {}}
                                          >
                                            <i className={`${statusOption?.icon || 'ri-question-line'}`}></i>
                                            {statusOption?.label || objectif.status}
                                          </span>
                                        );
                                      })()}
                                    </td>
                                    <td className="px-4 py-4 text-right">
                                      <div className="flex justify-end space-x-2">
                                        <button
                                          onClick={() => handleView(objectif)}
                                          className="ti-btn ti-btn-icon ti-btn-info-full ti-btn-wave"
                                          title="Voir les détails"
                                        >
                                          <i className="ri-eye-line"></i>
                                        </button>
                                        <button
                                          onClick={() => handleUpdate(objectif)}
                                          className="ti-btn ti-btn-icon ti-btn-primary-full ti-btn-wave"
                                          title="Modifier l'objectif"
                                        >
                                          <i className="ri-pencil-line"></i>
                                        </button>
                                        <button
                                          onClick={() => handleDelete(objectif)}
                                          className="ti-btn ti-btn-icon ti-btn-danger-full ti-btn-wave"
                                          title="Supprimer l'objectif"
                                        >
                                          <i className="ri-delete-bin-line"></i>
                                        </button>
                                      </div>
                                    </td>
                                  </tr>
                                ))
                              ) : (
                                <tr>
                                  <td colSpan="6" className="px-6 py-16 text-center">
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
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50"
          onClick={(e) => {
            if (e.target === e.currentTarget) {
              setShowModal(false);
            }
          }}
        >
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
                  className="ti-btn ti-btn-secondary-full ti-btn-wave"
                  onClick={() => setShowModal(false)}
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className={`ti-btn ti-btn-primary-full ti-btn-wave ${isSubmitting ? 'ti-btn-loader' : ''}`}
                >
                  {isSubmitting && (
                    <span className="loading me-2">
                      <i className="ri-loader-2-fill animate-spin"></i>
                    </span>
                  )}
                  {isSubmitting ? (isUpdated ? 'Modification...' : 'Création...') : (isUpdated ? 'Modifier' : 'Créer')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {objectifToDelete && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50"
          onClick={(e) => {
            if (e.target === e.currentTarget) {
              setObjectifToDelete(null);
            }
          }}
        >
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg w-full max-w-md p-6">
            <h3 className="text-lg font-semibold mb-4 text-gray-800 dark:text-white">Confirmer la Suppression</h3>
            <p className="mb-4">Êtes-vous sûr de vouloir supprimer l'objectif <span className="font-bold">{objectifToDelete.titre}</span> ? Cette action ne peut pas être annulée.</p>
            <div className="flex justify-end gap-2">
              <button
                type="button"
                className="ti-btn ti-btn-secondary-full ti-btn-wave"
                onClick={() => setObjectifToDelete(null)}
              >
                Annuler
              </button>
              <button
                type="button"
                className="ti-btn ti-btn-danger-full ti-btn-wave"
                onClick={handleDeleteConfirm}
              >
                <i className="ri-delete-bin-line me-2"></i>
                Supprimer
              </button>
            </div>
          </div>
        </div>
      )}

      {/* View Objective Details Modal */}
      {showViewModal && objectifToView && (
        <div 
          className="fixed inset-0 z-[9999] flex items-center justify-center bg-black bg-opacity-50 p-2 sm:p-4"
          onClick={(e) => {
            if (e.target === e.currentTarget) {
              setShowViewModal(false);
            }
          }}
        >
          <div className="bg-white dark:bg-gray-800 rounded-xl sm:rounded-2xl shadow-2xl w-full max-w-4xl lg:max-w-5xl xl:max-w-6xl max-h-[95vh] sm:max-h-[90vh] overflow-hidden relative">
            {/* Modal Header */}
            <div className="bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 px-4 sm:px-6 lg:px-8 py-4 sm:py-6  relative overflow-hidden z-10">
              {/* Background Pattern */}
              <div className="absolute inset-0 opacity-10">
                <div className="absolute top-0 left-0 w-20 h-20 sm:w-32 sm:h-32 bg-white rounded-full -translate-x-8 -translate-y-8 sm:-translate-x-16 sm:-translate-y-16"></div>
                <div className="absolute bottom-0 right-0 w-16 h-16 sm:w-24 sm:h-24 bg-white rounded-full translate-x-8 translate-y-8 sm:translate-x-12 sm:translate-y-12"></div>
                <div className="absolute top-1/2 left-1/2 w-12 h-12 sm:w-16 sm:h-16 bg-white rounded-full -translate-x-6 -translate-y-6 sm:-translate-x-8 sm:-translate-y-8"></div>
              </div>
              
              <div className="relative flex items-center justify-between z-20">
                <div className="flex items-center gap-2 sm:gap-4">
                  <div className="flex items-center justify-center w-10 h-10 sm:w-12 sm:h-12 lg:w-14 lg:h-14 bg-white/20 rounded-lg sm:rounded-xl backdrop-blur-sm">
                    <i className="ri-flag-line text-xl sm:text-2xl lg:text-3xl"></i>
                  </div>
                  <div>
                    <h2 className="text-xl sm:text-2xl lg:text-3xl font-bold mb-1">Détails de l'Objectif</h2>
                    <p className="text-blue-100 text-sm sm:text-base lg:text-lg">Informations complètes et détaillées</p>
                  </div>
                </div>
                <button
                  onClick={() => setShowViewModal(false)}
                  className="flex items-center justify-center w-10 h-10 sm:w-12 sm:h-12 bg-white/20 hover:bg-white/30 rounded-lg sm:rounded-xl transition-all duration-200 backdrop-blur-sm z-30"
                >
                  <i className="ri-close-line text-lg sm:text-xl lg:text-2xl"></i>
                </button>
              </div>
            </div>

            {/* Modal Body */}
            <div className="p-4 sm:p-6 lg:p-8 overflow-y-auto max-h-[calc(95vh-120px)] sm:max-h-[calc(90vh-200px)]">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6 lg:gap-8">
                {/* Left Column */}
                <div className="space-y-4 sm:space-y-6">
                  {/* Basic Information */}
                  <div className="bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-gray-700 dark:to-gray-800 rounded-xl sm:rounded-2xl p-4 sm:p-6 border border-blue-200 dark:border-gray-600 shadow-lg">
                    <div className="flex items-center gap-2 sm:gap-3 mb-4 sm:mb-6">
                      <div className="flex items-center justify-center w-10 h-10 sm:w-12 sm:h-12 bg-blue-100 dark:bg-blue-900/30 rounded-lg sm:rounded-xl">
                        <i className="ri-information-line text-lg sm:text-xl lg:text-2xl text-blue-600 dark:text-blue-400"></i>
                      </div>
                      <div>
                        <h3 className="text-lg sm:text-xl font-bold text-gray-900 dark:text-white">Informations Générales</h3>
                        <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">Détails de base de l'objectif</p>
                      </div>
                    </div>
                    
                    <div className="space-y-3 sm:space-y-4">
                      <div>
                        <label className="block text-xs sm:text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1 sm:mb-2">Titre de l'Objectif</label>
                        <div className="text-sm sm:text-base lg:text-lg font-bold text-gray-900 dark:text-white bg-white dark:bg-gray-600 px-3 sm:px-4 py-2 sm:py-3 rounded-lg sm:rounded-xl border-2 border-blue-200 dark:border-gray-500 shadow-sm">
                          {objectifToView.titre}
                        </div>
                      </div>
                      
                      <div>
                        <label className="block text-xs sm:text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1 sm:mb-2">Entité Responsable</label>
                        <div className="flex items-center gap-2 sm:gap-3 bg-white dark:bg-gray-600 px-3 sm:px-4 py-2 sm:py-3 rounded-lg sm:rounded-xl border-2 border-blue-200 dark:border-gray-500 shadow-sm">
                          <div className="flex items-center justify-center w-8 h-8 sm:w-10 sm:h-10 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                            <i className="ri-building-line text-blue-600 dark:text-blue-400 text-sm sm:text-lg"></i>
                          </div>
                          <span className="text-sm sm:text-base lg:text-lg font-semibold text-gray-900 dark:text-white">
                            {objectifToView.entite?.company_name || 'Non assignée'}
                          </span>
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                        <div>
                          <label className="block text-xs sm:text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1 sm:mb-2">Date de Début</label>
                          <div className="flex items-center gap-2 sm:gap-3 bg-white dark:bg-gray-600 px-3 sm:px-4 py-2 sm:py-3 rounded-lg sm:rounded-xl border-2 border-green-200 dark:border-gray-500 shadow-sm">
                            <i className="ri-calendar-line text-lg sm:text-xl lg:text-2xl text-green-500"></i>
                            <span className="text-sm sm:text-base lg:text-lg font-semibold text-gray-900 dark:text-white">
                              {formatDate(objectifToView.date_debut)}
                            </span>
                          </div>
                        </div>
                        
                        <div>
                          <label className="block text-xs sm:text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1 sm:mb-2">Date de Fin</label>
                          <div className="flex items-center gap-2 sm:gap-3 bg-white dark:bg-gray-600 px-3 sm:px-4 py-2 sm:py-3 rounded-lg sm:rounded-xl border-2 border-red-200 dark:border-gray-500 shadow-sm">
                            <i className="ri-calendar-line text-lg sm:text-xl lg:text-2xl text-red-500"></i>
                            <span className="text-sm sm:text-base lg:text-lg font-semibold text-gray-900 dark:text-white">
                              {formatDate(objectifToView.date_fin)}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Status and Priority */}
                  <div className="bg-gradient-to-br from-purple-50 to-pink-50 dark:from-gray-700 dark:to-gray-800 rounded-xl sm:rounded-2xl p-4 sm:p-6 border border-purple-200 dark:border-gray-600 shadow-lg">
                    <div className="flex items-center gap-2 sm:gap-3 mb-4 sm:mb-6">
                      <div className="flex items-center justify-center w-10 h-10 sm:w-12 sm:h-12 bg-purple-100 dark:bg-purple-900/30 rounded-lg sm:rounded-xl">
                        <i className="ri-dashboard-line text-lg sm:text-xl lg:text-2xl text-purple-600 dark:text-purple-400"></i>
                      </div>
                      <div>
                        <h3 className="text-lg sm:text-xl font-bold text-gray-900 dark:text-white">Statut & Priorité</h3>
                        <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">État actuel et niveau d'importance</p>
                      </div>
                    </div>
                    
                    <div className="space-y-4 sm:space-y-6">
                      <div>
                        <label className="block text-xs sm:text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2 sm:mb-3">Statut Actuel</label>
                        {(() => {
                          const statusOption = statusOptions.find(opt => opt.value === objectifToView.status);
                          const customColor = statusOption?.customColor;
                          return (
                            <div className="flex items-center gap-2 sm:gap-3">
                              <span
                                className={`inline-flex items-center gap-2 sm:gap-3 px-3 sm:px-4 lg:px-6 py-2 sm:py-3 rounded-lg sm:rounded-xl text-sm sm:text-base lg:text-lg font-bold border-2 shadow-lg ${!customColor ? 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-900/20 dark:text-emerald-300 dark:border-emerald-700' : ''}`}
                                style={customColor ? {
                                  backgroundColor: customColor + '20',
                                  color: customColor,
                                  borderColor: customColor
                                } : {}}
                              >
                                <i className={`${statusOption?.icon || 'ri-question-line'} text-lg sm:text-xl`}></i>
                                {statusOption?.label || objectifToView.status}
                              </span>
                            </div>
                          );
                        })()}
                      </div>
                      
                      <div>
                        <label className="block text-xs sm:text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2 sm:mb-3">Niveau de Priorité</label>
                        <div className="space-y-3 sm:space-y-4">
                          <div className="flex items-center justify-between">
                            <span className="text-sm sm:text-base lg:text-lg font-semibold text-gray-700 dark:text-gray-300">Poids: {objectifToView.poids}%</span>
                            <span className="text-xs sm:text-sm font-bold px-2 sm:px-3 lg:px-4 py-1 sm:py-2 rounded-full shadow-lg" style={{
                              backgroundColor: getPoidsRange(objectifToView.poids).bgColor,
                              color: getPoidsRange(objectifToView.poids).textColor
                            }}>
                              {getPoidsRange(objectifToView.poids).label}
                            </span>
                          </div>
                          <div className="relative">
                            <div className="w-full bg-gray-200 dark:bg-gray-600 rounded-full h-3 sm:h-4 shadow-inner">
                              <div 
                                className="h-3 sm:h-4 rounded-full transition-all duration-500 shadow-lg"
                                style={{ 
                                  width: `${objectifToView.poids}%`,
                                  backgroundColor: getPoidsRange(objectifToView.poids).color
                                }}
                              ></div>
                            </div>
                            <div className="flex justify-between text-xs sm:text-sm text-gray-500 dark:text-gray-400 font-medium mt-1 sm:mt-2">
                              <span>Faible (1-20)</span>
                              <span>Moyen (21-50)</span>
                              <span>Élevé (51-80)</span>
                              <span>Critique (81-100)</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Right Column */}
                <div className="space-y-4 sm:space-y-6">
                  {/* Associated Projects */}
                  {objectifToView.projects && objectifToView.projects.length > 0 && (
                    <div 
                      className="bg-gradient-to-br from-orange-50 to-red-50 dark:from-gray-700 dark:to-gray-800 rounded-xl sm:rounded-2xl p-4 sm:p-6 border border-orange-200 dark:border-gray-600 shadow-lg cursor-pointer hover:shadow-xl transition-all duration-300 hover:scale-[1.02]"
                      onClick={() => setShowProjectsModal(true)}
                    >
                      <div className="flex items-center gap-2 ">
                        <div className="flex items-center justify-center w-10 h-10 sm:w-12 sm:h-12 bg-orange-100 dark:bg-orange-900/30 rounded-lg sm:rounded-xl">
                          <i className="ri-folder-line text-lg sm:text-xl lg:text-2xl text-orange-600 dark:text-orange-400"></i>
                        </div>
                        <div className="flex-1">
                          <h3 className="text-lg sm:text-xl font-bold text-gray-900 dark:text-white">Projets Associés</h3>
                          <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">
                            {objectifToView.projects.filter(p => !p.deleted).length} projet(s) actif(s)
                          </p>
                        </div>
                        <div className="flex items-center justify-center w-8 h-8 bg-orange-100 dark:bg-orange-900/30 rounded-lg">
                          <i className="ri-arrow-right-s-line text-orange-600 dark:text-orange-400 text-lg"></i>
                        </div>
                      </div>
                      
                      {/* <div className="space-y-3 sm:space-y-4">
                        {objectifToView.projects
                          .filter(project => !project.deleted)
                          .map((project, index) => (
                            <div key={project.id} className="bg-white dark:bg-gray-600 rounded-lg sm:rounded-xl border-2 border-orange-200 dark:border-gray-500 p-3 sm:p-4 shadow-sm">
                              <div className="flex items-start justify-between mb-2 sm:mb-3">
                                <div className="flex-1">
                                  <h4 className="text-sm sm:text-base lg:text-lg font-bold text-gray-900 dark:text-white mb-1">
                                    {project.title}
                                  </h4>
                                  <div className="flex items-center gap-2 sm:gap-3 text-xs sm:text-sm text-gray-600 dark:text-gray-400">
                                    <span className="flex items-center gap-1">
                                      <i className="ri-calendar-line"></i>
                                      {formatDate(project.start_date)}
                                    </span>
                                    <span className="flex items-center gap-1">
                                      <i className="ri-time-line"></i>
                                      {formatDate(project.deadline)}
                                    </span>
                                  </div>
                                </div>
                                <div className="flex items-center gap-2">
                                  <span className={`inline-flex items-center gap-1 px-2 sm:px-3 py-1 rounded-full text-xs font-medium ${
                                    project.status === 'open' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200 dark:bg-emerald-900/20 dark:text-emerald-300 dark:border-emerald-700' :
                                    project.status === 'completed' ? 'bg-green-50 text-green-700 border border-green-200 dark:bg-green-900/20 dark:text-green-300 dark:border-green-700' :
                                    project.status === 'hold' ? 'bg-yellow-50 text-yellow-700 border border-yellow-200 dark:bg-yellow-900/20 dark:text-yellow-300 dark:border-yellow-700' :
                                    'bg-gray-50 text-gray-700 border border-gray-200 dark:bg-gray-900/20 dark:text-gray-300 dark:border-gray-700'
                                  }`}>
                                    <i className={`${
                                      project.status === 'open' ? 'ri-checkbox-circle-line' :
                                      project.status === 'completed' ? 'ri-check-double-line' :
                                      project.status === 'hold' ? 'ri-pause-circle-line' :
                                      'ri-question-line'
                                    }`}></i>
                                    {project.status === 'open' ? 'Ouvert' :
                                     project.status === 'completed' ? 'Terminé' :
                                     project.status === 'hold' ? 'En attente' :
                                     project.status}
                                  </span>
                                </div>
                              </div>
                            </div>
                          ))}
                        
                        {objectifToView.projects.filter(p => p.deleted).length > 0 && (
                          <div className="mt-3 sm:mt-4 pt-3 sm:pt-4 border-t border-gray-200 dark:border-gray-500">
                            <div className="flex items-center gap-2 text-xs sm:text-sm text-gray-500 dark:text-gray-400">
                              <i className="ri-delete-bin-line"></i>
                              <span>{objectifToView.projects.filter(p => p.deleted).length} projet(s) supprimé(s)</span>
                            </div>
                          </div>
                        )}
                      </div> */}
                    </div>
                  )}

                  {/* Observation */}
                  <div className="bg-gradient-to-br from-amber-50 to-orange-50 dark:from-gray-700 dark:to-gray-800 rounded-xl sm:rounded-2xl p-4 sm:p-6 border border-amber-200 dark:border-gray-600 shadow-lg">
                    <div className="flex items-center gap-2 sm:gap-3 mb-4 sm:mb-6">
                      <div className="flex items-center justify-center w-10 h-10 sm:w-12 sm:h-12 bg-amber-100 dark:bg-amber-900/30 rounded-lg sm:rounded-xl">
                        <i className="ri-file-text-line text-lg sm:text-xl lg:text-2xl text-amber-600 dark:text-amber-400"></i>
                      </div>
                      <div>
                        <h3 className="text-lg sm:text-xl font-bold text-gray-900 dark:text-white">Observation</h3>
                        <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">Notes et commentaires</p>
                      </div>
                    </div>
                    
                    <div className="bg-white dark:bg-gray-600 rounded-lg sm:rounded-xl border-2 border-amber-200 dark:border-gray-500 p-4 sm:p-6 min-h-[100px] sm:min-h-[140px] shadow-sm">
                      {(() => {
                        // Debug: Log the observation value
                     
                        
                        // Check if observation exists and has content
                        if (objectifToView.observation && objectifToView.observation.trim() !== '') {
                          // Check if it's just empty HTML tags
                          const cleanText = objectifToView.observation.replace(/<[^>]*>/g, '').trim();
                          
                          if (cleanText === '') {
                            // It's empty HTML, show empty state
                            return (
                              <div className="flex items-center justify-center h-full text-gray-500 dark:text-gray-400">
                                <div className="text-center">
                                  <i className="ri-inbox-line text-3xl sm:text-4xl mb-2 sm:mb-3 text-gray-300 dark:text-gray-600"></i>
                                  <p className="text-sm sm:text-base lg:text-lg font-medium">Aucune observation disponible</p>
                                  <p className="text-xs sm:text-sm text-gray-400">Aucun commentaire n'a été ajouté pour cet objectif</p>
                                </div>
                              </div>
                            );
                          }
                          
                          // Has content, show preview with "Voir plus" button
                          return (
                            <div className="space-y-4">
                              <div 
                                className="text-gray-700 dark:text-gray-300 leading-relaxed text-sm sm:text-base lg:text-lg line-clamp-3"
                                dangerouslySetInnerHTML={{ __html: objectifToView.observation }}
                              />
                            
                            </div>
                          );
                        } else {
                          // No observation, show empty state
                          return (
                            <div className="flex items-center justify-center h-full text-gray-500 dark:text-gray-400">
                              <div className="text-center">
                                <i className="ri-inbox-line text-3xl sm:text-4xl mb-2 sm:mb-3 text-gray-300 dark:text-gray-600"></i>
                                <p className="text-sm sm:text-base lg:text-lg font-medium">Aucune observation disponible</p>
                                <p className="text-xs sm:text-sm text-gray-400">Aucun commentaire n'a été ajouté pour cet objectif</p>
                              </div>
                            </div>
                          );
                        }
                      })()}
                    </div>
                  </div>

                  {/* Creator Information */}
                  {objectifToView.creator && (
                    <div className="bg-gradient-to-br from-emerald-50 to-teal-50 dark:from-gray-700 dark:to-gray-800 rounded-xl sm:rounded-2xl p-4 sm:p-6 border border-emerald-200 dark:border-gray-600 shadow-lg">
                      <div className="flex items-center gap-2 sm:gap-3 mb-4 sm:mb-6">
                        <div className="flex items-center justify-center w-10 h-10 sm:w-12 sm:h-12 bg-emerald-100 dark:bg-emerald-900/30 rounded-lg sm:rounded-xl">
                          <i className="ri-user-line text-lg sm:text-xl lg:text-2xl text-emerald-600 dark:text-emerald-400"></i>
                        </div>
                        <div>
                          <h3 className="text-lg sm:text-xl font-bold text-gray-900 dark:text-white">Créateur</h3>
                          <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">Informations sur le créateur</p>
                        </div>
                      </div>
                      
                      <div className="space-y-3 sm:space-y-4">
                        <div className="flex items-center gap-3 bg-white dark:bg-gray-600 px-3 sm:px-4 py-2 sm:py-3 rounded-lg sm:rounded-xl border-2 border-emerald-200 dark:border-gray-500 shadow-sm">
                          <div className="flex items-center justify-center w-10 h-10 sm:w-12 sm:h-12 bg-emerald-100 dark:bg-emerald-900/30 rounded-full">
                            <i className="ri-user-3-line text-emerald-600 dark:text-emerald-400 text-lg sm:text-xl"></i>
                          </div>
                          <div className="flex-1">
                            <div className="text-sm sm:text-base lg:text-lg font-bold text-gray-900 dark:text-white">
                              {objectifToView.creator.first_name} {objectifToView.creator.last_name}
                            </div>
                            <div className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">
                              {objectifToView.creator.job_title || 'Poste non spécifié'}
                            </div>
                          </div>
                        </div>
                        
                        {/* <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                          <div>
                            <label className="block text-xs sm:text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1 sm:mb-2">Matricule</label>
                            <div className="text-sm sm:text-base font-semibold text-gray-900 dark:text-white bg-gray-100 dark:bg-gray-600 px-3 py-2 rounded-lg">
                              {objectifToView.creator.matricule || 'Non spécifié'}
                            </div>
                          </div>
                          
                          <div>
                            <label className="block text-xs sm:text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1 sm:mb-2">Email</label>
                            <div className="text-sm sm:text-base font-semibold text-gray-900 dark:text-white bg-gray-100 dark:bg-gray-600 px-3 py-2 rounded-lg">
                              {objectifToView.creator.email || 'Non spécifié'}
                            </div>
                          </div>
                        </div> */}
                        
                        {/* <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                          <div>
                            <label className="block text-xs sm:text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1 sm:mb-2">Date d'embauche</label>
                            <div className="text-sm sm:text-base font-semibold text-gray-900 dark:text-white bg-gray-100 dark:bg-gray-600 px-3 py-2 rounded-lg">
                              {objectifToView.creator.date_embauche ? formatDate(objectifToView.creator.date_embauche) : 'Non spécifié'}
                            </div>
                          </div>
                          
                          <div>
                            <label className="block text-xs sm:text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1 sm:mb-2">Type de contrat</label>
                            <div className="text-sm sm:text-base font-semibold text-gray-900 dark:text-white bg-gray-100 dark:bg-gray-600 px-3 py-2 rounded-lg">
                              {objectifToView.creator.type_Contrat || 'Non spécifié'}
                            </div>
                          </div>
                        </div> */}
                      </div>
                    </div>
                  )}

          
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-700 dark:to-gray-800 px-4 sm:px-6 lg:px-8 py-4 sm:py-6 border-t border-gray-200 dark:border-gray-600">
              <div className="flex justify-end gap-2 sm:gap-4">
                <button
                  onClick={() => setShowViewModal(false)}
                  className="ti-btn ti-btn-secondary-full ti-btn-wave"
                >
                  <i className="ri-close-line me-2"></i>
                  Fermer
                </button>
                <button
                  onClick={() => {
                    setShowViewModal(false);
                    handleUpdate(objectifToView);
                  }}
                  className="ti-btn ti-btn-primary-full ti-btn-wave"
                >
                  <i className="ri-pencil-line me-2"></i>
                  Modifier
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Projects Modal */}
      {showProjectsModal && objectifToView && (
        <div 
          className="fixed inset-0 z-[9999] flex items-center justify-center bg-black bg-opacity-50 p-2 sm:p-4"
          onClick={(e) => {
            if (e.target === e.currentTarget) {
              setShowProjectsModal(false);
            }
          }}
        >
          <div className="bg-white dark:bg-gray-800 rounded-xl sm:rounded-2xl shadow-2xl w-full max-w-4xl lg:max-w-5xl max-h-[90vh] overflow-hidden relative">
            {/* Modal Header */}
            <div className="bg-gradient-to-r from-orange-500 to-red-600 px-4 sm:px-6 lg:px-8 py-4 sm:py-6 relative overflow-hidden z-10">
              <div className="relative flex items-center justify-between z-20">
                <div className="flex items-center gap-2 sm:gap-4">
                  <div className="flex items-center justify-center w-10 h-10 sm:w-12 sm:h-12 lg:w-14 lg:h-14 bg-white/20 rounded-lg sm:rounded-xl backdrop-blur-sm">
                    <i className="ri-folder-line text-xl sm:text-2xl lg:text-3xl"></i>
                  </div>
                  <div>
                    <h2 className="text-xl sm:text-2xl lg:text-3xl font-bold mb-1">Projets Associés</h2>
                    <p className="text-orange-100 text-sm sm:text-base lg:text-lg">
                      {objectifToView.projects.filter(p => !p.deleted).length} projet(s) actif(s)
                      <span className="ml-2 inline-flex items-center gap-1 text-xs bg-white/20 px-2 py-1 rounded-full">
                        <i className="ri-cursor-line"></i>
                        Cliquez pour voir les détails
                      </span>
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setShowProjectsModal(false)}
                  className="flex items-center justify-center w-10 h-10 sm:w-12 sm:h-12 bg-white/20 hover:bg-white/30 rounded-lg sm:rounded-xl transition-all duration-200 backdrop-blur-sm z-30"
                >
                  <i className="ri-close-line text-lg sm:text-xl lg:text-2xl"></i>
                </button>
              </div>
            </div>

            {/* Modal Body */}
            <div className="p-4 sm:p-6 lg:p-8 overflow-y-auto max-h-[calc(90vh-200px)]">
              <div className="space-y-6">
         

                {/* Projects List */}
                <div className="bg-gradient-to-br from-orange-50 to-red-50 dark:from-gray-700 dark:to-gray-800 rounded-xl sm:rounded-2xl p-4 sm:p-6 border border-orange-200 dark:border-gray-600 shadow-lg">
              
                  
                  <div className="space-y-4 sm:space-y-6">
                    {objectifToView.projects
                      .filter(project => !project.deleted)
                      .map((project, index) => (
                        <div 
                          key={project.id} 
                          className="bg-white dark:bg-gray-600 rounded-lg sm:rounded-xl border-2 border-orange-200 dark:border-gray-500 p-4 sm:p-6 shadow-sm cursor-pointer hover:shadow-lg hover:scale-[1.02] transition-all duration-300 hover:border-orange-400 dark:hover:border-orange-500 group"
                          onClick={() => handleProjectNavigation(project)}
                        >
                          <div className="flex items-start justify-between mb-3 sm:mb-4">
                            <div className="flex-1">
                              <h4 className="text-lg sm:text-xl lg:text-2xl font-bold text-gray-900 dark:text-white mb-2 group-hover:text-orange-600 dark:group-hover:text-orange-400 transition-colors">
                                {project.title}
                                <i className="ri-external-link-line ml-2 text-sm opacity-0 group-hover:opacity-100 transition-opacity"></i>
                              </h4>
                              <div className="flex items-center gap-3 sm:gap-4 text-sm sm:text-base text-gray-600 dark:text-gray-400 mb-3">
                                <span className="flex items-center gap-1">
                                  <i className="ri-calendar-line"></i>
                                  <strong>Début:</strong> {formatDate(project.start_date)}
                                </span>
                                <span className="flex items-center gap-1">
                                  <i className="ri-time-line"></i>
                                  <strong>Fin:</strong> {formatDate(project.deadline)}
                                </span>
                              </div>
                            </div>
                            <div className="flex items-center gap-2">
                              <span className={`inline-flex items-center gap-2 px-3 sm:px-4 py-2 rounded-full text-sm font-bold ${
                                project.status === 'open' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200 dark:bg-emerald-900/20 dark:text-emerald-300 dark:border-emerald-700' :
                                project.status === 'completed' ? 'bg-green-50 text-green-700 border border-green-200 dark:bg-green-900/20 dark:text-green-300 dark:border-green-700' :
                                project.status === 'hold' ? 'bg-yellow-50 text-yellow-700 border border-yellow-200 dark:bg-yellow-900/20 dark:text-yellow-300 dark:border-yellow-700' :
                                'bg-gray-50 text-gray-700 border border-gray-200 dark:bg-gray-900/20 dark:text-gray-300 dark:border-gray-700'
                              }`}>
                                <i className={`${
                                  project.status === 'open' ? 'ri-checkbox-circle-line' :
                                  project.status === 'completed' ? 'ri-check-double-line' :
                                  project.status === 'hold' ? 'ri-pause-circle-line' :
                                  'ri-question-line'
                                }`}></i>
                                {project.status === 'open' ? 'Ouvert' :
                                 project.status === 'completed' ? 'Terminé' :
                                 project.status === 'hold' ? 'En attente' :
                                 project.status}
                              </span>
                            </div>
                          </div>
                          
                          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4 text-sm sm:text-base">
                            <div className="flex items-center gap-2 bg-gray-50 dark:bg-gray-700 px-3 py-2 rounded-lg">
                              <i className="ri-percent-line text-orange-500 text-lg"></i>
                              <div>
                                <span className="text-gray-600 dark:text-gray-400">Progression:</span>
                                <span className="font-bold text-gray-900 dark:text-white ml-1">{project.prog || 0}%</span>
                              </div>
                            </div>
                            <div className="flex items-center gap-2 bg-gray-50 dark:bg-gray-700 px-3 py-2 rounded-lg">
                              <i className="ri-money-dollar-circle-line text-green-500 text-lg"></i>
                              <div>
                                <span className="text-gray-600 dark:text-gray-400">Prix:</span>
                                <span className="font-bold text-gray-900 dark:text-white ml-1">{project.price || '0.00'} DH</span>
                              </div>
                            </div>
                            <div className="flex items-center gap-2 bg-gray-50 dark:bg-gray-700 px-3 py-2 rounded-lg">
                              <i className="ri-folder-line text-blue-500 text-lg"></i>
                              <div>
                                <span className="text-gray-600 dark:text-gray-400">Type:</span>
                                <span className="font-bold text-gray-900 dark:text-white ml-1">
                                  {project.project_type === 1 ? 'Interne' : 'Externe'}
                                </span>
                              </div>
                            </div>
                          </div>
                          
                          {project.description && (
                            <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-500">
                              <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Description</label>
                              <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400 bg-gray-50 dark:bg-gray-700 px-3 py-2 rounded-lg">
                                {project.description}
                              </p>
                            </div>
                          )}
                          
                          {/* Click indicator */}
                          <div className="mt-4 pt-3 border-t border-gray-200 dark:border-gray-500">
                            <div className="flex items-center justify-center gap-2 text-xs text-orange-600 dark:text-orange-400 font-medium">
                              <i className="ri-arrow-right-line"></i>
                              <span>Cliquez pour voir les détails du projet</span>
                            </div>
                          </div>
                        </div>
                      ))}
                    
                    {objectifToView.projects.filter(p => p.deleted).length > 0 && (
                      <div className="mt-4 sm:mt-6 pt-4 sm:pt-6 border-t border-gray-200 dark:border-gray-500">
                        <div className="flex items-center gap-2 text-sm sm:text-base text-gray-500 dark:text-gray-400">
                          <i className="ri-delete-bin-line"></i>
                          <span>{objectifToView.projects.filter(p => p.deleted).length} projet(s) supprimé(s)</span>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-700 dark:to-gray-800 px-4 sm:px-6 lg:px-8 py-4 sm:py-6 border-t border-gray-200 dark:border-gray-600">
              <div className="flex justify-end gap-2 sm:gap-4">
                <button
                  onClick={() => setShowProjectsModal(false)}
                  className="ti-btn ti-btn-secondary-full ti-btn-wave"
                >
                  <i className="ri-close-line me-2"></i>
                  Fermer
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </Fragment>
  );
};

export default Objectifs; 