import React from "react";
import { Gauge, gaugeClasses } from "@mui/x-charts/Gauge";

type Props = {
  label: string;
  value: number;
};

const MetricScore = ({ value, label }: Props) => {
  return (
    <>
      <div>{label}</div>
      <Gauge value={value} startAngle={-110} endAngle={110} />
    </>
  );
};

export default MetricScore;
