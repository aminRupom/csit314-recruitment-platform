import { Routes, Route, Navigate } from "react-router-dom";
import Login from "./pages/Login";
import CandidateSignup from "./pages/CandidateSignup";
import EmployerSignup from "./pages/EmployerSignup";

function App() {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/login" />} />
      <Route path="/login" element={<Login />} />

      <Route path="/signup/candidate" element={<CandidateSignup />} />
      <Route path="/signup/employer" element={<EmployerSignup />} />

      <Route path="/candidate-dashboard" element={<h1>Candidate Dashboard</h1>} />
      <Route path="/employer-dashboard" element={<h1>Employer Dashboard</h1>} />
    </Routes>
  );
}

export default App;