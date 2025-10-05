import { ArticleAnalysis } from "@/models/articleAnalysis.types";

const sleep = (delay: number) => {
  return new Promise((resolve) => setTimeout(resolve, delay));
};

export const getArticleAnalysis = (): ArticleAnalysis => ({
  version: "1.0.0",
  summary:
    "Article claims '30% of users are affected by data breach' with unverified statistics",
  likelihood_score: 0.65,
  confidence: 0.78,
  rationale:
    "Article cites a non-peer-reviewed internal report from a company with no public evidence of the breach",
  key_claims: [
    {
      claim: "30% of users were impacted by data breach",
      confidence: 0.45,
    },
    {
      claim: "Breach occurred in Q3 2023",
      confidence: 0.82,
    },
  ],
  detected_tactics: [
    "unverified sources",
    "statistical manipulation",
    "sponsored content framing",
  ],
  risk_factors: ["lack of primary evidence", "potential for misrepresentation"],
  recommended_checks: [
    "Verify the internal report's existence via company public records",
    "Cross-check breach timelines with official security advisories",
    "Identify author's affiliations to assess bias",
  ],
  safety_notes: [
    "Do not share unverified statistics from internal reports publicly",
    "Check for sponsored content links in the article",
  ],
  raw_text: `Raw JSON from model: {"article_title": "New Data Breach Study", "claim": "30% of users affected", "source": "Internal memo", "evidence": "No public links"}`,
});

export const makeRequest = async (
  text: string
): Promise<ArticleAnalysis | null> => {
  await sleep(1000);

  try {
    const req = await fetch(
      "https://backend-hackyeah.encape.me/fact-check-api/predict",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: "Basic hackyeah-haey",
        },
        body: JSON.stringify({
          mode: "article",
          text,
          author: "Custom",
        }),
      }
    );

    if (!req.ok) {
      console.error("Request failed with status:", req.status);
      return null;
    }

    const body = await req.json();
    return body;
  } catch (error) {
    console.error("Fetch error:", error);
    return null;
  }
};
