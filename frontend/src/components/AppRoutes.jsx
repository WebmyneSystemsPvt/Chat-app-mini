import { lazy, Suspense } from "react";
import { Route, Routes } from "react-router-dom";
import FullScreenLoader from "./Loaders/FullScreenLoader";


const ChatApp = lazy(() => import("./ChatApp"));
const Login = lazy(() => import("../Auth/Login"));
const ChatWindow = lazy(() => import("./ChatWindow"));
const Register = lazy(() => import("../Auth/Register"));
const ProfileView = lazy(() => import("./ProfileView"));

export default function AppRoutes() {
  return (
    <>
      <Suspense fallback={<FullScreenLoader />}>
        <Routes>
          <Route path="/" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/" element={<ChatApp />}>
            <Route path="/dashboard" element={<ChatWindow />} />
            <Route path="/profile" element={<ProfileView />} />
            <Route path="/conversation/:id" element={<ChatWindow />} />
            <Route path="/user/:id" element={<ProfileView />} />
          </Route>
        </Routes>
      </Suspense>
    </>
  );
}
