import { useState, useEffect } from "react";
import axios from "axios";

const Profile = () => {
  const [userData, setUserData] = useState(null);

  useEffect(() => {
    // Fetch user profile data (name, number of deployments)
    axios
      .get("/api/user/profile")
      .then((response) => {
        setUserData(response.data);
      })
      .catch((error) => {
        console.error("Error fetching profile:", error);
      });
  }, []);

  if (!userData) return <div>Loading...</div>;

  return (
    <div className="container mx-auto p-8">
      <div className="bg-gray-800 text-white p-6 rounded-lg shadow-lg">
        <h1 className="text-3xl font-bold">Profile</h1>
        <p className="mt-4 text-lg">Name: {userData.name}</p>
        <p className="mt-2 text-lg">
          Total Deployments: {userData.deploymentsCount}
        </p>
      </div>
    </div>
  );
};

export default Profile;
