import  {  Fragment, useState, useEffect, useRef } from 'react';
import "react-datepicker/dist/react-datepicker.css";
import Pageheader from '../../../../components/common/pageheader/pageheader';
import axiosInstance from '../../../../Interceptor/axiosInstance';
import ReactApexChart from 'react-apexcharts';
import React from 'react';
import { ToastContainer } from 'react-toastify';
import { useAuth } from '../../../../components/utile/AuthProvider';
import CustomPagination from '../../../../components/utile/CustomPagination';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';

const RequestSummaryChart = ({ data }) => {
  const [state, setState] = React.useState({
    series: [
      data?.["En attente"] || 0,
      data?.["Traité"] || 0,
      data?.["Refusé"] || 0,
      data?.["Retourné"] || 0
    ],
    options: {
      chart: {
        type: 'donut',
        height: 300,
        fontFamily: 'inherit',
      },
      labels: ['En attente', 'Traité', 'Refusé', 'Retourné'],
      colors: ['#FEB019', '#00E396', '#FF4560', '#008FFB'],
      plotOptions: {
        pie: {
          donut: {
            size: '70%',
            labels: {
              show: true,
              name: {
                show: true,
                fontSize: '14px',
                fontWeight: 600,
                offsetY: -10,
              },
              value: {
                show: true,
                fontSize: '20px',
                fontWeight: 700,
                offsetY: 5,
                formatter: function (val) {
                  return val
                }
              },
              total: {
                show: true,
                label: 'Total',
                fontSize: '16px',
                fontWeight: 600,
                color: '#373d3f',
                formatter: function (w) {
                  return w.globals.seriesTotals.reduce((a, b) => a + b, 0)
                }
              }
            }
          }
        }
      },
      dataLabels: {
        enabled: true,
        style: {
          fontSize: '14px',
          fontWeight: 600,
          colors: ['#fff']
        },
        background: {
          enabled: false
        },
        dropShadow: {
          enabled: false
        }
      },
      legend: {
        position: 'bottom',
        fontSize: '14px',
        fontWeight: 500,
        markers: {
          width: 12,
          height: 12,
          radius: 6
        },
        itemMargin: {
          horizontal: 10,
          vertical: 5
        }
      },
      responsive: [{
        breakpoint: 480,
        options: {
          chart: {
            height: 250
          },
          legend: {
            position: 'bottom'
          }
        }
      }]
    }
  });

  // Update state when data changes
  React.useEffect(() => {
    setState(prevState => ({
      ...prevState,
      series: [
        data?.["En attente"] || 0,
        data?.["Traité"] || 0,
        data?.["Refusé"] || 0,
        data?.["Retourné"] || 0
      ]
    }));
  }, [data]);

  return (
    <div className="flex flex-col items-center justify-center h-full">
      <div className="w-full">
        <ReactApexChart 
          options={state.options} 
          series={state.series} 
          type="donut" 
          height={300}
        />
      </div>
    </div>
  );
};

// Add Loading Component
const LoadingDashboard = () => {
  return (
    <div className="min-h-[60vh] flex flex-col items-center justify-center">
      <div className="relative w-24 h-24">
        <div className="absolute top-0 left-0 w-full h-full border-8 border-gray-200 rounded-full"></div>
        <div className="absolute top-0 left-0 w-full h-full border-8 border-primary rounded-full animate-spin border-t-transparent"></div>
      </div>
      <div className="mt-4 text-lg font-semibold text-gray-700 dark:text-gray-300">
        Loading Dashboard...
      </div>
      <div className="mt-2 text-sm text-gray-500 dark:text-gray-400">
        Please wait while we fetch your data
      </div>
    </div>
  );
};

const TypewriterText = ({ text, speed = 80 }) => {
  const [displayText, setDisplayText] = useState('');
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    if (currentIndex < text.length) {
      const timer = setTimeout(() => {
        setDisplayText(prev => prev + text[currentIndex]);
        setCurrentIndex(prev => prev + 1);
      }, speed);
      return () => clearTimeout(timer);
    } else {
      // When typing is complete, wait 7 seconds then restart
      const restartTimer = setTimeout(() => {
        setDisplayText('');
        setCurrentIndex(0);
      }, 5000);
      return () => clearTimeout(restartTimer);
    }
  }, [currentIndex, text, speed]);

  return (
    <span className="text-xs text-warning dark:text-warning font-bold transition-all duration-300 hover:text-primary">
      {displayText}
      <span className="text-warning animate-bounce">▋</span>
    </span>
  );
};

