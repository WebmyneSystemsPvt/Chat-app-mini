import { useEffect } from "react";
import socketIO from "socket.io-client";
import { useDispatch } from "react-redux";
import customParser from "socket.io-msgpack-parser";
import { useLocation, useNavigate } from "react-router-dom";

import useUser from "./useUser";
import useSocket from "./useSocket";

import { getToken } from "../utils/token";
import { SOCKET_EVENTS } from "../constants/socketEvents";
import { setSocket } from "../redux/actions/socketActions";
import { enableSocketLogging } from "../utils/socketLogger";

export let socketRef;
export function setSocketRef(val) {
  socketRef = val;
}

export default function useInitSocket() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();

  const user = useUser();
  const socket = useSocket();

  const token = getToken();
  const userId = user?.id;

  useEffect(() => {
    if (user && !socket && socketRef) {
      socketRef.removeAllListeners();
      socketRef.disconnect();
      socketRef = null;
    }

    if (!user || socket || socketRef || !token || !userId) {
      return;
    }

    const io = socketIO(`${import.meta.env.VITE_API_URL}`, {
      auth: { token },
      parser: customParser,
      closeOnBeforeunload: true,
      autoConnect: true,
      upgrade: true,
      rememberUpgrade: true,
      useNativeTimers: true,
      reconnection: true,
    });

    dispatch(setSocket(io));

    socketRef = io;
    enableSocketLogging(io);

    const handleSocketConnection = async () => {
      io.emit(SOCKET_EVENTS.CONNECTION_INIT, {}, (response) => {
        console.log("✅ Connection initialized:", response);
      });

      if (location.pathname === "/" || location.pathname === "/register") {
        navigate("/dashboard", { replace: true });
      }
    };

    io.on(SOCKET_EVENTS.CONNECT, handleSocketConnection);
    io.connect();

    return () => {
      if (io) {
        io.off(SOCKET_EVENTS.CONNECT);
      }
    };
  }, [user, dispatch, navigate, location.pathname, socket?.id]);
}
