import { useState } from "react";
import "../styles/employerProfile.css";

const initialCompanyProfile = {
  companyName: "Amazon",
  city: "Sydney, NSW",
  email: "hiring@company.com",
  phone: "+04xxxxxxxxxx",
  website: "www.company.com",
  address: "",
  password: "************",
  jobTitle: "Software Engineer",
  location: "Town Hall, Sydney, NSW",
  jobType: "On-Site",
  jobDescription: "",
  responsibilities: [
    "Design and develop software solution",
    "Collaborate with cross-department teams",
  ],
  requiredEducation: "Bachelor’s Degree",
  requiredExperience: "1 Year",
  requiredSkills: ["Java", "TypeScript"],
  salary: "$50,000",
  benefits: ["Health Insurance"],
};

export default function EmployerProfile() {
  const [profile, setProfile] = useState(initialCompanyProfile);
  const [isEditingCompany, setIsEditingCompany] = useState(false);
  const [isEditingJob, setIsEditingJob] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  function handleChange(event) {
    const { name, value } = event.target;

    setProfile((previousProfile) => ({
      ...previousProfile,
      [name]: value,
    }));
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
  }

  function addArrayItem(fieldName, newValue) {
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

  function saveChanges() {
    setIsEditingCompany(false);
    setIsEditingJob(false);

    // Backend connection later:
    // employerApi.updateCompanyProfile(profile)
  }

  const isEditing = isEditingCompany || isEditingJob;

  return (
    <main className="employer-profile-page">
      <section className="employer-profile-hero">
        <h1>Company Profile</h1>

        <div className="company-heading">
          <h2>{profile.companyName}</h2>
          <p>{profile.city}</p>
        </div>
      </section>

      <section className="company-info-section">
        <button
          type="button"
          className="profile-edit-button"
          onClick={() => setIsEditingCompany(true)}
        >
          Edit <span>↗</span>
        </button>

        <div className="company-info-grid">
          <div className="info-column">
            <div className="profile-field-row">
              <label>Company name:</label>
              {isEditingCompany ? (
                <input
                  name="companyName"
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
                  value={profile.email}
                  onChange={handleChange}
                />
              ) : (
                <span>{profile.email}</span>
              )}
            </div>

            <div className="profile-field-row">
              <label>Address:</label>
              {isEditingCompany ? (
                <textarea
                  name="address"
                  value={profile.address}
                  onChange={handleChange}
                />
              ) : (
                <span className="empty-line"></span>
              )}
            </div>
          </div>

          <div className="info-column">
            <div className="profile-field-row">
              <label>Phone Number:</label>
              {isEditingCompany ? (
                <input
                  name="phone"
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
                  value={profile.website}
                  onChange={handleChange}
                />
              ) : (
                <span>{profile.website}</span>
              )}
            </div>

            <div className="profile-field-row password-row">
              <label>Password:</label>

              {isEditingCompany ? (
                <div className="password-input-wrapper">
                  <input
                    name="password"
                    type={showPassword ? "text" : "password"}
                    value={profile.password}
                    onChange={handleChange}
                  />

                  <button
                    type="button"
                    onClick={() => setShowPassword((current) => !current)}
                  >
                    ◉
                  </button>
                </div>
              ) : (
                <>
                  <span>{profile.password}</span>
                  <button
                    type="button"
                    className="password-view-button"
                    onClick={() => setShowPassword((current) => !current)}
                  >
                    ◉
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      </section>

      <section className="job-info-section">
        <button
          type="button"
          className="profile-edit-button job-edit-button"
          onClick={() => setIsEditingJob(true)}
        >
          Edit <span>↗</span>
        </button>

        <div className="job-form-content">
          <div className="job-profile-row">
            <strong>Job Title:</strong>
            {isEditingJob ? (
              <input
                name="jobTitle"
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
                <option>On-Site</option>
                <option>Remote</option>
                <option>Hybrid</option>
              </select>
            ) : (
              <span>{profile.jobType}</span>
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
              <div className="description-lines"></div>
            )}
          </div>

          <div className="array-section">
            <strong>Responsibilities</strong>

            {isEditingJob ? (
              <>
                {profile.responsibilities.map((responsibility, index) => (
                  <div className="editable-list-item" key={index}>
                    <input
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
                name="requiredEducation"
                value={profile.requiredEducation}
                onChange={handleChange}
              >
                <option>Bachelor’s Degree</option>
                <option>Diploma</option>
                <option>High School</option>
                <option>Master’s Degree</option>
              </select>
            ) : (
              <span>{profile.requiredEducation}</span>
            )}
          </div>

          <div className="job-profile-row">
            <strong>Required Years of Relevant Experience:</strong>
            {isEditingJob ? (
              <select
                name="requiredExperience"
                value={profile.requiredExperience}
                onChange={handleChange}
              >
                <option>1 Year</option>
                <option>2 Years</option>
                <option>3 Years</option>
                <option>5+ Years</option>
              </select>
            ) : (
              <span>{profile.requiredExperience}</span>
            )}
          </div>

          <div className="array-section">
            <strong>Required Skills:</strong>

            {isEditingJob ? (
              <>
                {profile.requiredSkills.map((skill, index) => (
                  <div className="editable-list-item" key={index}>
                    <input
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

        {isEditing && (
          <button type="button" className="save-profile-button" onClick={saveChanges}>
            Save
          </button>
        )}
      </section>
    </main>
  );
}