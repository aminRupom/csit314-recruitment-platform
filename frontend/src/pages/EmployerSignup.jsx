import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { registerEmployer } from "../services/api";
import "../styles/employerSignup.css";

function EmployerSignup() {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    email: "",
    password: "",
    companyName: "",
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

  function handleChange(event) {
    const { name, value } = event.target;

    setFormData({
      ...formData,
      [name]: value,
    });
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

    if (!formData.email.trim()) {
      setMessage("Please enter your email.");
      return;
    }

    if (!formData.password.trim()) {
      setMessage("Please enter your password.");
      return;
    }

    if (!formData.companyName.trim()) {
      setMessage("Please enter the company name.");
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

    const result = await registerEmployer(formData);

    if (result.success) {
      setMessage("Employer account and job posting created successfully.");

      setTimeout(() => {
        navigate("/employer-dashboard");
      }, 800);
    } else {
      setMessage(result.message);
    }
  }

  return (
    <main className="employer-page">
      <form className="employer-form" onSubmit={handleSubmit}>
        <section className="employer-section">
          <h1>Account Info</h1>

          <div className="employer-grid-two">
            <div className="employer-field">
              <label>Email</label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
              />
            </div>

            <div></div>

            <div className="employer-field">
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

        <section className="employer-section">
          <h1>Create Job Posting</h1>

          <div className="employer-grid-two">
            <div className="employer-field">
              <label>Company Name</label>
              <input
                type="text"
                name="companyName"
                value={formData.companyName}
                onChange={handleChange}
              />
            </div>

            <div className="employer-field">
              <label>Job Title</label>
              <input
                type="text"
                name="jobTitle"
                value={formData.jobTitle}
                onChange={handleChange}
              />
            </div>

            <div className="employer-field">
              <label>Location</label>
              <input
                type="text"
                name="location"
                value={formData.location}
                onChange={handleChange}
              />
            </div>

            <div className="employer-grid-small">
              <div className="employer-field">
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
                  <option value="Casual">Casual</option>
                </select>
              </div>

              <div className="employer-field">
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

          <div className="employer-divider-title">
            <span></span>
            <p>Job Details</p>
            <span></span>
          </div>

          <div className="employer-field">
            <label>Job Description</label>
            <textarea
              name="jobDescription"
              value={formData.jobDescription}
              onChange={handleChange}
              placeholder="Provide a brief overview of the role and its purpose."
            ></textarea>
          </div>

          <div className="employer-row-heading">
            <label>Responsibilities</label>

            <button
              type="button"
              className="employer-mini-button"
              onClick={() =>
                setShowResponsibilityInput(!showResponsibilityInput)
              }
            >
              {showResponsibilityInput ? "Cancel" : "Add Responsibility"}
            </button>
          </div>

          <div className="employer-tag-area">
            {formData.responsibilities.map((responsibility) => (
              <button
                type="button"
                key={responsibility}
                className="employer-pill"
                onClick={() => removeResponsibility(responsibility)}
              >
                {responsibility} ×
              </button>
            ))}
          </div>

          {showResponsibilityInput && (
            <div className="employer-add-row">
              <input
                type="text"
                name="newResponsibility"
                value={formData.newResponsibility}
                onChange={handleChange}
                placeholder="Enter responsibility"
              />

              <button
                type="button"
                className="employer-mini-button"
                onClick={addResponsibility}
              >
                Save
              </button>
            </div>
          )}

          <div className="employer-divider-title">
            <span></span>
            <p>Requirements</p>
            <span></span>
          </div>

          <div className="employer-grid-two">
            <div className="employer-field">
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

            <div className="employer-field">
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

          <div className="employer-row-heading">
            <label>Required Skills</label>

            <button
              type="button"
              className="employer-mini-button"
              onClick={() => setShowSkillInput(!showSkillInput)}
            >
              {showSkillInput ? "Cancel" : "Add Skill"}
            </button>
          </div>

          <div className="employer-tag-box">
            {formData.requiredSkills.map((skill) => (
              <button
                type="button"
                key={skill}
                className="employer-tag"
                onClick={() => removeSkill(skill)}
              >
                {skill} ×
              </button>
            ))}
          </div>

          {showSkillInput && (
            <div className="employer-add-row">
              <input
                type="text"
                name="newSkill"
                value={formData.newSkill}
                onChange={handleChange}
                placeholder="Enter skill"
              />

              <button
                type="button"
                className="employer-mini-button"
                onClick={addSkill}
              >
                Save
              </button>
            </div>
          )}

          <div className="employer-divider-title">
            <span></span>
            <p>Compensation & Benefits</p>
            <span></span>
          </div>

          <div className="employer-field salary-field">
            <label>Salary / Pay</label>
            <input
              type="text"
              name="salary"
              value={formData.salary}
              onChange={handleChange}
              placeholder="e.g., $60,000 – $80,000 per year"
            />
          </div>

          <div className="employer-row-heading">
            <label>Benefits</label>

            <button
              type="button"
              className="employer-mini-button"
              onClick={() => setShowBenefitInput(!showBenefitInput)}
            >
              {showBenefitInput ? "Cancel" : "Add Benefit"}
            </button>
          </div>

          <div className="employer-tag-box benefits-box">
            {formData.benefits.map((benefit) => (
              <button
                type="button"
                key={benefit}
                className="employer-tag"
                onClick={() => removeBenefit(benefit)}
              >
                {benefit} ×
              </button>
            ))}
          </div>

          {showBenefitInput && (
            <div className="employer-add-row">
              <input
                type="text"
                name="newBenefit"
                value={formData.newBenefit}
                onChange={handleChange}
                placeholder="Enter benefit"
              />

              <button
                type="button"
                className="employer-mini-button"
                onClick={addBenefit}
              >
                Save
              </button>
            </div>
          )}

          {message && <p className="employer-message">{message}</p>}

          <button type="submit" className="employer-submit-button">
            Submit
          </button>
        </section>
      </form>
    </main>
  );
}

export default EmployerSignup;