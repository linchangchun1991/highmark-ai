import { GoogleGenAI, Type } from "@google/genai";
import { SYSTEM_INSTRUCTION } from "../utils/prompts";
import { AnalysisResult, JobPost } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

// 辅助函数：将 JobPost 数组转换为 AI 可读的文本列表
const formatJobsForPrompt = (jobs: JobPost[]) => {
  return jobs.map((job, index) => `
  [Job ID: ${job.id}]
  Company: ${job.company}
  Location: ${job.location}
  Type: ${job.type}
  Target: ${job.target}
  Description: ${job.description || job.company + ' ' + job.type}
  `).join('\n-------------------\n');
};

export const analyzeResume = async (
  resumeData: string, // Can be text or Base64 string
  isFile: boolean,
  mimeType: string = 'application/pdf',
  availableJobs: JobPost[]
): Promise<AnalysisResult> => {
  
  const jobsContext = formatJobsForPrompt(availableJobs);

  const promptText = `
  Please analyze the candidate's resume and match it against the following [JOB DATABASE].
  Select the top 3-5 matches strictly from the provided database.

  [JOB DATABASE]:
  ${jobsContext}
  `;

  // Prepare contents based on input type
  let contents: any[] = [];
  
  if (isFile) {
    // If it's a file, we send the base64 data + the prompt text
    contents = [
      {
        inlineData: {
          mimeType: mimeType,
          data: resumeData
        }
      },
      {
        text: promptText
      }
    ];
  } else {
    // If it's raw text
    contents = [
      {
        text: `【Candidate Resume】:\n${resumeData}\n\n${promptText}`
      }
    ];
  }

  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: contents as any, // Cast to avoid TS strict check on overloaded method
      config: {
        systemInstruction: SYSTEM_INSTRUCTION,
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            profile: {
              type: Type.OBJECT,
              properties: {
                positioning: { type: Type.STRING },
                strengths: { type: Type.ARRAY, items: { type: Type.STRING } },
                fatal_flaw: { type: Type.STRING },
              },
              required: ["positioning", "strengths", "fatal_flaw"],
            },
            job_recommendations: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  job_id: { type: Type.STRING, description: "Must match the ID from the Job Database provided." },
                  job_name: { type: Type.STRING },
                  match_score: { type: Type.NUMBER },
                  reason_why_you: { type: Type.STRING },
                  risk_why_not: { type: Type.STRING },
                },
                required: ["job_id", "job_name", "match_score", "reason_why_you", "risk_why_not"],
              },
            },
            coaching_strategy: {
              type: Type.OBJECT,
              properties: {
                resume_fix: { type: Type.STRING },
                interview_questions: { type: Type.ARRAY, items: { type: Type.STRING } },
              },
              required: ["resume_fix", "interview_questions"],
            },
          },
          required: ["profile", "job_recommendations", "coaching_strategy"],
        },
      },
    });

    const text = response.text;
    if (!text) throw new Error("No response from AI");
    
    const result = JSON.parse(text) as AnalysisResult;

    // Post-process: Attach the real links from the database based on ID
    result.job_recommendations = result.job_recommendations.map(rec => {
      const originalJob = availableJobs.find(j => j.id === rec.job_id);
      return {
        ...rec,
        company_nature: originalJob?.type || 'N/A', // Mapping generic fields back
        apply_link: originalJob?.link || '#'
      };
    });

    return result;

  } catch (error) {
    console.error("Gemini API Error:", error);
    throw new Error("简历解析失败。请确保上传的是清晰的 PDF 或图片文件，或者文件未加密。\n(Analysis Failed. Please check file format)");
  }
};
