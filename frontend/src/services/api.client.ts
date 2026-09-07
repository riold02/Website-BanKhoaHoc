import axios from 'axios';

export const apiClient = axios.create({
  baseURL: '/api/v1',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request Interceptor: Gắn Bearer Token tự động vào Header
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('cms_access_token');
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response Interceptor: Bắt lỗi 401 hết phiên đăng nhập hoặc trích xuất message
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Nếu không phải trang login/register thì dọn token và redirect
      const isAuthPage = window.location.pathname.includes('/login') || window.location.pathname.includes('/register');
      if (!isAuthPage) {
        localStorage.removeItem('cms_access_token');
        localStorage.removeItem('cms_refresh_token');
        localStorage.removeItem('cms_user');
      }
    }
    const errorMessage = error.response?.data?.error?.message || error.message || 'Đã có lỗi xảy ra';
    return Promise.reject(new Error(errorMessage));
  }
);
