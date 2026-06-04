import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  getJobs,
  searchJobs,
  getRecommendedJobs,
  getMyApplications,
  startCandidateFreeTrial,
  getCurrentUser,
} from "../services/api";
import { clearTokens, isLoggedIn } from "../services/auth";
import "../styles/candidateDashboard.css";

const MIN_TOP_K = 1;
const STANDARD_MAX_TOP_K = 10;
const MIN_SALARY_RANGE = 10000;
const MAX_SALARY_RANGE = 1000000;
const SALARY_RANGE_STEP = 5000;

function displayWorkMode(value) {
  const labels = {
    REMOTE: "Remote",
    ONSITE: "On-site",
    HYBRID: "Hybrid",
  };
  return labels[value] || value || "Not specified";
}

function displayJobType(value) {
  const labels = {
    FULL_TIME: "Full-time",
    PART_TIME: "Part-time",
    CONTRACT: "Contract",
    INTERNSHIP: "Internship",
    CASUAL: "Casual",
  };
  return labels[value] || value || "Not specified";
}

function toJobTypeValue(value) {
  const values = {
    "Full-time": "FULL_TIME",
    "Part-time": "PART_TIME",
    Contract: "CONTRACT",
    Internship: "INTERNSHIP",
    Casual: "CASUAL",
  };
  return values[value] || value;
}

function toWorkModeValue(value) {
  const values = {
    Remote: "REMOTE",
    "On-site": "ONSITE",
    Hybrid: "HYBRID",
  };
  return values[value] || value;
}

function getJobSalary(job) {
  return job.salary_max ?? job.salary_min ?? 0;
}

function getJobSkills(job) {
  if (Array.isArray(job.required_skills)) {
    return job.required_skills;
  }

  if (typeof job.required_skills === "string") {
    return job.required_skills
      .split(",")
      .map((skill) => skill.trim())
      .filter(Boolean);
  }

  if (Array.isArray(job.skills)) {
    return job.skills;
  }

  return [];
}

function normalizeJob(job) {
  const skills = getJobSkills(job);

  return {
    ...job,
    company: job.company_name || job.company || "Unknown company",
    displayWorkMode: displayWorkMode(job.work_mode || job.workMode),
    displayJobType: displayJobType(job.employment_type || job.type),
    cardSkills: skills.slice(0, 3),
    extraSkills: Math.max(skills.length - 3, 0),
    searchableText: [
      job.title,
      job.company_name,
      job.company,
      job.location,
      job.description,
      skills.join(" "),
    ]
      .filter(Boolean)
      .join(" ")
      .toLowerCase(),
    salary: getJobSalary(job),
    posted: job.created_at
      ? `Posted ${new Date(job.created_at).toLocaleDateString()}`
      : "Recently posted",
  };
}

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
              <li>Search and filter results</li>
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

