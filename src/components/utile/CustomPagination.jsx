import React from 'react';

const pageButtonBase = "relative inline-flex items-center justify-center min-w-[2.5rem] h-10 mx-0.5 text-sm font-semibold transition-all duration-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:ring-offset-1";
const pageButtonInactive = "text-gray-900 bg-gray-100 hover:bg-gray-200 dark:text-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700 dark:hover:text-white";
const pageButtonActive = "bg-primary text-white shadow-md hover:bg-primary/90 transform scale-110";
const navButtonBase = "relative inline-flex items-center justify-center w-10 h-10 rounded-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:ring-offset-1";
const navButtonEnabled = "text-gray-700 bg-gray-100 hover:bg-gray-200 hover:text-primary dark:bg-gray-800 dark:text-gray-400 dark:hover:bg-gray-700 dark:hover:text-white";
const navButtonDisabled = "text-gray-400 bg-gray-100 cursor-not-allowed dark:bg-gray-800 dark:text-gray-600";

/**
 * CustomPagination - A reusable pagination component with pagination-style-1 styling
 * 
 * @param {Object} props - Component props
 * @param {number} props.current - Current page number
 * @param {number} props.total - Total number of items
 * @param {number} props.perPage - Number of items per page
 * @param {number} props.lastPage - Last page number
 * @param {Function} props.onPageChange - Function to call when page changes
 * @param {string} [props.className] - Additional CSS classes
 * @returns {JSX.Element} - Renders the pagination component
 */
const CustomPagination = ({ 
  current, 
  total, 
  perPage, 
  lastPage, 
  onPageChange,
  className = '' 
}) => {
  // Ensure current is a number and valid
  const currentPage = parseInt(current) || 1;
  const totalPages = parseInt(lastPage) || 1;
  const itemsPerPage = parseInt(perPage) || 10;
  const totalItems = parseInt(total) || 0;
  
  const from = totalItems > 0 ? (currentPage - 1) * itemsPerPage + 1 : 0;
  const to = Math.min(currentPage * itemsPerPage, totalItems);

  const handlePageChange = (page) => {
    // Scroll to top smoothly
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
    // Call the original onPageChange
    onPageChange(page);
  };

  if (totalItems <= 0) return null;

  const renderPageButtons = () => {
    const buttons = [];
    
    // First page button
    buttons.push(
      <button
        key={1}
        onClick={() => handlePageChange(1)}
        className={`${pageButtonBase} ${currentPage === 1 ? pageButtonActive : pageButtonInactive}`}
      >
        1
      </button>
    );
    
    let startPage = Math.max(2, currentPage - 1);
    let endPage = Math.min(totalPages - 1, currentPage + 1);
    
    if (currentPage <= 3) {
      endPage = Math.min(4, totalPages - 1);
    }
    if (currentPage >= totalPages - 2) {
      startPage = Math.max(totalPages - 3, 2);
    }
    
    if (startPage > 2) {
      buttons.push(
        <span key="ellipsis-start" className="relative inline-flex items-center justify-center min-w-[2.5rem] h-10 mx-0.5 text-sm font-medium text-gray-500 dark:text-gray-400">
          •••
        </span>
      );
    }
    
    for (let i = startPage; i <= endPage; i++) {
      buttons.push(
        <button
          key={i}
          onClick={() => handlePageChange(i)}
          className={`${pageButtonBase} ${currentPage === i ? pageButtonActive : pageButtonInactive}`}
        >
          {i}
        </button>
      );
    }
    
    if (endPage < totalPages - 1) {
      buttons.push(
        <span key="ellipsis-end" className="relative inline-flex items-center justify-center min-w-[2.5rem] h-10 mx-0.5 text-sm font-medium text-gray-500 dark:text-gray-400">
          •••
        </span>
      );
    }
    
    if (totalPages > 1) {
      buttons.push(
        <button
          key={totalPages}
          onClick={() => handlePageChange(totalPages)}
          className={`${pageButtonBase} ${currentPage === totalPages ? pageButtonActive : pageButtonInactive}`}
        >
          {totalPages}
        </button>
      );
    }
    
    return buttons;
  };

  return (
    <div className={`flex flex-col sm:flex-row items-center justify-between gap-6 ${className}`}>
      <div className="text-sm">
        <p className="text-gray-700 dark:text-gray-300">
          Affichage{' '}
          <span className="font-medium text-gray-900 dark:text-white">{from} - {to}</span>
          {' '}sur{' '}
          <span className="font-medium text-gray-900 dark:text-white">{totalItems}</span>
          {' '}résultats
        </p>
      </div>
      
      <nav className="flex items-center gap-2 p-2 bg-white dark:bg-gray-900 rounded-xl shadow-sm" aria-label="Pagination">
        <button
          onClick={() => currentPage > 1 && handlePageChange(currentPage - 1)}
          disabled={currentPage === 1}
          className={`${navButtonBase} ${currentPage === 1 ? navButtonDisabled : navButtonEnabled}`}
        >
          <span className="sr-only">Précédent</span>
          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" clipRule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" />
          </svg>
        </button>
        
        <div className="flex items-center">
          {renderPageButtons()}
        </div>
        
        <button
          onClick={() => currentPage < totalPages && handlePageChange(currentPage + 1)}
          disabled={currentPage === totalPages}
          className={`${navButtonBase} ${currentPage === totalPages ? navButtonDisabled : navButtonEnabled}`}
        >
          <span className="sr-only">Suivant</span>
          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" clipRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" />
          </svg>
        </button>
      </nav>
    </div>
  );
};

export default CustomPagination;