# backend/core/management/commands/seed_data.py
"""
Populates the database with realistic demo data.

Usage:
    python manage.py seed_data
    python manage.py seed_data --flush   (wipes existing data first)

Creates:
    - 15 candidates (User + CandidateProfile), ~half with membership
    - 5 employers (User), ~half with membership
    - 15 job postings with salary ranges and employment types
    - ~25 applications linking candidates to jobs
"""
import random
from django.core.management.base import BaseCommand
from django.db import transaction
from core.models import User, CandidateProfile, JobPosting, Application


# Tuple fields:
# username, full_name, email, major, skills, years_exp, education,
# work_experience, preferred_work_mode, preferred_location, membership
CANDIDATES = [
    (
        "alice_dev", "Alice Wong", "alice@demo.com",
        "Computer Science",
        "python, django, rest apis, postgresql",
        3, "BACHELOR",
        "Backend developer at a fintech startup (3 years). Built and maintained "
        "Django REST APIs, PostgreSQL schemas, and Celery task queues serving "
        "50 000 daily requests.",
        "REMOTE", "Sydney", True,
    ),
    (
        "bob_data", "Bob Tanaka", "bob@demo.com",
        "Data Science",
        "python, pandas, scikit-learn, sql, tableau",
        5, "MASTER",
        "Data scientist at a retail analytics company (5 years). Built customer "
        "segmentation and churn models with scikit-learn; delivered Tableau "
        "dashboards consumed by the commercial team.",
        "HYBRID", "Sydney", True,
    ),
    (
        "carol_full", "Carol Singh", "carol@demo.com",
        "Software Engineering",
        "javascript, react, node.js, typescript, mongodb",
        2, "BACHELOR",
        "Full-stack developer at a SaaS product company (2 years). Owned the "
        "React/TypeScript frontend and contributed to the Node.js API layer and "
        "MongoDB schema design.",
        "REMOTE", "Melbourne", False,
    ),
    (
        "david_ml", "David Chen", "david@demo.com",
        "Machine Learning",
        "python, tensorflow, pytorch, nlp, computer vision",
        4, "MASTER",
        "ML engineer at an NLP startup (4 years). Trained and deployed PyTorch "
        "transformer models for text classification and recommendation, achieving "
        "production p99 latency under 50 ms.",
        "REMOTE", "Brisbane", True,
    ),
    (
        "emma_front", "Emma Brown", "emma@demo.com",
        "Web Development",
        "html, css, javascript, vue, tailwind",
        1, "BACHELOR",
        "Junior frontend developer at a digital agency (1 year). Delivered "
        "responsive HTML/CSS/Vue.js pages for client websites and contributed "
        "to an internal component library.",
        "HYBRID", "Melbourne", False,
    ),
    (
        "frank_back", "Frank Lee", "frank@demo.com",
        "Computer Science",
        "java, spring boot, kafka, microservices",
        6, "BACHELOR",
        "Senior backend engineer at an enterprise logistics company (6 years). "
        "Designed Java/Spring Boot microservices, tuned Kafka consumer throughput, "
        "and mentored two junior engineers.",
        "ONSITE", "Melbourne", False,
    ),
    (
        "grace_devops", "Grace Park", "grace@demo.com",
        "Cloud Engineering",
        "aws, docker, kubernetes, terraform, ci/cd",
        4, "BACHELOR",
        "Cloud engineer at a managed services provider (4 years). Architected AWS "
        "landing zones with Terraform, built GitHub Actions CI/CD pipelines, and "
        "reduced infrastructure spend by 30 percent.",
        "REMOTE", "Perth", True,
    ),
    (
        "henry_mob", "Henry Garcia", "henry@demo.com",
        "Mobile Development",
        "swift, kotlin, flutter, mobile architecture",
        3, "BACHELOR",
        "Mobile developer at an app studio (3 years). Shipped Flutter apps to both "
        "app stores and wrote Swift and Kotlin native modules for hardware "
        "integrations.",
        "HYBRID", "Sydney", False,
    ),
    (
        "ivy_sec", "Ivy Patel", "ivy@demo.com",
        "Cybersecurity",
        "penetration testing, network security, python, oscp",
        5, "MASTER",
        "Security engineer at a cybersecurity consultancy (5 years). Led "
        "penetration testing engagements for banking clients, produced "
        "executive-level reports, and holds the OSCP certification.",
        "REMOTE", "Sydney", True,
    ),
    (
        "jack_qa", "Jack Wilson", "jack@demo.com",
        "Quality Assurance",
        "selenium, cypress, pytest, automation, jira",
        3, "BACHELOR",
        "QA engineer at a software company (3 years). Maintained a 2 000-test "
        "Selenium and Cypress suite, integrated automated runs into CI, and "
        "reduced release cycle time by two days.",
        "ONSITE", "Melbourne", False,
    ),
    (
        "kate_pm", "Kate Johnson", "kate@demo.com",
        "Product Management",
        "agile, scrum, roadmap planning, jira, stakeholder management",
        4, "MASTER",
        "Product manager at a B2B SaaS company (4 years). Owned a three-feature "
        "roadmap, ran sprint ceremonies, and collaborated with engineering and "
        "design to ship four major releases.",
        "HYBRID", "Sydney", True,
    ),
    (
        "liam_design", "Liam O'Brien", "liam@demo.com",
        "UX Design",
        "figma, user research, wireframing, prototyping",
        2, "BACHELOR",
        "UX designer at a product studio (2 years). Conducted user research "
        "studies, created wireframes and interactive prototypes in Figma, and "
        "ran usability sessions with end users.",
        "HYBRID", "Sydney", False,
    ),
    (
        "maya_data", "Maya Iyer", "maya@demo.com",
        "Data Engineering",
        "spark, airflow, bigquery, python, dbt",
        4, "MASTER",
        "Data engineer at a logistics technology company (4 years). Built Spark "
        "and Airflow pipelines processing 10 TB per day and led a migration of "
        "the data warehouse to BigQuery.",
        "REMOTE", "Brisbane", True,
    ),
    (
        "noah_jr", "Noah Williams", "noah@demo.com",
        "Computer Science",
        "python, javascript, basic react, learning django",
        0, "BACHELOR",
        "Computer science graduate with one internship in Python web development. "
        "Completed university projects in algorithms and databases; actively "
        "learning Django and React.",
        "", "", False,
    ),
    (
        "olivia_ai", "Olivia Mendez", "olivia@demo.com",
        "Artificial Intelligence",
        "python, deep learning, transformers, llms, prompt engineering",
        3, "MASTER",
        "AI researcher at a university spin-out (3 years). Fine-tuned BERT and "
        "GPT-based models for legal document classification and built production "
        "inference services with FastAPI.",
        "REMOTE", "Brisbane", True,
    ),
]

