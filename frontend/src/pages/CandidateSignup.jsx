import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { registerCandidate } from "../services/api";
import "../styles/candidateProfile.css";

function CandidateSignup() {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    fullName: "",
    dateOfBirth: "",
    email: "",
    password: "",
    phoneNumber: "",
    address1: "",
    address2: "",
    city: "",
    state: "",
    postcode: "",
    professionalSummary: "",
    jobTitle: "",
    companyName: "",
    experienceDate: "",
    responsibility: "",
    schoolName: "",
    degree: "",
    major: "",
    educationDate: "",
    skills: ["Python", "Figma", "Chinese"],
    newSkill: "",
    achievements: ["IELTS 8.0", "Hackathon Winner 2024"],
    newAchievement: "",
    workMode: "Remote",
    preferredLocation: "",
    readyNow: false,
    resume: null,
    profilePhoto: null,
  });

  const [message, setMessage] = useState("");
  const [profilePhotoPreview, setProfilePhotoPreview] = useState("");
  const [experiences, setExperiences] = useState([
  {
    id: 1,
    jobTitle: "",
    companyName: "",
    experienceDate: "",
    responsibility: "",
  },
]);
const [educations, setEducations] = useState([
  {
    id: 1,
    schoolName: "",
    degree: "",
    major: "",
    educationDate: "",
  },
]);
  const [showSkillInput, setShowSkillInput] = useState(false);
  const [showAchievementInput, setShowAchievementInput] = useState(false);

  function handleChange(event) {
    const { name, value, type, checked } = event.target;

    setFormData({
      ...formData,
      [name]: type === "checkbox" ? checked : value,
    });
  }

  // function handleFileChange(event) {
  //   const { name, files } = event.target;

  //   setFormData({
  //     ...formData,
  //     [name]: files[0],
  //   });
  // }


  function processSelectedFile(name, file) {
  if (!file) {
    return;
  }

  setFormData((previousData) => ({
    ...previousData,
    [name]: file,
  }));

  if (name === "profilePhoto") {
    const previewUrl = URL.createObjectURL(file);
    setProfilePhotoPreview(previewUrl);
  }
}

// remove button for profile
function removeUploadedFile(name) {
  setFormData((previousData) => ({
    ...previousData,
    [name]: null,
  }));

  if (name === "profilePhoto") {
    setProfilePhotoPreview("");
  }
}

function handleFileChange(event) {
  const { name, files } = event.target;
  processSelectedFile(name, files[0]);
}

function handleDragOver(event) {
  event.preventDefault();
}

function handleFileDrop(event, name) {
  event.preventDefault();

  const droppedFile = event.dataTransfer.files[0];
  processSelectedFile(name, droppedFile);
}

  function addSkill() {
    if (!formData.newSkill.trim()) {
      return;
    }

    setFormData({
      ...formData,
      skills: [...formData.skills, formData.newSkill.trim()],
      newSkill: "",
    });

    setShowSkillInput(false);
  }

  function removeSkill(skillToRemove) {
    setFormData({
      ...formData,
      skills: formData.skills.filter((skill) => skill !== skillToRemove),
    });
  }

  function addAchievement() {
    if (!formData.newAchievement.trim()) {
      return;
    }

    setFormData({
      ...formData,
      achievements: [...formData.achievements, formData.newAchievement.trim()],
      newAchievement: "",
    });
    setShowAchievementInput(false);
  }

  function removeAchievement(achievementToRemove) {
    setFormData({
      ...formData,
      achievements: formData.achievements.filter(
        (achievement) => achievement !== achievementToRemove
      ),
    });
  }

  function handleExperienceChange(id, field, value) {
  const updatedExperiences = experiences.map((experience) => {
    if (experience.id === id) {
      return {
        ...experience,
        [field]: value,
      };
    }

    return experience;
  });

  setExperiences(updatedExperiences);
}

function addExperience() {
  const newExperience = {
    id: Date.now(),
    jobTitle: "",
    companyName: "",
    experienceDate: "",
    responsibility: "",
  };

  setExperiences([...experiences, newExperience]);
}

