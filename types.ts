export interface JobPost {
  id: string;
  company: string;       // 公司名称
  location: string;      // 工作地点
  type: string;          // 招聘类型 (社招/校招/实习)
  target: string;        // 招聘对象 (本科/硕士/不限)
  updated_at: string;    // 更新时间
  link: string;          // 投递链接
  description?: string;  // 职位描述 (可选，用于AI匹配)
}

export interface JobRecommendation {
  job_id: string;
  job_name: string;      // 对应 JobPost 的 company + description 摘要
  match_score: number;
  reason_why_you: string;
  risk_why_not: string;
  apply_link: string;
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
