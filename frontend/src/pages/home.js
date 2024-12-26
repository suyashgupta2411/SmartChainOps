import { useState, useEffect } from "react";
import { useRecoilState } from "recoil";
import authAtom from "../atoms/authAtom";
import deployService from "../services/deployService";
import Navbar from "../components/Navbar";

const Home = () => {
  const [repoUrl, setRepoUrl] = useState("");
  const [envVariables, setEnvVariables] = useState([{ key: "", value: "" }]);
  const [auth] = useRecoilState(authAtom);
  const [deploymentUrl, setDeploymentUrl] = useState("");
  const [serviceUrl, setServiceUrl] = useState(""); // For Kubernetes URL
  const [currentStep, setCurrentStep] = useState(""); // Step name for animation
  const [error, setError] = useState("");

  const steps = [
    "Cloning repository...",
    "Building Docker image...",
    "Pushing Docker image to DockerHub...",
    "Creating Kubernetes deployment...",
    "Fetching Kubernetes service URL...",
  ];

  // Handle adding a new environment variable
  const handleAddEnv = () => {
    setEnvVariables([...envVariables, { key: "", value: "" }]);
  };

  // Handle removing an environment variable
  const handleRemoveEnv = (index) => {
    const updatedEnv = envVariables.filter((_, i) => i !== index);
    setEnvVariables(updatedEnv);
  };

  // Handle updating an environment variable
  const handleEnvChange = (index, field, value) => {
    const updatedEnv = [...envVariables];
    updatedEnv[index][field] = value;
    setEnvVariables(updatedEnv);
  };

  // Save data to localStorage after deployment
  useEffect(() => {
    if (deploymentUrl && serviceUrl) {
      localStorage.setItem("deploymentUrl", deploymentUrl);
      localStorage.setItem("serviceUrl", serviceUrl);
    }
  }, [deploymentUrl, serviceUrl]);

  // Load data from localStorage
  useEffect(() => {
    if (typeof window !== "undefined") {
      const savedDeploymentUrl = localStorage.getItem("deploymentUrl");
      const savedServiceUrl = localStorage.getItem("serviceUrl");

      if (savedDeploymentUrl) setDeploymentUrl(savedDeploymentUrl);
      if (savedServiceUrl) setServiceUrl(savedServiceUrl);
    }
  }, []);

  const handleDeploy = async () => {
    setError("");
    setDeploymentUrl("");
    setServiceUrl("");
    setCurrentStep(steps[0]);

    const envObject = envVariables.reduce((acc, { key, value }) => {
      if (key && value) acc[key] = value;
      return acc;
    }, {});

    try {
      let stepIndex = 0;

      // Update the current step after each operation
      const updateStep = () => {
        if (stepIndex < steps.length) {
          setCurrentStep(steps[stepIndex]);
          stepIndex += 1;
        }
      };

      // Perform the deployment step by step
      const data = await deployService.createDeployment(auth.token, {
        repoUrl,
        envVariables: envObject,
        updateStep,
      });

      if (data.imageUrl && data.serviceUrl) {
        setDeploymentUrl(data.imageUrl);
        setServiceUrl(data.serviceUrl);
        alert("Deployment created successfully!");
      } else {
        setError("Unexpected response from the server.");
      }
    } catch (err) {
      setError(
        "Deployment failed due to an error. Please check logs for more info."
      );
    } finally {
      setCurrentStep("");
    }
  };

  return (
    <div
      className="h-screen bg-cover bg-center bg-no-repeat"
      style={{ backgroundImage: "url('/assets/bg-image.jpg')" }}
    >
      <Navbar />
      <div className="flex justify-center items-center h-full">
        <div className="bg-neutral-950 p-8 rounded-lg shadow-lg w-96">
          <input
            type="text"
            className="bg-neutral-950 text-white p-2 rounded-full mb-4 w-full"
            placeholder="GitHub Repository URL"
            value={repoUrl}
            onChange={(e) => setRepoUrl(e.target.value)}
          />

          <h3 className="text-white mb-4">Environment Variables</h3>
          {envVariables.map((env, index) => (
            <div key={index} className="flex mb-2">
              <input
                type="text"
                placeholder="Key"
                value={env.key}
                onChange={(e) => handleEnvChange(index, "key", e.target.value)}
                className="bg-neutral-950 text-white p-2 rounded-l-md w-1/2"
              />
              <input
                type="text"
                placeholder="Value"
                value={env.value}
                onChange={(e) =>
                  handleEnvChange(index, "value", e.target.value)
                }
                className="bg-neutral-950 text-white p-2 w-1/2"
              />
              <button
                onClick={() => handleRemoveEnv(index)}
                className="bg-red-600 text-white p-2 rounded-r-md"
              >
                Remove
              </button>
            </div>
          ))}
          <button
            onClick={handleAddEnv}
            className="bg-blue-600 text-white p-2 rounded-full w-full mb-4"
          >
            Add Environment Variable
          </button>

          <button
            onClick={handleDeploy}
            className="bg-orange-700 text-white p-2 rounded-full w-full"
          >
            Deploy
          </button>

          {/* Animated Steps */}
          {currentStep && (
            <div className="mt-4 text-white text-center">
              <p className="text-orange-500 animate-pulse">{currentStep}</p>
            </div>
          )}

          {/* Deployment URL */}
          {deploymentUrl && (
            <div className="mt-4">
              <p className="text-white">
                DockerHub URL:{" "}
                <a
                  href={deploymentUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-400 underline"
                >
                  {deploymentUrl}
                </a>
              </p>
              <p className="text-white">
                Kubernetes Service URL:{" "}
                <a
                  href={serviceUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-400 underline"
                >
                  {serviceUrl}
                </a>
              </p>
            </div>
          )}

          {/* Error Message */}
          {error && (
            <div className="mt-4">
              <p className="text-red-400">
                Error: {error}{" "}
                <a href="/insights" className="text-blue-400 underline">
                  View more details
                </a>
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Home;
