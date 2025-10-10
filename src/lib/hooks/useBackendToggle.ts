import { useState, useEffect } from 'react';

// Toggle between mock API and real backend
// Set to true to use real backend, false to use MSW mock data
export const USE_REAL_BACKEND = false;

export function useBackendToggle() {
  const [useRealBackend, setUseRealBackend] = useState(USE_REAL_BACKEND);

  useEffect(() => {
    // Store in localStorage for persistence
    const stored = localStorage.getItem('useRealBackend');
    if (stored !== null) {
      setUseRealBackend(stored === 'true');
    }
  }, []);

  const toggleBackend = (value: boolean) => {
    setUseRealBackend(value);
    localStorage.setItem('useRealBackend', value.toString());
    window.location.reload(); // Reload to switch between MSW and real API
  };

  return { useRealBackend, toggleBackend };
}
