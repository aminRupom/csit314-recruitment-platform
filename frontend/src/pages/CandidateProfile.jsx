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

const EMPTY_EXPERIENCE = {
  jobTitle: "",
  companyName: "",
  dateRange: "",
  description: "",
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

function parseBioSections(value) {
  const text = (value || "").trim();

  if (!text) {
    return {
      summary: "",
      achievements: [],
    };
  }

  const achievementMatch = text.match(/\bAchievements?:\s*/i);

  if (!achievementMatch) {
    return {
      summary: text,
      achievements: [],
    };
  }

  const summary = text.slice(0, achievementMatch.index).trim();
  const achievementText = text
    .slice(achievementMatch.index + achievementMatch[0].length)
    .trim();
  const achievements = achievementText
    .split(/,|\r?\n/)
    .map((achievement) => achievement.replace(/^[-*]\s*/, "").trim())
    .filter(Boolean);

  return {
    summary,
    achievements,
  };
}

function buildBio(summary, achievements) {
  const cleanSummary = summary.trim();
  const cleanAchievements = achievements
    .map((achievement) => achievement.trim())
    .filter(Boolean);

  return [
    cleanSummary,
    cleanAchievements.length
      ? `Achievements: ${cleanAchievements.join(", ")}`
      : "",
  ]
    .filter(Boolean)
    .join("\n");
}

function parseWorkExperience(value) {
  const text = (value || "").trim();

  if (!text) {
    return EMPTY_EXPERIENCE;
  }

  const [headingLine = "", ...descriptionLines] = text.split(/\r?\n/);
  let heading = headingLine.trim();
  let dateRange = "";
  const dateMatch = heading.match(/\(([^()]*)\)\s*$/);

  if (dateMatch) {
    dateRange = dateMatch[1].trim();
    heading = heading.slice(0, dateMatch.index).trim();
  }

  const atMarker = " at ";
  const atIndex = heading.toLowerCase().lastIndexOf(atMarker);
  const jobTitle =
    atIndex >= 0 ? heading.slice(0, atIndex).trim() : heading.trim();
  const companyName =
    atIndex >= 0 ? heading.slice(atIndex + atMarker.length).trim() : "";

  return {
    jobTitle,
    companyName,
    dateRange,
    description: descriptionLines.join("\n").trim(),
  };
}

function buildWorkExperience(experience) {
  const jobTitle = experience.jobTitle.trim();
  const companyName = experience.companyName.trim();
  const dateRange = experience.dateRange.trim();
  const description = experience.description.trim();
  let heading = jobTitle;

  if (companyName) {
    heading = heading ? `${heading} at ${companyName}` : companyName;
  }

  if (dateRange) {
    heading = heading ? `${heading} (${dateRange})` : `(${dateRange})`;
  }

  return [heading, description].filter(Boolean).join("\n");
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
  const [newAchievement, setNewAchievement] = useState("");
  const [leftEditMode, setLeftEditMode] = useState(false);
  const [rightEditMode, setRightEditMode] = useState(false);

  const skills = useMemo(() => splitSkills(form.skills), [form.skills]);
  const bioSections = useMemo(() => parseBioSections(form.bio), [form.bio]);
  const workExperience = useMemo(
    () => parseWorkExperience(form.work_experience),
    [form.work_experience]
  );

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

  function updateBioSummary(summary) {
    setForm((currentForm) => {
      const currentBio = parseBioSections(currentForm.bio);

      return {
        ...currentForm,
        bio: buildBio(summary, currentBio.achievements),
      };
    });
  }

  function addAchievement() {
    if (!newAchievement.trim()) {
      return;
    }

    setForm((currentForm) => {
      const currentBio = parseBioSections(currentForm.bio);

      return {
        ...currentForm,
        bio: buildBio(currentBio.summary, [
          ...currentBio.achievements,
          newAchievement.trim(),
        ]),
      };
    });
    setNewAchievement("");
  }

  function removeAchievement(achievementToRemove) {
    setForm((currentForm) => {
      const currentBio = parseBioSections(currentForm.bio);

      return {
        ...currentForm,
        bio: buildBio(
          currentBio.summary,
          currentBio.achievements.filter(
            (achievement) => achievement !== achievementToRemove
          )
        ),
      };
    });
  }

  function updateWorkExperienceField(field, value) {
    setForm((currentForm) => {
      const currentExperience = parseWorkExperience(
        currentForm.work_experience
      );

      return {
        ...currentForm,
        work_experience: buildWorkExperience({
          ...currentExperience,
          [field]: value,
        }),
      };
    });
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
            className="profile-logout-button"
            onClick={handleLogout}
          >
            Logout
          </button>

          <button
            type="button"
            className="profile-back-button"
            onClick={() => navigate("/candidate-dashboard")}
          >
            Back
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
                pro user-trial activated
              </span>
            )}
          </div>
        </div>

        {error && <p className="profile-error-message">{error}</p>}
        {message && <p className="profile-save-message">{message}</p>}
      </header>

      <section
        className={`profile-content-grid ${
          leftEditMode || rightEditMode ? "profile-editing-layout" : ""
        }`}
      >
        <aside
          className={`profile-left-panel ${
            leftEditMode ? "profile-panel-editing" : ""
          }`}
        >
          <div className="profile-panel-action-row">
            {!leftEditMode && (
              <button
                type="button"
                className="candidate-profile-edit-button"
                onClick={() => setLeftEditMode(true)}
                disabled={saving}
              >
                Edit
              </button>
            )}
          </div>

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
            <label>Date of Birth:</label>
            {leftEditMode ? (
              <input type="text" value="-" disabled />
            ) : (
              <span className="profile-readonly-value">-</span>
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

          <div className="profile-inline-field profile-address-field">
            <label>Address:</label>
            {leftEditMode ? (
              <input type="text" value="-" disabled />
            ) : (
              <span className="profile-address-lines" aria-label="Address not set">
                <span></span>
                <span></span>
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

          <div className="profile-inline-field">
            <label>Availability:</label>
            {leftEditMode ? (
              <select value="Ready to work now" disabled>
                <option>Ready to work now</option>
              </select>
            ) : (
              <span className="profile-readonly-value">Ready to work now</span>
            )}
          </div>

          <div className="profile-inline-field">
            <label>Password:</label>
            {leftEditMode ? (
              <input type="password" value="*************" disabled />
            ) : (
              <span className="profile-readonly-value">*************</span>
            )}
          </div>

          {!user?.membership && (
            <div className="profile-membership-box profile-hidden-addon">
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

        <section
          className={`profile-right-panel ${
            rightEditMode ? "profile-panel-editing" : ""
          }`}
        >
          <div className="profile-panel-action-row profile-right-action-row">
            {!rightEditMode && (
              <button
                type="button"
                className="candidate-profile-edit-button"
                onClick={() => setRightEditMode(true)}
                disabled={saving}
              >
                Edit
              </button>
            )}
          </div>

          <div className="profile-section-block">
            <label>Professional Summary:</label>
            {rightEditMode ? (
              <textarea
                className="summary-textarea"
                value={bioSections.summary}
                onChange={(event) => updateBioSummary(event.target.value)}
              />
            ) : (
              <p className="profile-summary-readonly">
                {bioSections.summary || "No professional summary added yet."}
              </p>
            )}
          </div>

          <div className="profile-section-block">
            <label>Experience:</label>
            {rightEditMode ? (
              <>
                <div className="profile-record-box profile-edit-record-box">
                  <button
                    type="button"
                    className="profile-record-remove-button"
                    aria-label="Remove experience"
                    disabled
                  >
                    x
                  </button>

                  <div className="record-line">
                    <label>Job Title:</label>
                    <input
                      type="text"
                      value={workExperience.jobTitle}
                      onChange={(event) =>
                        updateWorkExperienceField("jobTitle", event.target.value)
                      }
                    />
                  </div>

                  <div className="record-line">
                    <label>Company Name:</label>
                    <input
                      type="text"
                      value={workExperience.companyName}
                      onChange={(event) =>
                        updateWorkExperienceField(
                          "companyName",
                          event.target.value
                        )
                      }
                    />
                  </div>

                  <div className="record-line">
                    <label>Start Date - End Date:</label>
                    <input
                      type="text"
                      value={workExperience.dateRange}
                      onChange={(event) =>
                        updateWorkExperienceField("dateRange", event.target.value)
                      }
                    />
                  </div>

                  <div className="record-line">
                    <label>Job description:</label>
                    <input
                      type="text"
                      value={workExperience.description}
                      onChange={(event) =>
                        updateWorkExperienceField(
                          "description",
                          event.target.value
                        )
                      }
                    />
                  </div>
                </div>

                <button type="button" className="profile-add-link" disabled>
                  Add another job +
                </button>
              </>
            ) : (
              <div className="profile-readonly-stack">
                <p>
                  <span>Job Title:</span> {workExperience.jobTitle || "-"}
                </p>
                <p>
                  <span>Company Name:</span>{" "}
                  {workExperience.companyName || "-"}
                </p>
                <p>
                  <span>Start Date - End Date:</span>{" "}
                  {workExperience.dateRange || "-"}
                </p>
                <p>
                  <span>Job description:</span>{" "}
                  {workExperience.description || "-"}
                </p>
              </div>
            )}
          </div>

          <div className="profile-section-block">
            <label>Education:</label>
            {rightEditMode ? (
              <>
                <div className="profile-record-box profile-edit-record-box">
                  <button
                    type="button"
                    className="profile-record-remove-button"
                    aria-label="Remove education"
                    disabled
                  >
                    x
                  </button>

                  <div className="record-line">
                    <label>Certification:</label>
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
                  </div>

                  <div className="record-line">
                    <label>School Name:</label>
                    <input
                      type="text"
                      name="major"
                      value={form.major}
                      onChange={handleChange}
                    />
                  </div>

                  <div className="record-line">
                    <label>Start Date - End Date:</label>
                    <input type="text" value="-" disabled />
                  </div>
                </div>

                <button type="button" className="profile-add-link" disabled>
                  Add another education certificate +
                </button>
              </>
            ) : (
              <div className="profile-readonly-stack">
                <p>
                  <span>Certification:</span>{" "}
                  {getChoiceLabel(EDUCATION_CHOICES, form.education)}
                </p>
                <p>
                  <span>School Name:</span> {form.major || "-"}
                </p>
                <p>
                  <span>Start Date - End Date:</span> -
                </p>
              </div>
            )}
          </div>

          <div className="profile-section-block compact-section">
            <label>Achievement:</label>
            {rightEditMode ? (
              <>
                <div className="profile-tag-column profile-edit-tags">
                  {bioSections.achievements.length === 0 && (
                    <span className="profile-empty-note">
                      No achievements added yet.
                    </span>
                  )}

                  {bioSections.achievements.map((achievement) => (
                    <button
                      type="button"
                      className="profile-tag"
                      key={achievement}
                      onClick={() => removeAchievement(achievement)}
                    >
                      {achievement} <span>x</span>
                    </button>
                  ))}
                </div>

                <div className="add-small-row profile-add-inline-row">
                  <input
                    type="text"
                    value={newAchievement}
                    onChange={(event) => setNewAchievement(event.target.value)}
                    onKeyDown={(event) => {
                      if (event.key === "Enter") {
                        event.preventDefault();
                        addAchievement();
                      }
                    }}
                    placeholder="Add achievement"
                  />

                  <button type="button" onClick={addAchievement}>
                    +
                  </button>
                </div>
              </>
            ) : (
              <ul className="profile-list-values">
                {bioSections.achievements.length === 0 ? (
                  <li>No achievements added yet.</li>
                ) : (
                  bioSections.achievements.map((achievement) => (
                    <li key={achievement}>{achievement}</li>
                  ))
                )}
              </ul>
            )}
          </div>

          <div className="profile-section-block compact-section">
            <label>Skills:</label>
            {rightEditMode ? (
              <>
                <div className="profile-tag-column profile-edit-tags">
                  {skills.length === 0 && (
                    <span className="profile-empty-note">
                      No skills added yet.
                    </span>
                  )}

                  {skills.map((skill) => (
                    <button
                      type="button"
                      className="profile-tag"
                      key={skill}
                      onClick={() => removeSkill(skill)}
                    >
                      {skill} <span>x</span>
                    </button>
                  ))}
                </div>

                <div className="add-small-row profile-add-inline-row">
                  <input
                    type="text"
                    value={newSkill}
                    onChange={(event) => setNewSkill(event.target.value)}
                    onKeyDown={(event) => {
                      if (event.key === "Enter") {
                        event.preventDefault();
                        addSkill();
                      }
                    }}
                    placeholder="Add skill"
                  />

                  <button type="button" onClick={addSkill}>
                    +
                  </button>
                </div>
              </>
            ) : (
              <ul className="profile-list-values">
                {skills.length === 0 ? (
                  <li>No skills added yet.</li>
                ) : (
                  skills.map((skill) => <li key={skill}>{skill}</li>)
                )}
              </ul>
            )}
          </div>

          <div className="profile-section-block profile-hidden-addon">
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
