import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import {
  getMyJobPostings,
  createJobPosting,
  deleteJobPosting,
  getApplicantsForMyJobs,
  updateApplicationStatus,
  getRecommendedCandidates,
} from "../services/api";
import { clearTokens } from "../services/auth";
import "../styles/dashboard.css";

const EMPLOYMENT_TYPES = ["FULL_TIME", "PART_TIME", "CONTRACT", "INTERNSHIP"];
const WORK_MODES = ["REMOTE", "ONSITE", "HYBRID"];
const EDUCATION_CHOICES = ["HIGH_SCHOOL", "DIPLOMA", "BACHELOR", "MASTER", "PHD"];
const APPLICATION_STATUSES = ["PENDING", "REVIEWED", "ACCEPTED", "REJECTED"];

const BLANK_JOB_FORM = {
  title: "",
  company_name: "",
  company_info: "",
  description: "",
  required_education: "BACHELOR",
  required_skills: "",
  required_experience_years: 0,
  work_mode: "REMOTE",
  location: "",
  salary_min: "",
  salary_max: "",
  employment_type: "FULL_TIME",
};

function EmployerDashboard() {
  const navigate = useNavigate();

  const [jobs, setJobs] = useState([]);
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  const [showJobForm, setShowJobForm] = useState(false);
  const [jobForm, setJobForm] = useState(BLANK_JOB_FORM);
  const [submitting, setSubmitting] = useState(false);

  const [expandedJobId, setExpandedJobId] = useState(null);
  const [candidates, setCandidates] = useState({});

  useEffect(() => {
    fetchAll();
  }, []);

  async function fetchAll() {
    setLoading(true);
    setError("");
    try {
      const [jobsData, appsData] = await Promise.all([
        getMyJobPostings(),
        getApplicantsForMyJobs(),
      ]);
      setJobs(Array.isArray(jobsData) ? jobsData : []);
      setApplications(Array.isArray(appsData) ? appsData : []);
    } catch (err) {
      setError(err.message || "Failed to load data.");
    } finally {
      setLoading(false);
    }
  }

  function handleJobFormChange(e) {
    const { name, value } = e.target;
    setJobForm({ ...jobForm, [name]: value });
  }

  async function handleCreateJob(e) {
    e.preventDefault();
    setSubmitting(true);
    setError("");
    setMessage("");
    try {
      const payload = {
        ...jobForm,
        required_experience_years: Number(jobForm.required_experience_years) || 0,
        salary_min: jobForm.salary_min ? Number(jobForm.salary_min) : null,
        salary_max: jobForm.salary_max ? Number(jobForm.salary_max) : null,
      };
      const created = await createJobPosting(payload);
      setJobs([created, ...jobs]);
      setJobForm(BLANK_JOB_FORM);
      setShowJobForm(false);
      setMessage("Job posted.");
    } catch (err) {
      setError(err.message || "Failed to post job.");
    } finally {
      setSubmitting(false);
    }
  }

  async function handleDelete(id) {
    if (!window.confirm("Delete this job posting?")) return;
    setError("");
    try {
      await deleteJobPosting(id);
      setJobs(jobs.filter((j) => j.id !== id));
      setMessage("Job deleted.");
    } catch (err) {
      setError(err.message || "Delete failed.");
    }
  }

  async function handleStatusChange(appId, newStatus) {
    try {
      const updated = await updateApplicationStatus(appId, newStatus);
      setApplications(
        applications.map((a) => (a.id === updated.id ? updated : a))
      );
    } catch (err) {
      setError(err.message || "Status update failed.");
    }
  }

  async function loadCandidates(jobId) {
    if (expandedJobId === jobId) {
      setExpandedJobId(null);
      return;
    }
    setExpandedJobId(jobId);
    if (candidates[jobId]) return;
    try {
      const recs = await getRecommendedCandidates(jobId);
      setCandidates({ ...candidates, [jobId]: Array.isArray(recs) ? recs : [] });
    } catch {
      setCandidates({ ...candidates, [jobId]: [] });
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
            <Link to="/profile/employer">My Account</Link>
            <button onClick={handleLogout}>Logout</button>
          </div>
        </nav>

        {error && <p className="error-text">{error}</p>}
        {message && <p className="success-text">{message}</p>}

        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <h2 className="section-heading" style={{ marginTop: 0 }}>My Job Postings</h2>
          <button
            type="button"
            className="btn btn-primary"
            onClick={() => setShowJobForm(!showJobForm)}
          >
            {showJobForm ? "Cancel" : "+ Post a Job"}
          </button>
        </div>

        {showJobForm && (
          <div className="card">
            <h3>New Job Posting</h3>
            <form onSubmit={handleCreateJob} style={{ marginTop: "12px" }}>
              <div className="form-row">
                <div className="form-field">
                  <label>Job Title</label>
                  <input name="title" value={jobForm.title} onChange={handleJobFormChange} required />
                </div>
                <div className="form-field">
                  <label>Company Name</label>
                  <input name="company_name" value={jobForm.company_name} onChange={handleJobFormChange} required />
                </div>
              </div>

              <div className="form-field">
                <label>Company Info</label>
                <textarea name="company_info" value={jobForm.company_info} onChange={handleJobFormChange} required />
              </div>

              <div className="form-field">
                <label>Job Description</label>
                <textarea name="description" value={jobForm.description} onChange={handleJobFormChange} required />
              </div>

              <div className="form-field">
                <label>Required Skills (comma-separated)</label>
                <input name="required_skills" value={jobForm.required_skills} onChange={handleJobFormChange} required />
              </div>

              <div className="form-row">
                <div className="form-field">
                  <label>Location</label>
                  <input name="location" value={jobForm.location} onChange={handleJobFormChange} required />
                </div>
                <div className="form-field">
                  <label>Employment Type</label>
                  <select name="employment_type" value={jobForm.employment_type} onChange={handleJobFormChange}>
                    {EMPLOYMENT_TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
                  </select>
                </div>
                <div className="form-field">
                  <label>Work Mode</label>
                  <select name="work_mode" value={jobForm.work_mode} onChange={handleJobFormChange}>
                    {WORK_MODES.map((m) => <option key={m} value={m}>{m}</option>)}
                  </select>
                </div>
                <div className="form-field">
                  <label>Required Education</label>
                  <select name="required_education" value={jobForm.required_education} onChange={handleJobFormChange}>
                    {EDUCATION_CHOICES.map((e) => <option key={e} value={e}>{e}</option>)}
                  </select>
                </div>
                <div className="form-field">
                  <label>Min Experience (years)</label>
                  <input
                    type="number"
                    name="required_experience_years"
                    min="0"
                    value={jobForm.required_experience_years}
                    onChange={handleJobFormChange}
                  />
                </div>
                <div className="form-field">
                  <label>Salary Min</label>
                  <input type="number" name="salary_min" value={jobForm.salary_min} onChange={handleJobFormChange} />
                </div>
                <div className="form-field">
                  <label>Salary Max</label>
                  <input type="number" name="salary_max" value={jobForm.salary_max} onChange={handleJobFormChange} />
                </div>
              </div>

              <button type="submit" className="btn btn-primary" disabled={submitting}>
                {submitting ? "Posting..." : "Post Job"}
              </button>
            </form>
          </div>
        )}

        {loading ? (
          <p className="loading-text">Loading...</p>
        ) : (
          <>
            {jobs.length === 0 ? (
              <p className="empty-text">No job postings yet.</p>
            ) : (
              jobs.map((job) => (
                <div key={job.id} className="card">
                  <h3>{job.title}</h3>
                  <div className="meta">
                    <span>{job.company_name}</span>
                    <span>{job.location}</span>
                    <span>{job.work_mode}</span>
                    <span>{job.application_count} applicant{job.application_count !== 1 ? "s" : ""}</span>
                  </div>
                  <div className="card-actions">
                    <button
                      type="button"
                      className="btn btn-secondary"
                      onClick={() => loadCandidates(job.id)}
                    >
                      {expandedJobId === job.id ? "Hide Recommendations" : "See Recommended Candidates"}
                    </button>
                    <button
                      type="button"
                      className="btn btn-danger"
                      onClick={() => handleDelete(job.id)}
                    >
                      Delete
                    </button>
                  </div>

                  {expandedJobId === job.id && (
                    <div style={{ marginTop: "12px" }}>
                      {!candidates[job.id] ? (
                        <p className="loading-text">Loading candidates...</p>
                      ) : candidates[job.id].length === 0 ? (
                        <p className="empty-text">No recommended candidates yet.</p>
                      ) : (
                        candidates[job.id].map((c) => (
                          <div key={c.id} className="card" style={{ marginBottom: "8px" }}>
                            <h3 style={{ fontSize: "15px" }}>{c.full_name}</h3>
                            <div className="meta">
                              <span>{c.major}</span>
                              <span>{c.years_experience} yr{c.years_experience !== 1 ? "s" : ""} exp</span>
                            </div>
                            <p>{c.skills}</p>
                          </div>
                        ))
                      )}
                    </div>
                  )}
                </div>
              ))
            )}

            <h2 className="section-heading">Applications Received</h2>
            {applications.length === 0 ? (
              <p className="empty-text">No applications yet.</p>
            ) : (
              applications.map((app) => (
                <div key={app.id} className="card">
                  <h3>{app.candidate_name}</h3>
                  <div className="meta">
                    <span>Applied to: {app.job_title}</span>
                    <span>{new Date(app.applied_at).toLocaleDateString()}</span>
                  </div>
                  {app.cover_message && <p>{app.cover_message}</p>}
                  <div className="card-actions">
                    <span className={`status-badge status-${app.status}`}>{app.status}</span>
                    <select
                      className="status-select"
                      value={app.status}
                      onChange={(e) => handleStatusChange(app.id, e.target.value)}
                    >
                      {APPLICATION_STATUSES.map((s) => (
                        <option key={s} value={s}>{s}</option>
                      ))}
                    </select>
                  </div>
                </div>
              ))
            )}
          </>
        )}
      </div>
    </main>
  );
}

export default EmployerDashboard;
