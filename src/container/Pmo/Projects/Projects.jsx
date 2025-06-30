import { Fragment, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import ToastService from '../../../components/utile/toastService';
import axiosInstance from '../../../Interceptor/axiosInstance';
import { ToastContainer } from 'react-toastify';
import Pageheader from '../../../components/common/pageheader/pageheader.jsx';
import CustomPagination from '../../../components/utile/CustomPagination.jsx';
import LoadingLogo from '../../../components/utile/LoadingLogo.jsx';
import '../../../styles/table.css';
import '../../../styles/error.css';
import * as XLSX from 'xlsx';
import jsPDF from 'jspdf';
import 'jspdf-autotable';
import Select from 'react-select';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';

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
  
  /* React Select Custom Styles */
  .react-select-container .react-select__control {
    border: 2px solid #e5e7eb;
    border-radius: 12px;
    min-height: 48px;
    background: white;
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
    transition: all 0.3s ease;
  }
  
  .react-select-container .react-select__control:hover {
    border-color: #3b82f6;
    box-shadow: 0 4px 12px rgba(59, 130, 246, 0.15);
    transform: translateY(-1px);
  }
  
  .react-select-container .react-select__control--is-focused {
    border-color: #3b82f6;
    box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1), 0 4px 12px rgba(59, 130, 246, 0.15);
  }
  
  .react-select-container .react-select__control--is-focused:hover {
    border-color: #2563eb;
  }
  
  .dark .react-select-container .react-select__control {
    background: #374151;
    border-color: #4b5563;
  }
  
  .dark .react-select-container .react-select__control:hover {
    border-color: #60a5fa;
    box-shadow: 0 4px 12px rgba(96, 165, 250, 0.15);
  }
  
  .dark .react-select-container .react-select__control--is-focused {
    border-color: #60a5fa;
    box-shadow: 0 0 0 3px rgba(96, 165, 250, 0.1), 0 4px 12px rgba(96, 165, 250, 0.15);
  }
  
  .react-select-container .react-select__placeholder {
    color: #9ca3af;
    font-size: 14px;
    font-weight: 500;
  }
  
  .dark .react-select-container .react-select__placeholder {
    color: #6b7280;
  }
  
  .react-select-container .react-select__single-value {
    color: #374151;
    font-size: 14px;
    font-weight: 500;
  }
  
  .dark .react-select-container .react-select__single-value {
    color: #f9fafb;
  }
  
  .react-select-container .react-select__input-container {
    color: #374151;
    font-size: 14px;
    font-weight: 500;
  }
  
  .dark .react-select-container .react-select__input-container {
    color: #f9fafb;
  }
  
  .react-select-container .react-select__menu {
    border: 2px solid #e5e7eb;
    border-radius: 12px;
    box-shadow: 0 10px 25px rgba(0, 0, 0, 0.15);
    background: white;
    overflow: hidden;
  }
  
  .dark .react-select-container .react-select__menu {
    background: #374151;
    border-color: #4b5563;
  }
  
  .react-select-container .react-select__option {
    padding: 12px 16px;
    font-size: 14px;
    font-weight: 500;
    color: #374151;
    background: white;
    cursor: pointer;
    transition: all 0.2s ease;
  }
  
  .react-select-container .react-select__option:hover {
    background: #f3f4f6;
  }
  
  .react-select-container .react-select__option--is-focused {
    background: #eff6ff;
    color: #1d4ed8;
  }
  
  .react-select-container .react-select__option--is-selected {
    background: #3b82f6;
    color: white;
  }
  
  .dark .react-select-container .react-select__option {
    background: #374151;
    color: #f9fafb;
  }
  
  .dark .react-select-container .react-select__option:hover {
    background: #4b5563;
  }
  
  .dark .react-select-container .react-select__option--is-focused {
    background: #1e3a8a;
    color: #60a5fa;
  }
  
  .dark .react-select-container .react-select__option--is-selected {
    background: #3b82f6;
    color: white;
  }
  
  .react-select-container .react-select__multi-value {
    background: #eff6ff;
    border: 1px solid #bfdbfe;
    border-radius: 8px;
    margin: 2px;
  }
  
  .dark .react-select-container .react-select__multi-value {
    background: #1e3a8a;
    border-color: #3b82f6;
  }
  
  .react-select-container .react-select__multi-value__label {
    color: #1d4ed8;
    font-size: 12px;
    font-weight: 500;
    padding: 4px 8px;
  }
  
  .dark .react-select-container .react-select__multi-value__label {
    color: #60a5fa;
  }
  
  .react-select-container .react-select__multi-value__remove {
    color: #1d4ed8;
    padding: 4px 6px;
    border-radius: 0 8px 8px 0;
  }
  
  .react-select-container .react-select__multi-value__remove:hover {
    background: #dbeafe;
    color: #1e40af;
  }
  
  .dark .react-select-container .react-select__multi-value__remove {
    color: #60a5fa;
  }
  
  .dark .react-select-container .react-select__multi-value__remove:hover {
    background: #1e40af;
    color: #93c5fd;
  }
  
  /* DatePicker Custom Styles */
  .react-datepicker-wrapper {
    width: 100%;
  }
  
  .react-datepicker__input-container input {
    width: 100%;
    padding: 12px 16px;
    border: 2px solid #e5e7eb;
    border-radius: 12px;
    font-size: 14px;
    font-weight: 500;
    color: #374151;
    background: white;
    transition: all 0.3s ease;
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  }
  
  .react-datepicker__input-container input:hover {
    border-color: #3b82f6;
    box-shadow: 0 4px 12px rgba(59, 130, 246, 0.15);
    transform: translateY(-1px);
  }
  
  .react-datepicker__input-container input:focus {
    outline: none;
    border-color: #3b82f6;
    box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1), 0 4px 12px rgba(59, 130, 246, 0.15);
  }
  
  .dark .react-datepicker__input-container input {
    background: #374151;
    border-color: #4b5563;
    color: #f9fafb;
  }
  
  .dark .react-datepicker__input-container input:hover {
    border-color: #60a5fa;
    box-shadow: 0 4px 12px rgba(96, 165, 250, 0.15);
  }
  
  .dark .react-datepicker__input-container input:focus {
    border-color: #60a5fa;
    box-shadow: 0 0 0 3px rgba(96, 165, 250, 0.1), 0 4px 12px rgba(96, 165, 250, 0.15);
  }
  
  .react-datepicker {
    border: 2px solid #e5e7eb;
    border-radius: 12px;
    box-shadow: 0 10px 25px rgba(0, 0, 0, 0.15);
    background: white;
    font-family: inherit;
  }
  
  .dark .react-datepicker {
    background: #374151;
    border-color: #4b5563;
    color: #f9fafb;
  }
  
  .react-datepicker__header {
    background: #f8fafc;
    border-bottom: 1px solid #e5e7eb;
    border-radius: 10px 10px 0 0;
  }
  
  .dark .react-datepicker__header {
    background: #4b5563;
    border-color: #6b7280;
  }
  
  .react-datepicker__current-month {
    color: #374151;
    font-weight: 600;
    font-size: 16px;
  }
  
  .dark .react-datepicker__current-month {
    color: #f9fafb;
  }
  
  .react-datepicker__day-name {
    color: #6b7280;
    font-weight: 500;
  }
  
  .dark .react-datepicker__day-name {
    color: #9ca3af;
  }
  
  .react-datepicker__day {
    color: #374151;
    border-radius: 8px;
    margin: 2px;
    transition: all 0.2s ease;
  }
  
  .react-datepicker__day:hover {
    background: #eff6ff;
    color: #1d4ed8;
  }
  
  .react-datepicker__day--selected {
    background: #3b82f6;
    color: white;
  }
  
  .react-datepicker__day--keyboard-selected {
    background: #eff6ff;
    color: #1d4ed8;
  }
  
  .dark .react-datepicker__day {
    color: #f9fafb;
  }
  
  .dark .react-datepicker__day:hover {
    background: #1e3a8a;
    color: #60a5fa;
  }
  
  .dark .react-datepicker__day--selected {
    background: #3b82f6;
    color: white;
  }
  
  .dark .react-datepicker__day--keyboard-selected {
    background: #1e3a8a;
    color: #60a5fa;
  }
  
  .react-datepicker__navigation {
    border: none;
    background: transparent;
    color: #6b7280;
    transition: all 0.2s ease;
  }
  
  .react-datepicker__navigation:hover {
    color: #3b82f6;
    background: #eff6ff;
    border-radius: 8px;
  }
  
  .dark .react-datepicker__navigation {
    color: #9ca3af;
  }
  
  .dark .react-datepicker__navigation:hover {
    color: #60a5fa;
    background: #1e3a8a;
  }
  
  .react-datepicker__year-dropdown,
  .react-datepicker__month-dropdown {
    background: white;
    border: 2px solid #e5e7eb;
    border-radius: 8px;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  }
  
  .dark .react-datepicker__year-dropdown,
  .dark .react-datepicker__month-dropdown {
    background: #374151;
    border-color: #4b5563;
  }
  
  .react-datepicker__year-option,
  .react-datepicker__month-option {
    color: #374151;
    padding: 8px 12px;
    transition: all 0.2s ease;
  }
  
  .react-datepicker__year-option:hover,
  .react-datepicker__month-option:hover {
    background: #eff6ff;
    color: #1d4ed8;
  }
  
  .dark .react-datepicker__year-option,
  .dark .react-datepicker__month-option {
    color: #f9fafb;
  }
  
  .dark .react-datepicker__year-option:hover,
  .dark .react-datepicker__month-option:hover {
    background: #1e3a8a;
    color: #60a5fa;
  }
  
  /* Project View Modal Custom Styles */
  .project-view-modal {
    position: fixed;
    inset: 0;
    z-index: 9999;
    display: flex;
    align-items: center;
    justify-content: center;
    background: rgba(0, 0, 0, 0.6);
    backdrop-filter: blur(4px);
    padding: 1rem;
  }
  
  .project-view-modal-content {
    background: white;
    border-radius: 1rem;
    box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
    width: 100%;
    max-width: 48rem;
    max-height: 95vh;
    display: flex;
    flex-direction: column;
    overflow: hidden;
  }
  
  .dark .project-view-modal-content {
    background: #1f2937;
  }
  
  .project-view-modal-header {
    background: linear-gradient(135deg, #3b82f6 0%, #6366f1 50%, #8b5cf6 100%);
    padding: 1.5rem 2rem;
    border-radius: 1rem 1rem 0 0;
    position: relative;
    flex-shrink: 0;
  }
  
  .project-view-modal-header-icon {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 3.5rem;
    height: 3.5rem;
    background: rgba(255, 255, 255, 0.2);
    border-radius: 0.75rem;
    backdrop-filter: blur(4px);
    border: 1px solid rgba(255, 255, 255, 0.3);
  }
  
  .project-view-modal-header-title {
    font-size: 1.5rem;
    font-weight: 700;
    margin-bottom: 0.25rem;
    color: white;
  }
  
  .project-view-modal-header-subtitle {
    font-size: 0.875rem;
    font-weight: 500;
    color: #dbeafe;
  }
  
  .project-view-modal-close {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 3rem;
    height: 3rem;
    background: rgba(255, 255, 255, 0.2);
    border-radius: 0.75rem;
    transition: all 0.2s ease;
    backdrop-filter: blur(4px);
    border: 1px solid rgba(255, 255, 255, 0.3);
    color: white;
    cursor: pointer;
  }
  
  .project-view-modal-close:hover {
    background: rgba(255, 255, 255, 0.3);
    transform: scale(1.1);
  }
  
  .project-view-modal-body {
    padding: 2rem;
    overflow-y: auto;
    flex: 1;
  }
  
  .project-view-section {
    background: linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%);
    border-radius: 0.75rem;
    padding: 1.5rem;
    border: 1px solid #e2e8f0;
    margin-bottom: 2rem;
  }
  
  .dark .project-view-section {
    background: linear-gradient(135deg, #374151 0%, #4b5563 100%);
    border-color: #4b5563;
  }
  
  .project-view-section-header {
    display: flex;
    align-items: center;
    gap: 0.75rem;
    margin-bottom: 1rem;
  }
  
  .project-view-section-icon {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 2.5rem;
    height: 2.5rem;
    border-radius: 0.5rem;
    font-size: 1.125rem;
  }
  
  .project-view-section-title {
    font-size: 1.125rem;
    font-weight: 600;
    color: #1f2937;
  }
  
  .dark .project-view-section-title {
    color: #f9fafb;
  }
  
  .project-view-section-blue .project-view-section-icon {
    background: #dbeafe;
    color: #1d4ed8;
  }
  
  .project-view-section-green .project-view-section-icon {
    background: #dcfce7;
    color: #15803d;
  }
  
  .project-view-section-purple .project-view-section-icon {
    background: #f3e8ff;
    color: #7c3aed;
  }
  
  .project-view-section-indigo .project-view-section-icon {
    background: #e0e7ff;
    color: #4338ca;
  }
  
  .project-view-section-gray .project-view-section-icon {
    background: #f3f4f6;
    color: #374151;
  }
  
  .dark .project-view-section-gray .project-view-section-icon {
    background: #4b5563;
    color: #9ca3af;
  }
  
  .project-view-grid {
    display: grid;
    grid-template-columns: 1fr;
    gap: 1rem;
  }
  
  @media (min-width: 768px) {
    .project-view-grid {
      grid-template-columns: 1fr 1fr;
    }
  }
  
  .project-view-field {
    display: flex;
    flex-direction: column;
    gap: 0.25rem;
  }
  
  .project-view-field-full {
    grid-column: 1 / -1;
  }
  
  .project-view-label {
    font-weight: 600;
    color: #374151;
    font-size: 0.875rem;
  }
  
  .dark .project-view-label {
    color: #d1d5db;
  }
  
  .project-view-value {
    color: #1f2937;
    font-size: 0.875rem;
    line-height: 1.25rem;
  }
  
  .dark .project-view-value {
    color: #f9fafb;
  }
  
  /* Create/Edit Project Modal Custom Styles */
  .project-form-modal {
    position: fixed;
    inset: 0;
    z-index: 9999;
    display: flex;
    align-items: center;
    justify-content: center;
    background: rgba(0, 0, 0, 0.6);
    backdrop-filter: blur(4px);
    padding: 1rem;
  }
  
  .project-form-modal-content {
    background: white;
    border-radius: 1rem;
    box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
    width: 100%;
    max-width: 64rem;
    max-height: 95vh;
    display: flex;
    flex-direction: column;
    overflow: hidden;
  }
  
  .dark .project-form-modal-content {
    background: #1f2937;
  }
  
  .project-form-modal-header {
    background: linear-gradient(135deg, #596f91cf 0%, #464779db 50%, #b3aac8 100%);
    padding: 1.5rem 2rem;
    border-radius: 1rem 1rem 0 0;
    position: relative;
    flex-shrink: 0;
  }
  
  .project-form-modal-header-icon {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 3.5rem;
    height: 3.5rem;
    background: rgba(255, 255, 255, 0.2);
    border-radius: 0.75rem;
    backdrop-filter: blur(4px);
    border: 1px solid rgba(255, 255, 255, 0.3);
  }
  
  .project-form-modal-header-title {
    font-size: 1.5rem;
    font-weight: 700;
    margin-bottom: 0.25rem;
    color: white;
  }
  
  .project-form-modal-header-subtitle {
    font-size: 0.875rem;
    font-weight: 500;
    color: #dbeafe;
  }
  
  .project-form-modal-close {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 3rem;
    height: 3rem;
    background: rgba(255, 255, 255, 0.2);
    border-radius: 0.75rem;
    transition: all 0.2s ease;
    backdrop-filter: blur(4px);
    border: 1px solid rgba(255, 255, 255, 0.3);
    color: white;
    cursor: pointer;
  }
  
  .project-form-modal-close:hover {
    background: rgba(255, 255, 255, 0.3);
    transform: scale(1.1);
  }
  
  .project-form-modal-body {
    padding: 2rem;
    overflow-y: auto;
    flex: 1;
  }
  
  .project-form-modal-footer {
    background: linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%);
    padding: 1.5rem 2rem;
    border-top: 1px solid #e2e8f0;
    flex-shrink: 0;
  }
  
  .dark .project-form-modal-footer {
    background: linear-gradient(135deg, #374151 0%, #4b5563 100%);
    border-color: #4b5563;
  }
  
  .project-form-section {
    background: linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%);
    border-radius: 0.75rem;
    padding: 1.5rem;
    border: 1px solid #e2e8f0;
    margin-bottom: 1.5rem;
  }
  
  .dark .project-form-section {
    background: linear-gradient(135deg, #374151 0%, #4b5563 100%);
    border-color: #4b5563;
  }
  
  .project-form-section-header {
    display: flex;
    align-items: center;
    gap: 0.75rem;
    margin-bottom: 1rem;
  }
  
  .project-form-section-icon {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 2.5rem;
    height: 2.5rem;
    border-radius: 0.5rem;
    font-size: 1.125rem;
  }
  
  .project-form-section-title {
    font-size: 1.125rem;
    font-weight: 600;
    color: #1f2937;
  }
  
  .dark .project-form-section-title {
    color: #f9fafb;
  }
  
  .project-form-section-subtitle {
    font-size: 0.875rem;
    color: #6b7280;
    margin-top: 0.25rem;
  }
  
  .dark .project-form-section-subtitle {
    color: #9ca3af;
  }
  
  .project-form-section-blue .project-form-section-icon {
    background: #dbeafe;
    color: #1d4ed8;
  }
  
  .project-form-section-green .project-form-section-icon {
    background: #dcfce7;
    color: #15803d;
  }
  
  .project-form-section-purple .project-form-section-icon {
    background: #f3e8ff;
    color: #7c3aed;
  }
  
  .project-form-section-orange .project-form-section-icon {
    background: #fed7aa;
    color: #ea580c;
  }
  
  .project-form-section-cyan .project-form-section-icon {
    background: #cffafe;
    color: #0891b2;
  }
  
  .project-form-section-indigo .project-form-section-icon {
    background: #e0e7ff;
    color: #4338ca;
  }
  
  .project-form-section-gray .project-form-section-icon {
    background: #f3f4f6;
    color: #374151;
  }
  
  .dark .project-form-section-gray .project-form-section-icon {
    background: #4b5563;
    color: #9ca3af;
  }
  
  .project-form-grid {
    display: grid;
    grid-template-columns: 1fr;
    gap: 1rem;
  }
  
  @media (min-width: 768px) {
    .project-form-grid {
      grid-template-columns: 1fr 1fr;
    }
  }
  
  @media (min-width: 1024px) {
    .project-form-grid {
      grid-template-columns: 1fr 1fr 1fr;
    }
  }
  
  .project-form-field {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
  }
  
  .project-form-field-full {
    grid-column: 1 / -1;
  }
  
  .project-form-label {
    font-weight: 600;
    color: #374151;
    font-size: 0.875rem;
  }
  
  .dark .project-form-label {
    color: #d1d5db;
  }
  
  .project-form-input {
    width: 100%;
    padding: 0.75rem 1rem;
    border: 2px solid #e5e7eb;
    border-radius: 0.75rem;
    font-size: 0.875rem;
    font-weight: 500;
    color: #374151;
    background: white;
    transition: all 0.3s ease;
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  }
  
  .project-form-input:hover {
    border-color: #3b82f6;
    box-shadow: 0 4px 12px rgba(59, 130, 246, 0.15);
    transform: translateY(-1px);
  }
  
  .project-form-input:focus {
    outline: none;
    border-color: #3b82f6;
    box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1), 0 4px 12px rgba(59, 130, 246, 0.15);
  }
  
  .dark .project-form-input {
    background: #374151;
    border-color: #4b5563;
    color: #f9fafb;
  }
  
  .dark .project-form-input:hover {
    border-color: #60a5fa;
    box-shadow: 0 4px 12px rgba(96, 165, 250, 0.15);
  }
  
  .dark .project-form-input:focus {
    border-color: #60a5fa;
    box-shadow: 0 0 0 3px rgba(96, 165, 250, 0.1), 0 4px 12px rgba(96, 165, 250, 0.15);
  }
  
  .project-form-textarea {
    width: 100%;
    padding: 0.75rem 1rem;
    border: 2px solid #e5e7eb;
    border-radius: 0.75rem;
    font-size: 0.875rem;
    font-weight: 500;
    color: #374151;
    background: white;
    transition: all 0.3s ease;
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
    resize: none;
    min-height: 6rem;
  }
  
  .project-form-textarea:hover {
    border-color: #3b82f6;
    box-shadow: 0 4px 12px rgba(59, 130, 246, 0.15);
    transform: translateY(-1px);
  }
  
  .project-form-textarea:focus {
    outline: none;
    border-color: #3b82f6;
    box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1), 0 4px 12px rgba(59, 130, 246, 0.15);
  }
  
  .dark .project-form-textarea {
    background: #374151;
    border-color: #4b5563;
    color: #f9fafb;
  }
  
  .dark .project-form-textarea:hover {
    border-color: #60a5fa;
    box-shadow: 0 4px 12px rgba(96, 165, 250, 0.15);
  }
  
  .dark .project-form-textarea:focus {
    border-color: #60a5fa;
    box-shadow: 0 0 0 3px rgba(96, 165, 250, 0.1), 0 4px 12px rgba(96, 165, 250, 0.15);
  }
  
  .project-form-checkbox {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    padding: 0.5rem;
    border-radius: 0.5rem;
    transition: all 0.2s ease;
  }
  
  .project-form-checkbox:hover {
    background: rgba(59, 130, 246, 0.05);
  }
  
  .dark .project-form-checkbox:hover {
    background: rgba(96, 165, 250, 0.1);
  }
  
  .project-form-checkbox input[type="checkbox"] {
    width: 1.25rem;
    height: 1.25rem;
    border: 2px solid #e5e7eb;
    border-radius: 0.25rem;
    background: white;
    cursor: pointer;
    transition: all 0.2s ease;
  }
  
  .project-form-checkbox input[type="checkbox"]:checked {
    background: #3b82f6;
    border-color: #3b82f6;
  }
  
  .dark .project-form-checkbox input[type="checkbox"] {
    background: #374151;
    border-color: #4b5563;
  }
  
  .dark .project-form-checkbox input[type="checkbox"]:checked {
    background: #60a5fa;
    border-color: #60a5fa;
  }
  
  .project-form-error {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    color: #dc2626;
    font-size: 0.75rem;
    margin-top: 0.25rem;
  }
  
  .dark .project-form-error {
    color: #f87171;
  }
  
  .project-form-error-icon {
    font-size: 0.875rem;
  }
  
  .project-form-required {
    color: #dc2626;
    font-weight: 600;
  }
  
  .dark .project-form-required {
    color: #f87171;
  }
  .custom-select.project-type-select select { border-color: #8b5cf6; }
  .custom-select.project-type-select select:hover { border-color: #7c3aed; box-shadow: 0 4px 12px rgba(124, 58, 237, 0.15); }
  .custom-select.project-type-select select:focus { border-color: #7c3aed; box-shadow: 0 0 0 3px rgba(124, 58, 237, 0.1), 0 4px 12px rgba(124, 58, 237, 0.15); }
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

// React Select options
const getClientOptions = (formOptions) => {
  return (formOptions.clients || []).map(client => ({
    value: client.id,
    label: client.company_name
  }));
};

const getEntityOptions = (formOptions) => {
  return (formOptions.entites || []).map(entity => ({
    value: entity.id,
    label: entity.company_name
  }));
};

const getObjectiveOptions = (formOptions) => {
  return (formOptions.objectifs || []).map(objective => ({
    value: objective.id,
    label: objective.titre
  }));
};

const getProjectTypeOptions = (formOptions) => {
  return (formOptions.projectTypes || []).map(type => ({
    value: type.id,
    label: type.title
  }));
};

const getStatusOptions = (formOptions) => {
  return formOptions.statuses || [];
};

// Progress options (0-100 in steps of 5)
const getProgressOptions = () => {
  return Array.from({ length: 21 }, (_, i) => i * 5).map(value => ({
    value: value,
    label: `${value}%`
  }));
};

// Get label suggestions from API
const getLabelSuggestions = (formOptions) => {
  return formOptions.labelSuggestions || [];
};

// Date formatting function
const formatDate = (dateString, simple = false) => {
  if (!dateString) return '-';
  const date = new Date(dateString);
  if (simple) {
    // Simple format: yyyy/mm/dd
    const year = date.getFullYear();
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const day = date.getDate().toString().padStart(2, '0');
    return `${year}/${month}/${day}`;
  }
  // Full format: day month year at time
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
  const [projectTypeFilter, setProjectTypeFilter] = useState('');
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
    start_date: null,
    deadline: null,
    client_id: '',
    id_entite: '',
    id_objectif: '',
    project_type: '',
    status: 'open',
    price: '',
    prog: 0,
    prog_price: 0,
    labels: [],
    starred_by: '',
    estimate_id: '',
    PAC: true,
    annee: '',
    commentaire: '',
    par_interim: false
  });
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isUpdated, setIsUpdated] = useState(false);
  const [projectToUpdate, setProjectToUpdate] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [projectToDelete, setProjectToDelete] = useState(null);
  const [exportingExcel, setExportingExcel] = useState(false);
  const [exportingPDF, setExportingPDF] = useState(false);
  const [formOptions, setFormOptions] = useState({
    clients: [],
    objectifs: [],
    entites: [],
    projectTypes: [],
    statuses: [],
    labelSuggestions: []
  });
  // 1. Add state for view modal
  const [viewProject, setViewProject] = useState(null);
  const [years, setYears] = useState([]);
  const navigate = useNavigate();

  // Fetch projects
  const fetchProjects = async (page = 1, search = '', status = '', year = '', projectType = '') => {
    try {
      setLoading(true);
      const queryParams = new URLSearchParams({
        page,
        per_page: pagination.perPage,
        search: search || '',
        sort_key: sortConfig.key || '',
        sort_direction: sortConfig.direction || 'desc',
        status: status || '',
        year: year || '',
        project_type_id: projectType || ''
      }).toString();
      const response = await axiosInstance.get(`/pmo/projects?${queryParams}`);
      if (response.data?.status === 'success' && response.data?.data) {
        console.log(response.data.data);
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





  // Fetch form options
  const fetchFormOptions = async () => {
    try {
      const response = await axiosInstance.get('/pmo/projects/options');
      console.log(response.data);
      if (response.data) {
        setFormOptions(response.data);
        // Also update the individual state arrays for backward compatibility
        setClients(response.data.clients || []);
        setObjectives(response.data.objectifs || []);
        setEntities(response.data.entites || []);
        setProjectTypes(response.data.projectTypes || []);
      } else {
        ToastService.error('Format de données des options invalide');
      }
    } catch (error) {
      ToastService.error('Erreur lors du chargement des options du formulaire');
      console.error('Error fetching form options:', error);
    }
  };

  // Fetch years from API
  const fetchYears = async () => {
    try {
      const response = await axiosInstance.get('/pmo/projects/years');
      if (response.data?.status === 'success') {
        setYears(response.data.data || []);
      } else {
        ToastService.error('Erreur lors du chargement des années');
      }
    } catch (error) {
      ToastService.error('Erreur lors du chargement des années');
      console.error('Error fetching years:', error);
    }
  };

  useEffect(() => {
    fetchProjects(1, '', '', '', '');
    fetchFormOptions();
    fetchYears();
    // eslint-disable-next-line
  }, []);

  // Prevent background scrolling when modal is open
  useEffect(() => {
    if (showModal || projectToDelete || viewProject) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }

    // Cleanup function to restore scroll when component unmounts
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [showModal, projectToDelete, viewProject]);

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

  // Handle React Select changes
  const handleSelectChange = (name, option) => {
    setFormData(prev => ({ ...prev, [name]: option ? option.value : '' }));
  };

  // Handle DatePicker changes
  const handleDateChange = (name, date) => {
    setFormData(prev => ({ ...prev, [name]: date }));
  };

  // Handle multi-select labels
  const handleLabelsChange = (options) => {
    setFormData(prev => ({ 
      ...prev, 
      labels: options ? options.map(opt => opt.value) : [] 
    }));
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
    
    // Objective validation
    if (!formData.id_objectif || formData.id_objectif === '') {
      newErrors.id_objectif = 'L\'objectif est requis';
    }
    
    // Project type validation
    if (!formData.project_type || formData.project_type === '') {
      newErrors.project_type = 'Le type de projet est requis';
    }
    
    // Start date validation
    if (!formData.start_date) {
      newErrors.start_date = 'La date de début est requise';
    } else {
      const dateDebut = new Date(formData.start_date);
      if (isNaN(dateDebut.getTime())) {
        newErrors.start_date = 'La date de début doit être une date valide';
      }
    }
    
    // Deadline validation
    if (!formData.deadline) {
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
    if (formData.prog === null || formData.prog === undefined || formData.prog === '') {
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
      const validStatuses = ['open', 'planned', 'completed', 'hold', 'canceled', 'not_started', 'continuous_action', 'archived'];
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
      // Format data for API
      const apiData = {
        ...formData,
        start_date: formData.start_date ? formData.start_date.toISOString().split('T')[0] : null,
        deadline: formData.deadline ? formData.deadline.toISOString().split('T')[0] : null,
        labels: Array.isArray(formData.labels) ? formData.labels.join(',') : formData.labels,
        prog: parseInt(formData.prog) || 0,
        prog_price: parseFloat(formData.prog_price) || 0,
        price: formData.price ? parseFloat(formData.price) : null,
        // Map form field names back to database field names
        PAC: formData.PAC ? 1 : 0,
        'Année': formData.annee,
        'Commentaire': formData.commentaire,
        'Par intérim': formData.par_interim ? '1' : '0'
      };

      let response;
      if (isUpdated && projectToUpdate) {
        console.log('Updating project with data:', apiData);
        response = await axiosInstance.put(`/pmo/projects/${projectToUpdate.id}`, apiData);
        console.log('Update response:', response.data);
      } else {
        console.log('Creating project with data:', apiData);
        response = await axiosInstance.post('/pmo/projects', apiData);
        console.log('Create response:', response.data);
      }
      
      if (response.data?.status === 'success') {
        ToastService.success(isUpdated ? 'Projet modifié avec succès' : 'Projet créé avec succès');
        setShowModal(false);
        
        // Add a small delay to ensure backend has processed the update
        setTimeout(() => {
          console.log('Refreshing data...');
          fetchProjects(pagination.current, searchTerm, statusFilter, yearFilter, projectTypeFilter);
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
    fetchProjects(page, searchTerm, statusFilter, yearFilter, projectTypeFilter);
  };

  const handleSort = (key) => {
    const direction = sortConfig.key === key && sortConfig.direction === 'asc' ? 'desc' : 'asc';
    setSortConfig({ key, direction });
    fetchProjects(1, searchTerm, statusFilter, yearFilter, projectTypeFilter);
  };

  const handleSearch = () => {
    fetchProjects(1, searchTerm, statusFilter, yearFilter, projectTypeFilter);
  };

  const handleClearSearch = () => {
    setSearchTerm('');
    fetchProjects(1, '', statusFilter, yearFilter, projectTypeFilter);
  };

  const handleStatusFilter = (status) => {
    setStatusFilter(status);
    fetchProjects(1, searchTerm, status, yearFilter, projectTypeFilter);
  };

  const handleYearFilter = (year) => {
    setYearFilter(year);
    fetchProjects(1, searchTerm, statusFilter, year, projectTypeFilter);
  };

  const handleProjectTypeFilter = (projectType) => {
    setProjectTypeFilter(projectType);
    fetchProjects(1, searchTerm, statusFilter, yearFilter, projectType);
  };

  const handleClearFilters = () => {
    setSearchTerm('');
    setStatusFilter('');
    setYearFilter('');
    setProjectTypeFilter('');
    fetchProjects(1, '', '', '', '');
  };

  const handleAddProject = () => {
    setIsUpdated(false);
    setProjectToUpdate(null);
    setFormData({
      title: '',
      description: '',
      start_date: null,
      deadline: null,
      client_id: '',
      id_entite: '',
      id_objectif: '',
      project_type: '',
      status: 'open',
      price: '',
      prog: 0,
      prog_price: 0,
      labels: [],
      starred_by: '',
      estimate_id: '',
      PAC: true,
      annee: '',
      commentaire: '',
      par_interim: false
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
      start_date: project.start_date ? new Date(project.start_date) : null,
      deadline: project.deadline ? new Date(project.deadline) : null,
      client_id: project.client_id || '',
      id_entite: project.id_entite || '',
      id_objectif: project.id_objectif || '',
      project_type: project.project_type?.id || project.project_type || '',
      status: project.status || 'open',
      price: project.price || '',
      prog: project.prog || 0,
      prog_price: project.prog_price ? parseFloat(project.prog_price) : 0,
      labels: project.labels ? project.labels.split(',').filter(label => label.trim()) : [],
      starred_by: project.starred_by || '',
      estimate_id: project.estimate_id || '',
      // Map database field names to form field names
      PAC: typeof project.PAC !== 'undefined' ? Boolean(project.PAC) : true,
      annee: project['Année'] ? project['Année'].split('T')[0] : '',
      commentaire: project['Commentaire'] || '',
      par_interim: typeof project['Par intérim'] !== 'undefined' ? Boolean(parseInt(project['Par intérim'])) : false
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
        fetchProjects(pagination.current, searchTerm, statusFilter, yearFilter, projectTypeFilter);
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
        per_page: 10000,
        search: searchTerm || '',
        sort_key: sortConfig.key || '',
        sort_direction: sortConfig.direction || 'desc',
        status: statusFilter || '',
        year: yearFilter || '',
        project_type_id: projectTypeFilter || '',
        export: 'true',
        include_tasks: 'true'
      }).toString();
      const response = await axiosInstance.get(`/pmo/projects?${queryParams}`);
      if (response.data?.status !== 'success' || !response.data?.data?.data) {
        throw new Error('Erreur lors de la récupération des données');
      }
      const allProjects = response.data.data.data;
      // Group projects by objective
      const projectsByObjective = {};
      allProjects.forEach(project => {
        const objectiveId = project.objectif?.id || 'no_objective';
        if (!projectsByObjective[objectiveId]) {
          projectsByObjective[objectiveId] = {
            objective: project.objectif,
            projects: []
          };
        }
        projectsByObjective[objectiveId].projects.push(project);
      });
      // Prepare export data as array of arrays for AOA
      const header = [
        'Objectif',
        'Projets',
        'Type',
        "Intitulé de l'action/Tâches",
        'Entité',
        'Année',
        "Maître d'ouvrage",
        'Responsable',
        'Date début estimée',
        'Date de fin estimée',
        'Statut',
        "Etat d'avancement",
        'PAC ?'
      ];
      const aoa = [header];
      const merges = [];
      let currentRow = 1; // 0 is header

      // Build array of Objectif groups with their latest project date
      const sortedGroups = Object.values(projectsByObjective)
        .map(group => {
          // Find the latest start_date in this group
          const latestDate = group.projects.reduce((max, p) => {
            const d = p.start_date ? new Date(p.start_date).getTime() : 0;
            return d > max ? d : max;
          }, 0);
          return { ...group, latestDate };
        })
        .sort((a, b) => b.latestDate - a.latestDate); // Descending order

      // Now loop over sorted groups
      sortedGroups.forEach(({ objective, projects }) => {
        // Sort projects by Date début estimée (start_date) in descending order (latest first)
        projects.sort((a, b) => {
          const dateA = a.start_date ? new Date(a.start_date).getTime() : 0;
          const dateB = b.start_date ? new Date(b.start_date).getTime() : 0;
          return dateB - dateA;
        });
        // Count total rows for this objectif
        let objectifRowStart = currentRow;
        let objectifRowCount = 0;
        // Build all rows for this objectif
        projects.forEach(project => {
          const statusOption = getStatusOptions(formOptions).find(opt => opt.value === project.status);
          const statusLabel = statusOption?.label || project.status || '';
          const pacStatus = project.PAC ? 'Oui' : 'Non';
          const projectYear = project['Année'] || new Date(project.start_date).getFullYear() || '';
          let projectRowStart = currentRow + objectifRowCount;
          let projectRowCount = 0;
          if (project.tasks && project.tasks.length > 0) {
            project.tasks.forEach((task, idx) => {
              aoa.push([
                '', // Objectif (filled later)
                idx === 0 ? project.title || '' : '',
                idx === 0 ? (project.project_type?.title || '') : '',
                task.title || '', // Always show the task title
                idx === 0 ? (project.entite?.company_name || '') : '',
                idx === 0 ? projectYear : '',
                idx === 0 ? (project.client?.company_name || '') : '',
                // Responsable: use assigned_user full name if available, else assigned_to
                task.assigned_user
                  ? `${task.assigned_user.first_name || ''} ${task.assigned_user.last_name || ''}`.trim()
                  : (task.assigned_to ? task.assigned_to : ''),
                idx === 0 ? (project.start_date ? formatDate(project.start_date, true) : '') : '',
                idx === 0 ? (project.deadline ? formatDate(project.deadline, true) : '') : '',
                idx === 0 ? statusLabel : '',
                idx === 0 ? `${project.prog || 0}%` : '',
                idx === 0 ? pacStatus : ''
              ]);
              objectifRowCount++;
              projectRowCount++;
            });
            // Merge project cell if more than 1 task
            if (project.tasks.length > 1) {
              merges.push({ s: { r: projectRowStart, c: 1 }, e: { r: projectRowStart + projectRowCount - 1, c: 1 } }); // Projets
              merges.push({ s: { r: projectRowStart, c: 2 }, e: { r: projectRowStart + projectRowCount - 1, c: 2 } }); // Type
              merges.push({ s: { r: projectRowStart, c: 4 }, e: { r: projectRowStart + projectRowCount - 1, c: 4 } }); // Entité
              merges.push({ s: { r: projectRowStart, c: 5 }, e: { r: projectRowStart + projectRowCount - 1, c: 5 } }); // Année
              merges.push({ s: { r: projectRowStart, c: 6 }, e: { r: projectRowStart + projectRowCount - 1, c: 6 } }); // Maître d'ouvrage
              merges.push({ s: { r: projectRowStart, c: 8 }, e: { r: projectRowStart + projectRowCount - 1, c: 8 } }); // Date début estimée
              merges.push({ s: { r: projectRowStart, c: 9 }, e: { r: projectRowStart + projectRowCount - 1, c: 9 } }); // Date de fin estimée
              merges.push({ s: { r: projectRowStart, c: 10 }, e: { r: projectRowStart + projectRowCount - 1, c: 10 } }); // Statut
              merges.push({ s: { r: projectRowStart, c: 11 }, e: { r: projectRowStart + projectRowCount - 1, c: 11 } }); // Etat d'avancement
              merges.push({ s: { r: projectRowStart, c: 12 }, e: { r: projectRowStart + projectRowCount - 1, c: 12 } }); // PAC ?
            }
          } else {
            aoa.push([
              '', // Objectif (filled later)
              project.title || '',
              project.project_type?.title || '',
              '',
              project.entite?.company_name || '',
              projectYear,
              project.client?.company_name || '',
              project.creator?.name || '',
              project.start_date ? formatDate(project.start_date, true) : '',
              project.deadline ? formatDate(project.deadline, true) : '',
              statusLabel,
              `${project.prog || 0}%`,
              pacStatus
            ]);
            objectifRowCount++;
            projectRowCount++;
          }
        });
        // Merge Objectif cell if more than 1 row
        if (objectifRowCount > 1) {
          merges.push({ s: { r: objectifRowStart, c: 0 }, e: { r: objectifRowStart + objectifRowCount - 1, c: 0 } });
        }
        // Fill the Objectif title in the first row of the group
        if (aoa[objectifRowStart]) {
          aoa[objectifRowStart][0] = objective?.titre || '';
        }
        currentRow += objectifRowCount;
      });
      // Create workbook and worksheet
      const workbook = XLSX.utils.book_new();
      const worksheet = XLSX.utils.aoa_to_sheet(aoa);
      worksheet['!cols'] = [
        { wch: 40 }, // Objectif
        { wch: 30 }, // Projets
        { wch: 15 }, // Type
        { wch: 30 }, // Intitulé de l'action/Tâches
        { wch: 20 }, // Entité
        { wch: 10 }, // Année
        { wch: 25 }, // Maître d'ouvrage
        { wch: 25 }, // Responsable
        { wch: 15 }, // Date début estimée
        { wch: 15 }, // Date de fin estimée
        { wch: 15 }, // Statut
        { wch: 18 }, // Etat d'avancement
        { wch: 8 }   // PAC ?
      ];
      worksheet['!merges'] = merges;
      // Center the Objectif title in the merged cells (if supported by XLSX)
      for (const merge of merges) {
        if (merge.s.c === 0) { // Only for Objectif column
          const cellAddress = XLSX.utils.encode_cell({ r: merge.s.r, c: 0 });
          if (!worksheet[cellAddress]) continue;
          worksheet[cellAddress].s = {
            alignment: { vertical: 'center', horizontal: 'center', wrapText: true }
          };
        }
      }
      XLSX.utils.book_append_sheet(workbook, worksheet, 'Projects_Grouped');
      let filename = 'projects_grouped';
      if (statusFilter) filename += `_${statusFilter}`;
      if (yearFilter) filename += `_${yearFilter}`;
      if (projectTypeFilter) filename += `_${projectTypeFilter}`;
      if (searchTerm) filename += `_recherche`;
      filename += `_${new Date().toISOString().split('T')[0]}.xlsx`;
      XLSX.writeFile(workbook, filename);
      ToastService.success(`Export Excel réussi: ${allProjects.length} projets exportés (groupés)`);
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
        project_type_id: projectTypeFilter || '',
        export: 'true', // Flag to indicate this is for export
        include_tasks: 'true' // Include tasks data
      }).toString();
      
      const response = await axiosInstance.get(`/pmo/projects?${queryParams}`);
      
      if (response.data?.status !== 'success' || !response.data?.data?.data) {
        throw new Error('Erreur lors de la récupération des données');
      }
      
      const allProjects = response.data.data.data;
      
      const doc = new jsPDF('landscape'); // Use landscape orientation for more columns
      
      // Add title
      doc.setFontSize(16);
      doc.setTextColor(59, 130, 246); // Blue color
      doc.text('Rapport des Projets - Hiérarchie Complète', 14, 22);
      
      // Add subtitle with export info
      doc.setFontSize(10);
      doc.setTextColor(107, 114, 128);
      doc.text(`Exporté le: ${new Date().toLocaleDateString('fr-FR')} | Total: ${allProjects.length} projets`, 14, 30);
      
      // Group projects by objective for better organization
      const projectsByObjective = {};
      
      allProjects.forEach(project => {
        const objectiveId = project.objectif?.id || 'no_objective';
        if (!projectsByObjective[objectiveId]) {
          projectsByObjective[objectiveId] = {
            objective: project.objectif,
            projects: []
          };
        }
        projectsByObjective[objectiveId].projects.push(project);
      });
      
      // Prepare table data with comprehensive structure
      const tableData = [];
      
      Object.values(projectsByObjective).forEach(({ objective, projects }) => {
        projects.forEach(project => {
          // Get status label
          const statusOption = getStatusOptions(formOptions).find(opt => opt.value === project.status);
          const statusLabel = statusOption?.label || project.status || '';
          
          // Get PAC status
          const pacStatus = project.PAC ? 'Oui' : 'Non';
          
          // Get year from project data
          const projectYear = project['Année'] || new Date(project.start_date).getFullYear() || '';
          
          // Base project row
          const projectRow = [
            objective?.id || '-',
            objective?.titre ? (objective.titre.length > 30 ? objective.titre.substring(0, 30) + '...' : objective.titre) : '-',
            project.id || '-',
            project.title ? (project.title.length > 25 ? project.title.substring(0, 25) + '...' : project.title) : '-',
        project.project_type?.title || '-',
            project.entite?.company_name || '-',
            projectYear,
            project.client?.company_name ? (project.client.company_name.length > 20 ? project.client.company_name.substring(0, 20) + '...' : project.client.company_name) : '-',
            project.start_date ? formatDate(project.start_date, true) : '-',
            project.deadline ? formatDate(project.deadline, true) : '-',
            statusLabel,
            `${project.prog || 0}%`,
            pacStatus,
            project.price || '0.00',
            `${project.prog_price || 0}%`,
            project.tasks ? project.tasks.length : 0,
            project.tasks ? project.tasks.filter(task => task.assignments && task.assignments.length > 0).length : 0
          ];
          
          tableData.push(projectRow);
        });
      });
      
      // Add table with comprehensive styling
      autoTable(doc, {
        head: [['Obj ID', 'Objectif', 'Proj ID', 'Projet', 'Type', 'Entité', 'Année', 'Maître d\'ouvrage', 'Début', 'Fin', 'Statut', 'Avancement', 'PAC', 'Budget', 'Engagement', 'Tâches', 'Assignées']],
        body: tableData,
        startY: 40,
        styles: {
          fontSize: 8,
          cellPadding: 2,
        },
        headStyles: {
          fillColor: [59, 130, 246],
          textColor: 255,
          fontStyle: 'bold',
        },
        columnStyles: {
          0: { cellWidth: 8 },  // Obj ID
          1: { cellWidth: 25 }, // Objectif
          2: { cellWidth: 8 },  // Proj ID
          3: { cellWidth: 25 }, // Projet
          4: { cellWidth: 15 }, // Type
          5: { cellWidth: 20 }, // Entité
          6: { cellWidth: 8 },  // Année
          7: { cellWidth: 20 }, // Maître d'ouvrage
          8: { cellWidth: 12 }, // Début
          9: { cellWidth: 12 }, // Fin
          10: { cellWidth: 12 }, // Statut
          11: { cellWidth: 10 }, // Avancement
          12: { cellWidth: 6 },  // PAC
          13: { cellWidth: 10 }, // Budget
          14: { cellWidth: 10 }, // Engagement
          15: { cellWidth: 8 },  // Tâches
          16: { cellWidth: 10 }  // Assignées
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
      let filename = 'projects_hierarchie';
      if (statusFilter) filename += `_${statusFilter}`;
      if (yearFilter) filename += `_${yearFilter}`;
      if (projectTypeFilter) filename += `_${projectTypeFilter}`;
      if (searchTerm) filename += `_recherche`;
      filename += `_${new Date().toISOString().split('T')[0]}.pdf`;
      
      // Save file
      doc.save(filename);
      
      ToastService.success(`Export PDF réussi: ${allProjects.length} projets exportés avec hiérarchie complète`);
    } catch (error) {
      console.error('Export PDF error:', error);
      ToastService.error('Erreur lors de l\'export PDF: ' + (error.message || 'Erreur inconnue'));
    } finally {
      setExportingPDF(false);
    }
  };

  // Handle opening project details
  const handleProjectDetails = (project) => {
    navigate(`/Pmo/Projects/${project.id}`);
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
                        className="ti-btn ti-btn-icon ti-btn-primary-full ti-btn-wave"
                        title="Rechercher"
                      >
                        <i className="ri-search-line"></i>
                      </button>
                    </div>
                  </div>
                  <button
                    onClick={handleAddProject}
                    className="ti-btn ti-btn-primary-full ti-btn-wave"
                  >
                    <i className="ri-add-line me-2"></i>
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
                      {/* <p className="text-sm text-gray-600 dark:text-gray-400">Affinez votre recherche</p> */}
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
                          {getStatusOptions(formOptions).map(opt => (
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
                    
                    {/* Project Type Filter */}
                    <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 min-w-[180px]">
                      <label className="text-sm font-medium text-gray-700 dark:text-gray-300 whitespace-nowrap">
                        <i className="ri-project-2-line mr-1 text-purple-500"></i>
                        Projet
                      </label>
                      <div className="custom-select project-type-select">
                        <select
                          value={projectTypeFilter}
                          onChange={(e) => handleProjectTypeFilter(e.target.value)}
                          className="custom-select select"
                        >
                          <option value="">Tous les types</option>
                          {getProjectTypeOptions(formOptions).map(opt => (
                            <option key={opt.value} value={opt.value}>{opt.label}</option>
                          ))}
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
                    {(statusFilter || yearFilter || projectTypeFilter || searchTerm) && (
                      <button
                        onClick={handleClearFilters}
                        className="ti-btn ti-btn-outline-danger ti-btn-wave"
                      >
                        <i className="ri-refresh-line"></i>
                       
                      </button>
                    )}
                  </div>
                </div>
                
                {/* Active Filters Indicator */}
                {(statusFilter || yearFilter || projectTypeFilter || searchTerm) && (
                  <div className="mt-4 pt-4 border-t border-blue-200 dark:border-gray-700">
                    <div className="flex items-center gap-3">
                      <div className="flex items-center gap-2 px-3 py-1.5 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 rounded-full text-sm font-medium">
                        <i className="ri-check-line"></i>
                        <span>Filtres actifs:</span>
                        <span className="bg-blue-200 dark:bg-blue-800 text-blue-800 dark:text-blue-200 px-2 py-0.5 rounded-full text-xs">
                          {[statusFilter, yearFilter, projectTypeFilter, searchTerm].filter(Boolean).length}
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
                            {getStatusOptions(formOptions).find(opt => opt.value === statusFilter)?.label || statusFilter}
                          </span>
                        )}
                        {yearFilter && (
                          <span className="inline-flex items-center gap-1 px-2 py-1 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 rounded-md text-xs">
                            <i className="ri-calendar-line"></i>
                            {yearFilter}
                          </span>
                        )}
                        {projectTypeFilter && (
                          <span className="inline-flex items-center gap-1 px-2 py-1 bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 rounded-md text-xs">
                            <i className="ri-project-2-line"></i>
                            {getProjectTypeOptions(formOptions).find(opt => opt.value === projectTypeFilter)?.label || projectTypeFilter}
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
                          {(statusFilter || yearFilter || projectTypeFilter || searchTerm) && (
                            <div className="flex items-center gap-2 px-3 py-1 bg-amber-50 dark:bg-amber-900/20 text-amber-700 dark:text-amber-300 rounded-lg text-sm">
                              <i className="ri-filter-line"></i>
                              <span>Filtres actifs</span>
                              <span className="bg-amber-200 dark:bg-amber-800 text-amber-800 dark:text-amber-200 px-2 py-0.5 rounded-full text-xs font-medium">
                                {[statusFilter, yearFilter, projectTypeFilter, searchTerm].filter(Boolean).length}
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
                                <th className="px-4 py-4 text-left font-semibold text-gray-700 dark:text-gray-300 cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors min-w-[180px]">
                                  Objectif
                                </th>
                                <th className="px-4 py-4 text-left font-semibold text-gray-700 dark:text-gray-300 cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors min-w-[200px]" onClick={() => handleSort('title')}>
                                  <div className="flex items-center gap-2">
                                    Titre
                                    <i className="ri-arrow-up-down-line text-gray-400"></i>
                                  </div>
                                </th>
                                <th className="px-4 py-4 text-left font-semibold text-gray-700 dark:text-gray-300 cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors min-w-[100px]" onClick={() => handleSort('project_type')}>
                                  <div className="flex items-center gap-2">
                                    Type
                                    <i className="ri-arrow-up-down-line text-gray-400"></i>
                                  </div>
                                </th>
                                <th className="px-4 py-4 text-left font-semibold text-gray-700 dark:text-gray-300 cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors min-w-[100px]" onClick={() => handleSort('start_date')}>
                                  <div className="flex items-center gap-2">
                                    Date début
                                    <i className="ri-arrow-up-down-line text-gray-400"></i>
                                  </div>
                                </th>
                                <th className="px-4 py-4 text-left font-semibold text-gray-700 dark:text-gray-300 cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors min-w-[100px]" onClick={() => handleSort('deadline')}>
                                  <div className="flex items-center gap-2">
                                    Date fin
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
                              {projects.length > 0 ? (
                                projects.map((project) => (
                                  <tr key={project.id} className="hover:bg-gray-50 dark:hover:bg-black/20 h-16 transition-colors">
                                    <td className="px-4 py-4 text-gray-700 dark:text-gray-300">
                                      <div className="max-w-[160px] truncate" title={project.objectif?.titre || '-'}>
                                        {project.objectif?.titre || '-'}
                                      </div>
                                    </td>
                                    <td className="px-4 py-4 text-gray-900 dark:text-white font-medium">
                                      <div className="max-w-[180px] truncate" title={project.title}>
                                        <button
                                          onClick={() => handleProjectDetails(project)}
                                          className="text-left hover:text-blue-600 dark:hover:text-blue-400 transition-colors cursor-pointer"
                                        >
                                          {project.title}
                                        </button>
                                      </div>
                                    </td>
                                    <td className="px-4 py-4 text-gray-700 dark:text-gray-300">
                                      <div className="max-w-[160px] truncate" title={project.project_type?.title || '-'}>
                                        {project.project_type?.title || '-'}
                                      </div>
                                    </td>
                                    <td className="px-4 py-4 text-gray-700 dark:text-gray-300">
                                      <div className="text-xs font-medium">
                                        <div className="text-gray-900 dark:text-white">{formatDate(project.start_date, true)}</div>
                                      </div>
                                    </td>
                                    <td className="px-4 py-4 text-gray-700 dark:text-gray-300">
                                      <div className="text-xs font-medium">
                                        <div className="text-gray-900 dark:text-white">{formatDate(project.deadline, true)}</div>
                                      </div>
                                    </td>
                                    <td className="px-4 py-4">
                                      {(() => {
                                        const statusOption = getStatusOptions(formOptions).find(opt => opt.value === project.status);
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
                                          <span
                                            className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium border ${colorClasses[project.status] || colorClasses['not_started']}`}
                                          >
                                            <i className={`${statusOption?.icon || 'ri-question-line'}`}></i>
                                            {statusOption?.label || project.status}
                                          </span>
                                        );
                                      })()}
                                    </td>
                                    <td className="px-4 py-4 text-right">
                                      <div className="flex justify-end space-x-2">
                                          <button
                                          onClick={() => setViewProject(project)}
                                          className="ti-btn ti-btn-icon ti-btn-info-full ti-btn-wave"
                                          title="Voir le projet"
                                        >
                                          <i className="ri-eye-line"></i>
                                        </button>
                                        <button
                                          onClick={() => handleUpdate(project)}
                                          className="ti-btn ti-btn-icon ti-btn-primary-full ti-btn-wave"
                                          title="Modifier le projet"
                                        >
                                          <i className="ri-pencil-line"></i>
                                        </button>
                                        <button
                                          onClick={() => handleDelete(project)}
                                          className="ti-btn ti-btn-icon ti-btn-danger-full ti-btn-wave"
                                          title="Supprimer le projet"
                                        >
                                          <i className="ri-delete-bin-line"></i>
                                        </button>
                                    
                                      </div>
                                    </td>
                                  </tr>
                                ))
                              ) : (
                                <tr>
                                  <td colSpan="10" className="px-6 py-16 text-center">
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
        <div 
          className="project-form-modal"
          onClick={(e) => {
            if (e.target === e.currentTarget) {
              setShowModal(false);
            }
          }}
        >
          <div className="project-form-modal-content">
            {/* Modal Header */}
            <div className="project-form-modal-header">
              <div style={{display: 'flex', alignItems: 'center', gap: '1rem', width: '100%'}}>
                <div className="project-form-modal-header-icon">
                  <i className="ri-folder-line" style={{fontSize: '1.5rem'}}></i>
                </div>
                <div>
                  <h2 className="project-form-modal-header-title">
                    {isUpdated ? 'Modifier le Projet' : 'Créer un Nouveau Projet'}
                  </h2>
                  <p className="project-form-modal-header-subtitle">
                    {isUpdated ? 'Mettez à jour les informations du projet' : 'Ajoutez un nouveau projet à votre portefeuille'}
                  </p>
                </div>
                <div style={{flex: 1}}></div>
                <button
                  onClick={() => setShowModal(false)}
                  className="project-form-modal-close"
                >
                  <i className="ri-close-line" style={{fontSize: '1.25rem'}}></i>
                </button>
              </div>
            </div>

            {/* Modal Body */}
            <div className="project-form-modal-body">
              <form onSubmit={handleSubmit}>
                {/* Project Title Section */}
                <div className="project-form-section project-form-section-blue">
                  <div className="project-form-section-header">
                    <div className="project-form-section-icon">
                      <i className="ri-file-text-line"></i>
                    </div>
                    <div>
                      <h3 className="project-form-section-title">Informations Générales</h3>
                      <p className="project-form-section-subtitle">Détails de base du projet</p>
                    </div>
                  </div>
                  
                  <div className="project-form-grid">
                    <div className="project-form-field project-form-field-full">
                      <label className="project-form-label">
                        Titre du Projet <span className="project-form-required">*</span>
                      </label>
                      <input
                        type="text"
                        name="title"
                        value={formData.title}
                        onChange={handleInputChange}
                        className={`project-form-input ${errors.title ? 'border-red-500' : ''}`}
                        placeholder="Entrez le titre du projet..."
                      />
                      {errors.title && (
                        <div className="project-form-error">
                          <i className="ri-error-warning-line project-form-error-icon"></i>
                          <span>{errors.title}</span>
                        </div>
                      )}
                    </div>

                    <div className="project-form-field">
                      <label className="project-form-label">
                        Maitre d'ouvrage <span className="project-form-required">*</span>
                      </label>
                      <Select
                        options={getClientOptions(formOptions)}
                        value={getClientOptions(formOptions).find(option => option.value === formData.client_id)}
                        onChange={(option) => handleSelectChange('client_id', option)}
                        placeholder="Sélectionner un client"
                        className="react-select-container"
                        classNamePrefix="react-select"
                        isClearable
                        isSearchable
                      />
                      {errors.client_id && (
                        <div className="project-form-error">
                          <i className="ri-error-warning-line project-form-error-icon"></i>
                          <span>{errors.client_id}</span>
                        </div>
                      )}
                    </div>

                    <div className="project-form-field">
                      <label className="project-form-label">
                        Entité <span className="project-form-required">*</span>
                      </label>
                      <Select
                        options={getEntityOptions(formOptions)}
                        value={getEntityOptions(formOptions).find(option => option.value === formData.id_entite)}
                        onChange={(option) => handleSelectChange('id_entite', option)}
                        placeholder="Sélectionner une entité"
                        className="react-select-container"
                        classNamePrefix="react-select"
                        isClearable
                        isSearchable
                      />
                      {errors.id_entite && (
                        <div className="project-form-error">
                          <i className="ri-error-warning-line project-form-error-icon"></i>
                          <span>{errors.id_entite}</span>
                        </div>
                      )}
                    </div>

                    <div className="project-form-field">
                      <label className="project-form-label">
                        Objectif <span className="project-form-required">*</span>
                      </label>
                      <Select
                        options={getObjectiveOptions(formOptions)}
                        value={getObjectiveOptions(formOptions).find(option => option.value === formData.id_objectif)}
                        onChange={(option) => handleSelectChange('id_objectif', option)}
                        placeholder="Sélectionner un objectif"
                        className="react-select-container"
                        classNamePrefix="react-select"
                        isClearable
                        isSearchable
                      />
                      {errors.id_objectif && (
                        <div className="project-form-error">
                          <i className="ri-error-warning-line project-form-error-icon"></i>
                          <span>{errors.id_objectif}</span>
                        </div>
                      )}
                    </div>

                    <div className="project-form-field">
                      <label className="project-form-label">
                        Type<span className="project-form-required">*</span>
                      </label>
                      <Select
                        options={getProjectTypeOptions(formOptions)}
                        value={getProjectTypeOptions(formOptions).find(option => option.value === formData.project_type)}
                        onChange={(option) => handleSelectChange('project_type', option)}
                        placeholder="Sélectionner un type"
                        className="react-select-container"
                        classNamePrefix="react-select"
                        isClearable
                        isSearchable
                      />
                      {errors.project_type && (
                        <div className="project-form-error">
                          <i className="ri-error-warning-line project-form-error-icon"></i>
                          <span>{errors.project_type}</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Dates Section */}
                <div className="project-form-section project-form-section-green">
                  <div className="project-form-section-header">
                    <div className="project-form-section-icon">
                      <i className="ri-calendar-line"></i>
                    </div>
                    <div>
                      <h3 className="project-form-section-title">Planning du Projet</h3>
                      <p className="project-form-section-subtitle">Dates de début et de fin</p>
                    </div>
                  </div>
                  
                  <div className="project-form-grid">
                    <div className="project-form-field">
                      <label className="project-form-label">
                        Date de Début <span className="project-form-required">*</span>
                      </label>
                      <DatePicker
                        selected={formData.start_date}
                        onChange={(date) => handleDateChange('start_date', date)}
                        className={`project-form-input ${errors.start_date ? 'border-red-500' : ''}`}
                        placeholderText="Sélectionner la date de début"
                        dateFormat="dd/MM/yyyy"
                        isClearable
                        showYearDropdown
                        scrollableYearDropdown
                        yearDropdownItemNumber={15}
                      />
                      {errors.start_date && (
                        <div className="project-form-error">
                          <i className="ri-error-warning-line project-form-error-icon"></i>
                          <span>{errors.start_date}</span>
                        </div>
                      )}
                    </div>
                    <div className="project-form-field">
                      <label className="project-form-label">
                        Date de Fin <span className="project-form-required">*</span>
                      </label>
                      <DatePicker
                        selected={formData.deadline}
                        onChange={(date) => handleDateChange('deadline', date)}
                        className={`project-form-input ${errors.deadline ? 'border-red-500' : ''}`}
                        placeholderText="Sélectionner la date de fin"
                        dateFormat="dd/MM/yyyy"
                        isClearable
                        showYearDropdown
                        scrollableYearDropdown
                        yearDropdownItemNumber={15}
                        minDate={formData.start_date}
                      />
                      {errors.deadline && (
                        <div className="project-form-error">
                          <i className="ri-error-warning-line project-form-error-icon"></i>
                          <span>{errors.deadline}</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Financial & Status Section */}
                <div className="project-form-section project-form-section-purple">
                  <div className="project-form-section-header">
                    <div className="project-form-section-icon">
                      <i className="ri-money-dollar-circle-line"></i>
                    </div>
                    <div>
                      <h3 className="project-form-section-title">Finances & Statut</h3>
                      <p className="project-form-section-subtitle">Budget et état du projet</p>
                    </div>
                  </div>
                  
                  <div className="project-form-grid">
                    <div className="project-form-field">
                      <label className="project-form-label">
                        Budget (DH)
                      </label>
                      <input
                        type="number"
                        name="price"
                        value={formData.price}
                        onChange={handleInputChange}
                        step="0.01"
                        min="0"
                        className={`project-form-input ${errors.price ? 'border-red-500' : ''}`}
                        placeholder="0.00"
                      />
                      {errors.price && (
                        <div className="project-form-error">
                          <i className="ri-error-warning-line project-form-error-icon"></i>
                          <span>{errors.price}</span>
                        </div>
                      )}
                    </div>
                    <div className="project-form-field">
                      <label className="project-form-label">
                        Budget d'Engagement (%)
                      </label>
                      <Select
                        options={getProgressOptions()}
                        value={getProgressOptions().find(option => option.value === formData.prog_price)}
                        onChange={(option) => handleSelectChange('prog_price', option)}
                        placeholder="Sélectionner le pourcentage"
                        className="react-select-container"
                        classNamePrefix="react-select"
                        isClearable
                      />
                      {errors.prog_price && (
                        <div className="project-form-error">
                          <i className="ri-error-warning-line project-form-error-icon"></i>
                          <span>{errors.prog_price}</span>
                        </div>
                      )}
                    </div>
                    <div className="project-form-field">
                      <label className="project-form-label">
                        Statut <span className="project-form-required">*</span>
                      </label>
                      <Select
                        options={getStatusOptions(formOptions)}
                        value={getStatusOptions(formOptions).find(option => option.value === formData.status)}
                        onChange={(option) => handleSelectChange('status', option)}
                        placeholder="Sélectionner un statut"
                        className="react-select-container"
                        classNamePrefix="react-select"
                        isClearable
                      />
                      {errors.status && (
                        <div className="project-form-error">
                          <i className="ri-error-warning-line project-form-error-icon"></i>
                          <span>{errors.status}</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Progress Section */}
                <div className="project-form-section project-form-section-orange">
                  <div className="project-form-section-header">
                    <div className="project-form-section-icon">
                      <i className="ri-dashboard-line"></i>
                    </div>
                    <div>
                      <h3 className="project-form-section-title">Progression du Projet</h3>
                      <p className="project-form-section-subtitle">Niveau d'avancement actuel</p>
                    </div>
                  </div>
                  
                  <div className="project-form-grid">
                    <div className="project-form-field">
                      <label className="project-form-label">
                        Avancement du Projet <span className="project-form-required">*</span>
                      </label>
                      <Select
                        options={getProgressOptions()}
                        value={getProgressOptions().find(option => option.value === formData.prog)}
                        onChange={(option) => handleSelectChange('prog', option)}
                        placeholder="Sélectionner le pourcentage d'avancement"
                        className="react-select-container"
                        classNamePrefix="react-select"
                        isClearable
                      />
                      {errors.prog && (
                        <div className="project-form-error">
                          <i className="ri-error-warning-line project-form-error-icon"></i>
                          <span>{errors.prog}</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Labels Section */}
                <div className="project-form-section project-form-section-indigo">
                  <div className="project-form-section-header">
                    <div className="project-form-section-icon">
                      <i className="ri-price-tag-3-line"></i>
                    </div>
                    <div>
                      <h3 className="project-form-section-title">Étiquettes</h3>
                      <p className="project-form-section-subtitle">Organisez votre projet avec des étiquettes</p>
                    </div>
                  </div>
                  
                  <div className="project-form-field">
                    <label className="project-form-label">
                      Étiquettes du Projet
                    </label>
                    <Select
                      isMulti
                      options={getLabelSuggestions(formOptions)}
                      value={getLabelSuggestions(formOptions).filter(option => formData.labels.includes(option.value))}
                      onChange={handleLabelsChange}
                      placeholder="Sélectionner ou ajouter des étiquettes"
                      className="react-select-container"
                      classNamePrefix="react-select"
                      isClearable
                      isSearchable
                    />
                  </div>
                </div>
                
                {/* Description Section */}
                <div className="project-form-section project-form-section-cyan">
                  <div className="project-form-section-header">
                    <div className="project-form-section-icon">
                      <i className="ri-file-text-line"></i>
                    </div>
                    <div>
                      <h3 className="project-form-section-title">Description</h3>
                      <p className="project-form-section-subtitle">Détails et observations du projet</p>
                    </div>
                  </div>
                  
                  <div className="project-form-field">
                    <label className="project-form-label">
                      Description du Projet
                    </label>
                    <textarea
                      name="description"
                      value={formData.description}
                      onChange={handleInputChange}
                      className={`project-form-textarea ${errors.description ? 'border-red-500' : ''}`}
                      placeholder="Décrivez les détails du projet, les objectifs, les contraintes, etc..."
                    />
                    {errors.description && (
                      <div className="project-form-error">
                        <i className="ri-error-warning-line project-form-error-icon"></i>
                        <span>{errors.description}</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Additional Fields Section */}
                <div className="project-form-section project-form-section-gray">
                  <div className="project-form-section-header">
                    <div className="project-form-section-icon">
                      <i className="ri-settings-3-line"></i>
                    </div>
                    <div>
                      <h3 className="project-form-section-title">Informations Supplémentaires</h3>
                      <p className="project-form-section-subtitle">Champs additionnels du projet</p>
                    </div>
                  </div>
                  <div className="project-form-grid">
                    {/* PAC Checkbox */}
                    <div className="project-form-checkbox">
                      <input
                        type="checkbox"
                        id="PAC"
                        name="PAC"
                        checked={formData.PAC}
                        onChange={e => setFormData(prev => ({ ...prev, PAC: e.target.checked }))}
                      />
                      <label htmlFor="PAC" className="project-form-label">PAC</label>
                    </div>
                    {/* Par intérim Checkbox */}
                    <div className="project-form-checkbox">
                      <input
                        type="checkbox"
                        id="par_interim"
                        name="par_interim"
                        checked={formData.par_interim}
                        onChange={e => setFormData(prev => ({ ...prev, par_interim: e.target.checked }))}
                      />
                      <label htmlFor="par_interim" className="project-form-label">Par intérim</label>
                    </div>
                    {/* Année Date Picker */}
                    <div className="project-form-field">
                      <label className="project-form-label">Année</label>
                      <input
                        type="date"
                        name="annee"
                        value={formData.annee}
                        onChange={handleInputChange}
                        className="project-form-input"
                      />
                    </div>
                    {/* Commentaire Textarea */}
                    <div className="project-form-field">
                      <label className="project-form-label">Commentaire</label>
                      <textarea
                        name="commentaire"
                        value={formData.commentaire}
                        onChange={handleInputChange}
                        className="project-form-textarea"
                        placeholder="Ajouter un commentaire..."
                        maxLength={300}
                        rows={2}
                      />
                    </div>
                  </div>
                </div>
              </form>
            </div>

            {/* Modal Footer */}
            <div className="project-form-modal-footer">
              <div style={{display: 'flex', justifyContent: 'flex-end', gap: '0.75rem'}}>
                <button
                  type="button"
                  className="ti-btn ti-btn-secondary-full ti-btn-wave"
                  onClick={() => setShowModal(false)}
                >
                  <i className="ri-close-line me-2"></i>
                  Annuler
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className={`ti-btn ti-btn-primary-full ti-btn-wave ${isSubmitting ? 'ti-btn-loader' : ''}`}
                  onClick={handleSubmit}
                >
                  {isSubmitting ? (
                    <>
                      <span className="me-2">{isUpdated ? 'Modification...' : 'Création...'}</span>
                      <span className="loading">
                        <i className="ri-loader-2-fill text-[1rem] animate-spin"></i>
                      </span>
                    </>
                  ) : (
                    <>
                      <i className={`${isUpdated ? 'ri-save-line' : 'ri-add-line'} me-2`}></i>
                      {isUpdated ? 'Modifier le Projet' : 'Créer le Projet'}
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {projectToDelete && (
        <div 
          className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
          onClick={(e) => {
            if (e.target === e.currentTarget) {
              setProjectToDelete(null);
            }
          }}
        >
          <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-2xl w-full max-w-md transform transition-all duration-300 scale-100 animate-in fade-in-0 zoom-in-95">
            {/* Modal Header */}
            <div className="relative bg-gradient-to-br from-red-500 via-red-600 to-red-700 px-6 py-6 overflow-hidden">
              {/* Animated Background Elements */}
              <div className="absolute inset-0">
                <div className="absolute top-0 left-0 w-20 h-20 bg-white/10 rounded-full -translate-x-10 -translate-y-10 animate-pulse"></div>
                <div className="absolute bottom-0 right-0 w-16 h-16 bg-white/10 rounded-full translate-x-8 translate-y-8 animate-pulse delay-1000"></div>
              </div>
              
              <div className="relative flex items-center gap-4">
                <div className="flex items-center justify-center w-12 h-12 bg-white/20 rounded-xl backdrop-blur-sm border border-white/30">
                  <i className="ri-error-warning-line text-2xl text-white"></i>
                </div>
                <div>
                  <h3 className="text-xl font-bold text-white mb-1">Confirmer la Suppression</h3>
                  <p className="text-red-100 text-sm font-medium">Action irréversible</p>
                </div>
              </div>
            </div>

            {/* Modal Body */}
            <div className="p-6">
              <div className="flex items-center gap-4 mb-6">
                <div className="flex items-center justify-center w-16 h-16 bg-red-50 dark:bg-red-900/20 rounded-xl">
                  <i className="ri-delete-bin-line text-3xl Attention-text"></i>
                </div>
                <div className="flex-1">
                  <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                    Supprimer le projet
                  </h4>
                  <p className="text-gray-600 dark:text-gray-400 text-sm">
                    Êtes-vous sûr de vouloir supprimer le projet 
                    <span className="font-bold text-gray-900 dark:text-white mx-1">"{projectToDelete.title}"</span> ?
                  </p>
                </div>
              </div>
              
              <div className="bg-red-50 dark:bg-red-900/10 border border-red-200 dark:border-red-800 rounded-xl p-4 mb-6">
                <div className="flex items-start gap-3">
                  <i className="ri-information-line Attention-text mt-0.5"></i>
                  <div>
                    <p className="text-red-700 dark:text-red-300 text-sm font-medium mb-1">
                      Attention
                    </p>
                    <p className="text-red-600 dark:text-red-400 text-sm">
                      Cette action ne peut pas être annulée. Toutes les données associées à ce projet seront définitivement supprimées.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-700 px-6 py-4 border-t border-gray-200 dark:border-gray-600">
              <div className="flex justify-end gap-3">
                <button
                  type="button"
                  className="ti-btn ti-btn-secondary-full ti-btn-wave"
                  onClick={() => setProjectToDelete(null)}
                >
                  <i className="ri-close-line me-2"></i>
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
        </div>
      )}

      {/* View Project Modal */}
      {viewProject && (
        <div 
          className="project-view-modal"
          onClick={e => { if (e.target === e.currentTarget) setViewProject(null); }}
        >
          <div className="project-view-modal-content">
            {/* Modal Header */}
            <div className="project-view-modal-header">
              <div style={{display: 'flex', alignItems: 'center', gap: '1rem'}}>
                <div className="project-view-modal-header-icon">
                  <i className="ri-eye-line" style={{fontSize: '1.5rem'}}></i>
                </div>
                <div>
                  <h2 className="project-view-modal-header-title">Détails du Projet</h2>
                  <p className="project-view-modal-header-subtitle">Visualisez toutes les informations du projet</p>
                </div>
                <div style={{flex: 1}}></div>
                <button onClick={() => setViewProject(null)} className="project-view-modal-close">
                  <i className="ri-close-line" style={{fontSize: '1.25rem'}}></i>
                </button>
              </div>
            </div>
            {/* Modal Body */}
            <div className="project-view-modal-body">
              {/* Informations Générales */}
              <div className="project-view-section project-view-section-blue">
                <div className="project-view-section-header">
                  <div className="project-view-section-icon">
                    <i className="ri-file-text-line"></i>
                  </div>
                  <h3 className="project-view-section-title">Informations Générales</h3>
                </div>
                <div className="project-view-grid">
                  <div className="project-view-field">
                    <span className="project-view-label">Titre:</span>
                    <span className="project-view-value">{viewProject.title}</span>
                  </div>
                  <div className="project-view-field">
                    <span className="project-view-label">Maitre d'ouvrage:</span>
                    <span className="project-view-value">{viewProject.client?.company_name || '-'}</span>
                  </div>
                  <div className="project-view-field">
                    <span className="project-view-label">Entité:</span>
                    <span className="project-view-value">{viewProject.entite?.company_name || '-'}</span>
                  </div>
                  <div className="project-view-field">
                    <span className="project-view-label">Objectif:</span>
                    <span className="project-view-value">{viewProject.objectif?.titre || '-'}</span>
                  </div>
                  <div className="project-view-field project-view-field-full">
                    <span className="project-view-label">Description:</span>
                    <span className="project-view-value">{viewProject.description}</span>
                  </div>
                </div>
              </div>
              {/* Planning du Projet */}
              <div className="project-view-section project-view-section-green">
                <div className="project-view-section-header">
                  <div className="project-view-section-icon">
                    <i className="ri-calendar-line"></i>
                  </div>
                  <h3 className="project-view-section-title">Planning du Projet</h3>
                </div>
                <div className="project-view-grid">
                  <div className="project-view-field">
                    <span className="project-view-label">Date début:</span>
                    <span className="project-view-value">{formatDate(viewProject.start_date)}</span>
                  </div>
                  <div className="project-view-field">
                    <span className="project-view-label">Date fin:</span>
                    <span className="project-view-value">{formatDate(viewProject.deadline)}</span>
                  </div>
                </div>
              </div>
              {/* Finances & Statut */}
              <div className="project-view-section project-view-section-purple">
                <div className="project-view-section-header">
                  <div className="project-view-section-icon">
                    <i className="ri-money-dollar-circle-line"></i>
                  </div>
                  <h3 className="project-view-section-title">Finances & Statut</h3>
                </div>
                <div className="project-view-grid">
                  <div className="project-view-field">
                    <span className="project-view-label">Prix:</span>
                    <span className="project-view-value">{viewProject.price}</span>
                  </div>
                  <div className="project-view-field">
                    <span className="project-view-label">Progrès:</span>
                    <span className="project-view-value">{viewProject.prog}%</span>
                  </div>
                  <div className="project-view-field">
                    <span className="project-view-label">Budget d'Engagement:</span>
                    <span className="project-view-value">{viewProject.prog_price}%</span>
                  </div>
                  <div className="project-view-field">
                    <span className="project-view-label">Statut:</span>
                    <span className="project-view-value">{getStatusOptions(formOptions).find(opt => opt.value === viewProject.status)?.label || viewProject.status}</span>
                  </div>
                  <div className="project-view-field project-view-field-full">
                    <span className="project-view-label">Type de Projet:</span>
                    <span className="project-view-value">{viewProject.project_type?.title || '-'}</span>
                  </div>
                  <div className="project-view-field project-view-field-full">
                    <span className="project-view-label">Labels:</span>
                    <span className="project-view-value">{viewProject.labels}</span>
                  </div>
                </div>
              </div>
              {/* Supplémentaires */}
              <div className="project-view-section project-view-section-indigo">
                <div className="project-view-section-header">
                  <div className="project-view-section-icon">
                    <i className="ri-settings-3-line"></i>
                  </div>
                  <h3 className="project-view-section-title">Informations Supplémentaires</h3>
                </div>
                <div className="project-view-grid">
                  <div className="project-view-field">
                    <span className="project-view-label">PAC:</span>
                    <span className="project-view-value">{viewProject.PAC ? 'Oui' : 'Non'}</span>
                  </div>
                  <div className="project-view-field">
                    <span className="project-view-label">Année:</span>
                    <span className="project-view-value">{viewProject['Année'] || '-'}</span>
                  </div>
                  <div className="project-view-field project-view-field-full">
                    <span className="project-view-label">Commentaire:</span>
                    <span className="project-view-value">{viewProject['Commentaire'] || '-'}</span>
                  </div>
                  <div className="project-view-field">
                    <span className="project-view-label">Par intérim:</span>
                    <span className="project-view-value">{viewProject['Par intérim'] === '1' || viewProject['Par intérim'] === 1 || viewProject.par_interim ? 'Oui' : 'Non'}</span>
                  </div>
                </div>
              </div>
              {/* Métadonnées */}
              <div className="project-view-section project-view-section-gray">
                <div className="project-view-section-header">
                  <div className="project-view-section-icon">
                    <i className="ri-user-line"></i>
                  </div>
                  <h3 className="project-view-section-title">Métadonnées</h3>
                </div>
                <div className="project-view-grid">
                  <div className="project-view-field">
                    <span className="project-view-label">Créé par:</span>
                    <span className="project-view-value">{viewProject.creator?.name || '-'}</span>
                  </div>
                  <div className="project-view-field">
                    <span className="project-view-label">Date de création:</span>
                    <span className="project-view-value">{formatDate(viewProject.created_date)}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </Fragment>
  );
};

export default Projects; 