// Memory-based storage for sensitive user data
class MemoryStorage {
    constructor() {
        this.storage = new Map();
        this.sessionData = new Map();
    }

    // Store data in memory only (cleared on page refresh)
    setItem(key, data) {
        this.storage.set(key, data);
        return true;
    }

    // Get data from memory
    getItem(key) {
        return this.storage.get(key) || null;
    }

    // Store data in sessionStorage (cleared when tab closes)
    setSessionItem(key, data) {
        this.sessionData.set(key, data);
        sessionStorage.setItem(key, JSON.stringify(data));
        return true;
    }

    // Get data from sessionStorage
    getSessionItem(key) {
        const sessionData = this.sessionData.get(key);
        if (sessionData) {
            return sessionData;
        }
        
        // Fallback to sessionStorage
        const stored = sessionStorage.getItem(key);
        if (stored) {
            try {
                const parsed = JSON.parse(stored);
                this.sessionData.set(key, parsed);
                return parsed;
            } catch (error) {
                return null;
            }
        }
        return null;
    }

    // Remove item from memory
    removeItem(key) {
        this.storage.delete(key);
        this.sessionData.delete(key);
        sessionStorage.removeItem(key);
    }

    // Clear all data
    clear() {
        this.storage.clear();
        this.sessionData.clear();
        sessionStorage.clear();
    }

    // Check if item exists
    hasItem(key) {
        return this.storage.has(key) || this.sessionData.has(key);
    }
}

export default new MemoryStorage(); 