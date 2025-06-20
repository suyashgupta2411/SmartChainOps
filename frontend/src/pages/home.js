import { useState, useEffect } from "react";
import { useRecoilState } from "recoil";
import authAtom from "../atoms/authAtom";
import deployService from "../services/deployService";
import Navbar from "../components/Navbar";

const Home = () => {
  const [repoUrl, setRepoUrl] = useState("");
  const [envVariables, setEnvVariables] = useState([{ key: "", value: "" }]);
  const [auth] = useRecoilState(authAtom);

  // Deployment states
  const [deploymentStatus, setDeploymentStatus] = useState({
    loading: false,
    error: null,
    dockerUrl: null,
    serviceUrl: null,
    deploymentId: null,
    awsConsoleUrl: null,
  });

  // Backend deployment steps tracking
  const [backendSteps, setBackendSteps] = useState([]);
  const [currentStepIndex, setCurrentStepIndex] = useState(-1);

  // Predefined steps (for visual representation)
  const predefinedSteps = [
    "Configuring kubectl for EKS...",
    "Setting up cluster resources...",
    "Cloning repository...",
    "Setting up Dockerfile...",
    "Building Docker image...",
    "Pushing to Docker registry...",
    "Creating Kubernetes namespace...",
    "Deploying application...",
    "Waiting for Load Balancer...",
    "Deployment completed!",
  ];

  // Update current step index when backend steps change
  useEffect(() => {
    if (backendSteps.length > 0) {
      const lastStep = backendSteps[backendSteps.length - 1];
      const stepIndex = predefinedSteps.findIndex((step) => step === lastStep);
      if (stepIndex !== -1) {
        setCurrentStepIndex(stepIndex);
      }
    }
  }, [backendSteps]);

  // Handle adding environment variables
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

  // Deployment handler
  const handleDeploy = async () => {
    setBackendSteps([]); // Reset steps
    setCurrentStepIndex(-1);
    setDeploymentStatus({
      loading: true,
      error: null,
      dockerUrl: null,
      serviceUrl: null,
      deploymentId: null,
      awsConsoleUrl: null,
    });

    // Convert env variables array to object
    const envObject = envVariables.reduce((acc, { key, value }) => {
      if (key && value) acc[key] = value;
      return acc;
    }, {});

    try {
      // Create a function to update steps that backend can call
      const updateStep = (step) => {
        setBackendSteps((prev) => [...prev, step]);
      };

      const data = await deployService.createDeployment(auth.token, {
        repoUrl,
        envVariables: envObject,
        updateStep,
      });

      setDeploymentStatus({
        loading: false,
        error: null,
        dockerUrl: data.imageUrl,
        serviceUrl: data.serviceUrl,
        deploymentId: data.deploymentId,
        awsConsoleUrl: data.awsConsoleUrl,
      });
    } catch (error) {
      setDeploymentStatus({
        ...deploymentStatus,
        loading: false,
        error: error.message || "Deployment failed unexpectedly",
      });
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      <Navbar />
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-md mx-auto bg-neutral-900 p-8 rounded-xl shadow-2xl">
          {/* GitHub Repository Input */}
          <input
            type="text"
            placeholder="GitHub Repository URL"
            value={repoUrl}
            onChange={(e) => setRepoUrl(e.target.value)}
            className="w-full p-3 mb-4 bg-neutral-800 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />

          {/* Environment Variables Section */}
          <div className="mb-4">
            <h3 className="text-white mb-2">Environment Variables</h3>
            {envVariables.map((env, index) => (
              <div key={index} className="flex mb-2 space-x-2">
                <input
                  type="text"
                  placeholder="Key"
                  value={env.key}
                  onChange={(e) =>
                    handleEnvChange(index, "key", e.target.value)
                  }
                  className="w-1/2 p-2 bg-neutral-800 text-white rounded-lg"
                />
                <input
                  type="text"
                  placeholder="Value"
                  value={env.value}
                  onChange={(e) =>
                    handleEnvChange(index, "value", e.target.value)
                  }
                  className="w-1/2 p-2 bg-neutral-800 text-white rounded-lg"
                />
                <button
                  onClick={() => handleRemoveEnv(index)}
                  className="bg-red-600 text-white p-2 rounded-lg"
                >
                  Remove
                </button>
              </div>
            ))}
            <button
              onClick={handleAddEnv}
              className="w-full p-2 bg-gray-600 text-white rounded-lg hover:bg-blue-700"
            >
              Add Environment Variable
            </button>
          </div>

          {/* Deploy Button */}
          <button
            onClick={handleDeploy}
            disabled={deploymentStatus.loading || !repoUrl}
            className={`w-full p-3 rounded-lg ${
              deploymentStatus.loading || !repoUrl
                ? "bg-gray-500 cursor-not-allowed"
                : "bg-orange-600 hover:bg-orange-700"
            } text-white transition-colors`}
          >
            {deploymentStatus.loading ? "Deploying..." : "Deploy"}
          </button>

          {/* Deployment Steps Visualization */}
          {(deploymentStatus.loading || backendSteps.length > 0) && (
            <div className="mt-6 bg-neutral-800 p-4 rounded-lg">
              <h4 className="text-white font-bold mb-4">Deployment Progress</h4>
              <div className="space-y-4">
                {predefinedSteps.map((step, index) => (
                  <div key={index} className="relative">
                    {/* Timeline line */}
                    {index < predefinedSteps.length - 1 && (
                      <div
                        className={`absolute left-2.5 top-6 w-0.5 h-full ${
                          index < currentStepIndex
                            ? "bg-orange-500"
                            : "bg-gray-600"
                        }`}
                      ></div>
                    )}

                    {/* Step with dot */}
                    <div className="flex items-start">
                      <div
                        className={`w-5 h-5 rounded-full mt-1 flex items-center justify-center ${
                          index <= currentStepIndex
                            ? "bg-orange-500"
                            : "bg-gray-600"
                        }`}
                      >
                        {index < currentStepIndex && (
                          <svg
                            className="w-3 h-3 text-white"
                            fill="currentColor"
                            viewBox="0 0 20 20"
                          >
                            <path
                              fillRule="evenodd"
                              d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                              clipRule="evenodd"
                            ></path>
                          </svg>
                        )}
                      </div>

                      {/* Step text */}
                      <div className="ml-4">
                        <span
                          className={`font-medium ${
                            index === currentStepIndex
                              ? "text-orange-500"
                              : index < currentStepIndex
                              ? "text-gray-400"
                              : "text-gray-500"
                          }`}
                        >
                          {step}
                        </span>

                        {/* Current step animation */}
                        {index === currentStepIndex && (
                          <div className="mt-1 flex items-center">
                            <div className="w-2 h-2 bg-orange-500 rounded-full animate-pulse mr-1"></div>
                            <div
                              className="w-2 h-2 bg-orange-500 rounded-full animate-pulse mr-1"
                              style={{ animationDelay: "0.2s" }}
                            ></div>
                            <div
                              className="w-2 h-2 bg-orange-500 rounded-full animate-pulse"
                              style={{ animationDelay: "0.4s" }}
                            ></div>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Deployment Results */}
          {deploymentStatus.dockerUrl && (
            <div className="mt-4 bg-neutral-800 p-4 rounded-lg">
              <h4 className="text-white font-bold mb-2">Deployment Details</h4>
              <div className="space-y-2">
                <p className="text-gray-300">
                  <span className="font-semibold">DockerHub URL:</span>{" "}
                  <a
                    href={deploymentStatus.dockerUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-400 hover:underline"
                  >
                    {deploymentStatus.dockerUrl}
                  </a>
                </p>
                <p className="text-gray-300">
                  <span className="font-semibold">Service URL:</span>{" "}
                  <a
                    href={deploymentStatus.serviceUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-400 hover:underline"
                  >
                    {deploymentStatus.serviceUrl}
                  </a>
                </p>
                <p className="text-gray-300">
                  <span className="font-semibold">AWS Console:</span>{" "}
                  <a
                    href={deploymentStatus.awsConsoleUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-400 hover:underline"
                  >
                    View in AWS Console
                  </a>
                </p>
              </div>
            </div>
          )}

          {/* Error Handling */}
          {deploymentStatus.error && (
            <div className="mt-4 bg-red-900/30 p-3 rounded-lg">
              <p className="text-red-400">{deploymentStatus.error}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Home;
