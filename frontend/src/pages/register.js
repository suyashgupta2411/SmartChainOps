import { useState } from "react";
import { useRouter } from "next/router";
import authService from "../services/authService";
import Link from "next/link";

const Register = () => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const router = useRouter();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      alert("Passwords do not match!");
      return;
    }

    try {
      await authService.register({ username, password });
      alert("Registration successful! Please login.");
      router.push("/login");
    } catch (err) {
      alert("Registration failed!");
    }
  };

  return (
    <div
      className="flex flex-col items-center justify-center h-screen bg-cover bg-center bg-no-repeat"
      style={{ backgroundImage: "url('/assets/bg-image.jpg')" }}
    >
      <div className="flex flex-col items-center">
        <img src="/assets/logo.png" className="w-48 mx-auto mb-8" alt="Logo" />{" "}
        {/* Increased logo size */}
        <form
          onSubmit={handleSubmit}
          className="flex flex-col items-center w-full max-w-md p-4"
        >
          <input
            type="text"
            className="bg-gray-800 bg-opacity-40 text-white placeholder-white p-4 rounded-full mb-6 w-full border border-white focus:outline-none focus:ring-2 focus:ring-orange-500 text-lg"
            placeholder="Username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
          />
          <input
            type="password"
            className="bg-gray-800 bg-opacity-40 text-white placeholder-white p-4 rounded-full mb-6 w-full border border-white focus:outline-none focus:ring-2 focus:ring-orange-500 text-lg"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
          <input
            type="password"
            className="bg-gray-800 bg-opacity-40 text-white placeholder-white p-4 rounded-full mb-6 w-full border border-white focus:outline-none focus:ring-2 focus:ring-orange-500 text-lg"
            placeholder="Confirm Password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            required
          />
          <button
            type="submit"
            className="bg-orange-500 text-white p-4 rounded-full w-full text-lg transition-all hover:bg-orange-600"
          >
            Register
          </button>
        </form>
        <p className="text-white mt-4 text-lg">
          Already have an account?{" "}
          <Link href="/login" legacyBehavior>
            <a className="text-orange-500 hover:text-orange-600">Login here</a>
          </Link>
        </p>
      </div>
    </div>
  );
};

export default Register;
