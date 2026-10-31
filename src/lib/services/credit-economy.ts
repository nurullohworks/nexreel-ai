import type { PlanId } from "../types";

export interface AIModelCostConfig {
  id: string;
  name: string;
  provider: "Google" | "Anthropic" | "OpenAI";
  creditsCost: number;
  speed: string;
  tokenEstimate: string;
  costUsdPerAnalysis: number;
  description: string;
}

export interface CreditTopUpPackage {
  id: string;
  credits: number;
  priceUzSum: number;
  priceUsd: number;
  popular?: boolean;
  bonus?: string;
}

/**
 * Plan monthly credit distributions.
 * Calibrated specifically so the platform operates with an 88.7% - 98.4% profit margin
 * and NEVER runs at a loss even under maximum token consumption!
 */
export const PLAN_CREDITS: Record<PlanId, { monthlyCredits: number; name: string; maxAnalyses: string }> = {
  free: {
    monthlyCredits: 50,
    name: "Free Boshlang'ich",
    maxAnalyses: "5 ta tahlilgacha",
  },
  pro: {
    monthlyCredits: 1200,
    name: "Pro Yaratuvchi",
    maxAnalyses: "120 ta Flash yoki 24-30 ta Claude/GPT-4o tahlil",
  },
  agency: {
    monthlyCredits: 4000,
    name: "Agency & SMM",
    maxAnalyses: "400 ta Flash yoki 80-160 ta Claude/GPT-4o tahlil",
  },
};

/**
 * Model Token & Credit consumption specifications.
 * Proportional to real API pricing per million tokens.
 */
export const MODEL_CREDIT_COSTS: Record<string, AIModelCostConfig> = {
  "gemini-2.5-flash": {
    id: "gemini-2.5-flash",
    name: "Google Gemini 2.5 Flash",
    provider: "Google",
    creditsCost: 10,
    speed: "Ultra tezkor (1.2s)",
    tokenEstimate: "~4,000 token",
    costUsdPerAnalysis: 0.002, // ~$0.002 per analysis
    description: "Ultra tezkor va eng tejamkor tahlil. Standart Reels uchun tavsiya etiladi.",
  },
  "gemini-1.5-pro": {
    id: "gemini-1.5-pro",
    name: "Google Gemini 1.5 Pro",
    provider: "Google",
    creditsCost: 25,
    speed: "Chuqur tahlil (3.4s)",
    tokenEstimate: "~6,000 token",
    costUsdPerAnalysis: 0.015, // ~$0.015 per analysis
    description: "Katta kontekstli, chuqur xronometraj va B-roll diagnostikasi.",
  },
  "gpt-4o": {
    id: "gpt-4o",
    name: "OpenAI GPT-4o",
    provider: "OpenAI",
    creditsCost: 40,
    speed: "Yuqori tezlik (2.8s)",
    tokenEstimate: "~5,000 token",
    costUsdPerAnalysis: 0.035, // ~$0.035 per analysis
    description: "Vizual kadrlar va matn intrigasini multimodal tekshirish.",
  },
  "claude-3-7-sonnet": {
    id: "claude-3-7-sonnet",
    name: "Claude 3.7 Sonnet",
    provider: "Anthropic",
    creditsCost: 50,
    speed: "Chuqur reasoning (4.1s)",
    tokenEstimate: "~6,500 token",
    costUsdPerAnalysis: 0.055, // ~$0.055 per analysis
    description: "Eng yuqori reasoning va psixologik retention diagnostikasi.",
  },
};

/**
 * Extra Action Costs
 */
export const ACTION_CREDIT_COSTS = {
  script_generation: 10, // 5x Viral Hook & Ssenariy
  pdf_audit_export: 0,   // Pro va Agency uchun bepul, Free uchun 5
};

/**
 * Add-on Credit Top-Up packages when credits run out
 */
export const CREDIT_TOPUP_PACKAGES: CreditTopUpPackage[] = [
  {
    id: "topup-300",
    credits: 300,
    priceUzSum: 49000,
    priceUsd: 4,
    bonus: "+30 ta Flash tahlil",
  },
  {
    id: "topup-1000",
    credits: 1000,
    priceUzSum: 129000,
    priceUsd: 10,
    popular: true,
    bonus: "+100 ta Flash tahlil (ENG OMMABOP)",
  },
  {
    id: "topup-2500",
    credits: 2500,
    priceUzSum: 249000,
    priceUsd: 19,
    bonus: "+250 ta Flash yoki 50 ta Claude tahlil",
  },
];

export class CreditEconomyService {
  /**
   * Returns model configuration or defaults to Gemini 2.5 Flash
   */
  static getModelCost(modelId?: string): AIModelCostConfig {
    if (!modelId) return MODEL_CREDIT_COSTS["gemini-2.5-flash"];
    return MODEL_CREDIT_COSTS[modelId] || MODEL_CREDIT_COSTS["gemini-2.5-flash"];
  }

  /**
   * Returns monthly credit allotment for given plan
   */
  static getPlanCredits(plan: PlanId): number {
    return PLAN_CREDITS[plan]?.monthlyCredits || 50;
  }

  /**
   * Computes profit margin for a specific plan and model
   * Demonstrates zero-loss business architecture
   */
  static calculateUnitEconomics(plan: PlanId, modelId: string): {
    planRevenueUsd: number;
    totalPossibleAnalyses: number;
    maxApiCostUsd: number;
    netProfitUsd: number;
    profitMarginPercent: number;
  } {
    const planCredits = this.getPlanCredits(plan);
    const model = this.getModelCost(modelId);
    const planRevenueUsd = plan === "agency" ? 39 : plan === "pro" ? 15 : 0;

    const totalPossibleAnalyses = Math.floor(planCredits / model.creditsCost);
    const maxApiCostUsd = totalPossibleAnalyses * model.costUsdPerAnalysis;
    const netProfitUsd = Math.max(0, planRevenueUsd - maxApiCostUsd);
    const profitMarginPercent = planRevenueUsd > 0
      ? Math.round(((planRevenueUsd - maxApiCostUsd) / planRevenueUsd) * 1000) / 10
      : 0;

    return {
      planRevenueUsd,
      totalPossibleAnalyses,
      maxApiCostUsd: Math.round(maxApiCostUsd * 100) / 100,
      netProfitUsd: Math.round(netProfitUsd * 100) / 100,
      profitMarginPercent,
    };
  }

  /**
   * Check if user has sufficient credits
   */
  static hasEnoughCredits(currentCredits: number, requiredCredits: number): boolean {
    return currentCredits >= requiredCredits;
  }
}
