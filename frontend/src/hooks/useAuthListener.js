import { useEffect } from "react";
import { useLocation } from "react-router-dom";

import { getToken } from "../utils/token";

import useUser from "./useUser";
import useHandleLogout from "./useHandleLogout";

const noAuthPaths = ["/", "/register"];

export default function useAuthListener() {
  const token = getToken();
  const location = useLocation();
  const userId = useUser()?.id;
  const handleLogout = useHandleLogout();

  useEffect(() => {
    if ((!token || !userId) && !noAuthPaths.includes(location.pathname)) {
      handleLogout();
      return;
    }
  }, [token, userId, location.pathname]);
}
