import React, { useState, useEffect } from 'react';
import axiosInstance from '../../Interceptor/axiosInstance.js';
import RoleDropdown from '../../components/ui/RoleDropdown.jsx';
import ReactApexChart from 'react-apexcharts';

const cardStyles = {
  card: 'flex flex-col items-center justify-center bg-white dark:bg-gray-800 rounded-xl shadow-md p-6 m-2 min-w-[180px] min-h-[120px] transition-all duration-300 hover:scale-105 hover:shadow-xl',
  title: 'text-sm font-semibold text-gray-500 dark:text-gray-300 mb-2',
  value: 'text-2xl font-bold text-gray-900 dark:text-white',
  icon: 'text-3xl mb-2',
  grid: 'grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4',
};

const statIcons = {
  total: 'ri-folder-3-line',
  open: 'ri-folder-open-line',
  planned: 'ri-calendar-check-line',
  in_progress: 'ri-loader-4-line',
  completed: 'ri-checkbox-circle-line',
  hold: 'ri-pause-circle-line',
  canceled: 'ri-close-circle-line',
  overdue: 'ri-error-warning-line',
  total_value: 'ri-money-dollar-circle-line',
  completed_value: 'ri-check-double-line',
  active: 'ri-bolt-flash-line',
  pending: 'ri-time-line',
  cancelled: 'ri-close-circle-line',
};

const COLORS = ['#22c55e', '#3b82f6', '#f59e42', '#10b981', '#fbbf24', '#ef4444', '#e11d48'];

const getProjectStatusData = (stats) => [
  { name: 'Ouverts', value: stats?.open ?? 0 },
  { name: 'Planifiés', value: stats?.planned ?? 0 },
  { name: 'En cours', value: stats?.in_progress ?? 0 },
  { name: 'Terminés', value: stats?.completed ?? 0 },
  { name: 'En attente', value: stats?.hold ?? 0 },
  { name: 'Annulés', value: stats?.canceled ?? 0 },
  { name: 'En retard', value: stats?.overdue ?? 0 },
];

const getObjectifStatusData = (stats) => [
  { name: 'Actifs', value: stats?.active ?? 0 },
  { name: 'En attente', value: stats?.pending ?? 0 },
  { name: 'Terminés', value: stats?.completed ?? 0 },
  { name: 'Annulés', value: stats?.cancelled ?? 0 },
  { name: 'En retard', value: stats?.overdue ?? 0 },
];

