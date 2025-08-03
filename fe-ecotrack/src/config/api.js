// API Configuration
// To change the backend URL, simply update the API_BASE_URL constant below
// For local development: 'http://localhost:5050'
export const API_BASE_URL = 'https://backend-ecotrack.vercel.app';

// Helper function to construct full API URLs
export const getApiUrl = (endpoint) => {
  // Remove leading slash if present to avoid double slashes
  const cleanEndpoint = endpoint.startsWith('/') ? endpoint.slice(1) : endpoint;
  return `${API_BASE_URL}/${cleanEndpoint}`;
};
