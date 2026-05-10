import { Route, Routes } from "react-router-dom";
import GetStarted from "./pages/GetStarted";
import Login from "./pages/Login";
import Register from "./pages/Register";
import { useGetLoggedUser } from "./hooks/useGetLoggedUser";
import Deshboard from "./pages/Deshboard";
import { useAppSelector } from "./redux/hook";
import ProtectedRoute from "./components/ProtectedRoute";
import PublicRoute from "./components/PublicRoute";
import { Attendance } from "./pages/student/Attendance";
import { EnrollBiometrics } from "./pages/student/EnrollBiometrics";

function App() {
  useGetLoggedUser();
  const { loggedUser } = useAppSelector((state) => state.user);
  console.log("Logged User in App:", loggedUser);
  return (
    <Routes>
      <Route
        path="/"
        element={
          <PublicRoute>
            <GetStarted />
          </PublicRoute>
        }
      />
      <Route
        path="/login"
        element={
          <PublicRoute>
            <Login />
          </PublicRoute>
        }
      />
      <Route
        path="/register"
        element={
          <PublicRoute>
            <Register />
          </PublicRoute>
        }
      />
      <Route
        path="/dashboard"
        element={
          <ProtectedRoute>
            <Deshboard />
          </ProtectedRoute>
        }
      />
      <Route
        path="/attendance"
        element={
          <ProtectedRoute>
            <Attendance />
          </ProtectedRoute>
        }
      />
      <Route
        path="/enroll_biometrics"
        element={
          <ProtectedRoute>
            <EnrollBiometrics />
          </ProtectedRoute>
        }
      />
    </Routes>
  );
}

export default App;