function removeExperience(id) {
  if (experiences.length === 1) {
    return;
  }

  setExperiences(experiences.filter((experience) => experience.id !== id));
}

function handleEducationEntryChange(id, field, value) {
  const updatedEducations = educations.map((education) => {
    if (education.id === id) {
      return {
        ...education,
        [field]: value,
      };
    }

    return education;
  });

  setEducations(updatedEducations);
}

function addEducation() {
  const newEducation = {
    id: Date.now(),
    schoolName: "",
    degree: "",
    major: "",
    educationDate: "",
  };

  setEducations([...educations, newEducation]);
}

function removeEducation(id) {
  if (educations.length === 1) {
    return;
  }

  setEducations(educations.filter((education) => education.id !== id));
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

    if (!formData.phoneNumber.trim()) {
      setMessage("Please enter your phone number.");
      return;
    }

    const candidatePayload = {
  ...formData,
  experiences,
  educations,
};

const result = await registerCandidate(candidatePayload);

    if (result.success) {
      setMessage("Profile created successfully.");

      setTimeout(() => {
        navigate("/candidate-dashboard");
      }, 800);
    } else {
      setMessage(result.message);
    }
  }

  return (
    <main className="candidate-page">
      <form className="candidate-profile" onSubmit={handleSubmit}>
        <section className="profile-main">
          <h1>Create Your Profile</h1>

          <div className="section-title">
            <span></span>
            <p>Account Info</p>
            <span></span>
          </div>

          <div className="two-column">
            <div className="field-group">
              <label>Full Name</label>
              <input
                type="text"
                name="fullName"
                value={formData.fullName}
                onChange={handleChange}
              />
            </div>

            <div className="field-group">
              <label>Date of Birth</label>
              <input
                type="date"
                name="dateOfBirth"
                value={formData.dateOfBirth}
                onChange={handleChange}
              />
            </div>

            <div className="field-group">
              <label>Email</label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
              />
            </div>

            <div className="field-group">
              <label>Password</label>
              <input
                type="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
              />
            </div>
          </div>

          <div className="section-title">
            <span></span>
            <p>Contact Info</p>
            <span></span>
          </div>

          <div className="contact-grid">
            <div className="field-group">
              <label>Phone Number</label>
              <input
                type="tel"
                name="phoneNumber"
                value={formData.phoneNumber}
                onChange={handleChange}
              />
            </div>

            <div></div>
            <div></div>

            <div className="field-group">
              <label>Address 1</label>
              <input
                type="text"
                name="address1"
                value={formData.address1}
                onChange={handleChange}
              />
            </div>

            <div className="field-group">
              <label>Address 2</label>
              <input
                type="text"
                name="address2"
                value={formData.address2}
                onChange={handleChange}
              />
            </div>

            <div></div>

            <div className="field-group">
              <label>City</label>
              <input
                type="text"
                name="city"
                value={formData.city}
                onChange={handleChange}
              />
            </div>

            <div className="field-group">
              <label>State</label>
              <input
                type="text"
                name="state"
                value={formData.state}
                onChange={handleChange}
              />
            </div>

            <div className="field-group">
              <label>Postcode</label>
              <input
                type="text"
                name="postcode"
                value={formData.postcode}
                onChange={handleChange}
              />
            </div>
          </div>

          <div className="section-title">
            <span></span>
            <p>Professional Summary</p>
            <span></span>
          </div>

          <div className="field-group">
            <textarea
              name="professionalSummary"
              value={formData.professionalSummary}
              onChange={handleChange}
              placeholder="Briefly describe who you are, your years of experience, key strengths, and career goals."
            ></textarea>
          </div>

          {/* <div className="section-title">
            <span></span>
            <p>Experience</p>
            <span></span>
          </div>

          <div className="section-action-row">
            <button type="button" className="mini-button">
              Add Experience
            </button>
          </div>

          <div className="two-column">
            <div className="field-group">
              <label>Job Title</label>
              <input
                type="text"
                name="jobTitle"
                value={formData.jobTitle}
                onChange={handleChange}
              />
            </div>

            <div></div>

            <div className="field-group">
              <label>Company Name</label>
              <input
                type="text"
                name="companyName"
                value={formData.companyName}
                onChange={handleChange}
              />
            </div>

            <div className="field-group">
              <label>Start Date - End Date</label>
              <input
                type="text"
                name="experienceDate"
                value={formData.experienceDate}
                onChange={handleChange}
              />
            </div>
          </div>

          <div className="field-group">
            <input
              type="text"
              name="responsibility"
              value={formData.responsibility}
              onChange={handleChange}
              placeholder="Describe your responsibilities and achievements."
            />
          </div> */}

          <div className="section-title">
  <span></span>
  <p>Experience</p>
  <span></span>
</div>

<div className="section-action-row">
  <button type="button" className="mini-button" onClick={addExperience}>
    Add Experience
  </button>
</div>

{experiences.map((experience) => (
  <div className="experience-entry" key={experience.id}>
    {experiences.length > 1 && (
      <button
        type="button"
        className="remove-entry-button"
        onClick={() => removeExperience(experience.id)}
      >
        ×
      </button>
    )}

    <div className="two-column">
      <div className="field-group">
        <label>Job Title</label>
        <input
          type="text"
          value={experience.jobTitle}
          onChange={(event) =>
            handleExperienceChange(
              experience.id,
              "jobTitle",
              event.target.value
            )
          }
        />
      </div>

      <div></div>

      <div className="field-group">
        <label>Company Name</label>
        <input
          type="text"
          value={experience.companyName}
          onChange={(event) =>
            handleExperienceChange(
              experience.id,
              "companyName",
              event.target.value
            )
          }
        />
      </div>

      <div className="field-group">
        <label>Start Date - End Date</label>
        <input
          type="text"
          value={experience.experienceDate}
          onChange={(event) =>
            handleExperienceChange(
              experience.id,
              "experienceDate",
              event.target.value
            )
          }
        />
      </div>
    </div>

    <div className="field-group">
      <input
        type="text"
        value={experience.responsibility}
        onChange={(event) =>
          handleExperienceChange(
            experience.id,
            "responsibility",
            event.target.value
          )
        }
        placeholder="Describe your responsibilities and achievements."
      />
    </div>
  </div>
))}

{/* Education */}

{/* 
          <div className="section-title">
            <span></span>
            <p>Education</p>
            <span></span>
          </div>

          <div className="section-action-row">
            <button type="button" className="mini-button">
              Add Education
            </button>
          </div>

          <div className="two-column">
            <div className="field-group">
              <label>School Name</label>
              <input
                type="text"
                name="schoolName"
                value={formData.schoolName}
                onChange={handleChange}
              />
            </div>

            <div className="field-group">
              <label>Degree</label>
              <input
                type="text"
                name="degree"
                value={formData.degree}
                onChange={handleChange}
              />
            </div>

            <div className="field-group">
              <label>Major / Field of Study</label>
              <input
                type="text"
                name="major"
                value={formData.major}
                onChange={handleChange}
              />
            </div>

            <div className="field-group">
              <label>Start Date - End Date</label>
              <input
                type="text"
                name="educationDate"
                value={formData.educationDate}
                onChange={handleChange}
              />
            </div>
          </div> */}

<div className="section-title">
  <span></span>
  <p>Education</p>
  <span></span>
</div>

<div className="section-action-row">
  <button type="button" className="mini-button" onClick={addEducation}>
    Add Education
  </button>
</div>

{educations.map((education) => (
  <div className="education-entry" key={education.id}>
    {educations.length > 1 && (
      <button
        type="button"
        className="remove-entry-button"
        onClick={() => removeEducation(education.id)}
      >
        ×
      </button>
    )}

    <div className="two-column">
      <div className="field-group">
        <label>School Name</label>
        <input
          type="text"
          value={education.schoolName}
          onChange={(event) =>
            handleEducationEntryChange(
              education.id,
              "schoolName",
              event.target.value
            )
          }
        />
      </div>

      <div className="field-group">
        <label>Degree</label>
        <input
          type="text"
          value={education.degree}
          onChange={(event) =>
            handleEducationEntryChange(
              education.id,
              "degree",
              event.target.value
            )
          }
        />
      </div>

      <div className="field-group">
        <label>Major / Field of Study</label>
        <input
          type="text"
          value={education.major}
          onChange={(event) =>
            handleEducationEntryChange(
              education.id,
              "major",
              event.target.value
            )
          }
        />
      </div>

      <div className="field-group">
        <label>Start Date - End Date</label>
        <input
          type="text"
          value={education.educationDate}
          onChange={(event) =>
            handleEducationEntryChange(
              education.id,
              "educationDate",
              event.target.value
            )
          }
        />
      </div>
    </div>
  </div>
))}



          {/* <div className="section-title">
            <span></span>
            <p>Skills & Achievements</p>
            <span></span>
          </div> */}


            

          {/* <div className="field-group">
            <label>Skills</label>

            <div className="tag-box">
              {formData.skills.map((skill) => (
                <button
                  type="button"
                  key={skill}
                  className="tag"
                  onClick={() => removeSkill(skill)}
                >
                  {skill} ×
                </button>
              ))}

              <input
                type="text"
                name="newSkill"
                value={formData.newSkill}
                onChange={handleChange}
                onKeyDown={(event) => {
                  if (event.key === "Enter") {
                    event.preventDefault();
                    addSkill();
                  }
                }}
                placeholder="Add skill"
              />
            </div>
          </div>

          <div className="achievement-row">
            <div className="field-group">
              <label>Achievements</label>
              <input
                type="text"
                name="newAchievement"
                value={formData.newAchievement}
                onChange={handleChange}
              />
            </div>

            <button
              type="button"
              className="mini-button achievement-button"
              onClick={addAchievement}
            >
              Add Achievement
            </button>
          </div>

          <div className="achievement-tags">
            {formData.achievements.map((achievement) => (
              <button
                type="button"
                key={achievement}
                className="achievement-pill"
                onClick={() => removeAchievement(achievement)}
              >
                {achievement} ×
              </button>
            ))}
          </div> */}



          <div className="section-title">
  <span></span>
  <p>Skills & Achievements</p>
  <span></span>
</div>

<div className="profile-subsection-row">
  <label>Skills</label>

  <button
    type="button"
    className="mini-button"
    onClick={() => setShowSkillInput(!showSkillInput)}
  >
    {showSkillInput ? "Cancel" : "Add Skill"}
  </button>
</div>

<div className="tag-box">
  {formData.skills.map((skill) => (
    <button
      type="button"
      key={skill}
      className="tag"
      onClick={() => removeSkill(skill)}
    >
      {skill} ×
    </button>
  ))}
</div>

{showSkillInput && (
  <div className="add-item-row">
    <input
      type="text"
      name="newSkill"
      value={formData.newSkill}
      onChange={handleChange}
      onKeyDown={(event) => {
        if (event.key === "Enter") {
          event.preventDefault();
          addSkill();
        }
      }}
      placeholder="Enter a skill"
    />

    <button type="button" className="mini-button" onClick={addSkill}>
      Save
    </button>
  </div>
)}

<div className="profile-subsection-row achievement-heading-row">
  <label>Achievements</label>

  <button
    type="button"
    className="mini-button"
    onClick={() => setShowAchievementInput(!showAchievementInput)}
  >
    {showAchievementInput ? "Cancel" : "Add Achievement"}
  </button>
</div>

<div className="achievement-tags">
  {formData.achievements.map((achievement) => (
    <button
      type="button"
      key={achievement}
      className="achievement-pill"
      onClick={() => removeAchievement(achievement)}
    >
      {achievement} ×
    </button>
  ))}
</div>

{showAchievementInput && (
  <div className="add-item-row">
    <input
      type="text"
      name="newAchievement"
      value={formData.newAchievement}
      onChange={handleChange}
      onKeyDown={(event) => {
        if (event.key === "Enter") {
          event.preventDefault();
          addAchievement();
        }
      }}
      placeholder="Enter an achievement"
    />

    <button type="button" className="mini-button" onClick={addAchievement}>
      Save
    </button>
  </div>
)}

          <div className="section-title">
            <span></span>
            <p>Job Preferences (optional)</p>
            <span></span>
          </div>

          <div className="work-mode-row">
            <label>
              <input
                type="radio"
                name="workMode"
                value="Remote"
                checked={formData.workMode === "Remote"}
                onChange={handleChange}
              />
              Remote
            </label>

            <label>
              <input
                type="radio"
                name="workMode"
                value="On-Site"
                checked={formData.workMode === "On-Site"}
                onChange={handleChange}
              />
              On-Site
            </label>

            <label>
              <input
                type="radio"
                name="workMode"
                value="Hybrid"
                checked={formData.workMode === "Hybrid"}
                onChange={handleChange}
              />
              Hybrid
            </label>
          </div>

          <div className="field-group">
            <label>Preferred Location (optional)</label>
            <input
              type="text"
              name="preferredLocation"
              value={formData.preferredLocation}
              onChange={handleChange}
            />
          </div>

          <div className="availability-row">
            <p>Availability</p>

            <label>
              <input
                type="checkbox"
                name="readyNow"
                checked={formData.readyNow}
                onChange={handleChange}
              />
              Ready to work now
            </label>
          </div>

          <div className="section-title">
            <span></span>
            <p>Profile Photo</p>
            <span></span>
          </div>

          <div className="photo-upload-wrapper">
            <label
  className="upload-box small-upload"
  onDragOver={handleDragOver}
  onDrop={(event) => handleFileDrop(event, "profilePhoto")}
>
  <span className="upload-icon">↑</span>
  <strong>
    Choose a file or
    <br />
    drag & drop it here
  </strong>
  <small>JPG, PNG max 5MB</small>
  <em>Browse File</em>

  <input
    type="file"
    name="profilePhoto"
    accept=".jpg,.jpeg,.png"
    onChange={handleFileChange}
  />
</label>

{profilePhotoPreview && (
  <div className="profile-preview-side">
    <div className="profile-preview-card">
      <img
        src={profilePhotoPreview}
        alt="Profile preview"
        className="profile-preview-image"
      />
    </div>
  </div>
)}

{formData.profilePhoto && (
  <div className="uploaded-file-actions">
    <p className="selected-file">{formData.profilePhoto.name}</p>

    <button
      type="button"
      className="remove-upload-button"
      onClick={() => removeUploadedFile("profilePhoto")}
    >
      Remove
    </button>
  </div>
)}
          </div>

          {message && <p className="profile-message">{message}</p>}

          <button type="submit" className="submit-profile-button">
            Submit
          </button>
        </section>

        <aside className="profile-side">
          <div className="resume-upload-area">
            <p>Upload your resume</p>

            <label
  className="upload-box"
  onDragOver={handleDragOver}
  onDrop={(event) => handleFileDrop(event, "resume")}
>
              <span className="upload-icon">↑</span>
              <strong>
                Choose a file or
                <br />
                drag & drop it here
              </strong>
              <small>PDF, DOCX max 5MB</small>
              <em>Browse File</em>
              <input
                type="file"
                name="resume"
                accept=".pdf,.doc,.docx"
                onChange={handleFileChange}
              />
            </label>

            {formData.resume && (
  <div className="uploaded-file-actions">
    <p className="selected-file">{formData.resume.name}</p>

    <button
      type="button"
      className="remove-upload-button"
      onClick={() => removeUploadedFile("resume")}
    >
      Remove
    </button>
  </div>
)}
          </div>
        </aside>
      </form>
    </main>
  );
}

export default CandidateSignup;