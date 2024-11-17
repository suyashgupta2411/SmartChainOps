import { useRecoilState } from "recoil";
import authAtom from "../atoms/authAtom";

const useAuth = () => {
  const [auth] = useRecoilState(authAtom);
  return auth.token;
};

export default useAuth;
