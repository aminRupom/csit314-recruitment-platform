export function calculateJobMatchScore(job, candidateProfile) {
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
    job.location
      .toLowerCase()
      .includes(candidateProfile.preferredLocation.toLowerCase())
  ) {
    score += 15;
  }

  const candidateLanguages = candidateProfile.spokenLanguages.map((language) =>
    language.toLowerCase()
  );

  if (candidateLanguages.includes(job.language.toLowerCase())) {
    score += 10;
  }

  if (
    candidateProfile.careerInterests.some((interest) =>
      job.title.toLowerCase().includes(interest.toLowerCase())
    )
  ) {
    score += 20;
  }

  return score;
}