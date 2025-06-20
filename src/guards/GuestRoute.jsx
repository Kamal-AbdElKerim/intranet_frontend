import { Navigate, Outlet } from "react-router-dom";
import { useEffect, useState } from "react";

const GuestRoute = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem("access_token");
    const msalToken = localStorage.getItem("msal_token");
    setIsAuthenticated(!!(token || msalToken));
    setIsLoading(false);
  }, []);

  if (isLoading) {
    return null; // or a loading spinner
  }

  return !isAuthenticated ? (
    <Outlet />
  ) : (
    <Navigate to={`${import.meta.env.BASE_URL}dashboards`} replace />
  );
};

export default GuestRoute;
