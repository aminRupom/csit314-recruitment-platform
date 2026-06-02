// This file keeps frontend/backend communication in one place.
// For now, it uses dummy logic.
// Later, your backend teammate can replace this with real API calls.
import { candidateProfiles } from "../data/candidateProfiles";

// export async function loginUser(loginData) {
//   console.log("Login data submitted:", loginData);

//   if (loginData.email && loginData.password) {
//     return {
//       success: true,
//       message: "Login successful.",
//       user: {
//         email: loginData.email,
//         role: loginData.role,
//       },
//     };
//   }


//   return {
//     success: false,
//     message: "Invalid email or password.",
//   };
// }

const CANDIDATE_PROFILES_KEY = "hustleCandidateProfiles";
const LOGGED_IN_USER_KEY = "hustleLoggedInUser";
const EMPLOYER_MEMBERSHIP_KEY = "hustleEmployerMembership";

function saveCandidateProfilesToStorage(profiles) {
  localStorage.setItem(CANDIDATE_PROFILES_KEY, JSON.stringify(profiles));
}

function getCandidateProfilesFromStorage() {
  const storedProfiles = localStorage.getItem(CANDIDATE_PROFILES_KEY);

  if (storedProfiles) {
    return JSON.parse(storedProfiles);
  }

  saveCandidateProfilesToStorage(candidateProfiles);

  return candidateProfiles;
}

function getNextCandidateId(profiles) {
  return profiles.reduce((maxId, profile) => {
    return Math.max(maxId, Number(profile.id) || 0);
  }, 0) + 1;
}

function cleanList(items) {
  if (!Array.isArray(items)) {
    return [];
  }

  return [
    ...new Set(items.map((item) => String(item ?? "").trim()).filter(Boolean)),
  ];
}

function compactValues(values) {
  return values.map((value) => String(value ?? "").trim()).filter(Boolean);
}

function normalizeWorkMode(workMode) {
  if (workMode === "On-Site") {
    return "On-site";
  }

  return workMode || "Remote";
}

function buildCandidateLocation(candidateData) {
  const cityState = compactValues([candidateData.city, candidateData.state]).join(
    ", "
  );

  return (
    cityState ||
    candidateData.preferredLocation?.trim() ||
    candidateData.address1?.trim() ||
    "Location not specified"
  );
}

function buildCandidateAddress(candidateData) {
  return compactValues([
    candidateData.address1,
    candidateData.address2,
    candidateData.city,
    candidateData.state,
    candidateData.postcode,
  ]).join(", ");
}

function buildExperienceEntries(experiences) {
  const entries = Array.isArray(experiences) ? experiences : [];

  return entries.map((experience, index) => ({
    id: experience.id || Date.now() + index,
    jobTitle: experience.jobTitle?.trim() || "",
    companyName: experience.companyName?.trim() || "",
    startEndDate:
      experience.experienceDate?.trim() ||
      experience.startEndDate?.trim() ||
      "",
    jobDescription:
      experience.responsibility?.trim() ||
      experience.jobDescription?.trim() ||
      "",
  }));
}

function buildEducationEntries(educations) {
  const entries = Array.isArray(educations) ? educations : [];

  return entries.map((education, index) => ({
    id: education.id || Date.now() + index,
    certification:
      compactValues([education.degree, education.major]).join(" - ") ||
      education.certification?.trim() ||
      "",
    schoolName: education.schoolName?.trim() || "",
    startEndDate:
      education.educationDate?.trim() || education.startEndDate?.trim() || "",
  }));
}

function createCandidateProfile(candidateData, id) {
  const location = buildCandidateLocation(candidateData);
  const experience = buildExperienceEntries(candidateData.experiences);
  const education = buildEducationEntries(candidateData.educations);
  const careerInterests = cleanList([
    candidateData.jobTitle,
    ...experience.map((entry) => entry.jobTitle),
  ]);

  return {
    id,
    fullName: candidateData.fullName.trim(),
    location,
    dateOfBirth: candidateData.dateOfBirth || "",
    email: candidateData.email.trim(),
    password: candidateData.password || "",
    phoneNumber: candidateData.phoneNumber.trim(),
    address: buildCandidateAddress(candidateData),
    preferredWorkMode: normalizeWorkMode(candidateData.workMode),
    preferredLocation: candidateData.preferredLocation?.trim() || location,
    availability: candidateData.readyNow
      ? "Ready to work now"
      : "Available in 2 weeks",
    professionalSummary: candidateData.professionalSummary?.trim() || "",
    skills: cleanList(candidateData.skills),
    spokenLanguages: ["English"],
    educationLevel:
      education.find((entry) => entry.certification)?.certification ||
      "Not specified",
    yearsOfExperience: "0-1 Years",
    careerInterests,
    experience,
    education,
    achievements: cleanList(candidateData.achievements),
    isProUser: false,
    membershipPlan: "Standard",
    membershipStatus: "Standard user",
    resumeFileName: candidateData.resume?.name || "",
    profilePhotoFileName: candidateData.profilePhoto?.name || "",
  };
}

