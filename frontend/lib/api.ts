// API Client for Backend Integration

// HARDCODE API URL to ensure it works - can be changed later via env
const API_BASE_URL = 'http://localhost:3001';

// Debug: Log API URL in development
if (typeof window !== 'undefined') {
  console.log('🔗 API Base URL (hardcoded):', API_BASE_URL);
  console.log('🔗 NEXT_PUBLIC_API_URL env:', process.env.NEXT_PUBLIC_API_URL);
  console.log('🔗 Window location:', window.location.origin);
}

// Token management
export const getToken = (): string | null => {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem('auth_token');
};

export const setToken = (token: string): void => {
  if (typeof window === 'undefined') return;
  localStorage.setItem('auth_token', token);
};

export const removeToken = (): void => {
  if (typeof window === 'undefined') return;
  localStorage.removeItem('auth_token');
};

// Salon management
export const getCurrentSalonId = (): string | null => {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem('current_salon_id');
};

export const setCurrentSalonId = (salonId: string): void => {
  if (typeof window === 'undefined') return;
  localStorage.setItem('current_salon_id', salonId);
};

export const removeCurrentSalonId = (): void => {
  if (typeof window === 'undefined') return;
  localStorage.removeItem('current_salon_id');
};

// Helper to add salonId to endpoint
function addSalonIdToEndpoint(endpoint: string): string {
  const salonId = getCurrentSalonId();
  // Backend salonId yoksa ilk salon profilini kullanır, bu yüzden endpoint'i olduğu gibi döndürebiliriz
  // Ama salonId varsa ekleyelim
  if (!salonId) {
    // SalonId yoksa bile endpoint'i döndür, backend kendi halleder
    return endpoint;
  }
  
  const separator = endpoint.includes('?') ? '&' : '?';
  return `${endpoint}${separator}salonId=${salonId}`;
}

// API Request wrapper
interface ApiOptions extends RequestInit {
  requireAuth?: boolean;
}

async function apiRequest<T>(
  endpoint: string,
  options: ApiOptions = {}
): Promise<T> {
  const { requireAuth = true, ...fetchOptions } = options;
  
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(fetchOptions.headers as Record<string, string> || {}),
  };

  // Add auth token if required
  if (requireAuth) {
    const token = getToken();
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
  }

  const url = `${API_BASE_URL}${endpoint}`;
  
  // Debug logging - always log in development
  if (typeof window !== 'undefined') {
    console.log('🌐 API Request:', {
      method: fetchOptions.method || 'GET',
      url,
      endpoint,
      apiBaseUrl: API_BASE_URL,
      headers: Object.keys(headers),
      hasAuth: !!headers['Authorization'],
    });
  }
  
  try {
    const fetchPromise = fetch(url, {
      ...fetchOptions,
      headers,
    });
    
    // Add timeout for fetch
    const timeoutPromise = new Promise((_, reject) => 
      setTimeout(() => reject(new Error('Request timeout after 10 seconds')), 10000)
    );
    
    const response = await Promise.race([fetchPromise, timeoutPromise]) as Response;

    // Check if response is ok before trying to parse JSON
    if (!response.ok) {
      let errorMessage = `HTTP error! status: ${response.status}`;
      try {
        const errorData = await response.json();
        // Validation error'ları daha detaylı göster
        if (errorData.errors && Array.isArray(errorData.errors) && errorData.errors.length > 0) {
          const errorMessages = errorData.errors.map((err: any) => {
            const path = err.path?.join('.') || err.path?.[0] || 'field';
            return `${path}: ${err.message}`;
          }).join(', ');
          throw new Error(`Validation error: ${errorMessages}`);
        }
        errorMessage = errorData.message || errorMessage;
      } catch (parseError) {
        // If JSON parsing fails, use status text
        errorMessage = response.statusText || errorMessage;
      }
      throw new Error(errorMessage);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    // Handle network errors (failed to fetch)
    if (error instanceof TypeError && (error.message.includes('fetch') || error.message.includes('Failed to fetch') || error.message.includes('NetworkError'))) {
      console.error('❌ API Request Error:', {
        url,
        error: error.message,
        apiBaseUrl: API_BASE_URL,
        errorType: error.constructor.name,
        fullError: error,
      });
      
      // More detailed error message
      const errorMsg = `Backend sunucusuna bağlanılamıyor (${API_BASE_URL}). Lütfen backend'in çalıştığından emin olun.`;
      throw new Error(errorMsg);
    }
    if (error instanceof Error) {
      console.error('❌ API Error:', error.message);
      throw error;
    }
    throw new Error('Bilinmeyen bir hata oluştu');
  }
}

