import axios from "axios";
import api from "../config/api";

const createDeployment = async (token, deploymentData) => {
  const config = {
    headers: { "x-auth-token": token },
  };
  const response = await axios.post(
    `${api}/deploy/create`,
    deploymentData,
    config
  );
  return response.data;
};

const getDeployments = async (token) => {
  const config = {
    headers: { "x-auth-token": token },
  };
  const response = await axios.get(`${api}/deploy`, config);
  return response.data;
};

const deployService = { createDeployment, getDeployments };

export default deployService;