export function getLoggedInCandidateProfile() {
  const loggedInUser = localStorage.getItem(LOGGED_IN_USER_KEY);

  if (!loggedInUser) {
    return null;
  }

  const parsedUser = JSON.parse(loggedInUser);
  const profiles = getCandidateProfilesFromStorage();

  return profiles.find((profile) => profile.id === parsedUser.id) || null;
}

//logout
export function logoutUser() {
  localStorage.removeItem("hustleLoggedInUser");

  return {
    success: true,
    message: "Logged out successfully.",
  };
}

export function updateLoggedInCandidateProfile(updatedProfile) {
  const profiles = getCandidateProfilesFromStorage();

  const updatedProfiles = profiles.map((profile) => {
    if (profile.id === updatedProfile.id) {
      return updatedProfile;
    }

    return profile;
  });

  localStorage.setItem(
    CANDIDATE_PROFILES_KEY,
    JSON.stringify(updatedProfiles)
  );

  localStorage.setItem(
    LOGGED_IN_USER_KEY,
    JSON.stringify({
      id: updatedProfile.id,
      email: updatedProfile.email,
      role: "candidate",
    })
  );

  return {
    success: true,
    message: "Profile updated successfully.",
    candidate: updatedProfile,
  };
}

export async function loginUser(loginData) {
  console.log("Login data submitted:", loginData);

  if (loginData.role === "candidate") {
    const profiles = getCandidateProfilesFromStorage();

    const matchedProfile = profiles.find((profile) => {
      return (
        profile.email.toLowerCase() === loginData.email.toLowerCase() &&
        profile.password === loginData.password
      );
    });

    if (!matchedProfile) {
      return {
        success: false,
        message: "Invalid candidate email or password.",
      };
    }

    localStorage.setItem(
      LOGGED_IN_USER_KEY,
      JSON.stringify({
        id: matchedProfile.id,
        email: matchedProfile.email,
        role: "candidate",
      })
    );

    return {
      success: true,
      message: "Login successful.",
      user: {
        id: matchedProfile.id,
        email: matchedProfile.email,
        role: "candidate",
      },
    };
  }

  return {
    success: false,
    message: "Employer login will be connected later.",
  };
}

export async function registerCandidate(candidateData) {
  console.log("Candidate profile submitted:", candidateData);

  const profiles = getCandidateProfilesFromStorage();
  const email = candidateData.email.trim().toLowerCase();
  const emailAlreadyExists = profiles.some((profile) => {
    return profile.email.toLowerCase() === email;
  });

  if (emailAlreadyExists) {
    return {
      success: false,
      message: "A candidate account with this email already exists.",
    };
  }

  const newCandidateProfile = createCandidateProfile(
    candidateData,
    getNextCandidateId(profiles)
  );
  const updatedProfiles = [...profiles, newCandidateProfile];

  saveCandidateProfilesToStorage(updatedProfiles);

  localStorage.setItem(
    LOGGED_IN_USER_KEY,
    JSON.stringify({
      id: newCandidateProfile.id,
      email: newCandidateProfile.email,
      role: "candidate",
    })
  );

  return {
    success: true,
    message: "Candidate profile created successfully.",
    candidate: newCandidateProfile,
  };
}

export function startCandidateFreeTrial() {
  const profile = getLoggedInCandidateProfile();

  if (!profile) {
    return {
      success: false,
      message: "Please log in as a candidate to start your free trial.",
    };
  }

  const updatedProfile = {
    ...profile,
    isProUser: true,
    membershipPlan: "Pro",
    membershipStatus: "Free trial active",
    proTrialStartedAt: new Date().toISOString(),
  };

  updateLoggedInCandidateProfile(updatedProfile);

  return {
    success: true,
    message: "Your Pro free trial is now active.",
    candidate: updatedProfile,
  };
}

export function getEmployerMembership() {
  const storedMembership = localStorage.getItem(EMPLOYER_MEMBERSHIP_KEY);

  if (!storedMembership) {
    return {
      isProUser: false,
      membershipPlan: "Standard",
      membershipStatus: "Standard user",
    };
  }

  return JSON.parse(storedMembership);
}

export function startEmployerFreeTrial() {
  const membership = {
    isProUser: true,
    membershipPlan: "Pro",
    membershipStatus: "Free trial active",
    proTrialStartedAt: new Date().toISOString(),
  };

  localStorage.setItem(EMPLOYER_MEMBERSHIP_KEY, JSON.stringify(membership));

  return {
    success: true,
    message: "Your Pro free trial is now active.",
    membership,
  };
}

// Employeer Data

export async function registerEmployer(employerData) {
  console.log("Employer account and job posting submitted:", employerData);

  return {
    success: true,
    message: "Employer account and job posting created successfully.",
    employer: employerData,
  };
}