// Auth API
export const authApi = {
  register: async (data: {
    email: string;
    password: string;
    name: string;
    salonName: string;
    phone?: string;
  }) => {
    const response = await apiRequest<{
      success: boolean;
      data: {
        user: {
          id: string;
          email: string;
          name: string;
          role: string;
        };
        salonProfiles: Array<{
          id: string;
          name: string;
        }>;
        currentSalonId: string | null;
        token: string;
      };
    }>('/api/auth/register', {
      method: 'POST',
      body: JSON.stringify(data),
      requireAuth: false,
    });
    if (response.data.currentSalonId) {
      setCurrentSalonId(response.data.currentSalonId);
    }
    return response.data;
  },

  login: async (email: string, password: string) => {
    const response = await apiRequest<{
      success: boolean;
      data: {
        user: {
          id: string;
          email: string;
          name: string;
          role: string;
        };
        salonProfiles: Array<{
          id: string;
          name: string;
        }>;
        currentSalonId: string | null;
        token: string;
      };
    }>('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
      requireAuth: false,
    });
    if (response.data.currentSalonId) {
      setCurrentSalonId(response.data.currentSalonId);
    }
    return response.data;
  },

  getCurrentUser: async () => {
    const response = await apiRequest<{
      success: boolean;
      data: {
        id: string;
        email: string;
        name: string;
        role: string;
        createdAt: string;
        salonProfiles: Array<{
          id: string;
          name: string;
          ownerName: string;
          phone: string | null;
          email: string;
        }>;
      };
    }>('/api/auth/me', {
      method: 'GET',
    });
    return response.data;
  },
};