const PmoDashboard = () => {
  const [roleView, setRoleView] = useState(() => localStorage.getItem('pmo_role_view') || 'admin');
  const [projectStats, setProjectStats] = useState(null);
  const [objectifStats, setObjectifStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshKey, setRefreshKey] = useState(0);

  // Listen for changes in localStorage (from RoleDropdown)
  useEffect(() => {
    const onStorage = () => {
      setRoleView(localStorage.getItem('pmo_role_view') || 'admin');
      setRefreshKey(k => k + 1);
    };
    window.addEventListener('storage', onStorage);
    return () => window.removeEventListener('storage', onStorage);
  }, []);

  // When role changes in dropdown, update state and force refresh
  const handleRoleChange = () => {
    setRoleView(localStorage.getItem('pmo_role_view') || 'admin');
    setRefreshKey(k => k + 1);
  };

  const fetchStats = async (role) => {
    setLoading(true);
    console.log('[PmoDashboard] Fetching stats for role:', role);
    try {
      const projectUrl = `/pmo/projects/statistics?role_view=${role}`;
      const objectifUrl = `/pmo/objectifs/statistics?role_view=${role}`;
      console.log('[PmoDashboard] Project stats URL:', projectUrl);
      console.log('[PmoDashboard] Objectif stats URL:', objectifUrl);
      const [projRes, objRes] = await Promise.all([
        axiosInstance.get(projectUrl),
        axiosInstance.get(objectifUrl),
      ]);
      console.log('[PmoDashboard] Project stats response:', projRes.data);
      console.log('[PmoDashboard] Objectif stats response:', objRes.data);
      setProjectStats(projRes.data?.data || null);
      setObjectifStats(objRes.data?.data || null);
    } catch (e) {
      console.error('[PmoDashboard] Error fetching stats:', e);
      setProjectStats(null);
      setObjectifStats(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // Always read the latest roleView from localStorage
    const currentRole = localStorage.getItem('pmo_role_view') || 'admin';
    console.log('[PmoDashboard] useEffect refreshKey:', refreshKey, 'currentRole:', currentRole);
    setRoleView(currentRole);
    fetchStats(currentRole);
  }, [refreshKey]);

  // Chart options for projects
  const projectPieOptions = {
    chart: { type: 'donut', fontFamily: 'inherit', height: 300 },
    labels: ['Ouverts', 'Planifiés', 'En cours', 'Terminés', 'En attente', 'Annulés', 'En retard'],
    colors: ['#22c55e', '#3b82f6', '#f59e42', '#10b981', '#fbbf24', '#ef4444', '#e11d48'],
    legend: { position: 'bottom', fontSize: '14px', fontWeight: 500 },
    dataLabels: { enabled: true, style: { fontSize: '14px', fontWeight: 600, colors: ['#fff'] } },
    plotOptions: { pie: { donut: { size: '70%' } } },
    responsive: [{ breakpoint: 480, options: { chart: { height: 250 }, legend: { position: 'bottom' } } }],
  };
  const projectPieSeries = [
    projectStats?.open ?? 0,
    projectStats?.planned ?? 0,
    projectStats?.in_progress ?? 0,
    projectStats?.completed ?? 0,
    projectStats?.hold ?? 0,
    projectStats?.canceled ?? 0,
    projectStats?.overdue ?? 0,
  ];
  const projectBarOptions = {
    chart: { type: 'bar', height: 300, fontFamily: 'inherit' },
    plotOptions: { bar: { borderRadius: 4, columnWidth: '55%' } },
    dataLabels: { enabled: true },
    xaxis: { categories: ['Ouverts', 'Planifiés', 'En cours', 'Terminés', 'En attente', 'Annulés', 'En retard'] },
    colors: ['#6366f1'],
    legend: { show: false },
  };
  const projectBarSeries = [{ name: 'Projets', data: projectPieSeries }];

  // Chart options for objectifs
  const objectifPieOptions = {
    chart: { type: 'donut', fontFamily: 'inherit', height: 300 },
    labels: ['Actifs', 'En attente', 'Terminés', 'Annulés', 'En retard'],
    colors: ['#22c55e', '#fbbf24', '#10b981', '#ef4444', '#e11d48'],
    legend: { position: 'bottom', fontSize: '14px', fontWeight: 500 },
    dataLabels: { enabled: true, style: { fontSize: '14px', fontWeight: 600, colors: ['#fff'] } },
    plotOptions: { pie: { donut: { size: '70%' } } },
    responsive: [{ breakpoint: 480, options: { chart: { height: 250 }, legend: { position: 'bottom' } } }],
  };
  const objectifPieSeries = [
    objectifStats?.active ?? 0,
    objectifStats?.pending ?? 0,
    objectifStats?.completed ?? 0,
    objectifStats?.cancelled ?? 0,
    objectifStats?.overdue ?? 0,
  ];
  const objectifBarOptions = {
    chart: { type: 'bar', height: 300, fontFamily: 'inherit' },
    plotOptions: { bar: { borderRadius: 4, columnWidth: '55%' } },
    dataLabels: { enabled: true },
    xaxis: { categories: ['Actifs', 'En attente', 'Terminés', 'Annulés', 'En retard'] },
    colors: ['#22c55e'],
    legend: { show: false },
  };
  const objectifBarSeries = [{ name: 'Objectifs', data: objectifPieSeries }];

  return (
    <div className="p-6 bg-[#f9fafb] min-h-screen">
      <div className="flex flex-col sm:flex-row justify-start items-center mb-8 gap-4">
        <h1 className="text-2xl font-bold text-gray-800 dark:text-white">Tableau de bord PMO</h1>
        <RoleDropdown onRoleViewChange={handleRoleChange} />
      </div>
      {loading ? (
        <div className="flex justify-center items-center min-h-[200px]">
          <div className="animate-spin rounded-full h-10 w-10 border-4 border-primary border-l-transparent"></div>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
            <div className="box hrm-main-card primary w-full">
              <div className="box-body flex items-center gap-4">
                <span className="avatar bg-primary !text-white">
                  <i className="ri-folder-3-line text-[1.5rem]"></i>
                </span>
                <div>
                  <span className="font-semibold text-[#8c9097] dark:text-white/50 block mb-1">Total Projets</span>
                  <h5 className="font-semibold mb-1 text-[1.25rem]">{projectStats?.total ?? '-'}</h5>
                </div>
              </div>
            </div>
            <div className="box hrm-main-card success w-full">
              <div className="box-body flex items-center gap-4">
                <span className="avatar bg-success !text-white">
                  <i className="ri-folder-3-line text-[1.5rem]"></i>
                </span>
                <div>
                  <span className="font-semibold text-[#8c9097] dark:text-white/50 block mb-1">Total Objectifs</span>
                  <h5 className="font-semibold mb-1 text-[1.25rem]">{objectifStats?.total ?? '-'}</h5>
                </div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
            <div className="box w-full">
              <div className="box-header font-semibold mb-2">Statistiques des Projets (Donut)</div>
              <div className="box-body">
                <ReactApexChart options={projectPieOptions} series={projectPieSeries} type="donut" height={300} />
              </div>
            </div>
            <div className="box w-full">
              <div className="box-header font-semibold mb-2">Statistiques des Projets (Barres)</div>
              <div className="box-body">
                <ReactApexChart options={projectBarOptions} series={projectBarSeries} type="bar" height={300} />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
            <div className="box w-full">
              <div className="box-header font-semibold mb-2">Statistiques des Objectifs (Donut)</div>
              <div className="box-body">
                <ReactApexChart options={objectifPieOptions} series={objectifPieSeries} type="donut" height={300} />
              </div>
            </div>
            <div className="box w-full">
              <div className="box-header font-semibold mb-2">Statistiques des Objectifs (Barres)</div>
              <div className="box-body">
                <ReactApexChart options={objectifBarOptions} series={objectifBarSeries} type="bar" height={300} />
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default PmoDashboard; 