# Tuple fields: username, email, company, membership
EMPLOYERS = [
    ("acme_corp",     "acme@demo.com",     "Acme Corporation", True),
    ("techstart",     "tech@demo.com",     "TechStart Inc",    False),
    ("dataco",        "data@demo.com",     "DataCo Analytics", True),
    ("cloudplus",     "cloud@demo.com",    "CloudPlus",        True),
    ("innovate_lab",  "innovate@demo.com", "Innovate Lab",     False),
]

# Tuple fields:
# title, company, description, required_skills, required_experience_years,
# required_education, work_mode, location,
# salary_min, salary_max, employment_type
JOBS = [
    (
        "Senior Python Developer", "Acme Corporation",
        "Build and maintain Django REST APIs at scale. Work with PostgreSQL, Redis, and Celery.",
        "Python, Django, PostgreSQL, REST APIs",
        4, "BACHELOR", "REMOTE", "Sydney",
        130000, 170000, "FULL_TIME",
    ),
    (
        "Data Scientist", "Acme Corporation",
        "Apply machine learning to customer behaviour data. Build models, A/B tests, dashboards.",
        "Python, scikit-learn, SQL, statistics",
        3, "MASTER", "HYBRID", "Sydney",
        100000, 140000, "FULL_TIME",
    ),
    (
        "Frontend React Developer", "TechStart Inc",
        "Build reactive web UIs with React and TypeScript. Collaborate with designers.",
        "React, TypeScript, JavaScript, CSS",
        2, "BACHELOR", "REMOTE", "Melbourne",
        85000, 115000, "FULL_TIME",
    ),
    (
        "Full Stack Engineer", "TechStart Inc",
        "Work across the stack: Node backend, React frontend, MongoDB.",
        "JavaScript, Node.js, React, MongoDB",
        3, "BACHELOR", "ONSITE", "Melbourne",
        95000, 130000, "FULL_TIME",
    ),
    (
        "Junior Software Engineer", "TechStart Inc",
        "Entry-level role. Learn on the job. Strong CS fundamentals required.",
        "Python or JavaScript, problem solving",
        0, "BACHELOR", "ONSITE", "Melbourne",
        55000, 70000, "INTERNSHIP",
    ),
    (
        "Machine Learning Engineer", "DataCo Analytics",
        "Train and deploy ML models for production. Focus on NLP and recommendation systems.",
        "Python, TensorFlow, PyTorch, NLP",
        4, "MASTER", "REMOTE", "Brisbane",
        140000, 180000, "FULL_TIME",
    ),
    (
        "Data Engineer", "DataCo Analytics",
        "Build and maintain data pipelines. Spark, Airflow, BigQuery.",
        "Spark, Airflow, SQL, Python",
        3, "BACHELOR", "HYBRID", "Brisbane",
        100000, 135000, "FULL_TIME",
    ),
    (
        "Cloud Engineer", "CloudPlus",
        "Design and operate AWS infrastructure. IaC with Terraform. CI/CD pipelines.",
        "AWS, Terraform, Docker, Kubernetes",
        4, "BACHELOR", "REMOTE", "Perth",
        130000, 165000, "FULL_TIME",
    ),
    (
        "DevOps Specialist", "CloudPlus",
        "Own deployment automation. Improve developer velocity. SRE practices.",
        "Kubernetes, CI/CD, monitoring, Linux",
        5, "BACHELOR", "REMOTE", "Perth",
        140000, 175000, "CONTRACT",
    ),
    (
        "Mobile Developer", "Innovate Lab",
        "Build cross-platform mobile apps with Flutter or React Native.",
        "Flutter, Swift, Kotlin, mobile",
        2, "BACHELOR", "HYBRID", "Sydney",
        90000, 120000, "FULL_TIME",
    ),
    (
        "Security Engineer", "Innovate Lab",
        "Penetration testing, vulnerability assessment, secure code review.",
        "penetration testing, OWASP, Python",
        4, "MASTER", "REMOTE", "Sydney",
        135000, 170000, "FULL_TIME",
    ),
    (
        "UX Designer", "Innovate Lab",
        "Design intuitive user experiences. User research, wireframes, prototypes.",
        "Figma, user research, prototyping",
        2, "BACHELOR", "HYBRID", "Sydney",
        65000, 90000, "PART_TIME",
    ),
    (
        "Product Manager", "Acme Corporation",
        "Own product roadmap. Work with engineering and design. Agile / Scrum.",
        "Scrum, roadmapping, stakeholder management",
        4, "MASTER", "ONSITE", "Sydney",
        130000, 165000, "FULL_TIME",
    ),
    (
        "QA Automation Engineer", "TechStart Inc",
        "Write and maintain automated test suites. Selenium, Cypress, pytest.",
        "Selenium, automation, pytest",
        3, "BACHELOR", "REMOTE", "Melbourne",
        85000, 115000, "CONTRACT",
    ),
    (
        "AI Research Engineer", "DataCo Analytics",
        "Research and prototype LLM applications. Production-ready experiments.",
        "Python, transformers, LLMs, deep learning",
        3, "MASTER", "REMOTE", "Brisbane",
        110000, 150000, "FULL_TIME",
    ),
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
        for (
            username, full_name, email, major, skills, years_exp, education,
            work_exp, pref_mode, pref_loc, membership,
        ) in CANDIDATES:
            user, created = User.objects.get_or_create(
                username=username,
                defaults={"email": email, "role": "CANDIDATE"},
            )
            if created:
                user.set_password("DemoPass123!")
            user.membership = membership
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
                    "work_experience": work_exp,
                    "preferred_work_mode": pref_mode,
                    "preferred_location": pref_loc,
                },
            )
            candidates.append(profile)
        self.stdout.write(self.style.SUCCESS(f"  ...{len(candidates)} candidates ready."))

        # Create employers
        self.stdout.write("Creating employers...")
        employers_by_company = {}
        for username, email, company, membership in EMPLOYERS:
            user, created = User.objects.get_or_create(
                username=username,
                defaults={"email": email, "role": "EMPLOYER"},
            )
            if created:
                user.set_password("DemoPass123!")
            user.membership = membership
            user.save()
            employers_by_company[company] = user
        self.stdout.write(self.style.SUCCESS(f"  ...{len(employers_by_company)} employers ready."))

        # Create job postings
        self.stdout.write("Creating job postings...")
        jobs = []
        for (
            title, company, desc, skills, exp, edu, mode, loc,
            salary_min, salary_max, emp_type,
        ) in JOBS:
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
                    "salary_min": salary_min,
                    "salary_max": salary_max,
                    "employment_type": emp_type,
                },
            )
            jobs.append(job)
        self.stdout.write(self.style.SUCCESS(f"  ...{len(jobs)} jobs ready."))

        # Create applications — each candidate applies to 1–3 random jobs
        self.stdout.write("Creating applications...")
        application_count = 0
        random.seed(42)
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
        self.stdout.write("  Candidate (member):     alice_dev / bob_data / david_ml")
        self.stdout.write("  Candidate (non-member): carol_full / emma_front / frank_back")
        self.stdout.write("  Employer  (member):     acme_corp / dataco / cloudplus")
        self.stdout.write("  Employer  (non-member): techstart / innovate_lab")