// Salons API
export const salonsApi = {
  getAll: async () => {
    const response = await apiRequest<{
      success: boolean;
      data: any[];
    }>('/api/salons', {
      method: 'GET',
    });
    return response.data;
  },

  getById: async (id: string) => {
    const response = await apiRequest<{
      success: boolean;
      data: any;
    }>(`/api/salons/${id}`, {
      method: 'GET',
    });
    return response.data;
  },

  create: async (data: {
    name: string;
    ownerName: string;
    phone?: string;
    email?: string;
    address?: string;
    description?: string;
    logoUrl?: string;
    workingHours?: Record<string, any>;
  }) => {
    const response = await apiRequest<{
      success: boolean;
      data: any;
    }>('/api/salons', {
      method: 'POST',
      body: JSON.stringify(data),
    });
    return response.data;
  },

  update: async (id: string, data: Partial<{
    name: string;
    ownerName: string;
    phone?: string;
    email?: string;
    address?: string;
    description?: string;
    logoUrl?: string;
    workingHours?: Record<string, any>;
  }>) => {
    const response = await apiRequest<{
      success: boolean;
      data: any;
    }>(`/api/salons/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
    return response.data;
  },

  delete: async (id: string) => {
    const response = await apiRequest<{
      success: boolean;
      message: string;
    }>(`/api/salons/${id}`, {
      method: 'DELETE',
    });
    return response;
  },
};

// Customers API
export const customersApi = {
  getAll: async () => {
    const response = await apiRequest<{
      success: boolean;
      data: any[];
    }>(addSalonIdToEndpoint('/api/customers'), {
      method: 'GET',
    });
    return response.data;
  },

  getById: async (id: string) => {
    const response = await apiRequest<{
      success: boolean;
      data: any;
    }>(addSalonIdToEndpoint(`/api/customers/${id}`), {
      method: 'GET',
    });
    return response.data;
  },

  create: async (data: any) => {
    const response = await apiRequest<{
      success: boolean;
      data: any;
    }>(addSalonIdToEndpoint('/api/customers'), {
      method: 'POST',
      body: JSON.stringify(data),
    });
    return response.data;
  },

  update: async (id: string, data: any) => {
    const response = await apiRequest<{
      success: boolean;
      data: any;
    }>(addSalonIdToEndpoint(`/api/customers/${id}`), {
      method: 'PUT',
      body: JSON.stringify(data),
    });
    return response.data;
  },

  delete: async (id: string) => {
    const response = await apiRequest<{
      success: boolean;
    }>(addSalonIdToEndpoint(`/api/customers/${id}`), {
      method: 'DELETE',
    });
    return response;
  },
};

// Employees API
export const employeesApi = {
  getAll: async () => {
    const response = await apiRequest<{
      success: boolean;
      data: any[];
    }>(addSalonIdToEndpoint('/api/employees'), {
      method: 'GET',
    });
    return response.data;
  },

  getById: async (id: string) => {
    const response = await apiRequest<{
      success: boolean;
      data: any;
    }>(addSalonIdToEndpoint(`/api/employees/${id}`), {
      method: 'GET',
    });
    return response.data;
  },

  create: async (data: any) => {
    const response = await apiRequest<{
      success: boolean;
      data: any;
    }>(addSalonIdToEndpoint('/api/employees'), {
      method: 'POST',
      body: JSON.stringify(data),
    });
    return response.data;
  },

  update: async (id: string, data: any) => {
    if (typeof window !== 'undefined') {
      console.log('🛰️ employeesApi.update payload:', { id, data })
    }
    const response = await apiRequest<{
      success: boolean;
      data: any;
    }>(addSalonIdToEndpoint(`/api/employees/${id}`), {
      method: 'PUT',
      body: JSON.stringify(data),
    });
    return response.data;
  },

  delete: async (id: string) => {
    const response = await apiRequest<{
      success: boolean;
    }>(addSalonIdToEndpoint(`/api/employees/${id}`), {
      method: 'DELETE',
    });
    return response;
  },

  assignService: async (id: string, serviceId: string, isAvailable: boolean = true) => {
    const response = await apiRequest<{
      success: boolean;
      data: any;
    }>(addSalonIdToEndpoint(`/api/employees/${id}/services`), {
      method: 'POST',
      body: JSON.stringify({ serviceId, isAvailable }),
    });
    return response.data;
  },

  removeService: async (id: string, serviceId: string) => {
    const response = await apiRequest<{
      success: boolean;
    }>(addSalonIdToEndpoint(`/api/employees/${id}/services/${serviceId}`), {
      method: 'DELETE',
    });
    return response;
  },
};

// Services API
export const servicesApi = {
  getAll: async () => {
    const response = await apiRequest<{
      success: boolean;
      data: any[];
    }>(addSalonIdToEndpoint('/api/services'), {
      method: 'GET',
    });
    return response.data;
  },

  getById: async (id: string) => {
    const response = await apiRequest<{
      success: boolean;
      data: any;
    }>(addSalonIdToEndpoint(`/api/services/${id}`), {
      method: 'GET',
    });
    return response.data;
  },

  create: async (data: any) => {
    const response = await apiRequest<{
      success: boolean;
      data: any;
    }>(addSalonIdToEndpoint('/api/services'), {
      method: 'POST',
      body: JSON.stringify(data),
    });
    return response.data;
  },

  update: async (id: string, data: any) => {
    const response = await apiRequest<{
      success: boolean;
      data: any;
    }>(addSalonIdToEndpoint(`/api/services/${id}`), {
      method: 'PUT',
      body: JSON.stringify(data),
    });
    return response.data;
  },

  delete: async (id: string) => {
    const response = await apiRequest<{
      success: boolean;
    }>(addSalonIdToEndpoint(`/api/services/${id}`), {
      method: 'DELETE',
    });
    return response;
  },
};

// Appointments API
export const appointmentsApi = {
  getAll: async () => {
    const response = await apiRequest<{
      success: boolean;
      data: any[];
    }>(addSalonIdToEndpoint('/api/appointments'), {
      method: 'GET',
    });
    return response.data;
  },

  getById: async (id: string) => {
    const response = await apiRequest<{
      success: boolean;
      data: any;
    }>(addSalonIdToEndpoint(`/api/appointments/${id}`), {
      method: 'GET',
    });
    return response.data;
  },

  create: async (data: any) => {
    const response = await apiRequest<{
      success: boolean;
      data: any;
    }>(addSalonIdToEndpoint('/api/appointments'), {
      method: 'POST',
      body: JSON.stringify(data),
    });
    return response.data;
  },

  update: async (id: string, data: any) => {
    const response = await apiRequest<{
      success: boolean;
      data: any;
    }>(addSalonIdToEndpoint(`/api/appointments/${id}`), {
      method: 'PUT',
      body: JSON.stringify(data),
    });
    return response.data;
  },

  delete: async (id: string) => {
    const response = await apiRequest<{
      success: boolean;
    }>(addSalonIdToEndpoint(`/api/appointments/${id}`), {
      method: 'DELETE',
    });
    return response;
  },
};

// Dashboard API
export const dashboardApi = {
  getStats: async () => {
    const response = await apiRequest<{
      success: boolean;
      data: any;
    }>(addSalonIdToEndpoint('/api/dashboard/stats'), {
      method: 'GET',
    });
    return response.data;
  },

  getActivities: async () => {
    const response = await apiRequest<{
      success: boolean;
      data: any[];
    }>(addSalonIdToEndpoint('/api/dashboard/activities'), {
      method: 'GET',
    });
    return response.data;
  },
};

