import axios from "axios";

const API_URL = "http://localhost:5000/api/auth";

const login = async (credentials) => {
  const response = await axios.post(`${API_URL}/login`, credentials);
  return response.data;
};

const register = async (user) => {
  const response = await axios.post(`${API_URL}/register`, user);
  return response.data;
};

const authService = { login, register };

export default authService;
