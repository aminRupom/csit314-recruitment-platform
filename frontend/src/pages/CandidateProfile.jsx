import { useCallback, useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  getLoggedInCandidateProfile,
  updateLoggedInCandidateProfile,
  uploadResume,
  startCandidateFreeTrial,
  getCurrentUser,
} from "../services/api";
import { clearTokens } from "../services/auth";
import "../styles/candidateProfile.css";

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

const DEFAULT_FORM = {
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
};

function getProfileInitials(fullName) {
  return (
    fullName
      ?.split(" ")
      .map((namePart) => namePart[0])
      .filter(Boolean)
      .slice(0, 2)
      .join("")
      .toUpperCase() || "?"
  );
}

function getChoiceLabel(choices, value) {
  return choices.find((choice) => choice.value === value)?.label || value || "-";
}

function splitSkills(skills) {
  return (skills || "")
    .split(",")
    .map((skill) => skill.trim())
    .filter(Boolean);
}

function getSectionPayload(form, section) {
  if (section === "left") {
    return {
      full_name: form.full_name,
      contact_email: form.contact_email,
      contact_phone: form.contact_phone,
      years_experience: form.years_experience,
      preferred_work_mode: form.preferred_work_mode,
      preferred_location: form.preferred_location,
    };
  }

  return {
    bio: form.bio,
    work_experience: form.work_experience,
    education: form.education,
    major: form.major,
    skills: form.skills,
  };
}

