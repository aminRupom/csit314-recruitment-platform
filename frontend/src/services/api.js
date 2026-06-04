import { apiGet, apiPost, apiPut, apiPatch, apiDelete, apiMultipart } from "./apiClient";
import { setTokens, clearTokens, getRefreshToken } from "./auth";

// ---------------------------------------------------------------------------
// Internal helpers
// ---------------------------------------------------------------------------

function mapWorkMode(uiValue) {
  const m = { Remote: "REMOTE", "On-Site": "ONSITE", Hybrid: "HYBRID" };
  return m[uiValue] || "REMOTE";
}

function mapDegreeToEducation(degree) {
  const d = (degree || "").toLowerCase();
  if (d.includes("phd") || d.includes("ph.d") || d.includes("doctor")) return "PHD";
  if (d.includes("master") || d.includes("mba")) return "MASTER";
  if (d.includes("diploma")) return "DIPLOMA";
  if (d.includes("high school") || d.includes("secondary")) return "HIGH_SCHOOL";
  return "BACHELOR";
}

function mapCandidateFormToProfile(f) {
  let work_experience = "";
  if (f.jobTitle || f.companyName) {
    work_experience += `${f.jobTitle || ""}${f.companyName ? " at " + f.companyName : ""}`;
    if (f.experienceDate) work_experience += ` (${f.experienceDate})`;
    if (f.responsibility) work_experience += `\n${f.responsibility}`;
  }

  let bio = f.professionalSummary || "";
  if (f.achievements && f.achievements.length > 0) {
    const achievementText = f.achievements.join(", ");
    bio = bio ? `${bio}\nAchievements: ${achievementText}` : `Achievements: ${achievementText}`;
  }

  return {
    full_name: f.fullName || "",
    contact_email: f.email || "",
    contact_phone: f.phoneNumber || "",
    education: mapDegreeToEducation(f.degree),
    major: f.major || "Not specified",
    years_experience: 0,
    skills: Array.isArray(f.skills) ? f.skills.join(", ") : (f.skills || ""),
    work_experience,
    bio,
    preferred_work_mode: f.workMode ? mapWorkMode(f.workMode) : "",
    preferred_location: f.preferredLocation || "",
  };
}

// ---------------------------------------------------------------------------
// Auth
// ---------------------------------------------------------------------------

export async function loginUser(loginData) {
  const data = await apiPost("/auth/login/", {
    username: loginData.email,
    password: loginData.password,
  });
  setTokens(data.access, data.refresh);
  const user = await apiGet("/auth/me/");
  return { success: true, user };
}

export async function logoutUser() {
  const refresh = getRefreshToken();
  try {
    await apiPost("/auth/logout/", { refresh });
  } catch {
    // proceed regardless
  }
  clearTokens();
}

export async function registerCandidate(payload) {
  const username = payload.email;
  const regData = await apiPost("/auth/register/", {
    username,
    email: payload.email,
    password: payload.password,
    role: "CANDIDATE",
  });
  setTokens(regData.access, regData.refresh);

  const profileData = mapCandidateFormToProfile(payload);
  try {
    await apiPost("/candidate/profile/", profileData);
  } catch {
    // profile creation best-effort; user can fill it in later
  }

  return { success: true };
}

export async function registerEmployer(payload) {
  const username = payload.email;
  const regData = await apiPost("/auth/register/", {
    username,
    email: payload.email,
    password: payload.password,
    role: "EMPLOYER",
  });
  setTokens(regData.access, regData.refresh);
  return { success: true };
}

export async function getCurrentUser() {
  return apiGet("/auth/me/");
}

// ---------------------------------------------------------------------------
// Candidate profile
// ---------------------------------------------------------------------------

export async function getLoggedInCandidateProfile() {
  return apiGet("/candidate/profile/");
}

export async function updateLoggedInCandidateProfile(profileData) {
  return apiPut("/candidate/profile/", profileData);
}

export async function uploadResume(file) {
  const fd = new FormData();
  fd.append("resume", file);
  return apiMultipart("/candidate/profile/upload-resume/", fd);
}

// ---------------------------------------------------------------------------
// Membership
// ---------------------------------------------------------------------------

export async function startCandidateFreeTrial() {
  return apiPost("/auth/upgrade-membership/", {});
}

export async function startEmployerFreeTrial() {
  return apiPost("/auth/upgrade-membership/", {});
}

export async function getEmployerMembership() {
  const user = await apiGet("/auth/me/");
  return user.membership;
}

// ---------------------------------------------------------------------------
// Jobs (public browse)
// ---------------------------------------------------------------------------

export async function getJobs() {
  return apiGet("/jobs/");
}

export async function searchJobs(query, options = {}) {
  const params = new URLSearchParams();
  params.set("search", query);

  Object.entries(options).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== "") {
      params.set(key, value);
    }
  });

  return apiGet(`/jobs/?${params.toString()}`);
}

export async function getJobById(id) {
  return apiGet(`/jobs/${id}/`);
}

export async function getRecommendedJobs() {
  return apiGet("/recommendations/jobs/");
}

export async function getRecommendedCandidates(jobId) {
  return apiGet(`/recommendations/candidates/${jobId}/`);
}

export async function getCandidates(params = {}) {
  const query = new URLSearchParams();

  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== "") {
      query.set(key, value);
    }
  });

  const suffix = query.toString() ? `?${query.toString()}` : "";
  return apiGet(`/candidates/${suffix}`);
}

// ---------------------------------------------------------------------------
// Applications
// ---------------------------------------------------------------------------

export async function applyToJob(jobId, coverMessage = "") {
  return apiPost(`/jobs/${jobId}/apply/`, { cover_message: coverMessage });
}

export async function getMyApplications() {
  return apiGet("/candidate/applications/");
}

export async function getApplicantsForMyJobs() {
  return apiGet("/employer/applications/");
}

export async function updateApplicationStatus(id, status) {
  return apiPatch(`/employer/applications/${id}/`, { status });
}

// ---------------------------------------------------------------------------
// Employer job CRUD
// ---------------------------------------------------------------------------

export async function createJobPosting(payload) {
  return apiPost("/employer/jobs/", payload);
}

export async function getMyJobPostings() {
  return apiGet("/employer/jobs/");
}

export async function updateJobPosting(id, payload) {
  return apiPut(`/employer/jobs/${id}/`, payload);
}

export async function deleteJobPosting(id) {
  return apiDelete(`/employer/jobs/${id}/`);
}
