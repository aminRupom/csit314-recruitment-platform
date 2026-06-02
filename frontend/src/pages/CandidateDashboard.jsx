import { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { jobs } from "../data/jobs";
import "../styles/candidateDashboard.css";
// import { candidateProfile } from "../data/candidateProfile";
import {
  getLoggedInCandidateProfile,
  startCandidateFreeTrial,
} from "../services/api";
import { calculateJobMatchScore } from "../utils/recommendJobs";


function MembershipPlansModal({ onClose, onStartTrial }) {
  return (
    <div
      className="candidate-membership-backdrop"
      role="presentation"
      onClick={onClose}
    >
      <section
        className="candidate-membership-modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="candidate-membership-title"
        onClick={(event) => event.stopPropagation()}
      >
        <h2 id="candidate-membership-title">Membership Plans</h2>

        <div className="candidate-membership-grid">
          <article className="candidate-membership-card">
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

          <article className="candidate-membership-card">
            <h3>Pro</h3>

            <ul>
              <li>All Standard features</li>
              <li>Unlimited AI-driven recommendations</li>
            </ul>

            <button
              type="button"
              className="candidate-free-trial-button"
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
      className="candidate-trial-backdrop"
      role="presentation"
      onClick={onClose}
    >
      <section
        className="candidate-trial-modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="candidate-trial-title"
        onClick={(event) => event.stopPropagation()}
      >
        <h2 id="candidate-trial-title">Congratulations</h2>
        <p>Your Pro free trial is now active.</p>

        <div className="candidate-trial-actions">
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


// const jobs = [
//   {
//     id: 1,
//     title: "Software Engineer",
//     company: "Google",
//     location: "Sydney, NSW",
//     workMode: "Hybrid",
//     type: "Full-time",
//     language: "English",
//     salary: 68000,
//     skills: ["Python", "AWS", "Figma"],
//     extraSkills: 2,
//     posted: "Posted 2 days ago",
//     recommendedScore: 95,
//   },
//   {
//     id: 2,
//     title: "Developer",
//     company: "Google",
//     location: "Bondi, NSW",
//     workMode: "Remote",
//     type: "Part-time",
//     language: "English",
//     salary: 52000,
//     skills: ["Java", "AWS", "Python"],
//     extraSkills: 3,
//     posted: "Posted 5 days ago",
//     recommendedScore: 91,
//   },
//   {
//     id: 3,
//     title: "Barista",
//     company: "Cafe Coco",
//     location: "Kiama, NSW",
//     workMode: "On-site",
//     type: "Full-time",
//     language: "English",
//     salary: 43000,
//     skills: ["Social", "Food safety"],
//     extraSkills: 1,
//     posted: "Posted 1 month ago",
//     recommendedScore: 64,
//   },
//   {
//     id: 4,
//     title: "Teacher",
//     company: "Wollongong Elementary",
//     location: "Wollongong, NSW",
//     workMode: "On-Site",
//     type: "Full-time",
//     language: "English",
//     salary: 55000,
//     skills: ["Speaking", "Maths", "Primary Ed"],
//     extraSkills: 0,
//     posted: "Posted 7 days ago",
//     recommendedScore: 70,
//   },
//   {
//     id: 5,
//     title: "Cashier",
//     company: "Coles",
//     location: "Perth, WA",
//     workMode: "On-site",
//     type: "Casual",
//     language: "English",
//     salary: 45000,
//     skills: ["POS", "Social", "Fast-paced"],
//     extraSkills: 2,
//     posted: "Posted 1 day ago",
//     recommendedScore: 72,
//   },
//   {
//     id: 6,
//     title: "Salesperson",
//     company: "Calvin Klein",
//     location: "Sydney, NSW",
//     workMode: "Remote",
//     type: "Contract",
//     language: "English",
//     salary: 50000,
//     skills: ["Retail", "POS", "Stocks"],
//     extraSkills: 4,
//     posted: "Posted 2 weeks ago",
//     recommendedScore: 78,
//   },
// ];

function CandidateDashboard() {

  const candidateProfile = getLoggedInCandidateProfile();
  const navigate = useNavigate();

//   const [searchTerm, setSearchTerm] = useState("");
//   const [showRecommended, setShowRecommended] = useState(false);
//   const [showFilter, setShowFilter] = useState(false);
//   const [selectedWorkMode, setSelectedWorkMode] = useState("All");

    // const [searchTerm, setSearchTerm] = useState("");
    // const [showRecommended, setShowRecommended] = useState(false);
    // const [showFilter, setShowFilter] = useState(false);

    const [searchTerm, setSearchTerm] = useState("");
    const [showRecommendedPanel, setShowRecommendedPanel] = useState(false);
    const [useRecommendations, setUseRecommendations] = useState(false);
    const [topK, setTopK] = useState(10);
    const [appliedTopK, setAppliedTopK] = useState(10);
    const [showFilter, setShowFilter] = useState(false);
    const [showMembershipPlans, setShowMembershipPlans] = useState(false);
    const [showTrialConfirmation, setShowTrialConfirmation] = useState(false);

    const [selectedJobType, setSelectedJobType] = useState("All");
    const [selectedWorkMode, setSelectedWorkMode] = useState("All");
    const [selectedLanguage, setSelectedLanguage] = useState("All");
    const [salaryRange, setSalaryRange] = useState(70000);
    const [draftJobType, setDraftJobType] = useState("All");
    const [draftWorkMode, setDraftWorkMode] = useState("All");
    const [draftLanguage, setDraftLanguage] = useState("All");
    const [draftSalaryRange, setDraftSalaryRange] = useState(70000);
    const [filterPanelPosition, setFilterPanelPosition] = useState({
      left: 0,
      top: 0,
    });
    const filterPanelRef = useRef(null);
    const filterButtonRef = useRef(null);
    const recommendationPanelRef = useRef(null);
    const recommendationButtonRef = useRef(null);
    const isProUser = Boolean(candidateProfile?.isProUser);
    const minTopK = 1;
    const standardMaxTopK = 10;
    const minSalaryRange = 30000;
    const maxSalaryRange = 70000;
    const salaryRangeStep = 5000;
    const salaryRangePosition =
      ((draftSalaryRange - minSalaryRange) /
        (maxSalaryRange - minSalaryRange)) *
      100;
    const salaryRangeTransform =
      salaryRangePosition <= 5
        ? "translateX(0)"
        : salaryRangePosition >= 95
        ? "translateX(-100%)"
        : "translateX(-50%)";

  function getFilterPanelPosition() {
    const buttonBounds = filterButtonRef.current?.getBoundingClientRect();
    const panelWidth =
      filterPanelRef.current?.offsetWidth || Math.min(430, window.innerWidth - 32);

    if (!buttonBounds) {
      return {
        left: 16,
        top: 0,
      };
    }

    return {
      left: Math.min(
        Math.max(16, buttonBounds.left),
        Math.max(16, window.innerWidth - panelWidth - 16)
      ),
      top: buttonBounds.bottom + 6,
    };
  }

  useEffect(() => {
    if (!showRecommendedPanel) {
      return undefined;
    }

    const closeRecommendationPanel = (event) => {
      const clickedInsidePanel = recommendationPanelRef.current?.contains(
        event.target
      );
      const clickedRecommendationButton =
        recommendationButtonRef.current?.contains(event.target);

      if (!clickedInsidePanel && !clickedRecommendationButton) {
        setShowRecommendedPanel(false);
      }
    };

    document.addEventListener("mousedown", closeRecommendationPanel);

    return () => {
      document.removeEventListener("mousedown", closeRecommendationPanel);
    };
  }, [showRecommendedPanel]);

  useEffect(() => {
    if (!showFilter) {
      return undefined;
    }

    const updateFilterPanelPosition = () => {
      setFilterPanelPosition(getFilterPanelPosition());
    };

    const closeFilterPanel = (event) => {
      const clickedInsidePanel = filterPanelRef.current?.contains(event.target);
      const clickedFilterButton = filterButtonRef.current?.contains(
        event.target
      );

      if (!clickedInsidePanel && !clickedFilterButton) {
        setShowFilter(false);
      }
    };

    updateFilterPanelPosition();
    document.addEventListener("mousedown", closeFilterPanel);
    window.addEventListener("resize", updateFilterPanelPosition);
    window.addEventListener("scroll", updateFilterPanelPosition, true);

    return () => {
      document.removeEventListener("mousedown", closeFilterPanel);
      window.removeEventListener("resize", updateFilterPanelPosition);
      window.removeEventListener("scroll", updateFilterPanelPosition, true);
    };
  }, [showFilter]);

  function handleStartFreeTrial() {
    const result = startCandidateFreeTrial();

    if (result.success) {
      setShowMembershipPlans(false);
      setShowTrialConfirmation(true);
      return;
    }

    navigate("/login");
  }

  function handleApplyFilters() {
    setSelectedJobType(draftJobType);
    setSelectedWorkMode(draftWorkMode);
    setSelectedLanguage(draftLanguage);
    setSalaryRange(draftSalaryRange);
    setShowFilter(false);
  }

  const availableRecommendedJobs = useMemo(() => {
  let result = jobs.map((job) => ({
  ...job,
  matchScore: candidateProfile
  ? calculateJobMatchScore(job, candidateProfile)
  : 0,
}));

    if (searchTerm.trim()) {
      const lowerSearch = searchTerm.toLowerCase();

      result = result.filter((job) => {
        return (
          job.title.toLowerCase().includes(lowerSearch) ||
          job.company.toLowerCase().includes(lowerSearch) ||
          job.location.toLowerCase().includes(lowerSearch) ||
          job.skills.join(" ").toLowerCase().includes(lowerSearch)
        );
      });
    }

    // if (selectedWorkMode !== "All") {
    //   result = result.filter(
    //     (job) => job.workMode.toLowerCase() === selectedWorkMode.toLowerCase()
    //   );
    // }

    if (selectedJobType !== "All") {
      result = result.filter(
        (job) => job.type.toLowerCase() === selectedJobType.toLowerCase()
      );
    }
    
    if (selectedWorkMode !== "All") {
      result = result.filter(
        (job) => job.workMode.toLowerCase() === selectedWorkMode.toLowerCase()
      );
    }
    
    if (selectedLanguage !== "All") {
      result = result.filter(
        (job) => job.language.toLowerCase() === selectedLanguage.toLowerCase()
      );
    }

result = result.filter((job) => job.salary <= salaryRange);

    return result;
  }, [
  searchTerm,
  selectedJobType,
  selectedWorkMode,
  selectedLanguage,
  salaryRange,
  candidateProfile,
]);

  const recommendationMaxTopK = Math.max(minTopK, availableRecommendedJobs.length);
  const maxTopK = isProUser
    ? recommendationMaxTopK
    : Math.min(standardMaxTopK, recommendationMaxTopK);
  const activeTopK = Math.min(Math.max(topK, minTopK), maxTopK);
  const activeAppliedTopK = Math.min(
    Math.max(appliedTopK, minTopK),
    maxTopK
  );
  const topKPosition =
    maxTopK === minTopK
      ? 0
      : ((activeTopK - minTopK) / (maxTopK - minTopK)) * 100;
  const showTopKValue = activeTopK > minTopK && activeTopK < maxTopK;
  const topKMaxLabel = isProUser ? "All" : maxTopK;
  const selectedTopKLabel =
    isProUser && activeTopK === maxTopK ? "All" : activeTopK;

  const filteredJobs = useMemo(() => {
    if (!useRecommendations) {
      return availableRecommendedJobs;
    }

    return [...availableRecommendedJobs]
      .sort((a, b) => b.matchScore - a.matchScore)
      .slice(0, activeAppliedTopK);
  }, [
  availableRecommendedJobs,
  useRecommendations,
  activeAppliedTopK,
]);

  return (
    <main className="candidate-dashboard-page">
      <header className="candidate-dashboard-header">
        <h1>Hustle</h1>

        <button
  className="profile-icon-button"
  type="button"
  onClick={() => navigate("/candidate-profile")}
>
          <span className="profile-head"></span>
          <span className="profile-body"></span>
        </button>
      </header>

      <section className="candidate-toolbar">
        <div className="search-wrapper">
          <span className="search-icon">⌕</span>

          <input
            type="text"
            placeholder="Search"
            value={searchTerm}
            onChange={(event) => setSearchTerm(event.target.value)}
          />
        </div>

        <button
          type="button"
          ref={filterButtonRef}
          className="filter-button"
          onClick={() => {
            if (!showFilter) {
              setDraftJobType(selectedJobType);
              setDraftWorkMode(selectedWorkMode);
              setDraftLanguage(selectedLanguage);
              setDraftSalaryRange(salaryRange);
              setFilterPanelPosition(getFilterPanelPosition());
            }

            setShowFilter(!showFilter);
          }}
        >
          <span>▽</span>
        </button>

        <button
  type="button"
  ref={recommendationButtonRef}
  className={`recommended-button ${
    useRecommendations ? "recommended-active" : ""
  }`}
  onClick={() => {
    setShowRecommendedPanel(!showRecommendedPanel);
  }}
>
  Find recommended jobs ✦
</button>
      </section>

      {showRecommendedPanel && (
  <section className="recommended-panel" ref={recommendationPanelRef}>
    <p className="recommended-title">Top-K recommendations</p>

    <div className="topk-slider-area">
      {showTopKValue && (
        <span
          className="topk-current-value"
          style={{ left: `${topKPosition}%` }}
        >
          {selectedTopKLabel}
        </span>
      )}

      <div className="topk-range-labels">
        <span>{minTopK}</span>
        <span>{topKMaxLabel}</span>
      </div>

      <input
        type="range"
        min={minTopK}
        max={maxTopK}
        value={activeTopK}
        onChange={(event) => setTopK(Number(event.target.value))}
      />
    </div>

    <div className="recommendation-actions">
      <button
        type="button"
        className="apply-recommendation-button"
        onClick={() => {
          setAppliedTopK(activeTopK);
          setUseRecommendations(true);
          setShowRecommendedPanel(false);
        }}
      >
        Show selected jobs
      </button>

      <button
        type="button"
        className="clear-recommendation-button"
        onClick={() => {
          setUseRecommendations(false);
          setShowRecommendedPanel(false);
        }}
      >
        Show all jobs
      </button>
    </div>

    {!isProUser && (
      <button
        type="button"
        className="membership-link"
        onClick={() => setShowMembershipPlans(true)}
      >
        Subscribe to our membership to unlock more recommendations
      </button>
    )}
  </section>
)}

      {showMembershipPlans && (
        <MembershipPlansModal
          onClose={() => setShowMembershipPlans(false)}
          onStartTrial={handleStartFreeTrial}
        />
      )}

      {showTrialConfirmation && (
        <TrialConfirmationModal
          onClose={() => setShowTrialConfirmation(false)}
          onViewProfile={() => navigate("/candidate-profile")}
        />
      )}

      {/* {showFilter && (
        <section className="filter-panel">
          <button
            type="button"
            className={selectedWorkMode === "All" ? "active-filter" : ""}
            onClick={() => setSelectedWorkMode("All")}
          >
            All
          </button>

          <button
            type="button"
            className={selectedWorkMode === "Remote" ? "active-filter" : ""}
            onClick={() => setSelectedWorkMode("Remote")}
          >
            Remote
          </button>

          <button
            type="button"
            className={selectedWorkMode === "Hybrid" ? "active-filter" : ""}
            onClick={() => setSelectedWorkMode("Hybrid")}
          >
            Hybrid
          </button>

          <button
            type="button"
            className={selectedWorkMode === "On-site" ? "active-filter" : ""}
            onClick={() => setSelectedWorkMode("On-site")}
          >
            On-site
          </button>
        </section>
      )} */}

      {showFilter && (
  <section
    className="filter-panel"
    ref={filterPanelRef}
    style={{
      left: `${filterPanelPosition.left}px`,
      top: `${filterPanelPosition.top}px`,
    }}
  >
    <div className="filter-grid">
      <div className="filter-field">
        <label>Job Type</label>
        <select
          value={draftJobType}
          onChange={(event) => setDraftJobType(event.target.value)}
        >
          <option value="All">Type...</option>
          <option value="Full-time">Full-time</option>
          <option value="Part-time">Part-time</option>
          <option value="Contract">Contract</option>
          <option value="Casual">Casual</option>
        </select>
      </div>

      <div className="filter-field">
        <label>Work Mode</label>
        <select
          value={draftWorkMode}
          onChange={(event) => setDraftWorkMode(event.target.value)}
        >
          <option value="All">Mode...</option>
          <option value="Remote">Remote</option>
          <option value="Hybrid">Hybrid</option>
          <option value="On-site">On-site</option>
        </select>
      </div>

      <div className="filter-field">
        <label>Job Language</label>
        <select
  value={draftLanguage}
  onChange={(event) => setDraftLanguage(event.target.value)}
>
  <option value="All">Language</option>
  <option value="English">English</option>
  <option value="Chinese">Chinese</option>
  <option value="Hindi">Hindi</option>
  <option value="Arabic">Arabic</option>
  <option value="Spanish">Spanish</option>
  <option value="French">French</option>
</select>
      </div>
    </div>

    <div className="salary-filter">
      <label>Salary Range (Year)</label>

      <div className="salary-labels">
        <span>${minSalaryRange.toLocaleString()}</span>
        {draftSalaryRange !== minSalaryRange && (
          <span
            className="salary-current-value"
            style={{
              left: `${salaryRangePosition}%`,
              transform: salaryRangeTransform,
            }}
          >
            ${draftSalaryRange.toLocaleString()}
          </span>
        )}
      </div>

      <input
        type="range"
        min={minSalaryRange}
        max={maxSalaryRange}
        step={salaryRangeStep}
        value={draftSalaryRange}
        onChange={(event) => setDraftSalaryRange(Number(event.target.value))}
      />
    </div>

    <button
      type="button"
      className="apply-filter-button"
      onClick={handleApplyFilters}
    >
      Apply
    </button>
  </section>
)}

      <section className="jobs-grid">
        {filteredJobs.map((job) => (
          <article
          key={job.id}
          className="job-card"
          onClick={() => navigate(`/jobs/${job.id}`)}
        >
            <div className="job-card-header">
              <h2>{job.title}</h2>
              <p>{job.company}</p>
            </div>

            <p className="job-meta">
              {job.location} <span>•</span> {job.workMode} <span>•</span>{" "}
              {job.type}
            </p>

            <div className="job-skills">
              {job.cardSkills.map((skill) => (
  <span key={skill}>{skill}</span>
))}

              {job.extraSkills > 0 && <span>+ {job.extraSkills}</span>}
            </div>

            <p className="posted-date">{job.posted}</p>
          </article>
        ))}
      </section>
    </main>
  );
}

export default CandidateDashboard;
