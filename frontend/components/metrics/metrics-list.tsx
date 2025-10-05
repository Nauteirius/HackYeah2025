import { ArticleAnalysis } from "@/models/articleAnalysis.types";
import { Card, CardBody } from "@heroui/card";
import { ScrollShadow } from "@heroui/scroll-shadow";
import React, { useMemo } from "react";
import MetricScore from "./metric-score";
import { interpolateColor } from "@/utils/utils";
import SummaryReport from "./types/summary-report";
import LikelihoodScoreReport from "./types/likelihood-score-report";
import ConfidenceReport from "./types/confidence-report";
import DetectedTacticsReport from "./types/detected-tactics-report";
import VersionReport from "./types/version-report";
import RationaleReport from "./types/rationale-report";
import KeyClaimsReport from "./types/key-claims-report";
import RiskFactorsReport from "./types/risk-factors-report";
import RecommendedChecksReport from "./types/recommended-checks-report";
import SafetyNotesReport from "./types/safety-notes-report";
import RawTextReport from "./types/raw-text-report";
import { Divider } from "@heroui/divider";

type Props = {
  data: ArticleAnalysis | null;
  isModal?: boolean;
};

const MetricsList = ({ data, isModal }: Props) => {
  if (data == null) return <></>;

  return (
    <>
      <div
        className={`${isModal ? "grid grid-cols-1 md:grid-cols-2 gap-6" : "flex flex-col items-center"} w-full max-w-full mx-auto py-4`}
      >
        {data.summary && (
          <div className={`${isModal ? "col-span-2" : "w-full pb-3"}`}>
            <SummaryReport value={data.summary} />
            {!isModal && <Divider className="mt-6" />}
          </div>
        )}

        {isModal && (
          <div
            className={`${isModal ? "" : "flex flex-wrap gap-4 justify-center w-full pb-3"}`}
          >
            {data.likelihood_score !== undefined && (
              <LikelihoodScoreReport value={data.likelihood_score * 100} />
            )}
            {!isModal && <Divider className="mt-6" />}
          </div>
        )}

        {isModal && (
          <div
            className={`${isModal ? "" : "flex flex-wrap gap-4 justify-center w-full pb-3"}`}
          >
            {data.confidence !== undefined && (
              <ConfidenceReport value={data.confidence} />
            )}
            {!isModal && <Divider className="mt-6" />}
          </div>
        )}

        {data.rationale && isModal && (
          <div
            className={`${isModal ? "col-span-2  px-1" : "w-full px-1 pb-3"}`}
          >
            <RationaleReport value={data.rationale} />
            {!isModal && <Divider className="mt-6" />}
          </div>
        )}

        {data.key_claims && isModal && (
          <div
            className={`${isModal ? "col-span-2  px-1" : "w-full px-1 pb-3"}`}
          >
            <KeyClaimsReport values={data.key_claims} />
            {!isModal && <Divider className="mt-6" />}
          </div>
        )}

        {data.detected_tactics?.length > 0 && isModal && (
          <div className={`${isModal ? "" : "w-full text-center mb-4"}`}>
            <h3 className="font-medium text-lg mb-2">Detected Tactics</h3>
            <DetectedTacticsReport values={data.detected_tactics} />
            {!isModal && <Divider className="mt-6" />}
          </div>
        )}

        {data.risk_factors?.length > 0 && isModal && (
          <div className={`${isModal ? " px-1" : "w-full px-1 pb-3"}`}>
            <RiskFactorsReport values={data.risk_factors} />
            {!isModal && <Divider className="mt-6" />}
          </div>
        )}

        {data.recommended_checks?.length > 0 && (
          <div
            className={`${isModal ? "col-span-2 px-1" : "w-full px-1 pb-3"}`}
          >
            <RecommendedChecksReport values={data.recommended_checks} />
          </div>
        )}

        {data.safety_notes?.length > 0 && isModal && (
          <div
            className={`${isModal ? "col-span-2 px-1" : "w-full px-1 pb-3"}`}
          >
            <SafetyNotesReport values={data.safety_notes} />
            {!isModal && <Divider className="mt-6" />}
          </div>
        )}

        {data.raw_text && isModal && (
          <div className={`${isModal ? "col-span-2" : "w-full px-1"}`}>
            <RawTextReport value={data.raw_text} />
            {!isModal && <Divider className="mt-4" />}
          </div>
        )}

        {data.version && isModal && (
          <div
            className={`${isModal ? "col-span-2 text-center" : "w-full flex justify-center"}`}
          >
            <VersionReport value={data.version} />
          </div>
        )}
      </div>
    </>
  );
};

export default MetricsList;