function CandidateDashboard() {
  const navigate = useNavigate();

  const [jobs, setJobs] = useState([]);
  const [recommendations, setRecommendations] = useState([]);
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searching, setSearching] = useState(false);
  const [error, setError] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [activeSearch, setActiveSearch] = useState("");
  const [showRecommendedPanel, setShowRecommendedPanel] = useState(false);
  const [useRecommendations, setUseRecommendations] = useState(false);
  const [topK, setTopK] = useState(10);
  const [appliedTopK, setAppliedTopK] = useState(10);
  const [showFilter, setShowFilter] = useState(false);
  const [showMembershipPlans, setShowMembershipPlans] = useState(false);
  const [showTrialConfirmation, setShowTrialConfirmation] = useState(false);
  const [isProUser, setIsProUser] = useState(false);

  const [selectedJobType, setSelectedJobType] = useState("All");
  const [selectedWorkMode, setSelectedWorkMode] = useState("All");
  const [selectedLanguage, setSelectedLanguage] = useState("All");
  const [salaryRange, setSalaryRange] = useState(MAX_SALARY_RANGE);
  const [draftJobType, setDraftJobType] = useState("All");
  const [draftWorkMode, setDraftWorkMode] = useState("All");
  const [draftLanguage, setDraftLanguage] = useState("All");
  const [draftSalaryRange, setDraftSalaryRange] = useState(MAX_SALARY_RANGE);
  const [filterPanelPosition, setFilterPanelPosition] = useState({
    left: 0,
    top: 0,
  });

  const filterPanelRef = useRef(null);
  const filterButtonRef = useRef(null);
  const recommendationPanelRef = useRef(null);
  const recommendationButtonRef = useRef(null);
  const minTopK = MIN_TOP_K;
  const standardMaxTopK = STANDARD_MAX_TOP_K;
  const minSalaryRange = MIN_SALARY_RANGE;
  const maxSalaryRange = MAX_SALARY_RANGE;
  const salaryRangeStep = SALARY_RANGE_STEP;
  const salaryRangePosition =
    ((draftSalaryRange - minSalaryRange) / (maxSalaryRange - minSalaryRange)) *
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
      filterPanelRef.current?.offsetWidth ||
      Math.min(430, window.innerWidth - 32);

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

  const fetchRecommendations = useCallback(async () => {
    try {
      const recs = await getRecommendedJobs();
      const recList = Array.isArray(recs) ? recs : [];
      setRecommendations(recList);
      setIsProUser(
        (currentValue) => currentValue || recList.length > STANDARD_MAX_TOP_K
      );
    } catch {
      setRecommendations([]);
    }
  }, []);

  const fetchAll = useCallback(async () => {
    setLoading(true);
    setError("");

    try {
      const [jobsData, appsData, userData] = await Promise.all([
        getJobs(),
        getMyApplications(),
        getCurrentUser(),
      ]);

      setJobs(Array.isArray(jobsData) ? jobsData : []);
      setApplications(Array.isArray(appsData) ? appsData : []);
      setIsProUser(Boolean(userData?.membership));
      await fetchRecommendations();
    } catch (err) {
      setError(err.message || "Failed to load data.");
    } finally {
      setLoading(false);
    }
  }, [fetchRecommendations]);

  useEffect(() => {
    if (!isLoggedIn()) {
      navigate("/login");
      return;
    }

    const fetchTimer = window.setTimeout(() => {
      fetchAll();
    }, 0);

    return () => {
      window.clearTimeout(fetchTimer);
    };
  }, [fetchAll, navigate]);

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

  const runJobSearch = useCallback(async (query) => {
    setSearching(true);
    setError("");

    try {
      const trimmedQuery = query.trim();

      if (!trimmedQuery) {
        const results = await getJobs();
        setJobs(Array.isArray(results) ? results : []);
        setActiveSearch("");
        return;
      }

      const results = await searchJobs(trimmedQuery, { fuzzy: "true" });
      setJobs(Array.isArray(results) ? results : []);
      setActiveSearch(trimmedQuery);
      setUseRecommendations(false);
    } catch (err) {
      setError(err.message || "Search failed.");
    } finally {
      setSearching(false);
    }
  }, []);

  useEffect(() => {
    if (loading) {
      return undefined;
    }

    const searchTimer = window.setTimeout(() => {
      if (useRecommendations) {
        setActiveSearch(searchTerm.trim());
        return;
      }

      runJobSearch(searchTerm);
    }, 250);

    return () => {
      window.clearTimeout(searchTimer);
    };
  }, [loading, runJobSearch, searchTerm, useRecommendations]);

  async function handleSearch(event) {
    event.preventDefault();
    await runJobSearch(searchTerm);
  }

  async function handleClearSearch() {
    setSearchTerm("");

    if (useRecommendations) {
      setActiveSearch("");
      return;
    }

    await runJobSearch("");
  }

  async function handleStartFreeTrial() {
    try {
      await startCandidateFreeTrial();
      setIsProUser(true);
      setShowMembershipPlans(false);
      setShowTrialConfirmation(true);
      await fetchRecommendations();
    } catch {
      navigate("/login");
    }
  }

  function handleApplyFilters() {
    setSelectedJobType(draftJobType);
    setSelectedWorkMode(draftWorkMode);
    setSelectedLanguage(draftLanguage);
    setSalaryRange(draftSalaryRange);
    setShowFilter(false);
  }

  function handleLogout() {
    clearTokens();
    navigate("/login");
  }

  const availableJobs = useMemo(() => {
    const sourceJobs = useRecommendations ? recommendations : jobs;

    return sourceJobs.map(normalizeJob).filter((job) => {
      if (
        useRecommendations &&
        activeSearch &&
        !job.searchableText.includes(activeSearch.toLowerCase())
      ) {
        return false;
      }

      if (selectedJobType !== "All") {
        const selectedType = toJobTypeValue(selectedJobType).toLowerCase();
        const jobType = (job.employment_type || job.type || "").toLowerCase();

        if (jobType !== selectedType) {
          return false;
        }
      }

      if (selectedWorkMode !== "All") {
        const selectedMode = toWorkModeValue(selectedWorkMode).toLowerCase();
        const workMode = (job.work_mode || job.workMode || "").toLowerCase();

        if (workMode !== selectedMode) {
          return false;
        }
      }

      if (selectedLanguage !== "All") {
        const language = (job.language || "").toLowerCase();

        if (language && language !== selectedLanguage.toLowerCase()) {
          return false;
        }
      }

      if (job.salary && job.salary > salaryRange) {
        return false;
      }

      return true;
    });
  }, [
    jobs,
    recommendations,
    useRecommendations,
    activeSearch,
    selectedJobType,
    selectedWorkMode,
    selectedLanguage,
    salaryRange,
  ]);

  const recommendationMaxTopK = Math.max(
    minTopK,
    Math.max(recommendations.length, availableJobs.length)
  );
  const maxTopK = isProUser
    ? recommendationMaxTopK
    : Math.min(standardMaxTopK, recommendationMaxTopK);
  const activeTopK = Math.min(Math.max(topK, minTopK), maxTopK);
  const activeAppliedTopK = Math.min(Math.max(appliedTopK, minTopK), maxTopK);
  const topKPosition =
    maxTopK === minTopK
      ? 0
      : ((activeTopK - minTopK) / (maxTopK - minTopK)) * 100;
  const showTopKValue = activeTopK > minTopK && activeTopK < maxTopK;
  const topKMaxLabel = isProUser ? "All" : maxTopK;
  const selectedTopKLabel =
    isProUser && activeTopK === maxTopK ? "All" : activeTopK;
  const filteredJobs = useRecommendations
    ? availableJobs.slice(0, activeAppliedTopK)
    : availableJobs;

  return (
    <main className="candidate-dashboard-page">
      <header className="candidate-dashboard-header">
        <h1>Hustle</h1>

        <div className="candidate-header-actions">
          <button
            className="profile-icon-button"
            type="button"
            aria-label="View profile"
            onClick={() => navigate("/profile/candidate")}
          >
            <span className="profile-head"></span>
            <span className="profile-body"></span>
          </button>

          <button
            type="button"
            className="candidate-logout-button"
            onClick={handleLogout}
          >
            Logout
          </button>
        </div>
      </header>

      {error && <p className="candidate-error-text">{error}</p>}

      <section className="candidate-toolbar">
        <form className="search-wrapper" onSubmit={handleSearch}>
          <span className="search-icon">Search</span>

          <input
            type="text"
            placeholder="Search"
            value={searchTerm}
            onChange={(event) => setSearchTerm(event.target.value)}
          />

          {activeSearch && (
            <button type="button" onClick={handleClearSearch}>
              Clear
            </button>
          )}
        </form>

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
          Filter
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
          Find recommended jobs
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
          onViewProfile={() => navigate("/profile/candidate")}
        />
      )}

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
                <option value="Internship">Internship</option>
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
              onChange={(event) =>
                setDraftSalaryRange(Number(event.target.value))
              }
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

      {loading ? (
        <p className="candidate-loading-text">Loading...</p>
      ) : (
        <>
          <section className="candidate-results-heading">
            <h2>
              {useRecommendations
                ? "Recommended Jobs"
                : activeSearch
                ? `Search Results for "${activeSearch}"`
                : "All Jobs"}
            </h2>
            <p>{searching ? "Searching..." : `${filteredJobs.length} jobs`}</p>
          </section>

          {filteredJobs.length === 0 ? (
            <p className="candidate-empty-text">
              {activeSearch
                ? `No jobs found for "${activeSearch}".`
                : "No jobs available."}
            </p>
          ) : (
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
                    {job.location || "Location not specified"}
                    <span>|</span>
                    {job.displayWorkMode}
                    <span>|</span>
                    {job.displayJobType}
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
          )}

          <section className="candidate-applications">
            <h2>My Applications</h2>

            {applications.length === 0 ? (
              <p className="candidate-empty-text">
                No applications yet. Select a job above to view details and
                apply.
              </p>
            ) : (
              <div className="applications-list">
                {applications.map((app) => (
                  <article key={app.id} className="application-card">
                    <div>
                      <h3>{app.job_title}</h3>
                      <p>
                        {app.company_name} | Applied{" "}
                        {new Date(app.applied_at).toLocaleDateString()}
                      </p>
                    </div>
                    <span className={`status-badge status-${app.status}`}>
                      {app.status}
                    </span>
                  </article>
                ))}
              </div>
            )}
          </section>
        </>
      )}
    </main>
  );
}

export default CandidateDashboard;
