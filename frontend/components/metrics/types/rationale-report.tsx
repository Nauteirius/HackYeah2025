import React from "react";
import { Card, CardBody } from "@heroui/card";

type Props = {
  value: string;
};

const RationaleReport = ({ value }: Props) => {
  return (
    <div className="mb-4">
      <p className="text-lg font-medium mb-2">Analysis Rationale</p>
      <Card className="bg-gray-50">
        <CardBody>
          <p className="italic text-gray-700">{value}</p>
        </CardBody>
      </Card>
    </div>
  );
};

export default RationaleReport;