const BASE_URL = "https://serverless-api-teal.vercel.app/api/auth";

/**
 * Calls the sign-in endpoint.
 * On a non-OK response, throws an Error using message/error from the body.
 * On success, returns the parsed JSON body untouched so the caller
 * can decide how to extract the token.
 */
export async function signIn(email, password) {
  const response = await fetch(`${BASE_URL}/signin`, {
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
