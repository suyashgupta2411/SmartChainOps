import { atom } from "recoil";

const authAtom = atom({
  key: "authState",
  default: {
    token: null,
  },
});

export default authAtom;
