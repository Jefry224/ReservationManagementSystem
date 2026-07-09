const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:3000";

export const API_ROUTES = {
  PROVIDERS: `${API_BASE_URL}/providers`,
  PROVIDER: (id: string) => `${API_BASE_URL}/providers/${id}`,
  RESERVATIONS: `${API_BASE_URL}/reservations`,
  PROVIDER_RESERVATIONS: (providerId: string) => `${API_BASE_URL}/reservations/${providerId}`,
  AVAILABILITY: (providerId: string, date: string) =>
    `${API_BASE_URL}/reservations/${providerId}/availability?date=${date}`,
};
