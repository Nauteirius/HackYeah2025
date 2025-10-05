import React from "react";
import { Card, CardBody } from "@heroui/card";
import { Badge } from "@heroui/badge";
import { interpolateColor } from "@/utils/utils";

type Claim = {
  claim: string;
  confidence: number;
};

type Props = {
  values: Claim[];
};

const KeyClaimsReport = ({ values }: Props) => {
  return (
    <div className="mb-4">
      <p className="text-lg font-medium mb-2">Key Claims</p>
      <div className="space-y-3">
        {values.map((item, index) => (
          <Card
            key={index}
            className="border-l-4"
            style={{ borderLeftColor: interpolateColor(item.confidence * 100) }}
          >
            <CardBody className="flex justify-between items-center">
              <p>{item.claim}</p>
              {item.confidence && (
                <Badge
                  color={
                    item.confidence > 0.7
                      ? "success"
                      : item.confidence > 0.4
                        ? "warning"
                        : "error"
                  }
                >
                  {Math.round(item.confidence * 100)}% confidence
                </Badge>
              )}
            </CardBody>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default KeyClaimsReport;
