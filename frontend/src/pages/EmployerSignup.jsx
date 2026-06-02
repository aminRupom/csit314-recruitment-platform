import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { registerEmployer } from "../services/api";
import "../styles/candidateProfile.css";

function EmployerSignup() {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    password: "",
    companyName: "",
    companyInfo: "",
  });

  const [message, setMessage] = useState("");

  function handleChange(event) {
    const { name, value } = event.target;
    setFormData({ ...formData, [name]: value });
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

    try {
      await registerEmployer(formData);
      setMessage("Account created.");
      setTimeout(() => navigate("/employer-dashboard"), 800);
    } catch (error) {
      setMessage(error.message || "Something went wrong. Please try again.");
    }
  }

  return (
    <main className="candidate-page">
      <form className="candidate-profile" onSubmit={handleSubmit}>
        <section className="profile-main">
          <h1>Create Employer Account</h1>

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

            <div></div>
          </div>

          <div className="section-title">
            <span></span>
            <p>Company Info</p>
            <span></span>
          </div>

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
            <label>About Your Company</label>
            <textarea
              name="companyInfo"
              value={formData.companyInfo}
              onChange={handleChange}
              placeholder="Describe your company, culture, and what you are looking for."
            />
          </div>

          {message && <p className="profile-message">{message}</p>}

          <button type="submit" className="submit-profile-button">
            Create Account
          </button>
        </section>

        <aside className="profile-side" />
      </form>
    </main>
  );
}

export default EmployerSignup;
