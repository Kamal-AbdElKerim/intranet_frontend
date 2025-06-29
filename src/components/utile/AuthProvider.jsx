import { createContext, useContext, useState, useEffect } from 'react';
import axiosInstance from '../../Interceptor/axiosInstance';
import SecureStorage from './SecureStorage';
import MemoryStorage from './MemoryStorage';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    // Helper function to normalize user data structure
    const normalizeUserData = (userData) => {
        // If userData already has a 'data' property, return as is
        if (userData && userData.data) {
            return userData;
        }
        
        // If userData is a flat object, wrap it in a 'data' property
        if (userData && typeof userData === 'object' && !userData.data) {
            return { data: userData };
        }
        
        return null;
    };

    // Helper function to clean up old encrypted data
    const cleanupOldData = () => {
        try {
            const oldData = localStorage.getItem('user_data');
            if (oldData && oldData.startsWith('RU5DUllQVEVE')) {
                console.log('Cleaning up old encrypted data');
                localStorage.removeItem('user_data');
                SecureStorage.removeItem('user_data');
                MemoryStorage.removeItem('user_data');
                return true;
            }
        } catch (error) {
            console.error('Error cleaning up old data:', error);
        }
        return false;
    };

    // Helper function to get user data with fallback
    const getUserDataWithFallback = () => {
        // Clean up old encrypted data first
        cleanupOldData();
        
        // Try memory first (fastest)
        let userData = MemoryStorage.getItem('user_data');
        
        // If not in memory, try secure storage
        if (!userData) {
            userData = SecureStorage.getItem('user_data');
        }
        
        // If still not found, try legacy localStorage (for backward compatibility)
        if (!userData) {
            try {
                const legacyData = localStorage.getItem('user_data');
                if (legacyData) {
                    userData = JSON.parse(legacyData);
                    // Migrate to secure storage
                    if (userData) {
                        SecureStorage.setItem('user_data', userData);
                        MemoryStorage.setItem('user_data', userData);
                        // Remove legacy data
                        localStorage.removeItem('user_data');
                    }
                }
            } catch (error) {
                console.error('Error reading legacy data:', error);
            }
        }
        
        return userData;
    };

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
                
                // Store user data securely (encrypted in localStorage)
                SecureStorage.setItem('user_data', userData);
                
                // Also store in memory for faster access
                MemoryStorage.setItem('user_data', userData);
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
                    SecureStorage.removeItem('user_data');
                    MemoryStorage.removeItem('user_data');
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
            
            // Get user data with fallback
            const savedUser = getUserDataWithFallback();

            if (token) {
                axiosInstance.defaults.headers.common['Authorization'] = `Bearer ${token}`;
                
                if (savedUser) {
                    try {
                        const normalizedUser = normalizeUserData(savedUser);
                        
                        if (normalizedUser) {
                            setUser(normalizedUser);
                            // Update storage with normalized structure if needed
                            if (!savedUser.data) {
                                SecureStorage.setItem('user_data', normalizedUser);
                                MemoryStorage.setItem('user_data', normalizedUser);
                            }
                        }
                    } catch (error) {
                        console.error('Error parsing saved user data:', error);
                        SecureStorage.removeItem('user_data');
                        MemoryStorage.removeItem('user_data');
                    }
                }
                
                // Always fetch fresh profile to ensure data is up to date
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
                    SecureStorage.removeItem('user_data');
                    MemoryStorage.removeItem('user_data');
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
                    
                    // Store securely
                    SecureStorage.setItem('user_data', userDataToStore);
                    MemoryStorage.setItem('user_data', userDataToStore);
                    
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
        SecureStorage.clear();
        MemoryStorage.clear();
        setUser(null);
    };

    return (
        <AuthContext.Provider value={{ user, loginAuth, logout, fetchProfile, loading }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);
