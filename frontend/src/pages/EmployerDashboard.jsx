import { useCallback, useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  getCandidates,
  getCurrentUser,
  getMyJobPostings,
  getRecommendedCandidates,
  startEmployerFreeTrial,
} from "../services/api";
import { clearTokens } from "../services/auth";
import "../styles/employerDashboard.css";

const EDUCATION_LABELS = {
  HIGH_SCHOOL: "High School",
  DIPLOMA: "Diploma",
  BACHELOR: "Bachelor's Degree",
  MASTER: "Master's Degree",
  PHD: "PhD",
};

const WORK_MODE_LABELS = {
  REMOTE: "Remote",
  ONSITE: "On-site",
  HYBRID: "Hybrid",
};

const FILTER_SKILL_OPTIONS = [
  "Marketing",
  "Coding",
  "Conversational",
  "Graphic Design",
  "Music",
  "Entrepreneur",
];

const LANGUAGE_OPTIONS = ["English", "Mandarin", "Hindi", "Arabic", "Spanish"];

function splitSkills(skills) {
  return (skills || "")
    .split(",")
    .map((skill) => skill.trim())
    .filter(Boolean);
}

function getInitials(name) {
  return (
    name
      ?.split(" ")
      .map((part) => part[0])
      .filter(Boolean)
      .slice(0, 2)
      .join("")
      .toUpperCase() || "?"
  );
}

const EMPTY_EXPERIENCE = {
  jobTitle: "",
  companyName: "",
  dateRange: "",
  description: "",
};

function parseBioSections(value) {
  const text = (value || "").trim();

  if (!text) {
    return {
      summary: "",
      achievements: [],
    };
  }

  const achievementMatch = text.match(/\bAchievements?:\s*/i);

  if (!achievementMatch) {
    return {
      summary: text,
      achievements: [],
    };
  }

  const summary = text.slice(0, achievementMatch.index).trim();
  const achievementText = text
    .slice(achievementMatch.index + achievementMatch[0].length)
    .trim();

  return {
    summary,
    achievements: achievementText
      .split(/,|\r?\n/)
      .map((achievement) => achievement.replace(/^[-*]\s*/, "").trim())
      .filter(Boolean),
  };
}

function parseWorkExperience(value) {
  const text = (value || "").trim();

  if (!text) {
    return EMPTY_EXPERIENCE;
  }

  const [headingLine = "", ...descriptionLines] = text.split(/\r?\n/);
  let heading = headingLine.trim();
  let dateRange = "";
  const dateMatch = heading.match(/\(([^()]*)\)\s*$/);

  if (dateMatch) {
    dateRange = dateMatch[1].trim();
    heading = heading.slice(0, dateMatch.index).trim();
  }

  const atMarker = " at ";
  const atIndex = heading.toLowerCase().lastIndexOf(atMarker);

  return {
    jobTitle:
      atIndex >= 0 ? heading.slice(0, atIndex).trim() : heading.trim(),
    companyName:
      atIndex >= 0 ? heading.slice(atIndex + atMarker.length).trim() : "",
    dateRange,
    description: descriptionLines.join("\n").trim(),
  };
}

function getCandidateAvailabilityStatus(candidate) {
  const availabilityValue = String(
    candidate.availability ||
      candidate.ready_now ||
      candidate.ready_to_work ||
      ""
  ).toLowerCase();

  if (
    availabilityValue.includes("not") ||
    availabilityValue.includes("unavailable") ||
    availabilityValue.includes("false")
  ) {
    return "Not readily available";
  }

  return "Open to work";
}

function normalizeCandidate(candidate) {
  const skills = splitSkills(candidate.skills);

  return {
    ...candidate,
    name: candidate.full_name || "Unnamed candidate",
    role: candidate.major || "Candidate",
    experience: `${candidate.years_experience || 0} year${
      candidate.years_experience === 1 ? "" : "s"
    } experience`,
    location: candidate.preferred_location || "Location not specified",
    educationLabel: EDUCATION_LABELS[candidate.education] || candidate.education || "-",
    workModeLabel:
      WORK_MODE_LABELS[candidate.preferred_work_mode] ||
      candidate.preferred_work_mode ||
      "-",
    cardSkills: skills.slice(0, 3),
    extraSkills: Math.max(skills.length - 3, 0),
    allSkills: skills,
    avatarUrl:
      candidate.profile_photo_url ||
      candidate.photo_url ||
      candidate.avatar_url ||
      "",
    status: getCandidateAvailabilityStatus(candidate),
    searchText: [
      candidate.full_name,
      candidate.major,
      candidate.preferred_location,
      candidate.education,
      candidate.language,
      candidate.languages,
      candidate.skills,
      candidate.work_experience,
      candidate.bio,
    ]
      .filter(Boolean)
      .join(" ")
      .toLowerCase(),
  };
}

