
import { Navigate } from "react-router-dom";
import { useUser } from "../context/UserContext";
import { ReactNode } from "react";

interface ProtectedRouteProps {
  children: ReactNode;
  requiredUserType: "student" | "teacher";
}

const ProtectedRoute = ({ children, requiredUserType }: ProtectedRouteProps) => {
  const { userType, isAuthenticated } = useUser();

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (userType !== requiredUserType) {
    return <Navigate to={`/${userType}-dashboard`} replace />;
  }

  return <>{children}</>;
};

export default ProtectedRoute;
