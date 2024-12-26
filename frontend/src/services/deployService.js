import axios from "axios";
import api from "../config/api";

// Function to create a new deployment
const createDeployment = async (token, deploymentData) => {
  try {
    const config = {
      headers: { Authorization: `Bearer ${token}` },
    };

    // POST request to the updated backend endpoint
    const response = await axios.post(
      `${api}/deploy`, // Endpoint updated to match the router setup
      deploymentData,
      config
    );

    // Return the response data
    return response.data;
  } catch (error) {
    console.error(
      "Error creating deployment:",
      error.response?.data || error.message
    );
    throw new Error(
      error.response?.data?.error ||
        "Failed to create deployment. Please try again."
    );
  }
};

// Function to fetch all deployments
const getDeployments = async (token) => {
  try {
    const config = {
      headers: { Authorization: `Bearer ${token}` },
    };

    // GET request to fetch deployments
    const response = await axios.get(`${api}/deploy`, config);

    // Return the response data
    return response.data;
  } catch (error) {
    console.error(
      "Error fetching deployments:",
      error.response?.data || error.message
    );
    throw new Error(
      error.response?.data?.error ||
        "Failed to fetch deployments. Please try again."
    );
  }
};

// Exporting the deployment service functions
const deployService = { createDeployment, getDeployments };

export default deployService;
