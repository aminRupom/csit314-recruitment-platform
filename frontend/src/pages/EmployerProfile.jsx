import { useCallback, useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  createJobPosting,
  getCurrentUser,
  getMyJobPostings,
  startEmployerFreeTrial,
  updateJobPosting,
} from "../services/api";
import { clearTokens } from "../services/auth";
import "../styles/employerProfile.css";

const EMPLOYMENT_TYPES = [
  { value: "FULL_TIME", label: "Full-time" },
  { value: "PART_TIME", label: "Part-time" },
  { value: "CONTRACT", label: "Contract" },
  { value: "INTERNSHIP", label: "Internship" },
];

const WORK_MODES = [
  { value: "REMOTE", label: "Remote" },
  { value: "ONSITE", label: "On-site" },
  { value: "HYBRID", label: "Hybrid" },
];

const EDUCATION_LEVELS = [
  { value: "HIGH_SCHOOL", label: "High School" },
  { value: "DIPLOMA", label: "Diploma" },
  { value: "BACHELOR", label: "Bachelor" },
  { value: "MASTER", label: "Master" },
  { value: "PHD", label: "PhD" },
];

const BLANK_JOB_FORM = {
  title: "",
  company_name: "",
  company_info: "",
  description: "",
  required_education: "BACHELOR",
  required_skills: "",
  required_experience_years: 0,
  work_mode: "HYBRID",
  location: "",
  salary_min: "",
  salary_max: "",
  employment_type: "FULL_TIME",
};

function splitDescriptionSections(value) {
  const text = value || "";
  const responsibilitiesMatch = text.match(/\n\nResponsibilities:\n/i);
  const benefitsMatch = text.match(/\n\nBenefits:\n/i);
  const firstSectionIndex = [responsibilitiesMatch?.index, benefitsMatch?.index]
    .filter((index) => Number.isFinite(index))
    .sort((a, b) => a - b)[0];
  const mainDescription =
    firstSectionIndex === undefined
      ? text.trim()
      : text.slice(0, firstSectionIndex).trim();

  function extractList(match, nextMatch) {
    if (!match) {
      return [];
    }

    const start = match.index + match[0].length;
    const end = nextMatch?.index && nextMatch.index > start ? nextMatch.index : text.length;

    return text
      .slice(start, end)
      .split(/\r?\n/)
      .map((item) => item.replace(/^[-*]\s*/, "").trim())
      .filter(Boolean);
  }

  return {
    mainDescription,
    responsibilities: extractList(responsibilitiesMatch, benefitsMatch),
    benefits: extractList(benefitsMatch, null),
  };
}

function buildDescription(mainDescription, responsibilities, benefits) {
  const responsibilityText = responsibilities.length
    ? `\n\nResponsibilities:\n${responsibilities
        .map((item) => `- ${item}`)
        .join("\n")}`
    : "";
  const benefitText = benefits.length
    ? `\n\nBenefits:\n${benefits.map((item) => `- ${item}`).join("\n")}`
    : "";

  return `${mainDescription.trim()}${responsibilityText}${benefitText}`.trim();
}

function getChoiceLabel(choices, value) {
  return choices.find((choice) => choice.value === value)?.label || value || "-";
}

function splitCommaList(value) {
  return (value || "")
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);
}

function getSalaryText(form) {
  if (form.salary_min && form.salary_max) {
    return `$${Number(form.salary_min).toLocaleString()} - $${Number(
      form.salary_max
    ).toLocaleString()} per year`;
  }

  if (form.salary_min) {
    return `$${Number(form.salary_min).toLocaleString()}+ per year`;
  }

  return "Not specified";
}

function normalizeJobToForm(job) {
  if (!job) {
    return BLANK_JOB_FORM;
  }

  return {
    title: job.title || "",
    company_name: job.company_name || "",
    company_info: job.company_info || "",
    description: job.description || "",
    required_education: job.required_education || "BACHELOR",
    required_skills: job.required_skills || "",
    required_experience_years: job.required_experience_years || 0,
    work_mode: job.work_mode || "HYBRID",
    location: job.location || "",
    salary_min: job.salary_min ?? "",
    salary_max: job.salary_max ?? "",
    employment_type: job.employment_type || "FULL_TIME",
  };
}

