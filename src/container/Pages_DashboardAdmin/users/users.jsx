import { Fragment, useState, useEffect, useCallback, useRef } from 'react';
import Pageheader from '../../../components/common/pageheader/pageheader';
import { FiEdit, FiSearch, FiUser } from 'react-icons/fi';
import ToastService from '../../../components/utile/toastService';
import CustomPagination from '../../../components/utile/CustomPagination';
import '../../../styles/table.css';
import '../../../styles/error.css';
import { HSOverlay } from 'preline';
import axiosInstance from '../../../Interceptor/axiosInstance';
import { ToastContainer } from 'react-toastify';
import * as XLSX from 'xlsx';

const customScrollbarStyles = `
  .custom-scrollbar::-webkit-scrollbar {
    width: 6px;
  }
  .custom-scrollbar::-webkit-scrollbar-track {
    background: #f1f1f1;
    border-radius: 3px;
  }
  .custom-scrollbar::-webkit-scrollbar-thumb {
    background: #dc2626;
    border-radius: 3px;
  }
  .custom-scrollbar::-webkit-scrollbar-thumb:hover {
    background: #b91c1c;
  }
  .dark .custom-scrollbar::-webkit-scrollbar-track {
    background: #1f2937;
  }
  .dark .custom-scrollbar::-webkit-scrollbar-thumb {
    background: #ef4444;
  }
  .dark .custom-scrollbar::-webkit-scrollbar-thumb:hover {
    background: #dc2626;
  }
`;

