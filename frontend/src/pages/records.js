import { useEffect, useState } from "react";
import { useRecoilState } from "recoil";
import authAtom from "../atoms/authAtom";
import deployService from "../services/deployService";
import Navbar from "../components/Navbar";

const Records = () => {
  const [deployments, setDeployments] = useState([]);
  const [auth] = useRecoilState(authAtom);

  useEffect(() => {
    const fetchDeployments = async () => {
      try {
        const data = await deployService.getDeployments(auth.token);
        setDeployments(data);
      } catch (err) {
        alert("Failed to fetch deployment records.");
      }
    };
    fetchDeployments();
  }, [auth]);

  return (
    <div
      className="h-screen bg-cover bg-center bg-no-repeat"
      style={{ backgroundImage: "url('/assets/bg-image.jpg')" }}
    >
      <Navbar />
      <div className="container mx-auto py-10">
        <h1 className="text-white text-3xl mb-6">Deployment Records</h1>
        <ul className="text-white">
          {deployments.map((deploy, idx) => (
            <li key={idx} className="mb-4">
              <p>Repo URL: {deploy.repoUrl}</p>
              <p>Status: {deploy.status}</p>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default Records;
