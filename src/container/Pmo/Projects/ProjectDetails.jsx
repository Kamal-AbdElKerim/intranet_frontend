import { Fragment, useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import ToastService from '../../../components/utile/toastService';
import axiosInstance from '../../../Interceptor/axiosInstance';
import { ToastContainer } from 'react-toastify';
import Select from 'react-select';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import Pageheader from '../../../components/common/pageheader/pageheader.jsx';
import CustomPagination from '../../../components/utile/CustomPagination.jsx';

// Custom styles for the project details page
const projectDetailsStyles = `
  .project-details-page {
    background: white;
    border-radius: 1rem;
    box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
    overflow: hidden;
  }
  
  .dark .project-details-page {
    background: #1f2937;
  }
  
  .project-details-header {
    background: linear-gradient(135deg, #3b82f6 0%, #6366f1 50%, #8b5cf6 100%);
    padding: 1rem;
    position: relative;
  }
  
  @media (min-width: 640px) {
    .project-details-header {
      padding: 1.5rem;
    }
  }
  
  @media (min-width: 1024px) {
    .project-details-header {
      padding: 2rem;
    }
  }
  
  .project-details-header-icon {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 2.5rem;
    height: 2.5rem;
    background: rgba(255, 255, 255, 0.2);
    border-radius: 0.75rem;
    backdrop-filter: blur(4px);
    border: 1px solid rgba(255, 255, 255, 0.3);
  }
  
  @media (min-width: 640px) {
    .project-details-header-icon {
      width: 3rem;
      height: 3rem;
    }
  }
  
  @media (min-width: 1024px) {
    .project-details-header-icon {
      width: 3.5rem;
      height: 3.5rem;
    }
  }
  
  .project-details-header-title {
    font-size: 1.25rem;
    font-weight: 700;
    margin-bottom: 0.25rem;
    color: white;
  }
  
  @media (min-width: 640px) {
    .project-details-header-title {
      font-size: 1.5rem;
    }
  }
  
  .project-details-header-subtitle {
    font-size: 0.75rem;
    font-weight: 500;
    color: #dbeafe;
  }
  
  @media (min-width: 640px) {
    .project-details-header-subtitle {
      font-size: 0.875rem;
    }
  }
  
  .project-details-back-button {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    padding: 0.5rem 0.75rem;
    background: rgba(255, 255, 255, 0.2);
    border-radius: 0.75rem;
    transition: all 0.2s ease;
    backdrop-filter: blur(4px);
    border: 1px solid rgba(255, 255, 255, 0.3);
    color: white;
    cursor: pointer;
    text-decoration: none;
    font-size: 0.875rem;
  }
  
  @media (min-width: 640px) {
    .project-details-back-button {
      padding: 0.75rem 1rem;
      font-size: 1rem;
    }
  }
  
  .project-details-back-button:hover {
    background: rgba(255, 255, 255, 0.3);
    transform: translateY(-1px);
  }
  
  .project-details-tabs {
    display: flex;
    background: #f8fafc;
    border-bottom: 1px solid #e2e8f0;
    flex-direction: column;
  }
  
  @media (min-width: 640px) {
    .project-details-tabs {
      flex-direction: row;
    }
  }
  
  .dark .project-details-tabs {
    background: #374151;
    border-color: #4b5563;
  }
  
  .project-details-tab {
    flex: 1;
    padding: 0.75rem 1rem;
    text-align: center;
    font-weight: 600;
    color: #6b7280;
    cursor: pointer;
    transition: all 0.2s ease;
    border-bottom: 3px solid transparent;
    font-size: 0.875rem;
  }
  
  @media (min-width: 640px) {
    .project-details-tab {
      padding: 1rem 1.5rem;
      font-size: 1rem;
    }
  }
  
  .project-details-tab:hover {
    color: #3b82f6;
    background: #eff6ff;
  }
  
  .project-details-tab.active {
    color: #3b82f6;
    border-bottom-color: #3b82f6;
    background: white;
  }
  
  .dark .project-details-tab {
    color: #9ca3af;
  }
  
  .dark .project-details-tab:hover {
    color: #60a5fa;
    background: #1e3a8a;
  }
  
  .dark .project-details-tab.active {
    color: #60a5fa;
    border-bottom-color: #60a5fa;
    background: #1f2937;
  }
  
  .project-details-tab-content {
    padding: 1rem;
    overflow-y: auto;
  }
  
  @media (min-width: 640px) {
    .project-details-tab-content {
      padding: 1.5rem;
    }
  }
  
  @media (min-width: 1024px) {
    .project-details-tab-content {
      padding: 2rem;
    }
  }
  
  .task-item {
    background: white;
    border: 1px solid #e5e7eb;
    border-radius: 0.75rem;
    padding: 0.75rem;
    margin-bottom: 1rem;
    transition: all 0.2s ease;
  }
  
  @media (min-width: 640px) {
    .task-item {
      padding: 1rem;
    }
  }
  
  .task-item:hover {
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
    transform: translateY(-1px);
  }
  
  .dark .task-item {
    background: #374151;
    border-color: #4b5563;
  }
  
  .task-header {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    margin-bottom: 0.5rem;
    flex-direction: column;
    gap: 0.5rem;
  }
  
  @media (min-width: 640px) {
    .task-header {
      flex-direction: row;
      align-items: center;
      gap: 0;
    }
  }
  
  .task-title {
    font-weight: 600;
    color: #1f2937;
    flex: 1;
    font-size: 0.875rem;
  }
  
  @media (min-width: 640px) {
    .task-title {
      font-size: 1rem;
    }
  }
  
  .dark .task-title {
    color: #f9fafb;
  }
  
  .task-status {
    padding: 0.25rem 0.5rem;
    border-radius: 0.5rem;
    font-size: 0.75rem;
    font-weight: 500;
    white-space: nowrap;
  }
  
  @media (min-width: 640px) {
    .task-status {
      padding: 0.25rem 0.75rem;
      font-size: 0.75rem;
    }
  }
  
  .task-status.pending {
    background: #fef3c7;
    color: #92400e;
  }
  
  .task-status.in-progress {
    background: #dbeafe;
    color: #1e40af;
  }
  
  .task-status.completed {
    background: #dcfce7;
    color: #166534;
  }
  
  .task-description {
    color: #6b7280;
    font-size: 0.75rem;
    margin-bottom: 0.5rem;
  }
  
  @media (min-width: 640px) {
    .task-description {
      font-size: 0.875rem;
    }
  }
  
  .dark .task-description {
    color: #9ca3af;
  }
  
  .task-meta {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
    font-size: 0.75rem;
    color: #9ca3af;
  }
  
  @media (min-width: 640px) {
    .task-meta {
      flex-direction: row;
      gap: 1rem;
      font-size: 0.75rem;
    }
  }
  
  .member-item {
    display: flex;
    align-items: center;
    gap: 0.75rem;
    padding: 0.75rem;
    background: white;
    border: 1px solid #e5e7eb;
    border-radius: 0.5rem;
    margin-bottom: 0.5rem;
  }
  
  .dark .member-item {
    background: #374151;
    border-color: #4b5563;
  }
  
  .member-avatar {
    width: 2.5rem;
    height: 2.5rem;
    border-radius: 50%;
    background: #3b82f6;
    display: flex;
    align-items: center;
    justify-content: center;
    color: white;
    font-weight: 600;
    font-size: 0.875rem;
    flex-shrink: 0;
  }
  
  .member-info {
    flex: 1;
    min-width: 0;
  }
  
  .member-name {
    font-weight: 600;
    color: #1f2937;
    font-size: 0.875rem;
    margin-bottom: 0.25rem;
  }
  
  @media (min-width: 640px) {
    .member-name {
      font-size: 1rem;
    }
  }
  
  .dark .member-name {
    color: #f9fafb;
  }
  
  .member-role {
    font-size: 0.75rem;
    color: #6b7280;
    margin-bottom: 0.25rem;
  }
  
  .dark .member-role {
    color: #9ca3af;
  }
  
  .member-email {
    font-size: 0.75rem;
    color: #9ca3af;
  }
  
  .dark .member-email {
    color: #6b7280;
  }
  
  .member-actions {
    display: flex;
    gap: 0.5rem;
    flex-shrink: 0;
  }
  
  .add-button {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    padding: 0.5rem 0.75rem;
    background: #3b82f6;
    color: white;
    border: none;
    border-radius: 0.5rem;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.2s ease;
    font-size: 0.875rem;
    width: 100%;
    justify-content: center;
  }
  
  @media (min-width: 640px) {
    .add-button {
      padding: 0.75rem 1rem;
      font-size: 1rem;
      width: auto;
    }
  }
  
  .add-button:hover {
    background: #2563eb;
    transform: translateY(-1px);
  }
  
  .empty-state {
    text-align: center;
    padding: 2rem 1rem;
    color: #6b7280;
  }
  
  @media (min-width: 640px) {
    .empty-state {
      padding: 3rem 1rem;
    }
  }
  
  .dark .empty-state {
    color: #9ca3af;
  }
  
  .empty-state-icon {
    font-size: 2rem;
    margin-bottom: 1rem;
    opacity: 0.5;
  }
  
  @media (min-width: 640px) {
    .empty-state-icon {
      font-size: 3rem;
    }
  }
  
  /* Custom color classes */
  .text-blue-light {
    color: #dbeafe !important;
  }
  
  .text-blue-lighter {
    color: #eff6ff !important;
  }
  
  .text-blue-very-light {
    color: #f0f9ff !important;
  }
  
  /* Task Modal Styles */
  .task-modal-overlay {
    position: fixed;
    inset: 0;
    z-index: 9999;
    display: flex;
    align-items: center;
    justify-content: center;
    background: rgba(0, 0, 0, 0.6);
    backdrop-filter: blur(4px);
    padding: 0.5rem;
  }
  
  @media (min-width: 640px) {
    .task-modal-overlay {
      padding: 1rem;
    }
  }
  
  .task-modal-content {
    background: white;
    border-radius: 1rem;
    box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
    width: 100%;
    max-width: 90vw;
    max-height: 95vh;
    display: flex;
    flex-direction: column;
    overflow: hidden;
  }
  
  @media (min-width: 640px) {
    .task-modal-content {
      max-width: 40rem;
    }
  }
  
  .dark .task-modal-content {
    background: #1f2937;
  }
  
  .task-modal-header {
    background: linear-gradient(135deg, #3b82f6 0%, #6366f1 50%, #8b5cf6 100%);
    padding: 1rem 1.5rem;
    position: relative;
  }
  
  @media (min-width: 640px) {
    .task-modal-header {
      padding: 1.5rem 2rem;
    }
  }
  
  .task-modal-header-content {
    display: flex;
    align-items: center;
    gap: 0.75rem;
  }
  
  @media (min-width: 640px) {
    .task-modal-header-content {
      gap: 1rem;
    }
  }
  
  .task-modal-header-icon {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 2.5rem;
    height: 2.5rem;
    background: rgba(255, 255, 255, 0.2);
    border-radius: 0.75rem;
    backdrop-filter: blur(4px);
    border: 1px solid rgba(255, 255, 255, 0.3);
  }
  
  @media (min-width: 640px) {
    .task-modal-header-icon {
      width: 3rem;
      height: 3rem;
    }
  }
  
  .task-modal-header-icon i {
    font-size: 1.25rem;
    color: white;
  }
  
  @media (min-width: 640px) {
    .task-modal-header-icon i {
      font-size: 1.5rem;
    }
  }
  
  .task-modal-header-text {
    flex: 1;
  }
  
  .task-modal-title {
    font-size: 1.125rem;
    font-weight: 700;
    margin-bottom: 0.25rem;
    color: white;
  }
  
  @media (min-width: 640px) {
    .task-modal-title {
      font-size: 1.25rem;
    }
  }
  
  .task-modal-subtitle {
    font-size: 0.75rem;
    font-weight: 500;
    color: #dbeafe;
  }
  
  @media (min-width: 640px) {
    .task-modal-subtitle {
      font-size: 0.875rem;
    }
  }
  
  .task-modal-close {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 2rem;
    height: 2rem;
    background: rgba(255, 255, 255, 0.2);
    border-radius: 0.75rem;
    transition: all 0.2s ease;
    backdrop-filter: blur(4px);
    border: 1px solid rgba(255, 255, 255, 0.3);
    color: white;
    cursor: pointer;
  }
  
  @media (min-width: 640px) {
    .task-modal-close {
      width: 2.5rem;
      height: 2.5rem;
    }
  }
  
  .task-modal-close:hover {
    background: rgba(255, 255, 255, 0.3);
    transform: scale(1.1);
  }
  
  .task-modal-close i {
    font-size: 1rem;
  }
  
  @media (min-width: 640px) {
    .task-modal-close i {
      font-size: 1.25rem;
    }
  }
  
  .task-modal-body {
    padding: 1rem;
    overflow-y: auto;
    flex: 1;
  }
  
  @media (min-width: 640px) {
    .task-modal-body {
      padding: 1.5rem;
    }
  }
  
  @media (min-width: 1024px) {
    .task-modal-body {
      padding: 2rem;
    }
  }
  
  .task-form {
    height: 100%;
    display: flex;
    flex-direction: column;
  }
  
  .task-form-grid {
    display: flex;
    flex-direction: column;
    gap: 1rem;
    flex: 1;
  }
  
  @media (min-width: 640px) {
    .task-form-grid {
      gap: 1.5rem;
    }
  }
  
  .task-form-field {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
  }
  
  .task-form-fieldd {
    // display: flex;
    flex-direction: column;
    gap: 0.5rem;
  }
  
  .task-form-row {
    display: grid;
    grid-template-columns: 1fr;
    gap: 1rem;
  }
  
  @media (min-width: 640px) {
    .task-form-row {
      grid-template-columns: 1fr 1fr;
    }
  }
  
  .task-form-label {
    font-size: 0.875rem;
    font-weight: 600;
    color: #374151;
  }
  
  .dark .task-form-label {
    color: #d1d5db;
  }
  
  .task-form-input,
  .task-form-textarea,
  .task-form-select {
    width: 100%;
    padding: 0.75rem 1rem;
    border: 2px solid #e5e7eb;
    border-radius: 0.5rem;
    font-size: 0.875rem;
    transition: all 0.2s ease;
    background: white;
    color: #374151;
  }
  
  .dark .task-form-input,
  .dark .task-form-textarea,
  .dark .task-form-select {
    background: #374151;
    border-color: #4b5563;
    color: #f9fafb;
  }
  
  .task-form-input:focus,
  .task-form-textarea:focus,
  .task-form-select:focus {
    outline: none;
    border-color: #3b82f6;
    box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
  }
  
  .task-form-textarea {
    resize: vertical;
    min-height: 6rem;
  }
  
  .task-form-select-container {
    width: 100%;
  }
  
  .task-form-select-container .task-form-select__control {
    border: 2px solid #e5e7eb;
    border-radius: 0.5rem;
    min-height: 2.75rem;
    background: white;
    transition: all 0.2s ease;
  }
  
  .dark .task-form-select-container .task-form-select__control {
    background: #374151;
    border-color: #4b5563;
  }
  
  .task-form-select-container .task-form-select__control--is-focused {
    border-color: #3b82f6;
    box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
  }
  
  .task-form-select-container .task-form-select__menu {
    background: white;
    border: 1px solid #e5e7eb;
    border-radius: 0.5rem;
    box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1);
  }
  
  .dark .task-form-select-container .task-form-select__menu {
    background: #374151;
    border-color: #4b5563;
  }
  
  .task-modal-footer {
    background: #f8fafc;
    border-top: 1px solid #e5e7eb;
    padding: 1rem 1.5rem;
    position: sticky;
    bottom: 0;
  }
  
  @media (min-width: 640px) {
    .task-modal-footer {
      padding: 1.5rem 2rem;
    }
  }
  
  .dark .task-modal-footer {
    background: #374151;
    border-color: #4b5563;
  }
  
  .task-modal-footer-content {
    display: flex;
    justify-content: flex-end;
    gap: 0.75rem;
    align-items: center;
    flex-direction: column;
  }
  
  @media (min-width: 640px) {
    .task-modal-footer-content {
      flex-direction: row;
      gap: 1rem;
    }
  }
  
  .task-form-button {
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 0.75rem 1rem;
    border-radius: 0.5rem;
    font-weight: 600;
    font-size: 0.875rem;
    transition: all 0.2s ease;
    cursor: pointer;
    border: none;
    min-width: 120px;
    width: 100%;
  }
  
  @media (min-width: 640px) {
    .task-form-button {
      width: auto;
      padding: 0.75rem 1.5rem;
    }
  }
  
  .task-form-button-primary {
    background: #3b82f6;
    color: white;
  }
  
  .task-form-button-primary:hover {
    background: #2563eb;
    transform: translateY(-1px);
    box-shadow: 0 4px 12px rgba(59, 130, 246, 0.3);
  }
  
  .task-form-button-secondary {
    background: #f3f4f6;
    color: #374151;
  }
  
  .task-form-button-secondary:hover {
    background: #e5e7eb;
    transform: translateY(-1px);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  }
  
  .dark .task-form-button-secondary {
    background: #4b5563;
    color: #f9fafb;
  }
  
  .dark .task-form-button-secondary:hover {
    background: #6b7280;
  }
  
  .task-form-button i {
    font-size: 1rem;
  }
  
  .task-form-checkbox-label {
    display: flex;
    align-items: center;
    gap: 0.75rem;
    cursor: pointer;
    padding: 0.5rem 0;
  }
  
  .task-form-checkbox {
    width: 1.25rem;
    height: 1.25rem;
    accent-color: #3b82f6;
    cursor: pointer;
  }
  
  .task-form-checkbox-text {
    font-size: 0.875rem;
    font-weight: 500;
    color: #374151;
  }
  
  .dark .task-form-checkbox-text {
    color: #d1d5db;
  }
  
  .task-form-input[type="number"] {
    -moz-appearance: textfield;
  }
  
  .task-form-input[type="number"]::-webkit-outer-spin-button,
  .task-form-input[type="number"]::-webkit-inner-spin-button {
    -webkit-appearance: none;
    margin: 0;
  }
  
  /* Error states for task form */
  .task-form-input.input-error,
  .task-form-textarea.input-error {
    border-color: #EF4444 !important;
  }
  
  .task-form-input.input-error:focus,
  .task-form-textarea.input-error:focus {
    border-color: #EF4444 !important;
    box-shadow: 0 0 0 3px rgba(239, 68, 68, 0.1) !important;
  }
  
  .dark .task-form-input.input-error,
  .dark .task-form-textarea.input-error {
    border-color: #F87171 !important;
  }
  
  .dark .task-form-input.input-error:focus,
  .dark .task-form-textarea.input-error:focus {
    border-color: #F87171 !important;
    box-shadow: 0 0 0 3px rgba(248, 113, 113, 0.1) !important;
  }
  
  /* Error message styling for task form */
  .task-form-field .error-message {
    margin-top: 0.5rem;
  }
  
  .task-form-field .error-icon {
    font-size: 1rem;
  }
  
  .task-form-field .error-text {
    font-size: 0.75rem;
  }
  
  /* Responsive grid adjustments */
  @media (max-width: 639px) {
    .grid {
      grid-template-columns: 1fr !important;
    }
    
    .xl\\:col-span-12 {
      grid-column: span 1 / span 1 !important;
    }
  }
  
  /* Pagination responsive */
  @media (max-width: 639px) {
    .pagination-container {
      flex-direction: column;
      gap: 0.5rem;
    }
    
    .pagination-info {
      text-align: center;
    }
  }
  
  /* Attention text styling */
  .Attention-text {
    color: #EF4444;
    font-weight: 600;
  }
  
  .ms-1 {
    margin-left: 0.25rem;
  }
`;

const ProjectDetails = () => {
  const { projectId } = useParams();
  const navigate = useNavigate();
  const [project, setProject] = useState(null);
  const [activeTab, setActiveTab] = useState('tasks');
  const [tasks, setTasks] = useState([]);
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showTaskModal, setShowTaskModal] = useState(false);
  const [showMemberModal, setShowMemberModal] = useState(false);
  const [availableUsers, setAvailableUsers] = useState([]);
  const [taskPagination, setTaskPagination] = useState({
    current: 1,
    total: 0,
    perPage: 10,
    lastPage: 1
  });
  
  // Add separate loading states
  const [tasksLoading, setTasksLoading] = useState(false);
  const [membersLoading, setMembersLoading] = useState(false);
  
  // Task form state
  const [taskForm, setTaskForm] = useState({
    title: '',
    description: '',
    start_date: null,
    deadline: null,
    priority: 'medium',
    status: 'pending',
    assigned_to: null,
    avancement: 0,
    moyens: '',
    pac: '',
    commentaire: '',
    par_interim: false
  });
  
  // Validation errors state
  const [formErrors, setFormErrors] = useState({});

  // Member form state
  const [memberSelections, setMemberSelections] = useState([
    { id: 1, user_id: null, role: 'member' }
  ]);

  // Add member form validation errors state
  const [memberFormErrors, setMemberFormErrors] = useState({});

  // Member submit loading state
  const [memberSubmitLoading, setMemberSubmitLoading] = useState(false);

  // Prevent body scroll when modal is open
  useEffect(() => {
    if (showTaskModal || showMemberModal) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }

    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [showTaskModal, showMemberModal]);

  // Fetch project details
  const fetchProject = async () => {
    try {
      setLoading(true);
      const response = await axiosInstance.get(`/pmo/projects/${projectId}`);
      if (response.data?.status === 'success') {
        setProject(response.data.data);
      } else {
        ToastService.error('Projet non trouvé');
        navigate('/Pmo/Projects');
      }
    } catch (error) {
      ToastService.error('Erreur lors du chargement du projet');
      navigate('/Pmo/Projects');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (projectId) {
      fetchProject();
    }
  }, [projectId]);

  // Fetch tasks for the project
  const fetchTasks = async () => {
    try {
      setTasksLoading(true);
      const response = await axiosInstance.get(`/pmo/projects/${projectId}/tasks`, {
        params: { page: taskPagination.current }
      });
      console.log("tasks", response.data);
      
      if (response.data?.status === 'success') {
        const paginatedData = response.data.data;
        setTasks(paginatedData.data || []);
        setTaskPagination({
          current: paginatedData.current_page || 1,
          total: paginatedData.total || 0,
          perPage: paginatedData.per_page || 10,
          lastPage: paginatedData.last_page || 1
        });
      }
    } catch (error) {
      ToastService.error('Erreur lors du chargement des tâches');
    } finally {
      setTasksLoading(false);
    }
  };

  // Fetch members for the project
  const fetchMembers = async () => {
    try {
      setMembersLoading(true);
      const response = await axiosInstance.get(`/pmo/projects/${projectId}/members`);
      console.log("response", response.data);
      if (response.data?.status === 'success') {
        setMembers(response.data.data || []);
      }
    } catch (error) {
      ToastService.error('Erreur lors du chargement des membres');
    } finally {
      setMembersLoading(false);
    }
  };

  // Fetch available users for assignment
  const fetchAvailableUsers = async () => {
    try {
      const response = await axiosInstance.get('/listUsers');
      console.log('Available users response:', response.data);
      if (response.data?.status === 'success') {
        setAvailableUsers(response.data.data || []);
      } else {
        console.warn('Unexpected response format from /users API');
        setAvailableUsers([]);
      }
    } catch (error) {
      console.error('Error fetching users:', error);
      ToastService.error('Erreur lors du chargement des utilisateurs');
      setAvailableUsers([]);
    }
  };

  useEffect(() => {
    if (project) {
      fetchTasks();
      fetchMembers();
      fetchAvailableUsers();
    }
  }, [project, taskPagination.current]);

  // Validate task form
  const validateTaskForm = () => {
    const errors = {};

    // Title validation
    if (!taskForm.title.trim()) {
      errors.title = 'Le titre de la tâche est requis';
    } else if (taskForm.title.trim().length < 3) {
      errors.title = 'Le titre doit contenir au moins 3 caractères';
    }

    // Avancement validation
    if (taskForm.avancement < 0 || taskForm.avancement > 100) {
      errors.avancement = 'L\'avancement doit être entre 0 et 100%';
    }

    // Date validation
    if (taskForm.start_date && taskForm.deadline && taskForm.start_date > taskForm.deadline) {
      errors.deadline = 'La date de fin doit être après la date de début';
    }

    // PAC validation
    if (taskForm.pac && taskForm.pac.trim().length < 2) {
      errors.pac = 'Le PAC doit contenir au moins 2 caractères';
    }

    // Moyens validation
    if (taskForm.moyens && taskForm.moyens.trim().length < 5) {
      errors.moyens = 'Les moyens doivent contenir au moins 5 caractères';
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // Validate multiple member selections
  const validateMemberSelections = () => {
    const errors = {};
    
    memberSelections.forEach((selection, index) => {
      if (!selection.user_id) {
        errors[`user_${selection.id}`] = 'Veuillez sélectionner un utilisateur';
      }
    });

    setMemberFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // Add new member selection
  const addMemberSelection = () => {
    const newId = Math.max(...memberSelections.map(s => s.id)) + 1;
    setMemberSelections([...memberSelections, { id: newId, user_id: null, role: 'member' }]);
  };

  // Remove member selection
  const removeMemberSelection = (id) => {
    if (memberSelections.length > 1) {
      setMemberSelections(memberSelections.filter(selection => selection.id !== id));
    }
  };

  // Update member selection
  const updateMemberSelection = (id, field, value) => {
    setMemberSelections(memberSelections.map(selection => 
      selection.id === id ? { ...selection, [field]: value } : selection
    ));
  };

  // Handle task form submission
  const handleTaskSubmit = async (e) => {
    e.preventDefault();
    
    // Clear previous errors
    setFormErrors({});
    
    // Validate form
    if (!validateTaskForm()) {
      return;
    }
    
    try {
      const response = await axiosInstance.post(`/pmo/projects/${projectId}/tasks`, {
        ...taskForm,
        start_date: taskForm.start_date ? taskForm.start_date.toISOString().split('T')[0] : null,
        deadline: taskForm.deadline ? taskForm.deadline.toISOString().split('T')[0] : null,
        assigned_to: taskForm.assigned_to?.value || null,
        avancement: parseInt(taskForm.avancement) || 0,
        moyens: taskForm.moyens.trim(),
        pac: taskForm.pac.trim(),
        commentaire: taskForm.commentaire.trim(),
        par_interim: taskForm.par_interim
      });
      
      if (response.data?.status === 'success') {
        ToastService.success('Tâche créée avec succès');
        setShowTaskModal(false);
        setTaskForm({
          title: '',
          description: '',
          start_date: null,
          deadline: null,
          priority: 'medium',
          status: 'pending',
          assigned_to: null,
          avancement: 0,
          moyens: '',
          pac: '',
          commentaire: '',
          par_interim: false
        });
        setFormErrors({});
        // Reset pagination to first page and fetch tasks
        setTaskPagination(prev => ({ ...prev, current: 1 }));
        fetchTasks();
      }
    } catch (error) {
      ToastService.error(error.response?.data?.message || 'Erreur lors de la création de la tâche');
    }
  };

  // Handle member form submission
  const handleMemberSubmit = async (e) => {
    e.preventDefault();
    setMemberFormErrors({});
    if (!validateMemberSelections()) return;

    setMemberSubmitLoading(true);
    try {
      const validSelections = memberSelections.filter(selection => selection.user_id);
      if (validSelections.length === 0) {
        ToastService.error('Veuillez sélectionner au moins un utilisateur');
        setMemberSubmitLoading(false);
        return;
      }
      if (validSelections.length === 1) {
        const response = await axiosInstance.post(`/pmo/projects/${projectId}/members`, {
          user_id: validSelections[0].user_id.value,
          is_leader: validSelections[0].role === 'leader'
        });
        if (response.data?.status === 'success') {
          ToastService.success('Membre ajouté avec succès');
          setShowMemberModal(false);
          setMemberSelections([{ id: 1, user_id: null, role: 'member' }]);
          setMemberFormErrors({});
          fetchMembers();
        }
      } else {
        const membersData = validSelections.map(selection => ({
          user_id: selection.user_id.value,
          is_leader: selection.role === 'leader'
        }));
        const response = await axiosInstance.post(`/pmo/projects/${projectId}/members`, {
          members: membersData
        });
        if (response.data?.status === 'success') {
          const { summary } = response.data;
          ToastService.success(response.data.message);
          setShowMemberModal(false);
          setMemberSelections([{ id: 1, user_id: null, role: 'member' }]);
          setMemberFormErrors({});
          fetchMembers();
        }
      }
    } catch (error) {
      ToastService.error(error.response?.data?.message || 'Erreur lors de l\'ajout des membres');
    } finally {
      setMemberSubmitLoading(false);
    }
  };

  // Remove member from project
  const handleRemoveMember = async (memberId) => {
    try {
      const response = await axiosInstance.delete(`/pmo/projects/${projectId}/members/${memberId}`);
      if (response.data?.status === 'success') {
        ToastService.success('Membre retiré avec succès');
        fetchMembers();
      }
    } catch (error) {
      ToastService.error('Erreur lors du retrait du membre');
    }
  };

  // Handle task pagination
  const handleTaskPageChange = (page) => {
    setTaskPagination(prev => ({ ...prev, current: page }));
  };

  // Get status color for tasks
  const getTaskStatusColor = (status) => {
    switch (status) {
      case 'to_do':
      case 'pending': return 'pending';
      case 'in_progress': return 'in-progress';
      case 'completed': return 'completed';
      case 'done': return 'completed';
      default: return 'pending';
    }
  };

  // Get status label for tasks
  const getTaskStatusLabel = (status) => {
    switch (status) {
      case 'to_do': return 'À faire';
      case 'pending': return 'En attente';
      case 'in_progress': return 'En cours';
      case 'completed': return 'Terminé';
      case 'done': return 'Terminé';
      default: return 'En attente';
    }
  };

  // Get role label
  const getRoleLabel = (role) => {
    switch (role) {
      case 'manager': return 'Gestionnaire';
      case 'member': return 'Membre';
      case 'viewer': return 'Observateur';
      default: return 'Membre';
    }
  };

  // Format date
  const formatDate = (dateString) => {
    if (!dateString) return '-';
    const date = new Date(dateString);
    return date.toLocaleDateString('fr-FR');
  };

  // Render error message
  const renderErrorMessage = (fieldName) => {
    if (formErrors[fieldName]) {
      return (
        <div className="error-message">
          <i className="ri-error-warning-line error-icon"></i>
          <span className="error-text">{formErrors[fieldName]}</span>
        </div>
      );
    }
    return null;
  };

  // Skeleton loader for tasks
  const TaskSkeleton = () => (
    <div className="space-y-4">
      {[1, 2, 3].map((index) => (
        <div key={index} className="task-item animate-pulse">
          <div className="task-header">
            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4 mb-2"></div>
            <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-20"></div>
          </div>
          <div className="space-y-2">
            <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-full"></div>
            <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-2/3"></div>
          </div>
          <div className="task-meta mt-3">
            <div className="flex gap-4">
              <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-24"></div>
              <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-20"></div>
              <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-28"></div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );

  // Skeleton loader for members
  const MemberSkeleton = () => (
    <div className="space-y-4">
      {[1, 2, 3].map((index) => (
        <div key={index} className="member-item animate-pulse">
          <div className="member-avatar bg-gray-200 dark:bg-gray-700"></div>
          <div className="member-info flex-1">
            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-32 mb-1"></div>
            <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-20 mb-1"></div>
            <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-40"></div>
          </div>
          <div className="member-actions">
            <div className="h-5 w-5 bg-gray-200 dark:bg-gray-700 rounded"></div>
          </div>
        </div>
      ))}
    </div>
  );

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="project-details-page animate-pulse">
            {/* Header Skeleton */}
            <div className="project-details-header">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="project-details-header-icon bg-white/20"></div>
                  <div>
                    <div className="h-6 bg-white/30 rounded w-48 mb-2"></div>
                    <div className="h-4 bg-white/20 rounded w-64"></div>
                  </div>
                </div>
                <div className="h-10 bg-white/20 rounded w-32"></div>
              </div>
            </div>

            {/* Tabs Skeleton */}
            <div className="project-details-tabs">
              <div className="flex">
                <div className="flex-1 h-12 bg-gray-200 dark:bg-gray-700"></div>
                <div className="flex-1 h-12 bg-gray-200 dark:bg-gray-700"></div>
              </div>
            </div>

            {/* Content Skeleton */}
            <div className="project-details-tab-content">
              <div className="flex justify-between items-center mb-6">
                <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-32"></div>
                <div className="h-10 bg-gray-200 dark:bg-gray-700 rounded w-40"></div>
              </div>
              <TaskSkeleton />
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!project) {
    return null;
  }

  return (
    <Fragment>
      <style>{projectDetailsStyles}</style>
      <ToastContainer position="top-right" autoClose={3000} hideProgressBar={false} newestOnTop closeOnClick rtl={false} pauseOnFocusLoss draggable pauseOnHover theme="colored" />
      
      <Pageheader currentpage="Détails du Projet" activepage="PMO" mainpage="Projects" />
      
      <div className="grid grid-cols-12 gap-6">
        <div className="xl:col-span-12 col-span-12">
          <div className="project-details-page">
            {/* Header */}
            <div className="project-details-header">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="project-details-header-icon">
                    <i className="ri-project-2-line text-2xl"></i>
                  </div>
                  <div>
                    <h1 className="project-details-header-title">{project.title}</h1>
                    <p className="project-details-header-subtitle">Gestion des tâches et membres du projet</p>
                  </div>
                </div>
                <button 
                  onClick={() => navigate('/Pmo/Projects')}
                  className="project-details-back-button"
                >
                  <i className="ri-arrow-left-line"></i>
                  Retour aux Projets
                </button>
              </div>
            </div>

            {/* Tabs */}
            <div className="project-details-tabs">
              <button
                className={`project-details-tab ${activeTab === 'tasks' ? 'active' : ''}`}
                onClick={() => setActiveTab('tasks')}
              >
                <i className="ri-task-line mr-2"></i>
                Tâches / Sous action
              </button>
              <button
                className={`project-details-tab ${activeTab === 'members' ? 'active' : ''}`}
                onClick={() => setActiveTab('members')}
              >
                <i className="ri-team-line mr-2"></i>
                Les membres du Projet
              </button>
            </div>

            {/* Content */}
            <div className="project-details-tab-content">
              {activeTab === 'tasks' && (
                <div>
                  <div className="flex justify-between items-center mb-6">
                    <h3 className="text-xl font-semibold text-gray-900 dark:text-white">Tâches du Projet</h3>
                    <button 
                      onClick={() => setShowTaskModal(true)}
                      className="add-button"
                    >
                      <i className="ri-add-line"></i>
                      Ajouter une Tâche
                    </button>
                  </div>
                  
                  {tasksLoading ? (
                    <TaskSkeleton />
                  ) : tasks.length > 0 ? (
                    <div className="space-y-4">
                      {tasks.map((task) => (
                        <div key={task.id} className="task-item">
                          <div className="task-header">
                            <h4 className="task-title">{task.title}</h4>
                            <span className={`task-status ${getTaskStatusColor(task.status)}`}>
                              {getTaskStatusLabel(task.status)}
                            </span>
                          </div>
                          {task.description && (
                            <div 
                              className="task-description"
                              dangerouslySetInnerHTML={{ __html: task.description }}
                            />
                          )}
                          <div className="task-meta">
                            <span>
                              <i className="ri-calendar-line mr-1"></i>
                              Début: {formatDate(task.start_date)}
                            </span>
                            <span>
                              <i className="ri-time-line mr-1"></i>
                              Fin: {formatDate(task.deadline)}
                            </span>
                            {task.assigned_user && (
                              <span>
                                <i className="ri-user-line mr-1"></i>
                                Assigné à: {task.assigned_user.name || task.assigned_user.email || 'Utilisateur inconnu'}
                              </span>
                            )}
                            {task.status_relation && (
                              <span>
                                <i className="ri-checkbox-line mr-1"></i>
                                Statut: {task.status_relation.name || task.status}
                              </span>
                            )}
                            {task.prog_task && (
                              <span>
                                <i className="ri-percent-line mr-1"></i>
                                Avancement: {task.prog_task}%
                              </span>
                            )}
                          </div>
                        </div>
                      ))}
                      
                      {/* Pagination */}
                      {taskPagination.total > taskPagination.perPage && (
                        <div className="mt-6">
                          <CustomPagination
                            current={taskPagination.current}
                            total={taskPagination.total}
                            perPage={taskPagination.perPage}
                            lastPage={taskPagination.lastPage}
                            onPageChange={handleTaskPageChange}
                            className="w-full"
                          />
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="text-center text-gray-500 dark:text-gray-400 py-8">
                      <i className="ri-task-line text-4xl mb-4 opacity-50"></i>
                      <p>Aucune tâche trouvée pour ce projet</p>
                    </div>
                  )}
                </div>
              )}

              {activeTab === 'members' && (
                <div>
                  <div className="flex justify-between items-center mb-6">
                    <h3 className="text-xl font-semibold text-gray-900 dark:text-white">Membres du Projet</h3>
                    <button 
                      onClick={() => setShowMemberModal(true)}
                      className="add-button"
                    >
                      <i className="ri-user-add-line"></i>
                      Ajouter un Membre
                    </button>
                  </div>
                  
                  {membersLoading ? (
                    <MemberSkeleton />
                  ) : members.length > 0 ? (
                    <div className="space-y-4">
                      {members.map((member) => (
                        <div key={member.id} className="member-item">
                          <div className="member-avatar">
                            <span>{member.user?.full_name?.charAt(0)?.toUpperCase() || 'U'}</span>
                          </div>
                          <div className="member-info">
                            <div className="member-name">{member.user?.full_name || 'Utilisateur inconnu'}</div>
                            <div className="member-role">
                              {member.is_leader ? 'Chef de projet' : 'Membre'}
                            </div>
                            <div className="member-email text-sm text-gray-500 dark:text-gray-400">
                              {member.user?.email || 'Email non disponible'}
                            </div>
                          </div>
                          <div className="member-actions">
                            {!member.is_leader && (
                              <button
                                onClick={() => handleRemoveMember(member.id)}
                                className="text-red-500 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300"
                                title="Retirer le membre"
                              >
                                <i className="ri-delete-bin-line text-lg"></i>
                              </button>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center text-gray-500 dark:text-gray-400 py-8">
                      <i className="ri-team-line text-4xl mb-4 opacity-50"></i>
                      <p>Aucun membre trouvé pour ce projet</p>
                      <p className="text-sm mt-2">Ajoutez des membres pour commencer à collaborer</p>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Task Modal */}
      {showTaskModal && (
        <div className="task-modal-overlay" onClick={() => setShowTaskModal(false)}>
          <div className="task-modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="task-modal-header">
              <div className="task-modal-header-content">
                <div className="task-modal-header-icon">
                  <i className="ri-task-line"></i>
                </div>
                <div className="task-modal-header-text">
                  <h2 className="task-modal-title">Ajouter une Tâche</h2>
                  <p className="task-modal-subtitle">Créez une nouvelle tâche pour ce projet</p>
                </div>
                <button onClick={() => setShowTaskModal(false)} className="task-modal-close">
                  <i className="ri-close-line"></i>
                </button>
              </div>
            </div>

            <div className="task-modal-body">
              <form onSubmit={handleTaskSubmit} className="task-form">
                <div className="task-form-grid">
                  <div className="task-form-field">
                    <label className="task-form-label">
                      Titre de la tâche
                    </label>
                    <input
                      type="text"
                      value={taskForm.title}
                      onChange={(e) => setTaskForm({...taskForm, title: e.target.value})}
                      className={`task-form-input ${formErrors.title ? 'input-error' : ''}`}
                      placeholder="Entrez le titre de la tâche"
                    />
                    {renderErrorMessage('title')}
                  </div>

                  <div className="task-form-field">
                    <label className="task-form-label">
                      Description
                    </label>
                    <textarea
                      value={taskForm.description}
                      onChange={(e) => setTaskForm({...taskForm, description: e.target.value})}
                      className="task-form-textarea"
                      rows={3}
                      placeholder="Décrivez la tâche"
                    />
                  </div>

                  <div className="task-form-row">
                    <div className="task-form-field">
                      <label className="task-form-label">
                        Date de début
                      </label>
                      <DatePicker
                        selected={taskForm.start_date}
                        onChange={(date) => setTaskForm({...taskForm, start_date: date})}
                        className="task-form-input"
                        dateFormat="dd/MM/yyyy"
                        placeholderText="Sélectionner une date"
                      />
                    </div>

                    <div className="task-form-field">
                      <label className="task-form-label">
                        Date de fin
                      </label>
                      <DatePicker
                        selected={taskForm.deadline}
                        onChange={(date) => setTaskForm({...taskForm, deadline: date})}
                        className={`task-form-input ${formErrors.deadline ? 'input-error' : ''}`}
                        dateFormat="dd/MM/yyyy"
                        placeholderText="Sélectionner une date"
                        minDate={taskForm.start_date}
                      />
                      {renderErrorMessage('deadline')}
                    </div>
                  </div>

                  <div className="task-form-row">
                    <div className="task-form-field">
                      <label className="task-form-label">
                        Priorité
                      </label>
                      <select
                        value={taskForm.priority}
                        onChange={(e) => setTaskForm({...taskForm, priority: e.target.value})}
                        className="task-form-select"
                      >
                        <option value="low">Faible</option>
                        <option value="medium">Moyenne</option>
                        <option value="high">Élevée</option>
                      </select>
                    </div>

                    <div className="task-form-field">
                      <label className="task-form-label">
                        Statut
                      </label>
                      <select
                        value={taskForm.status}
                        onChange={(e) => setTaskForm({...taskForm, status: e.target.value})}
                        className="task-form-select"
                      >
                        <option value="pending">En attente</option>
                        <option value="in_progress">En cours</option>
                        <option value="completed">Terminé</option>
                      </select>
                    </div>
                  </div>

                  <div className="task-form-field">
                    <label className="task-form-label">
                      Assigner à
                    </label>
                    {members.length === 0 ? (
                      <div className="text-sm text-orange-600 dark:text-orange-400 p-2 bg-orange-50 dark:bg-orange-900/20 rounded border border-orange-200 dark:border-orange-800">
                        <i className="ri-information-line mr-1"></i>
                        Aucun membre dans le projet. Veuillez d'abord ajouter des membres au projet.
                      </div>
                    ) : (
                      <Select
                        options={members.map(member => ({
                          value: member.user_id,
                          label: member.user?.full_name || member.user?.name || 'Utilisateur inconnu'
                        }))}
                        value={taskForm.assigned_to}
                        onChange={(option) => setTaskForm({...taskForm, assigned_to: option})}
                        placeholder="Sélectionner un membre du projet"
                        isClearable
                        className="task-form-select-container"
                        classNamePrefix="task-form-select"
                        menuPosition="fixed"
                        menuPlacement="top"
                      />
                    )}
                  </div>

                  <div className="task-form-row">
                    <div className="task-form-field">
                      <label className="task-form-label">
                        Avancement (%)
                      </label>
                      <input
                        type="number"
                        value={taskForm.avancement}
                        onChange={(e) => setTaskForm({...taskForm, avancement: e.target.value})}
                        className={`task-form-input ${formErrors.avancement ? 'input-error' : ''}`}
                        min="0"
                        max="100"
                        placeholder="0-100"
                      />
                      {renderErrorMessage('avancement')}
                    </div>

                    <div className="task-form-field">
                      <label className="task-form-label">
                        PAC
                      </label>
                      <input
                        type="text"
                        value={taskForm.pac}
                        onChange={(e) => setTaskForm({...taskForm, pac: e.target.value})}
                        className={`task-form-input ${formErrors.pac ? 'input-error' : ''}`}
                        placeholder="Entrez le PAC"
                      />
                      {renderErrorMessage('pac')}
                    </div>
                  </div>

                  <div className="task-form-field">
                    <label className="task-form-label">
                      Moyens
                    </label>
                    <textarea
                      value={taskForm.moyens}
                      onChange={(e) => setTaskForm({...taskForm, moyens: e.target.value})}
                      className={`task-form-textarea ${formErrors.moyens ? 'input-error' : ''}`}
                      rows={3}
                      placeholder="Décrivez les moyens nécessaires"
                    />
                    {renderErrorMessage('moyens')}
                  </div>

                  <div className="task-form-field">
                    <label className="task-form-label">
                      Commentaire
                    </label>
                    <textarea
                      value={taskForm.commentaire}
                      onChange={(e) => setTaskForm({...taskForm, commentaire: e.target.value})}
                      className="task-form-textarea"
                      rows={3}
                      placeholder="Ajoutez un commentaire"
                    />
                  </div>

                  <div className="task-form-field">
                    <label className="task-form-checkbox-label">
                      <input
                        type="checkbox"
                        checked={taskForm.par_interim}
                        onChange={(e) => setTaskForm({...taskForm, par_interim: e.target.checked})}
                        className="task-form-checkbox"
                      />
                      <span className="task-form-checkbox-text">Par intérim</span>
                    </label>
                  </div>
                </div>
              </form>
            </div>

            <div className="task-modal-footer">
              <div className="task-modal-footer-content">
                <button
                  type="button"
                  onClick={() => setShowTaskModal(false)}
                  className="task-form-button task-form-button-secondary"
                >
                  <i className="ri-close-line mr-2"></i>
                  Annuler
                </button>
                <button
                  type="submit"
                  onClick={handleTaskSubmit}
                  className="task-form-button task-form-button-primary"
                >
                  <i className="ri-check-line mr-2"></i>
                  Créer la Tâche
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Member Modal */}
      {showMemberModal && (
        <div className="task-modal-overlay" onClick={() => setShowMemberModal(false)}>
          <div className="task-modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="task-modal-header">
              <div className="task-modal-header-content">
                <div className="task-modal-header-icon">
                  <i className="ri-user-add-line"></i>
                </div>
                <div className="task-modal-header-text">
                  <h2 className="task-modal-title">Ajouter un Membre</h2>
                  <p className="task-modal-subtitle">Assignez un utilisateur à ce projet</p>
                </div>
                <button onClick={() => setShowMemberModal(false)} className="task-modal-close">
                  <i className="ri-close-line"></i>
                </button>
              </div>
            </div>

            <div className="task-modal-body">
              <form onSubmit={handleMemberSubmit} className="task-form">
                <div className="task-form-grid">
                  {memberSelections.map((selection, index) => (
                    <div key={selection.id} className="task-form-field">
                      <div className="flex items-center justify-between mb-2">
                        <label className="task-form-label">
                          Utilisateur {memberSelections.length > 1 ? index + 1 : ''} <span className="Attention-text ms-1">*</span>
                        </label>
                        {memberSelections.length > 1 && (
                          <button
                            type="button"
                            onClick={() => removeMemberSelection(selection.id)}
                            className="text-red-500 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300 text-sm"
                            title="Supprimer cette sélection"
                          >
                            <i className="ri-delete-bin-line"></i>
                          </button>
                        )}
                      </div>
                      {(() => {
                        const availableUsersArray = Array.isArray(availableUsers) ? availableUsers : [];
                        const memberUserIds = members.map(m => m.user_id);
                        // Filter out users already selected in other selections and already project members
                        const filteredUsers = availableUsersArray.filter(user => {
                          const isSelectedInOtherSelections = memberSelections
                            .filter(s => s.id !== selection.id)
                            .some(s => s.user_id?.value === user.id);
                          const isAlreadyMember = memberUserIds.includes(user.id);
                          return !isSelectedInOtherSelections && !isAlreadyMember;
                        });
                        if (filteredUsers.length === 0) {
                          return (
                            <div className="text-sm text-orange-600 dark:text-orange-400 p-2 bg-orange-50 dark:bg-orange-900/20 rounded border border-orange-200 dark:border-orange-800">
                              <i className="ri-information-line mr-1"></i>
                              Aucun utilisateur disponible pour cette sélection.
                            </div>
                          );
                        }
                        const selectOptions = filteredUsers.map(user => ({
                          value: user.id,
                          label: user.first_name && user.last_name 
                            ? `${user.first_name} ${user.last_name}`.trim()
                            : user.name || user.email || 'Utilisateur inconnu'
                        }));
                        return (
                          <div>
                            <Select
                              options={selectOptions}
                              value={selection.user_id}
                              onChange={(option) => updateMemberSelection(selection.id, 'user_id', option)}
                              placeholder="Sélectionner un utilisateur"
                              isClearable
                              className={`task-form-select-container ${memberFormErrors[`user_${selection.id}`] ? 'input-error' : ''}`}
                              classNamePrefix="task-form-select"
                              required
                              menuPosition="fixed"
                              menuPlacement="top"
                            />
                            {memberFormErrors[`user_${selection.id}`] && (
                              <div className="error-message mt-1">
                                <i className="ri-error-warning-line error-icon"></i>
                                <span className="error-text">{memberFormErrors[`user_${selection.id}`]}</span>
                              </div>
                            )}
                          </div>
                        );
                      })()}
                    </div>
                  ))}
                  
                  <div className="task-form-fieldd">
                    <button
                      type="button"
                      onClick={addMemberSelection}
                      className="ti-btn ti-btn-info-full ti-btn-wave"
                    >
                      <i className="ri-add-line mr-2"></i>
                      Ajouter plus
                    </button>
                  </div>
                </div>
              </form>
            </div>

            <div className="task-modal-footer">
              <div className="task-modal-footer-content">
                <button
                  type="button"
                  onClick={() => setShowMemberModal(false)}
                  className="task-form-button task-form-button-secondary"
                >
                  <i className="ri-close-line mr-2"></i>
                  Annuler
                </button>
                <button
                  type="submit"
                  onClick={handleMemberSubmit}
                  className="task-form-button task-form-button-primary"
                  disabled={memberSubmitLoading}
                >
                  {memberSubmitLoading ? (
                    <>
                      <i className="ri-loader-4-line mr-2 animate-spin"></i>
                      Ajout en cours...
                    </>
                  ) : (
                    <>
                      <i className="ri-check-line mr-2"></i>
                      {memberSelections.length > 1 ? `Ajouter ${memberSelections.length} Membres` : 'Ajouter le Membre'}
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </Fragment>
  );
};

export default ProjectDetails; 