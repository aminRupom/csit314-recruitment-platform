// This file keeps frontend/backend communication in one place.
// For now, it uses dummy logic.
// Later, your backend teammate can replace this with real API calls.

export async function loginUser(loginData) {
  console.log("Login data submitted:", loginData);

  if (loginData.email && loginData.password) {
    return {
      success: true,
      message: "Login successful.",
      user: {
        email: loginData.email,
        role: loginData.role,
      },
    };
  }


  return {
    success: false,
    message: "Invalid email or password.",
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