import React, { useState, useEffect } from 'react';
import axiosInstance from '../../Interceptor/axiosInstance.js';
import RoleDropdown from '../../components/ui/RoleDropdown.jsx';
import { PieChart, Pie, Cell, Tooltip, Legend, BarChart, Bar, XAxis, YAxis, ResponsiveContainer } from 'recharts';

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

  // Card rendering helper
  const StatCard = ({ icon, title, value, color }) => (
    <div className={cardStyles.card} style={color ? { borderTop: `4px solid ${color}` } : {}}>
      <i className={`${icon} ${cardStyles.icon}`} style={color ? { color } : {}}></i>
      <div className={cardStyles.title}>{title}</div>
      <div className={cardStyles.value}>{value}</div>
    </div>
  );

  return (
    <div className="p-6">
      <div className="flex flex-col sm:flex-row justify-between items-center mb-8 gap-4">
        <h1 className="text-2xl font-bold text-gray-800 dark:text-white">Tableau de bord PMO</h1>
        <RoleDropdown onRoleViewChange={handleRoleChange} />
      </div>
      {loading ? (
        <div className="flex justify-center items-center min-h-[200px]">
          <div className="animate-spin rounded-full h-10 w-10 border-4 border-primary border-l-transparent"></div>
        </div>
      ) : (
        <>
          <h2 className="text-xl font-semibold text-gray-700 dark:text-gray-200 mb-4">Statistiques des Projets</h2>
          <div className="flex flex-col lg:flex-row gap-8 mb-8">
            <div className="flex-1 bg-white dark:bg-gray-800 rounded-xl shadow-md p-4">
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={getProjectStatusData(projectStats)}
                    dataKey="value"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    outerRadius={100}
                    label
                  >
                    {getProjectStatusData(projectStats).map((entry, index) => (
                      <Cell key={`cell-project-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="flex-1 bg-white dark:bg-gray-800 rounded-xl shadow-md p-4">
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={getProjectStatusData(projectStats)}>
                  <XAxis dataKey="name" />
                  <YAxis allowDecimals={false} />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="value" fill="#6366f1" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
          <div className={cardStyles.grid}>
            <StatCard icon={statIcons.total} title="Total Projets" value={projectStats?.total ?? '-'} color="#6366f1" />
            <StatCard icon={statIcons.open} title="Ouverts" value={projectStats?.open ?? '-'} color="#22c55e" />
            <StatCard icon={statIcons.planned} title="Planifiés" value={projectStats?.planned ?? '-'} color="#3b82f6" />
            <StatCard icon={statIcons.in_progress} title="En cours" value={projectStats?.in_progress ?? '-'} color="#f59e42" />
            <StatCard icon={statIcons.completed} title="Terminés" value={projectStats?.completed ?? '-'} color="#10b981" />
            <StatCard icon={statIcons.hold} title="En attente" value={projectStats?.hold ?? '-'} color="#fbbf24" />
            <StatCard icon={statIcons.canceled} title="Annulés" value={projectStats?.canceled ?? '-'} color="#ef4444" />
            <StatCard icon={statIcons.overdue} title="En retard" value={projectStats?.overdue ?? '-'} color="#e11d48" />
            <StatCard icon={statIcons.total_value} title="Valeur totale (DH)" value={projectStats?.total_value?.toLocaleString() ?? '-'} color="#a21caf" />
            <StatCard icon={statIcons.completed_value} title="Valeur terminée (DH)" value={projectStats?.completed_value?.toLocaleString() ?? '-'} color="#0e7490" />
          </div>
          <h2 className="text-xl font-semibold text-gray-700 dark:text-gray-200 mt-10 mb-4">Statistiques des Objectifs</h2>
          <div className="flex flex-col lg:flex-row gap-8 mb-8">
            <div className="flex-1 bg-white dark:bg-gray-800 rounded-xl shadow-md p-4">
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={getObjectifStatusData(objectifStats)}
                    dataKey="value"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    outerRadius={100}
                    label
                  >
                    {getObjectifStatusData(objectifStats).map((entry, index) => (
                      <Cell key={`cell-objectif-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="flex-1 bg-white dark:bg-gray-800 rounded-xl shadow-md p-4">
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={getObjectifStatusData(objectifStats)}>
                  <XAxis dataKey="name" />
                  <YAxis allowDecimals={false} />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="value" fill="#22c55e" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
          <div className={cardStyles.grid}>
            <StatCard icon={statIcons.total} title="Total Objectifs" value={objectifStats?.total ?? '-'} color="#6366f1" />
            <StatCard icon={statIcons.active} title="Actifs" value={objectifStats?.active ?? '-'} color="#22c55e" />
            <StatCard icon={statIcons.pending} title="En attente" value={objectifStats?.pending ?? '-'} color="#fbbf24" />
            <StatCard icon={statIcons.completed} title="Terminés" value={objectifStats?.completed ?? '-'} color="#10b981" />
            <StatCard icon={statIcons.cancelled} title="Annulés" value={objectifStats?.cancelled ?? '-'} color="#ef4444" />
            <StatCard icon={statIcons.overdue} title="En retard" value={objectifStats?.overdue ?? '-'} color="#e11d48" />
          </div>
        </>
      )}
    </div>
  );
};

export default PmoDashboard; 