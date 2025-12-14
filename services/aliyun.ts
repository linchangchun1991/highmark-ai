import { SYSTEM_INSTRUCTION } from "../utils/prompts";
import { AnalysisResult } from "../types";

// 注意：在实际生产环境中，API Key 应该存储在后端服务器，不要暴露在前端代码中。
// 这里为了演示方便，直接使用了您提供的 Key。
const API_KEY = 'sk-668c28bae516493d9ea8a3662118ec98'; 

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

  // 阿里云 Qwen-Max 调用地址
  const url = 'https://dashscope.aliyuncs.com/api/v1/services/aigc/text-generation/generation';

  const body = {
    model: 'qwen-max', // 使用通义千问 Max 模型，逻辑能力最强
    input: {
      messages: [
        { role: 'system', content: SYSTEM_INSTRUCTION },
        { role: 'user', content: userPrompt }
      ]
    },
    parameters: {
      result_format: 'message',
      temperature: 0.7, // 稍微降低随机性，保证分析严谨
      top_p: 0.8,
      enable_search: false // 不需要联网搜索，只做分析
    }
  };

  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(body)
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(`Alibaba Cloud API Error: ${errorData.message || response.statusText}`);
    }

    const data = await response.json();
    let content = data.output.choices[0].message.content;

    // 清洗数据，确保是纯 JSON
    // 有时候大模型会输出 ```json ... ```，我们需要去掉 Markdown 标记
    content = content.replace(/```json/g, '').replace(/```/g, '').trim();

    return JSON.parse(content) as AnalysisResult;

  } catch (error) {
    console.error("Analysis Error:", error);
    throw new Error("分析失败，请检查网络或稍后重试。(Failed to analyze via Qwen)");
  }
};