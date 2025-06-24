import { Fragment, useState, useEffect, useRef, useCallback, useMemo, memo } from 'react';
import Pageheader from '../../../components/common/pageheader/pageheader';
import CustomPagination from '../../../components/utile/CustomPagination';
import ToastService from '../../../components/utile/toastService';
import { ToastContainer } from 'react-toastify';
import axiosInstance from '../../../Interceptor/axiosInstance';
import { useAuth } from '../../../components/utile/AuthProvider';
import LoadingLogo from '../../../components/utile/LoadingLogo';
import logo from "../../../assets/images/brand-logos/logo.png";
import { utils, writeFile } from 'xlsx/xlsx.mjs';
import SunEditor from 'suneditor-react';
import 'suneditor/dist/css/suneditor.min.css';
import ValidationModal from './components/ValidationModal';
import DemandeDetailsModal from './components/DemandeDetailsModal';
import { format } from 'date-fns';
import TableRow from './components/TableRow';
import TableFilters from './components/TableFilters';
import TableSkeleton from './components/TableSkeleton';
import DemandeFilesModal from './components/DemandeFilesModal';
import { debounce } from 'lodash';



const ListeDemandesDirecteur = () => {
  const { user } = useAuth();
  const [demandes, setDemandes] = useState([]);
  const [demandesUpdated, setDemandesUpdated] = useState([]);
  const [validations, setValidations] = useState([]);
  const [totalPending, setTotalPending] = useState(0);
  const [totalUpdated, setTotalUpdated] = useState(0);
  const [activeTab, setActiveTab] = useState('pending');
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortConfig, setSortConfig] = useState({ key: null, direction: 'asc' });
  const [selectedDemande, setSelectedDemande] = useState(null);
  const [showValidationModal, setShowValidationModal] = useState(false);
  const [selectedValidations, setSelectedValidations] = useState([]);
  const [isLoadingValidations, setIsLoadingValidations] = useState(false);
  const [showReturnModal, setShowReturnModal] = useState(false);
  const [returnMessage, setReturnMessage] = useState('');
  const [isSubmittingReturn, setIsSubmittingReturn] = useState(false);
  const [typeFilter, setTypeFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [entityFilter, setEntityFilter] = useState('all');
  const [entitySearchTerm, setEntitySearchTerm] = useState('');
  const [showEntityDropdown, setShowEntityDropdown] = useState(false);
  const entityDropdownRef = useRef(null);
  const [exportDropdownRef, setExportDropdownRef] = useState(null);
  const [isApprovingDemande, setIsApprovingDemande] = useState(false);
  const [isRejectingDemande, setIsRejectingDemande] = useState(false);
  const [entities, setEntities] = useState([]);
  const [showExportDropdown, setShowExportDropdown] = useState(false);
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef(null);
  const [fileErrors, setFileErrors] = useState({});
  const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB in bytes
  
  // Add new state variables for files modal
  const [selectedDemandeForFiles, setSelectedDemandeForFiles] = useState(null);

  // Add new state variables for user filter
  const [users, setUsers] = useState([]);
  const [userFilter, setUserFilter] = useState('all');
  const [showUserDropdown, setShowUserDropdown] = useState(false);
  const [userSearchTerm, setUserSearchTerm] = useState('');
  const userDropdownRef = useRef(null);

  // Add pagination state before fetchDemandesData
  const [pagination, setPagination] = useState({
    current: 1,
    total: 0,
    perPage: 10,
    lastPage: 1
  });

  // Add cache for API responses
  const responseCache = useRef(new Map());
  const abortControllerRef = useRef(null);

  // Define fetchDemandesData first before any handlers that use it
  const fetchDemandesData = useCallback(async (page = 1, forceRefresh = false) => {
    // Cancel previous request if it exists
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    abortControllerRef.current = new AbortController();
    
    try {
      if (!user?.data?.id) {
        ToastService.error('Utilisateur non authentifié');
        return;
      }

      setLoading(true);
      
      // Create cache key from all parameters
      const cacheKey = JSON.stringify({
        page,
        activeTab,
        searchTerm,
        typeFilter,
        entityFilter,
        statusFilter,
        userFilter,
        sortConfig
      });

      // Only use cache if not forcing refresh
      if (!forceRefresh && responseCache.current.has(cacheKey)) {
        const cachedData = responseCache.current.get(cacheKey);
        // Only use cache if it's less than 1 minute old
        if (Date.now() - cachedData.timestamp < 60000) {
          setLoading(false);
          if (activeTab === 'pending') {
            setDemandes(cachedData.data);
          } else {
            setDemandesUpdated(cachedData.data);
          }
          setPagination(cachedData.pagination);
          return;
        } else {
          responseCache.current.delete(cacheKey);
        }
      }

      // First fetch total counts for all tabs
      try {
        const countsResponse = await axiosInstance.get('demandes/counts', {
          signal: abortControllerRef.current.signal
        });
        if (countsResponse.data) {
          setTotalPending(countsResponse.data.pending || 0);
          setTotalUpdated(countsResponse.data.updated || 0);
        }
      } catch (error) {
        if (!error.name === 'AbortError') {
          // console.error('Error fetching counts:', error);
        }
      }

      const queryParams = new URLSearchParams({
        page,
        per_page: pagination.perPage,
        ...(searchTerm && { search: searchTerm }),
        ...(typeFilter !== 'all' && { type: typeFilter }),
        ...(entityFilter !== 'all' && { entity: entityFilter }),
        ...(statusFilter !== 'all' && { status: statusFilter }),
        ...(userFilter !== 'all' && { user_id: userFilter }),
        ...(sortConfig.key && { 
          sort_key: sortConfig.key,
          sort_direction: sortConfig.direction 
        }),
        // Add timestamp to prevent caching
        _t: Date.now()
      }).toString();

      let response;
      if (activeTab === 'pending') {
        response = await axiosInstance.get(`pendingDemandesToValidate?${queryParams}`, {
          signal: abortControllerRef.current.signal,
          headers: {
            'Cache-Control': 'no-cache',
            'Pragma': 'no-cache',
            'Expires': '0',
          }
        });
      } else {
        response = await axiosInstance.get(`demandes-with-updated-validations?${queryParams}`, {
          signal: abortControllerRef.current.signal,
          headers: {
            'Cache-Control': 'no-cache',
            'Pragma': 'no-cache',
            'Expires': '0',
          }
        });
      }

      if (response.data) {
        const { data, current_page, total, last_page, per_page } = response.data;
        
        // Only cache if not forcing refresh
        if (!forceRefresh) {
          responseCache.current.set(cacheKey, {
            data: data,
            pagination: {
              current: current_page,
              total: total,
              lastPage: last_page,
              perPage: per_page
            },
            timestamp: Date.now()
          });
        }

        if (activeTab === 'pending') {
          setDemandes(data);
        } else {
          setDemandesUpdated(data);
        }
        
        setPagination({
          current: current_page,
          total: total,
          lastPage: last_page,
          perPage: per_page
        });
      }

    } catch (error) {
      if (!error.name === 'AbortError') {
        // console.error('Error fetching data:', error);
        if (error.response?.status === 401) {
          ToastService.error('Veuillez vous connecter pour accéder à vos demandes');
        } else {
          ToastService.error('Erreur lors du chargement des données');
        }
      }
    } finally {
      setLoading(false);
    }
  }, [activeTab, searchTerm, typeFilter, entityFilter, statusFilter, userFilter, sortConfig, pagination.perPage, user?.data?.id]);

  // Then define debouncedSearch which uses fetchDemandesData
  const debouncedSearch = useCallback(
    debounce((searchValue) => {
      setSearchTerm(searchValue);
      fetchDemandesData(1);
    }, 500),
    [fetchDemandesData]
  );

  // Then define all other handlers that use fetchDemandesData
  const handleSearch = useCallback((value) => {
    setPagination(prev => ({ ...prev, current: 1 }));
    debouncedSearch(value);
  }, [debouncedSearch]);

  const handleSearchSubmit = useCallback(() => {
    fetchDemandesData(1);
  }, [fetchDemandesData]);

  const handleTypeFilter = useCallback((value) => {
    setTypeFilter(value);
    setPagination(prev => ({ ...prev, current: 1 }));
    fetchDemandesData(1);
  }, [fetchDemandesData]);

  // Memoize fetchEntities function
  const fetchEntities = useCallback(async () => {
    try {
      const response = await axiosInstance.get('/entities');
      if (response.data) {
        const formattedEntities = response.data.map(entity => ({
          value: entity.name,
          label: entity.name
        }));
        // Add 'All' option at the beginning
        formattedEntities.unshift({ value: 'all', label: 'Toutes les entités' });
        setEntities(formattedEntities);
      }
    } catch (error) {
      // console.error('Error fetching entities:', error);
      ToastService.error('Erreur lors de la récupération des entités');
    }
  }, []);

  // Memoize handleEntityFilter
  const handleEntityFilter = useCallback((value) => {
    setEntityFilter(value);
    setPagination(prev => ({ ...prev, current: 1 }));
    setShowEntityDropdown(false);
    setEntitySearchTerm('');
    fetchDemandesData(1);
  }, [fetchDemandesData]);

  // Update useEffect to only fetch entities once on mount
  useEffect(() => {
    fetchEntities();
  }, [fetchEntities]);

  // Add filter options
  const typeOptions = [
    { value: 'all', label: 'Tous les types' },
    { value: 'Demande des documents administratifs', label: 'Documents administratifs' },
    { value: 'Demande de congés', label: 'Congés' }
  ];

  // Update status options
  const statusOptions = [
    { value: 'all', label: 'Tous les statuts' },
    { value: 'En attente', label: 'En attente' },
    { value: 'Traité', label: 'Traité' },
    { value: 'Refusé', label: 'Refusé' },
    // { value: 'Retourné', label: 'Retourné' }
  ];

  // Add fetchUsers function
  const fetchUsers = useCallback(async () => {
    try {
      const response = await axiosInstance.get('/listUsers');
      if (response.data) {
        
        // Check if response.data has a data property (common Laravel API structure)
        const usersData = response.data.data || response.data;
        
        // Ensure usersData is an array
        if (!Array.isArray(usersData)) {
          // console.error('Users data is not an array:', usersData);
          return;
        }

        const formattedUsers = usersData.map(user => ({
          value: user.id,
          label: `${user.first_name} ${user.last_name}`
        }));
        
        // Add 'All' option at the beginning
        formattedUsers.unshift({ value: 'all', label: 'Tous les utilisateurs' });
        setUsers(formattedUsers);
      }
    } catch (error) {
      // console.error('Error fetching users:', error);
      ToastService.error('Erreur lors de la récupération des utilisateurs');
    }
  }, []);

  // Add handleUserFilter function
  const handleUserFilter = useCallback((value) => {
    setUserFilter(value);
    setPagination(prev => ({ ...prev, current: 1 }));
    setShowUserDropdown(false);
    setUserSearchTerm('');
    fetchDemandesData(1);
  }, [fetchDemandesData]);

  // Update useEffect to fetch users
  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  // Update useEffect for click outside handling
  useEffect(() => {
    function handleClickOutside(event) {
      if (entityDropdownRef.current && !entityDropdownRef.current.contains(event.target)) {
        setShowEntityDropdown(false);
        setEntitySearchTerm('');
      }
      if (exportDropdownRef && !exportDropdownRef.contains(event.target)) {
        setShowExportDropdown(false);
      }
      if (userDropdownRef.current && !userDropdownRef.current.contains(event.target)) {
        setShowUserDropdown(false);
        setUserSearchTerm('');
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Update handleSort
  const handleSort = useCallback((key) => {
    const direction = sortConfig.key === key && sortConfig.direction === 'asc' ? 'desc' : 'asc';
    setSortConfig({ key, direction });
    setPagination(prev => ({ ...prev, current: 1 }));
    fetchDemandesData(1);
  }, [sortConfig, fetchDemandesData]);

  const handlePageChange = useCallback((page) => {
    fetchDemandesData(page);
  }, [fetchDemandesData]);

  const handleView = useCallback((id) => {
    let item;
    if (activeTab === 'pending') {
      item = demandes.find(d => d.id === id);
    } else if (activeTab === 'updated') {
      item = demandesUpdated.find(d => d.id === id);
    } else {
      item = validations.find(v => v.demande_id === id);
    }
    
    if (item) {
      setSelectedDemande(activeTab === 'history' ? { ...item.demande, validation: item } : item);
      const modal = document.querySelector('#hs-view-demande-modal');
      if (modal) {
        const HSOverlay = window.HSOverlay;
        if (HSOverlay) {
          HSOverlay.open(modal);
        }
      }
    }
  }, [activeTab, demandes, demandesUpdated, validations]);

  // Memoize the current page data
  const currentPageData = useMemo(() => {
    if (activeTab === 'pending') {
      return demandes;
    } else if (activeTab === 'updated') {
      return demandesUpdated;
    } else {
      return validations;
    }
  }, [activeTab, demandes, demandesUpdated, validations]);

  // Update useEffect for fetching demandes
  useEffect(() => {
    const abortController = new AbortController();
    fetchDemandesData(pagination.current);
    return () => {
      abortController.abort();
    };
  }, [fetchDemandesData, pagination.current, activeTab, typeFilter, entityFilter, statusFilter, userFilter, sortConfig]);


  useEffect(() => {
    // Add enhanced styles for modern look and animations
    const style = document.createElement('style');
    style.innerHTML = `
      /* Form entrance animation */
      .ti-modal-box {
        animation: fadeInScale 0.3s cubic-bezier(0.16, 1, 0.3, 1);
      }

      /* Input focus animations */
      .form-input, .form-select, .form-textarea {
        transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1);
      }

      .form-input:focus, .form-select:focus, .form-textarea:focus {
        transform: translateY(-1px);
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
      }

      /* Error message animations */
      .error-message {
        animation: slideInShake 0.5s cubic-bezier(0.16, 1, 0.3, 1);
      }

      /* Loading spinner enhancement */
      .spinner-ring {
        animation: spin 1s linear infinite, pulse 1s ease-in-out infinite;
      }

      @keyframes fadeInScale {
        0% {
          opacity: 0;
          transform: scale(0.95);
        }
        100% {
          opacity: 1;
          transform: scale(1);
        }
      }

      @keyframes slideInShake {
        0% {
          opacity: 0;
          transform: translateX(-10px);
        }
        60% {
          transform: translateX(5px);
        }
        100% {
          opacity: 1;
          transform: translateX(0);
        }
      }

      @keyframes pulse {
        0%, 100% {
          opacity: 1;
        }
        50% {
          opacity: 0.5;
        }
      }

      /* Button animations */
      .btn-primary {
        transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1);
        position: relative;
        overflow: hidden;
      }

      .btn-primary:hover:not(:disabled) {
        transform: translateY(-2px);
      }

      .btn-primary:active:not(:disabled) {
        transform: scale(0.98);
      }

      /* Button ripple effect */
      .btn-primary::after {
        content: '';
        position: absolute;
        width: 100%;
        height: 100%;
        top: 0;
        left: 0;
        pointer-events: none;
        background-image: radial-gradient(circle, rgba(255, 255, 255, 0.3) 10%, transparent 10.01%);
        background-repeat: no-repeat;
        background-position: 50%;
        transform: scale(10, 10);
        opacity: 0;
        transition: transform .5s, opacity 1s;
      }

      .btn-primary:active::after {
        transform: scale(0, 0);
        opacity: .3;
        transition: 0s;
      }

      /* Form field animations */
      .form-group {
        position: relative;
      }

      .form-input:focus + .form-label,
      .form-input:not(:placeholder-shown) + .form-label {
        transform: translateY(-1.5rem) scale(0.75);
        color: var(--primary);
      }

      .form-input.error {
        border-color: #ef4444;
        background-color: rgba(239, 68, 68, 0.05);
      }

      .form-input.success {
        border-color: #10b981;
        background-color: rgba(16, 185, 129, 0.05);
      }

      /* Loading animation */
      @keyframes spin {
        to {
          transform: rotate(360deg);
        }
      }

      .loading-dots::after {
        content: '';
        animation: loading 1s infinite;
      }

      @keyframes loading {
        0% { content: ''; }
        25% { content: '.'; }
        50% { content: '..'; }
        75% { content: '...'; }
        100% { content: ''; }
      }

      /* Validation icon animations */
      .validation-icon {
        transition: all 0.3s ease;
      }

      .validation-icon.error {
        animation: shake 0.5s cubic-bezier(.36,.07,.19,.97) both;
      }

      @keyframes shake {
        10%, 90% { transform: translate3d(-1px, 0, 0); }
        20%, 80% { transform: translate3d(2px, 0, 0); }
        30%, 50%, 70% { transform: translate3d(-4px, 0, 0); }
        40%, 60% { transform: translate3d(4px, 0, 0); }
      }
    `;
    document.head.appendChild(style);
    return () => document.head.removeChild(style);
  }, []);

  // Add closeDemandeModal function
  const closeDemandeModal = () => {
    const modal = document.querySelector('#hs-view-demande-modal');
    if (modal) {
      const HSOverlay = window.HSOverlay;
      if (HSOverlay) {
        HSOverlay.close(modal);
      }
    }
    setSelectedDemande(null);
  };

  // Update file upload handler with validation
  const handleFileChange = (e) => {
    const files = Array.from(e.target.files);
    const newErrors = {};
    
    // Define allowed file types
    const allowedTypes = [
      // PDF
      'application/pdf',
      // Word
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      // Excel
      'application/vnd.ms-excel',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      // PowerPoint
      'application/vnd.ms-powerpoint',
      'application/vnd.openxmlformats-officedocument.presentationml.presentation',
      // Images
      'image/png',
      'image/jpeg',
      'image/jpg',
      'image/gif'
    ];
    
    // Validate each file
    files.forEach(file => {
      if (file.size > MAX_FILE_SIZE) {
        newErrors[file.name] = `Le fichier ${file.name} dépasse la taille maximale de 10MB`;
      }
      if (!allowedTypes.includes(file.type)) {
        newErrors[file.name] = `Le fichier ${file.name} n'est pas un format autorisé. Formats acceptés : PDF, DOC, DOCX, XLS, XLSX, PPT, PPTX, PNG, JPG, JPEG, GIF`;
      }
    });

    // Filter out files with errors
    const validFiles = files.filter(file => !newErrors[file.name]);
    
    setFileErrors(newErrors);
    setSelectedFiles(prevFiles => [...prevFiles, ...validFiles]);
  };

  // Add function to format file size
  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  // Update uploadFiles function to show progress
  const uploadFiles = async (demandeId) => {
    if (selectedFiles.length === 0) return;

    setIsUploading(true);
    const formData = new FormData();
    
    selectedFiles.forEach((file) => {
      formData.append('files[]', file);
    });
    formData.append('user_id', user?.data?.id);

    try {
      await axiosInstance.post(`demandes/${demandeId}/files`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        },
        onUploadProgress: (progressEvent) => {
          const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
          console.log('Upload Progress:', percentCompleted);
        }
      });
      ToastService.success(`${selectedFiles.length} fichier(s) téléchargé(s) avec succès`);
      setSelectedFiles([]);
      setFileErrors({});
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    } catch (error) {
      // console.error('Error uploading files:', error);
      ToastService.error('Erreur lors du téléchargement des fichiers');
    } finally {
      setIsUploading(false);
    }
  };

  // Update handleApprove function
  const handleApprove = async (id) => {
    setIsApprovingDemande(true);
    try {
      // First upload files if Admin RH and files are selected
      if (user?.data?.roles?.some(role => role.name === 'Admin RH') && selectedFiles.length > 0) {
        await uploadFiles(id);
      }

      const response = await axiosInstance.post(`demandes/${id}/validate`, {
        status: 'Approuvé'
      });
      
      if (response.data) {
        // Clear cache
        responseCache.current.clear();
        
        // Reset pagination and force refresh data
        setPagination(prev => ({ ...prev, current: 1 }));
        await fetchDemandesData(1, true);
        
        ToastService.success('Demande validée avec succès');
      }
    } catch (error) {
      // console.error('Error approving demande:', error);
      if (error.response?.status === 401) {
        ToastService.error('Vous n\'êtes pas autorisé à valider cette demande');
      } else {
        ToastService.error('Une erreur est survenue lors de la validation de la demande');
      }
    } finally {
      setIsApprovingDemande(false);
      const modal = document.querySelector('#hs-approve-modal');
      if (modal) {
        const HSOverlay = window.HSOverlay;
        if (HSOverlay) {
          HSOverlay.close(modal);
        }
      }
    }
  };

  // Update handleReject function
  const handleReject = async (id) => {
    setIsRejectingDemande(true);
    try {
      const response = await axiosInstance.post(`demandes/${id}/validate`, {
        status: 'Rejeté'
      });
      
      if (response.data) {
        // Clear cache
        responseCache.current.clear();
        
        // Reset pagination and force refresh data
        setPagination(prev => ({ ...prev, current: 1 }));
        await fetchDemandesData(1, true);
        
        ToastService.success('Demande rejetée avec succès');
      }
    } catch (error) {
      // console.error('Error rejecting demande:', error);
      if (error.response?.status === 401) {
        ToastService.error('Vous n\'êtes pas autorisé à rejeter cette demande');
      } else {
        ToastService.error('Une erreur est survenue lors du rejet de la demande');
      }
    } finally {
      setIsRejectingDemande(false);
      const modal = document.querySelector('#hs-reject-modal');
      if (modal) {
        const HSOverlay = window.HSOverlay;
        if (HSOverlay) {
          HSOverlay.close(modal);
        }
      }
    }
  };

  // Update handleReturn function
  const handleReturn = async () => {
    if (!selectedDemande || !returnMessage.trim()) {
      ToastService.error('Veuillez saisir un message de retour');
      return;
    }

    setIsSubmittingReturn(true);
    try {
      const response = await axiosInstance.put(`validation/${selectedDemande.id}/message`, {
        message: returnMessage,
        status: 'Retourné'
      });
      
      if (response.data) {
        // Clear cache
        responseCache.current.clear();
        
        // Reset pagination and force refresh data
        setPagination(prev => ({ ...prev, current: 1 }));
        await fetchDemandesData(1, true);
        
        ToastService.success('Demande retournée avec succès');
        setShowReturnModal(false);
        setReturnMessage('');
      }
    } catch (error) {
      // console.error('Error returning demande:', error);
      if (error.response?.status === 401) {
        ToastService.error('Vous n\'êtes pas autorisé à retourner cette demande');
      } else if (error.response?.status === 404) {
        ToastService.error('Validation non trouvée');
      } else if (error.response?.status === 422) {
        ToastService.error('Le message doit contenir au moins 5 caractères');
      } else {
        ToastService.error('Une erreur est survenue lors du retour de la demande');
      }
    } finally {
      setIsSubmittingReturn(false);
    }
  };

  // Add this new function to handle modal transitions
  const handleModalTransition = () => {
    const fullMessageModal = document.querySelector('#hs-messages-modal');
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

  // Add handleShowValidations function
  const handleShowValidations = async (demandeId, e) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }

    setIsLoadingValidations(true);
    document.body.style.overflow = 'hidden'; // Prevent scrolling while loading

    try {
      const response = await axiosInstance.get(`/ALLValidationsParMYDemande/${demandeId}`);
      if (response.data) {
        // Wait for loading animation
        // await new Promise(resolve => setTimeout(resolve, 800));
        setSelectedValidations(response.data);
        setShowValidationModal(true);
      }
    } catch (error) {
      // console.error('Error fetching validations:', error);
      ToastService.error('Erreur lors de la récupération des validations');
    } finally {
      setIsLoadingValidations(false);
      document.body.style.overflow = ''; // Restore scrolling
    }
  };

  // Get unique entities from the current data
  const getUniqueEntities = useCallback(() => {
    const data = activeTab === 'pending' ? demandes : activeTab === 'updated' ? demandesUpdated : validations;
    const uniqueEntities = data
      .map(item => {
        const demande = activeTab === 'history' ? item.demande : item;
        return demande?.user?.entity?.name || demande?.entity?.name;
      })
      .filter(Boolean);
    return [...new Set(uniqueEntities)];
  }, [activeTab, demandes, demandesUpdated, validations]);

  // Update handleTabChange
  const handleTabChange = useCallback((tab) => {
    setActiveTab(tab);
    setSearchTerm('');
    setTypeFilter('all');
    setStatusFilter('all');
    setEntityFilter('all');
    setUserFilter('all');
    setEntitySearchTerm('');
    setUserSearchTerm('');
    setShowEntityDropdown(false);
    setShowUserDropdown(false);
    setSortConfig({ key: null, direction: 'asc' });
    setPagination(prev => ({
      ...prev,
      current: 1,
      total: 0,
      lastPage: 1
    }));
    fetchDemandesData(1);
  }, [fetchDemandesData]);

  // Update handleStatusFilter
  const handleStatusFilter = useCallback((value) => {
    setStatusFilter(value);
    setPagination(prev => ({ ...prev, current: 1 }));
    fetchDemandesData(1);
  }, [fetchDemandesData]);

  // Add function to fetch all data for export
  const fetchAllDataForExport = async (type = 'all') => {
    try {
      const queryParams = new URLSearchParams({
        per_page: 9999,
        ...(searchTerm && { search: searchTerm }),
        ...(typeFilter !== 'all' && { type: typeFilter }),
        ...(entityFilter !== 'all' && { entity: entityFilter }),
        ...(statusFilter !== 'all' && { status: statusFilter }),
        ...(userFilter !== 'all' && { user_id: userFilter }),
        ...(sortConfig.key && { 
          sort_key: sortConfig.key,
          sort_direction: sortConfig.direction 
        })
      }).toString();

      let response;
      if (activeTab === 'pending') {
        response = await axiosInstance.get(`pendingDemandesToValidate?${queryParams}`);
      }

      if (response.data && response.data.data) {
        let dataToExport = response.data.data;
        
        // Filter by type if specified
        if (type !== 'all') {
          dataToExport = dataToExport.filter(item => {
            if (type === 'documents') {
              return item.type_demande === "Demande des documents administratifs";
            } else if (type === 'conges') {
              return item.type_demande === "Demande de congés";
            }
            return true;
          });
        }

        // Format data for Excel based on type
        const formattedData = dataToExport.map(item => {
          if (type === 'conges') {
            // Get validation info
            const validations = item.validations || [];
            const chefValidation = validations.find(v => v.role === "Chef de département");
            const validatorValidation = validations.find(v => v.role === "Validator");
            const rhValidation = validations.find(v => v.role === "Admin RH");

            return {
              'Nom': item.nom || '',
              'Prénom': item.prenom || '',
              'BU': item.bu_direction || '',
              'Matricule': item.user?.matricule || '',
              'Type de demande': item.type_demande || '',
              'Type document': item.type_document || '-',
              'Type congé': item.type_conge || '-',
              'Nature congé': item.nature_conge || '-',
              'Motif congé': item.motif_conge || '-',
              'Intérim': item.interim || '-',
              'Date début': item.date_debut ? new Date(item.date_debut).toLocaleDateString('fr-FR') : '-',
              'Date fin': item.date_fin ? new Date(item.date_fin).toLocaleDateString('fr-FR') : '-',
              'Durée': item.duree || '-',
              'Status': item.status || 'En attente',
              'Chef de département': chefValidation ? `${chefValidation.validator?.first_name || ''} ${chefValidation.validator?.last_name || ''}` : '-',
              'Date validation Chef': chefValidation ? new Date(chefValidation.validated_at).toLocaleString('fr-FR') : '-',
              'Validator': validatorValidation ? `${validatorValidation.validator?.first_name || ''} ${validatorValidation.validator?.last_name || ''}` : '-',
              'Date validation Validator': validatorValidation ? new Date(validatorValidation.validated_at).toLocaleString('fr-FR') : '-',
              'Admin RH': rhValidation ? `${rhValidation.validator?.first_name || ''} ${rhValidation.validator?.last_name || ''}` : '-',
              'Date validation RH': rhValidation ? new Date(rhValidation.validated_at).toLocaleString('fr-FR') : '-'
            };
          } else {
            return {
              'Nom': item.user.first_name || '',
              'Prénom': item.user.last_name || '',
              'Matricule': item.user.matricule || '',
              'BU': item.user.entity?.name || '',
              'Type de demande': item.type_demande || '',
              'Type spécifique': item.type_document || item.type_conge || '-',
              'Date de création': new Date(item.created_at).toLocaleString('fr-FR', {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
              }),
              'Status': item.status || 'En attente'
            };
          }
        });

        // Create workbook and worksheet
        const workbook = utils.book_new();
        const worksheet = utils.json_to_sheet(formattedData);

        // Auto-size columns
        const maxWidth = formattedData.reduce((w, r) => Math.max(w, Object.keys(r).length), 0);
        const colWidths = new Array(maxWidth).fill({ wch: 25 }); // Set width to 25 characters
        worksheet['!cols'] = colWidths;

        // Add worksheet to workbook
        utils.book_append_sheet(workbook, worksheet, type === 'conges' ? 'Congés' : 'Demandes');

        // Generate filename with date and type
        const date = new Date().toISOString().split('T')[0];
        const filename = `demandes_${type}_${date}.xlsx`;

        // Save file
        writeFile(workbook, filename);
        ToastService.success('Export Excel réussi');
      }
    } catch (error) {
      // console.error('Export error:', error);
      ToastService.error('Erreur lors de l\'export Excel');
    } finally {
      setShowExportDropdown(false);
    }
  };

  // Update getFileIcon function to handle images
  const getFileIcon = (fileName) => {
    const extension = fileName.split('.').pop().toLowerCase();
    switch (extension) {
      case 'pdf':
        return 'pdf-line';
      case 'doc':
      case 'docx':
        return 'file-word-line';
      case 'xls':
      case 'xlsx':
        return 'file-excel-line';
      case 'ppt':
      case 'pptx':
        return 'file-ppt-line';
      case 'jpg':
      case 'jpeg':
      case 'png':
      case 'gif':
        return 'image-line';
      default:
        return 'file-line';
    }
  };

 

 

  // Add handleShowFiles function
  const handleShowFiles = (demande) => {
    setSelectedDemandeForFiles(demande);
    const modal = document.querySelector('#hs-demande-files-modal');
    if (modal) {
      const HSOverlay = window.HSOverlay;
      if (HSOverlay) {
        HSOverlay.open(modal);
      }
    }
  };

  return (
    <Fragment>
      {isLoadingValidations && (
        <div className="fixed inset-0 z-[70] flex items-center justify-center bg-gray-900/50 backdrop-blur-sm">
           <LoadingLogo logo={logo} size={12} />
        </div>
      )}
      <ToastContainer
        position="top-right"
        autoClose={3000}
        hideProgressBar={false}
        newestOnTop
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="colored"
      />
      <Pageheader currentpage="Liste Des Demandes" activepage="Liste Des Demandes" mainpage="Liste Des Demandes" />
      <div className="grid grid-cols-12 gap-6">
        <div className="xl:col-span-12 col-span-12">
          <div className="box custom-box !shadow-sm hover:!shadow-md transition-all duration-300">
            <div className="box-header flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-gray-200 dark:border-gray-700 px-6 py-4">
              <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between w-full gap-4">
                <div className="box-title text-xl font-semibold text-gray-800 dark:text-white">
                  Liste Des Demandes
                </div>
                <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 w-full lg:w-auto">
                  <div className="flex flex-wrap sm:flex-nowrap items-center gap-2 w-full sm:w-auto">
                    <button
                      onClick={() => handleTabChange('pending')}
                      className={`flex-1 sm:flex-none px-4 py-2 rounded-lg font-medium transition-all duration-200 flex items-center justify-center gap-2 ${
                        activeTab === 'pending'
                          ? 'bg-primary text-white'
                          : 'bg-gray-100 text-gray-600 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-300'
                      }`}
                    >
                      <span className="whitespace-nowrap">Demandes</span>
                      <span className={`inline-flex items-center justify-center px-2 py-1 text-xs font-bold rounded-full ${
                        activeTab === 'pending'
                          ? 'bg-white text-primary'
                          : 'bg-primary/10 text-primary dark:bg-primary/20'
                      }`}>
                        {activeTab === 'pending' ? pagination.total : totalPending}
                      </span>
                    </button>
                    <button
                      onClick={() => handleTabChange('updated')}
                      className={`flex-1 sm:flex-none px-4 py-2 rounded-lg font-medium transition-all duration-200 flex items-center justify-center gap-2 ${
                        activeTab === 'updated'
                          ? 'bg-primary text-white'
                          : 'bg-gray-100 text-gray-600 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-300'
                      }`}
                    >
                      <span className="whitespace-nowrap">Mises à jour</span>
                      <span className={`inline-flex items-center justify-center px-2 py-1 text-xs font-bold rounded-full ${
                        activeTab === 'updated'
                          ? 'bg-white text-primary'
                          : 'bg-primary/10 text-primary dark:bg-primary/20'
                      }`}>
                        {totalUpdated}
                      </span>
                    </button>
                  </div>
                </div>
              </div>
              {activeTab === 'pending' && (
                <div className="relative inline-block" ref={exportDropdownRef}>
                  <button
                    onClick={() => setShowExportDropdown(!showExportDropdown)}
                    className="ti-btn bg-success hover:bg-success/80 text-white !rounded-full ti-btn-wave"
                  >
                    <i className="ri-file-excel-2-line mr-2"></i>
                    Exporter Excel
                  </button>
                  
                  {showExportDropdown && (
                    <div className="absolute right-0 mt-2 w-56 rounded-lg shadow-lg bg-white dark:bg-gray-800 ring-1 ring-black ring-opacity-5 z-50 divide-y divide-gray-100 dark:divide-gray-700">
                      <div className="py-1">
                        <button
                          onClick={() => fetchAllDataForExport('all')}
                          className="group flex items-center w-full px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-success/10 dark:hover:bg-success/10"
                        >
                          <i className="ri-file-list-line mr-3 text-gray-400 group-hover:text-success"></i>
                          Toutes les demandes
                        </button>
                        <button
                          onClick={() => fetchAllDataForExport('documents')}
                          className="group flex items-center w-full px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-success/10 dark:hover:bg-success/10"
                        >
                          <i className="ri-file-text-line mr-3 text-gray-400 group-hover:text-success"></i>
                          Documents administratifs
                        </button>
                        <button
                          onClick={() => fetchAllDataForExport('conges')}
                          className="group flex items-center w-full px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-success/10 dark:hover:bg-success/10"
                        >
                          <i className="ri-calendar-line mr-3 text-gray-400 group-hover:text-success"></i>
                          Congés
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              )}
              <TableFilters
                searchTerm={searchTerm}
                handleSearch={handleSearch}
                handleSearchSubmit={handleSearchSubmit}
                typeFilter={typeFilter}
                setTypeFilter={handleTypeFilter}
                entityFilter={entityFilter}
                handleEntityFilter={handleEntityFilter}
                statusFilter={statusFilter}
                setStatusFilter={handleStatusFilter}
                userFilter={userFilter}
                handleUserFilter={handleUserFilter}
                activeTab={activeTab}
                typeOptions={typeOptions}
                statusOptions={statusOptions}
                entities={entities}
                users={users}
                getUniqueEntities={getUniqueEntities}
                showEntityDropdown={showEntityDropdown}
                setShowEntityDropdown={setShowEntityDropdown}
                entitySearchTerm={entitySearchTerm}
                setEntitySearchTerm={setEntitySearchTerm}
                entityDropdownRef={entityDropdownRef}
                showUserDropdown={showUserDropdown}
                setShowUserDropdown={setShowUserDropdown}
                userSearchTerm={userSearchTerm}
                setUserSearchTerm={setUserSearchTerm}
                userDropdownRef={userDropdownRef}
              />
            </div>
            <div className="box-body px-6 py-4">
              <div className="overflow-x-auto">
                <div className="min-w-full inline-block align-middle">
                  {loading ? (
                    <TableSkeleton />
                  ) : (
                    <div className="overflow-hidden rounded-lg border border-gray-200 dark:border-gray-700">
                      <div className="overflow-x-auto">
                        <table className="ti-custom-table ti-custom-table-head w-full text-sm">
                          <thead className="bg-gray-50 dark:bg-black/20">
                            <tr>
                              <th scope="col" className="px-3 py-4 min-w-[200px]">
                                <div className="flex items-center gap-2 cursor-pointer hover:text-primary transition-colors group"
                                     onClick={() => handleSort('nom')}>
                                  <span className="truncate">Demandeur</span>
                                  <div className="flex items-center">
                                    <svg className={`w-4 h-4 flex-shrink-0 transition-transform ${
                                      sortConfig.key === 'nom' 
                                        ? 'text-primary ' + (sortConfig.direction === 'desc' ? 'transform rotate-180' : '')
                                        : 'text-gray-400 group-hover:text-primary'
                                    }`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 15l7-7 7 7" />
                                    </svg>
                                  </div>
                                </div>
                              </th>
                              <th scope="col" className="px-3 py-4 min-w-[160px]">
                                <div className="flex items-center gap-2 cursor-pointer hover:text-primary transition-colors group"
                                     onClick={() => handleSort('type_demande')}>
                                  <span className="truncate">Type</span>
                                  <div className="flex items-center">
                                    <svg className={`w-4 h-4 flex-shrink-0 transition-transform ${
                                      sortConfig.key === 'type_demande' 
                                        ? 'text-primary ' + (sortConfig.direction === 'desc' ? 'transform rotate-180' : '')
                                        : 'text-gray-400 group-hover:text-primary'
                                    }`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 15l7-7 7 7" />
                                    </svg>
                                  </div>
                                </div>
                              </th>
                              <th scope="col" className="px-3 py-4 min-w-[180px]">
                                <div className="flex items-center gap-2 cursor-pointer hover:text-primary transition-colors group"
                                     onClick={() => handleSort('created_at')}>
                                  <span className="truncate">Date</span>
                                  <div className="flex items-center">
                                    <svg className={`w-4 h-4 flex-shrink-0 transition-transform ${
                                      sortConfig.key === 'created_at' 
                                        ? 'text-primary ' + (sortConfig.direction === 'desc' ? 'transform rotate-180' : '')
                                        : 'text-gray-400 group-hover:text-primary'
                                    }`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 15l7-7 7 7" />
                                    </svg>
                                  </div>
                                </div>
                              </th>
                              <th scope="col" className="px-3 py-4 min-w-[100px]">
                                <div className="flex items-center gap-2 cursor-pointer hover:text-primary transition-colors group"
                                     onClick={() => handleSort('status')}>
                                  <span className="truncate">Status</span>
                                  <div className="flex items-center">
                                    <svg className={`w-4 h-4 flex-shrink-0 transition-transform ${
                                      sortConfig.key === 'status' 
                                        ? 'text-primary ' + (sortConfig.direction === 'desc' ? 'transform rotate-180' : '')
                                        : 'text-gray-400 group-hover:text-primary'
                                    }`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 15l7-7 7 7" />
                                    </svg>
                                  </div>
                                </div>
                              </th>
                              <th scope="col" className="px-3 py-4 min-w-[100px]">Actions</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                            {currentPageData.length > 0 ? (
                              currentPageData.map((item) => (
                                <TableRow
                                  key={item.id}
                                  item={item}
                                  activeTab={activeTab}
                                  handleView={handleView}
                                  handleShowValidations={handleShowValidations}
                                  handleApprove={handleApprove}
                                  handleReject={handleReject}
                                  handleShowFiles={handleShowFiles}
                                  setSelectedDemande={setSelectedDemande}
                                  setShowReturnModal={setShowReturnModal}
                                  user={user}
                                />
                              ))
                            ) : (
                              <tr>
                                <td colSpan="5" className="px-6 py-12">
                                  <div className="flex flex-col items-center justify-center">
                                    <div className="h-20 w-20 mb-4 flex items-center justify-center rounded-full bg-gray-100/80 dark:bg-black/20">
                                      <svg className="h-10 w-10 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
                                      </svg>
                                    </div>
                                    <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                                      {activeTab === 'pending' ? 'Aucune Demande en Attente' : 'Aucune Mise à jour'}
                                    </h3>
                                    <p className="text-base text-gray-500 dark:text-gray-400 text-center max-w-md">
                                      {searchTerm 
                                        ? 'Aucun résultat ne correspond à votre recherche.' 
                                        : activeTab === 'pending'
                                          ? 'Il n\'y a aucune demande en attente à afficher.'
                                          : 'Il n\'y a aucune demande mise à jour à afficher.'}
                                    </p>
                                  </div>
                                </td>
                              </tr>
                            )}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  )}
                </div>
              </div>
              {currentPageData.length > 0 && pagination.total > pagination.perPage && (
                <div className="mt-6 sm:mt-8 border-t border-gray-200 dark:border-gray-700 pt-6">
                  <CustomPagination
                    current={pagination.current}
                    total={pagination.total}
                    perPage={pagination.perPage}
                    lastPage={pagination.lastPage}
                    onPageChange={handlePageChange}
                    className="px-4 sm:px-6"
                  />
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Add Return Modal */}
      {showReturnModal && (
        <div className="fixed inset-0 z-[60] overflow-y-auto">
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
                      <i className="ri-arrow-go-back-line text-lg text-orange-500"></i>
                    </div>
                    <h3 className="text-base font-semibold text-gray-800 dark:text-white">
                      Retourner la Demande
                    </h3>
                  </div>
                  <button 
                    onClick={() => {
                      setShowReturnModal(false);
                      setReturnMessage('');
                    }}
                    className="text-gray-400 hover:text-gray-500 dark:text-gray-600 dark:hover:text-gray-400"
                  >
                    <span className="sr-only">Fermer</span>
                    <i className="ri-close-line text-xl"></i>
                  </button>
                </div>
                <div className="ti-modal-body p-6 overflow-y-auto flex-1 custom-scrollbar">
                  {selectedDemande && (
                    <div className="space-y-6">
                      {/* Demande Info */}
                      <div className="flex items-start space-x-4 p-4 bg-gray-50 dark:bg-black/20 rounded-xl">
                        <div className="w-8 h-8 rounded-lg bg-orange-100 dark:bg-orange-900/30 flex items-center justify-center">
                          <i className="ri-file-list-line text-lg text-orange-600 dark:text-orange-400"></i>
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Demande de</p>
                          <p className="text-base font-semibold text-gray-900 dark:text-white">
                            {selectedDemande.prenom} {selectedDemande.nom}
                          </p>
                          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                            {selectedDemande.type_demande}
                          </p>
                        </div>
                      </div>

                      {/* Message Editor */}
                      <div className="space-y-4">
                        <div className="flex items-center justify-between">
                          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                            Message de Retour
                          </label>
                          {returnMessage && (
                            <div className={`flex items-center text-sm ${
                              returnMessage.replace(/(<([^>]+)>)/gi, '').trim().length >= 5 
                                ? 'text-success' 
                                : 'text-danger'
                            }`}>
                              <i className={`${
                                returnMessage.replace(/(<([^>]+)>)/gi, '').trim().length >= 5 
                                  ? 'ri-checkbox-circle-fill' 
                                  : 'ri-error-warning-fill'
                              } mr-1`}></i>
                              {returnMessage.replace(/(<([^>]+)>)/gi, '').trim().length >= 5 
                                ? 'Message valide' 
                                : returnMessage.replace(/(<([^>]+)>)/gi, '').trim().length === 0
                                  ? 'Message requis'
                                  : 'Message trop court (min. 5 caractères)'}
                            </div>
                          )}
                        </div>
                        <div className={`sun-editor-container rounded-lg overflow-hidden border transition-colors duration-200 ${
                          !returnMessage ? 'border-gray-200 dark:border-gray-700' :
                          returnMessage.replace(/(<([^>]+)>)/gi, '').trim().length >= 5 
                            ? 'border-success/50 dark:border-success/30' 
                            : 'border-danger/50 dark:border-danger/30'
                        }`}>
                          <SunEditor
                            setContents={returnMessage}
                            onChange={(content) => {
                              setReturnMessage(content);
                            }}
                            setOptions={{
                              buttonList: [
                                ['undo', 'redo'],
                                ['bold', 'underline', 'italic', 'strike'],
                                ['list'],
                                ['link'],
                              ],
                              defaultTag: 'div',
                              minHeight: '150px',
                              maxHeight: '150px',
                              showPathLabel: false,
                              resizingBar: false,
                            }}
                            defaultValue={returnMessage}
                            placeholder="Saisissez votre message de retour ici... (minimum 5 caractères)"
                          />
                        </div>
                      </div>
                    </div>
                  )}
                </div>
                <div className="border-t border-gray-200 dark:border-gray-700 px-4 py-3 sm:flex sm:flex-row-reverse gap-2">
                  <button
                    type="button"
                    disabled={isSubmittingReturn || !returnMessage || returnMessage.replace(/(<([^>]+)>)/gi, '').trim().length < 5}
                    onClick={handleReturn}
                    className={`ti-btn !rounded-full ti-btn-wave w-full sm:w-auto ${
                      !returnMessage || returnMessage.replace(/(<([^>]+)>)/gi, '').trim().length < 5
                        ? 'ti-btn-disabled bg-gray-400 cursor-not-allowed opacity-60'
                        : 'ti-btn-orange-full'
                    }`}
                  >
                    {isSubmittingReturn ? (
                      <>
                        <svg className="animate-spin -ml-1 mr-2 h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Envoi...
                      </>
                    ) : (
                      <>
                        <i className="ri-arrow-go-back-line mr-2"></i>
                        Retourner la Demande
                      </>
                    )}
                  </button>
                  <button
                    type="button"
                    className="ti-btn ti-btn-outline-secondary !rounded-full ti-btn-wave w-full sm:w-auto"
                    onClick={() => {
                      setShowReturnModal(false);
                      setReturnMessage('');
                    }}
                  >
                    <i className="ri-close-line mr-2"></i>
                    Annuler
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Add Approve Confirmation Modal */}
      <div id="hs-approve-modal" className="hs-overlay hidden ti-modal">
        <div className="hs-overlay-open:mt-7 ti-modal-box mt-0 ease-out">
          <div className="ti-modal-content">
            {isApprovingDemande ? (
              <div className="flex flex-col items-center justify-center p-6">
                <LoadingLogo logo={logo} size={12} />
                <p className="mt-4 text-gray-600 dark:text-gray-400">
                  {isUploading ? 'Téléchargement des fichiers...' : 'Validation en cours...'}
                </p>
              </div>
            ) : (
              <>
                <div className="ti-modal-header">
                  <h3 className="ti-modal-title">
                    Confirmer la validation
                  </h3>
                  <button type="button" className="hs-dropdown-toggle ti-modal-close-btn" data-hs-overlay="#hs-approve-modal">
                    <span className="sr-only">Close</span>
                    <i className="ri-close-line"></i>
                  </button>
                </div>
                <div className="ti-modal-body">
                  <div className="flex items-center p-4 mb-4 text-yellow-800 bg-yellow-50 dark:bg-yellow-900/30 dark:text-yellow-300 rounded-lg">
                    <i className="ri-information-line text-xl me-3"></i>
                    <p>Êtes-vous sûr de vouloir valider cette demande ?</p>
                  </div>
                  {selectedDemande && (
                    <div className="space-y-3">
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        Demande de : <span className="font-medium text-gray-900 dark:text-white">{selectedDemande.prenom} {selectedDemande.nom}</span>
                      </p>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        Type : <span className="font-medium text-gray-900 dark:text-white">{selectedDemande.type_demande}</span>
                      </p>

                      {/* File upload section for Admin RH */}
                      {user?.data?.roles?.some(role => role.name === 'Admin RH') && (
                        <div className="mt-6 space-y-4">
                          <div className="flex items-center justify-between">
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                              Ajouter des fichiers
                            </label>
                            {selectedFiles.length > 0 && (
                              <span className="text-xs text-gray-500 dark:text-gray-400">
                                {selectedFiles.length} fichier(s) sélectionné(s) • {
                                  formatFileSize(selectedFiles.reduce((total, file) => total + file.size, 0))
                                }
                              </span>
                            )}
                          </div>
                          <div className="flex items-center justify-center w-full">
                            <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-gray-300 border-dashed rounded-lg cursor-pointer bg-gray-50 dark:hover:bg-gray-800 dark:bg-gray-700 hover:bg-gray-100 dark:border-gray-600 dark:hover:border-gray-500 transition-all duration-200">
                              <div className="flex flex-col items-center justify-center pt-5 pb-6">
                                <i className="ri-upload-cloud-2-line text-3xl text-gray-400 mb-2"></i>
                                <p className="mb-2 text-sm text-gray-500 dark:text-gray-400">
                                  <span className="font-semibold">Cliquez pour télécharger</span> ou glissez et déposez
                                </p>
                                <p className="text-xs text-gray-500 dark:text-gray-400">
                                  Sélectionnez plusieurs fichiers (MAX. 10MB par fichier)
                                </p>
                              </div>
                              <input 
                                ref={fileInputRef}
                                type="file" 
                                className="hidden" 
                                multiple 
                                onChange={handleFileChange}
                                accept=".pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.png,.jpg,.jpeg,.gif"
                              />
                            </label>
                          </div>
                          
                          {/* Display file errors if any */}
                          {Object.keys(fileErrors).length > 0 && (
                            <div className="mt-2">
                              {Object.entries(fileErrors).map(([fileName, error]) => (
                                <p key={fileName} className="text-sm text-danger">
                                  <i className="ri-error-warning-line mr-1"></i>
                                  {error}
                                </p>
                              ))}
                            </div>
                          )}

                          {/* Selected files list */}
                          {selectedFiles.length > 0 && (
                            <div className="mt-4">
                              <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                Fichiers sélectionnés :
                              </h4>
                              <ul className="space-y-2 max-h-48 overflow-y-auto custom-scrollbar">
                                {selectedFiles.map((file, index) => (
                                  <li key={index} className="flex items-center justify-between text-sm text-gray-600 dark:text-gray-400 bg-gray-50 dark:bg-gray-800 p-2 rounded-lg">
                                    <div className="flex items-center space-x-2 truncate">
                                      <i className={`ri-file-${getFileIcon(file.name)} text-lg text-gray-400`}></i>
                                      <span className="truncate max-w-[200px]" title={file.name}>{file.name}</span>
                                      <span className="text-xs text-gray-500">({formatFileSize(file.size)})</span>
                                    </div>
                                    <button
                                      onClick={() => {
                                        const newFiles = selectedFiles.filter((_, i) => i !== index);
                                        setSelectedFiles(newFiles);
                                        if (newFiles.length === 0) {
                                          if (fileInputRef.current) {
                                            fileInputRef.current.value = '';
                                          }
                                        }
                                      }}
                                      className="text-red-500 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300 transition-colors"
                                    >
                                      <i className="ri-close-line"></i>
                                    </button>
                                  </li>
                                ))}
                              </ul>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  )}
                </div>
                <div className="ti-modal-footer">
                  <button
                    type="button"
                    className="hs-dropdown-toggle ti-btn ti-btn-secondary"
                    data-hs-overlay="#hs-approve-modal"
                    onClick={() => {
                      setSelectedFiles([]);
                      if (fileInputRef.current) {
                        fileInputRef.current.value = '';
                      }
                    }}
                  >
                    <span className="flex items-center">
                      <i className="ri-close-line me-2"></i>
                      Annuler
                    </span>
                  </button>
                  <button
                    type="button"
                    className="ti-btn bg-success text-white hover:bg-success/80"
                    onClick={() => handleApprove(selectedDemande.id)}
                  >
                    <span className="flex items-center">
                      <i className="ri-check-line me-2"></i>
                      Confirmer
                    </span>
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Add Reject Confirmation Modal */}
      <div id="hs-reject-modal" className="hs-overlay hidden ti-modal">
        <div className="hs-overlay-open:mt-7 ti-modal-box mt-0 ease-out">
          <div className="ti-modal-content">
            {isRejectingDemande ? (
              <div className="flex flex-col items-center justify-center p-6">
                <LoadingLogo logo={logo} size={12} />
                <p className="mt-4 text-gray-600 dark:text-gray-400">Rejet en cours...</p>
              </div>
            ) : (
              <>
                <div className="ti-modal-header">
                  <h3 className="ti-modal-title">
                    Confirmer le rejet
                  </h3>
                  <button type="button" className="hs-dropdown-toggle ti-modal-close-btn" data-hs-overlay="#hs-reject-modal">
                    <span className="sr-only">Close</span>
                    <i className="ri-close-line"></i>
                  </button>
                </div>
                <div className="ti-modal-body">
                  <div className="flex items-center p-4 mb-4 text-red-800 bg-red-50 dark:bg-red-900/30 dark:text-red-300 rounded-lg">
                    <i className="ri-error-warning-line text-xl me-3"></i>
                    <p>Êtes-vous sûr de vouloir rejeter cette demande ?</p>
                  </div>
                  {selectedDemande && (
                    <div className="space-y-3">
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        Demande de : <span className="font-medium text-gray-900 dark:text-white">{selectedDemande.prenom} {selectedDemande.nom}</span>
                      </p>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        Type : <span className="font-medium text-gray-900 dark:text-white">{selectedDemande.type_demande}</span>
                      </p>
                    </div>
                  )}
                </div>
                <div className="ti-modal-footer">
                  <button
                    type="button"
                    className="hs-dropdown-toggle ti-btn ti-btn-secondary"
                    data-hs-overlay="#hs-reject-modal"
                  >
                    <span className="flex items-center">
                      <i className="ri-close-line me-2"></i>
                      Annuler
                    </span>
                  </button>
                  <button
                    type="button"
                    className="ti-btn bg-danger text-white hover:bg-danger/80"
                    onClick={() => handleReject(selectedDemande.id)}
                  >
                    <span className="flex items-center">
                      <i className="ri-close-line me-2"></i>
                      Confirmer
                    </span>
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Add Messages Modal */}
      <div id="hs-messages-modal" className="hs-overlay hidden ti-modal">
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
                className="ti-btn ti-btn-danger !font-medium !rounded-full px-6 py-2.5"
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

      {/* Add ValidationModal */}
      <ValidationModal
        isOpen={showValidationModal}
        onClose={() => setShowValidationModal(false)}
        validations={selectedValidations}
      />

      {/* Replace the old modal with the new component */}
      <DemandeDetailsModal
        selectedDemande={selectedDemande} 
      />

   

      {/* Replace the old files modal with DemandeFilesModal */}
      <DemandeFilesModal
        demande={selectedDemandeForFiles}
        onClose={() => setSelectedDemandeForFiles(null)}
      />
    </Fragment>
  );
};

export default ListeDemandesDirecteur;
