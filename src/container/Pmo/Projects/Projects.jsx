import { Fragment, useState, useEffect } from 'react';
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

const Projects = () => {
  const [projects, setProjects] = useState([]);
  const [entities, setEntities] = useState([]);
  const [clients, setClients] = useState([]);
  const [objectives, setObjectives] = useState([]);
  const [projectTypes, setProjectTypes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [yearFilter, setYearFilter] = useState('');
  const [sortConfig, setSortConfig] = useState({ key: 'created_date', direction: 'desc' });
  const [pagination, setPagination] = useState({
    current: 1,
    total: 0,
    perPage: 10,
    lastPage: 1
  });
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    start_date: '',
    deadline: '',
    client_id: '',
    id_entite: '',
    id_objectif: '',
    project_type: '',
    status: 'open',
    price: '',
    prog: '',
    prog_price: '',
    labels: '',
    starred_by: ''
  });
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isUpdated, setIsUpdated] = useState(false);
  const [projectToUpdate, setProjectToUpdate] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [projectToDelete, setProjectToDelete] = useState(null);
  const [exportingExcel, setExportingExcel] = useState(false);
  const [exportingPDF, setExportingPDF] = useState(false);

  // Fetch projects
  const fetchProjects = async (page = 1, search = '', status = '', year = '') => {
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
      const response = await axiosInstance.get(`/pmo/projects?${queryParams}`);
      if (response.data?.status === 'success' && response.data?.data) {
        const { data, current_page, per_page, total, last_page } = response.data.data;
        setProjects(data || []);
        setPagination({
          current: current_page,
          perPage: per_page,
          total,
          lastPage: last_page
        });
      } else {
        ToastService.error('Format de données invalide du serveur');
        setProjects([]);
      }
    } catch (error) {
      ToastService.error(error.response?.data?.message || 'Erreur lors du chargement des projets');
      setProjects([]);
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

  // Fetch clients
  const fetchClients = async () => {
    try {
      const response = await axiosInstance.get('/pmo/projects/clients/list');
      if (response.data?.status === 'success' && response.data?.data) {
        setClients(response.data.data);
      } else {
        ToastService.error('Format de données des clients invalide');
        setClients([]);
      }
    } catch (error) {
      ToastService.error('Erreur lors du chargement des clients');
      setClients([]);
    }
  };

  // Fetch objectives
  const fetchObjectives = async () => {
    try {
      const response = await axiosInstance.get('/pmo/objectifs');
      if (response.data?.status === 'success' && response.data?.data?.data) {
        setObjectives(response.data.data.data);
      } else {
        ToastService.error('Format de données des objectifs invalide');
        setObjectives([]);
      }
    } catch (error) {
      ToastService.error('Erreur lors du chargement des objectifs');
      setObjectives([]);
    }
  };

  // Fetch project types
  const fetchProjectTypes = async () => {
    try {
      const response = await axiosInstance.get('/pmo/projects/types/list');
      if (response.data?.status === 'success' && response.data?.data) {
        setProjectTypes(response.data.data);
      } else {
        ToastService.error('Format de données des types de projet invalide');
        setProjectTypes([]);
      }
    } catch (error) {
      ToastService.error('Erreur lors du chargement des types de projet');
      setProjectTypes([]);
    }
  };

  useEffect(() => {
    fetchProjects(1, '', '', '');
    fetchEntities();
    fetchClients();
    fetchObjectives();
    fetchProjectTypes();
    // eslint-disable-next-line
  }, []);

  // Prevent background scrolling when modal is open
  useEffect(() => {
    if (showModal || projectToDelete) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }

    // Cleanup function to restore scroll when component unmounts
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [showModal, projectToDelete]);

  // Handle modal backdrop click
  const handleModalBackdropClick = (e) => {
    if (e.target === e.currentTarget) {
      setShowModal(false);
      setProjectToDelete(null);
    }
  };

  // Prevent modal content click from closing modal
  const handleModalContentClick = (e) => {
    e.stopPropagation();
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const validateForm = () => {
    const newErrors = {};
    
    // Title validation
    if (!formData.title || formData.title.trim() === '') {
      newErrors.title = 'Le titre est requis';
    } else if (formData.title.length > 255) {
      newErrors.title = 'Le titre ne peut pas dépasser 255 caractères';
    }
    
    // Client validation
    if (!formData.client_id || formData.client_id === '') {
      newErrors.client_id = 'Le client est requis';
    }
    
    // Entity validation
    if (!formData.id_entite || formData.id_entite === '') {
      newErrors.id_entite = 'L\'entité est requise';
    }
    
    // Start date validation
    if (!formData.start_date || formData.start_date === '') {
      newErrors.start_date = 'La date de début est requise';
    } else {
      const dateDebut = new Date(formData.start_date);
      if (isNaN(dateDebut.getTime())) {
        newErrors.start_date = 'La date de début doit être une date valide';
      }
    }
    
    // Deadline validation
    if (!formData.deadline || formData.deadline === '') {
      newErrors.deadline = 'La date limite est requise';
    } else {
      const dateFin = new Date(formData.deadline);
      if (isNaN(dateFin.getTime())) {
        newErrors.deadline = 'La date limite doit être une date valide';
      } else if (formData.start_date && new Date(formData.start_date) >= dateFin) {
        newErrors.deadline = 'La date limite doit être postérieure à la date de début';
      }
    }
    
    // Progress validation
    if (formData.prog === '' || formData.prog === null || formData.prog === undefined) {
      newErrors.prog = 'Le progrès est requis';
    } else {
      const prog = parseInt(formData.prog);
      if (isNaN(prog) || prog < 0 || prog > 100) {
        newErrors.prog = 'Le progrès doit être un nombre entre 0 et 100';
      }
    }
    
    // Status validation
    if (!formData.status || formData.status === '') {
      newErrors.status = 'Le statut est requis';
    } else {
      const validStatuses = ['open', 'planned', 'in_progress', 'completed', 'hold', 'canceled', 'not_started', 'continuous_action', 'archived'];
      if (!validStatuses.includes(formData.status)) {
        newErrors.status = 'Le statut sélectionné n\'est pas valide';
      }
    }
    
    // Price validation (optional)
    if (formData.price && formData.price !== '') {
      const price = parseFloat(formData.price);
      if (isNaN(price) || price < 0) {
        newErrors.price = 'Le prix doit être un nombre positif';
      }
    }
    
    // Progress price validation (optional)
    if (formData.prog_price && formData.prog_price !== '') {
      const progPrice = parseFloat(formData.prog_price);
      if (isNaN(progPrice) || progPrice < 0) {
        newErrors.prog_price = 'Le prix de progrès doit être un nombre positif';
      }
    }
    
    // Description validation (optional but with length limit)
    if (formData.description && formData.description.length > 1000) {
      newErrors.description = 'La description ne peut pas dépasser 1000 caractères';
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
      if (isUpdated && projectToUpdate) {
        console.log('Updating project with data:', formData);
        response = await axiosInstance.put(`/pmo/projects/${projectToUpdate.id}`, formData);
        console.log('Update response:', response.data);
      } else {
        console.log('Creating project with data:', formData);
        response = await axiosInstance.post('/pmo/projects', formData);
        console.log('Create response:', response.data);
      }
      
      if (response.data?.status === 'success') {
        ToastService.success(isUpdated ? 'Projet modifié avec succès' : 'Projet créé avec succès');
        setShowModal(false);
        
        // Add a small delay to ensure backend has processed the update
        setTimeout(() => {
          console.log('Refreshing data...');
          fetchProjects(pagination.current, searchTerm, statusFilter, yearFilter);
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
    fetchProjects(page, searchTerm, statusFilter, yearFilter);
  };

  const handleSort = (key) => {
    const direction = sortConfig.key === key && sortConfig.direction === 'asc' ? 'desc' : 'asc';
    setSortConfig({ key, direction });
    fetchProjects(1, searchTerm, statusFilter, yearFilter);
  };

  const handleSearch = () => {
    fetchProjects(1, searchTerm, statusFilter, yearFilter);
  };

  const handleClearSearch = () => {
    setSearchTerm('');
    fetchProjects(1, '', statusFilter, yearFilter);
  };

  const handleStatusFilter = (status) => {
    setStatusFilter(status);
    fetchProjects(1, searchTerm, status, yearFilter);
  };

  const handleYearFilter = (year) => {
    setYearFilter(year);
    fetchProjects(1, searchTerm, statusFilter, year);
  };

  const handleClearFilters = () => {
    setSearchTerm('');
    setStatusFilter('');
    setYearFilter('');
    fetchProjects(1, '', '', '');
  };

  const handleAddProject = () => {
    setIsUpdated(false);
    setProjectToUpdate(null);
    setFormData({
      title: '',
      description: '',
      start_date: '',
      deadline: '',
      client_id: '',
      id_entite: '',
      id_objectif: '',
      project_type: '',
      status: 'open',
      price: '',
      prog: '',
      prog_price: '',
      labels: '',
      starred_by: ''
    });
    setErrors({});
    setShowModal(true);
  };

  const handleUpdate = (project) => {
    setIsUpdated(true);
    setProjectToUpdate(project);
    setFormData({
      title: project.title || '',
      description: project.description || '',
      start_date: formatDateForInput(project.start_date) || '',
      deadline: formatDateForInput(project.deadline) || '',
      client_id: project.client_id || '',
      id_entite: project.id_entite || '',
      id_objectif: project.id_objectif || '',
      project_type: project.project_type || '',
      status: project.status || 'open',
      price: project.price || '',
      prog: project.prog || '',
      prog_price: project.prog_price || '',
      labels: project.labels || '',
      starred_by: project.starred_by || ''
    });
    setErrors({});
    setShowModal(true);
  };

  const handleDelete = (project) => {
    setProjectToDelete(project);
  };

  const handleDeleteConfirm = async () => {
    if (!projectToDelete) return;
    try {
      const response = await axiosInstance.delete(`/pmo/projects/${projectToDelete.id}`);
      if (response.data?.status === 'success') {
        ToastService.success('Projet supprimé avec succès');
        setProjectToDelete(null);
        fetchProjects(pagination.current, searchTerm, statusFilter, yearFilter);
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
      
      const response = await axiosInstance.get(`/pmo/projects?${queryParams}`);
      
      if (response.data?.status !== 'success' || !response.data?.data?.data) {
        throw new Error('Erreur lors de la récupération des données');
      }
      
      const allProjects = response.data.data.data;
      
      // Create Excel data from ALL filtered projects - simple table format
      const excelData = allProjects.map(project => ({
        'Titre': project.title || '',
        'Client': project.client?.company_name || '',
        'Entité': project.entite?.company_name || '',
        'Date début': formatDate(project.start_date) || '',
        'Date fin': formatDate(project.deadline) || '',
        'Progrès': `${project.prog || 0}%`,
        'Statut': statusOptions.find(opt => opt.value === project.status)?.label || project.status || '',
        'Description': project.description || ''
      }));

      // Create workbook and worksheet with headers
      const workbook = XLSX.utils.book_new();
      const worksheet = XLSX.utils.json_to_sheet(excelData);

      // Set column widths
      const columnWidths = [
        { wch: 35 }, // Titre
        { wch: 25 }, // Client
        { wch: 20 }, // Entité
        { wch: 20 }, // Date début
        { wch: 20 }, // Date fin
        { wch: 10 }, // Progrès
        { wch: 15 }, // Statut
        { wch: 40 }  // Description
      ];
      worksheet['!cols'] = columnWidths;

      // Add worksheet to workbook
      XLSX.utils.book_append_sheet(workbook, worksheet, 'Projects');

      // Generate filename with filters
      let filename = 'projects';
      if (statusFilter) filename += `_${statusFilter}`;
      if (yearFilter) filename += `_${yearFilter}`;
      if (searchTerm) filename += `_recherche`;
      filename += `_${new Date().toISOString().split('T')[0]}.xlsx`;

      // Save file
      XLSX.writeFile(workbook, filename);
      
      ToastService.success(`Export Excel réussi: ${allProjects.length} projets exportés`);
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
      
      const response = await axiosInstance.get(`/pmo/projects?${queryParams}`);
      
      if (response.data?.status !== 'success' || !response.data?.data?.data) {
        throw new Error('Erreur lors de la récupération des données');
      }
      
      const allProjects = response.data.data.data;
      
      const doc = new jsPDF();
      
      // Add title
      doc.setFontSize(16);
      doc.setTextColor(59, 130, 246); // Blue color
      doc.text('Projects', 14, 22);
      
      // Prepare table data - simple format like Excel
      const tableData = allProjects.map(project => [
        project.title || '-',
        project.client?.company_name || '-',
        project.entite?.company_name || '-',
        formatDate(project.start_date) || '-',
        formatDate(project.deadline) || '-',
        project.prog || '-',
        statusOptions.find(opt => opt.value === project.status)?.label || project.status || '-',
        project.description || '-'
      ]);
      
      // Add table with simple styling
      autoTable(doc, {
        head: [['Titre', 'Client', 'Entité', 'Date début', 'Date fin', 'Progrès', 'Statut', 'Description']],
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
          0: { cellWidth: 35 }, // Titre
          1: { cellWidth: 25 }, // Client
          2: { cellWidth: 20 }, // Entité
          3: { cellWidth: 20 }, // Date début
          4: { cellWidth: 20 }, // Date fin
          5: { cellWidth: 15 }, // Progrès
          6: { cellWidth: 20 }, // Statut
          7: { cellWidth: 30 }, // Description
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
      let filename = 'projects';
      if (statusFilter) filename += `_${statusFilter}`;
      if (yearFilter) filename += `_${yearFilter}`;
      if (searchTerm) filename += `_recherche`;
      filename += `_${new Date().toISOString().split('T')[0]}.pdf`;
      
      // Save file
      doc.save(filename);
      
      ToastService.success(`Export PDF réussi: ${allProjects.length} projets exportés`);
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
      <Pageheader currentpage="Projects" activepage="PMO" mainpage="Projects" />
      <ToastContainer position="top-right" autoClose={3000} hideProgressBar={false} newestOnTop closeOnClick rtl={false} pauseOnFocusLoss draggable pauseOnHover theme="colored" />
      <div className="grid grid-cols-12 gap-6">
        <div className="xl:col-span-12 col-span-12">
          <div className="box custom-box">
            <div className="box-header flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-gray-200 dark:border-gray-700 px-6 py-4">
              <div className="flex flex-col sm:flex-row items-center justify-between w-full gap-4">
                <div className="box-title text-xl font-semibold text-gray-800 dark:text-white">
                  Gestion des Projects
                </div>
                <div className="flex flex-col sm:flex-row items-center gap-4 w-full sm:w-auto">
                  <div className="relative w-full sm:w-64">
                    <div className="flex items-center gap-2">
                      <div className="relative flex-1">
                        <input
                          type="text"
                          placeholder="Rechercher un project..."
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
                    onClick={handleAddProject}
                    className="ti-btn ti-btn-primary-full"
                  >
                    Ajouter un Project
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
                        disabled={loading || projects.length === 0 || exportingExcel}
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
                        disabled={loading || projects.length === 0 || exportingPDF}
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
                      {/* {(projects.length > 0) && (
                        <div className="flex items-center gap-1 px-3 py-1.5 bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300 rounded-lg text-xs font-medium border border-blue-200 dark:border-blue-700">
                          <i className="ri-information-line"></i>
                          <span>Export complet avec filtres</span>
                        </div>
                      )} */}
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
                            <span className="font-medium">Total Projects:</span>
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
                                <th className="px-4 py-4 text-left font-semibold text-gray-700 dark:text-gray-300 cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors min-w-[200px]" onClick={() => handleSort('title')}>
                                  <div className="flex items-center gap-2">
                                    Titre
                                    <i className="ri-arrow-up-down-line text-gray-400"></i>
                                  </div>
                                </th>
                                <th className="px-4 py-4 text-left font-semibold text-gray-700 dark:text-gray-300 cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors min-w-[180px]" onClick={() => handleSort('client_id')}>
                                  <div className="flex items-center gap-2">
                                    Client
                                    <i className="ri-arrow-up-down-line text-gray-400"></i>
                                  </div>
                                </th>
                                <th className="px-4 py-4 text-left font-semibold text-gray-700 dark:text-gray-300 cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors min-w-[180px]" onClick={() => handleSort('id_entite')}>
                                  <div className="flex items-center gap-2">
                                    Entité
                                    <i className="ri-arrow-up-down-line text-gray-400"></i>
                                  </div>
                                </th>
                                <th className="px-4 py-4 text-left font-semibold text-gray-700 dark:text-gray-300 cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors min-w-[180px]" onClick={() => handleSort('start_date')}>
                                  <div className="flex items-center gap-2">
                                    Date début
                                    <i className="ri-arrow-up-down-line text-gray-400"></i>
                                  </div>
                                </th>
                                <th className="px-4 py-4 text-left font-semibold text-gray-700 dark:text-gray-300 cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors min-w-[180px]" onClick={() => handleSort('deadline')}>
                                  <div className="flex items-center gap-2">
                                    Date fin
                                    <i className="ri-arrow-up-down-line text-gray-400"></i>
                                  </div>
                                </th>
                                <th className="px-4 py-4 text-left font-semibold text-gray-700 dark:text-gray-300 cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors min-w-[80px]" onClick={() => handleSort('prog')}>
                                  <div className="flex items-center gap-2">
                                    Progrès
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
                                  Description
                                </th>
                                <th className="px-4 py-4 text-right font-semibold text-gray-700 dark:text-gray-300 min-w-[120px]">
                                  Actions
                                </th>
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                              {projects.length > 0 ? (
                                projects.map((project) => (
                                  <tr key={project.id} className="hover:bg-gray-50 dark:hover:bg-black/20 h-16 transition-colors">
                                    <td className="px-4 py-4 text-gray-900 dark:text-white font-medium">
                                      <div className="max-w-[180px] truncate" title={project.title}>
                                        {project.title}
                                      </div>
                                    </td>
                                    <td className="px-4 py-4 text-gray-700 dark:text-gray-300">
                                      <div className="max-w-[160px] truncate" title={project.client?.company_name || '-'}>
                                        {project.client?.company_name || '-'}
                                      </div>
                                    </td>
                                    <td className="px-4 py-4 text-gray-700 dark:text-gray-300">
                                      <div className="max-w-[160px] truncate" title={project.entite?.company_name || '-'}>
                                        {project.entite?.company_name || '-'}
                                      </div>
                                    </td>
                                    <td className="px-4 py-4 text-gray-700 dark:text-gray-300">
                                      <div className="text-xs font-medium">
                                        <div className="text-gray-900 dark:text-white">{formatDate(project.start_date)}</div>
                                      </div>
                                    </td>
                                    <td className="px-4 py-4 text-gray-700 dark:text-gray-300">
                                      <div className="text-xs font-medium">
                                        <div className="text-gray-900 dark:text-white">{formatDate(project.deadline)}</div>
                                      </div>
                                    </td>
                                    <td className="px-4 py-4 text-gray-700 dark:text-gray-300">
                                      <div className="flex flex-col gap-2">
                                        <div className="flex items-center justify-between">
                                          <span className="text-sm font-semibold text-gray-900 dark:text-white">
                                            {project.prog || 0}%
                                          </span>
                                          <span className="text-xs font-medium px-2 py-1 rounded-full" style={{
                                            backgroundColor: getPoidsRange(project.prog || 0).bgColor,
                                            color: getPoidsRange(project.prog || 0).textColor
                                          }}>
                                            {getPoidsRange(project.prog || 0).label}
                                          </span>
                                        </div>
                                        <div className="relative">
                                          <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                                            <div 
                                              className="h-2 rounded-full transition-all duration-300"
                                              style={{ 
                                                width: `${project.prog || 0}%`,
                                                backgroundColor: getPoidsRange(project.prog || 0).color
                                              }}
                                            ></div>
                                          </div>
                                          <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400 mt-1">
                                            <span>0%</span>
                                            <span>50%</span>
                                            <span>100%</span>
                                          </div>
                                        </div>
                                      </div>
                                    </td>
                                    <td className="px-4 py-4">
                                      {(() => {
                                        const statusOption = statusOptions.find(opt => opt.value === project.status);
                                        const colorClasses = {
                                          'open': 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-900/20 dark:text-emerald-300 dark:border-emerald-700',
                                          'planned': 'bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-900/20 dark:text-blue-300 dark:border-blue-700',
                                          'in_progress': 'bg-orange-50 text-orange-700 border-orange-200 dark:bg-orange-900/20 dark:text-orange-300 dark:border-orange-700',
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
                                            className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium border ${!customColor ? (colorClasses[project.status] || colorClasses['not_started']) : ''}`}
                                            style={customColor ? {
                                              backgroundColor: customColor + '20', // transparent bg
                                              color: customColor,
                                              borderColor: customColor
                                            } : {}}
                                          >
                                            <i className={`${statusOption?.icon || 'ri-question-line'}`}></i>
                                            {statusOption?.label || project.status}
                                          </span>
                                        );
                                      })()}
                                    </td>
                                    <td className="px-4 py-4 text-gray-600 dark:text-gray-400">
                                      <div className="max-w-[180px] truncate" title={project.description || 'Aucune description'}>
                                        {project.description || '-'}
                                      </div>
                                    </td>
                                    <td className="px-4 py-4 text-right">
                                      <div className="flex justify-end space-x-2">
                                        <button
                                          onClick={() => handleUpdate(project)}
                                          className="ti-btn rounded-full bg-primary/10 text-primary hover:bg-primary hover:text-white transition-all duration-200 w-8 h-8 flex items-center justify-center"
                                          title="Modifier le projet"
                                        >
                                          <i className="ri-pencil-line text-sm"></i>
                                        </button>
                                        <button
                                          onClick={() => handleDelete(project)}
                                          className="ti-btn rounded-full bg-danger/10 text-danger hover:bg-danger hover:text-white transition-all duration-200 w-8 h-8 flex items-center justify-center"
                                          title="Supprimer le projet"
                                        >
                                          <i className="ri-delete-bin-line text-sm"></i>
                                        </button>
                                      </div>
                                    </td>
                                  </tr>
                                ))
                              ) : (
                                <tr>
                                  <td colSpan="9" className="px-6 py-16 text-center">
                                    <div className="flex flex-col items-center justify-center text-gray-500 dark:text-gray-400">
                                      <i className="ri-inbox-line text-4xl mb-4 text-gray-300 dark:text-gray-600"></i>
                                      <p className="text-lg font-medium mb-2">Aucun projet trouvé</p>
                                      <p className="text-sm">Commencez par créer votre premier projet</p>
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
              {projects.length > 0 && (
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

      {/* Modal for Create/Edit Project */}
      {showModal && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black bg-opacity-50 p-4" onClick={handleModalBackdropClick}>
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto" onClick={handleModalContentClick}>
            <div className="sticky top-0 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-6 py-4 rounded-t-lg">
              <h3 className="text-xl font-semibold text-gray-800 dark:text-white">
                {isUpdated ? 'Modifier le Projet' : 'Créer un Projet'}
              </h3>
            </div>
            <div className="p-6">
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Titre <span className="Attention-text">*</span></label>
                  <input
                    type="text"
                    name="title"
                    value={formData.title}
                    onChange={handleInputChange}
                    className={`w-full px-4 border rounded-lg focus:ring-2 dark:bg-gray-700 dark:text-white ${errors.title ? 'input-error' : 'border-gray-300 dark:border-gray-600 focus:ring-primary focus:border-primary'}`}
                  />
                  {errors.title && (
                    <div className="error-message">
                      <i className="ri-error-warning-line error-icon"></i>
                      <span className="error-text">{errors.title}</span>
                    </div>
                  )}
                </div>
                
                <div>
                  <label className="block text-sm font-medium mb-1">Client <span className="Attention-text">*</span></label>
                  <div className="custom-select form-select">
                    <select
                      name="client_id"
                      value={formData.client_id}
                      onChange={handleInputChange}
                      className="custom-select select"
                    >
                      <option value="">Sélectionner un client</option>
                      {clients.map(client => (
                        <option key={client.id} value={client.id}>{client.company_name}</option>
                      ))}
                    </select>
                  </div>
                  {errors.client_id && (
                    <div className="error-message">
                      <i className="ri-error-warning-line error-icon"></i>
                      <span className="error-text">{errors.client_id}</span>
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

                <div>
                  <label className="block text-sm font-medium mb-1">Objectif</label>
                  <div className="custom-select form-select">
                    <select
                      name="id_objectif"
                      value={formData.id_objectif}
                      onChange={handleInputChange}
                      className="custom-select select"
                    >
                      <option value="">Sélectionner un objectif (optionnel)</option>
                      {objectives.map(obj => (
                        <option key={obj.id} value={obj.id}>{obj.titre}</option>
                      ))}
                    </select>
                  </div>
                  {errors.id_objectif && (
                    <div className="error-message">
                      <i className="ri-error-warning-line error-icon"></i>
                      <span className="error-text">{errors.id_objectif}</span>
                    </div>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">Type de projet</label>
                  <div className="custom-select form-select">
                    <select
                      name="project_type"
                      value={formData.project_type}
                      onChange={handleInputChange}
                      className="custom-select select"
                    >
                      <option value="">Sélectionner un type (optionnel)</option>
                      {projectTypes.map(type => (
                        <option key={type.id} value={type.id}>{type.title}</option>
                      ))}
                    </select>
                  </div>
                  {errors.project_type && (
                    <div className="error-message">
                      <i className="ri-error-warning-line error-icon"></i>
                      <span className="error-text">{errors.project_type}</span>
                    </div>
                  )}
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-1">Date début <span className="Attention-text">*</span></label>
                    <input
                      type="date"
                      name="start_date"
                      value={formatDateForInput(formData.start_date)}
                      onChange={handleInputChange}
                      className={`w-full px-4 border rounded-lg focus:ring-2 dark:bg-gray-700 dark:text-white ${errors.start_date ? 'input-error' : 'border-gray-300 dark:border-gray-600 focus:ring-primary focus:border-primary'}`}
                    />
                    {errors.start_date && (
                      <div className="error-message">
                        <i className="ri-error-warning-line error-icon"></i>
                        <span className="error-text">{errors.start_date}</span>
                      </div>
                    )}
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Date fin <span className="Attention-text">*</span></label>
                    <input
                      type="date"
                      name="deadline"
                      value={formatDateForInput(formData.deadline)}
                      onChange={handleInputChange}
                      className={`w-full px-4 border rounded-lg focus:ring-2 dark:bg-gray-700 dark:text-white ${errors.deadline ? 'input-error' : 'border-gray-300 dark:border-gray-600 focus:ring-primary focus:border-primary'}`}
                    />
                    {errors.deadline && (
                      <div className="error-message">
                        <i className="ri-error-warning-line error-icon"></i>
                        <span className="error-text">{errors.deadline}</span>
                      </div>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-1">Prix</label>
                    <input
                      type="number"
                      name="price"
                      value={formData.price}
                      onChange={handleInputChange}
                      step="0.01"
                      min="0"
                      className={`w-full px-4 border rounded-lg focus:ring-2 dark:bg-gray-700 dark:text-white ${errors.price ? 'input-error' : 'border-gray-300 dark:border-gray-600 focus:ring-primary focus:border-primary'}`}
                      placeholder="0.00"
                    />
                    {errors.price && (
                      <div className="error-message">
                        <i className="ri-error-warning-line error-icon"></i>
                        <span className="error-text">{errors.price}</span>
                      </div>
                    )}
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Prix de progrès</label>
                    <input
                      type="number"
                      name="prog_price"
                      value={formData.prog_price}
                      onChange={handleInputChange}
                      step="0.01"
                      min="0"
                      className={`w-full px-4 border rounded-lg focus:ring-2 dark:bg-gray-700 dark:text-white ${errors.prog_price ? 'input-error' : 'border-gray-300 dark:border-gray-600 focus:ring-primary focus:border-primary'}`}
                      placeholder="0.00"
                    />
                    {errors.prog_price && (
                      <div className="error-message">
                        <i className="ri-error-warning-line error-icon"></i>
                        <span className="error-text">{errors.prog_price}</span>
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
                  <label className="block text-sm font-medium mb-1">Progrès <span className="Attention-text">*</span></label>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-semibold" style={{color: 'var(--default-text-color)'}}>
                        {formData.prog || 0}%
                      </span>
                      <span className="text-xs font-medium px-2 py-1 rounded-full" style={{
                        backgroundColor: formData.prog ? getPoidsRange(formData.prog).bgColor : 'rgba(134, 153, 163, 0.1)',
                        color: formData.prog ? getPoidsRange(formData.prog).textColor : 'var(--gray)'
                      }}>
                        {formData.prog ? getPoidsRange(formData.prog).label : 'Non défini'}
                      </span>
                    </div>
                    <div className="relative">
                      <input
                        type="range"
                        name="prog"
                        min="0"
                        max="100"
                        value={formData.prog || 0}
                        onChange={handleInputChange}
                        className="w-full h-2 rounded-lg appearance-none cursor-pointer"
                      />
                      <div className="flex justify-between text-xs mt-2" style={{color: 'var(--text-muted)'}}>
                        <span>0%</span>
                        <span>25%</span>
                        <span>50%</span>
                        <span>75%</span>
                        <span>100%</span>
                      </div>
                    </div>
                  </div>
                  {errors.prog && (
                    <div className="error-message">
                      <i className="ri-error-warning-line error-icon"></i>
                      <span className="error-text">{errors.prog}</span>
                    </div>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">Description</label>
                  <textarea
                    name="description"
                    value={formData.description}
                    onChange={handleInputChange}
                    className={`w-full px-4 border rounded-lg focus:ring-2 dark:bg-gray-700 dark:text-white ${errors.description ? 'input-error' : 'border-gray-300 dark:border-gray-600 focus:ring-primary focus:border-primary'}`}
                    rows={3}
                    placeholder="Description optionnelle du projet..."
                  />
                  {errors.description && (
                    <div className="error-message">
                      <i className="ri-error-warning-line error-icon"></i>
                      <span className="error-text">{errors.description}</span>
                    </div>
                  )}
                </div>

                <div className="flex justify-end gap-2 mt-6 pt-4 border-t border-gray-200 dark:border-gray-700">
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
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {projectToDelete && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black bg-opacity-50 p-4" onClick={handleModalBackdropClick}>
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-2xl w-full max-w-md" onClick={handleModalContentClick}>
            <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
              <h3 className="text-lg font-semibold text-gray-800 dark:text-white">Confirmer la Suppression</h3>
            </div>
            <div className="p-6">
              <p className="mb-4 text-gray-600 dark:text-gray-300">Êtes-vous sûr de vouloir supprimer le projet <span className="font-bold text-gray-800 dark:text-white">{projectToDelete.title}</span> ? Cette action ne peut pas être annulée.</p>
              <div className="flex justify-end gap-2">
                <button
                  type="button"
                  className="ti-btn ti-btn-secondary-full"
                  onClick={() => setProjectToDelete(null)}
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
        </div>
      )}
    </Fragment>
  );
};

export default Projects; 