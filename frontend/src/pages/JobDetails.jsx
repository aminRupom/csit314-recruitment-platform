import { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { getJobById, applyToJob } from "../services/api";
import { isLoggedIn } from "../services/auth";
import "../styles/dashboard.css";

function JobDetails() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [job, setJob] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [coverMessage, setCoverMessage] = useState("");
  const [applying, setApplying] = useState(false);
  const [applyError, setApplyError] = useState("");
  const [applySuccess, setApplySuccess] = useState("");
  const [hasApplied, setHasApplied] = useState(false);

  useEffect(() => {
    if (!isLoggedIn()) {
      navigate("/login");
      return;
    }
    fetchJob();
  }, [id]);

  async function fetchJob() {
    setLoading(true);
    setError("");
    try {
      const data = await getJobById(id);
      setJob(data);
      setHasApplied(data.has_applied === true);
    } catch (err) {
      setError(err.message || "Failed to load job.");
    } finally {
      setLoading(false);
    }
  }

  async function handleApply(e) {
    e.preventDefault();
    setApplying(true);
    setApplyError("");
    setApplySuccess("");
    try {
      await applyToJob(id, coverMessage);
      setApplySuccess("Application submitted.");
      setHasApplied(true);
    } catch (err) {
      setApplyError(err.message || "Application failed.");
    } finally {
      setApplying(false);
    }
  }

  if (loading) {
    return (
      <main className="dashboard-page">
        <div className="dashboard-container">
          <p className="loading-text">Loading...</p>
        </div>
      </main>
    );
  }

  if (error || !job) {
    return (
      <main className="dashboard-page">
        <div className="dashboard-container">
          <p className="error-text">{error || "Job not found."}</p>
          <Link to="/candidate-dashboard">Back to jobs</Link>
        </div>
      </main>
    );
  }

  return (
    <main className="dashboard-page">
      <div className="dashboard-container">
        <nav className="dashboard-nav">
          <h1>Hustle</h1>
          <div className="nav-links">
            <Link to="/candidate-dashboard">Back to Jobs</Link>
          </div>
        </nav>

        <div className="card job-detail-full">
          <h2 style={{ fontSize: "22px", marginBottom: "6px" }}>{job.title}</h2>
          <div className="meta" style={{ marginBottom: "16px" }}>
            <span>{job.company_name}</span>
            <span>{job.employment_type}</span>
          </div>

          <div className="meta-row">
            <div className="meta-item">
              <div className="label">Location</div>
              <div className="value">{job.location}</div>
            </div>
            <div className="meta-item">
              <div className="label">Work Mode</div>
              <div className="value">{job.work_mode}</div>
            </div>
            {job.salary_min != null && (
              <div className="meta-item">
                <div className="label">Salary</div>
                <div className="value">
                  ${job.salary_min.toLocaleString()}
                  {job.salary_max != null ? ` - $${job.salary_max.toLocaleString()}` : "+"}
                </div>
              </div>
            )}
            <div className="meta-item">
              <div className="label">Experience</div>
              <div className="value">{job.required_experience_years} yr{job.required_experience_years !== 1 ? "s" : ""}</div>
            </div>
            <div className="meta-item">
              <div className="label">Education</div>
              <div className="value">{job.required_education}</div>
            </div>
          </div>

          {job.description && (
            <>
              <h3 className="section-heading" style={{ marginTop: "0" }}>Job Description</h3>
              <p>{job.description}</p>
            </>
          )}

          {job.required_skills && (
            <>
              <h3 className="section-heading">Required Skills</h3>
              <p>{job.required_skills}</p>
            </>
          )}

          {job.company_info && (
            <>
              <h3 className="section-heading">About the Company</h3>
              <p>{job.company_info}</p>
            </>
          )}

          {applySuccess && <p className="success-text">{applySuccess}</p>}
          {applyError && <p className="error-text">{applyError}</p>}

          {!hasApplied ? (
            <form onSubmit={handleApply} style={{ marginTop: "20px" }}>
              <div className="form-field">
                <label>Cover Message (optional)</label>
                <textarea
                  value={coverMessage}
                  onChange={(e) => setCoverMessage(e.target.value)}
                  placeholder="Briefly explain why you are a good fit..."
                />
              </div>
              <button
                type="submit"
                className="btn btn-primary"
                disabled={applying}
              >
                {applying ? "Applying..." : "Apply Now"}
              </button>
            </form>
          ) : (
            <p className="success-text" style={{ marginTop: "20px" }}>
              You have applied to this job.
            </p>
          )}
        </div>
      </div>
    </main>
  );
}

export default JobDetails;
