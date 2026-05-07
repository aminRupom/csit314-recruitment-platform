# backend/core/recommendations.py
"""
Recommendation engine using TF-IDF vectorisation and cosine similarity.

The text representation of each candidate and each job is built from
free-text fields. We then compute pairwise cosine similarity and return
the top K results.
"""
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity

from .models import JobPosting, CandidateProfile


def _candidate_to_text(candidate: CandidateProfile) -> str:
    """Concatenate a candidate's free-text fields for vectorisation."""
    return " ".join([
        candidate.major or "",
        candidate.skills or "",
        candidate.education or "",
        str(candidate.years_experience or 0),
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

    Returns a list of JobPosting instances (max length top_k), sorted
    by relevance descending. Jobs with zero similarity are excluded.
    """
    jobs = list(JobPosting.objects.all())
    if not jobs:
        return []

    candidate_text = _candidate_to_text(candidate)
    job_texts = [_job_to_text(j) for j in jobs]

    vectorizer = TfidfVectorizer(stop_words="english")
    matrix = vectorizer.fit_transform([candidate_text] + job_texts)

    # Row 0 is the candidate; rows 1..N are the jobs
    scores = cosine_similarity(matrix[0:1], matrix[1:]).flatten()

    ranked = sorted(zip(jobs, scores), key=lambda x: x[1], reverse=True)
    return [job for job, score in ranked[:top_k] if score > 0]


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