# backend/core/management/commands/seed_data.py
"""
Populates the database with realistic demo data.

Usage:
    python manage.py seed_data
    python manage.py seed_data --flush   (wipes existing data first)

Creates:
    - 15 candidates (User + CandidateProfile)
    - 5 employers (User)
    - 15 job postings spread across the 5 employers
    - ~25 applications linking candidates to jobs
"""
import random
from django.core.management.base import BaseCommand
from django.db import transaction
from core.models import User, CandidateProfile, JobPosting, Application


CANDIDATES = [
    ("alice_dev", "Alice Wong", "alice@demo.com", "Computer Science",
     "Python, Django, REST APIs, PostgreSQL", 3, "BACHELOR"),
    ("bob_data", "Bob Tanaka", "bob@demo.com", "Data Science",
     "Python, pandas, scikit-learn, SQL, Tableau", 5, "MASTER"),
    ("carol_full", "Carol Singh", "carol@demo.com", "Software Engineering",
     "JavaScript, React, Node.js, TypeScript, MongoDB", 2, "BACHELOR"),
    ("david_ml", "David Chen", "david@demo.com", "Machine Learning",
     "Python, TensorFlow, PyTorch, NLP, computer vision", 4, "MASTER"),
    ("emma_front", "Emma Brown", "emma@demo.com", "Web Development",
     "HTML, CSS, JavaScript, Vue, Tailwind", 1, "BACHELOR"),
    ("frank_back", "Frank Lee", "frank@demo.com", "Computer Science",
     "Java, Spring Boot, Kafka, microservices", 6, "BACHELOR"),
    ("grace_devops", "Grace Park", "grace@demo.com", "Cloud Engineering",
     "AWS, Docker, Kubernetes, Terraform, CI/CD", 4, "BACHELOR"),
    ("henry_mob", "Henry Garcia", "henry@demo.com", "Mobile Development",
     "Swift, Kotlin, Flutter, mobile architecture", 3, "BACHELOR"),
    ("ivy_sec", "Ivy Patel", "ivy@demo.com", "Cybersecurity",
     "penetration testing, network security, Python, OSCP", 5, "MASTER"),
    ("jack_qa", "Jack Wilson", "jack@demo.com", "Quality Assurance",
     "Selenium, Cypress, pytest, automation, JIRA", 3, "BACHELOR"),
    ("kate_pm", "Kate Johnson", "kate@demo.com", "Product Management",
     "agile, Scrum, roadmap planning, JIRA, stakeholder management", 4, "MASTER"),
    ("liam_design", "Liam O'Brien", "liam@demo.com", "UX Design",
     "Figma, user research, wireframing, prototyping", 2, "BACHELOR"),
    ("maya_data", "Maya Iyer", "maya@demo.com", "Data Engineering",
     "Spark, Airflow, BigQuery, Python, dbt", 4, "MASTER"),
    ("noah_jr", "Noah Williams", "noah@demo.com", "Computer Science",
     "Python, JavaScript, basic React, learning Django", 0, "BACHELOR"),
    ("olivia_ai", "Olivia Mendez", "olivia@demo.com", "Artificial Intelligence",
     "Python, deep learning, transformers, LLMs, prompt engineering", 3, "MASTER"),
]

EMPLOYERS = [
    ("acme_corp", "acme@demo.com", "Acme Corporation"),
    ("techstart", "tech@demo.com", "TechStart Inc"),
    ("dataco", "data@demo.com", "DataCo Analytics"),
    ("cloudplus", "cloud@demo.com", "CloudPlus"),
    ("innovate_lab", "innovate@demo.com", "Innovate Lab"),
]

