import { Navigate } from "react-router-dom";
import { useAppSelector } from "../redux/hook";
import type { ReactNode } from "react";

interface Props {
  children: ReactNode;
}

const PublicRoute = ({ children }: Props) => {
  const { loggedUser, isLoading } = useAppSelector((state) => state.user);

  if (isLoading) return <div>Loading...</div>;

  if (loggedUser) {
    return <Navigate to="/dashboard" replace />;
  }

  return <>{children}</>;
};

export default PublicRoute;
