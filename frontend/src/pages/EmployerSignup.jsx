import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { createJobPosting, registerEmployer } from "../services/api";
import "../styles/employerSignup.css";

const EDUCATION_VALUES = {
  "High School": "HIGH_SCHOOL",
  Diploma: "DIPLOMA",
  Bachelor: "BACHELOR",
  Master: "MASTER",
  PhD: "PHD",
};

const EMPLOYMENT_TYPE_VALUES = {
  "Full-time": "FULL_TIME",
  "Part-time": "PART_TIME",
  Contract: "CONTRACT",
  Internship: "INTERNSHIP",
};

const WORK_MODE_VALUES = {
  Remote: "REMOTE",
  "On-site": "ONSITE",
  Hybrid: "HYBRID",
};

function parseFirstNumber(value) {
  const match = String(value || "").match(/\d+/);
  return match ? Number(match[0]) : 0;
}

function parseSalaryRange(value) {
  const amounts = String(value || "")
    .match(/\d[\d,]*/g)
    ?.map((amount) => Number(amount.replace(/,/g, "")))
    .filter((amount) => Number.isFinite(amount));

  if (!amounts || amounts.length === 0) {
    return { salary_min: null, salary_max: null };
  }

  return {
    salary_min: Math.min(...amounts),
    salary_max: amounts.length > 1 ? Math.max(...amounts) : null,
  };
}

function mapFormToJobPosting(formData) {
  const { salary_min, salary_max } = parseSalaryRange(formData.salary);
  const responsibilityText = formData.responsibilities.length
    ? `\n\nResponsibilities:\n${formData.responsibilities
        .map((item) => `- ${item}`)
        .join("\n")}`
    : "";
  const benefitText = formData.benefits.length
    ? `\n\nBenefits:\n${formData.benefits.map((item) => `- ${item}`).join("\n")}`
    : "";

  return {
    title: formData.jobTitle,
    company_name: formData.companyName,
    company_info: formData.companyInfo,
    description: `${formData.jobDescription}${responsibilityText}${benefitText}`,
    required_education:
      EDUCATION_VALUES[formData.educationLevel] || "BACHELOR",
    required_skills: formData.requiredSkills.join(", "),
    required_experience_years: parseFirstNumber(formData.experienceYears),
    work_mode: WORK_MODE_VALUES[formData.workMode] || "ONSITE",
    location: formData.location || "Not specified",
    salary_min,
    salary_max,
    employment_type: EMPLOYMENT_TYPE_VALUES[formData.jobType] || "FULL_TIME",
  };
}