function CandidateProfile() {
  const navigate = useNavigate();

  const [profile, setProfile] = useState(null);
  const [user, setUser] = useState(null);
  const [form, setForm] = useState(DEFAULT_FORM);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [upgrading, setUpgrading] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [resumeFile, setResumeFile] = useState(null);
  const [newSkill, setNewSkill] = useState("");
  const [leftEditMode, setLeftEditMode] = useState(false);
  const [rightEditMode, setRightEditMode] = useState(false);

  const skills = useMemo(() => splitSkills(form.skills), [form.skills]);

  function applyProfileToForm(data) {
    setForm({
      full_name: data?.full_name || "",
      contact_email: data?.contact_email || "",
      contact_phone: data?.contact_phone || "",
      education: data?.education || "BACHELOR",
      major: data?.major || "",
      years_experience: data?.years_experience || 0,
      skills: data?.skills || "",
      work_experience: data?.work_experience || "",
      bio: data?.bio || "",
      preferred_work_mode: data?.preferred_work_mode || "REMOTE",
      preferred_location: data?.preferred_location || "",
    });
  }

  const fetchProfile = useCallback(async () => {
    setLoading(true);
    setError("");

    try {
      const [profileData, userData] = await Promise.all([
        getLoggedInCandidateProfile(),
        getCurrentUser(),
      ]);

      setProfile(profileData);
      setUser(userData);
      applyProfileToForm(profileData);
    } catch (err) {
      setError(err.message || "Could not load profile.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const fetchTimer = window.setTimeout(() => {
      fetchProfile();
    }, 0);

    return () => {
      window.clearTimeout(fetchTimer);
    };
  }, [fetchProfile]);

  function handleChange(event) {
    const { name, value } = event.target;
    setForm((currentForm) => ({
      ...currentForm,
      [name]: name === "years_experience" ? Number(value) : value,
    }));
  }

  async function saveProfile(section) {
    setSaving(true);
    setError("");
    setMessage("");

    try {
      const updatedProfile = await updateLoggedInCandidateProfile(
        getSectionPayload(form, section)
      );
      setProfile(updatedProfile);
      applyProfileToForm(updatedProfile);
      setMessage("Profile saved successfully.");

      if (section === "left") {
        setLeftEditMode(false);
      }

      if (section === "right") {
        setRightEditMode(false);
      }
    } catch (err) {
      setError(err.message || "Save failed.");
    } finally {
      setSaving(false);
    }
  }

  function addSkill() {
    if (!newSkill.trim()) {
      return;
    }

    const nextSkills = [...skills, newSkill.trim()];
    setForm((currentForm) => ({
      ...currentForm,
      skills: nextSkills.join(", "),
    }));
    setNewSkill("");
  }

  function removeSkill(skillToRemove) {
    const nextSkills = skills.filter((skill) => skill !== skillToRemove);
    setForm((currentForm) => ({
      ...currentForm,
      skills: nextSkills.join(", "),
    }));
  }

  async function handleResumeUpload() {
    if (!resumeFile) {
      return;
    }

    setUploading(true);
    setError("");
    setMessage("");

    try {
      const updatedProfile = await uploadResume(resumeFile);
      setProfile(updatedProfile);
      applyProfileToForm(updatedProfile);
      setResumeFile(null);
      setMessage("Resume uploaded. Review the updated fields and save.");
    } catch (err) {
      setError(err.message || "Upload failed.");
    } finally {
      setUploading(false);
    }
  }

  async function handleUpgrade() {
    setUpgrading(true);
    setError("");
    setMessage("");

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
      <main className="candidate-profile-view-page">
        <p className="profile-loading-text">Loading profile...</p>
      </main>
    );
  }

  return (
    <main className="candidate-profile-view-page">
      <header className="profile-top-section">
        <div className="profile-nav-actions">
          <button
            type="button"
            className="profile-back-button"
            onClick={() => navigate("/candidate-dashboard")}
          >
            Back
          </button>

          <button
            type="button"
            className="profile-logout-button"
            onClick={handleLogout}
          >
            Logout
          </button>
        </div>

        <h1>My Profile</h1>

        <div className="profile-identity-row">
          <div className="profile-avatar">{getProfileInitials(form.full_name)}</div>

          <div>
            <h2 className="profile-name-text">
              {form.full_name || "Candidate"}
            </h2>
            <p className="profile-location-text">
              {form.preferred_location || "Preferred location not set"}
            </p>
            {user?.membership && (
              <span className="profile-membership-badge">
                Pro User - Free Trial Active
              </span>
            )}
          </div>
        </div>

        {error && <p className="profile-error-message">{error}</p>}
        {message && <p className="profile-save-message">{message}</p>}
      </header>

      <section className="profile-content-grid">
        <aside className="profile-left-panel">
          <section className="profile-section-block">
            <div className="profile-section-heading">
              <h2>Personal Info</h2>
              <button
                type="button"
                className="candidate-profile-edit-button"
                onClick={() => setLeftEditMode(true)}
                disabled={leftEditMode || saving}
              >
                {leftEditMode ? "Editing" : "Edit"}
              </button>
            </div>
          </section>

          <div className="profile-inline-field">
            <label>Full name:</label>
            {leftEditMode ? (
              <input
                type="text"
                name="full_name"
                value={form.full_name}
                onChange={handleChange}
              />
            ) : (
              <span className="profile-readonly-value">
                {form.full_name || "-"}
              </span>
            )}
          </div>

          <div className="profile-inline-field">
            <label>Email Address:</label>
            {leftEditMode ? (
              <input
                type="email"
                name="contact_email"
                value={form.contact_email}
                onChange={handleChange}
              />
            ) : (
              <span className="profile-readonly-value">
                {form.contact_email || "-"}
              </span>
            )}
          </div>

          <div className="profile-inline-field">
            <label>Membership:</label>
            <span
              className={
                user?.membership ? "profile-pro-value" : "profile-readonly-value"
              }
            >
              {user?.membership ? "Pro user - free trial active" : "Standard user"}
            </span>
          </div>

          <div className="profile-inline-field">
            <label>Phone Number:</label>
            {leftEditMode ? (
              <input
                type="text"
                name="contact_phone"
                value={form.contact_phone}
                onChange={handleChange}
              />
            ) : (
              <span className="profile-readonly-value">
                {form.contact_phone || "-"}
              </span>
            )}
          </div>

          <div className="profile-inline-field">
            <label>Years Experience:</label>
            {leftEditMode ? (
              <input
                type="number"
                name="years_experience"
                min="0"
                value={form.years_experience}
                onChange={handleChange}
              />
            ) : (
              <span className="profile-readonly-value">
                {form.years_experience}
              </span>
            )}
          </div>

          <div className="profile-inline-field">
            <label>Preferred Work Mode:</label>
            {leftEditMode ? (
              <select
                name="preferred_work_mode"
                value={form.preferred_work_mode}
                onChange={handleChange}
              >
                {WORK_MODE_CHOICES.map((choice) => (
                  <option key={choice.value} value={choice.value}>
                    {choice.label}
                  </option>
                ))}
              </select>
            ) : (
              <span className="profile-readonly-value">
                {getChoiceLabel(WORK_MODE_CHOICES, form.preferred_work_mode)}
              </span>
            )}
          </div>

          <div className="profile-inline-field">
            <label>Preferred Location:</label>
            {leftEditMode ? (
              <input
                type="text"
                name="preferred_location"
                value={form.preferred_location}
                onChange={handleChange}
              />
            ) : (
              <span className="profile-readonly-value">
                {form.preferred_location || "-"}
              </span>
            )}
          </div>

          {!user?.membership && (
            <div className="profile-membership-box">
              <h3>Premium Membership</h3>
              <p>Unlock unlimited job recommendations and full platform access.</p>
              <button
                type="button"
                className="profile-save-button"
                onClick={handleUpgrade}
                disabled={upgrading}
              >
                {upgrading ? "Activating..." : "Start Free Trial"}
              </button>
            </div>
          )}

          {leftEditMode && (
            <button
              type="button"
              className="profile-save-button left-save"
              onClick={() => saveProfile("left")}
              disabled={saving}
            >
              {saving ? "Saving..." : "Save"}
            </button>
          )}
        </aside>

        <section className="profile-right-panel">
          <div className="profile-section-block">
            <div className="profile-section-heading">
              <h2>Work / Achievement</h2>
              <button
                type="button"
                className="candidate-profile-edit-button"
                onClick={() => setRightEditMode(true)}
                disabled={rightEditMode || saving}
              >
                {rightEditMode ? "Editing" : "Edit"}
              </button>
            </div>

            <label>Professional Summary:</label>
            {rightEditMode ? (
              <textarea
                className="summary-textarea"
                name="bio"
                value={form.bio}
                onChange={handleChange}
              />
            ) : (
              <p className="profile-summary-readonly">
                {form.bio || "No professional summary added yet."}
              </p>
            )}
          </div>

          <div className="profile-section-block">
            <label>Experience:</label>
            {rightEditMode ? (
              <textarea
                className="summary-textarea"
                name="work_experience"
                value={form.work_experience}
                onChange={handleChange}
              />
            ) : (
              <div className="profile-record-box">
                <p className="profile-summary-readonly">
                  {form.work_experience || "No work experience added yet."}
                </p>
              </div>
            )}
          </div>

          <div className="profile-section-block">
            <label>Education:</label>
            <div className="profile-record-box">
              <div className="record-line">
                <span>Certification:</span>
                {rightEditMode ? (
                  <select
                    name="education"
                    value={form.education}
                    onChange={handleChange}
                  >
                    {EDUCATION_CHOICES.map((choice) => (
                      <option key={choice.value} value={choice.value}>
                        {choice.label}
                      </option>
                    ))}
                  </select>
                ) : (
                  <input
                    type="text"
                    value={getChoiceLabel(EDUCATION_CHOICES, form.education)}
                    readOnly
                  />
                )}
              </div>

              <div className="record-line">
                <span>Major:</span>
                <input
                  type="text"
                  name="major"
                  value={form.major}
                  readOnly={!rightEditMode}
                  onChange={handleChange}
                />
              </div>
            </div>
          </div>

          <div className="profile-section-block compact-section">
            <label>Skills:</label>

            <div className="profile-tag-column">
              {skills.length === 0 && (
                <span className="profile-empty-note">No skills added yet.</span>
              )}

              {skills.map((skill) => (
                <button
                  type="button"
                  className="profile-tag"
                  key={skill}
                  onClick={() => {
                    if (rightEditMode) {
                      removeSkill(skill);
                    }
                  }}
                >
                  {skill} {rightEditMode && <span>x</span>}
                </button>
              ))}
            </div>

            {rightEditMode && (
              <div className="add-small-row">
                <input
                  type="text"
                  value={newSkill}
                  onChange={(event) => setNewSkill(event.target.value)}
                  placeholder="Add skill"
                />

                <button type="button" onClick={addSkill}>
                  +
                </button>
              </div>
            )}
          </div>

          <div className="profile-section-block">
            <label>Resume:</label>
            <div className="profile-resume-row">
              {profile?.resume_url ? (
                <a href={profile.resume_url} target="_blank" rel="noreferrer">
                  Download current resume
                </a>
              ) : (
                <span className="profile-empty-note">No resume uploaded.</span>
              )}

              <label className="profile-file-button">
                Choose file
                <input
                  type="file"
                  accept=".pdf,.docx"
                  onChange={(event) => setResumeFile(event.target.files[0])}
                />
              </label>

              {resumeFile && (
                <span className="profile-selected-file">{resumeFile.name}</span>
              )}

              <button
                type="button"
                className="profile-save-button"
                onClick={handleResumeUpload}
                disabled={!resumeFile || uploading}
              >
                {uploading ? "Uploading..." : "Upload Resume"}
              </button>
            </div>
          </div>

          {rightEditMode && (
            <button
              type="button"
              className="profile-save-button right-save"
              onClick={() => saveProfile("right")}
              disabled={saving}
            >
              {saving ? "Saving..." : "Save"}
            </button>
          )}
        </section>
      </section>
    </main>
  );
}

export default CandidateProfile;
