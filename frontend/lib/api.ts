// API Client for Backend Integration

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

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
  
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    ...fetchOptions.headers,
  };

  // Add auth token if required
  if (requireAuth) {
    const token = getToken();
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
  }

  const url = `${API_BASE_URL}${endpoint}`;
  
  try {
    const response = await fetch(url, {
      ...fetchOptions,
      headers,
    });

    const data = await response.json();

    if (!response.ok) {
      // Validation error'ları daha detaylı göster
      if (data.errors && Array.isArray(data.errors) && data.errors.length > 0) {
        const errorMessages = data.errors.map((err: any) => 
          `${err.path?.join('.') || 'field'}: ${err.message}`
        ).join(', ');
        throw new Error(`Validation error: ${errorMessages}`);
      }
      throw new Error(data.message || 'API request failed');
    }

    return data;
  } catch (error) {
    if (error instanceof Error) {
      throw error;
    }
    throw new Error('Unknown error occurred');
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

