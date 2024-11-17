import Link from "next/link";
import { useRecoilState } from "recoil";
import authAtom from "../atoms/authAtom";
import { useRouter } from "next/router";

const Navbar = () => {
  const [auth, setAuth] = useRecoilState(authAtom);
  const router = useRouter();

  const handleLogout = () => {
    setAuth({ token: null });
    router.push("/login");
  };

  return (
    <nav className="bg-transparent p-6">
      <div className="container mx-auto flex justify-between items-center">
        <div className="text-white text-2xl font-bold">
          <Link href="/home">SmartChainOps</Link>
        </div>
        <div className="flex space-x-6 text-white">
          <Link href="/home">Home</Link>
          <Link href="/records">Records</Link>
          <Link href="/insights">Insights</Link>
          <Link href="/profile">Profile</Link>
          <button
            onClick={handleLogout}
            className="bg-orange-500 px-4 py-2 rounded-full"
          >
            Logout
          </button>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
