import SecureStorage from './SecureStorage';
import MemoryStorage from './MemoryStorage';

// Utility functions for handling user data securely
export const getUserData = () => {
    try {
        // Try memory first (fastest)
        let userData = MemoryStorage.getItem('user_data');
        
        // If not in memory, try secure storage
        if (!userData) {
            userData = SecureStorage.getItem('user_data');
            // If found in secure storage, also store in memory
            if (userData) {
                MemoryStorage.setItem('user_data', userData);
            }
        }
        
        if (!userData) return null;
        
        // Handle both flat and nested data structures
        if (userData && userData.data) {
            return userData.data; // Return the nested data
        } else if (userData && typeof userData === 'object') {
            return userData; // Return flat data as is
        }
        
        return null;
    } catch (error) {
        // console.error('Error getting user data:', error);
        return null;
    }
};

export const isUserLoggedIn = () => {
    return !!localStorage.getItem('access_token');
};

export const getAccessToken = () => {
    return localStorage.getItem('access_token');
};

export const getUserRole = () => {
    const userData = getUserData();
    return userData?.role || null;
};

export const getUserRoles = () => {
    const userData = getUserData();
    return userData?.roles || [];
};

export const getUserPermissions = () => {
    const userData = getUserData();
    return userData?.permissions || [];
};

export const hasRole = (roleName) => {
    const roles = getUserRoles();
    return roles.some(role => role.name === roleName);
};

export const hasPermission = (permissionName) => {
    const permissions = getUserPermissions();
    return permissions.some(permission => permission.name === permissionName);
};

export const clearUserData = () => {
    SecureStorage.removeItem('user_data');
    MemoryStorage.removeItem('user_data');
    localStorage.removeItem('access_token');
};

export const updateUserData = (newData) => {
    try {
        const currentData = getUserData() || {};
        const updatedData = { ...currentData, ...newData };
        
        // Store in the normalized format (with data wrapper)
        const normalizedData = { data: updatedData };
        
        // Store securely
        SecureStorage.setItem('user_data', normalizedData);
        MemoryStorage.setItem('user_data', normalizedData);
        
        return true;
    } catch (error) {
        // console.error('Error updating user data:', error);
        return false;
    }
}; 