import { Routes, Route, Navigate } from "react-router-dom";
import Login from "./pages/Login";
import CandidateSignup from "./pages/CandidateSignup";
import EmployerSignup from "./pages/EmployerSignup";
import CandidateDashboard from "./pages/CandidateDashboard";
import EmployerDashboard from "./pages/EmployerDashboard";
import JobDetails from "./pages/JobDetails";
import CandidateProfile from "./pages/CandidateProfile";
import EmployerProfile from "./pages/EmployerProfile";
import { isLoggedIn } from "./services/auth";

function ProtectedRoute({ children }) {
  if (!isLoggedIn()) {
    return <Navigate to="/login" replace />;
  }
  return children;
}

function App() {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/login" />} />
      <Route path="/login" element={<Login />} />
      <Route path="/signup/candidate" element={<CandidateSignup />} />
      <Route path="/signup/employer" element={<EmployerSignup />} />

      <Route
        path="/candidate-dashboard"
        element={
          <ProtectedRoute>
            <CandidateDashboard />
          </ProtectedRoute>
        }
      />
      <Route
        path="/employer-dashboard"
        element={
          <ProtectedRoute>
            <EmployerDashboard />
          </ProtectedRoute>
        }
      />
      <Route
        path="/jobs/:id"
        element={
          <ProtectedRoute>
            <JobDetails />
          </ProtectedRoute>
        }
      />
      <Route
        path="/profile/candidate"
        element={
          <ProtectedRoute>
            <CandidateProfile />
          </ProtectedRoute>
        }
      />
      <Route
        path="/profile/employer"
        element={
          <ProtectedRoute>
            <EmployerProfile />
          </ProtectedRoute>
        }
      />
    </Routes>
  );
}

export default App;
