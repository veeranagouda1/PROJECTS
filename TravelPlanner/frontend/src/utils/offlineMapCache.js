// Offline Map Tile Cache Utility
// Caches map tiles in localStorage for offline use

const CACHE_PREFIX = 'map_tile_';
const MAX_CACHE_SIZE = 50 * 1024 * 1024; // 50MB limit

export const cacheTile = (url, blob) => {
  try {
    const key = CACHE_PREFIX + btoa(url).replace(/[/+=]/g, '_');
    const reader = new FileReader();
    reader.onloadend = () => {
      const base64 = reader.result;
      const size = base64.length;
      
      // Check cache size
      const currentSize = getCacheSize();
      if (currentSize + size > MAX_CACHE_SIZE) {
        // Remove oldest entries
        clearOldestTiles(size);
      }
      
      localStorage.setItem(key, base64);
      localStorage.setItem(key + '_timestamp', Date.now().toString());
    };
    reader.readAsDataURL(blob);
  } catch (error) {
    console.error('Failed to cache tile:', error);
  }
};

export const getCachedTile = (url) => {
  try {
    const key = CACHE_PREFIX + btoa(url).replace(/[/+=]/g, '_');
    const cached = localStorage.getItem(key);
    if (cached) {
      // Convert base64 back to blob
      const byteCharacters = atob(cached.split(',')[1]);
      const byteNumbers = new Array(byteCharacters.length);
      for (let i = 0; i < byteCharacters.length; i++) {
        byteNumbers[i] = byteCharacters.charCodeAt(i);
      }
      const byteArray = new Uint8Array(byteNumbers);
      return new Blob([byteArray], { type: 'image/png' });
    }
  } catch (error) {
    console.error('Failed to get cached tile:', error);
  }
  return null;
};

export const getCacheSize = () => {
  let size = 0;
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    if (key && key.startsWith(CACHE_PREFIX) && !key.endsWith('_timestamp')) {
      size += localStorage.getItem(key).length;
    }
  }
  return size;
};

const clearOldestTiles = (neededSpace) => {
  const tiles = [];
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    if (key && key.startsWith(CACHE_PREFIX) && !key.endsWith('_timestamp')) {
      const timestamp = parseInt(localStorage.getItem(key + '_timestamp') || '0');
      tiles.push({ key, timestamp, size: localStorage.getItem(key).length });
    }
  }
  
  // Sort by timestamp (oldest first)
  tiles.sort((a, b) => a.timestamp - b.timestamp);
  
  // Remove oldest tiles until we have enough space
  let freed = 0;
  for (const tile of tiles) {
    if (freed >= neededSpace) break;
    localStorage.removeItem(tile.key);
    localStorage.removeItem(tile.key + '_timestamp');
    freed += tile.size;
  }
};

export const clearCache = () => {
  const keys = [];
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    if (key && key.startsWith(CACHE_PREFIX)) {
      keys.push(key);
    }
  }
  keys.forEach(key => localStorage.removeItem(key));
};

export const getCacheStats = () => {
  const size = getCacheSize();
  let count = 0;
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    if (key && key.startsWith(CACHE_PREFIX) && !key.endsWith('_timestamp')) {
      count++;
    }
  }
  return { size, count };
};

