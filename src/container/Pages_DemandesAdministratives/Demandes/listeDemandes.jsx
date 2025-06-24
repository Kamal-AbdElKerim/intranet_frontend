import React, { Fragment, useState, useEffect, useCallback, useRef, forwardRef, useImperativeHandle } from 'react';
import Pageheader from '../../../components/common/pageheader/pageheader';
import CustomPagination from '../../../components/utile/CustomPagination';
import LoadingLogo from '../../../components/utile/LoadingLogo';
import ToastService from '../../../components/utile/toastService';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';
import { ToastContainer } from 'react-toastify';
import '../../../styles/listeDemandes.css';
import '../../../styles/quill-editor.css';
import '../../../styles/table.css';
import '../../../styles/animations.css';
import axiosInstance from '../../../Interceptor/axiosInstance';
import { useAuth } from '../../../components/utile/AuthProvider';
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { format } from 'date-fns';
import logo from "../../../assets/images/brand-logos/logo.png";
import DemandeDetailsModal from './components/DemandeDetailsModal';
import ValidationModal from './components/ValidationModal';
import DemandeFilesModal from './components/DemandeFilesModal';
import '../../../styles/datepicker.css';
import { FilePond, registerPlugin } from 'react-filepond';
import FilePondPluginImageExifOrientation from 'filepond-plugin-image-exif-orientation';
import FilePondPluginImagePreview from 'filepond-plugin-image-preview';
import 'filepond/dist/filepond.min.css';
import 'filepond-plugin-image-preview/dist/filepond-plugin-image-preview.css';

registerPlugin(FilePondPluginImagePreview, FilePondPluginImageExifOrientation);

// Custom Quill Editor Component
const QuillEditor = forwardRef(({ value, onChange }, ref) => {
  const editorRef = useRef(null);
  const [editor, setEditor] = useState(null);

  useImperativeHandle(ref, () => ({
    getEditor: () => editor,
    getEditorElement: () => editorRef.current
  }));

  // Effect to initialize the editor
  useEffect(() => {
    if (editorRef.current) {
      const quill = new ReactQuill.Quill(editorRef.current, {
        theme: 'snow',
        modules: {
          toolbar: [
            [{ 'header': [1, 2, false] }],
            ['bold', 'italic', 'underline', 'strike'],
            [{ 'list': 'ordered' }, { 'list': 'bullet' }],
            ['clean']
          ]
        },
        formats: [
          'header',
          'bold', 'italic', 'underline', 'strike',
          'list', 'bullet'
        ]
      });

      quill.root.innerHTML = value || '';

      quill.on('text-change', () => {
        onChange(quill.root.innerHTML);
      });

      setEditor(quill);

      return () => {
        quill.off('text-change');
      };
    }
  }, []);

  // Effect to update editor content when value prop changes
  useEffect(() => {
    if (editor && value !== editor.root.innerHTML) {
      editor.root.innerHTML = value || '';
    }
  }, [value, editor]);

  return (
    <div className="quill-editor-container">
      <div ref={editorRef} className="quill-editor" />
    </div>
  );
});

QuillEditor.displayName = 'QuillEditor';

