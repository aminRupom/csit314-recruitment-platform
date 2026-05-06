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