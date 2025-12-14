import { JobPost } from "../types";

const STORAGE_KEY = 'highmark_job_db';

// 初始演示数据
const DEFAULT_JOBS: JobPost[] = [
  {
    id: '1',
    company: '字节跳动 (ByteDance)',
    location: '北京/上海',
    type: '校招',
    target: '2024/2025届毕业生',
    updated_at: '2024-03-15',
    link: 'https://jobs.bytedance.com',
    description: '国际化电商运营管培生，负责TikTok Shop内容生态建设，需要流利英语及数据驱动思维。'
  },
  {
    id: '2',
    company: '腾讯 (Tencent)',
    location: '深圳',
    type: '实习',
    target: '在校生',
    updated_at: '2024-03-14',
    link: 'https://join.qq.com',
    description: '微信事业群产品策划实习生，协助各行业小程序解决方案落地，要求逻辑严密，有Axure经验。'
  },
  {
    id: '3',
    company: '中金公司 (CICC)',
    location: '北京/香港',
    type: '社招',
    target: '1-3年经验',
    updated_at: '2024-03-10',
    link: 'https://cicc.com',
    description: '投资银行部分析师 (Analyst)，负责行业研究与财务模型搭建，CPA/CFA优先。'
  },
  {
    id: '4',
    company: '宝洁 (P&G)',
    location: '广州',
    type: '校招',
    target: '应届生',
    updated_at: '2024-03-12',
    link: 'https://pg.com',
    description: '品牌管理部 (Brand Management) 管培生，负责品牌Go-to-market策略，全英文面试。'
  }
];

export const JobService = {
  getAll: (): JobPost[] => {
    const data = localStorage.getItem(STORAGE_KEY);
    if (!data) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(DEFAULT_JOBS));
      return DEFAULT_JOBS;
    }
    return JSON.parse(data);
  },

  saveAll: (jobs: JobPost[]) => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(jobs));
  },

  addBatch: (newJobs: JobPost[]) => {
    const current = JobService.getAll();
    const updated = [...newJobs, ...current];
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  },
  
  clear: () => {
    localStorage.removeItem(STORAGE_KEY);
  }
};
