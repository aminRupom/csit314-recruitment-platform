import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import {
  getLoggedInCandidateProfile,
  updateLoggedInCandidateProfile,
  uploadResume,
  startCandidateFreeTrial,
  getCurrentUser,
} from "../services/api";
import { clearTokens } from "../services/auth";
import "../styles/dashboard.css";

const EDUCATION_CHOICES = [
  { value: "HIGH_SCHOOL", label: "High School" },
  { value: "DIPLOMA", label: "Diploma" },
  { value: "BACHELOR", label: "Bachelor's Degree" },
  { value: "MASTER", label: "Master's Degree" },
  { value: "PHD", label: "PhD" },
];

const WORK_MODE_CHOICES = [
  { value: "REMOTE", label: "Remote" },
  { value: "ONSITE", label: "On-site" },
  { value: "HYBRID", label: "Hybrid" },
];

function CandidateProfile() {
  const navigate = useNavigate();

  const [profile, setProfile] = useState(null);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [resumeFile, setResumeFile] = useState(null);
  const [upgrading, setUpgrading] = useState(false);

  const [form, setForm] = useState({
    full_name: "",
    contact_email: "",
    contact_phone: "",
    education: "BACHELOR",
    major: "",
    years_experience: 0,
    skills: "",
    work_experience: "",
    bio: "",
    preferred_work_mode: "REMOTE",
    preferred_location: "",
  });

  useEffect(() => {
    fetchProfile();
  }, []);

  function applyProfileToForm(data) {
    setForm({
      full_name: data.full_name || "",
      contact_email: data.contact_email || "",
      contact_phone: data.contact_phone || "",
      education: data.education || "BACHELOR",
      major: data.major || "",
      years_experience: data.years_experience || 0,
      skills: data.skills || "",
      work_experience: data.work_experience || "",
      bio: data.bio || "",
      preferred_work_mode: data.preferred_work_mode || "REMOTE",
      preferred_location: data.preferred_location || "",
    });
  }

  async function fetchProfile() {
    setLoading(true);
    setError("");
    try {
      const [data, userData] = await Promise.all([
        getLoggedInCandidateProfile(),
        getCurrentUser(),
      ]);
      setProfile(data);
      setUser(userData);
      applyProfileToForm(data);
    } catch (err) {
      setError(err.message || "Could not load profile.");
    } finally {
      setLoading(false);
    }
  }

  function handleChange(e) {
    const { name, value } = e.target;
    setForm({ ...form, [name]: value });
  }

  async function handleSave(e) {
    e.preventDefault();
    setSaving(true);
    setError("");
    setMessage("");
    try {
      await updateLoggedInCandidateProfile(form);
      setMessage("Profile saved.");
    } catch (err) {
      setError(err.message || "Save failed.");
    } finally {
      setSaving(false);
    }
  }

  async function handleResumeUpload() {
    if (!resumeFile) return;
    setError("");
    setMessage("");
    try {
      const updated = await uploadResume(resumeFile);
      setProfile(updated);
      applyProfileToForm(updated);
      setMessage("Resume uploaded. Fields updated from your resume — review and save.");
      setResumeFile(null);
    } catch (err) {
      setError(err.message || "Upload failed.");
    }
  }

  async function handleUpgrade() {
    setUpgrading(true);
    setError("");
    try {
      const updatedUser = await startCandidateFreeTrial();
      setUser(updatedUser);
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

  if (loading) {
    return (
      <main className="dashboard-page">
        <div className="dashboard-container">
          <p className="loading-text">Loading profile...</p>
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
            <Link to="/candidate-dashboard">Dashboard</Link>
            <button onClick={handleLogout}>Logout</button>
          </div>
        </nav>

        {error && <p className="error-text">{error}</p>}
        {message && <p className="success-text">{message}</p>}

        <h2 className="section-heading">My Profile</h2>

        {!profile && !loading ? (
          <p className="empty-text">No profile found. Submit the form below to create one.</p>
        ) : null}

        <form onSubmit={handleSave}>
          <div className="form-row">
            <div className="form-field">
              <label>Full Name</label>
              <input name="full_name" value={form.full_name} onChange={handleChange} />
            </div>
            <div className="form-field">
              <label>Contact Email</label>
              <input type="email" name="contact_email" value={form.contact_email} onChange={handleChange} />
            </div>
            <div className="form-field">
              <label>Phone</label>
              <input name="contact_phone" value={form.contact_phone} onChange={handleChange} />
            </div>
            <div className="form-field">
              <label>Years of Experience</label>
              <input
                type="number"
                name="years_experience"
                min="0"
                value={form.years_experience}
                onChange={handleChange}
              />
            </div>
            <div className="form-field">
              <label>Education</label>
              <select name="education" value={form.education} onChange={handleChange}>
                {EDUCATION_CHOICES.map((c) => (
                  <option key={c.value} value={c.value}>{c.label}</option>
                ))}
              </select>
            </div>
            <div className="form-field">
              <label>Major / Field of Study</label>
              <input name="major" value={form.major} onChange={handleChange} />
            </div>
          </div>

          <div className="form-field">
            <label>Skills (comma-separated)</label>
            <input name="skills" value={form.skills} onChange={handleChange} placeholder="e.g. Python, Django, React" />
          </div>

          <div className="form-row">
            <div className="form-field">
              <label>Preferred Work Mode</label>
              <select name="preferred_work_mode" value={form.preferred_work_mode} onChange={handleChange}>
                {WORK_MODE_CHOICES.map((c) => (
                  <option key={c.value} value={c.value}>{c.label}</option>
                ))}
              </select>
            </div>
            <div className="form-field">
              <label>Preferred Location</label>
              <input name="preferred_location" value={form.preferred_location} onChange={handleChange} />
            </div>
          </div>

          <div className="form-field">
            <label>Work Experience</label>
            <textarea name="work_experience" value={form.work_experience} onChange={handleChange} />
          </div>

          <div className="form-field">
            <label>Bio / Summary</label>
            <textarea name="bio" value={form.bio} onChange={handleChange} />
          </div>

          <button type="submit" className="btn btn-primary" disabled={saving}>
            {saving ? "Saving..." : "Save Profile"}
          </button>
        </form>

        <h2 className="section-heading">Resume</h2>

        {profile && profile.resume_url && (
          <p>
            Current resume:{" "}
            <a href={profile.resume_url} target="_blank" rel="noreferrer" style={{ color: "#9ba8df" }}>
              Download
            </a>
          </p>
        )}

        <div className="card" style={{ marginTop: "12px" }}>
          <input
            type="file"
            accept=".pdf,.docx"
            onChange={(e) => setResumeFile(e.target.files[0])}
            style={{ marginBottom: "10px" }}
          />
          {resumeFile && <p style={{ fontSize: "13px", color: "#aeb8f2" }}>{resumeFile.name}</p>}
          <div className="card-actions">
            <button
              type="button"
              className="btn btn-secondary"
              onClick={handleResumeUpload}
              disabled={!resumeFile}
            >
              Upload Resume
            </button>
          </div>
        </div>

        <div className="membership-box">
          {user && user.membership ? (
            <>
              <h3>Premium Member</h3>
              <p>You have unlimited job recommendations and full platform access.</p>
            </>
          ) : (
            <>
              <h3>Premium Membership</h3>
              <p>Unlock unlimited job recommendations and priority visibility.</p>
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
      </div>
    </main>
  );
}

export default CandidateProfile;
