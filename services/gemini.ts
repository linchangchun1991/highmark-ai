import { GoogleGenAI, Type } from "@google/genai";
import { SYSTEM_INSTRUCTION } from "../utils/prompts";
import { AnalysisResult } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export const analyzeResume = async (
  resumeText: string,
  jobContext: string
): Promise<AnalysisResult> => {
  const userPrompt = `
  【学员简历内容】：
  ${resumeText}

  【待匹配岗位池 / 学员意向方向】：
  ${jobContext}
  `;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: userPrompt,
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
                  job_name: { type: Type.STRING },
                  company_nature: { type: Type.STRING },
                  match_score: { type: Type.NUMBER },
                  reason_why_you: { type: Type.STRING },
                  risk_why_not: { type: Type.STRING },
                },
                required: ["job_name", "company_nature", "match_score", "reason_why_you", "risk_why_not"],
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
    
    return JSON.parse(text) as AnalysisResult;
  } catch (error) {
    console.error("Gemini API Error:", error);
    throw new Error("Failed to analyze resume. Please try again.");
  }
};