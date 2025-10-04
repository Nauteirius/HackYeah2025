"use client";

import MetricScore from "@/components/metric-score";
import { Button, ScrollShadow, Textarea } from "@heroui/react";
import { Card, CardBody } from "@heroui/react";
import { useMemo } from "react";

export default function Home() {
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
    <section className="flex flex-row h-full w-full gap-4 p-5">
      <div style={{ width: "100%" }}>
        <Textarea
          fullWidth
          disableAutosize
          className="w-full h-full 123123"
          classNames={{
            inputWrapper: "!h-full",
            input: "!h-full",
          }}
          label="Analyze Your Text"
          placeholder="Enter your description"
        />
      </div>
      <div
        style={{
          width: 500,
          display: "flex",
          flexDirection: "column",
        }}
        className="gap-3"
      >
        <Card style={{ flex: 1 }}>
          <CardBody>
            <p>Results:</p>
            <ScrollShadow
              className="grid grid-cols-2 gap-5"
              style={{
                display: "grid",
                gridColumn: "1fr 1fr",
              }}
            >
              {data.map(([label, value]) => (
                <MetricScore label={label} value={value} />
              ))}
            </ScrollShadow>
          </CardBody>
        </Card>
        <Button>Get Report</Button>
      </div>
    </section>
  );
}
