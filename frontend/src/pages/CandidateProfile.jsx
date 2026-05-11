import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  getLoggedInCandidateProfile,
  updateLoggedInCandidateProfile,
  logoutUser,
} from "../services/api";
import "../styles/candidateProfileView.css";

function CandidateProfile() {
  const navigate = useNavigate();

  const [profile, setProfile] = useState(() => getLoggedInCandidateProfile());
  useEffect(() => {
  if (profile) {
    updateLoggedInCandidateProfile(profile);
  }
}, [profile]);
  const [newAchievement, setNewAchievement] = useState("");
  const [newSkill, setNewSkill] = useState("");
  const [message, setMessage] = useState("");

  function handleChange(event) {
    const { name, value } = event.target;

    setProfile({
      ...profile,
      [name]: value,
    });
  }

  function handleExperienceChange(experienceId, field, value) {
    const updatedExperience = profile.experience.map((item) => {
      if (item.id === experienceId) {
        return {
          ...item,
          [field]: value,
        };
      }

      return item;
    });

    setProfile({
      ...profile,
      experience: updatedExperience,
    });
  }
  
function handleLogout() {
  logoutUser();
  navigate("/login");
}

  function handleEducationChange(educationId, field, value) {
    const updatedEducation = profile.education.map((item) => {
      if (item.id === educationId) {
        return {
          ...item,
          [field]: value,
        };
      }

      return item;
    });

    setProfile({
      ...profile,
      education: updatedEducation,
    });
  }

  function addExperience() {
    const newExperience = {
      id: Date.now(),
      jobTitle: "",
      companyName: "",
      startEndDate: "",
      jobDescription: "",
    };

    setProfile({
      ...profile,
      experience: [...profile.experience, newExperience],
    });
  }

  function removeExperience(experienceId) {
    setProfile({
      ...profile,
      experience: profile.experience.filter((item) => item.id !== experienceId),
    });
  }

  function addEducation() {
    const newEducation = {
      id: Date.now(),
      certification: "",
      schoolName: "",
      startEndDate: "",
    };

    setProfile({
      ...profile,
      education: [...profile.education, newEducation],
    });
  }

  function removeEducation(educationId) {
    setProfile({
      ...profile,
      education: profile.education.filter((item) => item.id !== educationId),
    });
  }

  function addAchievement() {
    if (!newAchievement.trim()) {
      return;
    }

    setProfile({
      ...profile,
      achievements: [...profile.achievements, newAchievement.trim()],
    });

    setNewAchievement("");
  }

  function removeAchievement(achievementToRemove) {
    setProfile({
      ...profile,
      achievements: profile.achievements.filter(
        (achievement) => achievement !== achievementToRemove
      ),
    });
  }

  function addSkill() {
    if (!newSkill.trim()) {
      return;
    }

    setProfile({
      ...profile,
      skills: [...profile.skills, newSkill.trim()],
    });

    setNewSkill("");
  }

  function removeSkill(skillToRemove) {
    setProfile({
      ...profile,
      skills: profile.skills.filter((skill) => skill !== skillToRemove),
    });
  }

  function handleSave() {
  if (!profile) {
    return;
  }

  updateLoggedInCandidateProfile(profile);
  setMessage("Profile saved successfully.");

  setTimeout(() => {
    setMessage("");
  }, 1800);
}

if (!profile) {
  return (
    <main className="candidate-profile-view-page">
      <div style={{ padding: "40px" }}>
        <h1>No candidate is logged in.</h1>
        <button
          type="button"
          className="profile-back-button"
          onClick={() => navigate("/login")}
        >
          Go to Login
        </button>

        <button
  type="button"
  className="profile-logout-button"
  onClick={handleLogout}
>
  Logout
</button>

      </div>
    </main>
  );
}

  return (
    <main className="candidate-profile-view-page">
      <header className="profile-top-section">
        <button
          type="button"
          className="profile-back-button"
          onClick={() => navigate("/candidate-dashboard")}
        >
          ← Back
        </button>

        <button
  type="button"
  className="profile-logout-button"
  onClick={handleLogout}
>
  Logout
</button>

        <h1>My Profile</h1>

        <div className="profile-identity-row">
          <div className="profile-avatar">LA</div>

          <div>
            <input
              className="profile-name-input"
              type="text"
              name="fullName"
              value={profile.fullName}
              onChange={handleChange}
            />

            <input
              className="profile-location-input"
              type="text"
              name="location"
              value={profile.location}
              onChange={handleChange}
            />
          </div>
        </div>
      </header>

      <section className="profile-content-grid">
        <aside className="profile-left-panel">
          <div className="profile-inline-field">
            <label>Full name:</label>
            <input
              type="text"
              name="fullName"
              value={profile.fullName}
              onChange={handleChange}
            />
          </div>

          <div className="profile-inline-field">
            <label>Date of Birth:</label>
            <input
              type="text"
              name="dateOfBirth"
              value={profile.dateOfBirth}
              onChange={handleChange}
            />
          </div>

          <div className="profile-inline-field">
            <label>Email Address:</label>
            <input
              type="email"
              name="email"
              value={profile.email}
              onChange={handleChange}
            />
          </div>

          <div className="profile-inline-field">
            <label>Phone Number:</label>
            <input
              type="text"
              name="phoneNumber"
              value={profile.phoneNumber}
              onChange={handleChange}
            />
          </div>

          <div className="profile-address-field">
            <label>Address:</label>
            <textarea
              name="address"
              value={profile.address}
              onChange={handleChange}
            ></textarea>
          </div>

          <div className="profile-inline-field">
            <label>Preferred Work Mode:</label>
            <select
              name="preferredWorkMode"
              value={profile.preferredWorkMode}
              onChange={handleChange}
            >
              <option value="Remote">Remote</option>
              <option value="On-site">On-site</option>
              <option value="Hybrid">Hybrid</option>
            </select>
          </div>

          <div className="profile-inline-field">
            <label>Preferred Location:</label>
            <input
              type="text"
              name="preferredLocation"
              value={profile.preferredLocation}
              onChange={handleChange}
            />
          </div>

          <div className="profile-inline-field">
            <label>Availability:</label>
            <select
              name="availability"
              value={profile.availability}
              onChange={handleChange}
            >
              <option value="Ready to work now">Ready to work now</option>
              <option value="Available in 2 weeks">Available in 2 weeks</option>
              <option value="Not currently available">
                Not currently available
              </option>
            </select>
          </div>

          <div className="profile-inline-field">
            <label>Password:</label>
            <input
              type="password"
              name="password"
              value={profile.password}
              onChange={handleChange}
            />
          </div>

          <button
            type="button"
            className="profile-save-button left-save"
            onClick={handleSave}
          >
            Save
          </button>
        </aside>

        <section className="profile-right-panel">
          <div className="profile-section-block">
            <label>Professional Summary:</label>
            <textarea
              className="summary-textarea"
              name="professionalSummary"
              value={profile.professionalSummary}
              onChange={handleChange}
            ></textarea>
          </div>

          <div className="profile-section-block">
            <label>Experience:</label>

            {profile.experience.map((item) => (
              <div className="profile-record-box" key={item.id}>
                <button
                  type="button"
                  className="remove-record-button"
                  onClick={() => removeExperience(item.id)}
                >
                  ×
                </button>

                <div className="record-line">
                  <span>Job Title:</span>
                  <input
                    type="text"
                    value={item.jobTitle}
                    onChange={(event) =>
                      handleExperienceChange(
                        item.id,
                        "jobTitle",
                        event.target.value
                      )
                    }
                  />
                </div>

                <div className="record-line">
                  <span>Company Name:</span>
                  <input
                    type="text"
                    value={item.companyName}
                    onChange={(event) =>
                      handleExperienceChange(
                        item.id,
                        "companyName",
                        event.target.value
                      )
                    }
                  />
                </div>

                <div className="record-line">
                  <span>Start Date - End Date:</span>
                  <input
                    type="text"
                    value={item.startEndDate}
                    onChange={(event) =>
                      handleExperienceChange(
                        item.id,
                        "startEndDate",
                        event.target.value
                      )
                    }
                  />
                </div>

                <div className="record-line">
                  <span>Job description:</span>
                  <input
                    type="text"
                    value={item.jobDescription}
                    onChange={(event) =>
                      handleExperienceChange(
                        item.id,
                        "jobDescription",
                        event.target.value
                      )
                    }
                  />
                </div>
              </div>
            ))}

            <button
              type="button"
              className="add-link-button"
              onClick={addExperience}
            >
              Add another job +
            </button>
          </div>

          <div className="profile-section-block">
            <label>Education:</label>

            {profile.education.map((item) => (
              <div className="profile-record-box" key={item.id}>
                <button
                  type="button"
                  className="remove-record-button"
                  onClick={() => removeEducation(item.id)}
                >
                  ×
                </button>

                <div className="record-line">
                  <span>Certification:</span>
                  <input
                    type="text"
                    value={item.certification}
                    onChange={(event) =>
                      handleEducationChange(
                        item.id,
                        "certification",
                        event.target.value
                      )
                    }
                  />
                </div>

                <div className="record-line">
                  <span>School Name:</span>
                  <input
                    type="text"
                    value={item.schoolName}
                    onChange={(event) =>
                      handleEducationChange(
                        item.id,
                        "schoolName",
                        event.target.value
                      )
                    }
                  />
                </div>

                <div className="record-line">
                  <span>Start Date - End Date:</span>
                  <input
                    type="text"
                    value={item.startEndDate}
                    onChange={(event) =>
                      handleEducationChange(
                        item.id,
                        "startEndDate",
                        event.target.value
                      )
                    }
                  />
                </div>
              </div>
            ))}

            <button
              type="button"
              className="add-link-button"
              onClick={addEducation}
            >
              Add another education certificate +
            </button>
          </div>

          <div className="profile-section-block compact-section">
            <label>Achievement:</label>

            <div className="profile-tag-column">
              {profile.achievements.map((achievement) => (
                <button
                  type="button"
                  className="profile-tag"
                  key={achievement}
                  onClick={() => removeAchievement(achievement)}
                >
                  {achievement} <span>×</span>
                </button>
              ))}
            </div>

            <div className="add-small-row">
              <input
                type="text"
                value={newAchievement}
                onChange={(event) => setNewAchievement(event.target.value)}
                placeholder="Add achievement"
              />

              <button type="button" onClick={addAchievement}>
                +
              </button>
            </div>
          </div>

          <div className="profile-section-block compact-section">
            <label>Skills:</label>

            <div className="profile-tag-column">
              {profile.skills.map((skill) => (
                <button
                  type="button"
                  className="profile-tag"
                  key={skill}
                  onClick={() => removeSkill(skill)}
                >
                  {skill} <span>×</span>
                </button>
              ))}
            </div>

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
          </div>

          {message && <p className="profile-save-message">{message}</p>}

          <button
            type="button"
            className="profile-save-button right-save"
            onClick={handleSave}
          >
            Save
          </button>
        </section>
      </section>
    </main>
  );
}

export default CandidateProfile;