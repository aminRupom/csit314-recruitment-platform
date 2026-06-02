import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { getCurrentUser, startEmployerFreeTrial } from "../services/api";
import { clearTokens } from "../services/auth";
import "../styles/dashboard.css";

function EmployerProfile() {
  const navigate = useNavigate();

  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [upgrading, setUpgrading] = useState(false);

  useEffect(() => {
    fetchUser();
  }, []);

  async function fetchUser() {
    setLoading(true);
    try {
      const data = await getCurrentUser();
      setUser(data);
    } catch (err) {
      setError(err.message || "Could not load profile.");
    } finally {
      setLoading(false);
    }
  }

  async function handleUpgrade() {
    setUpgrading(true);
    setError("");
    try {
      const updated = await startEmployerFreeTrial();
      setUser(updated);
      setMessage("Membership activated.");
    } catch (err) {
      setError(err.message || "Upgrade failed.");
    } finally {
      setUpgrading(false);
    }
  }

  function handleLogout() {
    clearTokens();
    navigate("/login");
  }

  return (
    <main className="dashboard-page">
      <div className="dashboard-container">
        <nav className="dashboard-nav">
          <h1>Hustle</h1>
          <div className="nav-links">
            <Link to="/employer-dashboard">Dashboard</Link>
            <button onClick={handleLogout}>Logout</button>
          </div>
        </nav>

        {error && <p className="error-text">{error}</p>}
        {message && <p className="success-text">{message}</p>}

        {loading ? (
          <p className="loading-text">Loading...</p>
        ) : (
          <>
            <h2 className="section-heading">Account</h2>
            {user && (
              <div className="card">
                <p><strong>Username:</strong> {user.username}</p>
                <p><strong>Email:</strong> {user.email}</p>
                <p><strong>Role:</strong> {user.role}</p>
                <p><strong>Member since:</strong> {new Date(user.date_joined).toLocaleDateString()}</p>
              </div>
            )}

            <div className="membership-box">
              <h3>
                {user && user.membership ? "Premium Member" : "Free Plan"}
              </h3>
              {user && user.membership ? (
                <p>You have full access to candidate recommendations and all platform features.</p>
              ) : (
                <>
                  <p>Upgrade to see unlimited candidate recommendations and boost your job postings.</p>
                  <button
                    type="button"
                    className="btn btn-primary"
                    onClick={handleUpgrade}
                    disabled={upgrading}
                  >
                    {upgrading ? "Activating..." : "Start Free Trial"}
                  </button>
                </>
              )}
            </div>
          </>
        )}
      </div>
    </main>
  );
}

export default EmployerProfile;
