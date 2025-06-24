import { createContext, useContext, useState, useEffect } from 'react';
import axiosInstance from '../../Interceptor/axiosInstance';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    const fetchProfile = async () => {
        try {
            const token = localStorage.getItem('access_token');
            const currentProjectId = localStorage.getItem('current_project_id');
            
            if (!token) {
                setUser(null);
                setLoading(false);
                return;
            }

            // Ensure the token is set in axios headers
            axiosInstance.defaults.headers.common['Authorization'] = `Bearer ${token}`;
            
            // Add project context to headers
            if (currentProjectId) {
                axiosInstance.defaults.headers.common['X-Project-Id'] = currentProjectId;
            }
            
            
            const profileResponse = await axiosInstance.get('/profile');
            
            if (profileResponse.data && profileResponse.data.status === 'success' && profileResponse.data.data) {
                const userData = {
                    data: profileResponse.data.data
                };
                setUser(userData);
                localStorage.setItem('user_data', JSON.stringify(userData));
            } else {
                // console.error('Invalid profile response format:', profileResponse);
                throw new Error('Invalid profile response format');
            }
        } catch (profileError) {
            // console.error('Error fetching profile:', profileError);
            if (profileError.response) {
                // console.error('Error response:', profileError.response);
                // If unauthorized or forbidden, clear everything
                if (profileError.response.status === 401 || profileError.response.status === 403) {
                    localStorage.removeItem('access_token');
                    localStorage.removeItem('user_data');
                    localStorage.removeItem('current_project_id');
                    setUser(null);
                }
            }
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        const initializeAuth = async () => {
            setLoading(true);
            const token = localStorage.getItem('access_token');
            const savedUser = localStorage.getItem('user_data');

            if (token) {
                axiosInstance.defaults.headers.common['Authorization'] = `Bearer ${token}`;
                
                if (savedUser) {
                    try {
                        const parsedUser = JSON.parse(savedUser);
                    
                        setUser(parsedUser);
                    } catch (error) {
                        // console.error('Error parsing saved user data:', error);
                        localStorage.removeItem('user_data');
                    }
                }
                
                await fetchProfile();
            } else {
                setLoading(false);
            }
        };

        initializeAuth();

        // Listen for access_token changes
        const handleStorageChange = (e) => {
            if (e.key === 'access_token') {
                if (e.newValue) {
                    fetchProfile();
                } else {
                    setUser(null);
                    localStorage.removeItem('user_data');
                }
            }
        };

        window.addEventListener('storage', handleStorageChange);
        return () => window.removeEventListener('storage', handleStorageChange);
    }, []);

    const loginAuth = async (responseData) => {
        
        try {
            // Check for the nested success status and data
            if (responseData.data && responseData.data.status === "success" && responseData.data.data) {
                const userData = responseData.data.data;
                
                if (userData.access_token) {
                    // Set the token first
                    localStorage.setItem('access_token', userData.access_token);
                    axiosInstance.defaults.headers.common['Authorization'] = `Bearer ${userData.access_token}`;
                    
                    // Store complete user data including project, roles, and permissions
                    const userDataToStore = {
                        data: {
                            id: userData.id,
                            name: userData.name,
                            email: userData.email,
                            first_name: userData.first_name,
                            last_name: userData.last_name,
                            job_title: userData.job_title,
                            matricule: userData.matricule,
                            entity: userData.entity,
                            project: userData.project,
                            roles: userData.roles,
                            permissions: userData.permissions
                        }
                    };
                    
                    setUser(userDataToStore);
                    localStorage.setItem('user_data', JSON.stringify(userDataToStore));
                    
                    // Fetch fresh profile data
                    await fetchProfile();
                    return true;
                }
            }
            return false;
        } catch (error) {
            // console.error('Error in loginAuth:', error);
            return false;
        }
    };

    const logout = () => {
        axiosInstance.defaults.headers.common['Authorization'] = '';
        localStorage.clear();
        sessionStorage.clear();
        setUser(null);
    };

    return (
        <AuthContext.Provider value={{ user, loginAuth, logout, fetchProfile, loading }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);
