import { createContext, useContext, useState, useEffect } from "react";
import Cookies from "js-cookie";
import {
  fetchWatchLaterApi,
  addToWatchLaterApi,
  removeFromWatchLaterApi,
} from "../api/movies";

const WatchLaterContext = createContext(null);
const STORAGE_KEY = "nxtflix_watch_later";

export function WatchLaterProvider({ children }) {
  const [watchLater, setWatchLater] = useState(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      const parsed = stored ? JSON.parse(stored) : [];
      return Array.isArray(parsed) ? parsed : [];
    } catch {
      return [];
    }
  });

  // If user has token, sync with backend API on mount
  useEffect(() => {
    const token = Cookies.get("jwt_token");
    if (!token) return;

    let isMounted = true;
    async function syncBackend() {
      const serverList = await fetchWatchLaterApi();
      if (isMounted && serverList && serverList.length > 0) {
        setWatchLater(serverList);
      }
    }
    syncBackend();
    return () => {
      isMounted = false;
    };
  }, []);

  // Keep localStorage in sync whenever the list changes
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(watchLater));
  }, [watchLater]);

  const isInWatchLater = (id) => watchLater.some((movie) => movie.id === id);

  const toggleWatchLater = async (movie) => {
    const isCurrentlySaved = watchLater.some((m) => m.id === movie.id);

    if (isCurrentlySaved) {
      setWatchLater((prev) => prev.filter((m) => m.id !== movie.id));
      await removeFromWatchLaterApi(movie.id);
    } else {
      setWatchLater((prev) => [...prev, movie]);
      await addToWatchLaterApi(movie.id);
    }
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
