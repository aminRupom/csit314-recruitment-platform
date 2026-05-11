import { useNavigate, useParams } from "react-router-dom";
import { jobs } from "../data/jobs";
import "../styles/jobDetails.css";

function JobDetails() {
  const { jobId } = useParams();
  const navigate = useNavigate();

  const job = jobs.find((item) => item.id === Number(jobId));

  if (!job) {
    return (
      <main className="job-details-page">
        <section className="job-details-modal">
          <h1>Job not found</h1>
          <button
            type="button"
            className="back-button"
            onClick={() => navigate("/candidate-dashboard")}
          >
            Back to Jobs
          </button>
        </section>
      </main>
    );
  }

  return (
    <main className="job-details-page">
      <section className="job-details-layout">
        <aside className="job-details-sidebar">
          <h1>Hustle</h1>

          <button
            type="button"
            className="back-button"
            onClick={() => navigate("/candidate-dashboard")}
          >
            ← Back
          </button>
        </aside>

        <section className="job-details-modal">
          <header className="job-details-header">
            <h1>{job.title}</h1>
            <p>{job.company}</p>
          </header>

          <section className="job-summary-grid">
            <div className="summary-box">
              <span className="summary-icon">⌖</span>

              <div>
                <p>Location</p>
                <strong>{job.location}</strong>
              </div>
            </div>

            <div className="summary-box">
              <span className="summary-icon">▥</span>

              <div>
                <p>Work Mode</p>
                <strong>{job.workMode}</strong>
              </div>
            </div>

            <div className="summary-box">
              <span className="summary-icon">▣</span>

              <div>
                <p>Job Type</p>
                <strong>{job.type}</strong>
              </div>
            </div>

            <div className="summary-box salary-summary">
              <span className="summary-icon">$</span>

              <div>
                <p>Salary / Pay</p>
                <strong>{job.salaryText}</strong>
              </div>
            </div>
          </section>

          <section className="job-description-section">
            <h2>Job Description</h2>
            <p>{job.description}</p>
          </section>

          <section className="job-description-section">
            <h2>Responsibilities</h2>

            <ul className="responsibility-list">
              {job.responsibilities.map((responsibility) => (
                <li key={responsibility}>{responsibility}</li>
              ))}
            </ul>
          </section>

          <section className="job-description-section">
            <h2>Benefits</h2>

            <ul>
              {job.benefits.map((benefit) => (
                <li key={benefit}>{benefit}</li>
              ))}
            </ul>
          </section>

          <div className="job-details-divider"></div>

          <section className="job-bottom-grid">
            <div className="job-education-info">
              <div>
                <p>Education Level</p>
                <strong>{job.educationLevel}</strong>
              </div>

              <div>
                <p>Years of Experience</p>
                <strong>{job.experience}</strong>
              </div>
            </div>

            <div className="job-required-skills">
              <p>Required Skills</p>

              <div className="required-skills-list">
                {job.skills.map((skill) => (
                  <span key={skill}>{skill}</span>
                ))}
              </div>
            </div>
          </section>

          <button type="button" className="apply-job-button">
            Apply
          </button>
        </section>
      </section>
    </main>
  );
}

export default JobDetails;