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

function getCandidateProfilesFromStorage() {
  const storedProfiles = localStorage.getItem(CANDIDATE_PROFILES_KEY);

  if (storedProfiles) {
    return JSON.parse(storedProfiles);
  }

  localStorage.setItem(
    CANDIDATE_PROFILES_KEY,
    JSON.stringify(candidateProfiles)
  );

  return candidateProfiles;
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

  return {
    success: true,
    message: "Candidate profile created successfully.",
    candidate: candidateData,
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