import { useRecoilState } from "recoil";
import authAtom from "../atoms/authAtom";
import Navbar from "../components/Navbar";

const Profile = () => {
  const [auth] = useRecoilState(authAtom);

  return (
    <div
      className="h-screen bg-cover bg-center bg-no-repeat"
      style={{ backgroundImage: "url('/assets/bg-image.jpg')" }}
    >
      <Navbar />
      <div className="container mx-auto py-10">
        <h1 className="text-white text-3xl mb-6">Profile</h1>
        <div className="bg-gray-800 p-8 rounded-lg shadow-lg">
          <p className="text-white">
            Username: {auth.token ? "User" : "Anonymous"}
          </p>
        </div>
      </div>
    </div>
  );
};

export default Profile;
