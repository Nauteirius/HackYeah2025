import { interpolateColor } from "@/utils/utils";
import React from "react";
import MetricScore from "../metric-score";

type Props = {
  value: number;
};

const LikelihoodScoreReport = ({ value }: Props) => {
  return (
    <MetricScore
      label={"Likelihood"}
      value={value}
      color={interpolateColor(value)}
    />
  );
};

export default LikelihoodScoreReport;