const Users = () => {
  const [users, setUsers] = useState([]);
  const [roles, setRoles] = useState([]);
  const [entities, setEntities] = useState([]);
  const [superiors, setSuperiors] = useState([]);
  const [projects, setProjects] = useState([]);
  const [selectedProject, setSelectedProject] = useState(null);
  const [selectedUser, setSelectedUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [sortConfig, setSortConfig] = useState({ key: null, direction: 'asc' });
  const [pagination, setPagination] = useState({
    current: 1,
    total: 0,
    perPage: 10,
    lastPage: 1
  });
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    role_id: '',
    first_name: '',
    last_name: '',
    job_title: '',
    phone: '',
    matricule: '',
    entity_id: '',
    departement_id: '',
    superior_id: '',
    project_id: '',
    child_id: ''
  });

  const [superiorSearchTerm, setSuperiorSearchTerm] = useState('');
  const [isSuperiorDropdownOpen, setIsSuperiorDropdownOpen] = useState(false);
  const superiorDropdownRef = useRef(null);
  const [entitySearchTerm, setEntitySearchTerm] = useState('');
  const [isEntityDropdownOpen, setIsEntityDropdownOpen] = useState(false);
  const entityDropdownRef = useRef(null);
  const entityButtonRef = useRef(null);
  const [entityDropdownPosition, setEntityDropdownPosition] = useState({ top: 0, left: 0, width: 0 });
  const [dropdownPosition, setDropdownPosition] = useState({ top: 0, left: 0, width: 0 });
  const [errors, setErrors] = useState({});
  const [showPassword, setShowPassword] = useState(false);
  const [isRoleDropdownOpen, setIsRoleDropdownOpen] = useState(false);
  const [roleSearchTerm, setRoleSearchTerm] = useState('');
  const roleDropdownRef = useRef(null);
  const roleButtonRef = useRef(null);
  const [roleDropdownPosition, setRoleDropdownPosition] = useState({ top: 0, left: 0, width: 0 });
  const [selectedRoles, setSelectedRoles] = useState([]);
  const [isProjectDropdownOpen, setIsProjectDropdownOpen] = useState(false);
  const [projectSearchTerm, setProjectSearchTerm] = useState('');
  const projectDropdownRef = useRef(null);
  const projectButtonRef = useRef(null);
  const [projectDropdownPosition, setProjectDropdownPosition] = useState({ top: 0, left: 0, width: 0 });
  const [selectedUserDetails, setSelectedUserDetails] = useState(null);
  const [childSearchTerm, setChildSearchTerm] = useState('');
  const [isChildDropdownOpen, setIsChildDropdownOpen] = useState(false);
  const childDropdownRef = useRef(null);
  const [selectedChildren, setSelectedChildren] = useState([]);
  const [newSuperior, setNewSuperior] = useState(null);
  const [subordinates, setSubordinates] = useState([]);
  const [userToDelete, setUserToDelete] = useState(null);
  const [searchSuperiorTerm, setSearchSuperiorTerm] = useState('');
  const [selectedNewSuperior, setSelectedNewSuperior] = useState(null);
  const [isCheckingSubordinates, setIsCheckingSubordinates] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isUpdated, setIsUpdated] = useState(false);
  const [userToUpdate, setUserToUpdate] = useState(null);
  const fileInputRef = useRef(null);
  const [isImporting, setIsImporting] = useState(false);

  const filteredRoles = roles.filter(role => {
    const searchTerm = roleSearchTerm.toLowerCase();
    return role.name.toLowerCase().includes(searchTerm);
  });

  const fetchUsers = async (page = 1, search = '') => {
    try {
      setLoading(true);
      const queryParams = new URLSearchParams({
        page,
        per_page: pagination.perPage,
        search: search || '',
        sort_key: sortConfig.key || '',
        sort_direction: sortConfig.direction || 'asc'
      }).toString();

      const response = await axiosInstance.get(`users?${queryParams}`);
      
      if (response.data?.status === 'success' && response.data?.data) {
        const { data, current_page, per_page, total, last_page } = response.data.data;
        console.log(response);
        setUsers(data || []);
        setPagination({
          current: current_page,
          perPage: per_page,
          total,
          lastPage: last_page
        });
      } else {
        console.error('Invalid data format:', response.data);
        ToastService.error('Invalid data format received from server');
        setUsers([]);
      }
    } catch (error) {
      console.error('Error fetching users:', error.response || error);
      ToastService.error(error.response?.data?.message || 'Error fetching users');
      setUsers([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchRoles = async () => {
    try {
      const response = await axiosInstance.get('roles');
      
      if (response.data?.status === 'success' && Array.isArray(response.data?.data)) {
        setRoles(response.data.data);
      } else {
        console.error('Invalid roles format:', response.data);
        ToastService.error('Invalid roles format received from server');
        setRoles([]);
      }
    } catch (error) {
      console.error('Error fetching roles:', error.response || error);
      ToastService.error('Error fetching roles');
      setRoles([]);
    }
  };

  const fetchEntities = async () => {
    try {
      const response = await axiosInstance.get('entities');
      console.log(response);
      if (response.data) {
        setEntities(response.data);
      } else {
        console.error('Invalid entities format:', response.data);
        ToastService.error('Invalid entities format received from server');
        setEntities([]);
      }
    } catch (error) {
      console.error('Error fetching entities:', error.response || error);
      ToastService.error('Error fetching entities');
      setEntities([]);
    }
  };

  const fetchSuperiors = async () => {
    try {
      const response = await axiosInstance.get('listUsers');
      console.log('count users',response.data.data);
      if (response.data?.status === 'success' && response.data?.data) {
        setSuperiors(response.data.data);
       
      } else {
        console.error('Invalid superiors format:', response.data);
        ToastService.error('Invalid superiors format received from server');
        setSuperiors([]);
      }
    } catch (error) {
      console.error('Error fetching superiors:', error.response || error);
      ToastService.error('Error fetching superiors');
      setSuperiors([]);
    }
  };

  const fetchProjects = async () => {
    try {
      const response = await axiosInstance.get('projects');
      if (response.data?.status === 'success' && Array.isArray(response.data?.data)) {
        setProjects(response.data.data);
        // Find and set "Demandes Administratives" as default project
        const defaultProject = response.data.data.find(p => p.name === "Demandes Administratives");
        if (defaultProject) {
          setSelectedProject(defaultProject);
          setFormData(prev => ({
            ...prev,
            project_id: defaultProject.id
          }));
        }
      } else {
        console.error('Invalid projects format:', response.data);
        ToastService.error('Invalid projects format received from server');
        setProjects([]);
      }
    } catch (error) {
      console.error('Error fetching projects:', error.response || error);
      ToastService.error('Error fetching projects');
      setProjects([]);
    }
  };

  useEffect(() => {
    fetchUsers();
    fetchRoles();
    fetchEntities();
    fetchSuperiors();
    fetchProjects();
  }, []);

  useEffect(() => {
    const initModal = async () => {
      try {
        const { HSOverlay, HSAccordion } = await import('preline');
        HSOverlay.init();
        HSAccordion.init();

        // Add event listeners for modal events
        document.addEventListener('open.hs.overlay', (event) => {
          document.body.style.overflow = 'hidden';
          
          // Check if it's our user modal
          if (event.target.id === 'hs-add-user-modal') {
            // First, close all accordions
            const allAccordions = document.querySelectorAll('.hs-accordion');
            allAccordions.forEach(accordion => {
              const button = accordion.querySelector('.hs-accordion-toggle');
              const content = accordion.querySelector('.hs-accordion-content');
              
              if (button && content) {
                content.classList.add('hidden');
                button.setAttribute('aria-expanded', 'false');
                button.classList.remove('hs-accordion-active');
              }
            });

            // Then open only the Basic Information accordion
            const basicInfoAccordion = document.querySelector('#basic-info-accordion');
            if (basicInfoAccordion) {
              const button = basicInfoAccordion.querySelector('.hs-accordion-toggle');
              const content = basicInfoAccordion.querySelector('.hs-accordion-content');
              
              if (button && content) {
                content.classList.remove('hidden');
                button.setAttribute('aria-expanded', 'true');
                button.classList.add('hs-accordion-active');
              }
            }
          }
        });

        document.addEventListener('close.hs.overlay', () => {
          document.body.style.overflow = '';
          document.body.style.paddingRight = '';
        });
      } catch (error) {
        console.error('Error initializing modal:', error);
      }
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

  useEffect(() => {
    // Add custom scrollbar styles
    const styleSheet = document.createElement("style");
    styleSheet.innerText = customScrollbarStyles;
    document.head.appendChild(styleSheet);

    return () => {
      document.head.removeChild(styleSheet);
    };
  }, []);

  const closeModal = () => {
    // Reset update mode and user data
    setIsUpdated(false);
    setUserToUpdate(null);
    
    // Reset form data
    setFormData({
      name: '',
      email: '',
      password: '',
      role_id: '',
      first_name: '',
      last_name: '',
      job_title: '',
      phone: '',
      matricule: '',
      entity_id: '',
      departement_id: '',
      superior_id: '',
      project_id: '',
      child_id: ''
    });
    setSelectedRoles([]);
    setSelectedProject(null);
    setNewSuperior(null);
    setSelectedChildren([]);
    setErrors({});

    // Close the modal
    const modal = document.getElementById('hs-add-user-modal');
    if (modal) {
      const HSOverlay = window.HSOverlay;
      if (HSOverlay) {
        HSOverlay.close(modal);
      }
    }
  };



  const closeDeleteModal = () => {
    const modalEl = document.querySelector('#hs-delete-user-modal');
    if (modalEl) {
      const HSOverlay = window.HSOverlay;
      if (HSOverlay) {
        HSOverlay.close(modalEl);
      }
    }
    setUserToDelete(null);
    setNewSuperior(null);
    setSubordinates([]);
    setSearchSuperiorTerm('');
    setSelectedNewSuperior(null);
  };

  const checkUserSubordinates = async (userId) => {
    try {
      setIsCheckingSubordinates(true);
      const response = await axiosInstance.get(`check-superior/${userId}`);
      if (response.data.subordinates && response.data.subordinates.length > 0) {
        console.log('check-superior', response);
        setSubordinates(response.data.subordinates);
        // Show message about subordinates
        ToastService.info(response.data.message);
      } else {
        setSubordinates([]);
      }
    } catch (error) {
      console.error('Error checking user:', error);
      ToastService.error('Error checking user status');
    } finally {
      setIsCheckingSubordinates(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    
    // Prevent email changes in edit mode
    if (isUpdated && name === 'email') {
      return;
    }

    // Phone number validation - only allow numbers
    if (name === 'phone') {
      // Remove any non-numeric characters
      const numericValue = value.replace(/[^0-9]/g, '');
      // Limit to 10 digits
      const limitedValue = numericValue.slice(0, 10);
      setFormData(prev => ({
        ...prev,
        [name]: limitedValue
      }));
      return;
    }

    // Matricule validation - only allow numbers
    if (name === 'matricule') {
      // Remove any non-numeric characters
      const numericValue = value.replace(/[^0-5]/g, '');
      // Limit to 8 digits
      const limitedValue = numericValue.slice(0, 5);
      setFormData(prev => ({
        ...prev,
        [name]: limitedValue
      }));
      return;
    }

    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const validateForm = () => {
    const newErrors = {};
    
    // Email validation
    if (!formData.email) {
      newErrors.email = "L'email est requis";
    } else if (!/^[^\s@]+@casaprestations\.ma$/.test(formData.email)) {
      newErrors.email = "L'email doit être au format test@casaprestations.ma";
    }

    // Phone validation
    if (formData.phone && !/^[0-9]{10}$/.test(formData.phone)) {
      newErrors.phone = "Le numéro de téléphone doit contenir exactement 10 chiffres";
    }

    // First Name validation
    if (!formData.first_name) {
      newErrors.first_name = "Le prénom est requis";
    }

    // Last Name validation
    if (!formData.last_name) {
      newErrors.last_name = "Le nom est requis";
    }

    // Entity validation
    if (!formData.entity_id) {
      newErrors.entity_id = "L'entité est requise";
    }

    // Matricule validation
    if (!formData.matricule) {
      newErrors.matricule = "Le matricule est requis";
    } else if (!/^[0-9]{1,8}$/.test(formData.matricule)) {
      newErrors.matricule = "Le matricule doit contenir entre 1 et 8 chiffres";
    }

    // Password validation - only for new users
    if (!isUpdated && !formData.password) {
      newErrors.password = "Le mot de passe est requis";
    } else if (!isUpdated && formData.password && formData.password.length < 6) {
      newErrors.password = "Le mot de passe doit contenir au moins 6 caractères";
    }

    // Child validation (optional)
    if (formData.child_id && formData.child_id === formData.superior_id) {
      newErrors.child_id = "Un utilisateur ne peut pas être son propre subordonnés";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    setIsSubmitting(true);
    
    // Add a small delay to ensure loading state is visible
    await new Promise(resolve => setTimeout(resolve, 100));
    
    if (!validateForm()) {
      setIsSubmitting(false);
      // Show toast for validation errors
      ToastService.error('Veuillez corriger les erreurs de validation avant de continuer');
      return;
    }

    try {
      console.log('Selected Children before submit:', selectedChildren);
      console.log('Selected Children IDs:', selectedChildren.map(child => child.id));
      
      const submitData = {
        ...formData,
        roles: selectedRoles.map(role => role.id),
        project_id: selectedProject?.id,
        superior_id: newSuperior?.id,
        children: selectedChildren.map(child => child.id)
      };

      // Remove email from update data
      if (isUpdated) {
        delete submitData.email;
      }

      console.log('Final submit data:', submitData);

      let response;
      if (isUpdated && userToUpdate) {
        // Update existing user
        console.log('Updating user:', submitData);
        response = await axiosInstance.put(`users/${userToUpdate.id}`, submitData);
        ToastService.success('User updated successfully');
      } else {
        // Create new user
        console.log('Creating user:', submitData);
        response = await axiosInstance.post('user/create', submitData);
        ToastService.success('User created successfully');
      }

      if (response.data?.status === 'success') {
        closeModal();
        fetchUsers(pagination.current, searchTerm);
      }
    } catch (error) {
      console.error('Error submitting form:', error);
      ToastService.error(error.response?.data?.message || 'Error submitting form');
    } finally {
      setIsSubmitting(false);
    }
  };

 

  const handlePageChange = (page) => {
    fetchUsers(page);
  };

  const handleSort = (key) => {
    const direction = sortConfig.key === key && sortConfig.direction === 'asc' ? 'desc' : 'asc';
    setSortConfig({ key, direction });
    fetchUsers(1);
  };

  const handleSearch = () => {
    setIsSearching(true);
    fetchUsers(1, searchTerm);
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  const handleSearchInputChange = (e) => {
    setSearchTerm(e.target.value);
    if (!e.target.value) {
      setIsSearching(false);
      fetchUsers(1);
    }
  };

  const handleClearSearch = () => {
    setSearchTerm('');
    setIsSearching(false);
    fetchUsers(1);
  };

  const handleAddUser = () => {
    // Reset update mode and user data
    setIsUpdated(false);
    setUserToUpdate(null);
    
    setSelectedUser(null);
    setFormData({
      name: '',
      email: '',
      password: '',
      role_id: '',
      first_name: '',
      last_name: '',
      job_title: '',
      phone: '',
      matricule: '',
      entity_id: '',
      departement_id: '',
      superior_id: '',
      project_id: '',
      child_id: ''
    });
    setSelectedRoles([]);
    setSelectedProject(null);
    setNewSuperior(null);
    setSelectedChildren([]);
    setErrors({});
    
    // Open the modal
    const modal = document.getElementById('hs-add-user-modal');
    if (modal) {
      const HSOverlay = window.HSOverlay;
      if (HSOverlay) {
        HSOverlay.open(modal);
      }
    }
  };

  const handleImportClick = () => {
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
      fileInputRef.current.click();
    }
  };

  // Normalize matricule function
  const normalizeMatricule = (matricule) => {
    if (!matricule) return null;
    
    // Convert to string and remove leading zeros, then pad to 5 digits
    const cleanMatricule = matricule.toString().replace(/^0+/, '') || '0';
    return cleanMatricule.padStart(5, '0');
  };

  const handleFileChange = async (e) => {
    setIsImporting(true); // Start loading
    const file = e.target.files[0];
    if (!file) {
      setIsImporting(false);
      return;
    }
    try {
      const data = await file.arrayBuffer();
      const workbook = XLSX.read(data, { type: 'array' });
      const sheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[sheetName];
      const importedUsers = XLSX.utils.sheet_to_json(worksheet);
      console.log('importedUsers',importedUsers);
      
      // Get all existing matricules and their data
      const existingMatricules = new Set(superiors.map(u => normalizeMatricule(u.matricule)));
      const existingUsersData = superiors.reduce((acc, user) => {
        acc[normalizeMatricule(user.matricule)] = user;
        return acc;
      }, {});
      console.log('existingMatricules',existingMatricules);
      console.log('existingUsersData',existingUsersData);

      // Split users into toCreate and toUpdate
      const toCreate = [];
      const toUpdate = [];
      importedUsers.forEach(u => {
        if (u.Matricule) {
          const normalizedMatricule = normalizeMatricule(u.Matricule);
          if (existingMatricules.has(normalizedMatricule)) {
            // Include existing user data for comparison
            toUpdate.push({
              excelData: u,
              existingUser: existingUsersData[normalizedMatricule]
            });
          } else {
            toCreate.push(u);
          }
        }
      });

      console.log('To create:', toCreate);
      console.log('To update:', toUpdate);

      if (toCreate.length === 0 && toUpdate.length === 0) {
        ToastService.info('Aucun utilisateur à importer ou mettre à jour.');
        return;
      }

      const confirmImport = window.confirm(
        `Créer ${toCreate.length} utilisateur(s) et mettre à jour ${toUpdate.length} utilisateur(s) ?`
      );
      if (!confirmImport) {
        ToastService.info('Import annulé par l\'utilisateur.');
        return;
      }

      // Send both lists to backend
      try {
        const response = await axiosInstance.post('import-users', { toCreate, toUpdate });
        if (response.data?.status === 'success') {
          ToastService.success(
            `${toCreate.length} utilisateur(s) créé(s), ${toUpdate.length} utilisateur(s) mis à jour.`
          );
          setIsImporting(false);
          fetchUsers(pagination.current, searchTerm);
        } else {
          ToastService.error('Erreur lors de l\'importation/mise à jour des utilisateurs.');
             setIsImporting(false);
        }
      } catch (err) {
        console.error('Backend import error:', err);
        setIsImporting(false);
        ToastService.error('Erreur lors de l\'importation/mise à jour des utilisateurs.');
      }
    } catch (err) {
      console.error('Excel parsing error:', err);
      setIsImporting(false);
      ToastService.error('Erreur lors de la lecture du fichier Excel.');
    }

    console.log('=== IMPORT DATA SUMMARY ===');
    console.log('All imported users from Excel:', importedUsers);
    console.log('Users to create (new matricule):', toCreate);
    console.log('Users to update (existing matricule):', toUpdate);
    console.log('Total imported:', importedUsers.length);
    console.log('To create:', toCreate.length);
    console.log('To update:', toUpdate.length);
    console.log('=== END IMPORT DATA SUMMARY ===');
    setIsImporting(false); // End loading
  };

  const filteredSuperiors = superiors.filter(superior => {
    const searchTerm = superiorSearchTerm.toLowerCase();
    return (
      (superior.first_name?.toLowerCase().includes(searchTerm) || '') ||
      (superior.last_name?.toLowerCase().includes(searchTerm) || '') ||
      (superior.matricule?.toLowerCase().includes(searchTerm) || '') ||
      (superior.email?.toLowerCase().includes(searchTerm) || '')
    );
  });

  const renderSuperiorSelect = () => {
    const buttonRef = useRef(null);

    useEffect(() => {
      if (isSuperiorDropdownOpen && buttonRef.current) {
        const rect = buttonRef.current.getBoundingClientRect();
        setDropdownPosition({
          top: rect.top + window.scrollY - 10,
          left: rect.left + window.scrollX,
          width: rect.width
        });
      }
    }, [isSuperiorDropdownOpen]);

    return (
      <div className="relative" ref={superiorDropdownRef}>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Parent</label>
        <div className="relative">
          <button
            ref={buttonRef}
            type="button"
            onClick={() => setIsSuperiorDropdownOpen(!isSuperiorDropdownOpen)}
            className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary dark:bg-gray-700 dark:text-white flex items-center justify-between"
          >
            <div className="flex items-center">
              {formData.superior_id ? (
                <>
                  <div className="w-8 h-8 rounded-full bg-primary/10 text-primary flex items-center justify-center mr-2">
                    <FiUser className="w-4 h-4" />
                  </div>
                  <span>
                    {superiors.find(s => s.id === formData.superior_id)?.first_name} {superiors.find(s => s.id === formData.superior_id)?.last_name}
                  </span>
                </>
              ) : (
                <span className="text-gray-500">Select a superior</span>
              )}
            </div>
            <svg className={`w-4 h-4 transition-transform ${isSuperiorDropdownOpen ? 'transform rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
            </svg>
          </button>
        </div>

        {isSuperiorDropdownOpen && (
          <div 
            className="fixed z-[999999] w-full"
            style={{
              position: 'fixed',
              bottom: `calc(100% - ${dropdownPosition.top}px)`,
              left: `${dropdownPosition.left}px`,
              width: `${dropdownPosition.width}px`
            }}
          >
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 max-h-96 overflow-hidden mb-2">
              <div className="p-2 border-b border-gray-200 dark:border-gray-700">
                <div className="relative">
                  <input
                    type="text"
                    value={superiorSearchTerm}
                    onChange={(e) => setSuperiorSearchTerm(e.target.value)}
                    placeholder="Search superiors..."
                    className="w-full pl-8 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary dark:bg-gray-700 dark:text-white"
                  />
                  <FiSearch className="absolute left-2 top-1/2 transform -translate-y-1/2 text-gray-400" />
                </div>
              </div>
              <div className="overflow-y-auto max-h-80">
                <button
                  type="button"
                  onClick={() => {
                    setFormData(prev => ({ ...prev, superior_id: '' }));
                    setIsSuperiorDropdownOpen(false);
                    setSuperiorSearchTerm('');
                  }}
                  className="w-full px-4 py-3 flex items-center hover:bg-gray-50 dark:hover:bg-gray-700/50 text-gray-500 dark:text-gray-400"
                >
                  <div className="w-8 h-8 rounded-full bg-gray-100 dark:bg-gray-700 flex items-center justify-center mr-3">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </div>
                  <div className="flex-1 text-left">
                    <div className="font-medium">No Superior</div>
                  </div>
                </button>
                {filteredSuperiors.length > 0 ? (
                  filteredSuperiors.map((superior) => (
                    <button
                      key={superior.id}
                      type="button"
                      onClick={() => {
                        setFormData(prev => ({ ...prev, superior_id: superior.id }));
                        setNewSuperior(superior); // Add this line to set newSuperior
                        setIsSuperiorDropdownOpen(false);
                        setSuperiorSearchTerm('');
                      }}
                      className={`w-full px-4 py-3 flex items-center hover:bg-gray-50 dark:hover:bg-gray-700/50 ${
                        formData.superior_id === superior.id ? 'bg-primary/5' : ''
                      }`}
                    >
                      <div className="w-8 h-8 rounded-full bg-primary/10 text-primary flex items-center justify-center mr-3">
                        <FiUser className="w-4 h-4" />
                      </div>
                      <div className="flex-1 text-left">
                        <div className="font-medium text-gray-900 dark:text-white">
                          {superior.first_name} {superior.last_name}
                        </div>
                        <div className="text-sm text-gray-500 dark:text-gray-400">
                          ID: {superior.matricule} • {superior.email}
                        </div>
                        {superior.job_title && (
                          <div className="text-xs text-gray-500 dark:text-gray-400">
                            {superior.job_title}
                          </div>
                        )}
                      </div>
                    </button>
                  ))
                ) : (
                  <div className="px-4 py-3 text-center text-gray-500 dark:text-gray-400">
                    No superiors found
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    );
  };

  const filteredEntities = entities.filter(entity => {
    const searchTerm = entitySearchTerm.toLowerCase();
    return (
      (entity.name?.toLowerCase().includes(searchTerm) || '') ||
      (entity.description?.toLowerCase().includes(searchTerm) || '')
    );
  });

  const renderEntitySelect = () => {
    useEffect(() => {
      if (isEntityDropdownOpen && entityButtonRef.current) {
        const rect = entityButtonRef.current.getBoundingClientRect();
        setEntityDropdownPosition({
          top: rect.top + window.scrollY - 10,
          left: rect.left + window.scrollX,
          width: rect.width
        });
      }
    }, [isEntityDropdownOpen]);

    return (
      <div className="relative" ref={entityDropdownRef}>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          Entity <span className="redStae font-bold">*</span>
        </label>
        <div className="relative">
          <button
            ref={entityButtonRef}
            type="button"
            onClick={() => setIsEntityDropdownOpen(!isEntityDropdownOpen)}
            className={`w-full px-4 py-2 border rounded-lg focus:ring-2 dark:bg-gray-700 dark:text-white flex items-center justify-between ${
              errors.entity_id ? 'border-red-500 focus:ring-red-500 focus:border-red-500' : 'border-gray-300 dark:border-gray-600 focus:ring-primary focus:border-primary'
            }`}
          >
            <div className="flex items-center">
              {formData.entity_id ? (
                <>
                  <div className="w-8 h-8 rounded-full bg-primary/10 text-primary flex items-center justify-center mr-2">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                    </svg>
                  </div>
                  <span>
                    {entities.find(e => e.id === formData.entity_id)?.name}
                  </span>
                </>
              ) : (
                <span className="text-gray-500">Select an entity</span>
              )}
            </div>
            <svg className={`w-4 h-4 transition-transform ${isEntityDropdownOpen ? 'transform rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
            </svg>
          </button>
        </div>
        {errors.entity_id && (
          <div className="error-message mt-1">
            <svg className="error-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span className="error-text">{errors.entity_id}</span>
          </div>
        )}

        {isEntityDropdownOpen && (
          <div 
            className="fixed z-[999999] w-full"
            style={{
              position: 'fixed',
              bottom: `calc(100% - ${entityDropdownPosition.top}px)`,
              left: `${entityDropdownPosition.left}px`,
              width: `${entityDropdownPosition.width}px`
            }}
          >
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 max-h-96 overflow-hidden mb-2">
              <div className="p-2 border-b border-gray-200 dark:border-gray-700">
                <div className="relative">
                  <input
                    type="text"
                    value={entitySearchTerm}
                    onChange={(e) => setEntitySearchTerm(e.target.value)}
                    placeholder="Search entities..."
                    className="w-full pl-8 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary dark:bg-gray-700 dark:text-white"
                  />
                  <FiSearch className="absolute left-2 top-1/2 transform -translate-y-1/2 text-gray-400" />
                </div>
              </div>
              <div className="overflow-y-auto max-h-80">
                <button
                  type="button"
                  onClick={() => {
                    setFormData(prev => ({ ...prev, entity_id: '' }));
                    setIsEntityDropdownOpen(false);
                    setEntitySearchTerm('');
                  }}
                  className="w-full px-4 py-3 flex items-center hover:bg-gray-50 dark:hover:bg-gray-700/50 text-gray-500 dark:text-gray-400"
                >
                  <div className="w-8 h-8 rounded-full bg-gray-100 dark:bg-gray-700 flex items-center justify-center mr-3">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </div>
                  <div className="flex-1 text-left">
                    <div className="font-medium">No Entity</div>
                  </div>
                </button>
                {filteredEntities.length > 0 ? (
                  filteredEntities.map((entity) => (
                    <button
                      key={entity.id}
                      type="button"
                      onClick={() => {
                        setFormData(prev => ({ ...prev, entity_id: entity.id }));
                        setIsEntityDropdownOpen(false);
                        setEntitySearchTerm('');
                      }}
                      className={`w-full px-4 py-3 flex items-center hover:bg-gray-50 dark:hover:bg-gray-700/50 ${
                        formData.entity_id === entity.id ? 'bg-primary/5' : ''
                      }`}
                    >
                      <div className="w-8 h-8 rounded-full bg-primary/10 text-primary flex items-center justify-center mr-3">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                        </svg>
                      </div>
                      <div className="flex-1 text-left">
                        <div className="font-medium text-gray-900 dark:text-white">
                          {entity.name}
                        </div>
                        {entity.description && (
                          <div className="text-sm text-gray-500 dark:text-gray-400">
                            {entity.description}
                          </div>
                        )}
                      </div>
                    </button>
                  ))
                ) : (
                  <div className="px-4 py-3 text-center text-gray-500 dark:text-gray-400">
                    No entities found
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    );
  };

  const handleRoleSelect = (role) => {
    setSelectedRoles(prev => {
      const isSelected = prev.some(r => r.id === role.id);
      if (isSelected) {
        return prev.filter(r => r.id !== role.id);
      } else {
        return [...prev, role];
      }
    });
      setFormData(prev => ({
        ...prev,
      role_id: role.id // Keep this for backward compatibility
      }));
  };

  const renderRoleSelect = () => {
    useEffect(() => {
      if (isRoleDropdownOpen && roleButtonRef.current) {
        const rect = roleButtonRef.current.getBoundingClientRect();
        setRoleDropdownPosition({
          top: rect.top + window.scrollY - 10,
          left: rect.left + window.scrollX,
          width: rect.width
        });
      }
    }, [isRoleDropdownOpen]);

    return (
      <div className="relative" ref={roleDropdownRef}>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
          Rôles 
        </label>
        <div className="relative">
          <button
            ref={roleButtonRef}
            type="button"
            onClick={() => setIsRoleDropdownOpen(!isRoleDropdownOpen)}
            className={`w-full min-h-[44px] px-4 py-2 border rounded-lg focus:ring-2 dark:bg-gray-700 dark:text-white flex items-center justify-between ${
              errors.roles ? 'border-red-500 focus:ring-red-500 focus:border-red-500' : 'border-gray-300 dark:border-gray-600 focus:ring-primary focus:border-primary'
            }`}
          >
            <div className="flex flex-wrap items-center gap-2">
              {selectedRoles.length > 0 ? (
                selectedRoles.map((role) => (
                  <div
                    key={role.id}
                    className="inline-flex items-center gap-1 px-2 py-1 bg-primary/10 text-primary rounded-md text-sm"
                  >
                    <span>{role.name}</span>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleRoleSelect(role);
                      }}
                      className="hover:text-primary-dark"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </div>
                ))
              ) : (
                <span className="text-gray-500">Sélectionnez des rôles</span>
              )}
            </div>
            <svg className={`w-4 h-4 transition-transform ${isRoleDropdownOpen ? 'transform rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
            </svg>
          </button>
        </div>
        {errors.roles && (
          <div className="error-message mt-1">
            <svg className="error-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span className="error-text">{errors.roles}</span>
          </div>
        )}

        {isRoleDropdownOpen && (
          <div 
            className="fixed z-[999999] w-full"
            style={{
              position: 'fixed',
              bottom: `calc(100% - ${roleDropdownPosition.top}px)`,
              left: `${roleDropdownPosition.left}px`,
              width: `${roleDropdownPosition.width}px`
            }}
          >
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 max-h-96 overflow-hidden mb-2">
              <div className="p-2 border-b border-gray-200 dark:border-gray-700">
                <div className="relative">
                  <input
                    type="text"
                    value={roleSearchTerm}
                    onChange={(e) => setRoleSearchTerm(e.target.value)}
                    placeholder="Rechercher des rôles..."
                    className="w-full pl-8 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary dark:bg-gray-700 dark:text-white"
                  />
                  <FiSearch className="absolute left-2 top-1/2 transform -translate-y-1/2 text-gray-400" />
                </div>
              </div>
              <div className="overflow-y-auto max-h-80">
                {filteredRoles.length > 0 ? (
                  filteredRoles.map((role) => (
                    <button
                      key={role.id}
                      type="button"
                      onClick={() => handleRoleSelect(role)}
                      className={`w-full px-4 py-3 flex items-center hover:bg-gray-50 dark:hover:bg-gray-700/50 ${
                        selectedRoles.some(r => r.id === role.id) ? 'bg-primary/5' : ''
                      }`}
                    >
                      <div className="w-8 h-8 rounded-full bg-primary/10 text-primary flex items-center justify-center mr-3">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                        </svg>
                      </div>
                      <div className="flex-1 text-left">
                        <div className="font-medium text-gray-900 dark:text-white">
                          {role.name}
                        </div>
                        {role.description && (
                          <div className="text-sm text-gray-500 dark:text-gray-400">
                            {role.description}
                          </div>
                        )}
                      </div>
                      {selectedRoles.some(r => r.id === role.id) && (
                        <div className="ml-2 text-primary">
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                          </svg>
                        </div>
                      )}
                    </button>
                  ))
                ) : (
                  <div className="px-4 py-3 text-center text-gray-500 dark:text-gray-400">
                    Aucun rôle trouvé
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    );
  };

  const handleProjectSelect = (project) => {
    setSelectedProject(project);
    setFormData(prev => ({
      ...prev,
      project_id: project.id
    }));
    setIsProjectDropdownOpen(false);
    setProjectSearchTerm('');
  };

  const filteredProjects = projects.filter(project => {
    const searchTerm = projectSearchTerm.toLowerCase();
    return (
      project.name.toLowerCase().includes(searchTerm) ||
      (project.description?.toLowerCase().includes(searchTerm) || '')
    );
  });

  const renderProjectSelect = () => {
    useEffect(() => {
      if (isProjectDropdownOpen && projectButtonRef.current) {
        const rect = projectButtonRef.current.getBoundingClientRect();
        setProjectDropdownPosition({
          top: rect.top + window.scrollY - 10,
          left: rect.left + window.scrollX,
          width: rect.width
        });
      }
    }, [isProjectDropdownOpen]);

    return (
      <div className="relative" ref={projectDropdownRef}>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
          Projet 
        </label>
        <div className="relative">
          <button
            ref={projectButtonRef}
            type="button"
            disabled={true}
            className={`w-full px-4 py-2 border rounded-lg focus:ring-2 dark:bg-gray-700 dark:text-white flex items-center justify-between bg-gray-100 dark:bg-gray-600 cursor-not-allowed ${
              errors.project_id ? 'border-red-500 focus:ring-red-500 focus:border-red-500' : 'border-gray-300 dark:border-gray-600 focus:ring-primary focus:border-primary'
            }`}
          >
            <div className="flex items-center">
              {selectedProject ? (
                <>
                  <div className="w-8 h-8 rounded-full bg-primary/10 text-primary flex items-center justify-center mr-2">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />
                    </svg>
                  </div>
                  <span>{selectedProject.name}</span>
                </>
              ) : (
                <span className="text-gray-500">Sélectionnez un projet</span>
              )}
            </div>
            <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
            </svg>
          </button>
        </div>
        {errors.project_id && (
          <div className="error-message mt-1">
            <svg className="error-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span className="error-text">{errors.project_id}</span>
          </div>
        )}
      </div>
    );
  };

  // Update the click outside handler
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (entityDropdownRef.current && !entityDropdownRef.current.contains(event.target)) {
        setIsEntityDropdownOpen(false);
      }
      if (superiorDropdownRef.current && !superiorDropdownRef.current.contains(event.target)) {
        setIsSuperiorDropdownOpen(false);
      }
      if (roleDropdownRef.current && !roleDropdownRef.current.contains(event.target)) {
        setIsRoleDropdownOpen(false);
      }
      if (projectDropdownRef.current && !projectDropdownRef.current.contains(event.target)) {
        setIsProjectDropdownOpen(false);
      }
      if (childDropdownRef.current && !childDropdownRef.current.contains(event.target)) {
        setIsChildDropdownOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Add a portal container for dropdowns
  useEffect(() => {
    // Create portal container if it doesn't exist
    let portalContainer = document.getElementById('dropdown-portal');
    if (!portalContainer) {
      portalContainer = document.createElement('div');
      portalContainer.id = 'dropdown-portal';
      portalContainer.style.position = 'fixed';
      portalContainer.style.top = '0';
      portalContainer.style.left = '0';
      portalContainer.style.width = '100%';
      portalContainer.style.height = '100%';
      portalContainer.style.pointerEvents = 'none';
      portalContainer.style.zIndex = '999999';
      document.body.appendChild(portalContainer);
    }

    return () => {
      // Cleanup portal container on unmount
      if (portalContainer && portalContainer.parentNode) {
        portalContainer.parentNode.removeChild(portalContainer);
      }
    };
  }, []);

  const renderError = (field) => {
    if (errors[field]) {
      return (
        <div className={`error-message ${document.documentElement.classList.contains('dark') ? 'dark' : ''}`}>
          <svg className={`error-icon ${document.documentElement.classList.contains('dark') ? 'dark' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <span className={`error-text ${document.documentElement.classList.contains('dark') ? 'dark' : ''}`}>{errors[field]}</span>
        </div>
      );
    }
    return null;
  };

  const generatePassword = () => {
    const length = 12;
    const charset = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*";
    let password = "";
    for (let i = 0; i < length; i++) {
      password += charset.charAt(Math.floor(Math.random() * charset.length));
    }
    setFormData(prev => ({ ...prev, password }));
  };

  // Update useEffect to initialize selectedRoles when editing a user
  useEffect(() => {
    if (selectedUser) {
      const userRole = roles.find(r => r.id === selectedUser.role_id);
      if (userRole) {
        setSelectedRoles([userRole]);
      }
    } else {
      setSelectedRoles([]);
    }
  }, [selectedUser, roles]);

  const handleViewUser = (user) => {
    setSelectedUserDetails(user);
    const modalEl = document.querySelector('#hs-view-user-modal');
    if (modalEl) {
      const HSOverlay = window.HSOverlay;
      if (HSOverlay) {
        HSOverlay.open(modalEl);
      }
    }
  };



  const handleChildSelect = (child) => {
    setSelectedChildren(prev => {
      const isSelected = prev.some(c => c.id === child.id);
      const newChildren = isSelected 
        ? prev.filter(c => c.id !== child.id)
        : [...prev, child];
      
      // Update formData with the new children IDs
      setFormData(prevForm => ({
        ...prevForm,
        child_id: newChildren.map(c => c.id).join(',')
      }));
      
      return newChildren;
    });
  };

  const renderChildSelect = () => {
    const buttonRef = useRef(null);

    useEffect(() => {
      if (isChildDropdownOpen && buttonRef.current) {
        const rect = buttonRef.current.getBoundingClientRect();
        setDropdownPosition({
          top: rect.top + window.scrollY - 10,
          left: rect.left + window.scrollX,
          width: rect.width
        });
      }
    }, [isChildDropdownOpen]);

    const filteredChildren = superiors.filter(child => {
      const searchTerm = childSearchTerm.toLowerCase();
      return (
        (child.first_name?.toLowerCase().includes(searchTerm) || '') ||
        (child.last_name?.toLowerCase().includes(searchTerm) || '') ||
        (child.matricule?.toLowerCase().includes(searchTerm) || '') ||
        (child.email?.toLowerCase().includes(searchTerm) || '')
      );
    });

    return (
      <div className="relative" ref={childDropdownRef}>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Subordonnés</label>
        <div className="relative">
          <button
            ref={buttonRef}
            type="button"
            onClick={() => setIsChildDropdownOpen(!isChildDropdownOpen)}
            className="w-full min-h-[44px] px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary dark:bg-gray-700 dark:text-white flex items-center justify-between"
          >
            <div className="flex flex-wrap items-center gap-2">
              {selectedChildren.length > 0 ? (
                selectedChildren.map((child) => (
                  <div
                    key={child.id}
                    className="inline-flex items-center gap-1 px-2 py-1 bg-primary/10 text-primary rounded-md text-sm"
                  >
                    <span>{child.first_name} {child.last_name}</span>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleChildSelect(child);
                      }}
                      className="hover:text-primary-dark"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </div>
                ))
              ) : (
                <span className="text-gray-500">Sélectionner les subordonnés</span>
              )}
            </div>
            <svg className={`w-4 h-4 transition-transform ${isChildDropdownOpen ? 'transform rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
            </svg>
          </button>
        </div>

        {isChildDropdownOpen && (
          <div 
            className="fixed z-[999999] w-full"
            style={{
              position: 'fixed',
              bottom: `calc(100% - ${dropdownPosition.top}px)`,
              left: `${dropdownPosition.left}px`,
              width: `${dropdownPosition.width}px`
            }}
          >
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 max-h-96 overflow-hidden mb-2">
              <div className="p-2 border-b border-gray-200 dark:border-gray-700">
                <div className="relative">
                  <input
                    type="text"
                    value={childSearchTerm}
                    onChange={(e) => setChildSearchTerm(e.target.value)}
                    placeholder="Search users..."
                    className="w-full pl-8 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary dark:bg-gray-700 dark:text-white"
                  />
                  <FiSearch className="absolute left-2 top-1/2 transform -translate-y-1/2 text-gray-400" />
                </div>
              </div>
              <div className="overflow-y-auto max-h-80">
                {filteredChildren.length > 0 ? (
                  filteredChildren.map((child) => (
                    <button
                      key={child.id}
                      type="button"
                      onClick={() => handleChildSelect(child)}
                      className={`w-full px-4 py-3 flex items-center hover:bg-gray-50 dark:hover:bg-gray-700/50 ${
                        selectedChildren.some(c => c.id === child.id) ? 'bg-primary/5' : ''
                      }`}
                    >
                      <div className="w-8 h-8 rounded-full bg-primary/10 text-primary flex items-center justify-center mr-3">
                        <FiUser className="w-4 h-4" />
                      </div>
                      <div className="flex-1 text-left">
                        <div className="font-medium text-gray-900 dark:text-white">
                          {child.first_name} {child.last_name}
                        </div>
                        <div className="text-sm text-gray-500 dark:text-gray-400">
                          ID: {child.matricule} • {child.email}
                        </div>
                        {child.job_title && (
                          <div className="text-xs text-gray-500 dark:text-gray-400">
                            {child.job_title}
                          </div>
                        )}
                      </div>
                      {selectedChildren.some(c => c.id === child.id) && (
                        <div className="ml-2 text-primary">
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                          </svg>
                        </div>
                      )}
                    </button>
                  ))
                ) : (
                  <div className="px-4 py-3 text-center text-gray-500 dark:text-gray-400">
                    No users found
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    );
  };

  // Update useEffect to initialize selectedChildren when editing a user
  useEffect(() => {
    if (selectedUser && selectedUser.child_id) {
      const childIds = selectedUser.child_id.split(',');
      const children = superiors.filter(s => childIds.includes(s.id.toString()));
      setSelectedChildren(children);
    } else {
      setSelectedChildren([]);
    }
  }, [selectedUser, superiors]);

  const handleDelete = (user) => {
    setUserToDelete(user);
    checkUserSubordinates(user.id);
      const modalEl = document.querySelector('#hs-delete-user-modal');
      if (modalEl) {
        const HSOverlay = window.HSOverlay;
        if (HSOverlay) {
          HSOverlay.open(modalEl);
        }
      }
  
  };

  const handleDeleteConfirm = async () => {
    if (subordinates && subordinates.length > 0 && !selectedNewSuperior) {
      ToastService.error('Veuillez sélectionner un nouveau supérieur pour les subordonnés');
      return;
    }

    try {
      const response = await axiosInstance.delete(`delete-with-superior-check/${userToDelete.id}`, {
        data: {
          new_superior_id: selectedNewSuperior?.id
        }
      });
      
      if (response.data.status === 'success') {
        ToastService.success(response.data.message || 'Utilisateur supprimé avec succès');
        closeDeleteModal();
        fetchUsers(pagination.current);
      } else {
        ToastService.error(response.data.message || 'Erreur lors de la suppression de l\'utilisateur');
      }
    } catch (error) {
      console.error('Error deleting user:', error);
      if (error.response?.data?.subordinates) {
        setSubordinates(error.response.data.subordinates);
        ToastService.error(error.response.data.message);
      } else {
        ToastService.error(error.response?.data?.message || 'Erreur lors de la suppression de l\'utilisateur');
      }
    }
  };

  const initializeUserData = (user) => {
    console.log('Initializing user data:', user); // Debug log

    // Set form data
    setFormData({
      name: user.name || '',
      first_name: user.first_name || '',
      last_name: user.last_name || '',
      email: user.email || '',
      phone: user.phone || '',
      matricule: user.matricule || '',
      job_title: user.job_title || '',
      entity_id: user.entity_id || '',
      departement_id: user.departement_id || '',
      role_id: user.role_id || '',
      project_id: user.project_id || '',
      superior_id: user.superior_id || '',
      child_id: user.child_id || '',
      is_ouvrier: user.is_ouvrier || 0,
      check_statut: user.check_statut || false
    });

    // Set selected roles from project_roles
    if (user.project_roles) {
      const allRoles = [];
      Object.values(user.project_roles).forEach(projectRole => {
        if (projectRole.roles && Array.isArray(projectRole.roles)) {
          allRoles.push(...projectRole.roles);
        }
      });
      console.log('Found roles:', allRoles); // Debug log
      setSelectedRoles(allRoles);
    } else {
      setSelectedRoles([]);
    }

    // Set selected project from projects array
    if (user.projects && user.projects.length > 0) {
      const project = user.projects[0];
      console.log('Found project:', project); // Debug log
      setSelectedProject(project);
    } else {
      setSelectedProject(null);
    }

    // Set superior from superior_info
    if (user.superior_info) {
      console.log('Found superior:', user.superior_info); // Debug log
      setNewSuperior(user.superior_info);
    } else {
      setNewSuperior(null);
    }

    // Set children from subordinates_info
    if (user.subordinates_info && Array.isArray(user.subordinates_info)) {
      console.log('Found subordinates:', user.subordinates_info); // Debug log
      setSelectedChildren(user.subordinates_info);
    } else {
      setSelectedChildren([]);
    }
  };

  const handleUpdate = (user) => {
    // Clear any existing errors
    setErrors({});
  

    // Set update mode and user data
    setIsUpdated(true);
    setUserToUpdate(user);
    console.log('User to update:', user); // Debug log
    // Initialize user data
    initializeUserData(user);

    // Open the modal
    const modal = document.getElementById('hs-add-user-modal');
    if (modal) {
      const HSOverlay = window.HSOverlay;
      if (HSOverlay) {
        HSOverlay.show();
      }
    }
  };

  // Add this function to handle the modal title
  const getModalTitle = () => {
    return isUpdated ? 'Modifier l\'Utilisateur' : 'Créer un Nouvel Utilisateur';
  };

  return (
    <Fragment>
      <Pageheader currentpage="Utilisateurs" activepage="Pages" mainpage="Utilisateurs" />
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
      <div className="grid grid-cols-12 gap-6">
        <div className="xl:col-span-12 col-span-12">
          <div className="box custom-box">
            <div className="box-header flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-gray-200 dark:border-gray-700 px-6 py-4">
              <div className="flex flex-col sm:flex-row items-center justify-between w-full gap-4">
                <div className="box-title text-xl font-semibold text-gray-800 dark:text-white">
                  Gestion des Utilisateurs
                </div>
                <div className="flex flex-col sm:flex-row items-center gap-4 w-full sm:w-auto">
                  <div className="relative w-full sm:w-64">
                    <div className="flex items-center gap-2">
                      <div className="relative flex-1">
                        <input
                          type="text"
                          placeholder="Search users..."
                          value={searchTerm}
                          onChange={handleSearchInputChange}
                          onKeyPress={handleKeyPress}
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
                        title="Search"
                      >
                        <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                        </svg>
                      </button>
                    </div>
                  </div>
                  <button
                    onClick={handleAddUser}
                    className="hs-dropdown-toggle ti-btn ti-btn-primary-full"
                    data-hs-overlay="#hs-add-user-modal"
                  >
                    Ajouter un Utilisateur
                  </button>
                  <button
                    onClick={handleImportClick}
                    className="ti-btn ti-btn-secondary-full"
                    type="button"
                    style={{ marginLeft: '8px' }}
                    disabled={isImporting}
                  >
                    Importer
                  </button>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept=".xlsx,.xls"
                    style={{ display: 'none' }}
                    onChange={handleFileChange}
                  />
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
                    <>
                      <div className="mb-4 flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <div className="flex items-center gap-2 px-4 py-2 bg-primary/10 text-primary rounded-lg">
                            <i className="ri-user-line text-xl"></i>
                            <span className="font-medium">Total Users:</span>
                            <span className="font-bold">{pagination.total}</span>
                          </div>
                        </div>
                      </div>
                      <div className="overflow-hidden rounded-lg border border-gray-200 dark:border-gray-700">
                        <div className="overflow-x-auto">
                          <table className="ti-custom-table ti-custom-table-head w-full text-sm">
                            <thead className="bg-gray-50 dark:bg-black/20">
                              <tr className="h-12">
                                <th scope="col" className="w-[200px] px-3 py-4">
                                  <div className="flex items-center gap-2 cursor-pointer hover:text-primary transition-colors group"
                                       onClick={() => handleSort('name')}>
                                    <span className="truncate">User Info</span>
                                    <div className="flex items-center">
                                      <svg className={`w-4 h-4 flex-shrink-0 transition-transform ${
                                        sortConfig.key === 'name' 
                                          ? 'text-primary ' + (sortConfig.direction === 'desc' ? 'transform rotate-180' : '')
                                          : 'text-gray-400 group-hover:text-primary'
                                      }`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 15l7-7 7 7" />
                                      </svg>
                                    </div>
                                  </div>
                                </th>
                                <th scope="col" className="w-[160px] px-3 py-4">
                                  <div className="flex items-center gap-2 cursor-pointer hover:text-primary transition-colors group"
                                       onClick={() => handleSort('email')}>
                                    <span className="truncate">Contact</span>
                                    <div className="flex items-center">
                                      <svg className={`w-4 h-4 flex-shrink-0 transition-transform ${
                                        sortConfig.key === 'email' 
                                          ? 'text-primary ' + (sortConfig.direction === 'desc' ? 'transform rotate-180' : '')
                                          : 'text-gray-400 group-hover:text-primary'
                                      }`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 15l7-7 7 7" />
                                      </svg>
                                    </div>
                                  </div>
                                </th>
                                <th scope="col" className="w-[160px] px-3 py-4">
                                  <div className="flex items-center gap-2 cursor-pointer hover:text-primary transition-colors group"
                                       onClick={() => handleSort('entity')}>
                                    <span className="truncate">Entity</span>
                                    <div className="flex items-center">
                                      <svg className={`w-4 h-4 flex-shrink-0 transition-transform ${
                                        sortConfig.key === 'entity' 
                                          ? 'text-primary ' + (sortConfig.direction === 'desc' ? 'transform rotate-180' : '')
                                          : 'text-gray-400 group-hover:text-primary'
                                      }`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 15l7-7 7 7" />
                                      </svg>
                                    </div>
                                  </div>
                                </th>
                                <th scope="col" className="w-[160px] px-3 py-4">
                                  <div className="flex items-center gap-2 cursor-pointer hover:text-primary transition-colors group"
                                       onClick={() => handleSort('superior_info')}>
                                    <span className="truncate">Superior Info</span>
                                    <div className="flex items-center">
                                      <svg className={`w-4 h-4 flex-shrink-0 transition-transform ${
                                        sortConfig.key === 'superior_info' 
                                          ? 'text-primary ' + (sortConfig.direction === 'desc' ? 'transform rotate-180' : '')
                                          : 'text-gray-400 group-hover:text-primary'
                                      }`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 15l7-7 7 7" />
                                      </svg>
                                    </div>
                                  </div>
                                </th>
                                <th scope="col" className="w-[120px] px-3 py-4 text-right">Actions</th>
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                              {users.length > 0 ? (
                                users.map((user) => (
                                  <tr key={user.id} className="hover:bg-gray-50 dark:hover:bg-black/20 h-16">
                                    <td className="w-[200px] px-3 py-4">
                                      <div className="flex items-center">
                                        <div className="flex-shrink-0">
                                          <div className="w-10 h-10 rounded-full bg-primary/10 text-primary flex items-center justify-center text-sm font-semibold">
                                            {(user.first_name || user.name || 'U')[0]?.toUpperCase() || ''}
                                          </div>
                                        </div>
                                        <div className="ml-3 min-w-0">
                                          <div className="text-sm font-medium text-gray-900 dark:text-white truncate" title={`${user.first_name} ${user.last_name}`}>
                                            {user.first_name && user.last_name 
                                              ? `${user.first_name} ${user.last_name}`
                                              : user.name}
                                          </div>
                                          {user.matricule && (
                                            <div className="text-sm text-gray-500 dark:text-gray-400 truncate" title={`ID: ${user.matricule}`}>
                                              ID: {user.matricule}
                                            </div>
                                          )}
                                        </div>
                                      </div>
                                    </td>
                                    <td className="w-[160px] px-3 py-4">
                                      <div className="text-sm text-gray-900 dark:text-white truncate" title={user.email}>
                                        {user.email}
                                      </div>
                                      {user.phone && (
                                        <div className="text-sm text-gray-500 dark:text-gray-400 truncate" title={user.phone}>
                                          {user.phone}
                                        </div>
                                      )}
                                      {user.job_title && (
                                        <div className="text-xs text-gray-500 dark:text-gray-400 truncate" title={user.job_title}>
                                          {user.job_title}
                                        </div>
                                      )}
                                    </td>
                                    <td className="w-[160px] px-3 py-4">
                                      {user.entity ? (
                                        <div className="text-sm text-gray-900 dark:text-white truncate max-w-[140px]" title={user.entity.name}>
                                          {user.entity.name}
                                        </div>
                                      ) : (
                                        <div className="text-sm text-gray-500 dark:text-gray-400">-</div>
                                      )}
                                    </td>
                                    <td className="w-[160px] px-3 py-4">
                                      {user.superior_info ? (
                                        <div className="min-w-0">
                                          <div className="text-sm text-gray-900 dark:text-white truncate" title={`${user.superior_info.first_name} ${user.superior_info.last_name}`}>
                                            {user.superior_info.first_name} {user.superior_info.last_name}
                                          </div>
                                          <div className="text-sm text-gray-500 dark:text-gray-400 truncate" title={`ID: ${user.superior_info.matricule}`}>
                                            ID: {user.superior_info.matricule}
                                          </div>
                                        </div>
                                      ) : (
                                        <div className="text-sm text-gray-500 dark:text-gray-400">-</div>
                                      )}
                                    </td>
                                    <td className="w-[120px] px-3 py-4 text-right text-sm font-medium">
                                      <div className="flex justify-end space-x-2">
                                        <button
                                          onClick={() => handleViewUser(user)}
                                          className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-full
                                              bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600
                                              transition-all duration-200 relative group"
                                              title="Voir les utilisateurs"
                                        >
                                        <i className="ri-eye-line text-base"></i>
                                        </button>
                                        <button
                                          onClick={() => handleUpdate(user)}
                                          className="ti-btn rounded-full bg-primary/10 text-primary hover:bg-primary hover:text-white focus:ring-primary/20 dark:bg-primary/20 dark:hover:bg-primary"
                                          title="Modifier l'utilisateur"
                                          data-hs-overlay="#hs-add-user-modal"
                                        >
                                          <span className="flex items-center gap-1">
                                                          <i className="ri-pencil-line"></i>
                                                        </span>
                                        </button>
                                        <button
                                          onClick={() => handleDelete(user)}
                                           className="ti-btn rounded-full bg-danger/10 text-danger hover:bg-danger hover:text-white focus:ring-danger/20 dark:bg-danger/20 dark:hover:bg-danger"
                                                        title="Supprimer l'utilisateur"
                                        >
                                           <span className="flex items-center gap-1">
                                                          <i className="ri-delete-bin-line"></i>
                                                        </span>
                                        </button>
                                      </div>
                                    </td>
                                  </tr>
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
                                        No Users Found
                                      </h3>
                                      <p className="text-base text-gray-500 dark:text-gray-400 text-center max-w-md">
                                        {searchTerm ? 'No results match your search.' : 'There are no users to display.'}
                                      </p>
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
              {users.length > 0 && (
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

      {/* Create/Edit Modal */}
      <div id="hs-add-user-modal" className="hs-overlay hidden ti-modal [--overlay-backdrop:static]">
        <div className="hs-overlay-open:mt-7 ti-modal-box mt-0 ease-out sm:w-[800px] !max-w-[800px] m-3 mx-auto h-[calc(100%-3.5rem)]">
          <div className="ti-modal-content h-full flex flex-col bg-white dark:bg-gray-800 shadow-xl rounded-xl">
            <div className="ti-modal-header sticky top-0 z-50 flex items-center justify-between border-b border-gray-200 dark:border-gray-700 px-6 py-4 bg-white dark:bg-gray-800">
              <div className="flex items-center space-x-3">
                <div className="h-10 w-10 flex items-center justify-center rounded-full bg-primary/10 text-primary">
                  <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                  </svg>
                </div>
                <h3 className="text-xl font-semibold text-gray-800 dark:text-white">
                  {getModalTitle()}
                </h3>
              </div>
              <button
                type="button"
                className="ti-modal-close-btn"
                data-hs-overlay="#hs-add-user-modal"
              >
                <span className="sr-only">Fermer</span>
                <svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="ti-modal-body px-6 py-4 overflow-y-auto flex-1">
              <form onSubmit={handleSubmit} className="space-y-6">
                {!selectedUser && (
                  <div className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
                      <div className="md:col-span-3 space-y-2">
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                          Prénom <span className="redStae font-bold">*</span>
                        </label>
                        <input
                          type="text"
                          name="first_name"
                          value={formData.first_name}
                          onChange={handleInputChange}
                          placeholder="Entrez le prénom"
                          className={`w-full px-4 border rounded-lg focus:ring-2 dark:bg-gray-700 dark:text-white transition-colors ${
                            errors.first_name ? `input-error ${document.documentElement.classList.contains('dark') ? 'dark' : ''}` : 'border-gray-300 dark:border-gray-600 focus:ring-primary focus:border-primary'
                          }`}
                          required
                        />
                        {renderError('first_name')}
                      </div>
                      <div className="md:col-span-3 space-y-2">
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                          Nom <span className="redStae font-bold">*</span>
                        </label>
                        <input
                          type="text"
                          name="last_name"
                          value={formData.last_name}
                          onChange={handleInputChange}
                          placeholder="Entrez le nom"
                          className={`w-full px-4 border rounded-lg focus:ring-2 dark:bg-gray-700 dark:text-white transition-colors ${
                            errors.last_name ? `input-error ${document.documentElement.classList.contains('dark') ? 'dark' : ''}` : 'border-gray-300 dark:border-gray-600 focus:ring-primary focus:border-primary'
                          }`}
                          required
                        />
                        {renderError('last_name')}
                      </div>
                      <div className="md:col-span-6 space-y-2">
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                          Email <span className="redStae font-bold">*</span>
                        </label>
                        <input
                          type="email"
                          name="email"
                          value={formData.email}
                          onChange={handleInputChange}
                          placeholder="Entrez l'email"
                          className={`w-full px-4 border rounded-lg focus:ring-2 dark:bg-gray-700 dark:text-white transition-colors ${
                            errors.email ? `input-error ${document.documentElement.classList.contains('dark') ? 'dark' : ''}` : 'border-gray-300 dark:border-gray-600 focus:ring-primary focus:border-primary'
                          }`}
                          required
                          disabled={isUpdated}
                        />
                        {renderError('email')}
                      </div>
                    </div>

                 

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                 
                      <div className="space-y-2">
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                          Matricule <span className="redStae font-bold">*</span>
                        </label>
                        <input
                          type="text"
                          name="matricule"
                          value={formData.matricule}
                          onChange={handleInputChange}
                          placeholder="Entrez le matricule (1-5 chiffres)"
                          maxLength="5"
                          pattern="[0-9]*"
                          inputMode="numeric"
                          className={`w-full px-4 border rounded-lg focus:ring-2 dark:bg-gray-700 dark:text-white transition-colors ${
                            errors.matricule ? `input-error ${document.documentElement.classList.contains('dark') ? 'dark' : ''}` : 'border-gray-300 dark:border-gray-600 focus:ring-primary focus:border-primary'
                          }`}
                          required
                        />
                        {renderError('matricule')}
                      </div>
                      <div className="space-y-3">
                      {!isUpdated && (
                        <>
                          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                            Mot de passe {!isUpdated && <span className="redStae font-bold">*</span>}
                          </label>
                          <div className="relative">
                            <input
                              type={showPassword ? "text" : "password"}
                              name="password"
                              value={formData.password}
                              onChange={handleInputChange}
                              placeholder={!isUpdated ? "Entrez le mot de passe" : "Laissez vide pour ne pas modifier"}
                              className={`w-full  px-4 border rounded-lg focus:ring-2 dark:bg-gray-700 dark:text-white transition-colors ${
                                errors.password ? `input-error ${document.documentElement.classList.contains('dark') ? 'dark' : ''}` : 'border-gray-300 dark:border-gray-600 focus:ring-primary focus:border-primary'
                              }`}
                              required={!isUpdated}
                              disabled={isUpdated}
                            />
                            {!isUpdated && (
                              <div className="absolute inset-y-0 right-0 flex items-center pr-2">
                                <button
                                  type="button"
                                  onClick={() => setShowPassword(!showPassword)}
                                  className="p-2 rounded-lg text-gray-500 hover:text-primary hover:bg-primary/5 dark:text-gray-400 dark:hover:text-primary dark:hover:bg-primary/10 transition-all duration-200 ease-in-out"
                                  title={showPassword ? "Masquer le mot de passe" : "Afficher le mot de passe"}
                                >
                                  {showPassword ? (
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.542 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                                    </svg>
                                  ) : (
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                    </svg>
                                  )}
                                </button>
                                <button
                                  type="button"
                                  onClick={generatePassword}
                                  className="p-2 rounded-lg text-gray-500 hover:text-primary hover:bg-primary/5 dark:text-gray-400 dark:hover:text-primary dark:hover:bg-primary/10 transition-all duration-200 ease-in-out ml-1"
                                  title="Générer un mot de passe sécurisé"
                                >
                                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                                  </svg>
                                </button>
                              </div>
                            )}
                          </div>
                        </>
                      )}
                      {!isUpdated && renderError('password')}
                    </div>
                     
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  
                    <div className="space-y-2">
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Téléphone</label>
                        <input
                          type="tel"
                          name="phone"
                          value={formData.phone}
                          onChange={handleInputChange}
                          placeholder="Entrez le numéro de téléphone (10 chiffres)"
                          maxLength="10"
                          pattern="[0-9]*"
                          inputMode="numeric"
                          className={`w-full px-4 border rounded-lg focus:ring-2 dark:bg-gray-700 dark:text-white transition-colors ${
                            errors.phone ? `input-error ${document.documentElement.classList.contains('dark') ? 'dark' : ''}` : 'border-gray-300 dark:border-gray-600 focus:ring-primary focus:border-primary'
                          }`}
                        />
                        {renderError('phone')}
                      </div>
                      <div className="space-y-2">
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                          Titre du poste
                        </label>
                        <input
                          type="text"
                          name="job_title"
                          value={formData.job_title}
                          onChange={handleInputChange}
                          placeholder="Entrez le titre du poste"
                          className="w-full px-4 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary dark:bg-gray-700 dark:text-white transition-colors"
                        />
                      </div>
                    
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {renderEntitySelect()}
                      {renderSuperiorSelect()}
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {renderRoleSelect()}
                    {renderChildSelect()}
                      <div></div>
                    </div>
                  </div>
                )}
              </form>
            </div>

            <div className="ti-modal-footer flex items-center justify-between gap-3 bg-gray-50 dark:bg-gray-700/50 px-6 py-4 border-t border-gray-200 dark:border-gray-700">
              <button
                type="button"
                className="ti-btn ti-btn-secondary-full align-middle"
                data-hs-overlay="#hs-add-user-modal"
              >
                Annuler
              </button>
              <button
                type="submit"
                onClick={handleSubmit}
                disabled={isSubmitting}
                className={`ti-btn ti-btn-primary-full align-middle ${isSubmitting ? 'opacity-50 cursor-wait' : ''}`}
              >
                {isSubmitting ? (
                  <span className="flex items-center">
                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    {isUpdated ? 'Modification...' : 'Création...'}
                  </span>
                ) : (
                  isUpdated ? 'Modifier' : 'Créer'
                )}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      <div id="hs-delete-user-modal" className="hs-overlay hidden ti-modal">
        <div className="hs-overlay-open:mt-7 ti-modal-box mt-0 ease-out">
          <div className="ti-modal-content">
            <div className="ti-modal-header">
              <h6 className="modal-title text-[1rem] font-semibold" id="delete-user-label">Confirmer la Suppression</h6>
              <button type="button" className="hs-dropdown-toggle !text-[1rem] !font-semibold !text-defaulttextcolor" data-hs-overlay="#hs-delete-user-modal">
                <span className="sr-only">Fermer</span>
                <i className="ri-close-line"></i>
              </button>
            </div>
            <div className="ti-modal-body px-4">
              <div className="flex items-center p-4 mb-4 text-red-800 bg-red-50 dark:bg-red-900/30 dark:text-red-300 rounded-lg">
                <i className="ri-information-line text-xl me-3"></i>
                <p>Êtes-vous sûr de vouloir supprimer {userToDelete?.name} ? Cette action ne peut pas être annulée.</p>
              </div>

              {isCheckingSubordinates ? (
                <div className="flex items-center justify-center p-4">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                  <span className="ml-2 text-gray-600 dark:text-gray-300">Vérification des subordonnés...</span>
                </div>
              ) : subordinates && subordinates.length > 0 ? (
                <div className="mt-4 space-y-4">
                  <div className="p-4 bg-red-50 dark:bg-red-900/30 rounded-lg border border-red-200 dark:border-red-800">
                    <div className="flex items-start">
                      <div className="flex-shrink-0 Attention-text">
                        <i className="ri-error-warning-line text-2xl text-red-600 dark:text-red-400 Attention-text"></i>
                      </div>
                      <div className="ml-3 w-full">
                        <h3 className="text-lg font-medium text-red-800 dark:text-red-300 mb-2 Attention-text">
                          Attention: Cet utilisateur a {subordinates.length} subordonné{subordinates.length > 1 ? 's' : ''}
                        </h3>
                       
                      </div>
                      
                    </div>
                    <div className="mt-3 bg-white dark:bg-gray-800 rounded-lg border border-red-100 dark:border-red-800/50">
                          <div className="p-3 border-b border-red-100 dark:border-red-800/50 bg-red-50 dark:bg-red-900/30 flex justify-center items-center">
                            <p className="text-sm font-medium text-red-700 dark:text-red-400">
                              Liste des subordonnés à réassigner:
                            </p>
                          </div>
                          <div className="divide-y divide-red-100 dark:divide-red-800/50 max-h-[300px] overflow-y-auto custom-scrollbar">
                            {subordinates.map((subordinate) => (
                              <div key={subordinate.id} className="p-3 hover:bg-gray-50 dark:hover:bg-gray-700/50">
                                <div className="flex items-center">
                                  <div className="flex-shrink-0 h-10 w-10 rounded-full bg-red-100 dark:bg-red-900/50 flex items-center justify-center">
                                    <span className="text-lg font-medium text-red-700 dark:text-red-300">
                                      {subordinate.first_name?.charAt(0).toUpperCase() || subordinate.name?.charAt(0).toUpperCase()}
                                    </span>
                                  </div>
                                  <div className="ml-3 flex-1">
                                    <div className="flex items-center justify-between">
                                      <div>
                                        <p className="text-sm font-medium text-gray-900 dark:text-white">
                                          {subordinate.first_name} {subordinate.last_name}
                                        </p>
                                        <div className="mt-1 flex items-center text-sm text-gray-500 dark:text-gray-400">
                                          {subordinate.matricule && (
                                            <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-300 mr-2">
                                              <i className="ri-user-card-line mr-1"></i>
                                              {subordinate.matricule}
                                            </span>
                                          )}
                                          <span className="inline-flex items-center">
                                            <i className="ri-mail-line mr-1"></i>
                                            {subordinate.email}
                                          </span>
                                        </div>
                                      </div>
                                      {subordinate.job_title && (
                                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 dark:bg-red-900/50 text-red-800 dark:text-red-300">
                                          <i className="ri-briefcase-line mr-1"></i>
                                          {subordinate.job_title}
                                        </span>
                                      )}
                                    </div>
                                  </div>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                  </div>

                  <div className="mt-4">
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Sélectionner un nouveau supérieur pour les subordonnés
                    </label>
                    <div className="relative">
                      <div className="relative">
                        <input
                          type="text"
                          placeholder={selectedNewSuperior ? `${selectedNewSuperior.first_name} ${selectedNewSuperior.last_name}` : "Rechercher un supérieur..."}
                          value={searchSuperiorTerm}
                          onChange={(e) => setSearchSuperiorTerm(e.target.value)}
                          className="w-full p-2.5 pl-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary dark:bg-gray-700 dark:border-gray-600 dark:text-white transition-all duration-200"
                        />
                        <i className="ri-search-line absolute left-3.5 top-1/2 transform -translate-y-1/2 text-gray-400"></i>
                        {(searchSuperiorTerm || selectedNewSuperior) && (
                          <button
                            onClick={() => {
                              setSearchSuperiorTerm('');
                              setSelectedNewSuperior(null);
                            }}
                            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                          >
                            <i className="ri-close-circle-line text-lg"></i>
                          </button>
                        )}
                      </div>
                      
                      <div className="mt-2 max-h-60 overflow-y-auto border border-gray-200 rounded-lg shadow-lg bg-white dark:bg-gray-700">
                        {superiors.filter(superior => 
                          superior.id !== userToDelete?.id && 
                          (
                            (superior.first_name?.toLowerCase() || '').includes(searchSuperiorTerm.toLowerCase()) ||
                            (superior.last_name?.toLowerCase() || '').includes(searchSuperiorTerm.toLowerCase()) ||
                            (superior.matricule?.toLowerCase() || '').includes(searchSuperiorTerm.toLowerCase()) ||
                            (superior.email?.toLowerCase() || '').includes(searchSuperiorTerm.toLowerCase())
                          )
                        ).length === 0 ? (
                          <div className="p-4 text-center text-gray-500 dark:text-gray-400">
                            Aucun supérieur trouvé
                          </div>
                        ) : (
                          superiors
                            .filter(superior => 
                              superior.id !== userToDelete?.id && 
                              (
                                (superior.first_name?.toLowerCase() || '').includes(searchSuperiorTerm.toLowerCase()) ||
                                (superior.last_name?.toLowerCase() || '').includes(searchSuperiorTerm.toLowerCase()) ||
                                (superior.matricule?.toLowerCase() || '').includes(searchSuperiorTerm.toLowerCase()) ||
                                (superior.email?.toLowerCase() || '').includes(searchSuperiorTerm.toLowerCase())
                              )
                            )
                            .map(superior => (
                              <div
                                key={superior.id}
                                onClick={() => {
                                  setSelectedNewSuperior(superior);
                                  setSearchSuperiorTerm('');
                                }}
                                className={`p-3 cursor-pointer transition-all duration-200 ${
                                  selectedNewSuperior?.id === superior.id 
                                    ? 'bg-primary/10 dark:bg-primary/20 border-l-4 border-primary' 
                                    : 'hover:bg-gray-50 dark:hover:bg-gray-600 border-l-4 border-transparent'
                                }`}
                              >
                                <div className="flex items-center">
                                  <div className="flex-shrink-0 h-10 w-10 rounded-full bg-gray-200 dark:bg-gray-600 flex items-center justify-center">
                                    <span className="text-lg font-medium text-gray-600 dark:text-gray-300">
                                      {superior.first_name?.charAt(0).toUpperCase() || superior.name?.charAt(0).toUpperCase()}
                                    </span>
                                  </div>
                                  <div className="ml-3">
                                    <div className="font-medium text-gray-900 dark:text-white">
                                      {superior.first_name} {superior.last_name}
                                    </div>
                                    <div className="text-sm text-gray-500 dark:text-gray-400">
                                      {superior.matricule && <span className="mr-2">Mat: {superior.matricule}</span>}
                                      {superior.email}
                                    </div>
                                  </div>
                                  {selectedNewSuperior?.id === superior.id && (
                                    <div className="ml-auto">
                                      <i className="ri-check-line text-primary text-xl"></i>
                                    </div>
                                  )}
                                </div>
                              </div>
                            ))
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ) : null}
            </div>
            <div className="ti-modal-footer">
              <button
                type="button"
                className="hs-dropdown-toggle ti-btn ti-btn-secondary-full align-middle"
                data-hs-overlay="#hs-delete-user-modal"
              >
                Annuler
              </button>
              <button
                type="button"
                className={`ti-btn ${
                  (isCheckingSubordinates || (subordinates && subordinates.length > 0 && !selectedNewSuperior))
                    ? 'bg-gray-300 cursor-not-allowed'
                    : 'bg-primary text-white !font-medium'
                }`}
                onClick={handleDeleteConfirm}
                disabled={isCheckingSubordinates || (subordinates && subordinates.length > 0 && !selectedNewSuperior)}
              >
                {isCheckingSubordinates ? (
                  <span className="flex items-center">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Vérification...
                  </span>
                ) : (
                  'Supprimer'
                )}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* View User Modal */}
      <div id="hs-view-user-modal" className="hs-overlay hidden ti-modal [--overlay-backdrop:static]">
        <div className="hs-overlay-open:mt-7 ti-modal-box mt-0 ease-out sm:w-[800px] !max-w-[800px] m-3 mx-auto h-[calc(100%-3.5rem)]">
          <div className="ti-modal-content h-full flex flex-col bg-white dark:bg-gray-800 shadow-xl rounded-xl">
            <div className="ti-modal-header sticky top-0 z-50 flex items-center justify-between border-b border-gray-200 dark:border-gray-700 px-6 py-4 bg-white dark:bg-gray-800">
              <div className="flex items-center space-x-3">
                <div className="h-10 w-10 flex items-center justify-center rounded-full bg-primary/10 text-primary">
                  <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                </div>
                <h3 className="text-xl font-semibold text-gray-800 dark:text-white">
                  Détails de l'Utilisateur
                </h3>
              </div>
              <button
                type="button"
                className="ti-modal-close-btn"
                data-hs-overlay="#hs-view-user-modal"
              >
                <span className="sr-only">Fermer</span>
                <svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="ti-modal-body px-6 py-4 overflow-y-auto flex-1">
              {selectedUserDetails && (
                <div className="space-y-6">
                  {/* User Avatar and Basic Info */}
                  <div className="flex items-center space-x-4">
                    <div className="h-16 w-16 rounded-full bg-primary/10 text-primary flex items-center justify-center text-2xl font-semibold">
                      {(selectedUserDetails.first_name || selectedUserDetails.name || 'U')[0]?.toUpperCase() || ''}
                    </div>
                    <div>
                      <h4 className="text-xl font-semibold text-gray-900 dark:text-white">
                        {selectedUserDetails.first_name && selectedUserDetails.last_name 
                          ? `${selectedUserDetails.first_name} ${selectedUserDetails.last_name}`
                          : selectedUserDetails.name}
                      </h4>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        {selectedUserDetails.job_title}
                      </p>
                    </div>
                  </div>

                  {/* User Details Grid */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Personal Information */}
                    <div className="bg-gray-50 dark:bg-gray-700/50 rounded-xl p-4">
                      <h5 className="text-sm font-medium text-gray-900 dark:text-white mb-3">Personal Information</h5>
                      <div className="space-y-3">
                        <div>
                          <label className="text-xs text-gray-500 dark:text-gray-400">Username</label>
                          <p className="text-sm text-gray-900 dark:text-white">{selectedUserDetails.name}</p>
                        </div>
                        <div>
                          <label className="text-xs text-gray-500 dark:text-gray-400">First Name</label>
                          <p className="text-sm text-gray-900 dark:text-white">{selectedUserDetails.first_name}</p>
                        </div>
                        <div>
                          <label className="text-xs text-gray-500 dark:text-gray-400">Last Name</label>
                          <p className="text-sm text-gray-900 dark:text-white">{selectedUserDetails.last_name}</p>
                        </div>
                        <div>
                          <label className="text-xs text-gray-500 dark:text-gray-400">Job Title</label>
                          <p className="text-sm text-gray-900 dark:text-white">{selectedUserDetails.job_title}</p>
                        </div>
                        <div>
                          <label className="text-xs text-gray-500 dark:text-gray-400">Matricule</label>
                          <p className="text-sm text-gray-900 dark:text-white">{selectedUserDetails.matricule || '-'}</p>
                        </div>
                      </div>
                    </div>

                    {/* Contact Information */}
                    <div className="bg-gray-50 dark:bg-gray-700/50 rounded-xl p-4">
                      <h5 className="text-sm font-medium text-gray-900 dark:text-white mb-3">Contact Information</h5>
                      <div className="space-y-3">
                        <div>
                          <label className="text-xs text-gray-500 dark:text-gray-400">Email</label>
                          <p className="text-sm text-gray-900 dark:text-white">{selectedUserDetails.email}</p>
                        </div>
                        <div>
                          <label className="text-xs text-gray-500 dark:text-gray-400">Phone</label>
                          <p className="text-sm text-gray-900 dark:text-white">{selectedUserDetails.phone || '-'}</p>
                        </div>
                        <div>
                          <label className="text-xs text-gray-500 dark:text-gray-400">User DN</label>
                          <p className="text-sm text-gray-900 dark:text-white break-all">{selectedUserDetails.user_dn || '-'}</p>
                        </div>
                      </div>
                    </div>

                    {/* Organization Information */}
                    <div className="bg-gray-50 dark:bg-gray-700/50 rounded-xl p-4">
                      <h5 className="text-sm font-medium text-gray-900 dark:text-white mb-3">Organization Information</h5>
                      <div className="space-y-3">
                        {selectedUserDetails.entity && (
                          <>
                            <div>
                              <label className="text-xs text-gray-500 dark:text-gray-400">Entity</label>
                              <p className="text-sm text-gray-900 dark:text-white">{selectedUserDetails.entity.name}</p>
                  </div>
                            <div>
                              <label className="text-xs text-gray-500 dark:text-gray-400">Entity Complete Name</label>
                              <p className="text-sm text-gray-900 dark:text-white">{selectedUserDetails.entity.completename}</p>
                            </div>
                            <div>
                              <label className="text-xs text-gray-500 dark:text-gray-400">Entity Level</label>
                              <p className="text-sm text-gray-900 dark:text-white">{selectedUserDetails.entity.level}</p>
                            </div>
                          </>
                        )}
                        {selectedUserDetails.departement && (
                          <div>
                            <label className="text-xs text-gray-500 dark:text-gray-400">Department</label>
                            <p className="text-sm text-gray-900 dark:text-white">{selectedUserDetails.departement.title}</p>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Role Information */}
                    <div className="bg-gray-50 dark:bg-gray-700/50 rounded-xl p-4">
                      <h5 className="text-sm font-medium text-gray-900 dark:text-white mb-3">Role Information</h5>
                      <div className="space-y-3">
                        {selectedUserDetails.roles && selectedUserDetails.roles.length > 0 && (
                          <div>
                            <label className="text-xs text-gray-500 dark:text-gray-400">Global Roles</label>
                            <div className="flex flex-wrap gap-2 mt-1">
                              {selectedUserDetails.roles.map((role, index) => (
                                <span key={index} className="px-2 py-1 bg-primary/10 text-primary rounded-md text-sm">
                                  {role}
                  </span>
                              ))}
                            </div>
                          </div>
                        )}
                        {Object.entries(selectedUserDetails.project_roles || {}).length > 0 && (
                          <div>
                            <label className="text-xs text-gray-500 dark:text-gray-400">Project Roles</label>
                            <div className="space-y-2 mt-1">
                              {Object.entries(selectedUserDetails.project_roles).map(([projectId, projectData]) => (
                                <div key={projectId} className="bg-white dark:bg-gray-800 rounded-lg p-2">
                                  <div className="font-medium text-gray-900 dark:text-white text-sm">
                                    {projectData.project_name}
                                  </div>
                                  <div className="flex flex-wrap gap-2 mt-1">
                                    {projectData.roles.map((role, index) => (
                                      <span key={index} className="px-2 py-1 bg-primary/10 text-primary rounded-md text-xs">
                                        {role.name}
                                      </span>
                                    ))}
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>

                  


                    {/* Superior Information */}
                    <div className="bg-gray-50 dark:bg-gray-700/50 rounded-xl p-4">
                      <h5 className="text-sm font-medium text-gray-900 dark:text-white mb-3">Superior Information</h5>
                      <div className="space-y-3">
                        {selectedUserDetails.superior_info ? (
                          <>
                            <div>
                              <label className="text-xs text-gray-500 dark:text-gray-400">Name</label>
                              <p className="text-sm text-gray-900 dark:text-white">
                                {selectedUserDetails.superior_info.first_name} {selectedUserDetails.superior_info.last_name}
                              </p>
                            </div>
                            <div>
                              <label className="text-xs text-gray-500 dark:text-gray-400">Matricule</label>
                              <p className="text-sm text-gray-900 dark:text-white">
                                {selectedUserDetails.superior_info.matricule}
                              </p>
                            </div>
                            <div>
                              <label className="text-xs text-gray-500 dark:text-gray-400">Job Title</label>
                              <p className="text-sm text-gray-900 dark:text-white">
                                {selectedUserDetails.superior_info.job_title}
                              </p>
                            </div>
                            <div>
                              <label className="text-xs text-gray-500 dark:text-gray-400">Email</label>
                              <p className="text-sm text-gray-900 dark:text-white">
                                {selectedUserDetails.superior_info.email}
                              </p>
                            </div>
                            <div>
                              <label className="text-xs text-gray-500 dark:text-gray-400">Entity</label>
                              <p className="text-sm text-gray-900 dark:text-white">
                                {selectedUserDetails.superior_info.entity?.name}
                              </p>
                            </div>
                            {selectedUserDetails.superior_info.roles && selectedUserDetails.superior_info.roles.length > 0 && (
                              <div>
                                <label className="text-xs text-gray-500 dark:text-gray-400">Roles</label>
                                <div className="flex flex-wrap gap-2 mt-1">
                                  {selectedUserDetails.superior_info.roles.map((role, index) => (
                                    <span key={index} className="px-2 py-1 bg-primary/10 text-primary rounded-md text-sm">
                                      {role.name}
                                    </span>
                                  ))}
                                </div>
                              </div>
                            )}
                </>
              ) : (
                          <p className="text-sm text-gray-500 dark:text-gray-400">No superior assigned</p>
              )}
            </div>
                    </div>

                    {/* Additional Information */}
                    <div className="bg-gray-50 dark:bg-gray-700/50 rounded-xl p-4">
                      <h5 className="text-sm font-medium text-gray-900 dark:text-white mb-3">Additional Information</h5>
                      <div className="space-y-3">
                        <div>
                          <label className="text-xs text-gray-500 dark:text-gray-400">Created At</label>
                          <p className="text-sm text-gray-900 dark:text-white">
                            {new Date(selectedUserDetails.created_at).toLocaleString()}
                          </p>
                        </div>
                        <div>
                          <label className="text-xs text-gray-500 dark:text-gray-400">Updated At</label>
                          <p className="text-sm text-gray-900 dark:text-white">
                            {selectedUserDetails.updated_at ? new Date(selectedUserDetails.updated_at).toLocaleString() : '-'}
                          </p>
                        </div>
                        <div>
                          <label className="text-xs text-gray-500 dark:text-gray-400">Status</label>
                          <p className="text-sm text-gray-900 dark:text-white">
                            {selectedUserDetails.check_statut ? 'Active' : 'Inactive'}
                          </p>
                        </div>
                        <div>
                          <label className="text-xs text-gray-500 dark:text-gray-400">Worker Status</label>
                          <p className="text-sm text-gray-900 dark:text-white">
                            {selectedUserDetails.is_ouvrier ? 'Worker' : 'Non-Worker'}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>

            <div className="ti-modal-footer flex items-center justify-end gap-3 bg-gray-50 dark:bg-gray-700/50 px-6 py-4 border-t border-gray-200 dark:border-gray-700">
              <button
                type="button"
                className="ti-btn ti-btn-secondary-full align-middle"
                data-hs-overlay="#hs-view-user-modal"
              >
                Fermer
          </button>
        </div>
          </div>
        </div>
      </div>

      {isImporting && (
        <div className="fixed inset-0 z-[9999999] flex items-center justify-center bg-black bg-opacity-50">
          <div className="flex flex-col items-center">
            <div className="animate-spin rounded-full h-16 w-16 border-4 border-primary border-t-transparent mb-4"></div>
            <span className="text-white text-lg font-semibold">Importation en cours, veuillez patienter...</span>
          </div>
        </div>
      )}
    </Fragment>
  );
};

export default Users;
