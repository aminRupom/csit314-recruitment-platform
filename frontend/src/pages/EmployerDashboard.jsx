import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import "../styles/employerDashboard.css";

//mock data
const candidates = [
  {
    id: 1,
    name: "Liam Anderson",
    role: "Software Engineer",
    experience: "3 years experience",
    location: "Sydney, NSW",
    education: "Bachelor of IT",
    skills: ["Python", "AWS", "Figma"],
    extraSkills: "+ 2",
    status: "Open to work",
    image: "https://i.pravatar.cc/150?img=12",
    phone: "04xxxxxxxx",
    email: "liamAnder@gmail.com",
    summary:
      "An eager to learn and innovative software engineer. I have a passion for experimenting new solutions and work best in team.",
    workExperience: {
      jobTitle: "Software Engineer",
      companyName: "Atlassian",
      dates: "Jan 2022 - Present",
      description: "Developed new features for project management softwares",
    },
    educationDetails: {
      certification: "Wollongong",
      schoolName: "University of Wollongong",
      dates: "Jan 2022 - Present",
    },
    achievements: ["IELTS 8.0", "ATAR 97", "Hackathon 2024"],
    profileSkills: ["Multilingual", "Time management", "Organizational"],
  },
  {
    id: 2,
    name: "Shona Sullivan",
    role: "Developer",
    experience: "5 years experience",
    location: "Bondi, NSW",
    education: "Masters of IT",
    skills: ["Java", "AWS", "Python"],
    extraSkills: "+ 3",
    status: "Not readily available",
    image: "https://i.pravatar.cc/150?img=47",
  },
  {
    id: 3,
    name: "Mark Innes",
    role: "Tutor",
    experience: "1 year experience",
    location: "Sydney, NSW",
    education: "Bachelor of Primary Education",
    skills: ["Maths", "History", "Physcology"],
    extraSkills: "+ 1",
    status: "Open to work",
    image: "https://i.pravatar.cc/150?img=13",
  },
  {
    id: 4,
    name: "Amir Ruben",
    role: "Actor",
    experience: "4 years experience",
    location: "Melbourne, VIC",
    education: "Masters of Theatrical Theory",
    skills: ["Theatre", "Voice-over"],
    extraSkills: "",
    status: "Posted 7 days ago",
    image: "https://i.pravatar.cc/150?img=14",
  },
  {
    id: 5,
    name: "Aryan Nathan",
    role: "Sales Director",
    experience: "7 years experience",
    location: "Perth, WA",
    education: "Bachelor of Business",
    skills: ["Business analysis", "Excel", "SQL"],
    extraSkills: "+ 2",
    status: "Posted 1 day ago",
    image: "https://i.pravatar.cc/150?img=15",
  },
  {
    id: 6,
    name: "Sophia Hong",
    role: "Data Analyst",
    experience: "10 years experience",
    location: "Bondi, NSW",
    education: "Masters of Data Science",
    skills: ["DBMS", "AWS", "Docker"],
    extraSkills: "+ 4",
    status: "Not readily available",
    image: "https://i.pravatar.cc/150?img=49",
  },
];

function SearchIcon() {
  return (
    <svg viewBox="0 0 24 24" className="employer-icon">
      <circle cx="11" cy="11" r="7" />
      <line x1="16.5" y1="16.5" x2="21" y2="21" />
    </svg>
  );
}

function FilterIcon() {
  return (
    <svg viewBox="0 0 24 24" className="employer-filter-svg">
      <path d="M3 5h18l-7 8v6l-4-2v-4L3 5z" />
    </svg>
  );
}

function ProfileIcon({ onClick }) {
  return (
    <button
      type="button"
      className="employer-profile-circle"
      onClick={onClick}
      aria-label="Open employer profile"
    >
      <svg viewBox="0 0 24 24" className="employer-profile-svg">
        <circle cx="12" cy="8" r="3" />
        <path d="M5 21v-2.5c0-3.2 3.2-5.5 7-5.5s7 2.3 7 5.5V21H5z" />
      </svg>
    </button>
  );
}

function SparkleIcon() {
  return (
    <span className="employer-sparkles">
      <span>♦</span>
      <span>♦</span>
    </span>
  );
}

function CandidateCard({ candidate, isSelected, onClick }) {
  return (
    <article
      className={`candidate-card ${isSelected ? "selected" : ""}`}
      onClick={() => onClick(candidate)}
    >
      <div className="candidate-card-top">
        <div>
          <h2>{candidate.name}</h2>
          <p>{candidate.role}</p>
        </div>

        <img
          src={candidate.image}
          alt={candidate.name}
          className="candidate-avatar"
        />
      </div>

      <div className="candidate-card-body">
        <p className="candidate-experience">{candidate.experience}</p>

        <div className="candidate-skill-row">
          {candidate.skills.map((skill) => (
            <span className="candidate-skill-pill" key={skill}>
              {skill}
            </span>
          ))}

          {candidate.extraSkills && (
            <span className="candidate-extra-skill">
              {candidate.extraSkills}
            </span>
          )}
        </div>

        <p className="candidate-meta">
          {candidate.location} <span>•</span> {candidate.education}
        </p>

        <p className="candidate-status">{candidate.status}</p>
      </div>
    </article>
  );
}

