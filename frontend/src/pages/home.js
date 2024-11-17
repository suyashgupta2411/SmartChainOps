import { useState } from "react";
import { useRecoilState } from "recoil";
import authAtom from "../atoms/authAtom";
import deployService from "../services/deployService";
import Navbar from "../components/Navbar";

const Home = () => {
  const [repoUrl, setRepoUrl] = useState("");
  const [auth] = useRecoilState(authAtom);

  const handleDeploy = async () => {
    try {
      const data = await deployService.createDeployment(auth.token, {
        repoUrl,
      });
      alert("Deployment created!");
    } catch (err) {
      alert("Deployment failed!");
    }
  };

  return (
    <div
      className="h-screen bg-cover bg-center bg-no-repeat"
      style={{ backgroundImage: "url('/assets/bg-image.jpg')" }}
    >
      <Navbar />
      <div className="flex justify-center items-center h-full">
        <div className="bg-gray-700 p-8 rounded-lg shadow-lg">
          <input
            type="text"
            className="bg-gray-700 text-white p-2 rounded-full mb-4 w-full"
            placeholder="GitHub Repository URL"
            value={repoUrl}
            onChange={(e) => setRepoUrl(e.target.value)}
          />
          <button
            onClick={handleDeploy}
            className="bg-orange-500 text-white p-2 rounded-full w-full"
          >
            Deploy
          </button>
        </div>
      </div>
    </div>
  );
};

export default Home;