JOBS = [
    ("Senior Python Developer", "Acme Corporation",
     "Build and maintain Django REST APIs at scale. Work with PostgreSQL, Redis, and Celery.",
     "Python, Django, PostgreSQL, REST APIs", 4, "BACHELOR", "REMOTE", "Sydney"),
    ("Data Scientist", "Acme Corporation",
     "Apply machine learning to customer behaviour data. Build models, A/B tests, dashboards.",
     "Python, scikit-learn, SQL, statistics", 3, "MASTER", "HYBRID", "Sydney"),
    ("Frontend React Developer", "TechStart Inc",
     "Build reactive web UIs with React and TypeScript. Collaborate with designers.",
     "React, TypeScript, JavaScript, CSS", 2, "BACHELOR", "REMOTE", "Melbourne"),
    ("Full Stack Engineer", "TechStart Inc",
     "Work across the stack: Node backend, React frontend, MongoDB.",
     "JavaScript, Node.js, React, MongoDB", 3, "BACHELOR", "ON_SITE", "Melbourne"),
    ("Junior Software Engineer", "TechStart Inc",
     "Entry-level role. Learn on the job. Strong CS fundamentals required.",
     "Python or JavaScript, problem solving", 0, "BACHELOR", "ON_SITE", "Melbourne"),
    ("Machine Learning Engineer", "DataCo Analytics",
     "Train and deploy ML models for production. Focus on NLP and recommendation systems.",
     "Python, TensorFlow, PyTorch, NLP", 4, "MASTER", "REMOTE", "Brisbane"),
    ("Data Engineer", "DataCo Analytics",
     "Build and maintain data pipelines. Spark, Airflow, BigQuery.",
     "Spark, Airflow, SQL, Python", 3, "BACHELOR", "HYBRID", "Brisbane"),
    ("Cloud Engineer", "CloudPlus",
     "Design and operate AWS infrastructure. IaC with Terraform. CI/CD pipelines.",
     "AWS, Terraform, Docker, Kubernetes", 4, "BACHELOR", "REMOTE", "Perth"),
    ("DevOps Specialist", "CloudPlus",
     "Own deployment automation. Improve developer velocity. SRE practices.",
     "Kubernetes, CI/CD, monitoring, Linux", 5, "BACHELOR", "REMOTE", "Perth"),
    ("Mobile Developer", "Innovate Lab",
     "Build cross-platform mobile apps with Flutter or React Native.",
     "Flutter, Swift, Kotlin, mobile", 2, "BACHELOR", "HYBRID", "Sydney"),
    ("Security Engineer", "Innovate Lab",
     "Penetration testing, vulnerability assessment, secure code review.",
     "penetration testing, OWASP, Python", 4, "MASTER", "REMOTE", "Sydney"),
    ("UX Designer", "Innovate Lab",
     "Design intuitive user experiences. User research, wireframes, prototypes.",
     "Figma, user research, prototyping", 2, "BACHELOR", "HYBRID", "Sydney"),
    ("Product Manager", "Acme Corporation",
     "Own product roadmap. Work with engineering and design. Agile / Scrum.",
     "Scrum, roadmapping, stakeholder management", 4, "MASTER", "ON_SITE", "Sydney"),
    ("QA Automation Engineer", "TechStart Inc",
     "Write and maintain automated test suites. Selenium, Cypress, pytest.",
     "Selenium, automation, pytest", 3, "BACHELOR", "REMOTE", "Melbourne"),
    ("AI Research Engineer", "DataCo Analytics",
     "Research and prototype LLM applications. Production-ready experiments.",
     "Python, transformers, LLMs, deep learning", 3, "MASTER", "REMOTE", "Brisbane"),
]


class Command(BaseCommand):
    help = "Populates the database with realistic demo data"

    def add_arguments(self, parser):
        parser.add_argument(
            "--flush",
            action="store_true",
            help="Delete all existing data before seeding",
        )

    @transaction.atomic
    def handle(self, *args, **options):
        if options["flush"]:
            self.stdout.write("Flushing existing data...")
            Application.objects.all().delete()
            JobPosting.objects.all().delete()
            CandidateProfile.objects.all().delete()
            User.objects.filter(is_superuser=False).delete()
            self.stdout.write(self.style.SUCCESS("  ...flushed."))

        # Create candidates
        self.stdout.write("Creating candidates...")
        candidates = []
        for username, full_name, email, major, skills, years_exp, education in CANDIDATES:
            user, created = User.objects.get_or_create(
                username=username,
                defaults={"email": email, "role": "CANDIDATE"},
            )
            if created:
                user.set_password("DemoPass123!")
                user.save()

            profile, _ = CandidateProfile.objects.get_or_create(
                user=user,
                defaults={
                    "full_name": full_name,
                    "contact_email": email,
                    "contact_phone": "+61400000000",
                    "education": education,
                    "major": major,
                    "years_experience": years_exp,
                    "skills": skills,
                },
            )
            candidates.append(profile)
        self.stdout.write(self.style.SUCCESS(f"  ...{len(candidates)} candidates ready."))

        # Create employers
        self.stdout.write("Creating employers...")
        employers_by_company = {}
        for username, email, company in EMPLOYERS:
            user, created = User.objects.get_or_create(
                username=username,
                defaults={"email": email, "role": "EMPLOYER"},
            )
            if created:
                user.set_password("DemoPass123!")
                user.save()
            employers_by_company[company] = user
        self.stdout.write(self.style.SUCCESS(f"  ...{len(employers_by_company)} employers ready."))

        # Create job postings
        self.stdout.write("Creating job postings...")
        jobs = []
        for title, company, desc, skills, exp, edu, mode, loc in JOBS:
            employer = employers_by_company[company]
            job, _ = JobPosting.objects.get_or_create(
                title=title,
                employer=employer,
                defaults={
                    "company_name": company,
                    "company_info": f"{company} — leading employer in our space.",
                    "description": desc,
                    "required_skills": skills,
                    "required_experience_years": exp,
                    "required_education": edu,
                    "work_mode": mode,
                    "location": loc,
                },
            )
            jobs.append(job)
        self.stdout.write(self.style.SUCCESS(f"  ...{len(jobs)} jobs ready."))

        # Create applications — each candidate applies to 1–3 random jobs
        self.stdout.write("Creating applications...")
        application_count = 0
        random.seed(42)  # reproducible
        for candidate in candidates:
            n_apps = random.randint(1, 3)
            target_jobs = random.sample(jobs, k=min(n_apps, len(jobs)))
            for job in target_jobs:
                _, created = Application.objects.get_or_create(
                    candidate=candidate,
                    job=job,
                    defaults={
                        "cover_message": f"Excited about the {job.title} role at {job.company_name}.",
                        "status": "PENDING",
                    },
                )
                if created:
                    application_count += 1
        self.stdout.write(self.style.SUCCESS(f"  ...{application_count} applications created."))

        self.stdout.write("")
        self.stdout.write(self.style.SUCCESS("Seed complete."))
        self.stdout.write("")
        self.stdout.write("Sample logins (password: DemoPass123!):")
        self.stdout.write("  Candidate: alice_dev / bob_data / carol_full")
        self.stdout.write("  Employer:  acme_corp / techstart / dataco")