const Crm = () => {
  const [currentYear] = useState(new Date().getFullYear());
  const [selectedYear, setSelectedYear] = useState(currentYear);
  const [isYearPickerOpen, setIsYearPickerOpen] = useState(false);
  const [dashboardData, setDashboardData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [showAllData, setShowAllData] = useState(true);
  const [upcomingHolidays, setUpcomingHolidays] = useState([]);
  const [isHolidaysModalOpen, setIsHolidaysModalOpen] = useState(false);
  const [isLoadingHolidays, setIsLoadingHolidays] = useState(false);
  const [usersWithDemandes, setUsersWithDemandes] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const usersPerPage = 8;
  const yearPickerRef = useRef(null);
  const usersTableRef = useRef(null);
  const { user } = useAuth();
  const [activities, setActivities] = useState([]);
  const [isActivitiesModalOpen, setIsActivitiesModalOpen] = useState(false);
  const [isLoadingActivities, setIsLoadingActivities] = useState(false);
  const [isLoadingMoreActivities, setIsLoadingMoreActivities] = useState(false);
  const [hasMoreActivities, setHasMoreActivities] = useState(true);
  const [activitiesPerPage] = useState(20);

  // Generate array of years (from 2020 to current year)
  const years = ['all', ...Array.from(
    { length: currentYear - 2020 + 1 }, 
    (_, i) => 2020 + i
  ).sort((a, b) => b - a)]; // Sort in descending order (newest first)

  const handleYearSelect = (year) => {
    setSelectedYear(year);
    setIsYearPickerOpen(false);
  };

  useEffect(() => {
    console.log('user', user);
    const fetchDashboardData = async () => {
      setIsLoading(true);
      console.log('showAllData', showAllData);
      try {
        const dashboardResponse = await axiosInstance.get(`/dashboard/${selectedYear}/${showAllData}`);
        setDashboardData(dashboardResponse.data.data);
        setUsersWithDemandes(dashboardResponse.data.data.users.userswithCount);
        console.log('usersWithDemandes', dashboardResponse.data.data);
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchDashboardData();
  }, [selectedYear, showAllData]);

  // Close year picker when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (yearPickerRef.current && !yearPickerRef.current.contains(event.target)) {
        setIsYearPickerOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Add this new function to handle modal open and data fetch
  const handleActivitiesModalOpen = async () => {
    setIsActivitiesModalOpen(true);
    setIsLoadingActivities(true);
    setCurrentPage(1);
    setHasMoreActivities(true);
    try {
      const response = await axiosInstance.get('/my-activities');
      if (response.data.status === 'success') {
        const allActivities = response.data.data;
        setActivities(allActivities.slice(0, activitiesPerPage));
        setHasMoreActivities(allActivities.length > activitiesPerPage);
      }
    } catch (error) {
      console.error('Error fetching activities:', error);
    } finally {
      setIsLoadingActivities(false);
    }
  };

  // Add function to load more activities
  const loadMoreActivities = async () => {
    if (isLoadingMoreActivities || !hasMoreActivities) return;
    
    setIsLoadingMoreActivities(true);
    try {
      const response = await axiosInstance.get('/my-activities');
      if (response.data.status === 'success') {
        const allActivities = response.data.data;
        const nextPage = currentPage + 1;
        const startIndex = 0;
        const endIndex = nextPage * activitiesPerPage;
        const newActivities = allActivities.slice(startIndex, endIndex);
        
        setActivities(newActivities);
        setCurrentPage(nextPage);
        setHasMoreActivities(allActivities.length > endIndex);
      }
    } catch (error) {
      console.error('Error loading more activities:', error);
    } finally {
      setIsLoadingMoreActivities(false);
    }
  };

  // Add this new function to handle modal open and data fetch
  const handleHolidaysModalOpen = async () => {
    setIsHolidaysModalOpen(true);
    setIsLoadingHolidays(true);
    try {
      const response = await axiosInstance.get('/upcoming-holidays');
      if (response.data.success) {
        setUpcomingHolidays(response.data.holidays);
      }
    } catch (error) {
      console.error('Error fetching upcoming holidays:', error);
    } finally {
      setIsLoadingHolidays(false);
    }
  };

  // Filter users based on search query
  const filteredUsers = usersWithDemandes?.filter(user => 
    (user.first_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    user.last_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    user.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    user.matricule?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    user.email?.toLowerCase().includes(searchQuery.toLowerCase()))
  ) || [];

  // Calculate pagination
  const indexOfLastUser = currentPage * usersPerPage;
  const indexOfFirstUser = indexOfLastUser - usersPerPage;
  const currentUsers = filteredUsers?.slice(indexOfFirstUser, indexOfLastUser) || [];
  const totalPages = Math.ceil((filteredUsers?.length || 0) / usersPerPage);

  // Reset to first page when search query changes
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery]);

  // Add new component for Users Table
  const renderUsersTable = () => {
    return (
      <div className="box" ref={usersTableRef}>
        <div className="box-header flex items-center justify-between">
          <div className="flex items-center gap-2">
            <h5 className="box-title text-lg font-semibold">Utilisateurs et leurs demandes</h5>
            <div className="badge bg-primary/10 text-primary text-sm font-semibold py-1 px-2.5 rounded-full">
              {filteredUsers.length} utilisateurs
            </div>
          </div>
          <div className="flex items-center gap-4">
            <div className="relative">
              <input
                type="text"
                placeholder="Rechercher par nom, prénom, matricule ou email..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="form-control pl-4 pr-10 py-2.5 rounded-lg border border-gray-200 dark:border-gray-700 
                focus:border-primary focus:ring-2 focus:ring-primary/20 w-[300px] transition-all duration-200
                bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 placeholder-gray-400 dark:placeholder-gray-500
                hover:border-gray-300 dark:hover:border-gray-600"
              />
              <i className="ri-search-line absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 dark:text-gray-500"></i>
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-10 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 
                  dark:text-gray-500 dark:hover:text-gray-300 transition-colors duration-200"
                >
                  <i className="ri-close-circle-line text-lg"></i>
                </button>
              )}
            </div>
          </div>
        </div>
        <div className="box-body p-0">
          <div className="table-responsive">
            <table className="table whitespace-nowrap">
              <thead>
                <tr>
                  <th className="text-start">Utilisateur</th>
                  <th className="text-center">Total Demandes</th>
                  <th className="text-center">Documents</th>
                  <th className="text-center">Congés</th>
                </tr>
              </thead>
              <tbody>
                {currentUsers.length === 0 ? (
                  <tr>
                    <td colSpan="4" className="text-center py-4 text-gray-500">
                      Aucun utilisateur trouvé
                    </td>
                  </tr>
                ) : (
                  currentUsers.map((user) => (
                    <tr key={user.id} className="hover:bg-gray-50 dark:hover:bg-gray-800/50">
                      <td>
                        <div className="flex items-center gap-3">
                          <div className="avatar bg-primary/10 text-primary rounded-full w-10 h-10 flex items-center justify-center">
                            <i className="ri-user-line text-xl"></i>
                          </div>
                          <div>
                            <h6 className="font-semibold">{user.name}</h6>
                            <p className="text-sm text-gray-500">{user.email}</p>
                          </div>
                        </div>
                      </td>
                      <td className="text-center">
                        <span className="badge bg-primary/10 text-primary font-semibold">
                          {user.total_demandes}
                        </span>
                      </td>
                      <td className="text-center">
                        <span className="badge bg-info/10 text-info font-semibold">
                          {user.documents_count}
                        </span>
                      </td>
                      <td className="text-center">
                        <span className="badge bg-success/10 text-success font-semibold">
                          {user.conges_count}
                        </span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
          
          {/* CustomPagination */}
          {filteredUsers.length > 0 && (
            <div className="px-4 py-3 border-t border-gray-200 dark:border-gray-700">
              <CustomPagination
                current={currentPage}
                total={filteredUsers.length}
                perPage={usersPerPage}
                lastPage={totalPages}
                onPageChange={(page) => {
                  setCurrentPage(page);
                  // Scroll to users table when page changes
                  usersTableRef.current?.scrollIntoView({ behavior: 'smooth' });
                }}
              />
            </div>
          )}
        </div>
      </div>
    );
  };

  const renderRequestTypeChart = (data) => {
    if (!data?.by_type?.main_types) return null;

    const chartData = {
      labels: Object.keys(data.by_type.main_types),
      datasets: [{
        label: 'Number of Requests',
        data: Object.values(data.by_type.main_types),
        backgroundColor: [
          'rgba(75, 192, 192, 0.8)',
          'rgba(54, 162, 235, 0.8)',
        ],
        borderColor: [
          'rgba(75, 192, 192, 1)',
          'rgba(54, 162, 235, 1)',
        ],
        borderWidth: 1,
        borderRadius: 5,
      }]
    };

    const options = {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          display: false
        },
        title: {
          display: true,
          text: 'Request Types Distribution',
          font: {
            size: 16
          }
        }
      },
      scales: {
        y: {
          beginAtZero: true,
          ticks: {
            stepSize: 1
          }
        }
      }
    };

    return (
      <div style={{ height: '300px' }}>
        <ReactApexChart 
          options={options}
          series={chartData.datasets}
          type="bar"
          height="100%"
        />
      </div>
    );
  };

  const renderDocumentTypeChart = (data) => {
    if (!data?.by_type?.document_types) return null;

    const chartData = {
      labels: Object.keys(data.by_type.document_types),
      datasets: [{
        label: 'Number of Documents',
        data: Object.values(data.by_type.document_types),
        backgroundColor: [
          'rgba(255, 159, 64, 0.8)',
          'rgba(153, 102, 255, 0.8)',
          'rgba(255, 99, 132, 0.8)',
          'rgba(75, 192, 192, 0.8)',
        ],
        borderColor: [
          'rgba(255, 159, 64, 1)',
          'rgba(153, 102, 255, 1)',
          'rgba(255, 99, 132, 1)',
          'rgba(75, 192, 192, 1)',
        ],
        borderWidth: 1,
        borderRadius: 5,
      }]
    };

    const options = {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          display: false
        },
        title: {
          display: true,
          text: 'Document Types Distribution',
          font: {
            size: 16
          }
        }
      },
      scales: {
        y: {
          beginAtZero: true,
          ticks: {
            stepSize: 1
          }
        }
      }
    };

    return (
      <div style={{ height: '300px' }}>
        <ReactApexChart 
          options={options}
          series={chartData.datasets}
          type="bar"
          height="100%"
        />
      </div>
    );
  };

  const renderMonthlyStatusChart = (data) => {
    if (!data?.by_month) return null;

    const monthData = data.by_month["6"] || [];
    const chartData = {
      labels: monthData.map(item => item.status),
      datasets: [{
        label: 'June Status Distribution',
        data: monthData.map(item => item.count),
        backgroundColor: ['#FFC107', '#4CAF50'],
      }]
    };

    const options = {
      responsive: true,
      plugins: {
        legend: {
          position: 'bottom',
        },
        title: {
          display: true,
          text: 'Monthly Status Distribution'
        }
      }
    };

    return <ReactApexChart 
      options={options}
      series={chartData.datasets}
      type="bar"
      height="300"
    />;
  };

  const renderDocumentRequestsChart = (data) => {
    if (!data?.by_type?.document_types) return null;

    const documentTypes = data.by_type.document_types;
    const series = [{
      name: 'Nombre de demandes',
      data: Object.values(documentTypes)
    }];

    const options = {
      chart: {
        type: 'bar',
        height: 350,
        toolbar: {
          show: true,
          tools: {
            download: true,
            selection: false,
            zoom: false,
            zoomin: false,
            zoomout: false,
            pan: false,
            reset: false
          },
          export: {
            svg: {
              filename: 'documents-administratifs',
            },
            csv: {
              filename: 'documents-administratifs',
            }
          }
        }
      },
      plotOptions: {
        bar: {
          horizontal: false,
          columnWidth: '55%',
          endingShape: 'rounded',
          borderRadius: 4,
          distributed: true
        }
      },
      dataLabels: {
        enabled: true,
        offsetY: -20,
        style: {
          fontSize: '12px',
          colors: ["#304758"]
        }
      },
      colors: ['#2196F3', '#4CAF50', '#FFC107', '#FF5722'],
      xaxis: {
        categories: Object.keys(documentTypes),
        labels: {
          rotate: -45,
          style: {
            fontSize: '12px'
          }
        }
      },
      yaxis: {
        title: {
          text: 'Nombre de demandes'
        }
      },
      title: {
        text: 'Demande des documents administratifs',
        align: 'center',
        style: {
          fontSize: '16px'
        }
      },
      tooltip: {
        y: {
          formatter: function (val) {
            return val + " demandes"
          }
        }
      }
    };

    return (
      <div className="box">
        <div className="box-header flex items-center justify-between">
          <div className="flex items-center gap-2">
            <h5 className="box-title text-lg font-semibold">Documents Administratifs</h5>
            <div className="badge bg-primary/10 text-primary text-sm font-semibold py-1 px-2.5 rounded-full">
              Total: {data.by_type.main_types["Demande des documents administratifs"]} demandes
            </div>
          </div>
        </div>
        <div className="box-body p-4">
          <div style={{ minHeight: '350px' }}>
            <ReactApexChart 
              options={options}
              series={series}
              type="bar"
              height={350}
            />
          </div>
        </div>
      </div>
    );
  };

  const renderLeaveRequestsChart = (data) => {
    if (!data?.by_type?.leave_types) return null;

    // Combine regular and special leave types
    const allLeaveTypes = {
      ...data.by_type.leave_types,
      ...data.by_type.special_leave_types
    };

    const series = [{
      name: 'Nombre de demandes',
      data: Object.values(allLeaveTypes)
    }];

    const options = {
      chart: {
        type: 'bar',
        height: 350,
        toolbar: {
          show: true,
          tools: {
            download: true,
            selection: false,
            zoom: false,
            zoomin: false,
            zoomout: false,
            pan: false,
            reset: false
          },
          export: {
            svg: {
              filename: 'demandes-conges',
            },
            csv: {
              filename: 'demandes-conges',
            }
          }
        }
      },
      plotOptions: {
        bar: {
          horizontal: false,
          columnWidth: '55%',
          endingShape: 'rounded',
          borderRadius: 4,
          distributed: true
        }
      },
      dataLabels: {
        enabled: true,
        offsetY: -20,
        style: {
          fontSize: '12px',
          colors: ["#304758"]
        }
      },
      colors: ['#9C27B0', '#E91E63', '#3F51B5', '#009688'],
      xaxis: {
        categories: Object.keys(allLeaveTypes),
        labels: {
          rotate: -45,
          style: {
            fontSize: '12px'
          }
        }
      },
      yaxis: {
        title: {
          text: 'Nombre de demandes'
        }
      },
      title: {
        text: 'Demande de congés',
        align: 'center',
        style: {
          fontSize: '16px'
        }
      },
      tooltip: {
        y: {
          formatter: function (val) {
            return val + " demandes"
          }
        }
      }
    };

    return (
      <div className="box">
        <div className="box-header flex items-center justify-between">
          <div className="flex items-center gap-2">
            <h5 className="box-title text-lg font-semibold">Demandes de Congés</h5>
            <div className="badge bg-secondary/10 text-secondary text-sm font-semibold py-1 px-2.5 rounded-full">
              Total: {data.by_type.main_types["Demande de congés"]} demandes
            </div>
          </div>
        </div>
        <div className="box-body p-4">
          <div style={{ minHeight: '350px' }}>
            <ReactApexChart 
              options={options}
              series={series}
              type="bar"
              height={350}
            />
          </div>
        </div>
      </div>
    );
  };

  const renderUpcomingHolidays = () => {
    const getDaysRemaining = (holidayDate) => {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const date = new Date(holidayDate);
      date.setHours(0, 0, 0, 0);
      const diffTime = date - today;
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      return diffDays;
    };

    const isToday = (date) => {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const compareDate = new Date(date);
      compareDate.setHours(0, 0, 0, 0);
      return compareDate.getTime() === today.getTime();
    };

    const isTomorrow = (date) => {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const tomorrow = new Date(today);
      tomorrow.setDate(tomorrow.getDate() + 1);
      const compareDate = new Date(date);
      compareDate.setHours(0, 0, 0, 0);
      return compareDate.getTime() === tomorrow.getTime();
    };

    return (
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center">
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-xl w-full max-w-2xl mx-4 max-h-[90vh] overflow-hidden">
          <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
            <div className="flex items-center gap-2">
              <h5 className="text-lg font-semibold">Prochains jours fériés</h5>
              <div className="badge bg-primary/10 text-primary text-sm font-semibold py-1 px-2.5 rounded-full">
                {upcomingHolidays.length} jours
              </div>
            </div>
            <button
              onClick={() => setIsHolidaysModalOpen(false)}
              className="p-2 rounded-lg text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300 transition-all duration-200 hover:bg-gray-100 dark:hover:bg-gray-700"
            >
              <i className="ri-close-line text-xl"></i>
            </button>
          </div>
          <div className="p-4 overflow-y-auto max-h-[calc(90vh-80px)]">
            {isLoadingHolidays ? (
              <div className="flex flex-col items-center justify-center py-12">
                <div className="w-16 h-16 relative">
                  <div className="absolute top-0 left-0 w-full h-full border-8 border-gray-200 dark:border-gray-700 rounded-full animate-pulse"></div>
                  <div className="absolute top-0 left-0 w-full h-full border-8 border-t-primary border-r-transparent border-b-transparent border-l-transparent rounded-full animate-spin"></div>
                </div>
                <h6 className="mt-4 text-gray-600 dark:text-gray-400 font-medium">Chargement des jours fériés...</h6>
                <p className="mt-2 text-gray-500 dark:text-gray-500 text-sm">Veuillez patienter un instant</p>
              </div>
            ) : upcomingHolidays.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-8 text-center">
                <div className="w-16 h-16 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center mb-4">
                  <i className="ri-calendar-event-line text-2xl text-gray-400"></i>
                </div>
                <h6 className="text-gray-600 dark:text-gray-400 font-medium mb-1">Aucun jour férié à venir</h6>
                <p className="text-gray-500 dark:text-gray-500 text-sm">Les prochains jours fériés apparaîtront ici</p>
              </div>
            ) : (
              <div className="relative">
                <div className="absolute left-6 top-0 bottom-0 w-0.5 bg-gray-200 dark:bg-gray-700"></div>
                <div className="space-y-6">
                  {upcomingHolidays.map((holiday, index) => {
                    const date = new Date(holiday.date);
                    const today = isToday(holiday.date);
                    const tomorrow = isTomorrow(holiday.date);
                    const daysRemaining = getDaysRemaining(holiday.date);
                    
                    return (
                      <div key={index} className="relative pl-12">
                        <div className="absolute left-4 top-1 w-5 h-5 rounded-full border-4 border-white dark:border-gray-800 bg-primary flex items-center justify-center">
                          <i className="ri-calendar-event-line text-xs text-white"></i>
                        </div>
                        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-100 dark:border-gray-700 p-4 hover:shadow-md transition-shadow duration-200">
                          <div className="flex items-start justify-between">
                            <div>
                              <h6 className="font-semibold text-gray-900 dark:text-white mb-1">
                                {holiday.description}
                              </h6>
                              <div className="flex items-center gap-2 text-sm">
                                <span className="text-gray-600 dark:text-gray-300">
                                  {date.toLocaleDateString('fr-FR', {
                                    weekday: 'long',
                                    day: 'numeric',
                                    month: 'long',
                                    year: 'numeric'
                                  })}
                                </span>
                                {(today || tomorrow) ? (
                                  <span className={`inline-flex items-center px-3 py-0.5 rounded-full text-xs font-semibold ring-1 ring-inset ${
                                    today 
                                      ? 'bg-green-100 text-green-700 ring-green-600/20 dark:bg-green-900/20 dark:text-green-300'
                                      : 'bg-blue-100 text-blue-700 ring-blue-600/20 dark:bg-blue-900/20 dark:text-blue-300'
                                  }`}>
                                    {today ? "Aujourd'hui" : "Demain"}
                                  </span>
                                ) : (
                                  <span className="inline-flex items-center px-3 py-0.5 rounded-full text-xs font-semibold bg-purple-100 text-purple-700 ring-1 ring-purple-600/20 dark:bg-purple-900/20 dark:text-purple-300">
                                    Dans {daysRemaining} {daysRemaining === 1 ? 'jour' : 'jours'}
                                  </span>
                                )}
                              </div>
                            </div>
                            <div className="flex items-center gap-2">
                              <span className="text-primary">
                                <i className="ri-calendar-event-line text-xl"></i>
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  };

  // Add scroll event listener for infinite scroll
  const handleModalScroll = (e) => {
    const { scrollTop, scrollHeight, clientHeight } = e.target;
    if (scrollTop + clientHeight >= scrollHeight - 100) { // Load when 100px from bottom
      loadMoreActivities();
    }
  };

  // Add useEffect to handle modal scroll
  useEffect(() => {
    const modalBody = document.querySelector('.activities-modal-body');
    if (modalBody && isActivitiesModalOpen) {
      modalBody.addEventListener('scroll', handleModalScroll);
      return () => modalBody.removeEventListener('scroll', handleModalScroll);
    }
  }, [isActivitiesModalOpen, hasMoreActivities, isLoadingMoreActivities]);

  return(
  <Fragment>
    <Pageheader currentpage="Dashboards" activepage="Dashboards" mainpage="Dashboards" />

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

      
      {/* Main Container */}
      <div className="grid grid-cols-12 gap-6">
        {/* Year Picker and Stats Section - Full Width */}
        <div className="col-span-12">
          <div className="flex flex-col md:flex-row justify-end items-end gap-4 mb-6">
       

            {/* Year Picker and Data Toggle Buttons */}
            <div className="flex flex-col md:flex-row items-center gap-4">
              {/* Data Toggle Buttons - Only show for Admin RH */}
              {user?.data?.roles?.some(role => role.name === 'Admin RH') && (
                <div className="flex gap-2">
                  <button
                    onClick={() => setShowAllData(true)}
                    className={`px-4 py-2 rounded-lg transition-all duration-200 ${
                      showAllData 
                        ? 'bg-primary text-white' 
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                    disabled={isLoading}
                  >
                    Toutes les données
                  </button>
                  <button
                    onClick={() => setShowAllData(false)}
                    className={`px-4 py-2 rounded-lg transition-all duration-200 ${
                      !showAllData 
                        ? 'bg-primary text-white' 
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                    disabled={isLoading}
                  >
                    Données personnelles
                  </button>
                </div>
              )}
              
              {/* Holidays Button - Visible to all roles */}
              <button
                onClick={handleHolidaysModalOpen}
                className="px-4 py-2 rounded-lg transition-all duration-200 bg-info text-white hover:bg-info/90 flex items-center gap-2 shadow-lg hover:shadow-info/30 transform hover:scale-105 active:scale-95"
                disabled={isLoading || isLoadingHolidays}
              >
                {isLoadingHolidays ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin"></div>
                    <span>Chargement...</span>
                  </>
                ) : (
                  <>
                    <i className="ri-calendar-event-line"></i>
                    <span>Prochains jours fériés</span>
                    {upcomingHolidays && upcomingHolidays.length > 0 && (
                      <div className="badge bg-white/20 text-white text-xs font-semibold py-0.5 px-2 rounded-full">
                        {upcomingHolidays.length}
                      </div>
                    )}
                  </>
                )}
              </button>

              {/* Activities Button - Visible to all roles */}
              <button
                onClick={handleActivitiesModalOpen}
                className="px-4 py-2 rounded-lg transition-all duration-200 bg-success text-white hover:bg-success/90 
                flex items-center gap-2 shadow-lg hover:shadow-success/30 transform hover:scale-105 active:scale-95"
                disabled={isLoading || isLoadingActivities}
              >
                {isLoadingActivities ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin"></div>
                    <span>Chargement...</span>
                  </>
                ) : (
                  <>
                    <i className="ri-history-line"></i>
                    <span>Activités récentes</span>
                    {activities && activities.length > 0 && (
                      <div className="badge bg-white/20 text-white text-xs font-semibold py-0.5 px-2 rounded-full">
                        {activities.length}
                      </div>
                    )}
                  </>
                )}
              </button>

              {/* Year Picker */}
              <div className="relative" ref={yearPickerRef}>
                <button
                  onClick={() => setIsYearPickerOpen(!isYearPickerOpen)}
                  className="w-full md:w-auto flex items-center justify-center bg-primary text-white rounded-lg px-6 py-2 hover:bg-primary/90 transition-all duration-200 shadow-lg hover:shadow-primary/30"
                  disabled={isLoading}
                >
                  <span className="text-lg font-semibold mr-2">{selectedYear === 'all' ? 'Toutes les années' : selectedYear}</span>
                  <svg 
                    className={`w-5 h-5 transition-transform duration-200 ${isYearPickerOpen ? 'rotate-180' : ''}`} 
                    fill="none" 
                    stroke="currentColor" 
                    viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>

                {isYearPickerOpen && (
                  <div className="absolute right-0 mt-2 py-2 w-48 bg-white dark:bg-gray-800 rounded-lg shadow-xl border border-gray-100 dark:border-gray-700 z-50">
                    <div className="grid grid-cols-2 gap-1 p-2">
                      <button
                        key="all"
                        onClick={() => handleYearSelect('all')}
                        className={`year-option col-span-2 px-3 py-2 text-center rounded-md transition-all duration-200
                          ${selectedYear === 'all' 
                            ? 'bg-primary text-white' 
                            : 'hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300'
                          }`}
                        disabled={isLoading}
                      >
                        Toutes les années
                      </button>
                      {years.filter(year => year !== 'all').map(year => (
                        <button
                          key={year}
                          onClick={() => handleYearSelect(year)}
                          className={`year-option px-3 py-2 text-center rounded-md transition-all duration-200
                            ${selectedYear === year 
                              ? 'bg-primary text-white' 
                              : 'hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300'
                            }`}
                          disabled={isLoading}
                        >
                          {year}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
               {/* Stats Container */}
               <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 w-full">
              {/* Total Employees Card */}
              <div className="box hrm-main-card primary w-full">
                <div className="box-body">
                  <div className="flex items-start">
                    <div className="me-4">
                      <span className="avatar bg-primary !text-white">
                        <i className="ri-team-line text-[1.125rem]"></i>
                      </span>
                    </div>
                    <div className="flex-grow">
                      <span className="font-semibold text-[#8c9097] dark:text-white/50 block mb-1">
                        {user?.data?.roles?.some(role => role.name === 'Admin RH') && showAllData ? 'Total Employees' : 'Pour Superior'}
                      </span>
                      {!dashboardData?.users?.total ? (
                        <div className="flex flex-col items-start gap-1">
                          <div className="flex items-center text-gray-500">
                            <i className="ri-user-unfollow-line text-lg mr-2"></i>
                            <span>Aucun employé trouvé</span>
                          </div>
                        </div>
                      ) : (
                        <>
                          <h5 className="font-semibold mb-1 text-[1.25rem]">{dashboardData.users.total}</h5>
                          <p className="mb-0">
                            <span className="badge bg-primary/10 text-primary">Cette année: {dashboardData.users.this_year}</span>
                          </p>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Total Requests Card */}
              <div className="box hrm-main-card secondary w-full">
                <div className="box-body">
                  <div className="flex items-start">
                    <div className="me-4">
                      <span className="avatar bg-secondary !text-white">
                        <i className="ri-user-unfollow-line text-[1.125rem]"></i>
                      </span>
                    </div>
                    <div className="flex-grow">
                      <span className="font-semibold text-[#8c9097] dark:text-white/50 block mb-1">Total Demandes</span>
                      <h5 className="font-semibold mb-1 text-[1.25rem]">{dashboardData?.demandes?.total || 0}</h5>
                      <p className="mb-0">
                        <span className="badge bg-secondary/10 text-secondary">Cette année: {dashboardData?.demandes?.this_year || 0}</span>
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Solde Card */}
              <div className="box hrm-main-card warning w-full flex flex-col justify-between hover:shadow-lg hover:shadow-warning/20 transition-all duration-500 ease-out">
                <div className="box-body flex flex-col justify-between h-full">
                  <div className="flex items-center gap-4 mb-4">
                    <span className="avatar bg-warning !text-white text-2xl transition-transform duration-300 hover:rotate-12">
                      <i className="ri-wallet-3-line"></i>
                    </span>
                    <div>
                      <span className="font-semibold text-[#8c9097] dark:text-white/50 block mb-1 text-sm">Solde Congé</span>
                      <div className="flex items-center gap-2">
                        <span className="text-3xl font-bold text-gray-900 dark:text-white transition-all duration-500 hover:text-warning hover:scale-125">{user?.data?.solde || 0}</span>
                        <TypewriterText text="jours" speed={150} />
                      </div>
                    </div>
                  </div>
                  <div className="flex flex-col sm:flex-row gap-2 mt-2">
                    <div className="flex items-center gap-1 bg-primary/10 text-primary px-3 py-1 rounded-full text-xs font-semibold transition-all duration-300 hover:bg-primary/20 hover:scale-105">
                      <i className="ri-award-line"></i>
                      Solde Traité: <span className="ml-1">{user?.data?.solde_Traité || 0} jours</span>
                    </div>
                    {/* <div className="flex items-center gap-1 bg-warning/10 text-warning px-3 py-1 rounded-full text-xs font-semibold transition-all duration-300 hover:bg-warning/20 hover:scale-105">
                      <i className="ri-time-line"></i>
                      En cours: <span className="ml-1">2</span>
                    </div> */}
                  </div>
                </div>
              </div>

              {/* Holidays Card */}
              <div className="box hrm-main-card info w-full">
                <div className="box-body">
                  <div className="flex items-start">
                    <div className="me-4">
                      <span className="avatar bg-info !text-white">
                        <i className="ri-calendar-event-line text-[1.125rem]"></i>
                      </span>
                    </div>
                    <div className="flex-grow">
                      <span className="font-semibold text-[#8c9097] dark:text-white/50 block mb-1">Jours Fériés</span>
                      <h5 className="font-semibold mb-1 text-[1.25rem]">{upcomingHolidays.length}</h5>
                      <p className="mb-0">
                        <span className="badge bg-info/10 text-info">Jours à venir</span>
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
        </div>

        {isLoading ? (
          <div className="col-span-12">
            <LoadingDashboard />
          </div>
        ) : !dashboardData ? (
          <div className="col-span-12">
            <div className="flex flex-col items-center justify-center min-h-[60vh]">
              <div className="text-xl font-semibold text-gray-600 dark:text-gray-400">
                No data available
              </div>
            </div>
          </div>
        ) : (
          <>
            {/* First Row - Charts */}
            <div className="col-span-12 lg:col-span-6">
              {dashboardData?.demandes && renderDocumentRequestsChart(dashboardData.demandes)}
            </div>
            <div className="col-span-12 lg:col-span-6">
              {dashboardData?.demandes && renderLeaveRequestsChart(dashboardData.demandes)}
            </div>

            {/* Second Row - Users Table and Request Summaries */}
            <div className="col-span-12 grid grid-cols-12 gap-6">
              {/* Users Table - 8 columns */}
              {user?.data?.roles?.some(role => role.name === 'Admin RH') && showAllData && (
                <div className="col-span-12 lg:col-span-8">
                  {renderUsersTable()}
                </div>
              )}
              
              {/* Request Summaries Container - 4 columns */}
              <div className={`col-span-12 ${user?.data?.roles?.some(role => role.name === 'Admin RH') ? 'lg:col-span-4' : 'lg:col-span-12'} space-y-6`}>
                {/* First Request Summary */}
                <div className="box">
                  <div className="box-header">
                    <div className="box-title">Résumé des demandes</div>
                  </div>
                  <div className="box-body flex items-center justify-center">
                    {dashboardData?.demandes && <RequestSummaryChart data={dashboardData.demandes} />}
                  </div>
                </div>
              </div>
            </div>
          </>
        )}
      </div>

      {/* Holidays Modal */}
      {isHolidaysModalOpen && renderUpcomingHolidays()}

      {/* Activities Modal */}
      {isActivitiesModalOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl w-full max-w-4xl mx-auto max-h-[90vh] overflow-hidden transform transition-all duration-300 scale-100">
            {/* Modal Header */}
            <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700 bg-gradient-to-r from-success/5 to-primary/5">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-success/10 rounded-full flex items-center justify-center">
                  <i className="ri-history-line text-xl text-success"></i>
                </div>
                <div>
                  <h3 className="text-xl font-bold text-gray-900 dark:text-white">Activités récentes</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Historique des actions effectuées</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="badge bg-success/10 text-success text-sm font-semibold py-2 px-3 rounded-full">
                  {activities?.length || 0} activités
                </div>
                <button
                  onClick={() => setIsActivitiesModalOpen(false)}
                  className="p-2 rounded-lg text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300 
                  transition-all duration-200 hover:bg-gray-100 dark:hover:bg-gray-700 group"
                >
                  <i className="ri-close-line text-xl group-hover:scale-110 transition-transform duration-200"></i>
                </button>
              </div>
            </div>

            {/* Modal Body */}
            <div className="overflow-y-auto max-h-[calc(90vh-120px)] activities-modal-body">
              {isLoadingActivities ? (
                <div className="flex flex-col items-center justify-center py-12">
                  <div className="w-16 h-16 relative">
                    <div className="absolute top-0 left-0 w-full h-full border-8 border-gray-200 dark:border-gray-700 rounded-full animate-pulse"></div>
                    <div className="absolute top-0 left-0 w-full h-full border-8 border-t-success border-r-transparent border-b-transparent border-l-transparent rounded-full animate-spin"></div>
                  </div>
                  <h6 className="mt-4 text-gray-600 dark:text-gray-400 font-medium">Chargement des activités...</h6>
                  <p className="mt-2 text-gray-500 dark:text-gray-500 text-sm">Veuillez patienter un instant</p>
                </div>
              ) : (
                <div className="relative">
                  <div className="absolute left-6 top-0 bottom-0 w-0.5 bg-gray-200 dark:bg-gray-700"></div>
                  <div className="space-y-6 p-4">
                    {!activities || activities.length === 0 ? (
                      <div className="flex flex-col items-center justify-center py-8 text-center">
                        <div className="w-16 h-16 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center mb-4">
                          <i className="ri-history-line text-2xl text-gray-400"></i>
                        </div>
                        <h6 className="text-gray-600 dark:text-gray-400 font-medium mb-1">Aucune activité</h6>
                        <p className="text-gray-500 dark:text-gray-500 text-sm">Les activités apparaîtront ici</p>
                      </div>
                    ) : (
                      <>
                        {activities.map((activity, index) => {
                          const getActivityIcon = (action) => {
                            switch (action) {
                              case 'created':
                                return 'ri-add-circle-line text-success';
                              case 'updated':
                                return 'ri-edit-2-line text-primary';
                              case 'deleted':
                                return 'ri-delete-bin-line text-danger';
                              default:
                                return 'ri-information-line text-info';
                            }
                          };

                          const getActivityColor = (action) => {
                            switch (action) {
                              case 'created':
                                return 'bg-success/10 border-success/20';
                              case 'updated':
                                return 'bg-primary/10 border-primary/20';
                              case 'deleted':
                                return 'bg-danger/10 border-danger/20';
                              default:
                                return 'bg-info/10 border-info/20';
                            }
                          };

                          return (
                            <div key={index} className="relative pl-12">
                              <div className={`absolute left-4 top-1 w-5 h-5 rounded-full border-4 border-white dark:border-gray-800 ${getActivityColor(activity.action)} flex items-center justify-center`}>
                                <i className={`${getActivityIcon(activity.action)} text-sm`}></i>
                              </div>
                              <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-100 dark:border-gray-700 p-4 hover:shadow-md transition-shadow duration-200">
                                <div className="flex items-start justify-between">
                                  <div>
                                    <h6 className="font-semibold text-gray-900 dark:text-white mb-1">
                                      {activity.description}
                                    </h6>
                                    <div className="flex items-center gap-2 text-sm">
                                      <span className="text-gray-600 dark:text-gray-300">
                                        {format(new Date(activity.created_at), "d MMMM yyyy 'à' HH:mm", { locale: fr })}
                                      </span>
                                      <span className={`inline-flex items-center px-3 py-0.5 rounded-full text-xs font-semibold ring-1 ring-inset ${getActivityColor(activity.action)}`}>
                                        {activity.action.charAt(0).toUpperCase() + activity.action.slice(1)}
                                      </span>
                                    </div>
                                    {activity.user && (
                                      <div className="mt-2 flex items-center gap-2">
                                        <div className="avatar bg-primary/10 text-primary rounded-full w-6 h-6 flex items-center justify-center">
                                          <i className="ri-user-line text-xs"></i>
                                        </div>
                                        <span className="text-sm text-gray-600 dark:text-gray-300">
                                          {activity.user.name}
                                        </span>
                                      </div>
                                    )}
                                  </div>
                                </div>
                              </div>
                            </div>
                          );
                        })}
                        
                        {/* Loading more activities indicator */}
                        {isLoadingMoreActivities && (
                          <div className="flex flex-col items-center justify-center py-6">
                            <div className="w-8 h-8 relative">
                              <div className="absolute top-0 left-0 w-full h-full border-4 border-gray-200 dark:border-gray-700 rounded-full animate-pulse"></div>
                              <div className="absolute top-0 left-0 w-full h-full border-4 border-t-success border-r-transparent border-b-transparent border-l-transparent rounded-full animate-spin"></div>
                            </div>
                            <p className="mt-2 text-sm text-gray-500 dark:text-gray-500">Chargement de plus d'activités...</p>
                          </div>
                        )}
                        
                        {/* End of activities indicator */}
                        {!hasMoreActivities && activities.length > 0 && (
                          <div className="flex flex-col items-center justify-center py-4">
                            <div className="w-1 h-8 bg-gray-200 dark:bg-gray-700 rounded-full"></div>
                            <p className="mt-2 text-sm text-gray-500 dark:text-gray-500">Fin des activités</p>
                          </div>
                        )}
                      </>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="flex items-center justify-between p-6 border-t border-gray-200 dark:border-gray-700 bg-gray-50/50 dark:bg-gray-800/50">
              <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                <i className="ri-information-line"></i>
                <span>Dernière mise à jour: {format(new Date(), "d MMMM yyyy 'à' HH:mm", { locale: fr })}</span>
              </div>
              <button
                onClick={() => setIsActivitiesModalOpen(false)}
                className="px-6 py-2 bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300 
                rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-all duration-200 font-medium"
              >
                Fermer
              </button>
            </div>
          </div>
        </div>
      )}
    </Fragment>
  );
};

export default Crm;
