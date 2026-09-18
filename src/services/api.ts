const API_URL = import.meta.env.VITE_API_URL || '';

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
}

async function request<T>(endpoint: string, options?: RequestInit): Promise<ApiResponse<T>> {
  const url = `${API_URL}${endpoint}`;
  
  try {
    const response = await fetch(url, {
      headers: {
        'Content-Type': 'application/json',
      },
      ...options,
    });

    const data = await response.json();

    if (!response.ok) {
      return {
        success: false,
        error: data.error || `Request failed with status ${response.status}`,
      };
    }

    return { success: true, data };
  } catch (err) {
    return {
      success: false,
      error: 'Backend service is currently unavailable. Please try again later.',
    };
  }
}

export const api = {
  analyze: (url: string) =>
    request<any>('/api/analyze', {
      method: 'POST',
      body: JSON.stringify({ url }),
    }),

  download: (settings: { 
    url: string; 
    type: string; 
    format?: string; 
    quality?: string; 
    startTime?: number; 
    endTime?: number 
  }) =>
    request<any>('/api/download', {
      method: 'POST',
      body: JSON.stringify(settings),
    }),

  getStatus: (jobId: string) =>
    request<any>(`/api/status/${jobId}`),

  health: () =>
    request<any>('/api/health'),
};
