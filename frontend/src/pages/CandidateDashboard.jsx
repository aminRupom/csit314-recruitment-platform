import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  getJobs,
  searchJobs,
  getRecommendedJobs,
  getMyApplications,
} from "../services/api";
import { isLoggedIn, clearTokens } from "../services/auth";
import "../styles/dashboard.css";

function JobCard({ job }) {
  return (
    <div className="card">
      <h3>
        <Link to={`/jobs/${job.id}`} style={{ color: "inherit", textDecoration: "none" }}>
          {job.title}
        </Link>
      </h3>
      <div className="meta">
        <span>{job.company_name}</span>
        <span>{job.location}</span>
        <span>{job.work_mode}</span>
        {job.salary_min != null && (
          <span>
            ${job.salary_min.toLocaleString()}
            {job.salary_max != null ? ` - $${job.salary_max.toLocaleString()}` : "+"}
          </span>
        )}
      </div>
      {job.description && (
        <p>
          {job.description.length > 160
            ? job.description.slice(0, 160) + "..."
            : job.description}
        </p>
      )}
    </div>
  );
}

function CandidateDashboard() {
  const navigate = useNavigate();

  const [jobs, setJobs] = useState([]);
  const [recommendations, setRecommendations] = useState([]);
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    if (!isLoggedIn()) {
      navigate("/login");
      return;
    }
    fetchAll();
  }, []);

  async function fetchAll() {
    setLoading(true);
    setError("");
    try {
      const [jobsData, appsData] = await Promise.all([
        getJobs(),
        getMyApplications(),
      ]);
      setJobs(Array.isArray(jobsData) ? jobsData : []);
      setApplications(Array.isArray(appsData) ? appsData : []);

      try {
        const recs = await getRecommendedJobs();
        setRecommendations(Array.isArray(recs) ? recs : []);
      } catch {
        // recommendations require a candidate profile - fail silently
      }
    } catch (err) {
      setError(err.message || "Failed to load data.");
    } finally {
      setLoading(false);
    }
  }

  async function handleSearch(e) {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const results = await searchJobs(searchQuery);
      setJobs(Array.isArray(results) ? results : []);
    } catch (err) {
      setError(err.message || "Search failed.");
    } finally {
      setLoading(false);
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
            <Link to="/profile/candidate">My Profile</Link>
            <button onClick={handleLogout}>Logout</button>
          </div>
        </nav>

        {error && <p className="error-text">{error}</p>}

        <h2 className="section-heading">Find Jobs</h2>

        <form className="search-bar" onSubmit={handleSearch}>
          <input
            type="text"
            placeholder="Search by title, skill, or company..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          <button type="submit">Search</button>
        </form>

        {loading ? (
          <p className="loading-text">Loading...</p>
        ) : (
          <>
            {recommendations.length > 0 && (
              <>
                <h2 className="section-heading">Recommended for You</h2>
                {recommendations.map((job) => (
                  <JobCard key={job.id} job={job} />
                ))}
              </>
            )}

            <h2 className="section-heading">All Jobs</h2>
            {jobs.length === 0 ? (
              <p className="empty-text">No jobs found.</p>
            ) : (
              jobs.map((job) => <JobCard key={job.id} job={job} />)
            )}

            <h2 className="section-heading">My Applications</h2>
            {applications.length === 0 ? (
              <p className="empty-text">No applications yet.</p>
            ) : (
              applications.map((app) => (
                <div key={app.id} className="card">
                  <h3>{app.job_title}</h3>
                  <div className="meta">
                    <span>{app.company_name}</span>
                    <span>Applied {new Date(app.applied_at).toLocaleDateString()}</span>
                  </div>
                  <span className={`status-badge status-${app.status}`}>
                    {app.status}
                  </span>
                </div>
              ))
            )}
          </>
        )}
      </div>
    </main>
  );
}

export default CandidateDashboard;
