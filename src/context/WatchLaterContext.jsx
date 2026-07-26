import { createContext, useContext, useState, useEffect } from "react";

const WatchLaterContext = createContext(null);
const STORAGE_KEY = "nxtflix_watch_later";

export function WatchLaterProvider({ children }) {
  // Lazy initializer: runs once on mount, not on every render
  const [watchLater, setWatchLater] = useState(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      const parsed = stored ? JSON.parse(stored) : [];
      return Array.isArray(parsed) ? parsed : [];
    } catch {
      // Invalid JSON in localStorage -> fall back to empty list
      return [];
    }
  });

  // Keep localStorage in sync whenever the list changes
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(watchLater));
  }, [watchLater]);

  const isInWatchLater = (id) => watchLater.some((movie) => movie.id === id);

  const toggleWatchLater = (movie) => {
    setWatchLater((prev) =>
      prev.some((m) => m.id === movie.id)
        ? prev.filter((m) => m.id !== movie.id)
        : [...prev, movie]
    );
  };

  return (
    <WatchLaterContext.Provider
      value={{ watchLater, isInWatchLater, toggleWatchLater }}
    >
      {children}
    </WatchLaterContext.Provider>
  );
}

export function useWatchLater() {
  const ctx = useContext(WatchLaterContext);
  if (!ctx) {
    throw new Error("useWatchLater must be used within a WatchLaterProvider");
  }
  return ctx;
}
