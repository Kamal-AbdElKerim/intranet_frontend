'use client';

import React, { memo, useCallback } from 'react';
import { debounce } from 'lodash';

const TableFilters = memo(({
  searchTerm,
  handleSearch,
  handleSearchSubmit,
  typeFilter,
  setTypeFilter,
  entityFilter,
  handleEntityFilter,
  statusFilter,
  setStatusFilter,
  userFilter,
  handleUserFilter,
  activeTab,
  typeOptions,
  statusOptions,
  entities,
  users,
  showEntityDropdown,
  setShowEntityDropdown,
  entitySearchTerm,
  setEntitySearchTerm,
  entityDropdownRef,
  showUserDropdown,
  setShowUserDropdown,
  userSearchTerm,
  setUserSearchTerm,
  userDropdownRef
}) => {
  // Add debounced search handler
  const debouncedSearch = useCallback(
    debounce((value) => {
      handleSearch(value);
      handleSearchSubmit();
    }, 500),
    [handleSearch, handleSearchSubmit]
  );

  // Handle type filter change
  const handleTypeChange = (e) => {
    const value = e.target.value;
    setTypeFilter(value);
  };

  // Handle status filter change
  const handleStatusChange = (e) => {
    const value = e.target.value;
    setStatusFilter(value);
  };

  return (
    <div className="flex flex-wrap items-center gap-3">
      {/* Search Input */}
      {/* <div className="flex-1 min-w-[200px]">
        <div className="relative">
          <input
            type="text"
            className="ti-form-input pe-11"
            placeholder="Rechercher..."
            value={searchTerm}
            onChange={(e) => handleSearch(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                handleSearchSubmit();
              }
            }}
          />
          <button
            className="absolute inset-y-0 end-0 flex items-center px-4 text-gray-600 dark:text-gray-400"
            onClick={handleSearchSubmit}
          >
            <i className="ri-search-line text-lg"></i>
          </button>
        </div>
      </div> */}

      {/* Type Filter */}
      <div className="min-w-[150px]">
        <select
          className="ti-form-select"
          value={typeFilter}
          onChange={(e) => setTypeFilter(e.target.value)}
        >
          {typeOptions.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      </div>

      {/* Status Filter */}
      <div className="min-w-[150px]">
        <select
          className="ti-form-select"
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
        >
          {statusOptions.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      </div>

      {/* Entity Filter */}
      <div className="min-w-[200px] relative" ref={entityDropdownRef}>
        <button
          type="button"
          className="ti-form-select text-start flex items-center justify-between w-full"
          onClick={() => setShowEntityDropdown(!showEntityDropdown)}
        >
          <span className="block truncate">
            {entities.find(e => e.value === entityFilter)?.label || 'Toutes les entités'}
          </span>
          <i className={`ri-arrow-down-s-line ms-2 transition-transform ${showEntityDropdown ? 'rotate-180' : ''}`}></i>
        </button>
        {showEntityDropdown && (
          <div className="absolute z-10 w-full mt-1 bg-white dark:bg-gray-800 shadow-lg max-h-60 rounded-lg border border-gray-200 dark:border-gray-700">
            <div className="p-2">
              <input
                type="text"
                className="ti-form-input"
                placeholder="Rechercher une entité..."
                value={entitySearchTerm}
                onChange={(e) => setEntitySearchTerm(e.target.value)}
              />
            </div>
            <ul className="py-2 overflow-y-auto max-h-40 custom-scrollbar">
              {entities
                .filter(entity =>
                  entity.label.toLowerCase().includes(entitySearchTerm.toLowerCase())
                )
                .map((entity) => (
                  <li key={entity.value}>
                    <button
                      type="button"
                      className={`w-full px-4 py-2 text-start hover:bg-gray-100 dark:hover:bg-gray-700 ${
                        entityFilter === entity.value
                          ? 'bg-primary/5 text-primary dark:bg-primary/10'
                          : ''
                      }`}
                      onClick={() => handleEntityFilter(entity.value)}
                    >
                      {entity.label}
                    </button>
                  </li>
                ))}
            </ul>
          </div>
        )}
      </div>

      {/* User Filter */}
      <div className="min-w-[200px] relative" ref={userDropdownRef}>
        <button
          type="button"
          className="ti-form-select text-start flex items-center justify-between w-full"
          onClick={() => setShowUserDropdown(!showUserDropdown)}
        >
          <span className="block truncate">
            {users.find(u => u.value === userFilter)?.label || 'Tous les utilisateurs'}
          </span>
          <i className={`ri-arrow-down-s-line ms-2 transition-transform ${showUserDropdown ? 'rotate-180' : ''}`}></i>
        </button>
        {showUserDropdown && (
          <div className="absolute z-10 w-full mt-1 bg-white dark:bg-gray-800 shadow-lg max-h-60 rounded-lg border border-gray-200 dark:border-gray-700">
            <div className="p-2">
              <input
                type="text"
                className="ti-form-input"
                placeholder="Rechercher un utilisateur..."
                value={userSearchTerm}
                onChange={(e) => setUserSearchTerm(e.target.value)}
              />
            </div>
            <ul className="py-2 overflow-y-auto max-h-40 custom-scrollbar">
              {users
                .filter(user =>
                  user.label.toLowerCase().includes(userSearchTerm.toLowerCase())
                )
                .map((user) => (
                  <li key={user.value}>
                    <button
                      type="button"
                      className={`w-full px-4 py-2 text-start hover:bg-gray-100 dark:hover:bg-gray-700 ${
                        userFilter === user.value
                          ? 'bg-primary/5 text-primary dark:bg-primary/10'
                          : ''
                      }`}
                      onClick={() => handleUserFilter(user.value)}
                    >
                      {user.label}
                    </button>
                  </li>
                ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
});

TableFilters.displayName = 'TableFilters';

export default TableFilters; 