export default function EmployerProfile() {
  const navigate = useNavigate();

  const [user, setUser] = useState(null);
  const [activeJob, setActiveJob] = useState(null);
  const [form, setForm] = useState(BLANK_JOB_FORM);
  const [loading, setLoading] = useState(true);
  const [isEditingCompany, setIsEditingCompany] = useState(false);
  const [isEditingJob, setIsEditingJob] = useState(false);
  const [companyValidationMessage, setCompanyValidationMessage] = useState("");
  const [jobValidationMessage, setJobValidationMessage] = useState("");
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [saving, setSaving] = useState(false);
  const [upgrading, setUpgrading] = useState(false);
  const [newResponsibility, setNewResponsibility] = useState("");
  const [newSkill, setNewSkill] = useState("");
  const [newBenefit, setNewBenefit] = useState("");

  const descriptionSections = splitDescriptionSections(form.description);
  const requiredSkills = splitCommaList(form.required_skills);

  const loadProfile = useCallback(async () => {
    setLoading(true);
    setError("");

    try {
      const [userData, jobsData] = await Promise.all([
        getCurrentUser(),
        getMyJobPostings(),
      ]);
      const job = Array.isArray(jobsData) ? jobsData[0] : null;

      setUser(userData);
      setActiveJob(job || null);
      setForm(normalizeJobToForm(job));
    } catch (err) {
      setError(err.message || "Could not load employer profile.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const fetchTimer = window.setTimeout(() => {
      loadProfile();
    }, 0);

    return () => {
      window.clearTimeout(fetchTimer);
    };
  }, [loadProfile]);

  function handleChange(event) {
    const { name, value } = event.target;

    setForm((currentForm) => ({
      ...currentForm,
      [name]:
        name === "required_experience_years" ? Number(value) || 0 : value,
    }));

    setCompanyValidationMessage("");
    setJobValidationMessage("");
  }

  function validateCompanyFields() {
    if (!form.company_name.trim()) {
      setCompanyValidationMessage("Company name cannot be empty.");
      return false;
    }

    if (!form.company_info.trim()) {
      setCompanyValidationMessage("Company information cannot be empty.");
      return false;
    }

    return true;
  }

  function validateJobFields() {
    if (!form.title.trim()) {
      setJobValidationMessage("Job title cannot be empty.");
      return false;
    }

    if (!form.location.trim()) {
      setJobValidationMessage("Location cannot be empty.");
      return false;
    }

    if (!form.description.trim()) {
      setJobValidationMessage("Job description cannot be empty.");
      return false;
    }

    if (!form.required_skills.trim()) {
      setJobValidationMessage("Required skills cannot be empty.");
      return false;
    }

    if (!validateCompanyFields()) {
      setJobValidationMessage("Company details must be completed first.");
      return false;
    }

    return true;
  }

  function updateDescriptionSections(nextSections) {
    const currentSections = splitDescriptionSections(form.description);
    const mergedSections = {
      ...currentSections,
      ...nextSections,
    };

    setForm((currentForm) => ({
      ...currentForm,
      description: buildDescription(
        mergedSections.mainDescription,
        mergedSections.responsibilities,
        mergedSections.benefits
      ),
    }));
    setJobValidationMessage("");
  }

  function addResponsibility() {
    if (!newResponsibility.trim()) {
      return;
    }

    updateDescriptionSections({
      responsibilities: [
        ...descriptionSections.responsibilities,
        newResponsibility.trim(),
      ],
    });
    setNewResponsibility("");
  }

  function removeResponsibility(itemToRemove) {
    updateDescriptionSections({
      responsibilities: descriptionSections.responsibilities.filter(
        (item) => item !== itemToRemove
      ),
    });
  }

  function addSkill() {
    if (!newSkill.trim()) {
      return;
    }

    setForm((currentForm) => ({
      ...currentForm,
      required_skills: [...requiredSkills, newSkill.trim()].join(", "),
    }));
    setNewSkill("");
    setJobValidationMessage("");
  }

  function removeSkill(skillToRemove) {
    setForm((currentForm) => ({
      ...currentForm,
      required_skills: requiredSkills
        .filter((skill) => skill !== skillToRemove)
        .join(", "),
    }));
    setJobValidationMessage("");
  }

  function addBenefit() {
    if (!newBenefit.trim()) {
      return;
    }

    updateDescriptionSections({
      benefits: [...descriptionSections.benefits, newBenefit.trim()],
    });
    setNewBenefit("");
  }

  function removeBenefit(itemToRemove) {
    updateDescriptionSections({
      benefits: descriptionSections.benefits.filter(
        (item) => item !== itemToRemove
      ),
    });
  }

  async function saveProfileChanges(section) {
    if (section === "company" && !validateCompanyFields()) {
      return;
    }

    if (section === "job" && !validateJobFields()) {
      return;
    }

    if (section === "company" && !activeJob && !validateJobFields()) {
      return;
    }

    setSaving(true);
    setError("");
    setMessage("");

    const payload = {
      ...form,
      required_experience_years: Number(form.required_experience_years) || 0,
      salary_min: form.salary_min === "" ? null : Number(form.salary_min),
      salary_max: form.salary_max === "" ? null : Number(form.salary_max),
    };

    try {
      const savedJob = activeJob
        ? await updateJobPosting(activeJob.id, payload)
        : await createJobPosting(payload);

      setActiveJob(savedJob);
      setForm(normalizeJobToForm(savedJob));
      setIsEditingCompany(false);
      setIsEditingJob(false);
      setMessage("Employer profile saved.");
    } catch (err) {
      setError(err.message || "Save failed.");
    } finally {
      setSaving(false);
    }
  }

  async function handleUpgrade() {
    setUpgrading(true);
    setError("");
    setMessage("");

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
    <main className="employer-profile-page">
      <section className="employer-profile-hero">
        <div className="profile-header-actions">
          <button
            type="button"
            className="profile-header-button logout-button"
            onClick={handleLogout}
          >
            Logout
          </button>

          <Link className="profile-header-button back-button" to="/employer-dashboard">
            Back
          </Link>
        </div>

        <h1>Company Profile</h1>

        <div className="company-heading">
          <h2>{form.company_name || user?.username || "Employer"}</h2>
          <p>{form.location || "No active job location set"}</p>
          {user?.membership && (
            <span className="employer-membership-badge">
              pro user-trial activated
            </span>
          )}
        </div>
      </section>

      {error && <p className="employer-profile-error">{error}</p>}
      {message && <p className="employer-profile-success">{message}</p>}

      {loading ? (
        <p className="employer-profile-loading">Loading profile...</p>
      ) : (
        <>
          <section className="company-info-section">
            {!isEditingCompany && (
              <button
                type="button"
                className="profile-edit-button"
                onClick={() => setIsEditingCompany(true)}
              >
                Edit
              </button>
            )}

            <div className="company-info-grid">
              <div className="info-column">
                <div className="profile-field-row">
                  <label>Company name:</label>
                  {isEditingCompany ? (
                    <input
                      name="company_name"
                      required
                      value={form.company_name}
                      onChange={handleChange}
                    />
                  ) : (
                    <span>{form.company_name || "-"}</span>
                  )}
                </div>

                <div className="profile-field-row">
                  <label>Email:</label>
                  {isEditingCompany ? (
                    <input value={user?.email || "-"} disabled />
                  ) : (
                    <span>{user?.email || "-"}</span>
                  )}
                </div>

                <div className="profile-field-row address-row">
                  <label>Address:</label>
                  {isEditingCompany ? (
                    <input
                      name="company_info"
                      required
                      value={form.company_info}
                      onChange={handleChange}
                    />
                  ) : (
                    <span className="profile-text-value">
                      {form.company_info || "-"}
                    </span>
                  )}
                </div>
              </div>

              <div className="info-column">
                <div className="profile-field-row">
                  <label>Phone Number:</label>
                  {isEditingCompany ? (
                    <input value="+04xxxxxxxxxx" disabled />
                  ) : (
                    <span>+04xxxxxxxxxx</span>
                  )}
                </div>

                <div className="profile-field-row">
                  <label>Website:</label>
                  {isEditingCompany ? (
                    <input value="www.company.com" disabled />
                  ) : (
                    <span>www.company.com</span>
                  )}
                </div>

                <div className="profile-field-row password-profile-row">
                  <label>Password:</label>
                  {isEditingCompany ? (
                    <span className="password-input-shell">
                      <input type="password" value="*************" disabled />
                      <span className="password-eye" aria-hidden="true"></span>
                    </span>
                  ) : (
                    <span className="password-readonly-value">
                      ************* <span className="password-eye" aria-hidden="true"></span>
                    </span>
                  )}
                </div>
              </div>
            </div>

            {companyValidationMessage && (
              <p className="profile-validation-message">
                {companyValidationMessage}
              </p>
            )}

            {!user?.membership && (
              <div className="employer-membership-box">
                <h3>Premium Membership</h3>
                <p>
                  Upgrade to see unlimited candidate recommendations for your
                  single active job posting.
                </p>
                <button
                  type="button"
                  className="save-profile-button"
                  onClick={handleUpgrade}
                  disabled={upgrading}
                >
                  {upgrading ? "Activating..." : "Start Free Trial"}
                </button>
              </div>
            )}

            {isEditingCompany && (
              <button
                type="button"
                className="save-profile-button company-save-button"
                onClick={() => saveProfileChanges("company")}
                disabled={saving}
              >
                {saving ? "Saving..." : "Save"}
              </button>
            )}
          </section>

          <section className="job-info-section">
            {!isEditingJob && (
              <button
                type="button"
                className="profile-edit-button job-edit-button"
                onClick={() => setIsEditingJob(true)}
              >
                {activeJob ? "Edit" : "Create Job Posting"}
              </button>
            )}

            <div className="job-form-content">
              <div className="job-profile-row">
                <strong>Job Title:</strong>
                {isEditingJob ? (
                  <input
                    name="title"
                    required
                    value={form.title}
                    onChange={handleChange}
                  />
                ) : (
                  <span>{form.title || "-"}</span>
                )}
              </div>

              <div className="job-profile-row">
                <strong>Location:</strong>
                {isEditingJob ? (
                  <input
                    name="location"
                    required
                    value={form.location}
                    onChange={handleChange}
                  />
                ) : (
                  <span>{form.location || "-"}</span>
                )}
              </div>

              <div className="job-profile-row">
                <strong>Job Type:</strong>
                {isEditingJob ? (
                  <select
                    name="employment_type"
                    value={form.employment_type}
                    onChange={handleChange}
                  >
                    {EMPLOYMENT_TYPES.map((type) => (
                      <option key={type.value} value={type.value}>
                        {type.label}
                      </option>
                    ))}
                  </select>
                ) : (
                  <span>{getChoiceLabel(EMPLOYMENT_TYPES, form.employment_type)}</span>
                )}
              </div>

              <div className="job-profile-row">
                <strong>Work Mode:</strong>
                {isEditingJob ? (
                  <select
                    name="work_mode"
                    value={form.work_mode}
                    onChange={handleChange}
                  >
                    {WORK_MODES.map((mode) => (
                      <option key={mode.value} value={mode.value}>
                        {mode.label}
                      </option>
                    ))}
                  </select>
                ) : (
                  <span>{getChoiceLabel(WORK_MODES, form.work_mode)}</span>
                )}
              </div>

              <div className="job-description-block">
                <strong>Job Description:</strong>

                {isEditingJob ? (
                  <textarea
                    value={descriptionSections.mainDescription}
                    onChange={(event) =>
                      updateDescriptionSections({
                        mainDescription: event.target.value,
                      })
                    }
                  />
                ) : (
                  <div className="description-text">
                    {descriptionSections.mainDescription || "-"}
                  </div>
                )}
              </div>

              <div className="array-section responsibilities-section">
                <strong>Responsibilities</strong>

                {isEditingJob ? (
                  <>
                    <div className="editable-pill-column">
                      {descriptionSections.responsibilities.map((item) => (
                        <button
                          type="button"
                          key={item}
                          className="editable-pill"
                          onClick={() => removeResponsibility(item)}
                        >
                          {item} <span>x</span>
                        </button>
                      ))}
                    </div>

                    <div className="add-inline-row">
                      <input
                        type="text"
                        value={newResponsibility}
                        onChange={(event) =>
                          setNewResponsibility(event.target.value)
                        }
                        onKeyDown={(event) => {
                          if (event.key === "Enter") {
                            event.preventDefault();
                            addResponsibility();
                          }
                        }}
                        placeholder="Add responsibility"
                      />
                      <button type="button" onClick={addResponsibility}>
                        +
                      </button>
                    </div>
                    <button
                      type="button"
                      className="profile-add-link"
                      onClick={addResponsibility}
                    >
                      Add another responsibility +
                    </button>
                  </>
                ) : (
                  <ul>
                    {(descriptionSections.responsibilities.length > 0
                      ? descriptionSections.responsibilities
                      : ["No responsibilities listed"]
                    ).map((item) => (
                      <li key={item}>{item}</li>
                    ))}
                  </ul>
                )}
              </div>

              <div className="job-profile-row">
                <strong>Required Education Level:</strong>
                {isEditingJob ? (
                  <select
                    name="required_education"
                    value={form.required_education}
                    onChange={handleChange}
                  >
                    {EDUCATION_LEVELS.map((level) => (
                      <option key={level.value} value={level.value}>
                        {level.label}
                      </option>
                    ))}
                  </select>
                ) : (
                  <span>
                    {getChoiceLabel(EDUCATION_LEVELS, form.required_education)}
                  </span>
                )}
              </div>

              <div className="job-profile-row">
                <strong>Required Years of Relevant Experience:</strong>
                {isEditingJob ? (
                  <select
                    name="required_experience_years"
                    value={form.required_experience_years}
                    onChange={handleChange}
                  >
                    <option value="0">0 Years</option>
                    <option value="1">1 Year</option>
                    <option value="3">3 Years</option>
                    <option value="5">5 Years</option>
                    <option value="10">10 Years</option>
                  </select>
                ) : (
                  <span>
                    {form.required_experience_years || 0} year
                    {form.required_experience_years === 1 ? "" : "s"}
                  </span>
                )}
              </div>

              <div className="array-section">
                <strong>Required Skills:</strong>

                {isEditingJob ? (
                  <>
                    <div className="editable-pill-column">
                      {requiredSkills.map((skill) => (
                        <button
                          type="button"
                          key={skill}
                          className="editable-pill"
                          onClick={() => removeSkill(skill)}
                        >
                          {skill} <span>x</span>
                        </button>
                      ))}
                    </div>

                    <div className="add-inline-row">
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
                    <button
                      type="button"
                      className="profile-add-link"
                      onClick={addSkill}
                    >
                      Add another skill requirement +
                    </button>
                  </>
                ) : (
                  <ul>
                    {(requiredSkills.length > 0
                      ? requiredSkills
                      : ["No skills listed"]
                    ).map((skill) => (
                      <li key={skill}>{skill}</li>
                    ))}
                  </ul>
                )}
              </div>

              <div className="job-profile-row">
                <strong>Salary:</strong>
                {isEditingJob ? (
                  <input
                    type="number"
                    name="salary_min"
                    value={form.salary_min}
                    onChange={handleChange}
                    placeholder="50000"
                  />
                ) : (
                  <span>{getSalaryText(form)}</span>
                )}
              </div>

              <div className="array-section benefits-section">
                <strong>Benefits:</strong>

                {isEditingJob ? (
                  <>
                    <div className="editable-pill-column">
                      {descriptionSections.benefits.map((item) => (
                        <button
                          type="button"
                          key={item}
                          className="editable-pill"
                          onClick={() => removeBenefit(item)}
                        >
                          {item} <span>x</span>
                        </button>
                      ))}
                    </div>

                    <div className="add-inline-row">
                      <input
                        type="text"
                        value={newBenefit}
                        onChange={(event) => setNewBenefit(event.target.value)}
                        onKeyDown={(event) => {
                          if (event.key === "Enter") {
                            event.preventDefault();
                            addBenefit();
                          }
                        }}
                        placeholder="Add benefit"
                      />
                      <button type="button" onClick={addBenefit}>
                        +
                      </button>
                    </div>
                    <button
                      type="button"
                      className="profile-add-link"
                      onClick={addBenefit}
                    >
                      Add another benefit +
                    </button>
                  </>
                ) : (
                  <ul>
                    {(descriptionSections.benefits.length > 0
                      ? descriptionSections.benefits
                      : ["No benefits listed"]
                    ).map((item) => (
                      <li key={item}>{item}</li>
                    ))}
                  </ul>
                )}
              </div>
            </div>

            {jobValidationMessage && (
              <p className="profile-validation-message">{jobValidationMessage}</p>
            )}

            {isEditingJob && (
              <button
                type="button"
                className="save-profile-button"
                onClick={() => saveProfileChanges("job")}
                disabled={saving}
              >
                {saving ? "Saving..." : "Save"}
              </button>
            )}
          </section>
        </>
      )}
    </main>
  );
}
