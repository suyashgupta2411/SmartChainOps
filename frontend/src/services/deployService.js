import axios from "axios";
import api from "../config/api";

// Function to create a new deployment
const createDeployment = async (token, deploymentData) => {
  try {
    const config = {
      headers: { Authorization: `Bearer ${token}` },
    };

    // If updateStep function is provided, create a function to handle SSE or polling
    if (
      deploymentData.updateStep &&
      typeof deploymentData.updateStep === "function"
    ) {
      // We can't send functions in requests, so we'll create a unique ID
      // Then use polling to get updates
      const deploymentId = Date.now().toString();

      // Clone data without the function
      const requestData = { ...deploymentData };
      delete requestData.updateStep;

      // Make the initial request
      const response = await axios.post(`${api}/deploy`, requestData, config);

      // Setup polling for status updates if the backend supports it
      const pollInterval = setInterval(async () => {
        try {
          const statusResponse = await axios.get(
            `${api}/deploy/status/${
              response.data.deploymentId || deploymentId
            }`,
            config
          );

          if (statusResponse.data.step) {
            deploymentData.updateStep(statusResponse.data.step);
          }

          // If deployment is complete or failed, stop polling
          if (
            statusResponse.data.status === "complete" ||
            statusResponse.data.status === "failed"
          ) {
            clearInterval(pollInterval);
          }
        } catch (error) {
          console.error("Error polling deployment status:", error);
        }
      }, 2000); // Poll every 2 seconds

      // Return the response data
      return response.data;
    } else {
      // Regular POST request without step tracking
      const response = await axios.post(
        `${api}/deploy`,
        deploymentData,
        config
      );
      return response.data;
    }
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

// Function to get deployment status updates
const getDeploymentStatus = async (token, deploymentId) => {
  try {
    const config = {
      headers: { Authorization: `Bearer ${token}` },
    };

    // GET request to fetch deployment status
    const response = await axios.get(
      `${api}/deploy/status/${deploymentId}`,
      config
    );

    // Return the response data
    return response.data;
  } catch (error) {
    console.error(
      "Error fetching deployment status:",
      error.response?.data || error.message
    );
    throw new Error(
      error.response?.data?.error ||
        "Failed to fetch deployment status. Please try again."
    );
  }
};

// Exporting the deployment service functions
const deployService = {
  createDeployment,
  getDeployments,
  getDeploymentStatus,
};

export default deployService;
