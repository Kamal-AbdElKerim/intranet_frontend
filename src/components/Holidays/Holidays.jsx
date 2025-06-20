import React, { useState, useEffect } from 'react';
import axiosInstance from '../../Interceptor/axiosInstance';
import { format, parseISO, isAfter, isBefore, addYears } from 'date-fns';
import ToastService from '../utile/toastService';

const Holidays = ({ onClose }) => {
  const [holidays, setHolidays] = useState([]);
  const [newHoliday, setNewHoliday] = useState({ date: '', description: '' });
  const [editingHoliday, setEditingHoliday] = useState(null);
  const [loading, setLoading] = useState(false);
  const [actionLoading, setActionLoading] = useState({
    save: false,
    delete: null,
    validate: false,
    duplicate: null
  });
  const [error, setError] = useState('');
  const [validation, setValidation] = useState({
    date: '',
    description: ''
  });
  const [sorting, setSorting] = useState({
    field: 'date',
    direction: 'asc'
  });
  const [deleteModal, setDeleteModal] = useState({
    isOpen: false,
    holiday: null
  });
  const [duplicateModal, setDuplicateModal] = useState({
    isOpen: false,
    sourceYear: null,
    targetYear: new Date().getFullYear() + 1
  });

  useEffect(() => {
    fetchHolidays();
  }, []);

  // Group holidays by year
  const groupHolidaysByYear = (holidays) => {
    const grouped = {};
    holidays.forEach(holiday => {
      const year = new Date(holiday.date).getFullYear();
      if (!grouped[year]) {
        grouped[year] = [];
      }
      grouped[year].push(holiday);
    });
    // Sort years in descending order
    return Object.entries(grouped)
      .sort(([yearA], [yearB]) => yearB - yearA)
      .map(([year, holidays]) => ({
        year: parseInt(year),
        holidays: holidays.sort((a, b) => {
          if (sorting.field === 'date') {
            const dateA = new Date(a.date);
            const dateB = new Date(b.date);
            return sorting.direction === 'asc' ? dateA - dateB : dateB - dateA;
          } else if (sorting.field === 'description') {
            const descA = a.description.toLowerCase();
            const descB = b.description.toLowerCase();
            return sorting.direction === 'asc' 
              ? descA.localeCompare(descB)
              : descB.localeCompare(descA);
          }
          return 0;
        })
      }));
  };

  const toggleSort = (field) => {
    setSorting(prev => ({
      field,
      direction: prev.field === field && prev.direction === 'asc' ? 'desc' : 'asc'
    }));
  };

  const SortIcon = ({ field }) => (
    <i className={`ti ti-arrow-${sorting.direction === 'asc' ? 'up' : 'down'} 
      ${sorting.field === field ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'} 
      transition-opacity`}
    />
  );

  const validateForm = () => {
    const newValidation = {
      date: '',
      description: ''
    };

    // Date required validation
    if (!newHoliday.date) {
      newValidation.date = 'La date est requise';
    }

    // Description validation
    if (!newHoliday.description) {
      newValidation.description = 'La description est requise';
    } else if (newHoliday.description.length < 3) {
      newValidation.description = 'La description doit comporter au moins 3 caractères';
    } else if (newHoliday.description.length > 100) {
      newValidation.description = 'La description ne doit pas dépasser 100 caractères';
    }

    // Check for duplicate date
    if (newHoliday.date) {
      const holidayDate = new Date(newHoliday.date);
      const existingHoliday = holidays.find(
        h => h.date === format(holidayDate, 'yyyy-MM-dd') && 
        (!editingHoliday || h.id !== editingHoliday.id)
      );
      if (existingHoliday) {
        newValidation.date = 'Cette date a déjà un jour férié';
      }
    }

    setValidation(newValidation);
    return !newValidation.date && !newValidation.description;
  };

  const fetchHolidays = async () => {
    try {
      setLoading(true);
      const response = await axiosInstance.get('/holidays');
      if (response.data.success) {
        const formattedHolidays = response.data.data.map(holiday => ({
          ...holiday,
          date: format(parseISO(holiday.date), 'yyyy-MM-dd')
        }));
        setHolidays(formattedHolidays);
        setValidation('');
      }
    } catch (error) {
      ToastService.error('Failed to fetch holidays. Please try again.');
      console.error('Error fetching holidays:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validate all fields on submit
    if (!validateForm()) {
      return;
    }

    try {
      setActionLoading({ ...actionLoading, save: true });
      const formattedDate = format(new Date(newHoliday.date), 'yyyy-MM-dd');
      const holidayData = {
        ...newHoliday,
        date: formattedDate
      };

      if (editingHoliday) {
        await axiosInstance.put(`/holidays/${editingHoliday.id}`, holidayData);
        ToastService.success('Vacances mises à jour avec succès!');
      } else {
        await axiosInstance.post('/holidays', holidayData);
        ToastService.success('Jour férié ajouté avec succès!');
      }
      setNewHoliday({ date: '', description: '' });
      setEditingHoliday(null);
      setValidation({ date: '', description: '' });
      fetchHolidays();
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'Échec de l\'enregistrement des vacances. Veuillez réessayer.';
      ToastService.error(errorMessage);
      console.error('Error saving holiday:', error);
    } finally {
      setActionLoading({ ...actionLoading, save: false });
    }
  };

  // Clear validation messages when starting to edit
  const handleInputChange = (field, value) => {
    setNewHoliday(prev => ({ ...prev, [field]: value }));
    setValidation(prev => ({ ...prev, [field]: '' }));
  };

  const handleDelete = async (id) => {
    try {
      setActionLoading({ ...actionLoading, delete: id });
      await axiosInstance.delete(`/holidays/${id}`);
      ToastService.success('Holiday deleted successfully!');
      setDeleteModal({ isOpen: false, holiday: null });
      fetchHolidays();
    } catch (error) {
      ToastService.error('Failed to delete holiday. Please try again.');
      console.error('Error deleting holiday:', error);
    } finally {
      setActionLoading({ ...actionLoading, delete: null });
    }
  };

  const handleEdit = (holiday) => {
    setEditingHoliday(holiday);
    setNewHoliday({
      date: holiday.date,
      description: holiday.description
    });
    ToastService.info('Editing holiday - make your changes and click Update');
  };

  const openDeleteModal = (holiday) => {
    setDeleteModal({ isOpen: true, holiday });
  };

  const handleDuplicateYear = async (sourceYear) => {
    try {
      setActionLoading(prev => ({ ...prev, duplicate: sourceYear }));
      
      // Get holidays for the source year
      const sourceHolidays = holidays.filter(h => new Date(h.date).getFullYear() === sourceYear);
      
      // Create new holidays for target year
      const targetYear = duplicateModal.targetYear;
      const duplicatePromises = sourceHolidays.map(holiday => {
        const originalDate = new Date(holiday.date);
        const newDate = addYears(originalDate, targetYear - sourceYear);
        
        return axiosInstance.post('/holidays', {
          date: format(newDate, 'yyyy-MM-dd'),
          description: holiday.description
        });
      });

      await Promise.all(duplicatePromises);
      
      ToastService.success(`Vacances de ${sourceYear} dupliquées avec succès pour ${targetYear}`);
      setDuplicateModal({ isOpen: false, sourceYear: null, targetYear: new Date().getFullYear() + 1 });
      fetchHolidays();
    } catch (error) {
      ToastService.error('Échec de la duplication des vacances. Veuillez réessayer.');
      console.error('Error duplicating holidays:', error);
    } finally {
      setActionLoading(prev => ({ ...prev, duplicate: null }));
    }
  };

  return (
    <div className="p-6 bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-4xl w-full mx-auto">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-800 dark:text-white">Gérer les jours fériés</h2>
        <button
          onClick={onClose}
          className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 transition-colors"
        >
          <i className="ti ti-x text-xl"></i>
        </button>
      </div>

      {error && (
        <div className="mb-4 bg-red-100/80 dark:bg-red-900/30 backdrop-blur-sm border-l-4 border-red-500 rounded-r-xl p-4">
          <div className="flex">
            <div className="flex-shrink-0">
              <i className="ti ti-alert-circle text-xs text-rose-500 dark:text-rose-400 text-xl animate-pulse"></i>
            </div>
            <div className="ml-3">
              <h3 className="text-red-800 dark:text-red-200 font-medium">Error</h3>
              <div className="mt-1 text-red-700 dark:text-red-300 text-sm">{error}</div>
            </div>
          </div>
        </div>
      )}

      <form onSubmit={handleSubmit} className="mb-8 space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Date <span className="text-xs text-rose-500">*</span>
            </label>
            <div className="relative">
              <input
                type="date"
                value={newHoliday.date}
                onChange={(e) => handleInputChange('date', e.target.value)}
                className={`w-full px-3 py-2 border rounded-md shadow-sm transition-all duration-200 bg-white dark:bg-gray-700
                  ${validation.date 
                    ? 'border-red-300 ring-1 ring-red-300 bg-red-50 dark:bg-red-900/30 placeholder-red-300 focus:border-red-500 focus:ring-red-500' 
                    : 'border-gray-300 dark:border-gray-600 focus:border-primary focus:ring-1 focus:ring-primary dark:text-white'
                  }`}
              />
              {validation.date && (
                <div className="mt-2 flex items-center space-x-2 text-red-600 bg-red-50 dark:bg-red-900/30 px-3 py-2 rounded-md border border-red-200 dark:border-red-800">
                  <i className="ti ti-alert-circle text-lg"></i>
                  <span className="text-sm font-medium text-xs text-rose-500 dark:text-rose-400">{validation.date}</span>
                </div>
              )}
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Description <span className="text-xs text-rose-500">*</span>
            </label>
            <div className="relative">
              <input
                type="text"
                placeholder="Description du jour férié"
                value={newHoliday.description}
                onChange={(e) => handleInputChange('description', e.target.value)}
                className={`w-full px-3 py-2 border rounded-md shadow-sm transition-all duration-200 bg-white dark:bg-gray-700
                  ${validation.description 
                    ? 'border-red-300 ring-1 ring-red-300 bg-red-50 dark:bg-red-900/30 placeholder-red-300 focus:border-red-500 focus:ring-red-500' 
                    : 'border-gray-300 dark:border-gray-600 focus:border-primary focus:ring-1 focus:ring-primary dark:text-white'
                  }`}
              />
              {validation.description && (
                <div className="mt-2 flex items-center space-x-2 text-red-600 bg-red-50 dark:bg-red-900/30 px-3 py-2 rounded-md border border-red-200 dark:border-red-800">
                  <i className="ti ti-alert-circle text-lg"></i>
                  <span className="text-sm font-medium text-xs text-rose-500 dark:text-rose-400">{validation.description}</span>
                </div>
              )}
            </div>
          </div>
        </div>
        <div className="flex flex-col md:flex-row gap-4 mt-6">
          <button
            type="submit"
            disabled={actionLoading.save || !!validation.date || !!validation.description}
            className={`w-full md:w-auto px-6 py-2.5 rounded-lg font-medium transition-all duration-200 flex items-center justify-center space-x-2
              ${actionLoading.save || !!validation.date || !!validation.description
                ? 'bg-gray-400 dark:bg-gray-600 cursor-not-allowed opacity-60'
                : 'bg-primary hover:bg-primary/90 active:bg-primary/95 shadow-lg shadow-primary/30 hover:-translate-y-0.5'
              }`}
          >
            {actionLoading.save && (
              <i className="ti ti-loader animate-spin"></i>
            )}
            <span className="text-white">
              {actionLoading.save
                ? 'Saving...'
                : editingHoliday
                ? 'Mise à jour des vacances'
                : 'Ajouter un jour férié'}
            </span>
          </button>
          {editingHoliday && (
            <button
              type="button"
              onClick={() => {
                setNewHoliday({ date: '', description: '' });
                setEditingHoliday(null);
                setValidation({ date: '', description: '' });
              }}
              className="w-full md:w-auto px-6 py-2.5 rounded-lg font-medium transition-all duration-200 flex items-center justify-center space-x-2 bg-gray-200 hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-200"
            >
              <span>Annuler</span>
            </button>
          )}
        </div>
      </form>

      <div className="relative">
        <div className="absolute inset-x-0 top-0 h-10 bg-gradient-to-b from-white dark:from-gray-800 to-transparent pointer-events-none z-10"></div>
        <div className="absolute inset-x-0 bottom-0 h-10 bg-gradient-to-t from-white dark:from-gray-800 to-transparent pointer-events-none z-10"></div>

        <div className="overflow-hidden rounded-lg border border-gray-200 dark:border-gray-700">
          <div className="overflow-x-auto">
            <div className="max-h-[300px] overflow-y-auto scrollbar-thin scrollbar-thumb-gray-300 dark:scrollbar-thumb-gray-600 scrollbar-track-gray-100 dark:scrollbar-track-gray-800">
              <div className="hs-accordion-group divide-y divide-gray-200 dark:divide-gray-700">
                {groupHolidaysByYear(holidays).map(({ year, holidays }) => (
                  <div key={year} className="hs-accordion active bg-white dark:bg-gray-800" id={`hs-accordion-heading-${year}`}>
                    <button
                      className="hs-accordion-toggle hs-accordion-active:text-secondary hs-accordion-active:bg-secondary/10 group py-4 px-5 inline-flex items-center justify-between gap-x-3 w-full font-semibold text-start text-gray-800 dark:text-gray-200 transition hover:text-gray-500 dark:hover:text-gray-300 dark:hs-accordion-active:text-secondary h-[56px]"
                      aria-controls={`accordion-year-${year}`}
                      type="button"
                    >
                      <span>Vacances {year}</span>
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            setDuplicateModal({ isOpen: true, sourceYear: year, targetYear: new Date().getFullYear() + 1 });
                          }}
                          className="ti-btn ti-btn-ghost-success !py-1 !px-2 text-xs"
                          disabled={actionLoading.duplicate === year}
                        >
                          {actionLoading.duplicate === year ? (
                            <i className="ti ti-loader animate-spin text-sm"></i>
                          ) : (
                            <><i className="ti ti-copy text-sm mr-1"></i>Dupliquer</>
                          )}
                        </button>
                        <svg
                          className="hs-accordion-active:hidden hs-accordion-active:text-secondary hs-accordion-active:group-hover:text-secondary block w-3 h-3 text-gray-600 group-hover:text-gray-500 dark:text-gray-400"
                          width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                          <path d="M2 5L8.16086 10.6869C8.35239 10.8637 8.64761 10.8637 8.83914 10.6869L15 5"
                            stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                        </svg>
                        <svg
                          className="hs-accordion-active:block hs-accordion-active:text-secondary hs-accordion-active:group-hover:text-secondary hidden w-3 h-3 text-gray-600 group-hover:text-gray-500 dark:text-gray-400"
                          width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                          <path d="M2 11L8.16086 5.31305C8.35239 5.13625 8.64761 5.13625 8.83914 5.31305L15 11"
                            stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                        </svg>
                      </div>
                    </button>
                    <div id={`accordion-year-${year}`}
                      className="hs-accordion-content w-full overflow-hidden transition-[height] duration-300"
                      aria-labelledby={`hs-accordion-heading-${year}`}
                    >
                      <div className="p-5">
                        <div className="overflow-x-auto rounded-lg border border-gray-200 dark:border-gray-700">
                          <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                            <thead className="bg-gray-50 dark:bg-gray-700">
                              <tr>
                                <th 
                                  scope="col" 
                                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider cursor-pointer group"
                                  onClick={() => toggleSort('date')}
                                >
                                  <div className="flex items-center space-x-1">
                                    <span>Date</span>
                                    <SortIcon field="date" />
                                  </div>
                                </th>
                                <th 
                                  scope="col" 
                                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider cursor-pointer group"
                                  onClick={() => toggleSort('description')}
                                >
                                  <div className="flex items-center space-x-1">
                                    <span>Description</span>
                                    <SortIcon field="description" />
                                  </div>
                                </th>
                                <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Actions</th>
                              </tr>
                            </thead>
                            <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                              {holidays.map((holiday) => (
                                <tr key={holiday.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-300">
                                    {format(new Date(holiday.date), 'MMM dd, yyyy')}
                                  </td>
                                  <td className="px-6 py-4 text-sm text-gray-900 dark:text-gray-300">
                                    {holiday.description}
                                  </td>
                                  <td className="px-6 py-4 text-right space-x-4 whitespace-nowrap">
                                    <button
                                      onClick={() => handleEdit(holiday)}
                                      className="text-secondary dark:text-secondary-400 hover:text-secondary-700 dark:hover:text-secondary-300 transition-colors"
                                      disabled={actionLoading.delete === holiday.id}
                                    >
                                      <i className="ti ti-edit text-lg"></i>
                                    </button>
                                    {!editingHoliday && (
                                      <button
                                        onClick={() => openDeleteModal(holiday)}
                                        className="text-red-600 dark:text-red-400 hover:text-red-900 dark:hover:text-red-300 transition-colors"
                                        disabled={actionLoading.delete === holiday.id}
                                      >
                                        {actionLoading.delete === holiday.id ? (
                                          <i className="ti ti-loader animate-spin text-lg"></i>
                                        ) : (
                                          <i className="ti ti-trash text-lg"></i>
                                        )}
                                      </button>
                                    )}
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {!loading && holidays.length === 0 && (
                <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                  No holidays found
                </div>
              )}
            </div>
          </div>
        </div>

        {loading && (
          <div className="absolute inset-0 flex items-center justify-center bg-white/80 dark:bg-gray-800/80 z-30">
            <div className="flex items-center space-x-2">
              <i className="ti ti-loader animate-spin text-2xl text-primary"></i>
              <span className="text-gray-600 dark:text-gray-300">Loading...</span>
            </div>
          </div>
        )}
      </div>

      {/* Delete Confirmation Modal */}
      {deleteModal.isOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex min-h-full items-end justify-center p-4 text-center sm:items-center sm:p-0">
            <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" onClick={() => setDeleteModal({ isOpen: false, holiday: null })}></div>

            <div className="relative transform overflow-hidden rounded-lg bg-white dark:bg-gray-800 text-left shadow-xl transition-all sm:my-8 sm:w-full sm:max-w-lg">
              <div className="bg-white dark:bg-gray-800 px-4 pb-4 pt-5 sm:p-6 sm:pb-4">
                <div className="sm:flex sm:items-start">
                  <div className="mx-auto flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full bg-red-100 dark:bg-red-900 sm:mx-0 sm:h-10 sm:w-10">
                    <i className="ti ti-alert-triangle text-red-600 dark:text-red-400 text-lg"></i>
                  </div>
                  <div className="mt-3 text-center sm:ml-4 sm:mt-0 sm:text-left">
                    <h3 className="text-base font-semibold leading-6 text-gray-900 dark:text-gray-100">
                      Confirmer la suppression
                    </h3>
                    <div className="mt-2">
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        Êtes-vous sûr de vouloir supprimer ce jour férié ? Cette action ne peut pas être annulée.
                      </p>
                      {deleteModal.holiday && (
                        <div className="mt-2 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                          <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
                            Date: {format(new Date(deleteModal.holiday.date), 'MMM dd, yyyy')}
                          </p>
                          <p className="text-sm text-gray-600 dark:text-gray-400">
                            Description: {deleteModal.holiday.description}
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
              <div className="bg-gray-50 dark:bg-gray-700/50 px-4 py-3 sm:flex sm:flex-row-reverse sm:px-6">
                <button
                  type="button"
                  className="ti-btn ti-btn-danger-gradient !rounded-md px-3 py-2 text-sm font-semibold text-white shadow-lg shadow-danger/30 hover:-translate-y-0.5 transition-all duration-200 sm:ml-3 sm:w-auto disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:translate-y-0"
                  onClick={() => handleDelete(deleteModal.holiday.id)}
                  disabled={actionLoading.delete === deleteModal.holiday?.id}
                >
                  {actionLoading.delete === deleteModal.holiday?.id ? (
                    <><i className="ti ti-loader animate-spin mr-2"></i>Suppression...</>
                  ) : (
                    <>
                      <i className="ti ti-trash text-sm mr-1"></i>
                      Supprimer
                    </>
                  )}
                </button>
                <button
                  type="button"
                  className="ti-btn ti-btn-ghost-secondary mt-3 inline-flex w-full justify-center rounded-md px-3 py-2 text-sm font-semibold shadow-sm hover:bg-gray-100 dark:hover:bg-gray-600 sm:mt-0 sm:w-auto"
                  onClick={() => setDeleteModal({ isOpen: false, holiday: null })}
                >
                  <i className="ti ti-x text-sm mr-1"></i>
                  Annuler
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Duplicate Year Modal */}
      {duplicateModal.isOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex min-h-full items-end justify-center p-4 text-center sm:items-center sm:p-0">
            <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" 
              onClick={() => setDuplicateModal({ isOpen: false, sourceYear: null, targetYear: new Date().getFullYear() + 1 })}
            ></div>

            <div className="relative transform overflow-hidden rounded-lg bg-white dark:bg-gray-800 text-left shadow-xl transition-all sm:my-8 sm:w-full sm:max-w-lg">
              <div className="bg-white dark:bg-gray-800 px-4 pb-4 pt-5 sm:p-6 sm:pb-4">
                <div className="sm:flex sm:items-start">
                  <div className="mx-auto flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full bg-green-100 dark:bg-green-900 sm:mx-0 sm:h-10 sm:w-10">
                    <i className="ti ti-copy text-green-600 dark:text-green-400 text-lg"></i>
                  </div>
                  <div className="mt-3 text-center sm:ml-4 sm:mt-0 sm:text-left">
                    <h3 className="text-base font-semibold leading-6 text-gray-900 dark:text-gray-100">
                      Dupliquer les vacances
                    </h3>
                    <div className="mt-2">
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        Vous êtes sur le point de dupliquer toutes les vacances de l'année {duplicateModal.sourceYear}.
                      </p>
                      <div className="mt-4">
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                          Année cible
                        </label>
                        <input
                          type="number"
                          value={duplicateModal.targetYear}
                          onChange={(e) => setDuplicateModal(prev => ({ ...prev, targetYear: parseInt(e.target.value) }))}
                          className="block w-full px-3 py-2 border rounded-md shadow-sm focus:ring-1 focus:ring-primary focus:border-primary dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                          min={new Date().getFullYear()}
                          max={new Date().getFullYear() + 10}
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              <div className="bg-gray-50 dark:bg-gray-700/50 px-4 py-3 sm:flex sm:flex-row-reverse sm:px-6">
                <button
                  type="button"
                  className="ti-btn ti-btn-success-gradient !rounded-md px-3 py-2 text-sm font-semibold text-white shadow-lg shadow-success/30 hover:-translate-y-0.5 transition-all duration-200 sm:ml-3 sm:w-auto disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:translate-y-0"
                  onClick={() => handleDuplicateYear(duplicateModal.sourceYear)}
                  disabled={actionLoading.duplicate === duplicateModal.sourceYear}
                >
                  {actionLoading.duplicate === duplicateModal.sourceYear ? (
                    <><i className="ti ti-loader animate-spin mr-2"></i>Duplication...</>
                  ) : (
                    <>
                      <i className="ti ti-copy text-sm mr-1"></i>
                      Dupliquer
                    </>
                  )}
                </button>
                <button
                  type="button"
                  className="ti-btn ti-btn-ghost-secondary mt-3 inline-flex w-full justify-center rounded-md px-3 py-2 text-sm font-semibold shadow-sm hover:bg-gray-100 dark:hover:bg-gray-600 sm:mt-0 sm:w-auto"
                  onClick={() => setDuplicateModal({ isOpen: false, sourceYear: null, targetYear: new Date().getFullYear() + 1 })}
                >
                  <i className="ti ti-x text-sm mr-1"></i>
                  Annuler
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Holidays;