# backend/core/filters.py
import django_filters
from .models import JobPosting, CandidateProfile


class JobPostingFilter(django_filters.FilterSet):
    location = django_filters.CharFilter(lookup_expr="icontains")
    salary_min = django_filters.NumberFilter(field_name="salary_min", lookup_expr="gte")
    salary_max = django_filters.NumberFilter(field_name="salary_max", lookup_expr="lte")
    min_experience = django_filters.NumberFilter(
        field_name="required_experience_years", lookup_expr="gte"
    )

    class Meta:
        model = JobPosting
        fields = ["work_mode", "required_education", "employment_type"]


class CandidateProfileFilter(django_filters.FilterSet):
    min_experience = django_filters.NumberFilter(
        field_name="years_experience", lookup_expr="gte"
    )
    skills = django_filters.CharFilter(lookup_expr="icontains")

    class Meta:
        model = CandidateProfile
        fields = ["education"]
