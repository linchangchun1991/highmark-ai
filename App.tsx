import React, { useState, useRef, useEffect } from 'react';
import { analyzeResume } from './services/gemini';
import { JobService } from './services/jobStore';
import { AnalysisResult, JobPost } from './types';
import { ResultsDisplay } from './components/ResultsDisplay';
import { BrainCircuitIcon, UploadCloudIcon, CheckCircleIcon, AlertTriangleIcon, BriefcaseIcon, PlusIcon, TrashIcon } from './components/ui/Icons';

// --- ADMIN PANEL COMPONENT ---
const AdminPanel = ({ onClose }: { onClose: () => void }) => {
  const [jobs, setJobs] = useState<JobPost[]>(JobService.getAll());
  const [batchInput, setBatchInput] = useState('');
  
  const handleBatchUpload = () => {
    // Parse tab-separated values (like copy-paste from Excel)
    // Format: Company | Location | Type | Target | Link | Description(Optional)
    const lines = batchInput.trim().split('\n');
    const newJobs: JobPost[] = lines.map((line, idx) => {
      const cols = line.split('\t');
      // Skip empty lines
      if (!cols[0]) return null;
      return {
        id: Date.now().toString() + idx,
        company: cols[0] || 'Unknown',
        location: cols[1] || 'Unknown',
        type: cols[2] || 'Social/Campus',
        target: cols[3] || 'All',
        updated_at: new Date().toISOString().split('T')[0],
        link: cols[4] || '#',
        description: cols[5] || `${cols[0]} ${cols[2]} Role`
      };
    }).filter(job => job !== null) as JobPost[];

    if (newJobs.length === 0) return;

    JobService.addBatch(newJobs);
    setJobs(JobService.getAll());
    setBatchInput('');
    alert(`成功添加 ${newJobs.length} 个岗位！`);
  };

  const handleClear = () => {
    if(confirm('确定清空所有岗位数据吗？')) {
      JobService.clear();
      setJobs([]);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/90 backdrop-blur-xl p-8 overflow-y-auto animate-in fade-in duration-300">
      <div className="max-w-6xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h2 className="text-2xl font-bold text-white flex items-center gap-2">
            <span className="bg-brand-600 p-1 rounded">💼</span> 后台岗位管理 (Admin Job DB)
          </h2>
          <button onClick={onClose} className="text-slate-400 hover:text-white px-4 py-2 rounded-lg hover:bg-white/10 transition-colors">关闭 / Close</button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left: Input */}
          <div className="lg:col-span-1 space-y-4">
            <div className="bg-white/5 p-6 rounded-2xl border border-white/10 shadow-xl">
              <h3 className="font-bold text-brand-cyan mb-4 flex items-center gap-2">
                <PlusIcon className="w-4 h-4" /> 批量导入 (Batch Import)
              </h3>
              <p className="text-xs text-slate-400 mb-3 leading-relaxed">
                请直接从 Excel 复制数据粘贴到下方。列顺序：<br/>
                <code className="text-white bg-black/50 px-1 py-0.5 rounded mt-1 inline-block">公司名 | 地点 | 类型 | 对象 | 链接 | 描述</code>
              </p>
              <textarea
                value={batchInput}
                onChange={(e) => setBatchInput(e.target.value)}
                placeholder={`示例：
字节跳动	北京	校招	2025届	http://...	电商运营
腾讯	深圳	实习	在校生	http://...	产品经理`}
                className="w-full h-64 p-3 bg-black/40 border border-white/10 rounded-xl text-xs font-mono leading-relaxed text-slate-300 focus:border-brand-500 outline-none resize-none"
              />
              <div className="flex gap-3 mt-4">
                <button 
                  onClick={handleBatchUpload}
                  disabled={!batchInput}
                  className="flex-1 bg-brand-600 hover:bg-brand-500 text-white py-2.5 rounded-lg text-sm font-bold transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-brand-500/20"
                >
                  确认导入
                </button>
                <button 
                  onClick={handleClear}
                  className="px-4 border border-red-500/30 text-red-400 hover:bg-red-500/10 rounded-lg text-sm font-bold transition-colors flex items-center gap-2"
                >
                  <TrashIcon className="w-4 h-4" /> 清空
                </button>
              </div>
            </div>
          </div>

          {/* Right: Table */}
          <div className="lg:col-span-2">
            <div className="bg-white/5 rounded-2xl border border-white/10 overflow-hidden shadow-xl h-[600px] flex flex-col">
              <div className="p-4 bg-white/5 border-b border-white/5 flex justify-between items-center flex-shrink-0">
                <span className="font-bold text-white flex items-center gap-2">
                  <BriefcaseIcon className="w-4 h-4" /> 当前岗位库 ({jobs.length})
                </span>
                <span className="text-xs text-slate-500">最新上传优先</span>
              </div>
              <div className="overflow-auto flex-1">
                <table className="w-full text-left text-sm text-slate-300">
                  <thead className="bg-black/20 text-xs uppercase text-slate-500 sticky top-0 backdrop-blur-md">
                    <tr>
                      <th className="px-4 py-3 font-semibold">公司</th>
                      <th className="px-4 py-3 font-semibold">地点</th>
                      <th className="px-4 py-3 font-semibold">类型</th>
                      <th className="px-4 py-3 font-semibold">对象</th>
                      <th className="px-4 py-3 font-semibold">链接</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5">
                    {jobs.length === 0 ? (
                      <tr>
                        <td colSpan={5} className="p-8 text-center text-slate-500">
                          暂无数据，请在左侧导入。
                        </td>
                      </tr>
                    ) : (
                      jobs.map((job) => (
                        <tr key={job.id} className="hover:bg-white/5 transition-colors">
                          <td className="px-4 py-3 font-medium text-white">{job.company}</td>
                          <td className="px-4 py-3 text-xs">{job.location}</td>
                          <td className="px-4 py-3">
                            <span className="px-2 py-0.5 rounded-full bg-brand-500/20 text-brand-300 text-[10px] border border-brand-500/20">
                              {job.type}
                            </span>
                          </td>
                          <td className="px-4 py-3 text-xs text-slate-400">{job.target}</td>
                          <td className="px-4 py-3">
                            <a href={job.link} target="_blank" rel="noreferrer" className="text-brand-400 hover:text-brand-300 text-xs underline truncate max-w-[100px] block">
                              Link
                            </a>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// --- MAIN APP COMPONENT ---
const App = () => {
  const [resumeData, setResumeData] = useState<string>(''); 
  const [isFile, setIsFile] = useState(false);
  const [fileType, setFileType] = useState('');
  const [fileName, setFileName] = useState('');
  
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Admin State
  const [showAdmin, setShowAdmin] = useState(false);
  const [availableJobCount, setAvailableJobCount] = useState(0);

  useEffect(() => {
    // Ensure we are client-side before accessing JobService
    setAvailableJobCount(JobService.getAll().length);
  }, [showAdmin]);

  const handleAnalyze = async () => {
    if (!resumeData) {
      setError("请上传简历 (Please upload a resume).");
      return;
    }

    const jobs = JobService.getAll();
    if (jobs.length === 0) {
      setError("系统岗位库为空，请联系管理员添加岗位。(No jobs in database)");
      return;
    }

    setIsLoading(true);
    setError(null);
    setResult(null);

    try {
      const data = await analyzeResume(resumeData, isFile, fileType, jobs);
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

    setFileName(file.name);
    setFileType(file.type);
    setIsFile(true);

    const reader = new FileReader();
    reader.onload = (event) => {
      const result = event.target?.result as string;
      const base64Data = result.split(',')[1]; 
      setResumeData(base64Data);
    };
    reader.onerror = () => {
      setError("文件读取失败");
    };
    reader.readAsDataURL(file);
  };

  return (
    <div className="min-h-screen bg-background text-slate-300 font-sans selection:bg-brand-500/30 selection:text-brand-cyan pb-20 overflow-x-hidden">
      
      {showAdmin && <AdminPanel onClose={() => setShowAdmin(false)} />}

      {/* Background Ambience */}
      <div className="fixed inset-0 z-0 pointer-events-none">
        <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-brand-600/20 rounded-full blur-[120px] animate-pulse"></div>
        <div className="absolute bottom-0 right-1/4 w-[500px] h-[500px] bg-brand-purple/10 rounded-full blur-[120px]"></div>
      </div>

      {/* Header */}
      <header className="fixed top-0 w-full z-40 bg-background/80 backdrop-blur-xl border-b border-white/5">
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
          <div className="flex items-center gap-4">
            <span className="text-xs font-mono text-slate-500 border border-white/5 px-2 py-1 rounded hidden md:block">
              岗位库: {availableJobCount}
            </span>
          </div>
        </div>
      </header>

      <main className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-32">
        
        {/* User Guide Hero Section */}
        <div className="text-center mb-16 max-w-4xl mx-auto">
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-6 tracking-tight drop-shadow-lg">
            你的 <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-cyan to-brand-purple">AI 求职私教</span>
          </h2>
          <div className="flex flex-col md:flex-row items-center justify-center gap-6 mt-8">
            <div className="flex items-center gap-3 bg-white/5 px-6 py-3 rounded-full border border-white/10">
              <span className="w-6 h-6 rounded-full bg-brand-600 text-white flex items-center justify-center text-xs font-bold">1</span>
              <span className="text-sm font-medium text-slate-300">上传简历 (PDF/Word/Image)</span>
            </div>
            <div className="w-8 h-px bg-white/10 hidden md:block"></div>
            <div className="flex items-center gap-3 bg-white/5 px-6 py-3 rounded-full border border-white/10">
              <span className="w-6 h-6 rounded-full bg-brand-600 text-white flex items-center justify-center text-xs font-bold">2</span>
              <span className="text-sm font-medium text-slate-300">AI 智能匹配内推岗位</span>
            </div>
            <div className="w-8 h-px bg-white/10 hidden md:block"></div>
            <div className="flex items-center gap-3 bg-white/5 px-6 py-3 rounded-full border border-white/10">
              <span className="w-6 h-6 rounded-full bg-brand-600 text-white flex items-center justify-center text-xs font-bold">3</span>
              <span className="text-sm font-medium text-slate-300">获取投递链接 & 辅导建议</span>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12">
          
          {/* Left Column: Upload */}
          <div className="lg:col-span-5 space-y-8">
            
            <div className="glass-panel rounded-3xl p-1 relative group">
              <div className="absolute -inset-0.5 bg-gradient-to-br from-white/10 to-transparent rounded-3xl opacity-50 blur-sm pointer-events-none"></div>
              
              <div className="p-8">
                <div 
                  onClick={() => fileInputRef.current?.click()}
                  className={`border-2 border-dashed rounded-2xl h-64 flex flex-col items-center justify-center cursor-pointer transition-all duration-300 relative overflow-hidden
                    ${fileName 
                      ? 'border-emerald-500/50 bg-emerald-500/5' 
                      : 'border-white/10 hover:border-brand-500/50 hover:bg-white/5'}`}
                >
                  <input 
                    ref={fileInputRef} 
                    type="file" 
                    accept=".pdf,.png,.jpg,.jpeg" 
                    className="hidden" 
                    onChange={handleFileUpload}
                  />
                  
                  {fileName ? (
                    <div className="text-center p-4 animate-in zoom-in-95 duration-300 relative z-10">
                      <div className="w-16 h-16 bg-emerald-500/20 text-emerald-400 rounded-full flex items-center justify-center mx-auto mb-4 shadow-[0_0_20px_rgba(16,185,129,0.3)]">
                        <CheckCircleIcon className="w-8 h-8" />
                      </div>
                      <p className="text-lg font-bold text-emerald-400 mb-1">已就绪 Ready</p>
                      <p className="text-sm text-slate-400">{fileName}</p>
                      <button 
                        onClick={(e) => { e.stopPropagation(); setFileName(''); setResumeData(''); }} 
                        className="text-xs text-red-400 underline mt-4 hover:text-red-300"
                      >
                        移除文件
                      </button>
                    </div>
                  ) : (
                    <div className="text-center relative z-10">
                      <div className="w-20 h-20 bg-brand-500/10 text-brand-400 rounded-full flex items-center justify-center mb-6 mx-auto group-hover:scale-110 transition-transform duration-300">
                        <UploadCloudIcon className="w-10 h-10" />
                      </div>
                      <p className="text-lg font-bold text-white mb-2">点击上传简历</p>
                      <p className="text-sm text-slate-500">支持 PDF, PNG, JPG (Max 10MB)</p>
                    </div>
                  )}
                </div>
              </div>
            </div>

            <button
              onClick={handleAnalyze}
              disabled={isLoading || !resumeData}
              className={`w-full py-5 rounded-2xl font-bold text-lg text-white shadow-2xl transition-all transform active:scale-[0.98] flex items-center justify-center gap-3 relative overflow-hidden group
                ${isLoading || !resumeData
                  ? 'bg-slate-800 cursor-not-allowed text-slate-500' 
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
                  <span className="tracking-widest">AI 解析匹配中...</span>
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
               <p className="text-[10px] uppercase tracking-widest text-slate-400">Powered by Google Gemini 2.0</p>
               <div className="h-px w-8 bg-slate-500"></div>
            </div>
          </div>

          {/* Right Column: Results */}
          <div className="lg:col-span-7">
            {result ? (
              <ResultsDisplay data={result} />
            ) : (
              <div className="h-full min-h-[600px] flex flex-col items-center justify-center text-center p-12 border border-dashed border-white/10 rounded-[32px] bg-white/5 backdrop-blur-sm relative overflow-hidden">
                <div className="w-24 h-24 bg-gradient-to-br from-white/10 to-white/5 rounded-3xl flex items-center justify-center shadow-inner border border-white/10 mb-8 relative z-10 animate-pulse-slow">
                  <BriefcaseIcon className="w-10 h-10 text-slate-400" />
                </div>
                <h3 className="text-2xl font-bold text-white mb-4 relative z-10">等待简历上传 Awaiting Resume</h3>
                <p className="text-slate-400 max-w-md leading-relaxed text-sm font-light relative z-10">
                  我们将在 <b>{availableJobCount}</b> 个优质岗位中为您寻找最佳匹配。<br/>
                  (AI will match you against {availableJobCount} premium jobs)
                </p>
              </div>
            )}
          </div>
        </div>
      </main>

      {/* Footer & Admin Entry */}
      <footer className="fixed bottom-0 w-full py-4 text-center text-xs text-slate-600 border-t border-white/5 bg-background/80 backdrop-blur-md z-30">
        <div className="flex justify-center items-center gap-4">
          <span>© 2024 HIGHMARK CAREER</span>
          <span className="text-slate-700">|</span>
          <button 
            onClick={() => setShowAdmin(true)} 
            className="hover:text-brand-400 transition-colors font-medium"
          >
            Admin Portal
          </button>
        </div>
      </footer>
    </div>
  );
};

export default App;