function FilterPanel({ onClose }) {
  return (
    <div className="filter-panel">
      <div className="filter-row">
        <label>
          Experience
          <select>
            <option>Years</option>
            <option>1+ years</option>
            <option>3+ years</option>
            <option>5+ years</option>
          </select>
        </label>

        <label>
          Language spoken
          <select>
            <option>Language</option>
            <option>English</option>
            <option>Mandarin</option>
            <option>Arabic</option>
            <option>Hindi</option>
          </select>
        </label>
      </div>

      <div className="filter-section">
        <p>Skills</p>

        {[
          "Marketing",
          "Coding",
          "Conversational",
          "Graphic Design",
          "Music",
          "Entrepreneur",
        ].map((skill) => (
          <label className="checkbox-label" key={skill}>
            <input type="checkbox" />
            <span>{skill}</span>
          </label>
        ))}
      </div>

      <div className="filter-section">
        <p>Availability</p>

        <label className="checkbox-label">
          <input type="checkbox" />
          <span>Ready to work</span>
        </label>
      </div>

      <button className="apply-filter-button" onClick={onClose}>
        Apply
      </button>
    </div>
  );
}

function RecommendationPanel({ isProMembership, onClose, onSubscribe }) {
  const [topK, setTopK] = useState(isProMembership ? 18 : 8);
  const minTopK = 1;
  const standardMaxTopK = 10;
  const proMaxTopK = 20;
  const maxTopK = isProMembership ? proMaxTopK : standardMaxTopK;
  const topKPosition = ((topK - minTopK) / (maxTopK - minTopK)) * 100;
  const showTopKValue = topK > minTopK && topK < maxTopK;

  return (
    <div
      className={`recommendation-panel ${
        isProMembership ? "pro-recommendation-panel" : ""
      }`}
    >
      <button className="close-modal-button" onClick={onClose}>
        ×
      </button>

      <p className="recommendation-title">Top-K recommendations</p>

      <div className="recommendation-range">
        {showTopKValue && (
          <span
            className="range-current-value"
            style={{ left: `${topKPosition}%` }}
          >
            {topK}
          </span>
        )}

        <input
          type="range"
          min={minTopK}
          max={maxTopK}
          value={topK}
          onChange={(event) => setTopK(Number(event.target.value))}
          className="recommendation-slider"
        />

        <div className="range-labels">
          <span>{minTopK}</span>
          <span>{isProMembership ? "All" : maxTopK}</span>
        </div>
      </div>

      {!isProMembership && (
        <button className="membership-link" onClick={onSubscribe}>
          Subscribe to our membership to unlock more recommendations
        </button>
      )}
    </div>
  );
}

function MembershipPlansModal({ onClose, onStartTrial }) {
  return (
    <div className="membership-modal-backdrop" role="presentation">
      <section
        className="membership-plans-modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="membership-plans-title"
      >
        <button
          type="button"
          className="membership-close-button"
          onClick={onClose}
          aria-label="Close membership plans"
        >
          ×
        </button>

        <h2 id="membership-plans-title">Membership Plans</h2>

        <div className="membership-plan-grid">
          <article className="membership-plan-card">
            <h3>Standard</h3>

            <ul>
              <li>Upload resume</li>
              <li>View jobs</li>
              <li>Create job postings</li>
              <li>View candidates</li>
              <li>Search/Filter results</li>
              <li>View top-10 AI-driven recommendations</li>
            </ul>
          </article>

          <article className="membership-plan-card">
            <h3>Pro</h3>

            <ul>
              <li>All Standard features</li>
              <li>Unlimited AI-driven recommendations</li>
            </ul>

            <button
              type="button"
              className="free-trial-button"
              onClick={onStartTrial}
            >
              Start Free Trial
            </button>
          </article>
        </div>
      </section>
    </div>
  );
}

