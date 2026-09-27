import axios from "axios";
import {
  clearTokens,
  getAccessToken,
} from "./auth";

/**
 * Paths that only make sense for a signed-in user. When the access token
 * expires mid-session, an API call from one of these pages returns 401: the
 * interceptor drops the stale token and sends the user to the login page with
 * a `next` parameter so they land back where they were. Public pages are left
 * untouched so an anonymous visitor never gets bounced.
 */
const PROTECTED_PREFIXES = [
  "/checkout",
  "/orders",
  "/payment-verify",
  "/farmer",
  "/admin",
];

function onProtectedPage(): boolean {
  const path = window.location.pathname;
  return PROTECTED_PREFIXES.some((prefix) => path.startsWith(prefix));
}

const apiClient = axios.create({
  baseURL:
    import.meta.env.VITE_API_BASE_URL ||
    "http://localhost:8000/api/v1",

  headers: {
    "Content-Type": "application/json",
  },

  timeout: 15000,
});

apiClient.interceptors.request.use(
  (config) => {
    const token = getAccessToken();

    if (token) {
      config.headers.Authorization =
        `Bearer ${token}`;
    }

    return config;
  },
);

apiClient.interceptors.response.use(
  (response) => response,

  async (error) => {
    if (error.response?.status === 401) {
      clearTokens();

      // A full load is intentional here: with the tokens gone nothing on the
      // current page is authorised to render.
      if (onProtectedPage()) {
        const current = window.location.pathname + window.location.search;
        window.location.assign(
          `/login?next=${encodeURIComponent(current)}`,
        );
      }
    }

    return Promise.reject(error);
  },
);

export default apiClient;