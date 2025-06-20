import axios from "axios";

const createDeployment = async (repoUrl) => {
  try {
    const token = localStorage.getItem("token");

    if (!token) {
      console.log("No token found in localStorage");
      throw new Error("Please login first");
    }

    console.log("Making deployment request with token:", token);

    const response = await axios.post(
      "/api/deploy",
      { repoUrl },
      {
        headers: {
          "Content-Type": "application/json",
          "x-auth-token": token,
          Authorization: `Bearer ${token}`,
        },
      }
    );

    return response.data;
  } catch (error) {
    console.error("Deployment Error:", error.response?.data || error.message);
    if (error.response?.status === 401) {
      localStorage.removeItem("token"); // Clear invalid token
      throw new Error("Please login again");
    }
    throw error;
  }
};

export { createDeployment };