function CandidateProfileModal({ candidate, onClose }) {
  if (!candidate) return null;

  const profile = {
    ...candidates[0],
    ...candidate,
  };

  return (
    <div className="profile-modal">
      <button className="close-profile-button" onClick={onClose}>
        ×
      </button>

      <div className="profile-main-heading">
        <div>
          <h2>{profile.name}</h2>
          <p>{profile.role}</p>
        </div>

        <img src={profile.image} alt={profile.name} className="profile-photo" />
      </div>

      <div className="contact-box">
        <p>📍 Location: {profile.location.split(",")[0]}</p>
        <p>📞 Phone Number: {profile.phone || "04xxxxxxxx"}</p>
        <p>✉️ Email: {profile.email || "candidate@gmail.com"}</p>
      </div>

      <section className="profile-section">
        <h3>Professional Summary:</h3>
        <p>{profile.summary}</p>
      </section>

      <section className="profile-section">
        <h3>Experience:</h3>

        <div className="profile-info-box">
          <p>
            Job Title:{" "}
            <span>{profile.workExperience?.jobTitle || profile.role}</span>
          </p>
          <p>
            Company Name:{" "}
            <span>{profile.workExperience?.companyName || "Company Name"}</span>
          </p>
          <p>
            Start Date - End Date:{" "}
            <span>{profile.workExperience?.dates || "Jan 2022 - Present"}</span>
          </p>
          <p>Job description:</p>
          <p>
            <span>
              {profile.workExperience?.description ||
                "Developed strong workplace skills and contributed to team tasks."}
            </span>
          </p>
        </div>
      </section>

      <section className="profile-section">
        <h3>Education:</h3>

        <div className="profile-info-box">
          <p>
            Certification:{" "}
            <span>
              {profile.educationDetails?.certification || profile.education}
            </span>
          </p>
          <p>
            School Name:{" "}
            <span>
              {profile.educationDetails?.schoolName ||
                "University of Wollongong"}
            </span>
          </p>
          <p>
            Start Date - End Date:{" "}
            <span>{profile.educationDetails?.dates || "Jan 2022 - Present"}</span>
          </p>
        </div>
      </section>

      <div className="profile-bottom-grid">
        <section>
          <h3>Achievements:</h3>
          <ul>
            {(profile.achievements || ["Achievement 1", "Achievement 2"]).map(
              (item) => (
                <li key={item}>{item}</li>
              )
            )}
          </ul>
        </section>

        <section>
          <h3>Skills:</h3>
          <ul>
            {(profile.profileSkills || profile.skills).map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </section>
      </div>
    </div>
  );
}

export default function EmployerDashboard() {
  const [searchTerm, setSearchTerm] = useState("");
  const [showFilter, setShowFilter] = useState(false);
  const [showRecommendations, setShowRecommendations] = useState(false);
  const [showMembershipPlans, setShowMembershipPlans] = useState(false);
  const [isProMembership, setIsProMembership] = useState(false);
  const [selectedCandidate, setSelectedCandidate] = useState(null);
  const navigate = useNavigate();
  const filteredCandidates = useMemo(() => {
    return candidates.filter((candidate) => {
      const searchText = `${candidate.name} ${candidate.role} ${candidate.location} ${candidate.skills.join(
        " "
      )}`.toLowerCase();

      return searchText.includes(searchTerm.toLowerCase());
    });
  }, [searchTerm]);

  return (
    <main className="employer-dashboard-page">
      <header className="employer-header">
        <h1>Hustle</h1>

        <ProfileIcon onClick={() => navigate("/employer-profile")} />

        <div className="employer-search-section">
          <div className="employer-search-box">
            <SearchIcon />

            <input
              type="text"
              placeholder="Search"
              value={searchTerm}
              onChange={(event) => setSearchTerm(event.target.value)}
            />
          </div>

          <button
            className={`employer-filter-button ${showFilter ? "active" : ""}`}
            onClick={() => {
              setShowFilter((current) => !current);
              setShowRecommendations(false);
            }}
            aria-label="Filter candidates"
          >
            <FilterIcon />
          </button>

          <button
            className="suitable-candidates-button"
            onClick={() => {
              setShowRecommendations((current) => !current);
              setShowFilter(false);
            }}
          >
            Find suitable candidates
            <SparkleIcon />
          </button>
        </div>
      </header>

      <section className="candidate-grid">
        {filteredCandidates.map((candidate) => (
          <CandidateCard
            key={candidate.id}
            candidate={candidate}
            isSelected={candidate.id === 1}
            onClick={setSelectedCandidate}
          />
        ))}
      </section>

      {showFilter && <FilterPanel onClose={() => setShowFilter(false)} />}

      {showRecommendations && (
        <RecommendationPanel
          key={
            isProMembership ? "pro-recommendations" : "standard-recommendations"
          }
          isProMembership={isProMembership}
          onClose={() => setShowRecommendations(false)}
          onSubscribe={() => setShowMembershipPlans(true)}
        />
      )}

      {showMembershipPlans && (
        <MembershipPlansModal
          onClose={() => setShowMembershipPlans(false)}
          onStartTrial={() => {
            setIsProMembership(true);
            setShowMembershipPlans(false);
            setShowRecommendations(true);
          }}
        />
      )}

      {selectedCandidate && (
        <div className="modal-backdrop">
          <CandidateProfileModal
            candidate={selectedCandidate}
            onClose={() => setSelectedCandidate(null)}
          />
        </div>
      )}
    </main>
  );
}
