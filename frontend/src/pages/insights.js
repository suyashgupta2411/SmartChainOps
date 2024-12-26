import { useState, useEffect } from "react";
import { useRecoilState } from "recoil";
import authAtom from "../atoms/authAtom";
import Navbar from "../components/Navbar";
import axios from "axios";

const Insights = () => {
  const [errorMessage, setErrorMessage] = useState("");
  const [errorSummary, setErrorSummary] = useState(""); // Summary from Gemini API
  const [deploymentStatus, setDeploymentStatus] = useState(""); // Status of deployment
  const [deploymentUrl, setDeploymentUrl] = useState(""); // Deployment URL
  const [serviceUrl, setServiceUrl] = useState(""); // Kubernetes service URL
  const [generalStats, setGeneralStats] = useState({
    size: 0, // Placeholder for size
    type: "",
  });

  const geminiApiKey = "AIzaSyBGTmycbxpfyZsvSn2_vzGqU25QIRzLl-0"; // Gemini API Key

  // Load deployment data from localStorage after component mounts
  useEffect(() => {
    if (typeof window !== "undefined") {
      const savedDeploymentUrl = localStorage.getItem("deploymentUrl");
      const savedServiceUrl = localStorage.getItem("serviceUrl");

      if (savedDeploymentUrl) setDeploymentUrl(savedDeploymentUrl);
      if (savedServiceUrl) setServiceUrl(savedServiceUrl);

      // Update deployment status
      if (savedDeploymentUrl && savedServiceUrl) {
        setDeploymentStatus("Deployment successful!");
      } else {
        setDeploymentStatus("No deployment found.");
      }
    }
  }, []); // Run this only once after the component mounts

  // Handle error summary with Gemini API
  const handleGetErrorSummary = async () => {
    if (errorMessage) {
      try {
        const response = await axios.post(
          "https://gemini.googleapis.com/v1beta/summarizeError", // Gemini API endpoint
          {
            error_message: errorMessage,
            apiKey: geminiApiKey,
          }
        );
        setErrorSummary(response.data.summary); // Assuming the response contains a 'summary' field
      } catch (error) {
        console.error("Error fetching summary from Gemini API:", error);
        setErrorSummary(
          "Unable to summarize the error. Please try again later."
        );
      }
    }
  };

  // Simulate getting error logs (you should replace this with actual error logs from your backend)
  const simulateErrorLogs = () => {
    setErrorMessage(
      "Deployment failed due to a network issue while pushing the Docker image."
    );
  };

  return (
    <div
      className="h-screen bg-cover bg-center bg-no-repeat"
      style={{ backgroundImage: "url('/assets/bg-image.jpg')" }}
    >
      <Navbar />
      <div className="flex justify-center items-center h-full">
        <div className="bg-neutral-950 p-8 rounded-lg shadow-lg w-96">
          <h1 className="text-white text-3xl mb-6">Deployment Insights</h1>

          {/* Display Deployment Status */}
          <div className="text-white mb-4">
            <h3 className="text-lg font-bold">Status: {deploymentStatus}</h3>
            {deploymentUrl && serviceUrl && (
              <>
                <p className="mt-2">
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
                <p className="mt-2">
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
              </>
            )}
          </div>

          {/* Error Handling */}
          {errorMessage && (
            <div className="mt-4 text-white">
              <h3 className="text-red-400">Error Encountered:</h3>
              <p>{errorMessage}</p>
              <button
                onClick={handleGetErrorSummary}
                className="mt-2 text-blue-400 underline"
              >
                Get Error Summary
              </button>
              {errorSummary && (
                <div className="mt-4 text-white">
                  <h4 className="text-lg font-bold">Error Summary:</h4>
                  <p>{errorSummary}</p>
                </div>
              )}
            </div>
          )}

          {/* General Deployment Stats */}
          {!errorMessage && deploymentStatus === "Deployment successful!" && (
            <div className="mt-4 text-white">
              <h4 className="text-lg font-bold">Deployment Statistics:</h4>
              <p>Project Size: {generalStats.size} MB</p>
              <p>Project Type: {generalStats.type}</p>
            </div>
          )}

          {/* General Tips */}
          {!errorMessage &&
            deploymentStatus !== "No deployment found." &&
            !errorSummary && (
              <div className="mt-4 text-white">
                <h4 className="text-lg font-bold">General Tips:</h4>
                <ul>
                  <li>
                    Ensure your Dockerfile is correctly configured for your
                    project.
                  </li>
                  <li>
                    Always check for potential issues in your Kubernetes config.
                  </li>
                  <li>Verify environment variables before deployment.</li>
                </ul>
              </div>
            )}

          {/* Simulate error for testing */}
          <button
            onClick={simulateErrorLogs}
            className="mt-4 bg-red-600 text-white p-2 rounded-md"
          >
            Simulate Error Logs
          </button>
        </div>
      </div>
    </div>
  );
};

export default Insights;
