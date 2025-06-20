import axios from "axios";

// Add a request interceptor
axios.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers["x-auth-token"] = token;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Add a response interceptor to handle token expiration
axios.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response.status === 401) {
      // Token expired or invalid
      localStorage.removeItem("token");
      // Redirect to login page or show login modal
      window.location.href = "/login";
    }
    return Promise.reject(error);
  }
);
