import { interpolateColor } from "@/utils/utils";
import React from "react";
import MetricScore from "../metric-score";

type Props = {
  value: number;
};

const ConfidenceReport = ({ value }: Props) => {
  return (
    <MetricScore
      label={"Confidence"}
      value={value * 100}
      color={interpolateColor(value * 100)}
    />
  );
};

export default ConfidenceReport;