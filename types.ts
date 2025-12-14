export interface JobRecommendation {
  job_name: string;
  company_nature: string; // e.g., Internet Giant, SOE, Foreign Enterprise
  match_score: number;
  reason_why_you: string;
  risk_why_not: string;
}

export interface AnalysisResult {
  profile: {
    positioning: string;
    strengths: string[];
    fatal_flaw: string;
  };
  job_recommendations: JobRecommendation[];
  coaching_strategy: {
    resume_fix: string;
    interview_questions: string[];
  };
}

export interface AnalysisRequest {
  resumeText: string;
  jobContext: string;
}