function EmployerSignup() {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    password: "",
    companyName: "",
    companyInfo: "",
    jobTitle: "",
    location: "",
    jobType: "",
    workMode: "",
    jobDescription: "",
    responsibilities: [
      "Develop and maintain web applications",
      "Fix bugs and improve performance",
    ],
    newResponsibility: "",
    educationLevel: "",
    experienceYears: "",
    requiredSkills: ["Python", "Figma", "Chinese"],
    newSkill: "",
    salary: "",
    benefits: ["Health insurance", "Flexible hours"],
    newBenefit: "",
  });

  const [message, setMessage] = useState("");
  const [showResponsibilityInput, setShowResponsibilityInput] = useState(false);
  const [showSkillInput, setShowSkillInput] = useState(false);
  const [showBenefitInput, setShowBenefitInput] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  function handleChange(event) {
    const { name, value } = event.target;
    setFormData({ ...formData, [name]: value });
  }

  function addResponsibility() {
    if (!formData.newResponsibility.trim()) {
      return;
    }

    setFormData({
      ...formData,
      responsibilities: [
        ...formData.responsibilities,
        formData.newResponsibility.trim(),
      ],
      newResponsibility: "",
    });
    setShowResponsibilityInput(false);
  }

  function removeResponsibility(responsibilityToRemove) {
    setFormData({
      ...formData,
      responsibilities: formData.responsibilities.filter(
        (responsibility) => responsibility !== responsibilityToRemove
      ),
    });
  }

  function addSkill() {
    if (!formData.newSkill.trim()) {
      return;
    }

    setFormData({
      ...formData,
      requiredSkills: [...formData.requiredSkills, formData.newSkill.trim()],
      newSkill: "",
    });
    setShowSkillInput(false);
  }

  function removeSkill(skillToRemove) {
    setFormData({
      ...formData,
      requiredSkills: formData.requiredSkills.filter(
        (skill) => skill !== skillToRemove
      ),
    });
  }

  function addBenefit() {
    if (!formData.newBenefit.trim()) {
      return;
    }

    setFormData({
      ...formData,
      benefits: [...formData.benefits, formData.newBenefit.trim()],
      newBenefit: "",
    });
    setShowBenefitInput(false);
  }

  function removeBenefit(benefitToRemove) {
    setFormData({
      ...formData,
      benefits: formData.benefits.filter(
        (benefit) => benefit !== benefitToRemove
      ),
    });
  }

  async function handleSubmit(event) {
    event.preventDefault();

    if (!formData.fullName.trim()) {
      setMessage("Please enter your full name.");
      return;
    }
    if (!formData.email.trim()) {
      setMessage("Please enter your email.");
      return;
    }
    if (!formData.password.trim()) {
      setMessage("Please enter your password.");
      return;
    }
    if (!formData.companyName.trim()) {
      setMessage("Please enter your company name.");
      return;
    }
    if (!formData.companyInfo.trim()) {
      setMessage("Please enter a short company description.");
      return;
    }
    if (!formData.jobTitle.trim()) {
      setMessage("Please enter the job title.");
      return;
    }
    if (!formData.jobDescription.trim()) {
      setMessage("Please enter the job description.");
      return;
    }

    try {
      setIsSubmitting(true);
      await registerEmployer(formData);
      await createJobPosting(mapFormToJobPosting(formData));
      setMessage("Employer account and job posting created successfully.");
      setTimeout(() => navigate("/employer-dashboard"), 800);
    } catch (error) {
      setMessage(error.message || "Something went wrong. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <main className="employer-signup-page">
      <form className="employer-signup-form" onSubmit={handleSubmit}>
        <section className="employer-signup-section">
          <h1>Account Info</h1>

          <div className="employer-signup-grid">
            <div className="employer-signup-field">
              <label>Full Name</label>
              <input
                type="text"
                name="fullName"
                value={formData.fullName}
                onChange={handleChange}
              />
            </div>

            <div className="employer-signup-field">
              <label>Email</label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
              />
            </div>

            <div className="employer-signup-field">
              <label>Password</label>
              <input
                type="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
              />
            </div>
          </div>
        </section>

        <section className="employer-signup-section">
          <h1>Create Job Posting</h1>

          <div className="employer-signup-grid">
            <div className="employer-signup-field">
              <label>Company Name</label>
              <input
                type="text"
                name="companyName"
                value={formData.companyName}
                onChange={handleChange}
              />
            </div>

            <div className="employer-signup-field">
              <label>Job Title</label>
              <input
                type="text"
                name="jobTitle"
                value={formData.jobTitle}
                onChange={handleChange}
              />
            </div>

            <div className="employer-signup-field">
              <label>Location</label>
              <input
                type="text"
                name="location"
                value={formData.location}
                onChange={handleChange}
              />
            </div>

            <div className="employer-signup-small-grid">
              <div className="employer-signup-field">
                <label>Job Type</label>
                <select
                  name="jobType"
                  value={formData.jobType}
                  onChange={handleChange}
                >
                  <option value="">Select</option>
                  <option value="Full-time">Full-time</option>
                  <option value="Part-time">Part-time</option>
                  <option value="Contract">Contract</option>
                  <option value="Internship">Internship</option>
                </select>
              </div>

              <div className="employer-signup-field">
                <label>Work Mode</label>
                <select
                  name="workMode"
                  value={formData.workMode}
                  onChange={handleChange}
                >
                  <option value="">Select</option>
                  <option value="Remote">Remote</option>
                  <option value="On-site">On-site</option>
                  <option value="Hybrid">Hybrid</option>
                </select>
              </div>
            </div>
          </div>

          <div className="employer-signup-divider">
            <span></span>
            <p>Company Info</p>
            <span></span>
          </div>

          <div className="employer-signup-field">
            <label>About Your Company</label>
            <textarea
              name="companyInfo"
              value={formData.companyInfo}
              onChange={handleChange}
              placeholder="Describe your company, culture, and what you are looking for."
            />
          </div>

          <div className="employer-signup-divider">
            <span></span>
            <p>Job Details</p>
            <span></span>
          </div>

          <div className="employer-signup-field">
            <label>Job Description</label>
            <textarea
              name="jobDescription"
              value={formData.jobDescription}
              onChange={handleChange}
              placeholder="Provide a brief overview of the role and its purpose."
            />
          </div>

          <div className="employer-signup-row-heading">
            <label>Responsibilities</label>
            <button
              type="button"
              className="employer-signup-mini-button"
              onClick={() =>
                setShowResponsibilityInput(!showResponsibilityInput)
              }
            >
              {showResponsibilityInput ? "Cancel" : "Add Responsibility"}
            </button>
          </div>

          <div className="employer-signup-tag-area">
            {formData.responsibilities.map((responsibility) => (
              <button
                type="button"
                key={responsibility}
                className="employer-signup-pill"
                onClick={() => removeResponsibility(responsibility)}
              >
                {responsibility} x
              </button>
            ))}
          </div>

          {showResponsibilityInput && (
            <div className="employer-signup-add-row">
              <input
                type="text"
                name="newResponsibility"
                value={formData.newResponsibility}
                onChange={handleChange}
                placeholder="Enter responsibility"
              />
              <button
                type="button"
                className="employer-signup-mini-button"
                onClick={addResponsibility}
              >
                Save
              </button>
            </div>
          )}

          <div className="employer-signup-divider">
            <span></span>
            <p>Requirements</p>
            <span></span>
          </div>

          <div className="employer-signup-grid">
            <div className="employer-signup-field">
              <label>Required Education Level</label>
              <select
                name="educationLevel"
                value={formData.educationLevel}
                onChange={handleChange}
              >
                <option value="">Select</option>
                <option value="High School">High School</option>
                <option value="Diploma">Diploma</option>
                <option value="Bachelor">Bachelor</option>
                <option value="Master">Master</option>
                <option value="PhD">PhD</option>
              </select>
            </div>

            <div className="employer-signup-field">
              <label>Years of relevant experience</label>
              <select
                name="experienceYears"
                value={formData.experienceYears}
                onChange={handleChange}
              >
                <option value="">Select</option>
                <option value="0 years">0 years</option>
                <option value="1-3 years">1-3 years</option>
                <option value="3-5 years">3-5 years</option>
                <option value="5-10 years">5-10 years</option>
                <option value="10+ years">10+ years</option>
              </select>
            </div>
          </div>

          <div className="employer-signup-row-heading">
            <label>Required Skills</label>
            <button
              type="button"
              className="employer-signup-mini-button"
              onClick={() => setShowSkillInput(!showSkillInput)}
            >
              {showSkillInput ? "Cancel" : "Add Skill"}
            </button>
          </div>

          <div className="employer-signup-tag-box">
            {formData.requiredSkills.map((skill) => (
              <button
                type="button"
                key={skill}
                className="employer-signup-tag"
                onClick={() => removeSkill(skill)}
              >
                {skill} x
              </button>
            ))}
          </div>

          {showSkillInput && (
            <div className="employer-signup-add-row">
              <input
                type="text"
                name="newSkill"
                value={formData.newSkill}
                onChange={handleChange}
                placeholder="Enter skill"
              />
              <button
                type="button"
                className="employer-signup-mini-button"
                onClick={addSkill}
              >
                Save
              </button>
            </div>
          )}

          <div className="employer-signup-divider">
            <span></span>
            <p>Compensation & Benefits</p>
            <span></span>
          </div>

          <div className="employer-signup-field employer-signup-salary">
            <label>Salary / Pay</label>
            <input
              type="text"
              name="salary"
              value={formData.salary}
              onChange={handleChange}
              placeholder="e.g., $60,000 - $80,000 per year"
            />
          </div>

          <div className="employer-signup-row-heading">
            <label>Benefits</label>
            <button
              type="button"
              className="employer-signup-mini-button"
              onClick={() => setShowBenefitInput(!showBenefitInput)}
            >
              {showBenefitInput ? "Cancel" : "Add Benefit"}
            </button>
          </div>

          <div className="employer-signup-tag-box employer-signup-benefits">
            {formData.benefits.map((benefit) => (
              <button
                type="button"
                key={benefit}
                className="employer-signup-tag"
                onClick={() => removeBenefit(benefit)}
              >
                {benefit} x
              </button>
            ))}
          </div>

          {showBenefitInput && (
            <div className="employer-signup-add-row">
              <input
                type="text"
                name="newBenefit"
                value={formData.newBenefit}
                onChange={handleChange}
                placeholder="Enter benefit"
              />
              <button
                type="button"
                className="employer-signup-mini-button"
                onClick={addBenefit}
              >
                Save
              </button>
            </div>
          )}

          {message && <p className="employer-signup-message">{message}</p>}

          <button
            type="submit"
            className="employer-signup-submit-button"
            disabled={isSubmitting}
          >
            {isSubmitting ? "Creating..." : "Submit"}
          </button>
        </section>
      </form>
    </main>
  );
}

export default EmployerSignup;
