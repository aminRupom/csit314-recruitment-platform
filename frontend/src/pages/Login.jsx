import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { loginUser } from "../services/api";
import "../styles/login.css";

function Login() {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    email: "",
    password: "",
    role: "candidate",
  });

  const [errorMessage, setErrorMessage] = useState("");

  function handleChange(event) {
    const { name, value } = event.target;

    setFormData({
      ...formData,
      [name]: value,
    });
  }

  function handleRoleChange(role) {
    setFormData({
      ...formData,
      role: role,
    });
  }

  async function handleSubmit(event) {
    event.preventDefault();

    if (!formData.email.trim()) {
      setErrorMessage("Please enter your email.");
      return;
    }

    if (!formData.password.trim()) {
      setErrorMessage("Please enter your password.");
      return;
    }

    try {
      const result = await loginUser(formData);

      if (result.success) {
        setErrorMessage("");

        if (formData.role === "candidate") {
          navigate("/candidate-dashboard");
        } else {
          navigate("/employer-dashboard");
        }
      } else {
        setErrorMessage(result.message);
      }
    } catch (error) {
      setErrorMessage("Something went wrong. Please try again.");
    }
  }

  return (
    <main className="login-page">
      <section className="login-container">
        <header className="login-header">
          <h1>Hustle</h1>
          <h2>Login</h2>
        </header>

        <form className="login-form" onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="email">Email</label>

            <input
              id="email"
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              autoComplete="email"
            />
          </div>

          <div className="form-group">
            <label htmlFor="password">Password</label>

            <input
              id="password"
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              autoComplete="current-password"
            />
          </div>

          {errorMessage && <p className="error-message">{errorMessage}</p>}

          <button type="submit" className="login-button">
            Login
          </button>
        </form>

        <div className="signup-area">
          <p>Don&apos;t have an account yet? Sign up</p>

          <div className="role-buttons">
            <button
              type="button"
              className={formData.role === "candidate" ? "selected-role" : ""}
              onClick={() => {
                handleRoleChange("candidate");
                navigate("/signup/candidate");
              }}
            >
              Candidate
            </button>

            <button
              type="button"
              className={formData.role === "employer" ? "selected-role" : ""}
              onClick={() => {
                handleRoleChange("employer");
                navigate("/signup/employer");
              }}
            >
              Employer
            </button>
          </div>
        </div>
      </section>
    </main>
  );
}

export default Login;