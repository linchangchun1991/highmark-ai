import React, { useState, useRef } from 'react';
import { analyzeResume } from './services/gemini';
import { AnalysisResult } from './types';
import { ResultsDisplay } from './components/ResultsDisplay';
import { BrainCircuitIcon, FileTextIcon, BriefcaseIcon, UploadCloudIcon, CheckCircleIcon, AlertTriangleIcon, PlusIcon, TrashIcon } from './components/ui/Icons';

const App = () => {
  const [resumeText, setResumeText] = useState('');
  
  // Job Pool State
  const [jobPool, setJobPool] = useState<string[]>([]);
  const [currentJobInput, setCurrentJobInput] = useState('');
  
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [inputMode, setInputMode] = useState<'upload' | 'paste'>('upload');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleAddJob = () => {
    if (!currentJobInput.trim()) return;
    setJobPool([...jobPool, currentJobInput.trim()]);
    setCurrentJobInput('');
  };

  const handleRemoveJob = (index: number) => {
    const newPool = [...jobPool];
    newPool.splice(index, 1);
    setJobPool(newPool);
  };

  const handleAnalyze = async () => {
    if (!resumeText.trim()) {
      setError("请上传简历或粘贴简历内容 (Please provide resume content).");
      return;
    }

    // Combine jobs from pool into a context string
    let finalJobContext = "";
    if (jobPool.length > 0) {
      finalJobContext = "【待匹配岗位列表】:\n" + jobPool.map((job, i) => `${i+1}. ${job}`).join("\n\n");
    } else {
      finalJobContext = "用户未指定具体岗位，请根据简历自动推荐最适合的3-5个岗位方向（包括互联网大厂、国企或外企）并进行匹配分析。";
    }

    setIsLoading(true);
    setError(null);
    setResult(null);

    try {
      const data = await analyzeResume(resumeText, finalJobContext);
      setResult(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "发生未知错误，请重试。");
    } finally {
      setIsLoading(false);
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.type === "application/pdf") {
      alert("目前暂不支持直接解析PDF，请复制PDF中的文字粘贴到文本框中。(PDF Parsing not supported client-side, please copy-paste text)");
      setInputMode('paste');
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target?.result as string;
      setResumeText(text);
    };
    reader.onerror = () => {
      setError("无法读取文件，请尝试直接粘贴文本。");
    };
    reader.readAsText(file);
  };

  const handleLoadDemo = () => {
    setInputMode('paste');
    setResumeText(`澳洲悉尼大学 (USYD) 硕士，Master of Media Practice。
本科 国内211大学 广告学专业 GPA 3.6/4.0。
语言能力：雅思 7.5 (阅读8.5)，可全英文工作。
实习经历：
1. 蓝色光标 (BlueFocus) - 公关实习生 (3个月)：负责某快消品牌双微一抖文案撰写，月均产出20+篇，参与策划618整合营销方案。
2. 字节跳动 (ByteDance) - 内容运营日常实习 (2个月)：负责今日头条内容质量把控，协助处理用户反馈。
校园经历：校学生会外联部部长，成功拉取赞助商5家，赞助金额3万元。
技能：熟练使用Office套件，PS/PR基础，会使用秀米排版。`);
    
    setJobPool([
      "字节跳动 - 国际化电商运营管培生 JD: 负责TikTok电商内容生态建设，需要流利的英语沟通能力及数据分析能力。",
      "京东 - 采销管培生 (3C数码) JD: 负责品类规划与供应商谈判，需要极强的抗压能力和商务谈判技巧。",
      "群邑中国 - 媒介策划专员 JD: 负责客户广告投放策略制定，需要对数字媒体趋势有敏锐洞察。"
    ]);
  };

  return (
    <div className="min-h-screen bg-background text-slate-300 font-sans selection:bg-brand-500/30 selection:text-brand-cyan pb-20 overflow-x-hidden">
      
      {/* Background Ambience */}
      <div className="fixed inset-0 z-0 pointer-events-none">
        <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-brand-600/20 rounded-full blur-[120px] animate-pulse"></div>
        <div className="absolute bottom-0 right-1/4 w-[500px] h-[500px] bg-brand-purple/10 rounded-full blur-[120px]"></div>
      </div>

      {/* Header */}
      <header className="fixed top-0 w-full z-50 bg-background/80 backdrop-blur-xl border-b border-white/5">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="bg-gradient-to-br from-brand-600 to-brand-900 text-white p-2.5 rounded-xl shadow-[0_0_15px_rgba(79,70,229,0.4)]">
              <BrainCircuitIcon className="w-6 h-6" />
            </div>
            <div className="flex flex-col">
              <h1 className="text-xl font-bold text-white tracking-tight leading-none flex items-center gap-2">
                HIGHMARK CAREER <span className="font-light text-white/30">|</span> 海马职加
              </h1>
              <p className="text-[10px] text-brand-cyan font-bold uppercase tracking-[0.2em] mt-1 text-opacity-80">AI Career Intelligence</p>
            </div>
          </div>
          <button 
            onClick={handleLoadDemo}
            className="hidden sm:block text-xs font-semibold text-slate-400 hover:text-white border border-white/10 hover:border-brand-500/50 hover:bg-white/5 px-4 py-2 rounded-full transition-all duration-300"
          >
            加载演示数据
          </button>
        </div>
      </header>

      <main className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-32">
        
        {/* Intro */}
        <div className="text-center mb-16 max-w-3xl mx-auto">
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-6 tracking-tight drop-shadow-lg">
            数字化选岗与 <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-cyan to-brand-purple">竞争力分析</span>
          </h2>
          <p className="text-slate-400 text-lg md:text-xl font-light leading-relaxed">
            基于 500 强企业用人标准，为您提供 <span className="text-white font-normal">精准岗位匹配</span> 与 <span className="text-white font-normal">专家级求职建议</span>。
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12">
          
          {/* Left Column: Inputs */}
          <div className="lg:col-span-5 space-y-8">
            
            {/* Step 1: Resume */}
            <div className="glass-panel rounded-3xl p-1 relative group">
              <div className="absolute -inset-0.5 bg-gradient-to-br from-white/10 to-transparent rounded-3xl opacity-50 blur-sm pointer-events-none"></div>
              
              <div className="p-6 pb-2 relative">
                 <h2 className="text-lg font-bold text-white mb-1 flex items-center gap-3">
                  <span className="w-7 h-7 rounded-full bg-brand-600 flex items-center justify-center text-sm shadow-[0_0_10px_rgba(79,70,229,0.4)]">1</span>
                  简历输入 <span className="text-slate-500 text-sm font-normal ml-auto">RESUME INPUT</span>
                </h2>
              </div>

              <div className="px-6 pb-6 relative">
                {/* Tabs */}
                <div className="flex gap-2 mb-4 bg-black/20 p-1 rounded-xl border border-white/5">
                  <button 
                    onClick={() => setInputMode('upload')}
                    className={`flex-1 py-2.5 text-xs font-bold uppercase tracking-wider rounded-lg transition-all flex items-center justify-center gap-2 ${inputMode === 'upload' ? 'bg-white/10 text-white shadow-sm' : 'text-slate-500 hover:text-slate-300'}`}
                  >
                    <UploadCloudIcon className="w-4 h-4" /> 上传文件
                  </button>
                  <button 
                    onClick={() => setInputMode('paste')}
                    className={`flex-1 py-2.5 text-xs font-bold uppercase tracking-wider rounded-lg transition-all flex items-center justify-center gap-2 ${inputMode === 'paste' ? 'bg-white/10 text-white shadow-sm' : 'text-slate-500 hover:text-slate-300'}`}
                  >
                    <FileTextIcon className="w-4 h-4" /> 粘贴文本
                  </button>
                </div>

                {inputMode === 'upload' ? (
                  <div 
                    onClick={() => fileInputRef.current?.click()}
                    className={`border-2 border-dashed rounded-2xl h-48 flex flex-col items-center justify-center cursor-pointer transition-all duration-300 ${resumeText ? 'border-brand-500/50 bg-brand-500/5' : 'border-white/10 hover:border-brand-500/50 hover:bg-white/5'}`}
                  >
                    <input 
                      ref={fileInputRef} 
                      type="file" 
                      accept=".txt,.md,.json" 
                      className="hidden" 
                      onChange={handleFileUpload}
                    />
                    {resumeText ? (
                      <div className="text-center p-4 animate-in zoom-in-95 duration-300">
                        <div className="w-12 h-12 bg-emerald-500/20 text-emerald-400 rounded-full flex items-center justify-center mx-auto mb-3 shadow-[0_0_15px_rgba(16,185,129,0.2)]">
                          <CheckCircleIcon className="w-6 h-6" />
                        </div>
                        <p className="text-sm font-bold text-emerald-400">简历已导入</p>
                        <p className="text-xs text-slate-400 mt-2 line-clamp-2 px-4 italic">"{resumeText.substring(0, 50)}..."</p>
                        <button onClick={(e) => { e.stopPropagation(); setResumeText(''); }} className="text-xs text-red-400 underline mt-4 hover:text-red-300 transition-colors">删除并重新上传</button>
                      </div>
                    ) : (
                      <div className="text-center">
                        <div className="w-14 h-14 bg-white/5 text-slate-400 rounded-full flex items-center justify-center mb-4 mx-auto group-hover:scale-110 transition-transform duration-300">
                          <UploadCloudIcon className="w-7 h-7" />
                        </div>
                        <p className="text-sm font-medium text-slate-300">点击上传简历 (.txt, .md)</p>
                        <p className="text-xs text-slate-500 mt-2">暂仅支持文本文件</p>
                      </div>
                    )}
                  </div>
                ) : (
                   <textarea
                    value={resumeText}
                    onChange={(e) => setResumeText(e.target.value)}
                    placeholder="在此处粘贴您的简历全文..."
                    className="w-full h-48 p-4 rounded-2xl bg-black/20 border border-white/10 focus:ring-2 focus:ring-brand-500/50 focus:border-transparent outline-none resize-none text-sm leading-relaxed placeholder:text-slate-600 text-slate-300 transition-all"
                  />
                )}
              </div>
            </div>

            {/* Step 2: Job Pool (Batch Upload) */}
            <div className="glass-panel rounded-3xl p-1 relative">
              <div className="p-6 pb-2">
                 <h2 className="text-lg font-bold text-white mb-1 flex items-center gap-3">
                  <span className="w-7 h-7 rounded-full bg-brand-600 flex items-center justify-center text-sm shadow-[0_0_10px_rgba(79,70,229,0.4)]">2</span>
                  批量上传岗位 <span className="text-slate-500 text-sm font-normal ml-auto">BATCH JOB UPLOAD</span>
                </h2>
              </div>
              <div className="px-6 pb-6">
                
                {/* Add Job Input */}
                <div className="mb-4">
                  <div className="relative">
                    <textarea
                      value={currentJobInput}
                      onChange={(e) => setCurrentJobInput(e.target.value)}
                      placeholder="方法1：粘贴一个 JD (职位描述)。
方法2：输入岗位名称 (如：字节跳动运营)。
然后点击右下角 '+' 号添加到匹配池。"
                      className="w-full h-24 p-4 pr-12 rounded-xl bg-black/20 border border-white/10 focus:ring-2 focus:ring-brand-500/50 focus:border-transparent outline-none resize-none text-sm leading-relaxed placeholder:text-slate-600 text-slate-300 transition-all"
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' && !e.shiftKey) {
                          e.preventDefault();
                          handleAddJob();
                        }
                      }}
                    />
                    <button 
                      onClick={handleAddJob}
                      className="absolute bottom-3 right-3 px-3 py-1.5 bg-brand-600 hover:bg-brand-500 text-white text-xs font-bold rounded-lg shadow-lg transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1"
                      disabled={!currentJobInput.trim()}
                    >
                      <PlusIcon className="w-3 h-3" /> 添加
                    </button>
                  </div>
                  <p className="text-[10px] text-slate-500 mt-2 ml-1">提示: 这里的“添加”是存入临时匹配池。您可以重复添加多个岗位，一次性进行批量匹配分析。</p>
                </div>

                {/* Job List */}
                <div className="space-y-2 max-h-48 overflow-y-auto pr-1 custom-scrollbar">
                  {jobPool.length === 0 ? (
                     <div className="text-center py-6 border border-dashed border-white/10 rounded-xl bg-white/5">
                        <p className="text-xs text-slate-500">岗位池为空</p>
                        <p className="text-[10px] text-slate-600 mt-1">请添加岗位，或留空让 AI 自动推荐</p>
                     </div>
                  ) : (
                    jobPool.map((job, idx) => (
                      <div key={idx} className="flex items-start gap-3 p-3 bg-white/5 rounded-lg border border-white/5 hover:bg-white/10 transition-colors group">
                        <div className="flex-shrink-0 w-5 h-5 rounded bg-brand-500/20 text-brand-400 flex items-center justify-center text-[10px] font-bold mt-0.5">
                          {idx + 1}
                        </div>
                        <p className="text-xs text-slate-300 line-clamp-2 flex-grow leading-relaxed">{job}</p>
                        <button 
                          onClick={() => handleRemoveJob(idx)}
                          className="text-slate-600 hover:text-red-400 transition-colors p-1"
                        >
                          <TrashIcon className="w-4 h-4" />
                        </button>
                      </div>
                    ))
                  )}
                </div>

              </div>
            </div>

            <button
              onClick={handleAnalyze}
              disabled={isLoading}
              className={`w-full py-5 rounded-2xl font-bold text-lg text-white shadow-2xl transition-all transform active:scale-[0.98] flex items-center justify-center gap-3 relative overflow-hidden group
                ${isLoading 
                  ? 'bg-slate-700 cursor-not-allowed' 
                  : 'bg-gradient-to-r from-brand-600 via-brand-500 to-brand-cyan hover:shadow-[0_0_40px_rgba(99,102,241,0.5)]'
                }`}
            >
               {/* Shine Effect */}
               <div className="absolute top-0 -inset-full h-full w-1/2 z-5 block transform -skew-x-12 bg-gradient-to-r from-transparent to-white opacity-20 group-hover:animate-shine" />

              {isLoading ? (
                <>
                  <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  <span className="tracking-widest">正在深度分析...</span>
                </>
              ) : (
                <>
                  <BrainCircuitIcon className="w-5 h-5" />
                  <span className="tracking-widest">开始匹配分析</span>
                </>
              )}
            </button>
            
            {error && (
              <div className="p-4 bg-red-500/10 text-red-400 text-sm rounded-xl border border-red-500/20 flex items-start gap-3 animate-in fade-in slide-in-from-top-2">
                <AlertTriangleIcon className="w-5 h-5 flex-shrink-0" />
                <div><span className="font-bold">System Error:</span> {error}</div>
              </div>
            )}
            
            <div className="flex justify-center items-center gap-4 opacity-30 grayscale hover:grayscale-0 transition-all duration-500">
               <div className="h-px w-8 bg-slate-500"></div>
               <p className="text-[10px] uppercase tracking-widest text-slate-400">Powered by Google Gemini 2.5</p>
               <div className="h-px w-8 bg-slate-500"></div>
            </div>
          </div>

          {/* Right Column: Results */}
          <div className="lg:col-span-7">
            {result ? (
              <ResultsDisplay data={result} />
            ) : (
              <div className="h-full min-h-[600px] flex flex-col items-center justify-center text-center p-12 border border-dashed border-white/10 rounded-[32px] bg-white/5 backdrop-blur-sm relative overflow-hidden">
                {/* Decorative Background */}
                <div className="absolute inset-0 bg-gradient-radial from-brand-600/10 to-transparent opacity-50"></div>
                
                <div className="w-24 h-24 bg-gradient-to-br from-white/10 to-white/5 rounded-3xl flex items-center justify-center shadow-inner border border-white/10 mb-8 relative z-10 animate-pulse-slow">
                  <BriefcaseIcon className="w-10 h-10 text-slate-400" />
                </div>
                <h3 className="text-2xl font-bold text-white mb-4 relative z-10">等待分析 Awaiting Input</h3>
                <p className="text-slate-400 max-w-md leading-relaxed text-sm font-light relative z-10">
                  请在左侧上传简历。<br/>
                  如果您没有具体的意向岗位，我们的 AI 引擎将为您自动推荐并进行竞争力分析。
                </p>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
};

export default App;