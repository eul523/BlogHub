import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useEffect,useState } from "react";
import useAuthStore from "../stores/authStore";

export default function ProtectRoute() {
  const { isAuthenticated, isLoading, checkAuth } = useAuthStore();
  const location = useLocation();
  const [authChecked, setAuthChecked ] = useState(false);

  useEffect(() => {
    if (!isAuthenticated && !isLoading && !authChecked) {
      checkAuth().catch(e=>{}).finally(()=>setAuthChecked(true));
    }
  }, [isAuthenticated, isLoading, checkAuth]);

  if (isLoading || (!isAuthenticated && !authChecked)) {
    return (
      <div className="h-full w-full flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return isAuthenticated ? (
    <Outlet />
  ) : (
    <Navigate
      to={`/login?redirectTo=${encodeURIComponent(location.pathname + location.search)}`}
      replace
    />
  );
}