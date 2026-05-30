# backend/core/recommendations.py
"""
Recommendation engine using TF-IDF vectorisation and cosine similarity.

The text representation of each candidate and each job is built from
free-text fields. We then compute pairwise cosine similarity and return
the top K results.

After TF-IDF scoring, a small boost is applied when a job's structured
attributes match the candidate's stated preferences. The boost weights are
module-level constants so they can be tuned without touching the algorithm.
"""
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity

from .models import JobPosting, CandidateProfile

WORK_MODE_BOOST = 0.1
LOCATION_BOOST = 0.1


def _candidate_to_text(candidate: CandidateProfile) -> str:
    """Concatenate a candidate's free-text fields for vectorisation."""
    return " ".join([
        candidate.major or "",
        candidate.skills or "",
        candidate.education or "",
        str(candidate.years_experience or 0),
        candidate.work_experience or "",
        candidate.preferred_work_mode or "",
        candidate.preferred_location or "",
    ])


def _job_to_text(job: JobPosting) -> str:
    """Concatenate a job posting's free-text fields for vectorisation."""
    return " ".join([
        job.title or "",
        job.description or "",
        job.required_skills or "",
        job.required_education or "",
        str(job.required_experience_years or 0),
    ])


def recommend_jobs_for_candidate(candidate, top_k=10):
    """
    Given a candidate, return the top K most relevant jobs ranked by
    cosine similarity between the candidate text and each job text.

    A preference boost is applied after TF-IDF scoring: jobs matching the
    candidate's preferred work mode or location receive a small score
    increase. Boosts are only applied to jobs with a positive base score so
    that structurally irrelevant jobs are never surfaced.

    Returns a list of JobPosting instances (max length top_k), sorted by
    relevance descending. Pass top_k=None to return all positive-scoring jobs.
    """
    jobs = list(JobPosting.objects.all())
    if not jobs:
        return []

    candidate_text = _candidate_to_text(candidate)
    job_texts = [_job_to_text(j) for j in jobs]

    vectorizer = TfidfVectorizer(stop_words="english")
    matrix = vectorizer.fit_transform([candidate_text] + job_texts)

    # Row 0 is the candidate; rows 1..N are the jobs
    base_scores = cosine_similarity(matrix[0:1], matrix[1:]).flatten()

    boosted = []
    for job, score in zip(jobs, base_scores):
        if score <= 0:
            continue
        if candidate.preferred_work_mode and job.work_mode == candidate.preferred_work_mode:
            score += WORK_MODE_BOOST
        if (candidate.preferred_location
                and candidate.preferred_location.lower() in job.location.lower()):
            score += LOCATION_BOOST
        boosted.append((job, score))

    ranked = sorted(boosted, key=lambda x: x[1], reverse=True)
    return [job for job, _ in ranked[:top_k]]


def recommend_candidates_for_job(job, top_n=10):
    """
    Given a job posting, return the top N most suitable candidates ranked
    by cosine similarity between the job text and each candidate text.

    Returns a list of CandidateProfile instances (max length top_n).
    Candidates with zero similarity are excluded.
    """
    candidates = list(CandidateProfile.objects.all())
    if not candidates:
        return []

    job_text = _job_to_text(job)
    candidate_texts = [_candidate_to_text(c) for c in candidates]

    vectorizer = TfidfVectorizer(stop_words="english")
    matrix = vectorizer.fit_transform([job_text] + candidate_texts)

    scores = cosine_similarity(matrix[0:1], matrix[1:]).flatten()

    ranked = sorted(zip(candidates, scores), key=lambda x: x[1], reverse=True)
    return [c for c, score in ranked[:top_n] if score > 0]