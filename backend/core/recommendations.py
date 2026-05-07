from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity
from .models import JobPosting, CandidateProfile


def recommend_jobs_for_candidate(candidate, top_k=10):
    """
    Given a candidate, return the top K most relevant jobs.
    """
    jobs = list(JobPosting.objects.all())
    if not jobs:
        return []

    # Build text representation of candidate
    candidate_text = " ".join([
        candidate.major or "",
        candidate.skills or "",
        str(candidate.years_experience or 0),
    ])

    # Build text representation of each job
    job_texts = [
        " ".join([
            job.title or "",
            job.description or "",
            job.required_skills or "",
            str(job.experience_required or 0),
        ])
        for job in jobs
    ]

    # Vectorise
    vectorizer = TfidfVectorizer(stop_words="english")
    matrix = vectorizer.fit_transform([candidate_text] + job_texts)

    # Cosine similarity: candidate (row 0) vs each job (rows 1+)
    scores = cosine_similarity(matrix[0:1], matrix[1:]).flatten()

    # Pair jobs with their scores, sort, take top K
    ranked = sorted(zip(jobs, scores), key=lambda x: x[1], reverse=True)
    return [job for job, score in ranked[:top_k] if score > 0]


def recommend_candidates_for_job(job, top_n=10):
    """
    Given a job, return the top N most suitable candidates.
    """
    candidates = list(CandidateProfile.objects.all())
    if not candidates:
        return []

    job_text = " ".join([
        job.title or "",
        job.description or "",
        job.required_skills or "",
    ])

    candidate_texts = [
        " ".join([
            c.major or "",
            c.skills or "",
            c.education or "",
        ])
        for c in candidates
    ]

    vectorizer = TfidfVectorizer(stop_words="english")
    matrix = vectorizer.fit_transform([job_text] + candidate_texts)

    scores = cosine_similarity(matrix[0:1], matrix[1:]).flatten()

    ranked = sorted(zip(candidates, scores), key=lambda x: x[1], reverse=True)
    return [c for c, score in ranked[:top_n] if score > 0]