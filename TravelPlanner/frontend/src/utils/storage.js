export const storageKeys = {
  TOKEN: 'token',
  ROLE: 'role',
  USER_ID: 'userId',
  USER_EMAIL: 'userEmail',
  THEME: 'theme',
};

export const safeStorage = {
  setItem: (key, value) => {
    try {
      if (value === null || value === undefined) {
        localStorage.removeItem(key);
        return true;
      }

      const stringValue = typeof value === 'string' ? value : String(value);

      if (stringValue.length > 10000) {
        console.warn(`Storage value for key "${key}" is too large (${stringValue.length} bytes). Skipping.`);
        return false;
      }

      localStorage.setItem(key, stringValue);
      return true;
    } catch (err) {
      if (err.name === 'QuotaExceededError') {
        console.error(`Storage quota exceeded. Clearing non-essential data for key "${key}"`);
        safeStorage.clearNonEssentialData();
        try {
          const stringValue = typeof value === 'string' ? value : String(value);
          localStorage.setItem(key, stringValue);
          return true;
        } catch (retryErr) {
          console.error(`Failed to store key "${key}" even after cleanup:`, retryErr);
          return false;
        }
      } else {
        console.error(`Failed to store key "${key}":`, err);
        return false;
      }
    }
  },

  getItem: (key) => {
    try {
      return localStorage.getItem(key);
    } catch (err) {
      console.error(`Failed to retrieve key "${key}":`, err);
      return null;
    }
  },

  removeItem: (key) => {
    try {
      localStorage.removeItem(key);
      return true;
    } catch (err) {
      console.error(`Failed to remove key "${key}":`, err);
      return false;
    }
  },

  clear: () => {
    try {
      localStorage.clear();
      return true;
    } catch (err) {
      console.error('Failed to clear storage:', err);
      return false;
    }
  },

  clearNonEssentialData: () => {
    const essentialKeys = [storageKeys.TOKEN, storageKeys.ROLE, storageKeys.USER_ID, storageKeys.USER_EMAIL, storageKeys.THEME];
    try {
      for (const key of Object.keys(localStorage)) {
        if (!essentialKeys.includes(key)) {
          localStorage.removeItem(key);
        }
      }
    } catch (err) {
      console.error('Failed to clear non-essential data:', err);
    }
  },
};