function SearchIcon() {
  return (
    <svg viewBox="0 0 24 24" className="employer-icon" aria-hidden="true">
      <circle cx="11" cy="11" r="7" />
      <line x1="16.5" y1="16.5" x2="21" y2="21" />
    </svg>
  );
}

function FilterIcon() {
  return (
    <svg viewBox="0 0 24 24" className="employer-filter-svg" aria-hidden="true">
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
      <svg viewBox="0 0 24 24" className="employer-profile-svg" aria-hidden="true">
        <circle cx="12" cy="8" r="3" />
        <path d="M5 21v-2.5c0-3.2 3.2-5.5 7-5.5s7 2.3 7 5.5V21H5z" />
      </svg>
    </button>
  );
}

function SparkleIcon() {
  return (
    <span className="employer-sparkles" aria-hidden="true">
      <span>*</span>
      <span>*</span>
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

        <div className="candidate-avatar">
          {candidate.avatarUrl ? (
            <img src={candidate.avatarUrl} alt="" />
          ) : (
            <span>{getInitials(candidate.name)}</span>
          )}
        </div>
      </div>

      <div className="candidate-card-body">
        <p className="candidate-experience">{candidate.experience}</p>

        <div className="candidate-skill-row">
          {candidate.cardSkills.length === 0 ? (
            <span className="candidate-skill-pill">No skills listed</span>
          ) : (
            candidate.cardSkills.map((skill) => (
              <span className="candidate-skill-pill" key={skill}>
                {skill}
              </span>
            ))
          )}

          {candidate.extraSkills > 0 && (
            <span className="candidate-extra-skill">+ {candidate.extraSkills}</span>
          )}
        </div>

        <p className="candidate-meta">
          {candidate.location} <span>|</span> {candidate.educationLabel}
        </p>

        <p className="candidate-status">{candidate.status}</p>
      </div>
    </article>
  );
}

function FilterPanel({ filters, onChange, onApply, onReset }) {
  const selectedSkills = splitSkills(filters.skills);

  function updateFilter(name, value) {
    onChange({
      target: {
        name,
        value,
      },
    });
  }

  function toggleSkill(skill) {
    const nextSkills = selectedSkills.includes(skill)
      ? selectedSkills.filter((selectedSkill) => selectedSkill !== skill)
      : [...selectedSkills, skill];

    updateFilter("skills", nextSkills.join(", "));
  }

  return (
    <div className="employer-filter-panel">
      <div className="filter-row">
        <label>
          Experience
          <select
            name="minExperience"
            value={filters.minExperience}
            onChange={onChange}
          >
            <option value="">Years</option>
            <option value="1">1+ years</option>
            <option value="3">3+ years</option>
            <option value="5">5+ years</option>
          </select>
        </label>

        <label>
          Language spoken
          <select
            name="language"
            value={filters.language}
            onChange={onChange}
          >
            <option value="">Language</option>
            {LANGUAGE_OPTIONS.map((language) => (
              <option key={language} value={language}>
                {language}
              </option>
            ))}
          </select>
        </label>
      </div>

      <div className="filter-check-section">
        <p>Skills</p>

        {FILTER_SKILL_OPTIONS.map((skill) => (
          <label key={skill} className="filter-checkbox-row">
            <input
              type="checkbox"
              checked={selectedSkills.includes(skill)}
              onChange={() => toggleSkill(skill)}
            />
            <span>{skill}</span>
          </label>
        ))}
      </div>

      <div className="filter-check-section availability-section">
        <p>Availability</p>

        <label className="filter-checkbox-row">
          <input
            type="checkbox"
            checked={Boolean(filters.availability)}
            onChange={(event) =>
              updateFilter("availability", event.target.checked ? "ready" : "")
            }
          />
          <span>Ready to work</span>
        </label>
      </div>

      <div className="filter-actions">
        <button type="button" className="apply-filter-button" onClick={onApply}>
          Apply
        </button>
        <button type="button" className="clear-filter-button" onClick={onReset}>
          Reset
        </button>
      </div>
    </div>
  );
}

