// Utility functions for handling user data
export const getUserData = () => {
    try {
        const userData = localStorage.getItem('user_data');
        return userData ? JSON.parse(userData) : null;
    } catch (error) {
        // console.error('Error parsing user data:', error);
        return null;
    }
};

export const isUserLoggedIn = () => {
    return !!localStorage.getItem('access_token');
};

export const getUserPermissions = () => {
    const userData = getUserData();
    return userData?.permissions || [];
};

export const hasPermission = (permission) => {
    const permissions = getUserPermissions();
    return permissions.includes(permission);
};

export const getUserRole = () => {
    const userData = getUserData();
    return userData?.role || null;
};

export const clearUserData = () => {
    localStorage.removeItem('user_data');
    localStorage.removeItem('access_token');
};

export const updateUserData = (newData) => {
    try {
        const currentData = getUserData() || {};
        const updatedData = { ...currentData, ...newData };
        localStorage.setItem('user_data', JSON.stringify(updatedData));
        return true;
    } catch (error) {
        // console.error('Error updating user data:', error);
        return false;
    }
}; 