import Cookies from "js-cookie";
import fallbackMovies from "../data/movies";

const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

function getAuthHeaders() {
  const token = Cookies.get("jwt_token");
  return {
    "Content-Type": "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
}

export async function fetchMovies(filters = {}) {
  try {
    const params = new URLSearchParams();
    if (filters.genre && filters.genre !== "All") {
      params.append("genre", filters.genre);
    }
    if (filters.search) {
      params.append("search", filters.search);
    }

    const queryStr = params.toString() ? `?${params.toString()}` : "";
    const response = await fetch(`${API_BASE}/movies${queryStr}`, {
      headers: getAuthHeaders(),
    });

    if (!response.ok) {
      throw new Error(`Server returned ${response.status}`);
    }

    const data = await response.json();
    return data.movies || [];
  } catch (err) {
    // Graceful fallback to local mock movies if backend server is not running
    let result = [...fallbackMovies];
    if (filters.genre && filters.genre !== "All") {
      result = result.filter(
        (m) => m.genre.toLowerCase() === filters.genre.toLowerCase()
      );
    }
    if (filters.search) {
      const q = filters.search.toLowerCase();
      result = result.filter((m) => m.title.toLowerCase().includes(q));
    }
    return result;
  }
}

export async function fetchTrendingMovies() {
  try {
    const response = await fetch(`${API_BASE}/movies/trending`, {
      headers: getAuthHeaders(),
    });

    if (!response.ok) {
      throw new Error(`Server returned ${response.status}`);
    }

    const data = await response.json();
    return data.movies || [];
  } catch (err) {
    return [...fallbackMovies]
      .sort((a, b) => Number(b.rating) - Number(a.rating))
      .slice(0, 16);
  }
}

export async function fetchMovieById(id) {
  try {
    const response = await fetch(`${API_BASE}/movies/${id}`, {
      headers: getAuthHeaders(),
    });

    if (!response.ok) {
      throw new Error(`Server returned ${response.status}`);
    }

    const data = await response.json();
    return data.movie;
  } catch (err) {
    return fallbackMovies.find((m) => String(m.id) === String(id)) || null;
  }
}

export function getMovieStreamUrl(id) {
  const token = Cookies.get("jwt_token") || "";
  return `${API_BASE}/movies/${id}/stream${token ? `?token=${token}` : ""}`;
}

export async function fetchWatchLaterApi() {
  try {
    const response = await fetch(`${API_BASE}/watch-later`, {
      headers: getAuthHeaders(),
    });
    if (!response.ok) return null;
    const data = await response.json();
    return data.movies || [];
  } catch {
    return null;
  }
}

export async function addToWatchLaterApi(movieId) {
  try {
    const response = await fetch(`${API_BASE}/watch-later/${movieId}`, {
      method: "POST",
      headers: getAuthHeaders(),
    });
    return response.ok;
  } catch {
    return false;
  }
}

export async function removeFromWatchLaterApi(movieId) {
  try {
    const response = await fetch(`${API_BASE}/watch-later/${movieId}`, {
      method: "DELETE",
      headers: getAuthHeaders(),
    });
    return response.ok;
  } catch {
    return false;
  }
}
