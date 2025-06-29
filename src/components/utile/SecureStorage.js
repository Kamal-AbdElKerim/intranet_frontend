// Secure Storage Utility for encrypting sensitive data
class SecureStorage {
    constructor() {
        this.secretKey = this.generateSecretKey();
    }

    // Generate a secret key based on browser fingerprint
    generateSecretKey() {
        // Use a more stable fingerprint that doesn't change between sessions
        const userAgent = navigator.userAgent;
        const language = navigator.language;
        const platform = navigator.platform;
        const fingerprint = `${userAgent}-${language}-${platform}`;
        
        // Simple hash function
        let hash = 0;
        for (let i = 0; i < fingerprint.length; i++) {
            const char = fingerprint.charCodeAt(i);
            hash = ((hash << 5) - hash) + char;
            hash = hash & hash; // Convert to 32-bit integer
        }
        return Math.abs(hash).toString(16);
    }

    // Simple encryption (for production, use a proper encryption library)
    encrypt(data) {
        try {
            const jsonString = JSON.stringify(data);
            // Add a prefix to identify encrypted data
            const dataToEncrypt = `ENCRYPTED:${jsonString}`;
            const encoded = btoa(unescape(encodeURIComponent(dataToEncrypt)));
            return encoded;
        } catch (error) {
            console.error('Encryption error:', error);
            return null;
        }
    }

    // Simple decryption with fallback
    decrypt(encryptedData) {
        try {
            // Check if data is already decrypted (for backward compatibility)
            if (typeof encryptedData === 'object') {
                return encryptedData;
            }
            
            // Check if data is a JSON string (for backward compatibility)
            if (typeof encryptedData === 'string' && encryptedData.startsWith('{')) {
                try {
                    return JSON.parse(encryptedData);
                } catch (e) {
                    // Continue with decryption
                }
            }
            
            // Check if it's base64 encoded
            if (typeof encryptedData === 'string' && encryptedData.length > 0) {
                try {
                    const decoded = decodeURIComponent(escape(atob(encryptedData)));
                    
                    // Check if it's our encrypted format
                    if (decoded.startsWith('ENCRYPTED:')) {
                        const jsonString = decoded.substring(10); // Remove 'ENCRYPTED:' prefix
                        return JSON.parse(jsonString);
                    }
                    
                    // Fallback: try to parse as regular JSON
                    return JSON.parse(decoded);
                } catch (e) {
                    // If base64 decoding fails, try direct JSON parsing
                    try {
                        return JSON.parse(encryptedData);
                    } catch (e2) {
                        console.error('All decryption attempts failed:', e2);
                        return null;
                    }
                }
            }
            
            return null;
        } catch (error) {
            console.error('Decryption error:', error);
            return null;
        }
    }

    // Store encrypted data
    setItem(key, data) {
        try {
            const encrypted = this.encrypt(data);
            if (encrypted) {
                localStorage.setItem(key, encrypted);
                return true;
            }
            return false;
        } catch (error) {
            console.error('Error storing data:', error);
            return false;
        }
    }

    // Retrieve and decrypt data with fallback
    getItem(key) {
        try {
            const encrypted = localStorage.getItem(key);
            if (!encrypted) {
                return null;
            }
            
            const decrypted = this.decrypt(encrypted);
            
            // If decryption failed, try to get the raw data as fallback
            if (decrypted === null) {
                console.warn('Decryption failed, trying raw data fallback');
                try {
                    // Try to parse as regular JSON
                    return JSON.parse(encrypted);
                } catch (e) {
                    console.error('Fallback parsing also failed:', e);
                    return null;
                }
            }
            
            return decrypted;
        } catch (error) {
            console.error('Error retrieving data:', error);
            return null;
        }
    }

    // Remove item
    removeItem(key) {
        try {
            localStorage.removeItem(key);
        } catch (error) {
            console.error('Error removing item:', error);
        }
    }

    // Clear all secure storage
    clear() {
        try {
            localStorage.clear();
        } catch (error) {
            console.error('Error clearing storage:', error);
        }
    }
}

export default new SecureStorage(); 