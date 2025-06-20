import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axiosInstance from '../../Interceptor/axiosInstance';

const styles = `
  @keyframes spin-slow {
    from {
      transform: rotate(0deg);
    }
    to {
      transform: rotate(360deg);
    }
  }

  .animate-spin-slow {
    animation: spin-slow 3s linear infinite;
  }
`;

const Home = () => {
  const navigate = useNavigate();
  const [selectedSite, setSelectedSite] = useState(null);
  const [hoveredId, setHoveredId] = useState(null);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [dashboardData, setDashboardData] = useState(null);
  const [showComingSoonModal, setShowComingSoonModal] = useState(false);

  // Admin Dashboard data
  const adminDashboard = {
    id: 'admin',
    name: 'Dashboard Admin',
    type: 'Administration',
    status: 'Active',
    image: 'https://cdn.dribbble.com/userupload/17730954/file/original-1ca571d72aed46b341defcb0bf9a18e1.png?resize=752x&vertical=center',
    description: `🔧 Gérez tous vos outils et applications internes depuis un seul endroit.
    📊 Accédez aux statistiques d'utilisation et aux paramètres de configuration.
    👥 Gérez les accès utilisateurs et les permissions.
    🔍 Surveillez les performances et l'état des services.`,
    users: 'Administrateurs',
    access: 'Accès restreint',
    color: 'from-blue-600 to-indigo-600',
    url: '/admin/dashboard'
  };

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const dashboardResponse = await axiosInstance.get(`/getTotalUsers`);
        // console.log(dashboardResponse.data.data.total_users);

        setDashboardData(dashboardResponse.data.data.total_users);
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
      } finally {
      }
    };

    fetchDashboardData();
  }, []);

  useEffect(() => {
    const handleMouseMove = (e) => {
      setMousePosition({ x: e.clientX, y: e.clientY });
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  const sites = [
    {
        id: 1,
        name: 'Demandes Administratives',
        type: 'Analytics',
        status: 'Active',
        image: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f',
        description: `📄 Gérez vos demandes administratives en ligne, comme les demandes de documents ou de congés, facilement et rapidement.
      🕐 Suivez l'état de chaque demande en temps réel depuis votre espace personnel.`,
        users: `${dashboardData} utilisateurs`,
        access: 'Tous les employés',
        color: 'from-emerald-500 to-teal-500',
        url: '/DemandesAdministratives/dashboards'
    },      
    {
      id: 3,
      name: 'sdcp',
      type: 'Documentation',
      status: 'Active',
      image: 'https://images.unsplash.com/photo-1432888498266-38ffec3eaf0a',
      description: 'Bienvenue sur le portail Service Desk Casa Prestations',
      users: '985 utilisateurs',
      access: 'Accès général',
      color: 'from-violet-500 to-purple-500',
      url: '/documentation'
    },
    {
      id: 7,
      name: 'Méga - Organisation',
      type: 'Événementiel',
      status: 'Active',
      image: 'https://images.unsplash.com/photo-1511578314322-379afb476865',
      description: 'Méga - Organisation',
      users: 'À venir',
      access: 'Service événementiel',
      color: 'from-amber-500 to-yellow-500',
      url: '/evenements'
    }
  ];

  const getStatusStyle = (status) => {
    switch (status) {
      case 'Active':
        return 'text-emerald-400 bg-emerald-500/10 ring-1 ring-emerald-500/20';
      case 'Maintenance':
        return 'text-amber-400 bg-amber-500/10 ring-1 ring-amber-500/20';
      default:
        return 'text-gray-400 bg-gray-500/10 ring-1 ring-gray-500/20';
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white py-3 relative overflow-hidden">
      <style>{styles}</style>
      {/* Animated background */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(17,24,39,1),rgba(17,24,39,0.9))]" />
      <div className="absolute inset-0">
        <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(56,189,248,0.1)1px,transparent_1px)] bg-[size:48px_48px]" />
        <div className="absolute inset-0 bg-[linear-gradient(to_bottom,rgba(56,189,248,0.1)1px,transparent_1px)] bg-[size:48px_48px]" />
      </div>

      {/* Admin Dashboard Floating Button */}
      <div className="fixed top-4 right-4 z-50">
        <div className="group relative">
          <button
            onClick={() => setSelectedSite(adminDashboard)}
            className="relative bg-gray-800/80 backdrop-blur-sm p-3 rounded-lg border border-gray-700/50 hover:border-gray-600/50 transition-all duration-300"
          >
            <svg className="w-6 h-6 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" />
            </svg>
            
            {/* Hover Card */}
            <div className="absolute right-0 top-full mt-2 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300 min-w-[300px]">
              <div className="bg-gray-800/90 backdrop-blur-sm rounded-lg border border-gray-700/50 p-4 shadow-xl">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 rounded-full overflow-hidden">
                    <img
                      src={adminDashboard.image}
                      alt="Admin"
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div>
                    <h3 className="text-sm font-semibold text-white">Dashboard Admin</h3>
                    <p className="text-xs text-gray-400">Centre de contrôle</p>
                  </div>
                </div>
                <div className="space-y-2 text-xs text-gray-400">
                  <div className="flex items-center gap-2">
                    <svg className="w-4 h-4 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                    </svg>
                    Accès administrateur uniquement
                  </div>
                  <div className="flex items-center gap-2">
                    <svg className="w-4 h-4 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 12l3-3 3 3 4-4M8 21l4-4 4 4M3 4h18M4 4h16v12a1 1 0 01-1 1H5a1 1 0 01-1-1V4z" />
                    </svg>
                    Gestion & Statistiques
                  </div>
                </div>
              </div>
            </div>
          </button>
        </div>
      </div>

      <div className="container mx-auto px-4 relative">
        <div className="text-center mb-16 relative">
          {/* <div className="flex justify-center mb-8">
            <img 
              src={logo} 
              alt="Casablanca Logo" 
              className="h-20 w-auto filter drop-shadow-2xl"
            />
          </div> */}
          <h1 className="text-6xl font-bold mb-6 relative">
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-emerald-400 to-teal-400">
              Portail Casa Prestations
            </span>
            <div className="absolute -top-8 -right-8 w-24 h-24 bg-emerald-500/20 rounded-full blur-2xl" />
            <div className="absolute -bottom-8 -left-8 w-24 h-24 bg-teal-500/20 rounded-full blur-2xl" />
          </h1>
          <p className="text-gray-400 text-lg max-w-2xl mx-auto">
            Accédez à tous vos outils et applications internes en un seul endroit
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
          {sites.map((site) => (
            <div
              key={site.id}
              onMouseEnter={() => setHoveredId(site.id)}
              onMouseLeave={() => setHoveredId(null)}
              onClick={() => setSelectedSite(site)}
              className="relative group"
            >
              <div
                className={`
                  absolute inset-0 opacity-0 group-hover:opacity-100
                  bg-gradient-to-r ${site.color} blur-xl transition-opacity duration-500
                `}
              />
              <div
                className={`
                  relative bg-gray-800/50 rounded-2xl backdrop-blur-sm
                  border border-gray-700/50 overflow-hidden transition-all duration-500
                  ${hoveredId === site.id ? 'transform scale-105' : ''}
                  group-hover:border-gray-600/50 group-hover:shadow-xl
                `}
                style={{
                  transform: hoveredId === site.id
                    ? `perspective(1000px) rotate3d(
                        ${(mousePosition.y - window.innerHeight / 2) / 100},
                        ${-(mousePosition.x - window.innerWidth / 2) / 100},
                        0,
                        5deg
                      )`
                    : 'none'
                }}
              >
                <div className="aspect-[16/9] relative overflow-hidden">
                  <img
                    src={site.image}
                    alt={site.name}
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-gray-900 via-gray-900/20 to-transparent" />
                </div>

                <div className="p-6 relative">
                  <div className="flex items-center justify-between mb-4">
                    <h2 className="text-xl font-bold text-white group-hover:text-transparent group-hover:bg-clip-text group-hover:bg-gradient-to-r group-hover:from-emerald-400 group-hover:to-teal-400">
                      {site.name}
                    </h2>
                    <span className={`px-3 py-1 rounded-full text-sm ${getStatusStyle(site.status)}`}>
                      {site.status}
                    </span>
                  </div>

                  <div className="space-y-4">
                    <p className="text-gray-400 text-sm line-clamp-2">{site.description}</p>
                    
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div className="flex items-center text-gray-400">
                        <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                        </svg>
                        {site.users}
                      </div>
                      <div className="flex items-center text-gray-400">
                        {site.status === 'Coming Soon' ? (
                          <>
                            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                            </svg>
                            {site.launchDate}
                          </>
                        ) : (
                          <>
                            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
                            </svg>
                            {site.access}
                          </>
                        )}
                      </div>
                    </div>

                    <button
                      onClick={() => setSelectedSite(site)}
                      className={`
                        w-full py-3 px-4 rounded-xl font-medium text-sm
                        transition-all duration-300 relative overflow-hidden
                        bg-gradient-to-r from-emerald-500 to-teal-500 text-white shadow-lg shadow-emerald-500/25
                        hover:shadow-lg hover:shadow-emerald-500/40
                      `}
                    >
                      Accéder au Site
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {selectedSite && (
          <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 z-50">
            <div className="bg-gray-900 rounded-3xl overflow-hidden max-w-4xl w-full relative">
              <div className={`absolute inset-0 bg-gradient-to-br ${selectedSite.color} opacity-10`} />
              <div className="relative p-8">
                <div className="flex items-start gap-8">
                  <div className="w-1/2 aspect-video rounded-xl overflow-hidden">
                    <img
                      src={selectedSite.image}
                      alt={selectedSite.name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-6">
                      <h2 className="text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-emerald-400 to-teal-400">
                        {selectedSite.name}
                      </h2>
                      <button
                        onClick={() => setSelectedSite(null)}
                        className="text-gray-400 hover:text-white transition-colors"
                      >
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </button>
                    </div>

                    <div className="text-gray-400 mb-8 whitespace-pre-line">
                      {selectedSite.description.split('\n').map((line, index) => (
                        <p key={index} className="mb-4">{line.trim()}</p>
                      ))}
                    </div>

                    <div className="grid grid-cols-2 gap-6 mb-8">
                      <div className="space-y-4">
                        <div className="flex items-center text-gray-400">
                          <svg className="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                          </svg>
                          {selectedSite.users}
                        </div>
                        <div className="flex items-center text-gray-400">
                          <svg className="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
                          </svg>
                          {selectedSite.access}
                        </div>
                      </div>
                    </div>

                    <div className="flex gap-4">
                      <button 
                        onClick={() => {
                          if (selectedSite.id === 1) { // Demandes Administratives
                            navigate(selectedSite.url);
                            setSelectedSite(null);
                          } else {
                            setSelectedSite(null);
                            setShowComingSoonModal(true);
                          }
                        }}
                        className="flex-1 bg-gradient-to-r from-emerald-500 to-teal-500 text-white px-8 py-4 rounded-xl font-medium hover:shadow-lg hover:shadow-emerald-500/25 transition-all duration-300"
                      >
                        Ouvrir le Site
                      </button>
                      <button 
                        onClick={() => setSelectedSite(null)}
                        className="px-8 py-4 rounded-xl font-medium bg-gray-800 text-gray-300 hover:bg-gray-700 transition-all duration-300"
                      >
                        Annuler
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {showComingSoonModal && (
          <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 z-50">
            <div className="bg-gray-900 rounded-3xl overflow-hidden max-w-xl w-full relative">
              <div className="absolute inset-0 bg-gradient-to-br from-blue-500 to-purple-500 opacity-10" />
              <div className="relative p-8">
                <div className="flex justify-between items-start mb-6">
                  <h3 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-purple-400">
                    Bientôt Disponible !
                  </h3>
                  <button
                    onClick={() => setShowComingSoonModal(false)}
                    className="text-gray-400 hover:text-white transition-colors"
                  >
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
                <div className="space-y-6">
                  <div className="flex items-center justify-center">
                    <div className="w-24 h-24 rounded-full bg-gradient-to-r from-blue-500 to-purple-500 p-1">
                      <div className="w-full h-full rounded-full bg-gray-900 flex items-center justify-center">
                        <svg className="w-12 h-12 text-blue-400 animate-spin-slow" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                      </div>
                    </div>
                  </div>
                  <p className="text-gray-300 text-center text-lg">
                    Cette fonctionnalité est en cours de développement et sera bientôt disponible !
                  </p>
                  <p className="text-gray-400 text-center">
                    Nous travaillons dur pour vous offrir une expérience exceptionnelle.
                    Revenez bientôt pour découvrir toutes les nouvelles fonctionnalités !
                  </p>
                  <button
                    onClick={() => setShowComingSoonModal(false)}
                    className="w-full bg-gradient-to-r from-blue-500 to-purple-500 text-white px-6 py-3 rounded-xl font-medium hover:shadow-lg hover:shadow-blue-500/25 transition-all duration-300 mt-4"
                  >
                    J'ai Compris
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Home;