import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { jobs } from "../data/jobs";
import "../styles/candidateDashboard.css";
// import { candidateProfile } from "../data/candidateProfile";
import { getLoggedInCandidateProfile } from "../services/api";
import { calculateJobMatchScore } from "../utils/recommendJobs";



function calculateMatchScore(job) {
  let score = 0;

  const candidateSkills = candidateProfile.skills.map((skill) =>
    skill.toLowerCase()
  );

  const jobSkills = job.skills.map((skill) => skill.toLowerCase());

  jobSkills.forEach((skill) => {
    if (candidateSkills.includes(skill)) {
      score += 25;
    }
  });

  if (
    job.workMode.toLowerCase() ===
    candidateProfile.preferredWorkMode.toLowerCase()
  ) {
    score += 15;
  }

  if (
    job.location.toLowerCase().includes(
      candidateProfile.preferredLocation.toLowerCase()
    )
  ) {
    score += 15;
  }

  const candidateLanguages = candidateProfile.spokenLanguages.map((language) =>
  language.toLowerCase()
);

if (candidateLanguages.includes(job.language.toLowerCase())) {
  score += 10;
}

  return score;
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
    const [showFilter, setShowFilter] = useState(false);

    const [selectedJobType, setSelectedJobType] = useState("All");
    const [selectedWorkMode, setSelectedWorkMode] = useState("All");
    const [selectedLanguage, setSelectedLanguage] = useState("All");
    const [salaryRange, setSalaryRange] = useState(70000);

  const filteredJobs = useMemo(() => {
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

    if (useRecommendations) {
  result.sort((a, b) => b.matchScore - a.matchScore);
  result = result.slice(0, topK);
}

    return result;
  }, [
  searchTerm,
  selectedJobType,
  selectedWorkMode,
  selectedLanguage,
  salaryRange,
  useRecommendations,
  topK,
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
          className="filter-button"
          onClick={() => setShowFilter(!showFilter)}
        >
          <span>▽</span>
        </button>

        <button
  type="button"
  className={`recommended-button ${
    useRecommendations ? "recommended-active" : ""
  }`}
  onClick={() => {
    setShowRecommendedPanel(!showRecommendedPanel);
    setUseRecommendations(true);
  }}
>
  Find recommended jobs ✦
</button>
      </section>

      {showRecommendedPanel && (
  <section className="recommended-panel">
    <p className="recommended-title">Top-K recommendations</p>

    <div className="topk-slider-area">
      <div className="topk-values">
        <span>1</span>
        <span>{topK}</span>
        <span>10</span>
      </div>

      <input
        type="range"
        min="1"
        max="10"
        value={topK}
        onChange={(event) => {
          setTopK(Number(event.target.value));
          setUseRecommendations(true);
        }}
      />
    </div>

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

    <a href="#" className="membership-link">
      Subscribe to our membership to unlock more recommendations
    </a>
  </section>
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
  <section className="filter-panel">
    <div className="filter-grid">
      <div className="filter-field">
        <label>Job Type</label>
        <select
          value={selectedJobType}
          onChange={(event) => setSelectedJobType(event.target.value)}
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
          value={selectedWorkMode}
          onChange={(event) => setSelectedWorkMode(event.target.value)}
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
  value={selectedLanguage}
  onChange={(event) => setSelectedLanguage(event.target.value)}
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
        <span>$30,000</span>
        <span>${salaryRange.toLocaleString()}</span>
      </div>

      <input
        type="range"
        min="30000"
        max="70000"
        step="5000"
        value={salaryRange}
        onChange={(event) => setSalaryRange(Number(event.target.value))}
      />
    </div>

    <button
      type="button"
      className="apply-filter-button"
      onClick={() => setShowFilter(false)}
    >
      Apply
    </button>
  </section>
)}

      <section className="jobs-grid">
        {filteredJobs.map((job, index) => (
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