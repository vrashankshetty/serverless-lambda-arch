import axios, { AxiosError } from 'axios';
import { Function, Dashboard, Execution } from '../types';
// Define your API base URL
export const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080';

// Create axios instance with defaults
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Types based on your backend


// interface TestFunctionParams {
//   code: string;
//   language: 'javascript' | 'python';
//   input?: any;
// }

// interface TestFunctionResult {
//   success: boolean;
//   result?: any;
//   error?: string;
//   duration: number;
//   output?: any;
// }

// Error handling helper
const handleApiError = (error: unknown) => {
  if (axios.isAxiosError(error)) {
    const axiosError = error as AxiosError<{ message: string; statusCode: number }>;
    if (axiosError.response) {
      return {
        message: axiosError.response.data?.message || 'An error occurred',
        statusCode: axiosError.response.status,
      };
    } else if (axiosError.request) {
      return {
        message: 'No response from server. Please check your connection.',
        statusCode: 0,
      };
    }
  }

  return {
    message: error instanceof Error ? error.message : 'An unknown error occurred',
    statusCode: 500,
  };
};

// Function API
const functionApi = {
  getAll: async (): Promise<Function[]> => {
    try {
      const response = await api.get('/functions');
      return response.data;
    } catch (error) {
      throw handleApiError(error);
    }
  },
  getDashboard: async (): Promise<Dashboard> => {
    try {
      const response = await api.get('/profile/dashboard');
      return response.data;
    } catch (error) {
      throw handleApiError(error);
    }
  },
  getEachFunction: async (id: string): Promise<Function> => {
    try {
      const response = await api.get(`/functions/${id}`);
      return response.data;
    } catch (error) {
      throw handleApiError(error);
    }
  },
  create: async (functionData: Omit<Function, 'id' | 'createdAt' | 'updatedAt'>): Promise<Function> => {
    try {
      const response = await api.post('/functions', functionData);
      return response.data;
    } catch (error) {
      throw handleApiError(error);
    }
  },
  update: async (id: string, functionData: Partial<Function>): Promise<Function> => {
    try {
      const response = await api.put(`/functions/${id}`, functionData);
      return response.data;
    } catch (error) {
      throw handleApiError(error);
    }
  },
  delete: async (id: string): Promise<void> => {
    try {
      const response = await api.delete(`/functions/${id}`);
      return response.data;
    } catch (error) {
      throw handleApiError(error);
    }
  },

  getExecutions: async (id: string): Promise<Execution[]> => {
    try {
      const response = await api.get(`/functions/${id}/executions`);
      return response.data;
    } catch (error) {
      throw handleApiError(error);
    }
  },

  getAllExecutions: async (): Promise<Execution[]> => {
    try {
      const response = await api.get(`/executions/`);
      return response.data;
    } catch (error) {
      throw handleApiError(error);
    }
  },

  getEachExecution: async (id:string): Promise<Execution> => {
    try {
      const response = await api.get(`/executions/${id}`);
      return response.data;
    } catch (error) {
      throw handleApiError(error);
    }
  },

  // Execute a function with custom input
  execute: async (route: string, input?: any): Promise<any> => {
    try {
      const cleanRoute = route.startsWith('/') ? route.substring(1) : route;
      const response = await api.post(`/executions/run/${cleanRoute}`,input || {});
      return response.data;
    } catch (error) {
      throw handleApiError(error);
    }
  },

  // Admin: Clean up all containers
  cleanupContainers: async (): Promise<{ message: string }> => {
    try {
      const response = await api.post('/executions/run/admin/cleanup');
      return response.data;
    } catch (error) {
      throw handleApiError(error);
    }
  }
};

export default functionApi;