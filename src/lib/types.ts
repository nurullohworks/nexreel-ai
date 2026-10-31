export type Severity = "high" | "medium" | "low";

export interface MetricScore {
  key: string;
  label: string;
  score: number;
}

export interface TimelineSegment {
  from: number;
  to: number;
  label: string;
  verdict: "Strong" | "Good" | "Average" | "Weak";
  note?: string;
}

export interface Recommendation {
  id: string;
  severity: Severity;
  title: string;
  current: string;
  recommended: string;
  why: string;
  impact: number;
  currentScore: number;
  potentialScore: number;
}

export interface PredictionResult {
  overall_score: number;
  viral_probability: number;
  estimated_view_min: number;
  estimated_view_max: number;
  estimated_reach_min: number;
  estimated_reach_max: number;
  confidence_score: number;
  strengths: string[];
  weaknesses: string[];
  risk_factors: string[];
}

export type AnalysisStatus = "Analyzed" | "Published" | "Tracking" | "Completed";

export type AlgorithmVerdictState = "UCHADI" | "O'RTACHA" | "UCHMAYDI";

export interface MetaAlgorithmStage {
  name: string;
  description: string;
  passed: boolean;
  score: number;
  threshold: number;
  note: string;
}

export interface MetaAlgorithmBreakdown {
  totalAlgorithmScore: number;
  dmSharesWeight: number; // 35%
  completionLoopWeight: number; // 25%
  hookRetentionWeight: number; // 20%
  saveCommentWeight: number; // 10%
  pacingAudioWeight: number; // 10%
  watermarkPenalty: boolean;
  stages: {
    seedTest: MetaAlgorithmStage; // Stage 1: Initial 200-500 test audience
    lookalikeExpand: MetaAlgorithmStage; // Stage 2: Lookalike seed audience
    exploreViral: MetaAlgorithmStage; // Stage 3: Global Explore / Recommendations
  };
}

export interface LiveDuneBenchmarkItem {
  metric: string;
  current: number;
  nicheAvg: number;
  top10Percent: number;
  unit: "%" | "pts" | "ratio";
  status: "ahead" | "average" | "behind";
}

export interface LiveDuneNicheBenchmark {
  nicheKey: string;
  nicheName: string;
  nicheAvgER: number;
  top10ViralER: number;
  sampleAccountsCount: number;
  benchmarks: LiveDuneBenchmarkItem[];
  insight: string;
}

export interface ExactDeficiency {
  id: string;
  timestamp: string; // e.g. "00:00 - 00:03"
  flaw: string; // e.g. "Hook vizual dinamikasi sust"
  whyItFailsMetaAlgorithm: string; // e.g. "Meta 3-soniyalik testda 68% tomoshabin drop-off qiladi"
  actionableFix: string; // e.g. "Birinchi 1.5s ichida tezkor kadr yoki vizual intriga qo'ying"
  severity: Severity;
}

export interface Analysis {
  id: string;
  title: string;
  fileName: string;
  createdAt: string;
  durationSec: number;
  status: AnalysisStatus;
  prediction: PredictionResult;
  metrics: MetricScore[];
  timeline: TimelineSegment[];
  recommendations: Recommendation[];
  benchmark: { metric: string; reel: number; accountAvg: number; benchmark: number }[];
  actualViews?: number | undefined;
  niche?: string;
  metaAlgorithm?: MetaAlgorithmBreakdown;
  liveDuneBenchmark?: LiveDuneNicheBenchmark;
  exactDeficiencies?: ExactDeficiency[];
  verdict: {
    state: "Ready to post" | "Ready with improvements" | "Needs work";
    algorithmVerdict?: AlgorithmVerdictState;
    summary: string;
    fixes: string[];
    potentialScore: number;
  };
}

export interface AccountSnapshot {
  handle: string;
  followers: number;
  avgReelViews: number;
  avgEngagement: number;
  growth: number;
  consistency: number;
  viewsOverTime: { label: string; views: number; engagement: number }[];
  followerGrowth: { label: string; followers: number }[];
  topReels: { title: string; views: number; engagement: number }[];
  lowReels: { title: string; views: number; engagement: number }[];
  patterns: string[];
}

export type PlanId = "free" | "pro" | "agency";

export interface Subscription {
  plan: PlanId;
  status: "active" | "trialing" | "canceled";
  renewsAt: string;
  usedThisMonth: number;
  monthlyLimit: number;
  billingCycle: "monthly" | "yearly";
  // AI Credit Economy (Token-protective unit economics)
  creditsTotal?: number;
  creditsUsed?: number;
  creditsRemaining?: number;
}