function RecommendationPanel({
  job,
  topK,
  maxTopK,
  isProMembership,
  onTopKChange,
  onClose,
  onShowRecommendations,
  onShowAll,
  onSubscribe,
}) {
  const minTopK = 1;
  const safeMaxTopK = Math.max(minTopK, maxTopK);
  const activeTopK = Math.min(Math.max(topK, minTopK), safeMaxTopK);
  const topKPosition =
    safeMaxTopK === minTopK
      ? 0
      : ((activeTopK - minTopK) / (safeMaxTopK - minTopK)) * 100;
  const showTopKValue = activeTopK > minTopK && activeTopK < safeMaxTopK;

  return (
    <div
      className={`recommendation-panel ${
        isProMembership ? "pro-recommendation-panel" : ""
      }`}
    >
      <button className="close-modal-button" onClick={onClose}>
        x
      </button>

      <p className="recommendation-title">Top-K recommendations</p>

      <div className="recommendation-job-summary">
        <span>Job posting</span>
        <strong>{job?.title || "No job posting found"}</strong>
      </div>

      <div className="recommendation-range">
        {showTopKValue && (
          <span
            className="range-current-value"
            style={{ left: `${topKPosition}%` }}
          >
            {activeTopK}
          </span>
        )}

        <input
          type="range"
          min={minTopK}
          max={safeMaxTopK}
          value={activeTopK}
          onChange={(event) => onTopKChange(Number(event.target.value))}
          className="recommendation-slider"
        />

        <div className="range-labels">
          <span>{minTopK}</span>
          <span>{isProMembership ? "All" : safeMaxTopK}</span>
        </div>
      </div>

      {!isProMembership && (
        <button className="membership-link" onClick={onSubscribe}>
          Subscribe to our membership to unlock more recommendations
        </button>
      )}

      <div className="recommendation-actions">
        <button
          type="button"
          className="apply-filter-button"
          onClick={() => onShowRecommendations(activeTopK)}
          disabled={!job}
        >
          Show candidates
        </button>

        <button type="button" className="clear-filter-button" onClick={onShowAll}>
          Show all
        </button>
      </div>
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
          x
        </button>

        <h2 id="membership-plans-title">Membership Plans</h2>

        <div className="membership-plan-grid">
          <article className="membership-plan-card">
            <h3>Standard</h3>
            <ul>
              <li>Create job postings</li>
              <li>View all candidate profiles</li>
              <li>Search and filter results</li>
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

function TrialConfirmationModal({ onClose, onViewProfile }) {
  return (
    <div
      className="employer-trial-backdrop"
      role="presentation"
      onClick={onClose}
    >
      <section
        className="employer-trial-modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="employer-trial-title"
        onClick={(event) => event.stopPropagation()}
      >
        <h2 id="employer-trial-title">Congratulations</h2>
        <p>Your Pro free trial is now active.</p>

        <div className="employer-trial-actions">
          <button type="button" onClick={onViewProfile}>
            View Profile
          </button>

          <button type="button" onClick={onClose}>
            Done
          </button>
        </div>
      </section>
    </div>
  );
}

function CandidateProfileModal({ candidate, onClose }) {
  if (!candidate) return null;

  const bioSections = parseBioSections(candidate.bio);
  const experience = parseWorkExperience(candidate.work_experience);
  const achievements = bioSections.achievements;

  return (
    <div className="profile-modal">
      <button className="close-profile-button" onClick={onClose}>
        x
      </button>

      <div className="profile-main-heading">
        <div>
          <h2>{candidate.name}</h2>
          <p>{candidate.role}</p>
        </div>

        <div className="profile-photo">
          {candidate.avatarUrl ? (
            <img src={candidate.avatarUrl} alt="" />
          ) : (
            <span>{getInitials(candidate.name)}</span>
          )}
        </div>
      </div>

      <div className="contact-box">
        <p className="contact-location">Location: {candidate.location}</p>
        <p className="contact-phone">
          Phone Number: {candidate.contact_phone || "Not provided"}
        </p>
        <p className="contact-email">
          Email: {candidate.contact_email || "Not provided"}
        </p>
      </div>

      <section className="profile-section">
        <h3>Professional Summary:</h3>
        <p>{bioSections.summary || "No professional summary provided."}</p>
      </section>

      <section className="profile-section">
        <h3>Experience:</h3>

        <div className="profile-info-box">
          <p>
            Job Title: <span>{experience.jobTitle || candidate.role || "-"}</span>
          </p>
          <p>
            Company Name: <span>{experience.companyName || "-"}</span>
          </p>
          <p>
            Start Date - End Date: <span>{experience.dateRange || "-"}</span>
          </p>
          <p>
            Job description:
            <br />
            <span>{experience.description || "No work experience provided."}</span>
          </p>
        </div>
      </section>

      <section className="profile-section">
        <h3>Education:</h3>

        <div className="profile-info-box">
          <p>
            Certification: <span>{candidate.educationLabel}</span>
          </p>
          <p>
            School Name: <span>{candidate.major || "Not specified"}</span>
          </p>
          <p>
            Start Date - End Date: <span>-</span>
          </p>
        </div>
      </section>

      <div className="profile-bottom-grid">
        <section>
          <h3>Achievements:</h3>
          <ul>
            {(achievements.length > 0
              ? achievements
              : ["No achievements listed"]
            ).map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </section>

        <section>
          <h3>Skills:</h3>
          <ul>
            {(candidate.allSkills.length > 0
              ? candidate.allSkills
              : ["No skills listed"]
            ).map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </section>
      </div>
    </div>
  );
}

export default function EmployerDashboard() {
  const navigate = useNavigate();

  const [allCandidates, setAllCandidates] = useState([]);
  const [visibleCandidates, setVisibleCandidates] = useState([]);
  const [jobs, setJobs] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [showFilter, setShowFilter] = useState(false);
  const [showRecommendations, setShowRecommendations] = useState(false);
  const [showMembershipPlans, setShowMembershipPlans] = useState(false);
  const [showTrialConfirmation, setShowTrialConfirmation] = useState(false);
  const [isProMembership, setIsProMembership] = useState(false);
  const [selectedCandidate, setSelectedCandidate] = useState(null);
  const [topK, setTopK] = useState(10);
  const [recommendedMode, setRecommendedMode] = useState(false);
  const [filters, setFilters] = useState({
    minExperience: "",
    education: "",
    language: "",
    skills: "",
    availability: "",
  });
  const [loading, setLoading] = useState(true);
  const [candidateSearching, setCandidateSearching] = useState(false);
  const [recommendationLoading, setRecommendationLoading] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  const loadEmployerData = useCallback(async () => {
    setLoading(true);
    setError("");

    try {
      const [candidateData, jobData, userData] = await Promise.all([
        getCandidates(),
        getMyJobPostings(),
        getCurrentUser(),
      ]);

      const normalizedCandidates = Array.isArray(candidateData)
        ? candidateData.map(normalizeCandidate)
        : [];

      setAllCandidates(normalizedCandidates);
      setVisibleCandidates(normalizedCandidates);
      setJobs(Array.isArray(jobData) ? jobData : []);
      setIsProMembership(Boolean(userData?.membership));
    } catch (err) {
      setError(err.message || "Failed to load employer dashboard.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const fetchTimer = window.setTimeout(() => {
      loadEmployerData();
    }, 0);

    return () => {
      window.clearTimeout(fetchTimer);
    };
  }, [loadEmployerData]);

  useEffect(() => {
    if (loading || recommendedMode) {
      return undefined;
    }

    const searchTimer = window.setTimeout(async () => {
      setCandidateSearching(true);
      setError("");

      try {
        const candidateData = await getCandidates({
          search: searchTerm.trim(),
          fuzzy: searchTerm.trim() ? "true" : "",
          education: filters.education,
          min_experience: filters.minExperience,
          skills: filters.skills,
        });
        const normalizedCandidates = Array.isArray(candidateData)
          ? candidateData.map(normalizeCandidate)
          : [];

        setAllCandidates(normalizedCandidates);
        setVisibleCandidates(normalizedCandidates);
      } catch (err) {
        setError(err.message || "Failed to search candidates.");
      } finally {
        setCandidateSearching(false);
      }
    }, 250);

    return () => {
      window.clearTimeout(searchTimer);
    };
  }, [filters, loading, recommendedMode, searchTerm]);

  const filteredCandidates = useMemo(() => {
    const lowerSearch = searchTerm.trim().toLowerCase();

    return visibleCandidates.filter((candidate) => {
      if (
        recommendedMode &&
        lowerSearch &&
        !candidate.searchText.includes(lowerSearch)
      ) {
        return false;
      }

      if (
        filters.minExperience &&
        Number(candidate.years_experience || 0) < Number(filters.minExperience)
      ) {
        return false;
      }

      if (filters.education && candidate.education !== filters.education) {
        return false;
      }

      if (
        filters.language &&
        !candidate.searchText.includes(filters.language.toLowerCase())
      ) {
        return false;
      }

      if (
        filters.skills &&
        !splitSkills(filters.skills).every((skill) =>
          candidate.skills?.toLowerCase().includes(skill.toLowerCase())
        )
      ) {
        return false;
      }

      if (filters.availability && candidate.status !== "Open to work") {
        return false;
      }

      return true;
    });
  }, [visibleCandidates, searchTerm, filters, recommendedMode]);

  const maxTopK = isProMembership
    ? Math.max(1, allCandidates.length)
    : Math.min(10, Math.max(1, allCandidates.length));
  const activeJob = jobs[0] || null;

  function handleFilterChange(event) {
    const { name, value } = event.target;
    setFilters((currentFilters) => ({
      ...currentFilters,
      [name]: value,
    }));
  }

  function resetFilters() {
    setFilters({
      minExperience: "",
      education: "",
      language: "",
      skills: "",
      availability: "",
    });
    setShowFilter(false);
  }

  async function showRecommendedCandidates(selectedTopK) {
    if (!activeJob) {
      setError("Create your job posting before viewing suitable candidates.");
      return;
    }

    setRecommendationLoading(true);
    setError("");
    setMessage("");

    try {
      const recs = await getRecommendedCandidates(activeJob.id);
      const normalizedCandidates = Array.isArray(recs)
        ? recs.map(normalizeCandidate)
        : [];
      setVisibleCandidates(normalizedCandidates.slice(0, selectedTopK));
      setRecommendedMode(true);
      setShowRecommendations(false);
      setMessage(`Showing suitable candidates for ${activeJob.title}.`);
    } catch (err) {
      setError(err.message || "Failed to load suitable candidates.");
    } finally {
      setRecommendationLoading(false);
    }
  }

  function showAllCandidates() {
    setVisibleCandidates(allCandidates);
    setRecommendedMode(false);
    setShowRecommendations(false);
    setMessage("");
  }

  async function handleStartTrial() {
    setError("");

    try {
      await startEmployerFreeTrial();
      setIsProMembership(true);
      setShowMembershipPlans(false);
      setShowTrialConfirmation(true);
    } catch (err) {
      setError(err.message || "Could not activate membership.");
    }
  }

  function handleLogout() {
    clearTokens();
    navigate("/login");
  }

  return (
    <main className="employer-dashboard-page">
      <header className="employer-header">
        <div className="employer-title-row">
          <h1>Hustle</h1>

          <div className="employer-header-actions">
            <ProfileIcon onClick={() => navigate("/profile/employer")} />
            <button
              type="button"
              className="employer-logout-button"
              onClick={handleLogout}
            >
              Logout
            </button>
          </div>
        </div>

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

        <section className="employer-active-job">
          <span>Active job posting</span>
          <strong>{activeJob?.title || "No job posting yet"}</strong>
          {activeJob && (
            <p>
              Recommendations are matched to this posting only. Each employer
              account can have one active job posting.
            </p>
          )}
        </section>

        {error && <p className="employer-error-text">{error}</p>}
        {message && <p className="employer-success-text">{message}</p>}
      </header>

      <section className="employer-results-heading">
        <h2>{recommendedMode ? "Suitable Candidates" : "All Candidates"}</h2>
        <p>
          {loading || recommendationLoading || candidateSearching
            ? "Loading..."
            : `${filteredCandidates.length} candidate${
                filteredCandidates.length === 1 ? "" : "s"
              }`}
        </p>
      </section>

      {loading ? (
        <p className="employer-loading-text">Loading candidates...</p>
      ) : filteredCandidates.length === 0 ? (
        <p className="employer-empty-text">No candidates found.</p>
      ) : (
        <section className="candidate-grid">
          {filteredCandidates.map((candidate) => (
            <CandidateCard
              key={candidate.id}
              candidate={candidate}
              isSelected={selectedCandidate?.id === candidate.id}
              onClick={setSelectedCandidate}
            />
          ))}
        </section>
      )}

      {showFilter && (
        <FilterPanel
          filters={filters}
          onChange={handleFilterChange}
          onApply={() => setShowFilter(false)}
          onReset={resetFilters}
        />
      )}

      {showRecommendations && (
        <RecommendationPanel
          job={activeJob}
          topK={topK}
          maxTopK={maxTopK}
          isProMembership={isProMembership}
          onTopKChange={setTopK}
          onClose={() => setShowRecommendations(false)}
          onShowRecommendations={showRecommendedCandidates}
          onShowAll={showAllCandidates}
          onSubscribe={() => setShowMembershipPlans(true)}
        />
      )}

      {showMembershipPlans && (
        <MembershipPlansModal
          onClose={() => setShowMembershipPlans(false)}
          onStartTrial={handleStartTrial}
        />
      )}

      {showTrialConfirmation && (
        <TrialConfirmationModal
          onClose={() => setShowTrialConfirmation(false)}
          onViewProfile={() => navigate("/profile/employer")}
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
