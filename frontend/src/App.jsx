import { Routes, Route, Navigate } from "react-router-dom";
import Login from "./pages/Login";

function App() {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/login" />} />
      <Route path="/login" element={<Login />} />

      {/* Temporary pages. We will properly design these later. */}
      <Route path="/signup/candidate" element={<h1>Candidate Sign Up Page</h1>} />
      <Route path="/signup/employer" element={<h1>Employer Sign Up Page</h1>} />
      <Route path="/candidate-dashboard" element={<h1>Candidate Dashboard</h1>} />
      <Route path="/employer-dashboard" element={<h1>Employer Dashboard</h1>} />
    </Routes>
  );
}

export default App;