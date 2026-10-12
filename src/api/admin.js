import Cookies from "js-cookie";

const BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

function getAuthHeader(token) {
  const authToken = token || Cookies.get("jwt_token") || "";
  return {
    Authorization: `Bearer ${authToken}`,
    "Content-Type": "application/json",
  };
}

/**
 * Fetch Admin Analytics (user count, movie count, genre distribution, etc.)
 */
export async function getAdminAnalytics(token) {
  const response = await fetch(`${BASE_URL}/admin/analytics`, {
    method: "GET",
    headers: getAuthHeader(token),
  });

  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.message || "Failed to fetch admin analytics");
  }
  return data.analytics;
}

/**
 * Fetch all registered users
 */
export async function getUsers(token) {
  const response = await fetch(`${BASE_URL}/users`, {
    method: "GET",
    headers: getAuthHeader(token),
  });

  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.message || "Failed to fetch users");
  }
  return data.users || [];
}

/**
 * Update user role (USER or ADMIN)
 */
export async function updateUserRole(userId, role, token) {
  const response = await fetch(`${BASE_URL}/users/${userId}/role`, {
    method: "PATCH",
    headers: getAuthHeader(token),
    body: JSON.stringify({ role }),
  });

  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.message || "Failed to update user role");
  }
  return data.user;
}

/**
 * Create a new movie (Admin only)
 */
export async function createMovie(movieData, token) {
  const response = await fetch(`${BASE_URL}/movies`, {
    method: "POST",
    headers: getAuthHeader(token),
    body: JSON.stringify(movieData),
  });

  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.message || "Failed to create movie");
  }
  return data.movie;
}

/**
 * Update movie details (Admin only)
 */
export async function updateMovie(movieId, movieData, token) {
  const response = await fetch(`${BASE_URL}/movies/${movieId}`, {
    method: "PUT",
    headers: getAuthHeader(token),
    body: JSON.stringify(movieData),
  });

  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.message || "Failed to update movie");
  }
  return data.movie;
}

/**
 * Delete a movie (Admin only)
 */
export async function deleteMovie(movieId, token) {
  const response = await fetch(`${BASE_URL}/movies/${movieId}`, {
    method: "DELETE",
    headers: getAuthHeader(token),
  });

  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.message || "Failed to delete movie");
  }
  return true;
}
