import { interpolateColor } from "@/utils/utils";
import React from "react";
import MetricScore from "../metric-score";
import { Chip } from "@heroui/chip";

type Props = {
  values: string[];
};

const DetectedTacticsReport = ({ values }: Props) => {
  return (
    <>
      <div className="flex gap-1 flex-wrap">
        {values.map((value) => (
          <Chip key={value}>{value}</Chip>
        ))}
      </div>
    </>
  );
};

export default DetectedTacticsReport;
