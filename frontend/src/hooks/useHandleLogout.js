import toast from "react-hot-toast";
import { useCallback } from "react";
import { useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";

import { clearUser } from "../redux/actions/userActions";
import { SOCKET_EVENTS } from "../constants/socketEvents";
import { setSocketRef, socketRef } from "./useInitSocket";

export default function useHandleLogout() {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const performCleanup = () => {
    if (socketRef) {
      socketRef.removeAllListeners();
      socketRef.disconnect();
      setSocketRef(null);
    }

    dispatch(clearUser());
    dispatch({ type: "LOGOUT" });

    const redirectReason = localStorage.getItem("redirectReason");
    if (redirectReason) {
      toast.error(redirectReason, { duration: 5000 });
    }
    localStorage.clear();
  };

  const handleLogout = useCallback(() => {
    if (socketRef?.connected) {
      socketRef.emit(SOCKET_EVENTS.CONNECTION_DISCONNECT);
    }
    setTimeout(performCleanup, 0);
    setTimeout(() => navigate("/", { replace: true }), 0);
  }, [dispatch, navigate]);

  return handleLogout;
}
