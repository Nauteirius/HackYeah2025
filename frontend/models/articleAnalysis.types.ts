export type ArticleAnalysis = {
  version: string;
  summary: string;
  likelihood_score: number;
  confidence: number;
  rationale: string;
  key_claims: KeyClaim[];
  detected_tactics: string[];
  risk_factors: string[];
  recommended_checks: string[];
  safety_notes: string[];
  raw_text: string;
}

type KeyClaim = {
  claim: string;
  confidence: number;
}
