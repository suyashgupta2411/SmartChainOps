import { useRouter } from "next/router";
import { useRecoilState } from "recoil";
import authAtom from "../atoms/authAtom";
import { useEffect } from "react";

const IndexPage = () => {
  const router = useRouter();
  const [auth, setAuth] = useRecoilState(authAtom);

  useEffect(() => {
    if (!auth.token) router.push("/login");
  }, [auth, router]);

  return <div>Welcome to SmartChainOps!</div>;
};

export default IndexPage;
