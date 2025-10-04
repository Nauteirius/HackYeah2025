import { ArticleAnalysis } from "@/models/articleAnalysis.types";
import { Card, CardBody } from "@heroui/card";
import { ScrollShadow } from "@heroui/scroll-shadow";
import React, { useMemo } from "react";
import MetricScore from "./metric-score";
import { interpolateColor } from "@/utils/utils";

type Props = {
  data: ArticleAnalysis;
  collect?: boolean;
};

const MetricsList = ({ collect = false }: Props) => {
  const data = useMemo(
    () =>
      [
        ["General Score", 75],
        ["Manipulation Score", 32],
        ["Opinionated", 23],
        ["Original Language", 54],
        ["Objective", 23],
      ] as const,
    []
  );

  return (
    <>
      {collect ? (
        <div>
          {data.map(([label, value]) => (
            <MetricScore
              key={label}
              label={label}
              value={value}
              color={interpolateColor(value)}
            />
          ))}
        </div>
      ) : (
        <>
          {data.map(([label, value]) => (
            <MetricScore
              key={label}
              label={label}
              value={value}
              color={interpolateColor(value)}
            />
          ))}
        </>
      )}
    </>
  );
};

export default MetricsList;
