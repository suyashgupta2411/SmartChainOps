import { useState, useEffect } from "react";
import { useRecoilState } from "recoil";
import { useNavigate } from "react-router-dom";
import authAtom from "../atoms/authAtom";
import Navbar from "../components/Navbar";
import deployService from "../services/deployService";
import DotBackground from "../components/DotBackground";

const Profile = () => {
  const [auth] = useRecoilState(authAtom);
  const [deployments, setDeployments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchDeployments = async () => {
      if (!auth?.token) {
        window.location.href = "/login";
        return;
      }

      try {
        const data = await deployService.getDeployments(auth.token);
        setDeployments(data);
        setLoading(false);
      } catch (err) {
        setError(err.message);
        setLoading(false);
      }
    };

    fetchDeployments();
  }, [auth?.token]);

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleString();
  };

  if (!auth?.token) {
    return null; // Will redirect in useEffect
  }

  return (
    <div className="min-h-screen bg-black">
      <DotBackground />
      <Navbar />
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          {/* User Info */}
          <div className="bg-neutral-900/80 p-6 rounded-xl shadow-2xl mb-8 backdrop-blur-sm">
            <h2 className="text-2xl font-bold text-white mb-4">Profile</h2>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-gray-400">Username</p>
                <p className="text-white">{auth?.user?.username || "N/A"}</p>
              </div>
              <div>
                <p className="text-gray-400">Total Deployments</p>
                <p className="text-white">{deployments.length}</p>
              </div>
            </div>
          </div>

          {/* Deployments Section */}
          <div className="bg-neutral-900/80 p-6 rounded-xl shadow-2xl backdrop-blur-sm">
            <h2 className="text-2xl font-bold text-white mb-4">
              Deployment History
            </h2>

            {loading && (
              <div className="text-center py-4">
                <div className="w-6 h-6 border-2 border-orange-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
                <p className="text-gray-400 mt-2">Loading deployments...</p>
              </div>
            )}

            {error && (
              <div className="bg-red-900/30 text-red-400 p-4 rounded-lg mb-4">
                {error}
              </div>
            )}

            {!loading && !error && deployments.length === 0 && (
              <div className="text-center py-8">
                <p className="text-gray-400">No deployments found</p>
              </div>
            )}

            <div className="space-y-4">
              {deployments.map((deployment) => (
                <div
                  key={deployment._id}
                  className="bg-neutral-800/90 p-4 rounded-lg hover:bg-neutral-700/90 transition-colors backdrop-blur-sm"
                >
                  <div className="flex justify-between items-start mb-3">
                    <div>
                      <h3 className="text-white font-semibold">
                        {deployment.repoUrl.split("/").pop()}
                      </h3>
                      <p className="text-sm text-gray-400">
                        Deployed on: {formatDate(deployment.deployedAt)}
                      </p>
                    </div>
                    <span
                      className={`px-2 py-1 rounded text-sm ${
                        deployment.status === "Deployed"
                          ? "bg-green-900/30 text-green-400"
                          : "bg-yellow-900/30 text-yellow-400"
                      }`}
                    >
                      {deployment.status}
                    </span>
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center space-x-2">
                      <span className="text-gray-400">Repository:</span>
                      <a
                        href={deployment.repoUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-400 hover:underline"
                      >
                        {deployment.repoUrl}
                      </a>
                    </div>

                    <div className="flex items-center space-x-2">
                      <span className="text-gray-400">Service URL:</span>
                      <a
                        href={deployment.serviceUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-400 hover:underline"
                      >
                        {deployment.serviceUrl}
                      </a>
                    </div>

                    <div className="flex items-center space-x-2">
                      <span className="text-gray-400">Docker Image:</span>
                      <a
                        href={`https://hub.docker.com/r/${deployment.imageName}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-400 hover:underline"
                      >
                        {deployment.imageName}
                      </a>
                    </div>

                    <div className="flex items-center space-x-2">
                      <span className="text-gray-400">AWS Console:</span>
                      <a
                        href="https://us-east-1.console.aws.amazon.com/eks/clusters/charming-dubstep-seal?region=us-east-1&selectedResourceId=deployments&selectedTab=cluster-resources-tab"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-400 hover:underline"
                      >
                        View in AWS Console
                      </a>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;
