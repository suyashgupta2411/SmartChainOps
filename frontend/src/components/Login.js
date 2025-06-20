import axios from "axios";
import "../utils/axiosConfig";
import { useNavigate } from "react-router-dom";

const Login = () => {
  const navigate = useNavigate();

  const login = async (formData) => {
    try {
      const res = await axios.post("/api/auth/login", formData);

      // Save token to localStorage
      localStorage.setItem("token", res.data.token);

      // Redirect to home page after successful login
      navigate("/home");
    } catch (error) {
      console.error("Login Error:", error);
      // Handle error appropriately - show error message to user
      alert(error.response?.data?.msg || "Login failed");
    }
  };

  // Rest of your component code...
};

export default Login;
