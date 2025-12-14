import React from 'react';
import { AnalysisResult } from '../types';
import { AlertTriangleIcon, CheckCircleIcon, TargetIcon, LightbulbIcon, SparklesIcon, BriefcaseIcon, FileTextIcon } from './ui/Icons';

interface ResultsDisplayProps {
  data: AnalysisResult;
}

const ScoreBadge = ({ score }: { score: number }) => {
  let colorClass = 'bg-red-500/10 text-red-400 border-red-500/20';
  if (score >= 80) colorClass = 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20';
  else if (score >= 60) colorClass = 'bg-amber-500/10 text-amber-400 border-amber-500/20';

  return (
    <div className={`px-4 py-1.5 rounded-full text-sm font-bold border ${colorClass} flex items-center gap-1.5 shadow-sm backdrop-blur-md`}>
      <SparklesIcon className="w-4 h-4" />
      {score}% 匹配度
    </div>
  );
};

export const ResultsDisplay: React.FC<ResultsDisplayProps> = ({ data }) => {
  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-8 duration-700">
      
      {/* 1. Profile Sketch */}
      <section className="glass-panel rounded-3xl p-8 relative overflow-hidden group hover:shadow-2xl hover:shadow-brand-500/10 transition-all duration-500">
        <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:opacity-10 transition-opacity">
           <BriefcaseIcon className="w-48 h-48 text-white" />
        </div>
        
        {/* Gradient Accent Line */}
        <div className="absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b from-brand-cyan to-brand-purple"></div>

        <h2 className="text-xl font-bold text-white mb-8 flex items-center gap-3">
          <div className="p-2 bg-gradient-to-br from-brand-500 to-brand-700 rounded-lg text-white shadow-lg shadow-brand-500/30">
            <TargetIcon className="w-6 h-6" />
          </div>
          <span className="tracking-wide">学员画像速写</span>
          <span className="text-xs font-semibold text-slate-500 uppercase tracking-widest ml-auto">Candidate Portrait</span>
        </h2>
        
        <div className="space-y-6 relative z-10">
          <div>
            <h3 className="text-xs font-bold text-brand-400 uppercase tracking-widest mb-3 flex items-center gap-2">
              <span className="w-8 h-px bg-brand-400/50"></span>
              专业定位 Positioning
            </h3>
            <p className="text-2xl text-slate-100 font-light leading-relaxed">
              "{data.profile.positioning}"
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4">
            <div className="bg-emerald-500/5 rounded-xl p-5 border border-emerald-500/10 hover:border-emerald-500/30 transition-colors">
              <h4 className="text-sm font-bold text-emerald-400 mb-4 flex items-center gap-2">
                <CheckCircleIcon className="w-4 h-4" /> 核心优势 Strengths
              </h4>
              <div className="flex flex-wrap gap-2">
                {data.profile.strengths.map((tag, idx) => (
                  <span key={idx} className="bg-emerald-500/10 text-emerald-300 px-3 py-1.5 rounded-full text-xs font-semibold border border-emerald-500/20">
                    {tag}
                  </span>
                ))}
              </div>
            </div>
            <div className="bg-red-500/5 rounded-xl p-5 border border-red-500/10 hover:border-red-500/30 transition-colors">
              <h4 className="text-sm font-bold text-red-400 mb-4 flex items-center gap-2">
                <AlertTriangleIcon className="w-4 h-4" /> 致命硬伤 Fatal Flaw
              </h4>
              <p className="text-sm text-red-200/90 leading-relaxed font-medium">
                {data.profile.fatal_flaw}
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 2. Job Recommendations */}
      <section>
        <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-3">
          <div className="p-2 bg-gradient-to-br from-brand-500 to-brand-700 rounded-lg text-white shadow-lg shadow-brand-500/30">
            <BriefcaseIcon className="w-6 h-6" />
          </div>
          <span className="tracking-wide">精准岗位匹配</span>
          <span className="text-xs font-semibold text-slate-500 uppercase tracking-widest ml-auto">Job Matches</span>
        </h2>
        <div className="space-y-5">
          {data.job_recommendations.map((job, idx) => (
            <div key={idx} className="glass-panel rounded-2xl p-6 hover:bg-white/5 transition-all duration-300 group relative">
              {/* Hover Glow */}
              <div className="absolute -inset-0.5 bg-gradient-to-r from-brand-cyan to-brand-purple rounded-2xl opacity-0 group-hover:opacity-30 blur transition duration-500"></div>
              
              <div className="relative z-10">
                <div className="flex flex-col md:flex-row md:items-start justify-between gap-4 mb-6">
                  <div>
                    <h3 className="text-lg font-bold text-white mb-1.5 group-hover:text-brand-cyan transition-colors">{job.job_name}</h3>
                    <p className="text-slate-400 text-xs font-medium uppercase tracking-wider bg-white/5 inline-block px-2 py-1 rounded">{job.company_nature}</p>
                  </div>
                  <ScoreBadge score={job.match_score} />
                </div>

                <div className="grid md:grid-cols-2 gap-8 border-t border-white/5 pt-6">
                  <div className="space-y-2">
                    <h4 className="text-[10px] font-bold text-emerald-400 uppercase tracking-widest flex items-center gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 shadow-[0_0_10px_rgba(52,211,153,0.5)]"></span> 
                      适配理由 Why You
                    </h4>
                    <p className="text-slate-300 text-sm leading-relaxed">{job.reason_why_you}</p>
                  </div>
                  <div className="space-y-2">
                    <h4 className="text-[10px] font-bold text-red-400 uppercase tracking-widest flex items-center gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-red-400 shadow-[0_0_10px_rgba(248,113,113,0.5)]"></span> 
                      风险提示 Risk
                    </h4>
                    <p className="text-slate-300 text-sm leading-relaxed">{job.risk_why_not}</p>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 3. Coaching Strategy */}
      <section className="relative rounded-3xl p-1 overflow-hidden">
        {/* Gradient Border Container */}
        <div className="absolute inset-0 bg-gradient-to-r from-brand-cyan via-brand-500 to-brand-purple opacity-30"></div>
        <div className="absolute inset-0 bg-surface m-[1px] rounded-[23px]"></div>
        
        <div className="relative p-8 z-10">
          <div className="absolute top-0 right-0 w-64 h-64 bg-brand-500 rounded-full blur-[120px] opacity-20 -mr-16 -mt-16 pointer-events-none"></div>
          
          <h2 className="text-xl font-bold mb-8 flex items-center gap-3 text-white relative z-10">
            <div className="p-2 bg-gradient-to-br from-yellow-400 to-amber-600 rounded-lg text-white shadow-lg shadow-amber-500/20">
              <LightbulbIcon className="w-6 h-6" />
            </div>
            <span className="tracking-wide">海马专家辅导</span>
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-widest ml-auto">Expert Strategy</span>
          </h2>

          <div className="grid md:grid-cols-2 gap-8 relative z-10">
            <div className="bg-white/5 p-6 rounded-2xl border border-white/5 backdrop-blur-sm">
              <h3 className="text-brand-cyan font-bold mb-4 uppercase text-xs tracking-widest flex items-center gap-2">
                <FileTextIcon className="w-4 h-4" /> 简历修改重点
              </h3>
              <p className="text-slate-300 text-sm leading-7">
                {data.coaching_strategy.resume_fix}
              </p>
            </div>

            <div className="bg-white/5 p-6 rounded-2xl border border-white/5 backdrop-blur-sm">
              <h3 className="text-brand-cyan font-bold mb-4 uppercase text-xs tracking-widest flex items-center gap-2">
                <TargetIcon className="w-4 h-4" /> 面试冲刺方向
              </h3>
              <ul className="space-y-4">
                {data.coaching_strategy.interview_questions.map((q, idx) => (
                  <li key={idx} className="flex items-start gap-3 text-slate-300 text-sm group">
                    <span className="flex-shrink-0 w-5 h-5 rounded-full bg-brand-600/50 border border-brand-500/50 flex items-center justify-center text-[10px] font-bold text-white mt-0.5 group-hover:bg-brand-500 group-hover:border-brand-400 transition-colors">
                      {idx + 1}
                    </span>
                    <span className="leading-6">{q}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </section>

    </div>
  );
};