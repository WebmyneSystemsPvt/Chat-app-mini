import "./utils/bootstrap.js"


import AppRoutes from "./components/AppRoutes";
import { useNetwork } from "./contexts/NetworkContext";
import useFetchUserProfile from "./hooks/useFetchUserProfile";
import useInitSocket from "./hooks/useInitSocket";
import useAuthListener from "./hooks/useAuthListener";

function App() {
  const { isOnline } = useNetwork();

  useInitSocket();
  useFetchUserProfile();
  useAuthListener();

  return (
    <div className="h-screen bg-gray-100 relative">
      {!isOnline && (
        <div className="fixed top-0 left-0 right-0 z-50 bg-red-500 text-white text-center py-2 shadow-md animate-pulse">
          ⚠️ Network connection lost. Trying to reconnect...
        </div>
      )}

      <AppRoutes />
    </div>
  );
}

export default App;
