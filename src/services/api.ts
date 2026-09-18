const API_URL = import.meta.env.VITE_API_URL || '';

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: { code: string; message: string };
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

    if (!response.ok) {
      const errorData = await response.json().catch(() => null);
      return {
        success: false,
        error: {
          code: `HTTP_${response.status}`,
          message: errorData?.message || `Request failed with status ${response.status}`,
        },
      };
    }

    const data = await response.json();
    return { success: true, data };
  } catch (err) {
    return {
      success: false,
      error: {
        code: 'NETWORK_ERROR',
        message: 'Connection interrupted. Please check your internet connection.',
      },
    };
  }
}

export const api = {
  analyze: (url: string) =>
    request<any>('/api/analyze', {
      method: 'POST',
      body: JSON.stringify({ url }),
    }),

  download: (settings: { url: string; type: string; format: string; quality: string; startTime: number; endTime: number }) =>
    request<any>('/api/download', {
      method: 'POST',
      body: JSON.stringify(settings),
    }),

  getStatus: (jobId: string) =>
    request<any>(`/api/status/${jobId}`),
};
