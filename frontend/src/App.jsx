import { Routes, Route, Navigate } from "react-router-dom";
import Login from "./pages/Login";
import CandidateSignup from "./pages/CandidateSignup";
import EmployerSignup from "./pages/EmployerSignup";
import CandidateDashboard from "./pages/CandidateDashboard";
import JobDetails from "./pages/JobDetails";
import CandidateProfile from "./pages/CandidateProfile";

function App() {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/login" />} />
      <Route path="/login" element={<Login />} />

      <Route path="/signup/candidate" element={<CandidateSignup />} />
      <Route path="/signup/employer" element={<EmployerSignup />} />

      <Route path="/candidate-dashboard" element={<CandidateDashboard />} />
      <Route path="/candidate-profile" element={<CandidateProfile />} />
      <Route path="/jobs/:jobId" element={<JobDetails />} />
      <Route path="/employer-dashboard" element={<h1>Employer Dashboard</h1>} />
    </Routes>
  );
}

export default App;