const ListeDemandes = () => {
  const { user } = useAuth();


  const [demandes, setDemandes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortConfig, setSortConfig] = useState({ key: null, direction: 'asc' });
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [ouvriers, setOuvriers] = useState([]);
  const [selectedOuvrier, setSelectedOuvrier] = useState(null);
  const [showOuvrierSelect, setShowOuvrierSelect] = useState(false); // Add state for showing/hiding ouvrier selection
  const [selectedType, setSelectedType] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('');
  const [data, setData] = useState({
    nom: user?.data?.first_name || user?.data?.name || '',
    prenom: user?.data?.last_name || '',
    immatriculation: user?.data?.matricule || '',
    poste: user?.data?.job_title || '',
    bu_direction: user?.data?.entity || '',
    type_demande: '',
    type_document: '',
    type_conge: '',
    nature_conge: '',
    motif_conge: '',
    interim: '',
    date_debut: '',
    date_fin: '',
    duree: '',
    message: 'Bonjour,\n\nJe vous écris pour...',
  });
  const [showLoading, setShowLoading] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [demandeToDelete, setDemandeToDelete] = useState(null);
  const [demandeToEdit, setDemandeToEdit] = useState(null);
  const [editData, setEditData] = useState({
    nom: '',
    prenom: '',
    immatriculation: '',
    poste: '',
    bu_direction: '',
    type_demande: '',
    type_document: '',
    type_conge: '',
    nature_conge: '',
    motif_conge: '',
    interim: '',
    date_debut: '',
    date_fin: '',
    duree: '',
    message: '',
  });

  // Add refs
  const quillRef = useRef(null);
  const modalRef = useRef(null);

  // Add selectedDemande state near other state declarations
  const [selectedDemande, setSelectedDemande] = useState(null);
  const [loadingVerification, setLoadingVerification] = useState({});  // Add this state

  const typesDemande = [
    "Demande des documents administratifs",
    "Demande de congés"
  ];

  const typesDocument = [
    "Attestation de travail",
    "Bulletin de paie",
    "Domiciliation de salaire",
    "Bordereau de CNSS",
    "Attestation de travail et salaire"
  ];

  const typesConge = [
    "Congé annuel",
    "Congé spécial",
    "Congé sans solde"
  ];

  const natureCongeSpecial = [
    "Congé pour naissance",
    "Congé pour décès d'un proche",
    "Congé pour circoncision",
    "Congé pour mariage",
    "Congé de maternité",
    "Congé pour Hospitalisation",
    "Congé pour pèlerinage"
  ];

  const [pagination, setPagination] = useState({
    current: 1,
    total: 0,
    perPage: 10,
    lastPage: 1
  });

  const [ouvrierDemandes, setOuvrierDemandes] = useState([]); // Add state for Ouvrier demands
  const [demandeType, setDemandeType] = useState('regular'); // Add state for demand type filter

  const [regularDemandesCount, setRegularDemandesCount] = useState(0);
  const [ouvrierDemandesCount, setOuvrierDemandesCount] = useState(0);

  const [files, setFiles] = useState([]);
  const [loadingFiles, setLoadingFiles] = useState(false);

  // Add state for warning messages (separate from errors)
  const [warnings, setWarnings] = useState({});

  const fetchDemandeFiles = async (demandeId) => {
    try {
      setLoadingFiles(true);
      const response = await axiosInstance.get(`/demandes/${demandeId}/files`);
      setFiles(response.data.data || []);
    } catch (error) {
      // console.error('Error fetching files:', error);
      ToastService.error('Erreur lors du chargement des fichiers');
    } finally {
      setLoadingFiles(false);
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

  // Add this function to get today's date in YYYY-MM-DD format
  const getTodayDate = () => {
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, '0');
    const day = String(today.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  const changeHandler = (e) => {
    const { name, value } = e.target;

    // List of protected fields that shouldn't be modified
    const protectedFields = ['nom', 'prenom', 'immatriculation', 'poste', 'bu_direction'];

    // If the field is protected, don't allow changes
    if (protectedFields.includes(name)) {
      return;
    }

    if (name === 'type_demande') {
      setData(prev => ({
        ...prev,
        [name]: value,
        type_document: '',
        type_conge: '',
        nature_conge: '',
        motif_conge: '',
        interim: '',
        date_debut: '',
        date_fin: '',
        duree: ''
      }));

      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors.type_document;
        delete newErrors.type_conge;
        delete newErrors.nature_conge;
        delete newErrors.motif_conge;
        delete newErrors.interim;
        delete newErrors.date_debut;
        delete newErrors.date_fin;
        delete newErrors.duree;
        return newErrors;
      });


    } else if (name === 'type_conge') {
      // Clear nature_conge and motif_conge when type_conge changes
      setData(prev => ({
        ...prev,
        [name]: value,
        nature_conge: '',
        motif_conge: ''
      }));

      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors.nature_conge;
        delete newErrors.motif_conge;
        delete newErrors.duree;
        return newErrors;
      });

 
    } else if (name === 'nature_conge') {
      setData(prev => ({
        ...prev,
        [name]: value
      }));

      // Validate duration for special leave when nature changes
      if (data.type_demande === "Demande de congés" && data.type_conge === "Congé spécial" && data.date_debut && data.date_fin) {
        const workingDays = calculateWorkingDays(data.date_debut, data.date_fin);
        const maxDays = getMaxDaysForSpecialLeave(value);
        
        if (maxDays && workingDays > maxDays) {
          setWarnings(prev => ({
            ...prev,
            duree: `Attention: La durée demandée (${workingDays} jours) dépasse la limite autorisée pour ${value} (${maxDays} jours maximum)`
          }));
          setErrors(prev => ({
            ...prev,
            duree: ''
          }));
        } else {
          setWarnings(prev => ({
            ...prev,
            duree: ''
          }));
          setErrors(prev => ({
            ...prev,
            duree: ''
          }));
        }
      }
    } else if (name === 'date_debut' || name === 'date_fin') {
      const dateValue = new Date(value);

      // Check if it's a weekend or holiday
      if (isWeekend(dateValue) || isHoliday(value)) {
        // Find next working day
        const nextWorkingDay = getNextWorkingDay(dateValue);
        const formattedDate = format(nextWorkingDay, 'yyyy-MM-dd');

        setData(prev => {
          const newData = {
            ...prev,
            [name]: formattedDate
          };
          return newData;
        });

        // Validate date order immediately
        if (name === 'date_fin' && data.date_debut) {
          const startDate = new Date(data.date_debut);
          if (nextWorkingDay < startDate) {
            setErrors(prev => ({
              ...prev,
              date_fin: 'La date de fin doit être postérieure à la date de début'
            }));
          } else {
            setErrors(prev => ({
              ...prev,
              date_fin: ''
            }));
          }
        }
      } else {
        setData(prev => {
          const newData = {
            ...prev,
            [name]: value
          };
          return newData;
        });

        // Validate date order immediately
        if (name === 'date_fin' && data.date_debut) {
          const startDate = new Date(data.date_debut);
          const endDate = new Date(value);
          if (endDate < startDate) {
            setErrors(prev => ({
              ...prev,
              date_fin: 'La date de fin doit être postérieure à la date de début'
            }));
          } else {
            setErrors(prev => ({
              ...prev,
              date_fin: ''
            }));
          }
        }

        // Also validate when start date changes
        if (name === 'date_debut' && data.date_fin) {
          const startDate = new Date(value);
          const endDate = new Date(data.date_fin);
          if (endDate < startDate) {
            setErrors(prev => ({
              ...prev,
              date_fin: 'La date de fin doit être postérieure à la date de début'
            }));
          } else {
            setErrors(prev => ({
              ...prev,
              date_fin: ''
            }));
          }
        }
      }

      // Validate duration against user's solde for leave requests
      if (data.type_demande === "Demande de congés" && data.type_conge !== "Congé sans solde") {
        const updatedData = { ...data, [name]: value };
        const workingDays = calculateWorkingDays(updatedData.date_debut, updatedData.date_fin);
        const soldeForValidation = getSoldeForValidation();
        
        // Check for special leave type limits
        if (updatedData.type_conge === "Congé spécial" && updatedData.nature_conge) {
          const maxDays = getMaxDaysForSpecialLeave(updatedData.nature_conge);
          if (maxDays && workingDays > maxDays) {
            setWarnings(prev => ({
              ...prev,
              duree: `Attention: La durée demandée (${workingDays} jours) dépasse la limite autorisée pour ${updatedData.nature_conge} (${maxDays} jours maximum)`
            }));
            setErrors(prev => ({
              ...prev,
              duree: ''
            }));
            return;
          } else {
            setWarnings(prev => ({
              ...prev,
              duree: ''
            }));
          }
        }
        
        if (workingDays > soldeForValidation) {
          const entityName = selectedOuvrier ? selectedOuvrier.first_name || selectedOuvrier.name : 'votre';
          setWarnings(prev => ({
            ...prev,
            duree: `Attention: La durée demandée (${workingDays} jours) dépasse le solde disponible de ${entityName} (${soldeForValidation} jours)`
          }));
          setErrors(prev => ({
            ...prev,
            duree: ''
          }));
        } else {
          setWarnings(prev => ({
            ...prev,
            duree: `Solde suffisant: ${soldeForValidation} jours disponibles pour ${workingDays} jours demandés`
          }));
          setErrors(prev => ({
            ...prev,
            duree: ''
          }));
        }
      }
    } else {
      setData(prev => ({
        ...prev,
        [name]: value
      }));
    }

    validateField(name, value);
  };

  // Update validateField function to include proper validation for new fields
  const validateField = (name, value) => {
    let error = '';

    switch (name) {
      case 'nom':
        if (!value) error = 'Le nom est requis';
        break;
      case 'prenom':
        if (!value) error = 'Le prénom est requis';
        break;
      case 'immatriculation':
        if (!value) error = "L'immatriculation est requise";
        break;
      case 'poste':
        if (!value) error = 'Le poste est requis';
        break;
      case 'bu_direction':
        if (!value) error = 'La BU/Direction est requise';
        break;
      case 'type_demande':
        if (!value) error = 'Le type de demande est requis';
        break;
      case 'type_document':
        if (data.type_demande === "Demande des documents administratifs" && !value) {
          error = 'Le type de document est requis';
        }
        break;
      case 'type_conge':
        if (data.type_demande === "Demande de congés" && !value) {
          error = 'Le type de congé est requis';
        }
        break;
      case 'nature_conge':
        if (data.type_conge === "Congé spécial" && !value) {
          error = 'La nature du congé est requise';
        }
        break;
      case 'motif_conge':
        if (data.type_conge === "Congé sans solde" && !value) {
          error = 'Le motif du congé est requis';
        }
        break;
      case 'interim':
        if (data.type_demande === "Demande de congés" && !value) {
          error = "L'intérimaire est requis";
        }
        break;
      case 'date_debut':
        if (data.type_demande === "Demande de congés" && !value) {
          error = 'La date de début est requise';
        }
        break;
      case 'date_fin':
        if (data.type_demande === "Demande de congés") {
          if (!value) {
            error = 'La date de fin est requise';
          } else if (value < data.date_debut) {
            error = 'La date de fin doit être postérieure à la date de début';
          }
        }
        break;
      default:
        break;
    }

    setErrors(prev => ({
      ...prev,
      [name]: error
    }));



    return error;
  };

  // Update validateAllFields function to properly handle conditional validation
  const validateAllFields = (formData = data) => {
    const newErrors = {};

    // Always validate these fields
    if (!formData.nom) newErrors.nom = 'Le nom est requis';
    if (!formData.prenom) newErrors.prenom = 'Le prénom est requis';
    if (!formData.immatriculation) newErrors.immatriculation = "L'immatriculation est requise";
    if (!formData.poste) newErrors.poste = 'Le poste est requis';
    if (!formData.bu_direction) newErrors.bu_direction = 'La BU/Direction est requise';
    if (!formData.type_demande) newErrors.type_demande = 'Le type de demande est requis';

    // Conditional validation based on type_demande
    if (formData.type_demande === "Demande des documents administratifs") {
      if (!formData.type_document) newErrors.type_document = 'Le type de document est requis';
    } else if (formData.type_demande === "Demande de congés") {
      if (!formData.type_conge) newErrors.type_conge = 'Le type de congé est requis';
      if (!formData.interim) newErrors.interim = "L'intérimaire est requis";
      if (!formData.date_debut) newErrors.date_debut = 'La date de début est requise';
      if (!formData.date_fin) {
        newErrors.date_fin = 'La date de fin est requise';
      } else if (formData.date_fin < formData.date_debut) {
        newErrors.date_fin = 'La date de fin doit être postérieure à la date de début';
      }

      // Add validation for special leave nature
      if (formData.type_conge === "Congé spécial" && !formData.nature_conge) {
        newErrors.nature_conge = 'La nature du congé est requise';
      }

      // Add validation for unpaid leave reason
      if (formData.type_conge === "Congé sans solde" && !formData.motif_conge) {
        newErrors.motif_conge = 'Le motif du congé est requis';
      }

      // Add validation for duration against user's solde (except for unpaid leave)
      if (formData.type_conge !== "Congé sans solde" && formData.date_debut && formData.date_fin) {
        const workingDays = calculateWorkingDays(formData.date_debut, formData.date_fin);
        const soldeForValidation = getSoldeForValidation();
        
        // Check for special leave type limits first
        if (formData.type_conge === "Congé spécial" && formData.nature_conge) {
          const maxDays = getMaxDaysForSpecialLeave(formData.nature_conge);
          if (maxDays && workingDays > maxDays) {
            setWarnings(prev => ({
              ...prev,
              duree: `Attention: La durée demandée (${workingDays} jours) dépasse la limite autorisée pour ${formData.nature_conge} (${maxDays} jours maximum)`
            }));
            // Don't block submission for special leave
          } else {
            setWarnings(prev => ({
              ...prev,
              duree: ''
            }));
          }
        }
        
        // Then check against user's solde (only if no special leave error)
        if (!newErrors.duree && workingDays > soldeForValidation) {
          const entityName = selectedOuvrier ? selectedOuvrier.first_name || selectedOuvrier.name : 'votre';
          setWarnings(prev => ({
            ...prev,
            duree: `Attention: La durée demandée (${workingDays} jours) dépasse le solde disponible de ${entityName} (${soldeForValidation} jours)`
          }));
          // Don't block submission for solde issues
        } else if (!newErrors.duree) {
          setWarnings(prev => ({
            ...prev,
            duree: `Solde suffisant: ${soldeForValidation} jours disponibles pour ${workingDays} jours demandés`
          }));
        }
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Update fetchDemandes function
  const fetchDemandes = async (page = 1) => {
    try {
      if (!user?.data?.id) {
        ToastService.error('Utilisateur non authentifié');
        return;
      }

      setLoading(true);
      
      // Check if user has Ouvrier role
      const isOuvrier = user?.data?.roles?.some(role => role.name === 'Ouvrier');
      
      // Prepare query parameters
      const queryParams = new URLSearchParams({
        page,
        per_page: pagination.perPage,
        search: searchTerm || '',
        type: selectedType || 'all',
        status: selectedStatus || 'all',
        sort_key: sortConfig.key || '',
        sort_direction: sortConfig.direction || 'asc'
      }).toString();
      
      // Fetch regular demands with pagination and filters
      const regularResponse = await axiosInstance.get(`demandes?${queryParams}`);
      setRegularDemandesCount(regularResponse.data?.total || 0);
      
      // Only fetch ouvrier demands if user has Ouvrier role
      let ouvrierResponse = { data: { data: [], total: 0 } };
      if (isOuvrier) {
        ouvrierResponse = await axiosInstance.get(`ouvrier-demandes?${queryParams}`);
      }
      setOuvrierDemandesCount(ouvrierResponse.data?.total || 0);
      
      if (demandeType === 'ouvrier' && isOuvrier) {
        if (ouvrierResponse.data) {
          setOuvrierDemandes(ouvrierResponse.data.data);
          setPagination(prev => ({
            ...prev,
            current: ouvrierResponse.data.current_page,
            total: ouvrierResponse.data.total,
            lastPage: ouvrierResponse.data.last_page
          }));
        }
      } else {
        if (regularResponse.data) {
          setDemandes(regularResponse.data.data);
          setPagination(prev => ({
            ...prev,
            current: regularResponse.data.current_page,
            total: regularResponse.data.total,
            lastPage: regularResponse.data.last_page
          }));
        }
      }
    } catch (error) {
      // console.error('Error fetching demandes:', error);
      if (error.response?.status === 401) {
        ToastService.error('Veuillez vous connecter pour accéder à vos demandes');
      } else {
        ToastService.error('Erreur lors du chargement des demandes');
      }
    } finally {
      setLoading(false);
    }
  };

  // Add effect to refetch when demandeType changes
  useEffect(() => {
    fetchDemandes(1);
  }, [demandeType]);

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

      /* Subtle pulsing animation for pending requests */
      @keyframes pendingPulse {
        0%, 100% {
          background-color: rgba(167, 134, 0, 0.06);
        }
        50% {
          background-color: rgba(243, 241, 235, 0.1);
        }
      }

      .tr-row {
        transition: all 0.3s ease;
        border-left-width: 3px;
      }

      .tr-row-document {
        background-color: rgba(59, 130, 246, 0.03);
        border-left-color: rgb(59, 130, 246);
      }

      .tr-row-document:hover {
        background-color: rgba(59, 130, 246, 0.08);
      }

      .tr-row-leave {
        background-color: rgba(16, 185, 129, 0.03);
        border-left-color: rgb(16, 185, 129);
      }

      .tr-row-leave:hover {
        background-color: rgba(16, 185, 129, 0.08);
      }

      .tr-row-pending {
        animation: pendingPulse 3s ease-in-out infinite;
        border-left-color: rgb(250, 204, 21);
      }

      .dark .tr-row-document {
        background-color: rgba(59, 130, 246, 0.02);
      }

      .dark .tr-row-document:hover {
        background-color: rgba(59, 130, 246, 0.05);
      }

      .dark .tr-row-leave {
        background-color: rgba(16, 185, 129, 0.02);
      }

      .dark .tr-row-leave:hover {
        background-color: rgba(16, 185, 129, 0.05);
      }

      .dark .tr-row-pending {
        animation: pendingPulse 3s ease-in-out infinite;
      }
    `;
    document.head.appendChild(style);
    return () => document.head.removeChild(style);
  }, []);

  // Handle page change
  const handlePageChange = (page) => {
    setPagination(prev => ({ ...prev, current: page }));
    fetchDemandes(page);
  };

  // Update the sorting function to handle all columns
  const handleSort = (key) => {
    const direction = sortConfig.key === key && sortConfig.direction === 'asc' ? 'desc' : 'asc';
    setSortConfig({ key, direction });
    fetchDemandes(1); // Reset to first page when sorting changes
  };

  // Enhanced getFilteredAndSortedData function
  const getFilteredAndSortedData = () => {
    return demandeType === 'ouvrier' ? ouvrierDemandes : demandes;
  };

  // Get current page data
  const getCurrentPageData = () => {
    return getFilteredAndSortedData();
  };

  // Handle view action
  const handleView = (id) => {
    const demande = demandeType === 'ouvrier' ? ouvrierDemandes.find(d => d.id === id) : demandes.find(d => d.id === id);
    if (demande) {
      setSelectedDemande(demande);
      const modal = document.querySelector('#hs-view-demande-modal');
      if (modal) {
        const HSOverlay = window.HSOverlay;
        if (HSOverlay) {
          HSOverlay.open(modal);
        }
      }
    }
  };



  const checkCanAction = async (demandeId) => {
    try {
   
      
      setLoadingVerification(prev => ({ ...prev, [demandeId]: true }));

      const response = await axiosInstance.get(`/canAction/${demandeId}`);
   

      const permissions = {
        canEdit: response.data,
        canDelete: response.data
      };

      return permissions;
    } catch (error) {
      // console.error('Error checking action permissions:', error);
      // console.error('Error details:', error.response?.data);
      return { canEdit: false, canDelete: false };
    } finally {
      setTimeout(() => {
        setLoadingVerification(prev => ({ ...prev, [demandeId]: false }));
      }, 800);
    }
  };

  // Modify handleEdit to check permissions first
  const handleEdit = async (id) => {
    const permissions = await checkCanAction(id);
    if (!permissions.canEdit) {
      ToastService.info("Je ne peux pas effectuer cette opération pour le moment, car votre demande est en cours de traitement");
      return;
    }

    const demande = demandeType === 'ouvrier' ? ouvrierDemandes.find(d => d.id === id) : demandes.find(d => d.id === id);
    if (demande) {
      // Format dates to YYYY-MM-DD format for the date inputs
      const formatDate = (dateString) => {
        if (!dateString) return '';
        const date = new Date(dateString);
        return date.toISOString().split('T')[0];
      };

      setDemandeToEdit(demande);
      setEditData({
        nom: demande.nom || '',
        prenom: demande.prenom || '',
        immatriculation: demande.immatriculation || '',
        poste: demande.poste || '',
        bu_direction: demande.bu_direction || '',
        type_demande: demande.type_demande || '',
        type_document: demande.type_document || '',
        type_conge: demande.type_conge || '',
        nature_conge: demande.nature_conge || '',
        motif_conge: demande.motif_conge || '',
        interim: demande.interim || '',
        date_debut: formatDate(demande.date_debut),
        date_fin: formatDate(demande.date_fin),
        duree: demande.duree || '',
        message: demande.message || 'Bonjour,\n\nJe vous écris pour...',
      });

      // Reset any existing errors
      setErrors({});
      setWarnings({});

      const editModal = document.querySelector('#hs-edit-demande-modal');
      if (editModal) {
        const HSOverlay = window.HSOverlay;
        if (HSOverlay) {
          HSOverlay.open(editModal);
        }
      }

      // Trigger validation for existing data to show warnings
      setTimeout(() => {
        if (demande.type_demande === "Demande de congés" && demande.type_conge !== "Congé sans solde" && demande.date_debut && demande.date_fin) {
          const workingDays = calculateWorkingDays(formatDate(demande.date_debut), formatDate(demande.date_fin));
          const soldeForValidation = getSoldeForValidation();
          
          // Check for special leave type limits first
          if (demande.type_conge === "Congé spécial" && demande.nature_conge) {
            const maxDays = getMaxDaysForSpecialLeave(demande.nature_conge);
            if (maxDays && workingDays > maxDays) {
              setWarnings(prev => ({
                ...prev,
                duree: `Attention: La durée demandée (${workingDays} jours) dépasse la limite autorisée pour ${demande.nature_conge} (${maxDays} jours maximum)`
              }));
              return; // Don't check solde if special leave limit is exceeded
            }
          }
          
          // Then check against user's solde for all leave types
          if (workingDays > soldeForValidation) {
            const entityName = selectedOuvrier ? selectedOuvrier.first_name || selectedOuvrier.name : 'votre';
            setWarnings(prev => ({
              ...prev,
              duree: `Attention: La durée demandée (${workingDays} jours) dépasse le solde disponible de ${entityName} (${soldeForValidation} jours)`
            }));
          } else {
            setWarnings(prev => ({
              ...prev,
              duree: `Solde suffisant: ${soldeForValidation} jours disponibles pour ${workingDays} jours demandés`
            }));
          }
        }
      }, 100);
    }
  };

  // Modify handleDelete to check permissions first
  const handleDelete = async (id) => {
    const permissions = await checkCanAction(id);
    
    if (!permissions.canDelete) {
      ToastService.info("Je ne peux pas effectuer cette opération pour le moment, car votre demande est en cours de traitement");
      return;
    }

    const demande = demandeType === 'ouvrier' ? ouvrierDemandes.find(d => d.id === id) : demandes.find(d => d.id === id);
    if (demande) {
      setDemandeToDelete(demande);
      const modal = document.querySelector('#hs-delete-demande-modal');
      if (modal) {
        const HSOverlay = window.HSOverlay;
        if (HSOverlay) {
          HSOverlay.open(modal);
        }
      }
    }
  };

  // Add useEffect to initialize modals when component mounts
  useEffect(() => {
    const initModal = async () => {
      const preline = await import('preline');
      const HSOverlay = preline.HSOverlay || preline.default?.HSOverlay;
      if (HSOverlay && typeof HSOverlay.init === 'function') {
        HSOverlay.init();
      }

      // Add event listeners for modal events
      document.addEventListener('open.hs.overlay', () => {
        document.body.style.overflow = 'hidden';
      });

      document.addEventListener('close.hs.overlay', () => {
        document.body.style.overflow = '';
        document.body.style.paddingRight = '';
      });
    };

    initModal();

    // Cleanup function
    return () => {
      document.removeEventListener('open.hs.overlay', () => { });
      document.removeEventListener('close.hs.overlay', () => { });
      document.body.style.overflow = '';
      document.body.style.paddingRight = '';
    };
  }, []);

  // Add confirmDelete function
  const confirmDelete = async () => {
    if (!demandeToDelete) return;

    try {
      await axiosInstance.delete(`demandes/${demandeToDelete.id}`);
      
      ToastService.success('Demande supprimée avec succès');

      // Close the modal
      const modal = document.querySelector('#hs-delete-demande-modal');
      if (modal) {
        const HSOverlay = window.HSOverlay;
        if (HSOverlay) {
          HSOverlay.close(modal);
        }
      }

      // Refresh data from server to ensure everything is in sync
      await fetchDemandes();
      
    } catch (error) {
      // console.error('Error deleting demande:', error);
      if (error.response?.status === 401) {
        ToastService.error('Veuillez vous connecter pour supprimer une demande');
      } else if (error.response?.status === 404) {
        ToastService.error('Cette demande n\'existe pas ou a déjà été supprimée');
      } else {
        ToastService.error('Erreur lors de la suppression de la demande');
      }
    } finally {
      setDemandeToDelete(null);
    }
  };

  // Calculate duration when dates change
  useEffect(() => {
    if (data.date_debut && data.date_fin) {
      const start = new Date(data.date_debut);
      const end = new Date(data.date_fin);
      const diffTime = Math.abs(end - start);
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1; // +1 to include both start and end dates
      setData(prev => ({ ...prev, duree: diffDays }));
    }
  }, [data.date_debut, data.date_fin]);

  // Add useEffect for modal scroll management
  useEffect(() => {
    const initModal = async () => {
      const preline = await import('preline');
      const HSOverlay = preline.HSOverlay || preline.default?.HSOverlay;
      if (HSOverlay && typeof HSOverlay.init === 'function') {
        HSOverlay.init();
      }

      // Add event listeners for modal events
      document.addEventListener('open.hs.overlay', () => {
        document.body.style.overflow = 'hidden';
      });

      document.addEventListener('close.hs.overlay', () => {
        document.body.style.overflow = '';
        document.body.style.paddingRight = '';
      });
    };

    initModal();

    // Cleanup function
    return () => {
      document.removeEventListener('open.hs.overlay', () => { });
      document.removeEventListener('close.hs.overlay', () => { });
      document.body.style.overflow = '';
      document.body.style.paddingRight = '';
    };
  }, []);

  // Update closeModal function
  const closeModal = () => {
    const modal = document.querySelector('#hs-add-demande-modal');
    if (modal) {
      const HSOverlay = window.HSOverlay;
      if (HSOverlay) {
        HSOverlay.close(modal);
      } else {
        // fallback: remove classes and backdrop if HSOverlay is not available
        const backdrop = document.querySelector('.hs-overlay-backdrop');
        if (backdrop) backdrop.remove();
        modal.classList.remove('hs-overlay-open');
        modal.classList.add('hidden');
        document.body.style.overflow = '';
        document.body.style.paddingRight = '';
      }
    }
  };

  // Update handleSubmit to use mockApi
  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validate all fields
    const isValid = validateAllFields();
    
    // If validation fails, don't submit
    if (!isValid) {
      toast.error("Veuillez corriger les erreurs avant de soumettre");
      return;
    }

    setIsSubmitting(true);
    setShowLoading(true);

    try {
      const formData = new FormData();
      
      // Calculate working days and set it as duree
      const workingDays = calculateWorkingDays(data.date_debut, data.date_fin);
      const requestData = {
        ...data,
        duree: workingDays,
        // Add ouvrier_id if an Ouvrier is selected
        ...(selectedOuvrier ? { ouvrier_id: selectedOuvrier.id } : {})
      };
      
      // Add form fields with updated duree
      Object.keys(requestData).forEach(key => {
        formData.append(key, requestData[key]);
      });

      // Add files if type is Demande de congés
      if (data.type_demande === "Demande de congés" && files.length > 0) {
        files.forEach((fileItem) => {
          formData.append(`files[]`, fileItem.file);
        });
      }

      // First create the demand
      const response = await axiosInstance.post('demandes', requestData);
      
      // If files exist and it's a leave request, upload them
      if (data.type_demande === "Demande de congés" && files.length > 0 && response.data?.data?.id) {
        const demandeId = response.data.data.id;
        const filesFormData = new FormData();
        
        files.forEach((fileItem) => {
          filesFormData.append('files[]', fileItem.file);
        });

        // Upload files for the created demand
        await axiosInstance.post(`demandes/${demandeId}/files`, filesFormData, {
          headers: {
            'Content-Type': 'multipart/form-data'
          }
        });
      }
      
      if (response.data) {
        setShowLoading(false);
        setShowSuccess(true);

        const modal = document.querySelector('#hs-add-demande-modal');
        if (modal) {
          modal.classList.add('letter-fold');
          await new Promise(resolve => setTimeout(resolve, 1000));
          modal.classList.remove('letter-fold', 'sending');
        }

        closeModal();
        
        // Fetch fresh data instead of manually adding to the list
        await fetchDemandes();

        // Reset form
        setData({
          nom: user?.data?.first_name || user?.data?.name || '',
          prenom: user?.data?.last_name || '',
          immatriculation: user?.data?.matricule || '',
          poste: user?.data?.job_title || '',
          bu_direction: user?.data?.entity || '',
          type_demande: '',
          type_document: '',
          type_conge: '',
          nature_conge: '',
          motif_conge: '',
          interim: '',
          date_debut: '',
          date_fin: '',
          duree: '',
          message: 'Bonjour,\n\nJe vous écris pour...',
        });
        setErrors({});
        setWarnings({});
        setShowSuccess(false);

        ToastService.success('Demande ajoutée avec succès');
      }
    } catch (error) {
      setShowLoading(false);
      // console.error('Error submitting demande:', error);
      
      // Handle specific error cases
      if (error.code === 'ECONNABORTED') {
        ToastService.error('La requête a pris trop de temps. Veuillez réessayer.');
      } else if (error.response?.data?.errors) {
        setErrors(error.response.data.errors);
        ToastService.error('Veuillez corriger les erreurs dans le formulaire');
      } else if (error.response?.status === 401) {
        ToastService.error('Veuillez vous connecter pour soumettre une demande');
      } else if (error.response?.status === 413) {
        ToastService.error('La demande est trop volumineuse. Veuillez réduire la taille du message.');
      } else {
        ToastService.error('Une erreur est survenue lors de la soumission de la demande. Veuillez réessayer.');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  // Add this effect to handle editor cleanup
  useEffect(() => {
    return () => {
      if (quillRef.current?.getEditor()) {
        quillRef.current.getEditor().off('text-change');
      }
    };
  }, []);



  // Add useEffect for beforeunload event
  useEffect(() => {
    const handleBeforeUnload = (e) => {
      // Removed confirmation dialog
    };

    window.addEventListener('beforeunload', handleBeforeUnload);

    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, [data]);

  // Add handler for modal close button
  const handleModalClose = (e) => {
    // Reset form without confirmation
    setData({
      nom: user?.data?.first_name || user?.data?.name || '',
      prenom: user?.data?.last_name || '',
      immatriculation: user?.data?.matricule || '',
      poste: user?.data?.job_title || '',
      bu_direction: user?.data?.entity || '',
      type_demande: '',
      type_document: '',
      type_conge: '',
      nature_conge: '',
      motif_conge: '',
      interim: '',
      date_debut: '',
      date_fin: '',
      duree: '',
      message: 'Bonjour,\n\nJe vous écris pour...',
    });
    setErrors({});
    setWarnings({});
    // Reset Ouvrier selection state
    setSelectedOuvrier(null);
    setShowOuvrierSelect(false);
    // Reset file selection
    setFiles([]);
  };

  // Add this useEffect for modal initialization after other useEffects
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

  // Update data when user info changes
  useEffect(() => {
    if (user?.data) {
      setData(prevData => ({
        ...prevData,
        nom: user.data.first_name || user.data.name || '',
        prenom: user.data.last_name || '',
        immatriculation: user.data.matricule || '',
        poste: user.data.job_title || '',
        bu_direction: user.data.entity || ''
      }));
    }
  }, [user]);

  const statusOptions = [
    { value: '', label: 'Tous les statuts' },
    { value: 'En attente', label: 'En attente', color: 'warning' },
    { value: 'Traité', label: 'Traité', color: 'success' },
    // { value: 'Approuvée', label: 'Approuvée', color: 'success' },
    { value: 'Refusé', label: 'Refusé', color: 'danger' }
  ];

  const typeOptions = [
    { value: '', label: 'Tous les types' },
    { value: 'Demande des documents administratifs', label: 'Documents administratifs', color: 'blue' },
    { value: 'Demande de congés', label: 'Congés', color: 'emerald' }
  ];

  const [holidays, setHolidays] = useState([]);

  useEffect(() => {
    fetchHolidays();
  }, []);

  const fetchHolidays = async () => {
    try {
      const response = await axiosInstance.get('/holidays');
      if (response.data.success) {
        // Extract just the dates from the holiday objects and ensure proper formatting
        const holidayDates = response.data.data.map(holiday => {
          const date = new Date(holiday.date);
          return format(date, 'yyyy-MM-dd');
        });
        setHolidays(holidayDates);
      }
    } catch (error) {
      // console.error('Error fetching holidays:', error);
    }
  };

  const isWeekend = useCallback((date) => {
    const day = date.getDay();
    return day === 0 || day === 6; // 0 is Sunday, 6 is Saturday
  }, []);

  const isHoliday = useCallback((dateString) => {
    // Ensure we're working with a Date object
    const date = dateString instanceof Date ? dateString : new Date(dateString);
    // Format to yyyy-MM-dd for consistent comparison
    const formattedDate = format(date, 'yyyy-MM-dd');
    return holidays.includes(formattedDate);
  }, [holidays]);

  const getNextWorkingDay = useCallback((date) => {
    const nextDay = new Date(date);
    nextDay.setDate(nextDay.getDate() + 1);
    
    while (isWeekend(nextDay) || isHoliday(nextDay.toISOString().split('T')[0])) {
      nextDay.setDate(nextDay.getDate() + 1);
    }
    
    return nextDay;
  }, [isWeekend, isHoliday]);

   const calculateWorkingDays = useCallback((startDate, endDate) => {
    if (!startDate || !endDate) return 0;
    const start = new Date(startDate);
    const end = new Date(endDate);
    // Reset hours to midnight to avoid time zone issues
    start.setHours(0, 0, 0, 0);
    end.setHours(0, 0, 0, 0);
    
    let workingDays = 0;
    const current = new Date(start);
    
    // Include both start and end dates in the calculation
    while (current <= end) {
      if (!isWeekend(current) && !isHoliday(current)) {
        workingDays++;
      }
      current.setDate(current.getDate() + 1);
    }
    
    return Math.max(0, workingDays);
  }, [isWeekend, isHoliday]);

  const calculateTotalDays = useCallback((startDate, endDate) => {
    if (!startDate || !endDate) return 0;
    const start = new Date(startDate);
    const end = new Date(endDate);
    // Reset hours to midnight to avoid time zone issues
    start.setHours(0, 0, 0, 0);
    end.setHours(0, 0, 0, 0);
    // Add 1 to include both start and end dates
    return Math.max(0, Math.ceil((end - start) / (1000 * 60 * 60 * 24)) + 1);
  }, []);

  // CustomDatePicker component definition
  const CustomDatePicker = ({ selected, onChange, minDate, name, error, className }) => {
    const filterDate = (date) => {
      return !isWeekend(date) && !isHoliday(date);
    };

    const customDayClassName = (date) => {
      if (isWeekend(date) || isHoliday(date)) {
        return 'disabled-date-custom';
      }
      return '';
    };

    return (
      <div className="relative">
        <DatePicker
          selected={selected ? new Date(selected) : null}
          onChange={(date) => {
            onChange({
              target: {
                name,
                value: date ? format(date, 'yyyy-MM-dd') : ''
              }
            });
          }}
          minDate={minDate ? new Date(minDate) : new Date()}
          filterDate={filterDate}
          dayClassName={customDayClassName}
          className={`form-input block w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary sm:text-sm ${
            error ? 'border-red-500' : 'border-gray-300'
          } ${className || ''}`}
          name={name}
          dateFormat="yyyy-MM-dd"
          placeholderText="Select date"
          autoComplete="off"
          showPopperArrow={false}
          popperClassName="date-picker-popper"
        />
        {error && (
          <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
            <i className="ti ti-alert-circle text-red-500"></i>
          </div>
        )}
      </div>
    );
  };

  // Add handleEditSubmit function
  const handleEditSubmit = async (e) => {
    e.preventDefault();

    // Validate all fields
    const isValid = validateAllFields(editData);
    
    // If validation fails, don't submit
    if (!isValid) {
      toast.error("Veuillez corriger les erreurs avant de soumettre");
      return;
    }

    setIsSubmitting(true);
    setShowLoading(true);

    try {
      const formData = new FormData();
      
      // Calculate working days and set it as duree
      const workingDays = calculateWorkingDays(editData.date_debut, editData.date_fin);
      const requestData = {
        ...editData,
        duree: workingDays
      };
      
      const response = await axiosInstance.put(`demandes/${demandeToEdit.id}`, requestData);
      if (response.data) {
        // Wait for loading animation
        await new Promise(resolve => setTimeout(resolve, 300));

        setShowLoading(false);
        setShowSuccess(true);

        await new Promise(resolve => setTimeout(resolve, 1000));

      // Close the modal
        const modal = document.querySelector('#hs-edit-demande-modal');
        if (modal) {
          const HSOverlay = window.HSOverlay;
          if (HSOverlay) {
            HSOverlay.close(modal);
          }
        }

        // Fetch fresh data instead of manually updating the list
        await fetchDemandes();

        setDemandeToEdit(null);
        setEditData({
          nom: '',
          prenom: '',
          immatriculation: '',
          poste: '',
          bu_direction: '',
          type_demande: '',
          type_document: '',
          type_conge: '',
          nature_conge: '',
          motif_conge: '',
          interim: '',
          date_debut: '',
          date_fin: '',
          duree: '',
          message: '',
        });
        setErrors({});
        setWarnings({});
        setShowSuccess(false);

        ToastService.success('Demande modifiée avec succès');
      }
    } catch (error) {
      setShowLoading(false);
      // console.error('Error updating demande:', error);
      if (error.response?.data?.errors) {
        setErrors(error.response.data.errors);
        ToastService.error('Veuillez corriger les erreurs dans le formulaire');
      } else if (error.response?.status === 401) {
        ToastService.error('Veuillez vous connecter pour modifier une demande');
      } else {
        ToastService.error('Une erreur est survenue lors de la modification de la demande');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  // Add handleEditChange function
  const handleEditChange = (e) => {
    const { name, value } = e.target;

    // List of protected fields that shouldn't be modified
    const protectedFields = ['nom', 'prenom', 'immatriculation', 'poste', 'bu_direction'];

    // If the field is protected, don't allow changes
    if (protectedFields.includes(name)) {
      return;
    }

    if (name === 'type_demande') {
      // Only clear fields specific to the type of demand, preserve dates
      setEditData(prev => ({
        ...prev,
        [name]: value,
        type_document: '',
        type_conge: '',
        nature_conge: '',
        motif_conge: '',
        interim: '',
      }));

      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors.type_document;
        delete newErrors.type_conge;
        delete newErrors.nature_conge;
        delete newErrors.motif_conge;
        delete newErrors.interim;
        delete newErrors.duree;
        return newErrors;
      });
    } else if (name === 'date_debut' || name === 'date_fin') {
      const dateValue = new Date(value);

      // Check if it's a weekend or holiday
      if (isWeekend(dateValue) || isHoliday(value)) {
        // Find next working day
        const nextWorkingDay = getNextWorkingDay(dateValue);
        const formattedDate = format(nextWorkingDay, 'yyyy-MM-dd');

        setEditData(prev => {
          const newData = {
            ...prev,
            [name]: formattedDate
          };
          return newData;
        });

        // Validate date order immediately
        if (name === 'date_fin' && editData.date_debut) {
          const startDate = new Date(editData.date_debut);
          if (nextWorkingDay < startDate) {
            setErrors(prev => ({
              ...prev,
              date_fin: 'La date de fin doit être postérieure à la date de début'
            }));
          } else {
            setErrors(prev => ({
              ...prev,
              date_fin: ''
            }));
          }
        }
      } else {
        setEditData(prev => {
          const newData = {
            ...prev,
            [name]: value
          };
          return newData;
        });

        // Validate date order immediately
        if (name === 'date_fin' && editData.date_debut) {
          const startDate = new Date(editData.date_debut);
          const endDate = new Date(value);
          if (endDate < startDate) {
            setErrors(prev => ({
              ...prev,
              date_fin: 'La date de fin doit être postérieure à la date de début'
            }));
          } else {
            setErrors(prev => ({
              ...prev,
              date_fin: ''
            }));
          }
        }

        // Also validate when start date changes
        if (name === 'date_debut' && editData.date_fin) {
          const startDate = new Date(value);
          const endDate = new Date(editData.date_fin);
          if (endDate < startDate) {
            setErrors(prev => ({
              ...prev,
              date_fin: 'La date de fin doit être postérieure à la date de début'
            }));
          } else {
            setErrors(prev => ({
              ...prev,
              date_fin: ''
            }));
          }
        }
      }

      // Validate duration against user's solde for leave requests
      if (editData.type_demande === "Demande de congés" && editData.type_conge !== "Congé sans solde") {
        const updatedEditData = { ...editData, [name]: value };
        const workingDays = calculateWorkingDays(updatedEditData.date_debut, updatedEditData.date_fin);
        const soldeForValidation = getSoldeForValidation();
        
        // Check for special leave type limits first
        if (updatedEditData.type_conge === "Congé spécial" && updatedEditData.nature_conge) {
          const maxDays = getMaxDaysForSpecialLeave(updatedEditData.nature_conge);
          if (maxDays && workingDays > maxDays) {
            setWarnings(prev => ({
              ...prev,
              duree: `Attention: La durée demandée (${workingDays} jours) dépasse la limite autorisée pour ${updatedEditData.nature_conge} (${maxDays} jours maximum)`
            }));
            // Don't block submission for special leave
          } else {
            setWarnings(prev => ({
              ...prev,
              duree: ''
            }));
          }
        }
        
        // Then check against user's solde (only if no special leave error)
        if (workingDays > soldeForValidation) {
          const entityName = selectedOuvrier ? selectedOuvrier.first_name || selectedOuvrier.name : 'votre';
          setWarnings(prev => ({
            ...prev,
            duree: `Attention: La durée demandée (${workingDays} jours) dépasse le solde disponible de ${entityName} (${soldeForValidation} jours)`
          }));
          // Don't block submission for solde issues
        } else {
          setWarnings(prev => ({
            ...prev,
            duree: `Solde suffisant: ${soldeForValidation} jours disponibles pour ${workingDays} jours demandés`
          }));
        }
      }
    } else {
      // For all other fields, just update the value
      setEditData(prev => ({
        ...prev,
        [name]: value
      }));

      // Validate duration for special leave when nature changes
      if (name === 'nature_conge' && editData.type_demande === "Demande de congés" && editData.type_conge === "Congé spécial" && editData.date_debut && editData.date_fin) {
        const workingDays = calculateWorkingDays(editData.date_debut, editData.date_fin);
        const maxDays = getMaxDaysForSpecialLeave(value);
        
        if (maxDays && workingDays > maxDays) {
          setWarnings(prev => ({
            ...prev,
            duree: `Attention: La durée demandée (${workingDays} jours) dépasse la limite autorisée pour ${value} (${maxDays} jours maximum)`
          }));
        } else {
          setWarnings(prev => ({
            ...prev,
            duree: ''
          }));
        }
      }
    }

    // Clear any existing error for the field being changed
    if (errors[name]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
  };

  // Add these state variables at the top of your component
  const [showValidationModal, setShowValidationModal] = useState(false);
  const [selectedValidations, setSelectedValidations] = useState([]);
  const [isLoadingValidations, setIsLoadingValidations] = useState(false);

  // Add this function with your other functions
  const handleShowValidations = async (demandeId, e) => {
   
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }

    // Show loading first
    setIsLoadingValidations(true);
    document.body.style.overflow = 'hidden';

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

  // Add useEffect to fetch permissions when demandes are loaded
  // useEffect(() => {
  //   let mounted = true;

  //   return () => {
  //     mounted = false;
  //   };
  // }, []);

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

  const getStatusColor = (status) => {
    switch (status) {
      case 'En attente':
        return 'bg-warning/20 text-warning dark:bg-warning/20 dark:text-warning';
      case 'Approuvée':
      case 'Traité':
        return 'bg-success/20 text-success dark:bg-success/20 dark:text-success';
      default:
        return 'bg-danger/20 text-danger dark:bg-danger/20 dark:text-danger';
    }
  };

  // Add useEffect to fetch ouvriers if user is Ouvrier
  useEffect(() => {
    const fetchOuvriers = async () => {
      const isOuvrier = user?.data?.roles?.some(role => role.name === 'Ouvrier');
      if (isOuvrier) {
        try {
          const response = await axiosInstance.get('/ouvriers');
          if (response.data?.data) {
            setOuvriers(response.data.data);
          }
        } catch (error) {
          // console.error('Error fetching ouvriers:', error);
          ToastService.error('Erreur lors de la récupération des ouvriers');
        }
      }
    };

    if (user?.data?.id) {
      fetchOuvriers();
    }
  }, [user]);

  // Add handler for ouvrier selection
  const handleOuvrierChange = (e) => {
    const ouvrierId = e.target.value;
    const selectedOuv = ouvriers.find(o => o.id === parseInt(ouvrierId));
    setSelectedOuvrier(selectedOuv);
    
    if (selectedOuv) {
      setData(prev => ({
        ...prev,
        nom: selectedOuv.first_name || selectedOuv.name || '',
        prenom: selectedOuv.last_name || '',
        immatriculation: selectedOuv.matricule || '',
        poste: selectedOuv.job_title || 'Ouvrier',
        bu_direction: selectedOuv.entity?.name || selectedOuv.BU || '',
      }));
    } else {
      setData(prev => ({
        ...prev,
        nom: user?.data?.first_name || user?.data?.name || '',
        prenom: user?.data?.last_name || '',
        immatriculation: user?.data?.matricule || '',
        poste: user?.data?.job_title || '',
        bu_direction: user?.data?.entity || '',
      }));
    }

    // Trigger duration validation when Ouvrier changes
    if (data.type_demande === "Demande de congés" && data.type_conge !== "Congé sans solde" && data.date_debut && data.date_fin) {
      const workingDays = calculateWorkingDays(data.date_debut, data.date_fin);
      const soldeForValidation = selectedOuv ? (selectedOuv.solde || 0) : (user?.data?.solde || 0);
      
      // Check for special leave type limits first
      if (data.type_conge === "Congé spécial" && data.nature_conge) {
        const maxDays = getMaxDaysForSpecialLeave(data.nature_conge);
        if (maxDays && workingDays > maxDays) {
          setWarnings(prev => ({
            ...prev,
            duree: `Attention: La durée demandée (${workingDays} jours) dépasse la limite autorisée pour ${data.nature_conge} (${maxDays} jours maximum)`
          }));
          setErrors(prev => ({
            ...prev,
            duree: ''
          }));
          return;
        } else {
          setWarnings(prev => ({
            ...prev,
            duree: ''
          }));
        }
      }
      
      if (workingDays > soldeForValidation) {
        const entityName = selectedOuv ? selectedOuv.first_name || selectedOuv.name : 'votre';
        setWarnings(prev => ({
          ...prev,
          duree: `Attention: La durée demandée (${workingDays} jours) dépasse le solde disponible de ${entityName} (${soldeForValidation} jours)`
        }));
        setErrors(prev => ({
          ...prev,
          duree: ''
        }));
      } else {
        setWarnings(prev => ({
          ...prev,
          duree: `Solde suffisant: ${soldeForValidation} jours disponibles pour ${workingDays} jours demandés`
        }));
        setErrors(prev => ({
          ...prev,
          duree: ''
        }));
      }
    }
  };

  // Add handler for canceling ouvrier selection
  const handleCancelOuvrierSelection = () => {
    setSelectedOuvrier(null);
    setShowOuvrierSelect(false);
    // Reset form data to current user's data
    setData(prev => ({
      ...prev,
      nom: user?.data?.first_name || user?.data?.name || '',
      prenom: user?.data?.last_name || '',
      immatriculation: user?.data?.matricule || '',
      poste: user?.data?.job_title || '',
      bu_direction: user?.data?.entity || '',
    }));
  };

  // Define datePickerStyles at the top of the component
  const datePickerStyles = `
    .react-datepicker-wrapper {
      width: 100%;
    }
    .react-datepicker__input-container {
      width: 100%;
    }
    .react-datepicker__day--highlighted {
      background-color: #f0f9ff;
    }
    .react-datepicker__day--disabled {
      color: #ccc;
    }
    .disabled-date-custom {
      background-color: #f3f4f6;
      color: #9ca3af;
    }
  `;

  // Add useEffect to check permissions when demandes change
  // useEffect(() => {
  //   const checkPermissions = async () => {
  //     // Create a Set to track which demands we've already checked
  //     const checkedDemandes = new Set();
      
  //     // Check permissions for all visible demands
  //     const currentData = getCurrentPageData();
  //     for (const demande of currentData) {
  //       // Skip if we've already checked this demand
  //       if (checkedDemandes.has(demande.id)) continue;
        
  //       // Only check if it's a regular demand or if the user created it
  //       if (demandeType === 'regular' || demande.created_by === user?.data?.id) {
  //         // await checkCanAction(demande.id);
  //         checkedDemandes.add(demande.id);
  //       }
  //     }
  //   };

  //   if (demandes.length > 0 && user?.data?.id) {
  //     checkPermissions();
  //   }
  // }, [demandes, demandeType, user?.data?.id]);

  // // Update validation status check
  // const checkValidationStatus = async (demandeId) => {
  //   try {
  //     const response = await axiosInstance.get(`/ALLValidationsParMYDemande/${demandeId}`);
  //     if (response.data && response.data.length > 0) {
  //       // Get the latest validation
  //       const latestValidation = response.data[0];
       
  //       return latestValidation.status;
  //     }
     
  //     return null;
  //   } catch (error) {
  //     console.error('Error fetching validation status:', error);
     
  //     return 'error';
  //   }
  // };

  // Update useEffect to handle initial loading
  // useEffect(() => {
  //   const fetchValidations = async () => {
  //     const demandesList = demandeType === 'ouvrier' ? ouvrierDemandes : demandes;
  //     for (const demande of demandesList) {
  //       await checkValidationStatus(demande.id);
  //     }
  //   };
  //   fetchValidations();
  // }, [demandes, ouvrierDemandes, demandeType]);

  // Add handlers for filter changes
  const handleTypeChange = (e) => {
    setSelectedType(e.target.value);
    setPagination(prev => ({ ...prev, current: 1 }));
  };

  const handleStatusChange = (e) => {
    setSelectedStatus(e.target.value);
    setPagination(prev => ({ ...prev, current: 1 }));
  };

  const handleSearch = (value) => {
    setSearchTerm(value);
    setPagination(prev => ({ ...prev, current: 1 }));
  };

  // Add effect to refetch when filters change
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      fetchDemandes(1);
    }, 300); // Debounce search input

    return () => clearTimeout(timeoutId);
  }, [selectedType, selectedStatus, searchTerm]);

  const handleFileDelete = async (fileId, fileName) => {
    try {
      const isConfirmed = window.confirm(`Êtes-vous sûr de vouloir supprimer le fichier "${fileName}" ?`);
      
      if (!isConfirmed) {
        return;
      }

      await axiosInstance.delete(`/demande-files/${fileId}`);
      
      // Refresh the files list
      if (demandeToEdit?.id) {
        await fetchDemandeFiles(demandeToEdit.id);
      }
      
      ToastService.success('Fichier supprimé avec succès');
    } catch (error) {
      // console.error('Error deleting file:', error);
      ToastService.error('Erreur lors de la suppression du fichier');
    }
  };

  const handleViewFiles = (demande) => {
  setSelectedDemande(demande);
  const filesModal = document.querySelector('#hs-demande-files-modal');
  if (filesModal) {
    const HSOverlay = window.HSOverlay;
    if (HSOverlay) {
      HSOverlay.open(filesModal);
    }
  }
};

  // Function to get maximum allowed days for special leave types
  const getMaxDaysForSpecialLeave = (natureConge) => {
    const maxDaysMap = {
      'Congé pour mariage': 4,
      'Congé pour naissance': 3,
      'Congé pour décès d\'un proche': 3,
      'Congé pour circoncision': 2,
      'Congé de maternité': 98, // 14 weeks * 7 days
      'Congé pour pèlerinage': 30,
      'Congé pour Hospitalisation': 3
    };
    return maxDaysMap[natureConge] || null;
  };

  // Helper function to get the correct solde for validation
  const getSoldeForValidation = () => {
    // If an Ouvrier is selected, use their solde
    if (selectedOuvrier) {
      return selectedOuvrier.solde || 0;
    }
    // Otherwise use the current user's solde
    return user?.data?.solde || 0;
  };

  // Helper function to check if it's a special leave type
  const isSpecialLeave = (typeConge, natureConge) => {
    return typeConge === "Congé spécial" && natureConge;
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
              <div className="flex flex-col sm:flex-row items-center justify-between w-full gap-4">
                <div className="box-title text-xl font-semibold text-gray-800 dark:text-white">
                  Liste Des Demandes
                </div>
                <div className="flex flex-col sm:flex-row items-center gap-4 w-full sm:w-auto">
                  <div className="flex rounded-lg overflow-hidden border border-gray-200 dark:border-gray-700 w-full sm:w-auto">
                    <button
                      onClick={() => {
                        setDemandeType('regular');
                        setSelectedType('');
                        setSelectedStatus('');
                        setSearchTerm('');
                      }}
                      className={`px-4 py-2 text-sm font-medium transition-all duration-200 w-full sm:w-auto flex items-center gap-3 ${
                        demandeType === 'regular'
                          ? 'bg-primary text-white'
                          : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
                      }`}
                    >
                      Mes Demandes
                      {regularDemandesCount > 0 && (
                        <span className={`inline-flex items-center justify-center min-w-[24px] h-6 px-2 text-xs font-medium rounded-md transition-all duration-200 ${
                          demandeType === 'regular'
                            ? 'bg-white/20 text-white ring-1 ring-white/30'
                            : 'bg-primary/10 text-primary dark:text-primary-light ring-1 ring-primary/20'
                        }`}>
                          {regularDemandesCount}
                        </span>
                      )}
                    </button>
                    {user?.data?.roles?.some(role => role.name === 'Ouvrier') && (
                      <button
                        onClick={() => {
                          setDemandeType('ouvrier');
                          setSelectedType('');
                          setSelectedStatus('');
                          setSearchTerm('');
                        }}
                        className={`px-4 py-2 transition-all duration-200 w-full sm:w-auto flex items-center gap-3 ${
                          demandeType === 'ouvrier'
                            ? 'bg-primary text-white'
                            : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
                        }`}
                      >
                        Demandes Ouvrier
                        {ouvrierDemandesCount > 0 && (
                          <span className={`inline-flex items-center justify-center min-w-[24px] h-6 px-2 text-xs font-medium rounded-md transition-all duration-200 ${
                            demandeType === 'ouvrier'
                              ? 'bg-white/20 text-white ring-1 ring-white/30'
                              : 'bg-primary/10 text-primary dark:text-primary-light ring-1 ring-primary/20'
                          }`}>
                            {ouvrierDemandesCount}
                          </span>
                        )}
                      </button>
                    )}
                  </div>
                  <button
                    type="button"
                    data-hs-overlay="#hs-add-demande-modal"
                    onClick={() => {
                      setShowOuvrierSelect(false);
                      setSelectedOuvrier(null);
                    }}
                    className="ti-btn ti-btn-primary rounded-full px-6 py-2.5 transition-all duration-300 hover:shadow-lg hover:shadow-primary/30 focus:ring-2 focus:ring-primary/20 active:scale-95 w-full sm:w-auto"
                  >
                    <i className="ri-add-line mr-1"></i>
                    Nouvelle Demande
                  </button>
                </div>
              </div>
              <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 w-full">

                {/* Search Input */}
                {/* <div className="relative w-full sm:w-auto">
                  <input
                    type="text"
                    className="ti-form-input w-full rounded-lg pr-10 focus:ring-2 focus:ring-primary/20 border-gray-200 dark:border-gray-700 dark:bg-gray-900"
                    placeholder="Rechercher..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                  <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                    <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                  </div>
                </div> */}
                <div className="flex items-center gap-3 flex-wrap sm:flex-nowrap">
                  <div className="relative group">
                                         <select
                       value={selectedType}
                       onChange={handleTypeChange}
                       className="ti-form-select appearance-none pr-10 py-2.5 rounded-lg border-gray-200 dark:border-gray-700 dark:bg-gray-900 focus:ring-2 focus:ring-primary/20 cursor-pointer hover:border-gray-300 dark:hover:border-gray-600 transition-colors duration-200"
                     >
                      {typeOptions.map(option => (
                        <option
                          key={option.value}
                          value={option.value}
                          className={`py-2 ${option.color ? `text-${option.color}-600 dark:text-${option.color}-400` : ''}`}
                        >
                          {option.label}
                        </option>
                      ))}
                    </select>
                    <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                      <i className="ri-arrow-down-s-line text-gray-400 text-lg transition-transform duration-200 group-hover:text-gray-600 dark:group-hover:text-gray-300"></i>
                    </div>
                  </div>
                  <div className="relative group">
                                         <select
                       value={selectedStatus}
                       onChange={handleStatusChange}
                       className="ti-form-select appearance-none pr-10 py-2.5 rounded-lg border-gray-200 dark:border-gray-700 dark:bg-gray-900 focus:ring-2 focus:ring-primary/20 cursor-pointer hover:border-gray-300 dark:hover:border-gray-600 transition-colors duration-200"
                     >
                      {statusOptions.map(option => (
                        <option
                          key={option.value}
                          value={option.value}
                          className={`py-2 ${option.color ? `text-${option.color}-600 dark:text-${option.color}-400` : ''}`}
                        >
                          {option.label}
                        </option>
                      ))}
                    </select>
                    <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                      <i className="ri-arrow-down-s-line text-gray-400 text-lg transition-transform duration-200 group-hover:text-gray-600 dark:group-hover:text-gray-300"></i>
                    </div>
                  </div>
                </div>
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
                                    <svg className={`w-4 h-4 flex-shrink-0 transition-transform ${sortConfig.key === 'nom'
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
                                    <svg className={`w-4 h-4 flex-shrink-0 transition-transform ${sortConfig.key === 'type_demande'
                                        ? 'text-primary ' + (sortConfig.direction === 'desc' ? 'transform rotate-180' : '')
                                        : 'text-gray-400 group-hover:text-primary'
                                      }`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 15l7-7 7 7" />
                                    </svg>
                                  </div>
                                </div>
                              </th>
                              <th scope="col" className="hidden lg:table-cell px-3 py-4 min-w-[140px]">
                                <div className="flex items-center gap-2 cursor-pointer hover:text-primary transition-colors group"
                                  onClick={() => handleSort('created_at')}>
                                  <span className="truncate">Date</span>
                                  <div className="flex items-center">
                                    <svg className={`w-4 h-4 flex-shrink-0 transition-transform ${sortConfig.key === 'created_at'
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
                                    <svg className={`w-4 h-4 flex-shrink-0 transition-transform ${sortConfig.key === 'status'
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
                            {getCurrentPageData().length > 0 ? (
                              getCurrentPageData().map((demande) => {
                                const isDocumentRequest = demande.type_demande === "Demande des documents administratifs";
                                const isLeaveRequest = demande.type_demande === "Demande de congés";
                                const isPending = demande.status === "En attente";
                                
                                return (
                                  <tr
                                    key={demande.id}
                                    className={`
                                      tr-row
                                      ${isDocumentRequest ? 'tr-row-document' : ''}
                                      ${isLeaveRequest ? 'tr-row-leave' : ''}
                                      ${isPending ? 'tr-row-pending' : ''}
                                    `}
                                  >
                                    <td className="px-3 py-4 align-middle">
                                      <div className="flex items-center">
                                        <div className="flex-shrink-0">
                                          <div className={`
                                            w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold ${
                                              getStatusColor(demande.status)
                                            }
                                          `}>
                                            {(demande.prenom || demande.nom || 'U')[0]?.toUpperCase() || ''}
                                          </div>
                                        </div>
                                        <div className="ml-3">
                                          <span className={`
                                            font-medium block
                                            ${isDocumentRequest
                                              ? 'text-blue-900 dark:text-blue-300'
                                              : isLeaveRequest
                                                ? 'text-emerald-900 dark:text-emerald-300'
                                                : 'text-gray-900 dark:text-white'
                                            }
                                          `}>
                                            {`${demande.prenom} ${demande.nom}`}
                                          </span>
                                          <span className="text-sm text-gray-500 dark:text-gray-400">
                                            {demande.immatriculation}
                                          </span>
                                        </div>
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
                                    <td className="hidden lg:table-cell px-3 py-4 align-middle whitespace-nowrap">
                                      <div className={`
                                        text-sm font-medium
                                        ${isDocumentRequest
                                          ? 'text-blue-900 dark:text-blue-300'
                                          : isLeaveRequest
                                            ? 'text-emerald-900 dark:text-emerald-300'
                                            : 'text-gray-900 dark:text-white'
                                        }
                                      `}>
                                        {demande.created_at ? new Date(demande.created_at).toLocaleDateString('fr-FR', {
                                          day: '2-digit',
                                          month: '2-digit',
                                          year: 'numeric',
                                          hour: '2-digit',
                                          minute: '2-digit'
                                        }) : '-'}
                                      </div>
                                    </td>
                                    <td className="px-3 py-4 align-middle">
                                      <div className="flex items-center gap-2">
                                        <span className={`badge !rounded-full ${demande.status === 'En attente'
                                            ? 'bg-warning/20 text-warning dark:bg-warning/20 dark:text-warning'
                                            : demande.status === 'Approuvée' || demande.status === 'Traité'
                                              ? 'bg-success/20 text-success dark:bg-success/20 dark:text-success'
                                              : 'bg-danger/20 text-danger dark:bg-danger/20 dark:text-danger'
                                          }`}>
                                          <i className={`ri-${demande.status === 'En attente'
                                              ? 'time'
                                              : demande.status === 'Approuvée' || demande.status === 'Traité'
                                                ? 'check'
                                                : 'close'
                                            }-line me-1`}></i>
                                          {demande.status}
                                        </span>
                                        <button
                                          onClick={(e) => handleShowValidations(demande.id, e)}
                                          type="button"
                                          className="ti-btn !p-2 rounded-full bg-gray-100 text-gray-600 hover:bg-gray-200 focus:ring-gray-200 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700"
                                          title="Voir les validations"
                                        >
                                          <i className="ri-eye-line"></i>
                                        </button>
                                      </div>
                                    </td>
                                    <td className="!p-4 text-center">
                                      <div className="flex items-center justify-center gap-2">
                                        {/* <button
                                          onClick={() => handleView(demande.id)}
                                          type="button"
                                          className="ti-btn ti-btn-soft-success !py-1 !px-2 !text-xs"
                                          title="Voir la demande"
                                        >
                                          <i className="ri-file-text-line text-base"></i>
                                        </button> */}

                                        <button
                                          onClick={() => handleView(demande.id)}
                                          className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-full
                                            bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600
                                            transition-all duration-200 relative group"
                                          title="Voir la demande"
                                        >
                                          <i className="ri-eye-line text-base"></i>
                                        </button>

                                        {/* Add View Files button when status is "Traité" */}
                                        {demande.status === "Traité" && (
                                          <button
                                            onClick={() => handleViewFiles(demande)}
                                            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-full
                                            bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600
                                            transition-all duration-200 relative group"
                                            title="Voir les fichiers"
                                          >
                                            <i className="ri-folder-open-line text-base"></i>
                                          </button>
                                        )}

                                        {(demandeType === 'regular' || demande.created_by === user?.data?.id) && (
                                          <div className="flex items-center gap-2">
                                            {loadingVerification[demande.id] ? (
                                              <div className="animate-spin">
                                                <i className="ti ti-loader"></i>
                                              </div>
                                            ) : (
                                              <>
                                                {demande.status !== 'Traité' && demande.status !== 'Refusé' && (
                                                  <>
                                                    <button
                                                      onClick={() => handleEdit(demande.id)}
                                                      className="ti-btn rounded-full bg-primary/10 text-primary hover:bg-primary hover:text-white focus:ring-primary/20 dark:bg-primary/20 dark:hover:bg-primary"
                                                      title="Modifier"
                                                    >
                                                      <span className="flex items-center gap-1">
                                                        <i className="ri-pencil-line"></i>
                                                      </span>
                                                    </button>
                                                    <button
                                                      onClick={() => handleDelete(demande.id)}
                                                      className="ti-btn rounded-full bg-danger/10 text-danger hover:bg-danger hover:text-white focus:ring-danger/20 dark:bg-danger/20 dark:hover:bg-danger"
                                                      title="Supprimer"
                                                    >
                                                      <span className="flex items-center gap-1">
                                                        <i className="ri-delete-bin-line"></i>
                                                      </span>
                                                    </button>
                                                  </>
                                                )}
                                              </>
                                            )}
                                          </div>
                                        )}
                                      </div>
                                    </td>
                                  </tr>
                                );
                              })
                            ) : (
                              <tr>
                                <td colSpan="7" className="px-6 py-12">
                                  <div className="flex flex-col items-center justify-center">
                                    <div className="h-20 w-20 mb-4 flex items-center justify-center rounded-full bg-gray-100/80 dark:bg-black/20">
                                      <svg className="h-10 w-10 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
                                      </svg>
                                    </div>
                                    <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                                      Aucune Demande Trouvée
                                    </h3>
                                    <p className="text-base text-gray-500 dark:text-gray-400 text-center max-w-md">
                                      {searchTerm ? 'Aucun résultat ne correspond à votre recherche.' : 'Il n\'y a aucune demande à afficher.'}
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
              {getCurrentPageData().length > 0 && (
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

      {/* Static Backdrop Modal */}
      <div id="hs-add-demande-modal" className="hs-overlay hidden ti-modal [--overlay-backdrop:static]" ref={modalRef}>
        <div className="hs-overlay-open:mt-7 ti-modal-box mt-0 ease-out sm:w-[800px] !max-w-[800px] m-3 mx-auto h-[calc(100%-3.5rem)]">
          <div className="relative transform overflow-hidden rounded-2xl bg-white dark:bg-gray-800 shadow-2xl transition-all w-full h-full flex flex-col">
            {(showLoading || showSuccess) && (
              <div className="absolute inset-0 z-[60] flex items-center justify-center transition-all duration-300">
                <div className="absolute inset-0 backdrop-blur-[12px]">
                  <div className="absolute inset-0 bg-gradient-to-br from-white/50 via-primary/10 to-white/50 dark:from-gray-800/50 dark:via-primary/5 dark:to-gray-800/50" />
                </div>
                <div className="relative transform-gpu scale-100">
                  {showLoading ? (
                    <LoadingLogo logo={logo} size={12} />
                  ) : showSuccess && (
                    <div className="success-animation">
                      <div className="success-checkmark">
                        <div className="check-icon">
                          <span className="icon-line line-tip"></span>
                          <span className="icon-line line-long"></span>
                          <div className="icon-circle"></div>
                          <div className="icon-fix"></div>
                        </div>
                        <div className="success-message">Envoyé avec succès!</div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}

            <style>{`
              @media (max-width: 640px) {
                .ti-modal-box {
                  margin: 0 !important;
                  width: 100% !important;
                  height: 100% !important;
                  max-height: 100vh !important;
                }
                .ti-modal {
                  align-items: flex-start !important;
                }
                form {
                  height: 100%;
                  display: flex;
                  flex-direction: column;
                }
                .form-content {
                  flex: 1;
                  overflow-y: auto;
                  -webkit-overflow-scrolling: touch;
                }
                .form-actions {
                  position: sticky;
                  bottom: 0;
                  background: inherit;
                  z-index: 10;
                }
              }

              .form-select {
                max-height: 300px;
                overflow-y: auto;
              }

              /* Custom scrollbar styles */
              .form-select::-webkit-scrollbar {
                width: 8px;
              }

              .form-select::-webkit-scrollbar-track {
                background: #f1f1f1;
                border-radius: 4px;
              }

              .form-select::-webkit-scrollbar-thumb {
                background: #888;
                border-radius: 4px;
              }

              .form-select::-webkit-scrollbar-thumb:hover {
                background: #555;
              }

              /* Dark mode scrollbar */
              .dark .form-select::-webkit-scrollbar-track {
                background: #2d3748;
              }

              .dark .form-select::-webkit-scrollbar-thumb {
                background: #4a5568;
              }

              .dark .form-select::-webkit-scrollbar-thumb:hover {
                background: #718096;
              }
            `}</style>

            <form onSubmit={handleSubmit} className="flex flex-col h-full">
              <div className=" ps-6 pe-6 pb-6  form-content overflow-y-auto flex-1">
                <div className="flex pt-4 items-center justify-between mb-6 sticky top-0 bg-white dark:bg-gray-800 z-50 pb-4">
                  <div className="flex items-center space-x-3">
                    <div className="h-10 w-10 flex items-center justify-center rounded-full bg-primary/10 text-primary">
                      <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                      </svg>
                    </div>
                    <h3 className="text-xl font-semibold text-gray-800 dark:text-white">
                      Nouvelle Demande
                    </h3>
                  </div>
                  <button
                    type="button"
                    className="ti-modal-close-btn"
                    data-hs-overlay="#hs-add-demande-modal"
                    onClick={handleModalClose}
                  >
                    <span className="sr-only">Fermer</span>
                    <svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {/* Add Ouvrier selection button and form */}
                  {user?.data?.roles?.some(role => role.name === 'Ouvrier') && (
                    <div className="form-group lg:col-span-3">
                      {!showOuvrierSelect ? (
                        <button
                          type="button"
                          onClick={() => setShowOuvrierSelect(true)}
                          className="ti-btn ti-btn-primary !rounded-full px-6 py-2.5 transition-all duration-300"
                        >
                          <span className="flex items-center">
                            <i className="ri-user-add-line me-2"></i>
                            Créer une demande pour un autre Ouvrier
                          </span>
                        </button>
                      ) : (
                        <div className="bg-gray-50 dark:bg-gray-800/50 rounded-xl p-4 border border-gray-200 dark:border-gray-700">
                          <div className="flex items-center justify-between mb-3">
                            <label className="block text-sm font-medium text-gray-800 dark:text-gray-200">
                              Sélectionner un Ouvrier
                            </label>
                            <button
                              type="button"
                              onClick={handleCancelOuvrierSelection}
                              className="ti-btn ti-btn-danger !rounded-full !py-1 !px-3 transition-all duration-300"
                            >
                              <span className="flex items-center">
                                <i className="ri-close-line"></i>
                              </span>
                            </button>
                          </div>
                          <div className="relative">
                            <select
                              name="ouvrier_id"
                              value={selectedOuvrier?.id || ''}
                              onChange={handleOuvrierChange}
                              className="form-select peer w-full rounded-xl border-2 py-3 px-4 text-sm outline-none transition-all focus:border-primary focus:outline-none dark:border-gray-600 dark:bg-gray-700 border-gray-200 text-gray-900 dark:text-gray-100"
                            >
                              <option value="">Sélectionner un Ouvrier</option>
                              {ouvriers.map(ouvrier => (
                                <option key={ouvrier.id} value={ouvrier.id}>
                                  {ouvrier.first_name || ouvrier.name} {ouvrier.last_name} - {ouvrier.matricule}
                                </option>
                              ))}
                            </select>
                            <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                              <i className="ri-user-line text-gray-400 dark:text-gray-500"></i>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  )}

                  <div className="form-group">
                    <label className="block text-sm font-medium mb-2 text-gray-800 dark:text-gray-200">
                      Nom
                    </label>
                    <div className="relative">
                      <input
                        type="text"
                        name="nom"
                        value={data.nom}
                        onChange={changeHandler}
                        onBlur={changeHandler}
                        readOnly
                        disabled
                        className="form-input peer w-full rounded-xl border-2 py-3 px-4 text-sm outline-none transition-all focus:outline-none cursor-not-allowed bg-gray-50 dark:bg-gray-700 opacity-75 select-none border-gray-200 dark:border-gray-600 text-gray-900 dark:text-gray-100"
                        placeholder="Entrez votre nom"
                      />
                      <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                        <svg className="h-5 w-5 text-gray-400 dark:text-gray-500" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                        </svg>
                      </div>
                    </div>
                  </div>

                  <div className="form-group">
                    <label className="block text-sm font-medium mb-2 text-gray-800 dark:text-gray-200">
                      Prénom
                    </label>
                    <div className="relative">
                      <input
                        type="text"
                        name="prenom"
                        value={data.prenom}
                        onChange={changeHandler}
                        onBlur={changeHandler}
                        readOnly
                        disabled
                        className="form-input peer w-full rounded-xl border-2 py-3 px-4 text-sm outline-none transition-all focus:outline-none cursor-not-allowed bg-gray-50 dark:bg-gray-700 opacity-75 select-none border-gray-200 dark:border-gray-600 text-gray-900 dark:text-gray-100"
                        placeholder="Entrez votre prénom"
                      />
                      <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                        <svg className="h-5 w-5 text-gray-400 dark:text-gray-500" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                        </svg>
                      </div>
                    </div>
                  </div>

                  <div className="form-group">
                    <label className="block text-sm font-medium mb-2 text-gray-800 dark:text-gray-200">
                      Immatriculation
                    </label>
                    <div className="relative">
                      <input
                        type="text"
                        name="immatriculation"
                        value={data.immatriculation}
                        onChange={changeHandler}
                        onBlur={changeHandler}
                        readOnly
                        disabled
                        className="form-input peer w-full rounded-xl border-2 py-3 px-4 text-sm outline-none transition-all focus:outline-none cursor-not-allowed bg-gray-50 dark:bg-gray-700 opacity-75 select-none border-gray-200 dark:border-gray-600 text-gray-900 dark:text-gray-100"
                        placeholder="Entrez votre immatriculation"
                      />
                      <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                        <svg className="h-5 w-5 text-gray-400 dark:text-gray-500" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                        </svg>
                      </div>
                    </div>
                  </div>

                  <div className="form-group">
                    <label className="block text-sm font-medium mb-2 text-gray-800 dark:text-gray-200">
                      Poste occupé
                    </label>
                    <div className="relative">
                      <input
                        type="text"
                        name="poste"
                        value={data.poste}
                        onChange={changeHandler}
                        onBlur={changeHandler}
                        readOnly
                        disabled
                        className="form-input peer w-full rounded-xl border-2 py-3 px-4 text-sm outline-none transition-all focus:outline-none cursor-not-allowed bg-gray-50 dark:bg-gray-700 opacity-75 select-none border-gray-200 dark:border-gray-600 text-gray-900 dark:text-gray-100"
                        placeholder="Entrez votre poste"
                      />
                      <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                        <svg className="h-5 w-5 text-gray-400 dark:text-gray-500" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                        </svg>
                      </div>
                    </div>
                  </div>

                  <div className="form-group">
                    <label className="block text-sm font-medium mb-2 text-gray-800 dark:text-gray-200">
                      BU / Direction
                    </label>
                    <div className="relative">
                      <input
                        type="text"
                        name="bu_direction"
                        value={data.bu_direction}
                        onChange={changeHandler}
                        onBlur={changeHandler}
                        readOnly
                        disabled
                        className="form-input peer w-full rounded-xl border-2 py-3 px-4 text-sm outline-none transition-all focus:outline-none cursor-not-allowed bg-gray-50 dark:bg-gray-700 opacity-75 select-none border-gray-200 dark:border-gray-600 text-gray-900 dark:text-gray-100"
                        placeholder="Entrez votre BU/Direction"
                      />
                      <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                        <svg className="h-5 w-5 text-gray-400 dark:text-gray-500" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                        </svg>
                      </div>
                    </div>
                  </div>

                  <div className="form-group">
                    <label className="block text-sm font-medium mb-2 text-gray-800 dark:text-gray-300">
                      Type de demande
                    </label>
                    <div className="relative">
                      <select
                        name="type_demande"
                        value={data.type_demande}
                        onChange={changeHandler}
                        onBlur={changeHandler}
                        className={`form-select appearance-none w-full rounded-xl border-2 py-[0.72rem] px-4 pr-10 text-sm leading-[1.6] outline-none transition-all duration-300 bg-transparent h-[46px] ${errors.type_demande
                            ? '!border-rose-500 focus:!border-rose-500 !ring-rose-500/30 focus:!ring-rose-500/30 bg-rose-50/30'
                            : data.type_demande
                              ? '!border-emerald-500 focus:!border-emerald-500 !ring-emerald-500/30 focus:!ring-emerald-500/30'
                              : 'border-gray-200 dark:border-gray-700 focus:!border-primary focus:!ring-primary/30'
                          }`}
                      >
                        <option value="" className="text-gray-500 h-[46px] leading-[1.6]">Sélectionnez un type</option>
                        {typesDemande.map((type) => (
                          <option
                            key={type}
                            value={type}
                            className="py-2 px-4 hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer text-gray-800 dark:text-gray-200 h-[46px] leading-[1.6]"
                          >
                            {type}
                          </option>
                        ))}
                      </select>
                      <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                        {errors.type_demande ? (
                          <svg className="h-5 w-5 text-rose-500" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                          </svg>
                        ) : data.type_demande ? (
                          <svg className="h-5 w-5 text-emerald-500" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                          </svg>
                        ) : (
                          <div className="flex items-center gap-2">
                            <svg className="h-5 w-5 text-gray-400 transition-transform duration-300 group-hover:text-primary"
                              fill="none"
                              viewBox="0 0 24 24"
                              stroke="currentColor">
                              <path strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth="2"
                                d="M19 9l-7 7-7-7" />
                            </svg>
                          </div>
                        )}
                      </div>
                      <div className="absolute inset-0 rounded-xl pointer-events-none transition-all duration-300 
                        ${errors.type_demande ? 'ring-2 ring-rose-500/30' : data.type_demande ? 'ring-2 ring-emerald-500/30' : 'group-hover:ring-2 group-hover:ring-primary/30'}">
                      </div>
                    </div>
                    {errors.type_demande && (
                      <div className="mt-1 flex items-center gap-1.5">
                        <svg className="w-4 h-4 text-rose-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        <span className="text-xs text-rose-500">{errors.type_demande}</span>
                      </div>
                    )}
                  </div>

                  {/* Conditional Fields based on Type de demande */}
                  {data.type_demande === "Demande des documents administratifs" && (
                    <div className="form-group lg:col-span-3">
                      <label className="block text-sm font-medium mb-2 text-gray-800 dark:text-gray-300">
                        Type de document
                      </label>
                      <div className="relative">
                        <select
                          name="type_document"
                          value={data.type_document}
                          onChange={changeHandler}
                          onBlur={changeHandler}
                          className={`form-select appearance-none w-full rounded-xl border-2 py-[0.72rem] px-4 pr-10 text-sm leading-[1.6] outline-none transition-all duration-300 bg-transparent h-[46px] ${errors.type_document
                              ? '!border-rose-500 focus:!border-rose-500 !ring-rose-500/30 focus:!ring-rose-500/30 bg-rose-50/30'
                              : data.type_document
                                ? '!border-emerald-500 focus:!border-emerald-500 !ring-emerald-500/30 focus:!ring-emerald-500/30'
                                : 'border-gray-200 dark:border-gray-700 focus:!border-primary focus:!ring-primary/30'
                            }`}
                        >
                          <option value="" className="text-gray-500">Sélectionnez un type de document</option>
                          {typesDocument.map((type) => (
                            <option key={type} value={type} className="py-2 px-4">{type}</option>
                          ))}
                        </select>
                        <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                          {errors.type_document ? (
                            <svg className="h-5 w-5 text-rose-500" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                            </svg>
                          ) : data.type_document && (
                            <svg className="h-5 w-5 text-emerald-500" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                            </svg>
                          )}
                        </div>
                      </div>
                      {errors.type_document && (
                        <div className="mt-1 flex items-center gap-1.5">
                          <svg className="w-4 h-4 text-rose-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                          <span className="text-xs text-rose-500">{errors.type_document}</span>
                        </div>
                      )}
                    </div>
                  )}

                  {data.type_demande === "Demande de congés" && (
                    <>
                      <div className="lg:col-span-3 grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="form-group">
                          <label className="block text-sm font-medium mb-2 text-gray-800 dark:text-gray-300">
                            Type de congé
                          </label>
                          <div className="relative">
                            <select
                              name="type_conge"
                              value={data.type_conge}
                              onChange={changeHandler}
                              onBlur={changeHandler}
                              className={`form-select appearance-none w-full rounded-xl border-2 py-[0.72rem] px-4 pr-10 text-sm leading-[1.6] outline-none transition-all duration-300 bg-transparent h-[46px] ${errors.type_conge
                                  ? '!border-rose-500 focus:!border-rose-500 !ring-rose-500/30 focus:!ring-rose-500/30 bg-rose-50/30'
                                  : data.type_conge
                                    ? '!border-emerald-500 focus:!border-emerald-500 !ring-emerald-500/30 focus:!ring-emerald-500/30'
                                    : 'border-gray-200 dark:border-gray-700 focus:!border-primary focus:!ring-primary/30'
                                }`}
                            >
                              <option value="" className="text-gray-500">Sélectionnez un type de congé</option>
                              {typesConge.map((type) => (
                                <option key={type} value={type} className="py-2 px-4">{type}</option>
                              ))}
                            </select>
                            <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                              {errors.type_conge ? (
                                <svg className="h-5 w-5 text-rose-500" fill="currentColor" viewBox="0 0 20 20">
                                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                                </svg>
                              ) : data.type_conge && (
                                <svg className="h-5 w-5 text-emerald-500" fill="currentColor" viewBox="0 0 20 20">
                                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                                </svg>
                              )}
                            </div>
                          </div>
                          {errors.type_conge && (
                            <div className="mt-1 flex items-center gap-1.5">
                              <svg className="w-4 h-4 text-rose-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                              </svg>
                              <span className="text-xs text-rose-500">{errors.type_conge}</span>
                            </div>
                          )}
                        </div>

                        {/* Conditional field for Congé spécial */}
                        {data.type_conge === "Congé spécial" && (
                          <div className="form-group">
                            <label className="block text-sm font-medium mb-2 text-gray-800 dark:text-gray-300">
                              Nature du congé
                            </label>
                            <div className="relative">
                              <select
                                name="nature_conge"
                                value={data.nature_conge}
                                onChange={changeHandler}
                                onBlur={changeHandler}
                                className={`form-select appearance-none w-full rounded-xl border-2 py-[0.72rem] px-4 pr-10 text-sm leading-[1.6] outline-none transition-all duration-300 bg-transparent h-[46px] ${errors.nature_conge
                                    ? '!border-rose-500 focus:!border-rose-500 !ring-rose-500/30 focus:!ring-rose-500/30 bg-rose-50/30'
                                    : data.nature_conge
                                      ? '!border-emerald-500 focus:!border-emerald-500 !ring-emerald-500/30 focus:!ring-emerald-500/30'
                                      : 'border-gray-200 dark:border-gray-700 focus:!border-primary focus:!ring-primary/30'
                                  }`}
                              >
                                <option value="" className="text-gray-500">Sélectionnez la nature du congé</option>
                                {natureCongeSpecial.map((type) => (
                                  <option key={type} value={type} className="py-2 px-4">{type}</option>
                                ))}
                              </select>
                              <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                                {errors.nature_conge ? (
                                  <svg className="h-5 w-5 text-rose-500" fill="currentColor" viewBox="0 0 20 20">
                                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                                  </svg>
                                ) : data.nature_conge && (
                                  <svg className="h-5 w-5 text-emerald-500" fill="currentColor" viewBox="0 0 20 20">
                                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                                  </svg>
                                )}
                              </div>
                            </div>
                            {errors.nature_conge && (
                              <div className="mt-1 flex items-center gap-1.5">
                                <svg className="w-4 h-4 text-rose-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                                <span className="text-xs text-rose-500">{errors.nature_conge}</span>
                              </div>
                            )}
                          </div>
                        )}

                        {/* Conditional field for Congé sans solde */}
                        {data.type_conge === "Congé sans solde" && (
                          <div className="form-group">
                            <label className="block text-sm font-medium mb-2 text-gray-800 dark:text-gray-300">
                              Motif du congé
                            </label>
                            <div className="relative">
                              <input
                                type="text"
                                name="motif_conge"
                                value={data.motif_conge}
                                onChange={changeHandler}
                                onBlur={changeHandler}
                                className={`form-input peer w-full rounded-xl border-2 py-[0.72rem] px-4 text-sm leading-[1.6] outline-none transition-all duration-300 h-[46px] ${errors.motif_conge
                                    ? '!border-rose-500 focus:!border-rose-500 !ring-rose-500/30 focus:!ring-rose-500/30 bg-rose-50/30'
                                    : data.motif_conge
                                      ? '!border-emerald-500 focus:!border-emerald-500 !ring-emerald-500/30 focus:!ring-emerald-500/30'
                                      : 'border-gray-200 dark:border-gray-700 focus:!border-primary focus:!ring-primary/30'
                                  }`}
                                placeholder="Entrez le motif du congé"
                              />
                              <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                                {errors.motif_conge ? (
                                  <svg className="h-5 w-5 text-rose-500" fill="currentColor" viewBox="0 0 20 20">
                                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                                  </svg>
                                ) : data.motif_conge && (
                                  <svg className="h-5 w-5 text-emerald-500" fill="currentColor" viewBox="0 0 20 20">
                                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                                  </svg>
                                )}
                              </div>
                            </div>
                            {errors.motif_conge && (
                              <div className="mt-1 flex items-center gap-1.5">
                                <svg className="w-4 h-4 text-rose-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                                <span className="text-xs text-rose-500">{errors.motif_conge}</span>
                              </div>
                            )}
                          </div>
                        )}

                        <div className="form-group">
                          <label className="block text-sm font-medium mb-2 text-gray-800 dark:text-gray-300">
                            Intérimaire Proposé
                          </label>
                          <div className="relative">
                            <input
                              type="text"
                              name="interim"
                              value={data.interim}
                              onChange={changeHandler}
                              onBlur={changeHandler}
                              className={`form-input peer w-full rounded-xl border-2 py-[0.72rem] px-4 text-sm leading-[1.6] outline-none transition-all duration-300 h-[46px] ${errors.interim
                                  ? '!border-rose-500 focus:!border-rose-500 !ring-rose-500/30 focus:!ring-rose-500/30 bg-rose-50/30'
                                  : data.interim
                                    ? '!border-emerald-500 focus:!border-emerald-500 !ring-emerald-500/30 focus:!ring-emerald-500/30'
                                    : 'border-gray-200 dark:border-gray-700 focus:!border-primary focus:!ring-primary/30'
                                }`}
                              placeholder="Nom de l'intérimaire"
                            />
                            <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                              {errors.interim ? (
                                <svg className="h-5 w-5 text-rose-500" fill="currentColor" viewBox="0 0 20 20">
                                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                                </svg>
                              ) : data.interim && (
                                <svg className="h-5 w-5 text-emerald-500" fill="currentColor" viewBox="0 0 20 20">
                                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                                </svg>
                              )}
                            </div>
                          </div>
                          {errors.interim && (
                            <div className="mt-1 flex items-center gap-1.5">
                              <svg className="w-4 h-4 text-rose-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                              </svg>
                              <span className="text-xs text-rose-500">{errors.interim}</span>
                            </div>
                          )}
                        </div>
                      </div>

                      {/* File Upload Section */}
                      <div className="lg:col-span-2">
                        <div className="form-group">
                          <label className="block text-sm font-medium mb-2 text-gray-800 dark:text-gray-300">
                            Pièces jointes
                          </label>
                          <FilePond
                            className="multiple-filepond"
                            files={files}
                            onupdatefiles={setFiles}
                            allowMultiple={true}
                            maxFiles={5}
                            allowReorder={true}
                            allowImagePreview={true}
                            accepted-file-types={[
                              "application/pdf",
                              "application/msword",
                              "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
                              "application/vnd.ms-excel",
                              "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
                              "application/vnd.ms-powerpoint",
                              "application/vnd.openxmlformats-officedocument.presentationml.presentation",
                              "image/jpeg",
                              "image/png",
                              "image/gif",
                              "image/webp"
                            ]}
                            labelIdle='Glissez et déposez vos fichiers ou <span class="filepond--label-action">Parcourir</span>'
                          />
                        </div>
                      </div>

                      <div className="lg:col-span-3 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-7 gap-4">
                        {data.type_conge && (
                          <>
                            <div className="form-group lg:col-span-2">
                              <label className="block text-sm font-medium mb-2 text-gray-800 dark:text-gray-300">
                                Du
                              </label>
                              <div className="relative">
                                <CustomDatePicker
                                  name="date_debut"
                                  selected={data.date_debut}
                                  onChange={changeHandler}
                                  minDate={getTodayDate()}
                                  error={errors.date_debut}
                                  className={`form-input peer w-full rounded-xl border-2 py-[0.72rem] px-4 text-sm leading-[1.6] outline-none transition-all duration-300 h-[46px] ${errors.date_debut
                                      ? '!border-rose-500 focus:!border-rose-500 !ring-rose-500/30 focus:!ring-rose-500/30 bg-rose-50/30'
                                      : data.date_debut
                                        ? '!border-emerald-500 focus:!border-emerald-500 !ring-emerald-500/30 focus:!ring-emerald-500/30'
                                        : 'border-gray-200 dark:border-gray-700 focus:!border-primary focus:!ring-primary/30'
                                    }`}
                                  holidays={holidays}
                                />
                              </div>
                              {errors.date_debut && (
                                <div className="mt-1 flex items-center gap-1.5">
                                  <svg className="w-4 h-4 text-rose-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                  </svg>
                                  <span className="text-xs text-rose-500">{errors.date_debut}</span>
                                </div>
                              )}
                            </div>

                            <div className="form-group lg:col-span-2">
                              <label className="block text-sm font-medium mb-2 text-gray-800 dark:text-gray-300">
                                Au (inclus)
                              </label>
                              <div className="relative">
                                <CustomDatePicker
                                  name="date_fin"
                                  selected={data.date_fin}
                                  onChange={changeHandler}
                                  minDate={data.date_debut}
                                  error={errors.date_fin}
                                  className={`form-input peer w-full rounded-xl border-2 py-[0.72rem] px-4 text-sm leading-[1.6] outline-none transition-all duration-300 h-[46px] ${errors.date_fin
                                      ? '!border-rose-500 focus:!border-rose-500 !ring-rose-500/30 focus:!ring-rose-500/30 bg-rose-50/30'
                                      : data.date_fin
                                        ? '!border-emerald-500 focus:!border-emerald-500 !ring-emerald-500/30 focus:!ring-emerald-500/30'
                                        : 'border-gray-200 dark:border-gray-700 focus:!border-primary focus:!ring-primary/30'
                                    }`}
                                  holidays={holidays}
                                />
                              </div>
                              {errors.date_fin && (
                                <div className="mt-1 flex items-center gap-1.5">
                                  <svg className="w-4 h-4 text-rose-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                  </svg>
                                  <span className="text-xs text-rose-500">{errors.date_fin}</span>
                                </div>
                              )}
                            </div>

                            {data.date_debut && data.date_fin && (
                              <div className="form-group lg:col-span-3">
                                <label className="block text-sm font-medium mb-2 text-gray-800 dark:text-gray-300">
                                  Durée
                                </label>
                                <div className="flex gap-2 items-center p-3">
                                  {/* <span className="badge bg-primary text-white">
                                    {calculateTotalDays(data.date_debut, data.date_fin)} jour(s) au total
                                  </span> */}
                                  <span className={`badge ${warnings.duree && warnings.duree.includes('Attention') ? 'bg-warning text-white' : 'bg-success text-white'}`}>
                                    {calculateWorkingDays(data.date_debut, data.date_fin)} jours ouvrables
                                  </span>
                                </div>
                                {warnings.duree && (
                                  <div className="mt-2">
                                    <span className={`text-xs ${warnings.duree.includes('Attention') ? 'text-warning-600 dark:text-warning-400' : 'text-success-600 dark:text-success-400'}`}>
                                      {warnings.duree}
                                    </span>
                                  </div>
                                )}
                                {errors.duree && (
                                  <div className="mt-2">
                                    <span className="text-xs text-rose-500">{errors.duree}</span>
                                  </div>
                                )}
                              </div>
                            )}
                          </>
                        )}
                      </div>
                    </>
                  )}
                </div>
                {/* Rich Text Editor for Message */}
                <div className="form-group lg:col-span-3 mt-4">
                  <label className="block text-sm font-medium mb-2 text-gray-800 dark:text-gray-300">
                    Message
                  </label>
                  <div className="relative">
                    <QuillEditor
                      ref={quillRef}
                      value={data.message}
                      onChange={(content) => setData(prev => ({ ...prev, message: content }))}
                    />


                  </div>
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 bg-gray-50 dark:bg-gray-700/50 px-6 py-4 border-t border-gray-200 dark:border-gray-700 form-actions">
                <button
                  type="button"
                  className="ti-btn ti-btn-danger !font-medium !rounded-full px-6 py-2.5 transition-all duration-300 hover:bg-danger/80 hover:shadow-lg hover:shadow-danger/30 focus:ring-2 focus:ring-danger/30 active:bg-danger/90"
                  data-hs-overlay="#hs-add-demande-modal"
                  onClick={handleModalClose}
                >
                  <span className="flex items-center">
                    <i className="ri-close-line me-2"></i>
                    Annuler
                  </span>
                </button>
                <button
                  type="submit"
                  onClick={handleSubmit}
                  disabled={isSubmitting || Object.values(errors).some(Boolean)}
                  className={`submit-button ti-btn ti-btn-primary-full !font-medium !rounded-full px-6 py-2.5 transition-all duration-300 relative overflow-hidden 
                    } ${isSubmitting
                      ? 'opacity-50 cursor-wait'
                      : Object.keys(errors).length > 0
                        ? 'hover:bg-primary/90 hover:shadow-lg hover:shadow-primary/30 active:bg-primary/90'
                        : 'hover:shadow-lg hover:shadow-primary/30 active:bg-primary/90 focus:ring-2 focus:ring-primary/30'
                    }`}
                >
                  <span className="flex items-center relative z-10">
                    {isSubmitting ? (
                      <>
                        <div className="loading-spinner mr-3" />
                        Envoi en cours...
                      </>
                    ) : showSuccess ? (
                      <>
                        <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                        </svg>
                        Envoyé !
                      </>
                    ) : (
                      <>
                        <i className="ri-check-line me-2"></i>
                        Envoyer
                      </>
                    )}
                  </span>
                  <div className={`success-state ${showSuccess ? 'show' : ''}`}>
                    <svg className="checkmark" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>

      {/* Add these elements inside your modal */}
      <div className="letter-fold">
        <div className="letter-face letter-face-front"></div>
        <div className="letter-face letter-face-back"></div>
        <div className="envelope-flap flap-top"></div>
        <div className="envelope-flap flap-right"></div>
        <div className="envelope-flap flap-bottom"></div>
        <div className="envelope-flap flap-left"></div>
      </div>

      {/* Add View Modal */}




      {/* Add Delete Confirmation Modal */}
      <div id="hs-delete-demande-modal" className="hs-overlay hidden ti-modal">
        <div className="hs-overlay-open:mt-7 ti-modal-box mt-0 ease-out">
          <div className="ti-modal-content">
            <div className="ti-modal-header">
              <h3 className="ti-modal-title">
                Confirmer la suppression
              </h3>
              <button type="button" className="hs-dropdown-toggle ti-modal-close-btn" data-hs-overlay="#hs-delete-demande-modal">
                <span className="sr-only">Close</span>
                <svg className="w-3.5 h-3.5" width="8" height="8" viewBox="0 0 8 8" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M0.258206 1.00652C0.351976 0.912791 0.479126 0.860131 0.611706 0.860131C0.744296 0.860131 0.871447 0.912791 0.965207 1.00652L3.61171 3.65302L6.25822 1.00652C6.30432 0.958771 6.35952 0.920671 6.42052 0.894471C6.48152 0.868271 6.54712 0.854471 6.61352 0.853901C6.67992 0.853321 6.74572 0.865971 6.80722 0.891111C6.86862 0.916251 6.92442 0.953381 6.97142 1.00032C7.01832 1.04727 7.05552 1.1031 7.08062 1.16454C7.10572 1.22599 7.11842 1.29183 7.11782 1.35822C7.11722 1.42461 7.10342 1.49022 7.07722 1.55122C7.05102 1.61222 7.01292 1.6674 6.96522 1.71352L4.31871 4.36002L6.96522 7.00648C7.05632 7.10078 7.10672 7.22708 7.10552 7.35818C7.10442 7.48928 7.05182 7.61468 6.95912 7.70738C6.86642 7.80018 6.74102 7.85268 6.60992 7.85388C6.47882 7.85498 6.35252 7.80458 6.25822 7.71348L3.61171 5.06702L0.965207 7.71348C0.870907 7.80458 0.744606 7.85498 0.613506 7.85388C0.482406 7.85268 0.357007 7.80018 0.264297 7.70738C0.171597 7.61468 0.119017 7.48928 0.117877 7.35818C0.116737 7.22708 0.167126 7.10078 0.258206 7.00648L2.90471 4.36002L0.258206 1.71352C0.164476 1.61976 0.111816 1.4926 0.111816 1.36002C0.111816 1.22744 0.164476 1.10028 0.258206 1.00652Z" fill="currentColor" />
                </svg>
              </button>
            </div>
            <div className="ti-modal-body">
              <div className="p-4 text-center">
                <div className="w-16 h-16 mx-auto flex items-center justify-center rounded-full bg-danger/20 mb-4">
                  <svg className="w-8 h-8 text-danger" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                </div>
                <h3 className="mb-2 text-xl font-bold text-gray-800 dark:text-white">Êtes-vous sûr ?</h3>
                <p className="text-gray-500 dark:text-gray-400">
                  Voulez-vous vraiment supprimer cette demande ? Cette action est irréversible.
                  {demandeToDelete && (
                    <span className="block mt-2 font-medium">
                      Type: {demandeToDelete.type_demande}
                      {demandeToDelete.type_document && ` - ${demandeToDelete.type_document}`}
                      {demandeToDelete.type_conge && ` - ${demandeToDelete.type_conge}`}
                    </span>
                  )}
                </p>
              </div>
            </div>
            <div className="ti-modal-footer">
              <button
                type="button"
                className="ti-btn ti-btn-danger !font-medium"
                onClick={confirmDelete}
              >
                <span className="flex items-center">
                  <i className="ri-delete-bin-line me-2"></i>
                  Supprimer
                </span>
              </button>
              <button
                type="button"
                className="ti-btn ti-btn-secondary !font-medium"
                data-hs-overlay="#hs-delete-demande-modal"
              >
                <span className="flex items-center">
                  <i className="ri-close-line me-2"></i>
                  Annuler
                </span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Add Edit Modal */}
      <div id="hs-edit-demande-modal" className="hs-overlay hidden ti-modal [--overlay-backdrop:static]">
        <div className="hs-overlay-open:mt-7 ti-modal-box mt-0 ease-out sm:w-[800px] !max-w-[800px] m-3 mx-auto h-[calc(100%-3.5rem)]">
          <div className="relative transform overflow-hidden rounded-2xl bg-white dark:bg-gray-800 shadow-2xl transition-all w-full h-full flex flex-col">
            {(showLoading || showSuccess) && (
              <div className="absolute inset-0 z-[60] flex items-center justify-center transition-all duration-300">
                <div className="absolute inset-0 backdrop-blur-[12px]">
                  <div className="absolute inset-0 bg-gradient-to-br from-white/50 via-primary/10 to-white/50 dark:from-gray-800/50 dark:via-primary/5 dark:to-gray-800/50" />
                </div>
                <div className="relative transform-gpu scale-100">
                  {showLoading ? (
                    <LoadingLogo logo={logo} size={12} />
                  ) : showSuccess && (
                    <div className="success-animation">
                      <div className="success-checkmark">
                        <div className="check-icon">
                          <span className="icon-line line-tip"></span>
                          <span className="icon-line line-long"></span>
                          <div className="icon-circle"></div>
                          <div className="icon-fix"></div>
                        </div>
                        <div className="success-message">Modifié avec succès!</div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}

            <form onSubmit={handleEditSubmit} className="flex flex-col h-full">
              <div className="ps-6 pe-6 pb-6 form-content overflow-y-auto flex-1 overscroll-contain">
                <div className="flex pt-4 items-center justify-between mb-6 sticky top-0 bg-white dark:bg-gray-800 z-50 pb-4">
                  <div className="flex items-center space-x-3">
                    <div className="h-10 w-10 flex items-center justify-center rounded-full bg-primary/10 text-primary">
                      <i className="ri-edit-line text-xl"></i>
                    </div>
                    <h3 className="text-xl font-semibold text-gray-800 dark:text-white">
                      Modifier la Demande
                    </h3>
                  </div>
                  <button
                    type="button"
                    className="ti-modal-close-btn"
                    data-hs-overlay="#hs-edit-demande-modal"
                  >
                    <span className="sr-only">Fermer</span>
                    <svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {/* User Info Fields */}
                  <div className="form-group">
                    <label className="block text-sm font-medium mb-2 text-gray-800 dark:text-gray-200">
                      Nom
                    </label>
                    <div className="relative">
                      <input
                        type="text"
                        name="nom"
                        value={editData.nom}
                        onChange={handleEditChange}
                        readOnly
                        disabled
                        className="form-input peer w-full rounded-xl border-2 py-3 px-4 text-sm outline-none transition-all focus:outline-none cursor-not-allowed bg-gray-50 dark:bg-gray-700 opacity-75 select-none border-gray-200 dark:border-gray-600 text-gray-900 dark:text-gray-100"
                      />
                    </div>
                  </div>

                  <div className="form-group">
                    <label className="block text-sm font-medium mb-2 text-gray-800 dark:text-gray-200">
                      Prénom
                    </label>
                    <div className="relative">
                      <input
                        type="text"
                        name="prenom"
                        value={editData.prenom}
                        onChange={handleEditChange}
                        readOnly
                        disabled
                        className="form-input peer w-full rounded-xl border-2 py-3 px-4 text-sm outline-none transition-all focus:outline-none cursor-not-allowed bg-gray-50 dark:bg-gray-700 opacity-75 select-none border-gray-200 dark:border-gray-600 text-gray-900 dark:text-gray-100"
                      />
                    </div>
                  </div>

                  <div className="form-group">
                    <label className="block text-sm font-medium mb-2 text-gray-800 dark:text-gray-200">
                      Immatriculation
                    </label>
                    <div className="relative">
                      <input
                        type="text"
                        name="immatriculation"
                        value={editData.immatriculation}
                        onChange={handleEditChange}
                        readOnly
                        disabled
                        className="form-input peer w-full rounded-xl border-2 py-3 px-4 text-sm outline-none transition-all focus:outline-none cursor-not-allowed bg-gray-50 dark:bg-gray-700 opacity-75 select-none border-gray-200 dark:border-gray-600 text-gray-900 dark:text-gray-100"
                      />
                    </div>
                  </div>

                  <div className="form-group">
                    <label className="block text-sm font-medium mb-2 text-gray-800 dark:text-gray-200">
                      Poste occupé
                    </label>
                    <div className="relative">
                      <input
                        type="text"
                        name="poste"
                        value={editData.poste}
                        onChange={handleEditChange}
                        readOnly
                        disabled
                        className="form-input peer w-full rounded-xl border-2 py-3 px-4 text-sm outline-none transition-all focus:outline-none cursor-not-allowed bg-gray-50 dark:bg-gray-700 opacity-75 select-none border-gray-200 dark:border-gray-600 text-gray-900 dark:text-gray-100"
                      />
                    </div>
                  </div>

                  <div className="form-group">
                    <label className="block text-sm font-medium mb-2 text-gray-800 dark:text-gray-200">
                      BU / Direction
                    </label>
                    <div className="relative">
                      <input
                        type="text"
                        name="bu_direction"
                        value={editData.bu_direction}
                        onChange={handleEditChange}
                        onBlur={handleEditChange}
                        readOnly
                        disabled
                        className="form-input peer w-full rounded-xl border-2 py-3 px-4 text-sm outline-none transition-all focus:outline-none cursor-not-allowed bg-gray-50 dark:bg-gray-700 opacity-75 select-none border-gray-200 dark:border-gray-600 text-gray-900 dark:text-gray-100"
                        placeholder="Entrez votre BU/Direction"
                      />
                      <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                        <svg className="h-5 w-5 text-gray-400 dark:text-gray-500" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                        </svg>
                      </div>
                    </div>
                  </div>

                  <div className="form-group">
                    <label className="block text-sm font-medium mb-2 text-gray-800 dark:text-gray-300">
                      Type de demande
                    </label>
                    <div className="relative">
                      <select
                        name="type_demande"
                        value={editData.type_demande}
                        onChange={handleEditChange}
                        onBlur={handleEditChange}
                        disabled
                        className={`form-select appearance-none w-full rounded-xl border-2 py-[0.72rem] px-4 pr-10 text-sm leading-[1.6] outline-none transition-all duration-300 bg-gray-100 dark:bg-gray-700 cursor-not-allowed h-[46px] ${errors.type_demande
                            ? '!border-rose-500 focus:!border-rose-500 !ring-rose-500/30 focus:!ring-rose-500/30 bg-rose-50/30'
                            : editData.type_demande
                              ? '!border-emerald-500 focus:!border-emerald-500 !ring-emerald-500/30 focus:!ring-emerald-500/30'
                              : 'border-gray-200 dark:border-gray-700'
                          }`}
                      >
                        <option value="" className="text-gray-500 h-[46px] leading-[1.6]">Sélectionnez un type</option>
                        {typesDemande.map((type) => (
                          <option
                            key={type}
                            value={type}
                            className="py-2 px-4 hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer text-gray-800 dark:text-gray-200 h-[46px] leading-[1.6]"
                          >
                            {type}
                          </option>
                        ))}
                      </select>
                      <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                        {errors.type_demande ? (
                          <svg className="h-5 w-5 text-rose-500" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                          </svg>
                        ) : editData.type_demande ? (
                          <svg className="h-5 w-5 text-emerald-500" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                          </svg>
                        ) : (
                          <div className="flex items-center gap-2">
                            <svg className="h-5 w-5 text-gray-400 transition-transform duration-300 group-hover:text-primary"
                              fill="none"
                              viewBox="0 0 24 24"
                              stroke="currentColor">
                              <path strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth="2"
                                d="M19 9l-7 7-7-7" />
                            </svg>
                          </div>
                        )}
                      </div>
                      <div className="absolute inset-0 rounded-xl pointer-events-none transition-all duration-300 
                        ${errors.type_demande ? 'ring-2 ring-rose-500/30' : editData.type_demande ? 'ring-2 ring-emerald-500/30' : 'group-hover:ring-2 group-hover:ring-primary/30'}">
                      </div>
                    </div>
                    {errors.type_demande && (
                      <div className="mt-1 flex items-center gap-1.5">
                        <svg className="w-4 h-4 text-rose-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        <span className="text-xs text-rose-500">{errors.type_demande}</span>
                      </div>
                    )}
                  </div>

                  {/* Conditional Fields based on Type de demande */}
                  {editData.type_demande === "Demande des documents administratifs" && (
                    <div className="form-group lg:col-span-3">
                      <label className="block text-sm font-medium mb-2 text-gray-800 dark:text-gray-300">
                        Type de document
                      </label>
                      <div className="relative">
                        <select
                          name="type_document"
                          value={editData.type_document}
                          onChange={handleEditChange}
                          onBlur={handleEditChange}
                          className={`form-select appearance-none w-full rounded-xl border-2 py-[0.72rem] px-4 pr-10 text-sm leading-[1.6] outline-none transition-all duration-300 bg-transparent h-[46px] ${errors.type_document
                              ? '!border-rose-500 focus:!border-rose-500 !ring-rose-500/30 focus:!ring-rose-500/30 bg-rose-50/30'
                              : editData.type_document
                                ? '!border-emerald-500 focus:!border-emerald-500 !ring-emerald-500/30 focus:!ring-emerald-500/30'
                                : 'border-gray-200 dark:border-gray-700 focus:!border-primary focus:!ring-primary/30'
                            }`}
                        >
                          <option value="" className="text-gray-500">Sélectionnez un type de document</option>
                          {typesDocument.map((type) => (
                            <option key={type} value={type} className="py-2 px-4">{type}</option>
                          ))}
                        </select>
                        <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                          {errors.type_document ? (
                            <svg className="h-5 w-5 text-rose-500" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                            </svg>
                          ) : editData.type_document && (
                            <svg className="h-5 w-5 text-emerald-500" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                            </svg>
                          )}
                        </div>
                      </div>
                      {errors.type_document && (
                        <div className="mt-1 flex items-center gap-1.5">
                          <svg className="w-4 h-4 text-rose-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                          <span className="text-xs text-rose-500">{errors.type_document}</span>
                        </div>
                      )}
                    </div>
                  )}

                  {editData.type_demande === "Demande de congés" && (
                    <>
                      <div className="lg:col-span-3 grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="form-group">
                          <label className="block text-sm font-medium mb-2 text-gray-800 dark:text-gray-300">
                            Type de congé
                          </label>
                          <div className="relative">
                            <select
                              name="type_conge"
                              value={editData.type_conge}
                              onChange={handleEditChange}
                              onBlur={handleEditChange}
                              disabled
                              className={`form-select appearance-none w-full rounded-xl border-2 py-[0.72rem] px-4 pr-10 text-sm leading-[1.6] outline-none transition-all duration-300 bg-gray-100 dark:bg-gray-700 cursor-not-allowed h-[46px] ${errors.type_conge
                                  ? '!border-rose-500 focus:!border-rose-500 !ring-rose-500/30 focus:!ring-rose-500/30 bg-rose-50/30'
                                  : editData.type_conge
                                    ? '!border-emerald-500 focus:!border-emerald-500 !ring-emerald-500/30 focus:!ring-emerald-500/30'
                                    : 'border-gray-200 dark:border-gray-700'
                                }`}
                            >
                              <option value="" className="text-gray-500">Sélectionnez un type de congé</option>
                              {typesConge.map((type) => (
                                <option key={type} value={type} className="py-2 px-4">{type}</option>
                              ))}
                            </select>
                            <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                              {errors.type_conge ? (
                                <svg className="h-5 w-5 text-rose-500" fill="currentColor" viewBox="0 0 20 20">
                                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                                </svg>
                              ) : editData.type_conge && (
                                <svg className="h-5 w-5 text-emerald-500" fill="currentColor" viewBox="0 0 20 20">
                                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                                </svg>
                              )}
                            </div>
                          </div>
                          {errors.type_conge && (
                            <div className="mt-1 flex items-center gap-1.5">
                              <svg className="w-4 h-4 text-rose-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                              </svg>
                              <span className="text-xs text-rose-500">{errors.type_conge}</span>
                            </div>
                          )}
                        </div>

                        {/* Conditional field for Congé spécial */}
                        {editData.type_conge === "Congé spécial" && (
                          <div className="form-group">
                            <label className="block text-sm font-medium mb-2 text-gray-800 dark:text-gray-300">
                              Nature du congé
                            </label>
                            <div className="relative">
                              <select
                                name="nature_conge"
                                value={editData.nature_conge}
                                onChange={handleEditChange}
                                onBlur={handleEditChange}
                                disabled
                                className={`form-select appearance-none w-full rounded-xl border-2 py-[0.72rem] px-4 pr-10 text-sm leading-[1.6] outline-none transition-all duration-300 bg-gray-100 dark:bg-gray-700 cursor-not-allowed h-[46px] ${errors.nature_conge
                                    ? '!border-rose-500 focus:!border-rose-500 !ring-rose-500/30 focus:!ring-rose-500/30 bg-rose-50/30'
                                    : editData.nature_conge
                                      ? '!border-emerald-500 focus:!border-emerald-500 !ring-emerald-500/30 focus:!ring-emerald-500/30'
                                      : 'border-gray-200 dark:border-gray-700 focus:!border-primary focus:!ring-primary/30'
                                  }`}
                              >
                                <option value="" className="text-gray-500">Sélectionnez la nature du congé</option>
                                {natureCongeSpecial.map((type) => (
                                  <option key={type} value={type} className="py-2 px-4">{type}</option>
                                ))}
                              </select>
                              <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                                {errors.nature_conge ? (
                                  <svg className="h-5 w-5 text-rose-500" fill="currentColor" viewBox="0 0 20 20">
                                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                                  </svg>
                                ) : editData.nature_conge && (
                                  <svg className="h-5 w-5 text-emerald-500" fill="currentColor" viewBox="0 0 20 20">
                                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                                  </svg>
                                )}
                              </div>
                            </div>
                            {errors.nature_conge && (
                              <div className="mt-1 flex items-center gap-1.5">
                                <svg className="w-4 h-4 text-rose-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                                <span className="text-xs text-rose-500">{errors.nature_conge}</span>
                              </div>
                            )}
                          </div>
                        )}

                        {/* Conditional field for Congé sans solde */}
                        {editData.type_conge === "Congé sans solde" && (
                          <div className="form-group">
                            <label className="block text-sm font-medium mb-2 text-gray-800 dark:text-gray-300">
                              Motif du congé
                            </label>
                            <div className="relative">
                              <input
                                type="text"
                                name="motif_conge"
                                value={editData.motif_conge}
                                onChange={handleEditChange}
                                onBlur={handleEditChange}
                                className={`form-input peer w-full rounded-xl border-2 py-[0.72rem] px-4 text-sm leading-[1.6] outline-none transition-all duration-300 h-[46px] ${errors.motif_conge
                                    ? '!border-rose-500 focus:!border-rose-500 !ring-rose-500/30 focus:!ring-rose-500/30 bg-rose-50/30'
                                    : editData.motif_conge
                                      ? '!border-emerald-500 focus:!border-emerald-500 !ring-emerald-500/30 focus:!ring-emerald-500/30'
                                      : 'border-gray-200 dark:border-gray-700 focus:!border-primary focus:!ring-primary/30'
                                  }`}
                                placeholder="Entrez le motif du congé"
                              />
                              <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                                {errors.motif_conge ? (
                                  <svg className="h-5 w-5 text-rose-500" fill="currentColor" viewBox="0 0 20 20">
                                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                                  </svg>
                                ) : editData.motif_conge && (
                                  <svg className="h-5 w-5 text-emerald-500" fill="currentColor" viewBox="0 0 20 20">
                                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                                  </svg>
                                )}
                              </div>
                            </div>
                            {errors.motif_conge && (
                              <div className="mt-1 flex items-center gap-1.5">
                                <svg className="w-4 h-4 text-rose-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                                <span className="text-xs text-rose-500">{errors.motif_conge}</span>
                              </div>
                            )}
                          </div>
                        )}

                        <div className="form-group">
                          <label className="block text-sm font-medium mb-2 text-gray-800 dark:text-gray-300">
                            Intérimaire Proposé
                          </label>
                          <div className="relative">
                            <input
                              type="text"
                              name="interim"
                              value={editData.interim}
                              onChange={handleEditChange}
                              onBlur={handleEditChange}
                              className={`form-input peer w-full rounded-xl border-2 py-[0.72rem] px-4 text-sm leading-[1.6] outline-none transition-all duration-300 h-[46px] ${errors.interim
                                  ? '!border-rose-500 focus:!border-rose-500 !ring-rose-500/30 focus:!ring-rose-500/30 bg-rose-50/30'
                                  : editData.interim
                                    ? '!border-emerald-500 focus:!border-emerald-500 !ring-emerald-500/30 focus:!ring-emerald-500/30'
                                    : 'border-gray-200 dark:border-gray-700 focus:!border-primary focus:!ring-primary/30'
                                }`}
                              placeholder="Nom de l'intérimaire"
                            />
                            <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                              {errors.interim ? (
                                <svg className="h-5 w-5 text-rose-500" fill="currentColor" viewBox="0 0 20 20">
                                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                                </svg>
                              ) : editData.interim && (
                                <svg className="h-5 w-5 text-emerald-500" fill="currentColor" viewBox="0 0 20 20">
                                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                                </svg>
                              )}
                            </div>
                          </div>
                          {errors.interim && (
                            <div className="mt-1 flex items-center gap-1.5">
                              <svg className="w-4 h-4 text-rose-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                              </svg>
                              <span className="text-xs text-rose-500">{errors.interim}</span>
                            </div>
                          )}
                        </div>
                      </div>

                      <div className="lg:col-span-3 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-7 gap-4">
                        {editData.type_conge && (
                          <>
                            <div className="form-group lg:col-span-2">
                              <label className="block text-sm font-medium mb-2 text-gray-800 dark:text-gray-300">
                                Du
                              </label>
                              <div className="relative">
                                <CustomDatePicker
                                  name="date_debut"
                                  selected={editData.date_debut}
                                  onChange={handleEditChange}
                                  minDate={getTodayDate()}
                                  error={errors.date_debut}
                                  className={`form-input peer w-full rounded-xl border-2 py-[0.72rem] px-4 text-sm leading-[1.6] outline-none transition-all duration-300 h-[46px] ${errors.date_debut
                                      ? '!border-rose-500 focus:!border-rose-500 !ring-rose-500/30 focus:!ring-rose-500/30 bg-rose-50/30'
                                      : editData.date_debut
                                        ? '!border-emerald-500 focus:!border-emerald-500 !ring-emerald-500/30 focus:!ring-emerald-500/30'
                                        : 'border-gray-200 dark:border-gray-700 focus:!border-primary focus:!ring-primary/30'
                                    }`}
                                  holidays={holidays}
                                />
                              </div>
                              {errors.date_debut && (
                                <div className="mt-1 flex items-center gap-1.5">
                                  <svg className="w-4 h-4 text-rose-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                  </svg>
                                  <span className="text-xs text-rose-500">{errors.date_debut}</span>
                                </div>
                              )}
                            </div>

                            <div className="form-group lg:col-span-2">
                              <label className="block text-sm font-medium mb-2 text-gray-800 dark:text-gray-300">
                                Au (inclus)
                              </label>
                              <div className="relative">
                                <CustomDatePicker
                                  name="date_fin"
                                  selected={editData.date_fin}
                                  onChange={handleEditChange}
                                  minDate={editData.date_debut || getTodayDate()}
                                  error={errors.date_fin}
                                  className={`form-input peer w-full rounded-xl border-2 py-[0.72rem] px-4 text-sm leading-[1.6] outline-none transition-all duration-300 h-[46px] ${errors.date_fin
                                      ? '!border-rose-500 focus:!border-rose-500 !ring-rose-500/30 focus:!ring-rose-500/30 bg-rose-50/30'
                                      : editData.date_fin
                                        ? '!border-emerald-500 focus:!border-emerald-500 !ring-emerald-500/30 focus:!ring-emerald-500/30'
                                        : 'border-gray-200 dark:border-gray-700 focus:!border-primary focus:!ring-primary/30'
                                    }`}
                                  holidays={holidays}
                                />
                              </div>
                              {errors.date_fin && (
                                <div className="mt-1 flex items-center gap-1.5">
                                  <svg className="w-4 h-4 text-rose-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                  </svg>
                                  <span className="text-xs text-rose-500">{errors.date_fin}</span>
                                </div>
                              )}
                            </div>

                            {editData.date_debut && editData.date_fin && (
                              <div className="form-group lg:col-span-3">
                                <label className="block text-sm font-medium mb-2 text-gray-800 dark:text-gray-300">
                                  Durée
                                </label>
                                <div className="flex gap-2 items-center p-3">
                                  {/* <span className="badge bg-primary text-white">
                                    {calculateTotalDays(editData.date_debut, editData.date_fin)} jour(s) au total
                                  </span> */}
                                  <span className={`badge ${warnings.duree && warnings.duree.includes('Attention') ? 'bg-warning text-white' : 'bg-success text-white'}`}>
                                    {calculateWorkingDays(editData.date_debut, editData.date_fin)} jours ouvrables
                                  </span>
                                </div>
                                {warnings.duree && (
                                  <div className="mt-2">
                                    <span className={`text-xs ${warnings.duree.includes('Attention') ? 'text-warning-600 dark:text-warning-400' : 'text-success-600 dark:text-success-400'}`}>
                                      {warnings.duree}
                                    </span>
                                  </div>
                                )}
                                {errors.duree && (
                                  <div className="mt-2">
                                    <span className="text-xs text-rose-500">{errors.duree}</span>
                                  </div>
                                )}
                              </div>
                            )}
                          </>
                        )}
                      </div>
                    </>
                  )}
                </div>
                {/* Rich Text Editor for Message */}
                <div className="form-group lg:col-span-3 mt-4">
                  <label className="block text-sm font-medium mb-2 text-gray-800 dark:text-gray-300">
                    Message
                  </label>
                  <div className="relative">
                    <QuillEditor
                      ref={quillRef}
                      value={editData.message}
                      onChange={(content) => setEditData(prev => ({ ...prev, message: content }))}
                    />


                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between gap-3 bg-gray-50 dark:bg-gray-700/50 px-6 py-4 border-t border-gray-200 dark:border-gray-700 form-actions">
                {demandeToEdit?.type_demande === "Demande de congés" && (
                  <button
                    type="button"
                    className="ti-btn ti-btn-info !font-medium !rounded-full px-6 py-2.5 transition-all duration-300"
                    onClick={() => {
                      if (!demandeToEdit?.id) {
                        // console.error('No demand selected');
                        ToastService.error('Erreur: Aucune demande sélectionnée');
                        return;
                      }
                      fetchDemandeFiles(demandeToEdit.id);
                      const editModal = document.querySelector('#hs-edit-demande-modal');
                      const filesModal = document.querySelector('#hs-edit-files-modal');
                      if (editModal && filesModal) {
                        const HSOverlay = window.HSOverlay;
                        if (HSOverlay) {
                          HSOverlay.close(editModal);
                          setTimeout(() => {
                            HSOverlay.open(filesModal);
                          }, 100);
                        }
                      }
                    }}
                  >
                    <span className="flex items-center">
                      <i className="ri-attachment-line me-2"></i>
                      Gérer les fichiers
                    </span>
                  </button>
                )}
                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    className="ti-btn ti-btn-danger !font-medium !rounded-full px-6 py-2.5 transition-all duration-300 hover:bg-danger/80 hover:shadow-lg hover:shadow-danger/30 focus:ring-2 focus:ring-danger/30 active:bg-danger/90"
                    data-hs-overlay="#hs-edit-demande-modal"
                    onClick={handleModalClose}
                  >
                    <span className="flex items-center">
                      <i className="ri-close-line me-2"></i>
                      Annuler
                    </span>
                  </button>
                  <button
                    type="submit"
                    onClick={handleEditSubmit}
                    disabled={isSubmitting || Object.values(errors).some(Boolean)}
                    className={`submit-button ti-btn ti-btn-primary-full !font-medium !rounded-full px-6 py-2.5 transition-all duration-300 relative overflow-hidden 
                      } ${isSubmitting
                        ? 'opacity-50 cursor-wait'
                        : Object.keys(errors).length > 0
                          ? 'hover:bg-primary/90 hover:shadow-lg hover:shadow-primary/30 active:bg-primary/90'
                          : 'hover:shadow-lg hover:shadow-primary/30 active:bg-primary/90 focus:ring-2 focus:ring-primary/30'
                      }`}
                  >
                    <span className="flex items-center relative z-10">
                      {isSubmitting ? (
                        <>
                          <div className="loading-spinner mr-3" />
                          Envoi en cours...
                        </>
                      ) : showSuccess ? (
                        <>
                          <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                          </svg>
                          Envoyé !
                        </>
                      ) : (
                        <>
                          <i className="ri-check-line me-2"></i>
                          Envoyer
                        </>
                      )}
                    </span>
                    <div className={`success-state ${showSuccess ? 'show' : ''}`}>
                      <svg className="checkmark" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      </div>
      <ValidationModal
        isOpen={showValidationModal}
        onClose={() => setShowValidationModal(false)}
        validations={selectedValidations}
      />

      {/* Replace the old modal with the new component */}
      <DemandeDetailsModal
        selectedDemande={selectedDemande}
        onClose={closeDemandeModal}
        holidays={holidays}
      />

      {/* Files Modal */}
      <div id="hs-edit-files-modal" className="hs-overlay hidden ti-modal">
        <div className="hs-overlay-open:mt-7 ti-modal-box mt-0 ease-out h-[calc(100%-2rem)] sm:h-[calc(100%-3.5rem)] max-h-full w-full sm:w-[90%] md:w-[600px] lg:w-[700px] xl:w-[800px] mx-auto">
          <div className="ti-modal-content h-full flex flex-col bg-white dark:bg-gray-800 shadow-xl rounded-xl">
            <div className="ti-modal-header sticky top-0 z-50 flex items-center justify-between border-b border-gray-200 dark:border-gray-700 px-4 sm:px-6 py-3 sm:py-4 bg-white dark:bg-gray-800">
              <div className="flex items-center">
                <div className="w-10 h-10 rounded-full bg-primary-100 dark:bg-primary-900/30 flex items-center justify-center">
                  <i className="ri-attachment-line text-xl text-primary-600 dark:text-primary-400"></i>
                </div>
                <div className="ml-3">
                  <h3 className="text-lg font-semibold text-gray-800 dark:text-white">
                    Fichiers joints
                  </h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    {loadingFiles ? (
                      "Chargement..."
                    ) : (
                      `${files.length} fichier${files.length > 1 ? 's' : ''}`
                    )}
                  </p>
                </div>
              </div>
              <button 
                type="button" 
                className="hs-dropdown-toggle ti-modal-close-btn"
                onClick={() => {
                  setFiles([]);  // Reset files state
                  const filesModal = document.querySelector('#hs-edit-files-modal');
                  const editModal = document.querySelector('#hs-edit-demande-modal');
                  if (filesModal && editModal) {
                    const HSOverlay = window.HSOverlay;
                    if (HSOverlay) {
                      HSOverlay.close(filesModal);
                      setTimeout(() => {
                        HSOverlay.open(editModal);
                      }, 100);
                    }
                  }
                }}
              >
                <span className="sr-only">Fermer</span>
                <i className="ri-close-line text-xl"></i>
              </button>
            </div>
            <div className="ti-modal-body p-4 sm:p-6 overflow-y-auto flex-1 custom-scrollbar">
              {loadingFiles ? (
                <div className="flex items-center justify-center p-8">
                  <div className="loading-spinner" />
                </div>
              ) : files.length === 0 ? (
                <div className="text-center p-8">
                  <div className="w-16 h-16 mx-auto flex items-center justify-center rounded-full bg-gray-100 dark:bg-gray-800 mb-4">
                    <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 13h6m-3-3v6m5 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                  </div>
                  <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                    Aucun fichier joint
                  </h3>
                  <p className="text-gray-500 dark:text-gray-400">
                    Cette demande n'a pas de fichiers joints.
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {files.map((file) => (
                    <div key={file.id} className="flex flex-col sm:flex-row sm:items-center justify-between p-3 sm:p-4 bg-gray-50 dark:bg-gray-800 rounded-xl gap-3 sm:gap-4">
                      <div className="flex items-center space-x-3 sm:space-x-4 min-w-0 flex-1">
                        <div className="p-2 bg-primary/10 text-primary rounded-lg flex-shrink-0">
                          <svg className="w-5 sm:w-6 h-5 sm:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                          </svg>
                        </div>
                        <div className="min-w-0 flex-1">
                          <h4 
                            className="text-sm font-medium text-gray-900 dark:text-white truncate max-w-[200px] sm:max-w-[300px]" 
                            title={file.file_name || file.name}
                          >
                            {file.file_name || file.name}
                          </h4>
                          <p className="text-xs text-gray-500 dark:text-gray-400">
                            {file.file_size ? `${(file.file_size / 1024).toFixed(2)} KB` : file.size ? `${(file.size / 1024).toFixed(2)} KB` : 'Size unknown'}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2 self-end sm:self-center">
                        <button
                          onClick={() => handleDownload(file.id, file.file_name || file.name)}
                          className="p-2 text-primary hover:bg-primary/10 rounded-lg transition-colors duration-200"
                          title="Télécharger"
                        >
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                          </svg>
                        </button>
                        <button
                          onClick={() => handleFileDelete(file.id, file.file_name || file.name)}
                          className="p-2 text-danger hover:bg-danger/10 rounded-lg transition-colors duration-200"
                          title="Supprimer"
                        >
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
            <div className="ti-modal-footer sticky bottom-0 z-50 flex flex-col sm:flex-row justify-between gap-3 bg-gray-50 dark:bg-gray-700/50 px-4 sm:px-6 py-3 sm:py-4 border-t border-gray-200 dark:border-gray-700">
              <div>
                <label htmlFor="file-upload" className="ti-btn ti-btn-primary !font-medium !rounded-full px-6 py-2.5 transition-all duration-300">
                  <span className="flex items-center">
                    <i className="ri-upload-2-line me-2"></i>
                    Ajouter des fichiers
                  </span>
                  <input
                    id="file-upload"
                    type="file"
                    multiple
                    className="hidden"
                    accept=".doc,.docx,.xls,.xlsx,.ppt,.pptx,.pdf,.jpg,.jpeg,.png,.gif"
                    onChange={async (e) => {
                      try {
                        const files = Array.from(e.target.files);
                        if (files.length === 0) return;

                        // Validate file types
                        const allowedTypes = [
                          'application/pdf',
                          'application/msword',
                          'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
                          'application/vnd.ms-excel',
                          'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
                          'application/vnd.ms-powerpoint',
                          'application/vnd.openxmlformats-officedocument.presentationml.presentation',
                          'image/jpeg',
                          'image/png',
                          'image/gif'
                        ];

                        const invalidFiles = files.filter(file => !allowedTypes.includes(file.type));
                        if (invalidFiles.length > 0) {
                          ToastService.error('Seuls les documents Office, PDF et images sont acceptés');
                          e.target.value = '';
                          return;
                        }

                        const formData = new FormData();
                        files.forEach(file => {
                          formData.append('files[]', file);
                        });

                        setLoadingFiles(true);
                        await axiosInstance.post(`demandes/${demandeToEdit.id}/files`, formData, {
                          headers: {
                            'Content-Type': 'multipart/form-data'
                          }
                        });

                        // Refresh the files list
                        await fetchDemandeFiles(demandeToEdit.id);
                        ToastService.success('Fichiers ajoutés avec succès');
                        
                        // Reset the input
                        e.target.value = '';
                      } catch (error) {
                        // console.error('Error uploading files:', error);
                        ToastService.error('Erreur lors de l\'ajout des fichiers');
                      } finally {
                        setLoadingFiles(false);
                      }
                    }}
                  />
                </label>
              </div>
              <button
                type="button"
                className="ti-btn ti-btn-danger !font-medium !rounded-full px-6 py-2.5 transition-all duration-300"
                onClick={() => {
                  setFiles([]);  // Reset files state
                  const filesModal = document.querySelector('#hs-edit-files-modal');
                  const editModal = document.querySelector('#hs-edit-demande-modal');
                  if (filesModal && editModal) {
                    const HSOverlay = window.HSOverlay;
                    if (HSOverlay) {
                      HSOverlay.close(filesModal);
                      setTimeout(() => {
                        HSOverlay.open(editModal);
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

      {/* Add the new files modal */}
      <DemandeFilesModal demande={selectedDemande} onClose={() => setSelectedDemande(null)} />
    </Fragment>
  );
};

export default ListeDemandes;