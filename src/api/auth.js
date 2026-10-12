const BACKEND_URL = (import.meta.env.VITE_API_URL || "http://localhost:5000/api") + "/auth";
const FALLBACK_URL = "https://serverless-api-teal.vercel.app/api/auth";

/**
 * Calls the sign-in endpoint on the backend server.
 * Tries local backend first; falls back to demo API if local is offline.
 */
export async function signIn(email, password) {
  try {
    const response = await fetch(`${BACKEND_URL}/signin`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ email, password }),
    });

    const result = await response.json();
    if (!response.ok) {
      throw new Error(result.message || result.error || "Login failed");
    }
    return result;
  } catch (err) {
    // If backend connection was refused (e.g. backend server not started yet), try fallback
    if (err.message.includes("Failed to fetch") || err.message.includes("NetworkError")) {
      const fbResponse = await fetch(`${FALLBACK_URL}/signin`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      const fbResult = await fbResponse.json();
      if (!fbResponse.ok) {
        throw new Error(fbResult.message || fbResult.error || "Login failed");
      }
      return fbResult;
    }
    throw err;
  }
}

/**
 * Calls the signup endpoint.
 */
export async function signUp(name, email, password) {
  const response = await fetch(`${BACKEND_URL}/signup`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ name, email, password }),
  });

  const result = await response.json();
  if (!response.ok) {
    throw new Error(result.message || result.error || "Signup failed");
  }
  return result;
}

/**
 * Gets currently logged in user profile.
 */
export async function getMe(token) {
  const response = await fetch(`${BACKEND_URL}/me`, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  const result = await response.json();
  if (!response.ok) {
    throw new Error(result.message || "Failed to fetch user profile");
  }
  return result;
}

/**
 * Defensive token extraction — the spec says the token could
 * come back under any of these keys depending on the API version.
 */
export function extractToken(result) {
  return (
    result?.data?.token ||
    result?.token ||
    result?.jwt_token ||
    result?.jwtToken ||
    null
  );
}

/**
 * Extracts user object from signin/signup/me responses.
 */
export function extractUser(result) {
  return result?.user || result?.data?.user || null;
}

/**
 * Decodes JWT token payload without external dependencies.
 */
export function parseJwt(token) {
  if (!token) return null;
  try {
    const parts = token.split(".");
    if (parts.length < 2) return null;
    const base64Url = parts[1];
    const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split("")
        .map((c) => "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2))
        .join("")
    );
    return JSON.parse(jsonPayload);
  } catch {
    return null;
  }
}

