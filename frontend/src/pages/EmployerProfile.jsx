import { useState } from "react";
import { Link } from "react-router-dom";
import { getEmployerMembership } from "../services/api";
import "../styles/employerProfile.css";

const PASSWORD_MASK = "************";

function PasswordVisibilityIcon({ isVisible }) {
  if (isVisible) {
    return (
      <svg
        aria-hidden="true"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M17.94 17.94A10.94 10.94 0 0 1 12 20C7 20 2.73 16.89 1 12a18.45 18.45 0 0 1 5.06-6.94" />
        <path d="M9.9 4.24A10.82 10.82 0 0 1 12 4c5 0 9.27 3.11 11 8a18.5 18.5 0 0 1-2.16 3.19" />
        <path d="M14.12 14.12a3 3 0 0 1-4.24-4.24" />
        <path d="M1 1l22 22" />
      </svg>
    );
  }

  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8Z" />
      <circle cx="12" cy="12" r="3" />
    </svg>
  );
}

const initialCompanyProfile = {
  companyName: "Amazon",
  email: "hiring@company.com",
  phone: "+0412345678",
  website: "www.company.com",
  address: "hello world 123, Sydney, NSW",
  password: "thisaisapassword",
  jobTitle: "Software Engineer",
  location: "Town Hall, Sydney, NSW",
  jobType: "Full-time",
  workMode: "Hybrid",
  jobDescription: "this is a job description",
  responsibilities: [
    "Design and develop software solution",
    "Collaborate with cross-department teams",
  ],
  educationLevel: "Bachelor",
  experienceYears: "1-3 years",
  requiredSkills: ["Java", "TypeScript"],
  salary: "$60,000 - $80,000 per year",
  benefits: ["Health Insurance"],
};

const requiredCompanyFields = [
  ["companyName", "Company name"],
  ["email", "Email"],
  ["address", "Address"],
  ["phone", "Phone number"],
  ["website", "Website"],
  ["password", "Password"],
];

const requiredJobFields = [
  ["jobTitle", "Job title"],
  ["location", "Location"],
  ["salary", "Salary"],
];

const requiredJobListFields = [
  ["responsibilities", "Responsibility"],
  ["requiredSkills", "Required skill"],
  ["benefits", "Benefit"],
];

