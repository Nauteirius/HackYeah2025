import React from "react";
import { Gauge, gaugeClasses } from "@mui/x-charts/Gauge";

type Props = {
  label: string;
  value: number;
  color: string;
};

const MetricScore = ({ value, label, color }: Props) => {
  return (
    <>
      <div>{label}</div>
      <div>
        <Gauge
          style={{
            minWidth: 50,
          }}
          value={value}
          startAngle={-110}
          endAngle={110}
          sx={() => ({
            [`& .${gaugeClasses.valueArc}`]: {
              fill: color,
            },
            [`& .${gaugeClasses.valueText} text`]: {
              fill: "hsl(var(--heroui-foreground) / 1)",
            },
          })}
          text={({ value, valueMax }) => `${value} / ${valueMax}`}
        />
      </div>
    </>
  );
};

export default MetricScore;
