import axios from 'axios';

// This file provides a data access layer. These functions make network
// requests to a backend API to fetch live data.

const API_BASE_URL = 'http://localhost:8080';

/**
 * A helper function to fetch data from a given API endpoint.
 * Includes basic error handling.
 * @param endpoint The API endpoint to fetch data from (e.g., 'children').
 * @returns A promise that resolves with the fetched data, or an empty array on error.
 */
const fetchFromAPI = async (endpoint: string) => {
  try {
    const response = await axios.get(`${API_BASE_URL}/${endpoint}`);
    console.log(`Successfully fetched data from /${endpoint}`, response.data);
    return response.data;
  } catch (error) {
    console.error(`❌ Error fetching data from ${API_BASE_URL}/${endpoint}:`, error);
    // Return an empty array to prevent the app from crashing if the backend is down.
    return [];
  }
};

// --- API EXPORTS ---

export const childrenApi = {
  getAll: async () => fetchFromAPI('children'),
};

export const attendanceApi = {
  getAll: async () => fetchFromAPI('attendance'),
};

export const billingApi = {
  getAll: async () => fetchFromAPI('billing'),
};

export const staffApi = {
  getAll: async () => fetchFromAPI('staff'),
};

export const healthApi = {
  getAll: async () => fetchFromAPI('health'),
};

export const scheduleApi = {
  getAll: async () => fetchFromAPI('schedule'),
};

export const mediaApi = {
  getAll: async () => fetchFromAPI('media'),
};