export default function EmployerProfile() {
  const [profile, setProfile] = useState(() => ({
    ...initialCompanyProfile,
    ...getEmployerMembership(),
  }));
  const [isEditingCompany, setIsEditingCompany] = useState(false);
  const [isEditingJob, setIsEditingJob] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [companyValidationMessage, setCompanyValidationMessage] = useState("");
  const [jobValidationMessage, setJobValidationMessage] = useState("");
  const passwordToggleLabel = showPassword ? "Hide password" : "Show password";
  const displayedPassword = showPassword ? profile.password : PASSWORD_MASK;

  function handleChange(event) {
    const { name, value } = event.target;

    setProfile((previousProfile) => ({
      ...previousProfile,
      [name]: value,
    }));

    if (requiredCompanyFields.some(([fieldName]) => fieldName === name)) {
      setCompanyValidationMessage("");
    }

    if (requiredJobFields.some(([fieldName]) => fieldName === name)) {
      setJobValidationMessage("");
    }
  }

  function handleArrayChange(fieldName, index, value) {
    setProfile((previousProfile) => {
      const updatedList = [...previousProfile[fieldName]];
      updatedList[index] = value;

      return {
        ...previousProfile,
        [fieldName]: updatedList,
      };
    });

    if (requiredJobListFields.some(([listName]) => listName === fieldName)) {
      setJobValidationMessage("");
    }
  }

  function addArrayItem(fieldName, newValue) {
    const requiredList = requiredJobListFields.find(
      ([listName]) => listName === fieldName
    );

    if (requiredList && profile[fieldName].some((item) => !item.trim())) {
      setJobValidationMessage(`${requiredList[1]} cannot be empty.`);
      return;
    }

    if (requiredList && !newValue.trim()) {
      setJobValidationMessage(`${requiredList[1]} cannot be empty.`);
      return;
    }

    setJobValidationMessage("");

    setProfile((previousProfile) => ({
      ...previousProfile,
      [fieldName]: [...previousProfile[fieldName], newValue],
    }));
  }

  function removeArrayItem(fieldName, index) {
    setProfile((previousProfile) => ({
      ...previousProfile,
      [fieldName]: previousProfile[fieldName].filter(
        (_, itemIndex) => itemIndex !== index
      ),
    }));
  }

  function saveCompanyChanges() {
    const emptyField = requiredCompanyFields.find(
      ([fieldName]) => !profile[fieldName].trim()
    );

    if (emptyField) {
      setCompanyValidationMessage(`${emptyField[1]} cannot be empty.`);
      return;
    }

    setCompanyValidationMessage("");
    setIsEditingCompany(false);

    // Backend connection later:
    // employerApi.updateCompanyProfile(profile)
  }

  function saveJobChanges() {
    const emptyField = requiredJobFields.find(
      ([fieldName]) => !profile[fieldName].trim()
    );

    if (emptyField) {
      setJobValidationMessage(`${emptyField[1]} cannot be empty.`);
      return;
    }

    const emptyListField = requiredJobListFields.find(([fieldName]) =>
      profile[fieldName].some((item) => !item.trim())
    );

    if (emptyListField) {
      setJobValidationMessage(`${emptyListField[1]} cannot be empty.`);
      return;
    }

    setJobValidationMessage("");
    setIsEditingJob(false);

    // Backend connection later:
    // employerApi.updateCompanyProfile(profile)
  }

  return (
    <main className="employer-profile-page">
      <section className="employer-profile-hero">
        <div className="profile-header-actions">
          <Link className="profile-header-button logout-button" to="/login">
            Logout
          </Link>

          <Link className="profile-header-button back-button" to="/employer-dashboard">
            ← Back
          </Link>
        </div>

        <h1>Company Profile</h1>

        <div className="company-heading">
          <h2>{profile.companyName}</h2>
          <p>{profile.address}</p>
          {profile.isProUser && (
            <span className="employer-membership-badge">
              Pro User - Free Trial Active
            </span>
          )}
        </div>
      </section>

      <section className="company-info-section">
        {!isEditingCompany && (
          <button
            type="button"
            className="profile-edit-button"
            onClick={() => setIsEditingCompany(true)}
          >
            Edit <span>↗</span>
          </button>
        )}

        <div className="company-info-grid">
          <div className="info-column">
            <div className="profile-field-row">
              <label>Company name:</label>
              {isEditingCompany ? (
                <input
                  name="companyName"
                  required
                  value={profile.companyName}
                  onChange={handleChange}
                />
              ) : (
                <span>{profile.companyName}</span>
              )}
            </div>

            <div className="profile-field-row">
              <label>Email:</label>
              {isEditingCompany ? (
                <input
                  name="email"
                  required
                  value={profile.email}
                  onChange={handleChange}
                />
              ) : (
                <span>{profile.email}</span>
              )}
            </div>

            <div className="profile-field-row address-row">
              <label>Address:</label>
              {isEditingCompany ? (
                <textarea
                  name="address"
                  required
                  value={profile.address}
                  onChange={handleChange}
                />
              ) : (
                <span className="profile-text-value">{profile.address}</span>
              )}
            </div>
          </div>

          <div className="info-column">
            <div className="profile-field-row">
              <label>Phone Number:</label>
              {isEditingCompany ? (
                <input
                  name="phone"
                  required
                  value={profile.phone}
                  onChange={handleChange}
                />
              ) : (
                <span>{profile.phone}</span>
              )}
            </div>

            <div className="profile-field-row">
              <label>Website:</label>
              {isEditingCompany ? (
                <input
                  name="website"
                  required
                  value={profile.website}
                  onChange={handleChange}
                />
              ) : (
                <span>{profile.website}</span>
              )}
            </div>

            <div className="profile-field-row">
              <label>Membership:</label>
              <span
                className={
                  profile.isProUser
                    ? "employer-pro-value"
                    : "profile-standard-value"
                }
              >
                {profile.isProUser
                  ? "Pro user - free trial active"
                  : "Standard user"}
              </span>
            </div>

            <div className="profile-field-row password-row">
              <label>Password:</label>

              {isEditingCompany ? (
                <div className="password-input-wrapper">
                  <input
                    name="password"
                    required
                    type={showPassword ? "text" : "password"}
                    value={profile.password}
                    onChange={handleChange}
                  />

                  <button
                    type="button"
                    className="password-toggle-button"
                    aria-label={passwordToggleLabel}
                    onClick={() => setShowPassword((current) => !current)}
                  >
                    <PasswordVisibilityIcon isVisible={showPassword} />
                  </button>
                </div>
              ) : (
                <div className="password-display-wrapper">
                  <span>{displayedPassword}</span>
                  <button
                    type="button"
                    className="password-toggle-button"
                    aria-label={passwordToggleLabel}
                    onClick={() => setShowPassword((current) => !current)}
                  >
                    <PasswordVisibilityIcon isVisible={showPassword} />
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>

        {companyValidationMessage && (
          <p className="profile-validation-message">
            {companyValidationMessage}
          </p>
        )}

        {isEditingCompany && (
          <button
            type="button"
            className="save-profile-button company-save-button"
            onClick={saveCompanyChanges}
          >
            Save
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
            Edit <span>↗</span>
          </button>
        )}

        <div className="job-form-content">
          <div className="job-profile-row">
            <strong>Job Title:</strong>
            {isEditingJob ? (
              <input
                name="jobTitle"
                required
                value={profile.jobTitle}
                onChange={handleChange}
              />
            ) : (
              <span>{profile.jobTitle}</span>
            )}
          </div>

          <div className="job-profile-row">
            <strong>Location:</strong>
            {isEditingJob ? (
              <input
                name="location"
                required
                value={profile.location}
                onChange={handleChange}
              />
            ) : (
              <span>{profile.location}</span>
            )}
          </div>

          <div className="job-profile-row">
            <strong>Job Type:</strong>
            {isEditingJob ? (
              <select
                name="jobType"
                value={profile.jobType}
                onChange={handleChange}
              >
                <option>Full-time</option>
                <option>Part-time</option>
                <option>Contract</option>
                <option>Casual</option>
              </select>
            ) : (
              <span>{profile.jobType}</span>
            )}
          </div>

          <div className="job-profile-row">
            <strong>Work Mode:</strong>
            {isEditingJob ? (
              <select
                name="workMode"
                value={profile.workMode}
                onChange={handleChange}
              >
                <option>Remote</option>
                <option>On-site</option>
                <option>Hybrid</option>
              </select>
            ) : (
              <span>{profile.workMode}</span>
            )}
          </div>

          <div className="job-description-block">
            <strong>Job Description:</strong>

            {isEditingJob ? (
              <textarea
                name="jobDescription"
                value={profile.jobDescription}
                onChange={handleChange}
              />
            ) : (
              <div className="description-text">{profile.jobDescription}</div>
            )}
          </div>

          <div className="array-section">
            <strong>Responsibilities</strong>

            {isEditingJob ? (
              <>
                {profile.responsibilities.map((responsibility, index) => (
                  <div
                    className="editable-list-item responsibility-list-item"
                    key={index}
                  >
                    <input
                      required
                      value={responsibility}
                      onChange={(event) =>
                        handleArrayChange(
                          "responsibilities",
                          index,
                          event.target.value
                        )
                      }
                    />

                    <button
                      type="button"
                      onClick={() => removeArrayItem("responsibilities", index)}
                    >
                      X
                    </button>
                  </div>
                ))}

                <button
                  type="button"
                  className="add-item-button"
                  onClick={() =>
                    addArrayItem("responsibilities", "New responsibility")
                  }
                >
                  Add another responsibility +
                </button>
              </>
            ) : (
              <ul>
                {profile.responsibilities.map((responsibility) => (
                  <li key={responsibility}>{responsibility}</li>
                ))}
              </ul>
            )}
          </div>

          <div className="job-profile-row">
            <strong>Required Education Level:</strong>
            {isEditingJob ? (
              <select
                name="educationLevel"
                value={profile.educationLevel}
                onChange={handleChange}
              >
                <option>High School</option>
                <option>Diploma</option>
                <option>Bachelor</option>
                <option>Master</option>
                <option>PhD</option>
              </select>
            ) : (
              <span>{profile.educationLevel}</span>
            )}
          </div>

          <div className="job-profile-row">
            <strong>Years of relevant experience:</strong>
            {isEditingJob ? (
              <select
                name="experienceYears"
                value={profile.experienceYears}
                onChange={handleChange}
              >
                <option>0 years</option>
                <option>1-3 years</option>
                <option>3-5 years</option>
                <option>5-10 years</option>
                <option>10+ years</option>
              </select>
            ) : (
              <span>{profile.experienceYears}</span>
            )}
          </div>

          <div className="array-section">
            <strong>Required Skills:</strong>

            {isEditingJob ? (
              <>
                {profile.requiredSkills.map((skill, index) => (
                  <div className="editable-list-item" key={index}>
                    <input
                      required
                      value={skill}
                      onChange={(event) =>
                        handleArrayChange(
                          "requiredSkills",
                          index,
                          event.target.value
                        )
                      }
                    />

                    <button
                      type="button"
                      onClick={() => removeArrayItem("requiredSkills", index)}
                    >
                      X
                    </button>
                  </div>
                ))}

                <button
                  type="button"
                  className="add-item-button"
                  onClick={() => addArrayItem("requiredSkills", "New skill")}
                >
                  Add another skill requirement +
                </button>
              </>
            ) : (
              <ul>
                {profile.requiredSkills.map((skill) => (
                  <li key={skill}>{skill}</li>
                ))}
              </ul>
            )}
          </div>

          <div className="job-profile-row">
            <strong>Salary:</strong>
            {isEditingJob ? (
              <input
                className="salary-input"
                name="salary"
                required
                value={profile.salary}
                onChange={handleChange}
              />
            ) : (
              <span>{profile.salary}</span>
            )}
          </div>

          <div className="array-section">
            <strong>Benefits:</strong>

            {isEditingJob ? (
              <>
                {profile.benefits.map((benefit, index) => (
                  <div className="editable-list-item" key={index}>
                    <input
                      required
                      value={benefit}
                      onChange={(event) =>
                        handleArrayChange("benefits", index, event.target.value)
                      }
                    />

                    <button
                      type="button"
                      onClick={() => removeArrayItem("benefits", index)}
                    >
                      X
                    </button>
                  </div>
                ))}

                <button
                  type="button"
                  className="add-item-button"
                  onClick={() => addArrayItem("benefits", "New benefit")}
                >
                  Add another benefit +
                </button>
              </>
            ) : (
              <ul>
                {profile.benefits.map((benefit) => (
                  <li key={benefit}>{benefit}</li>
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
            onClick={saveJobChanges}
          >
            Save
          </button>
        )}
      </section>
    </main>
  );
}

