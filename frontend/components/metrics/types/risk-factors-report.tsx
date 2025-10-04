import React from "react";
import { Card, CardBody } from "@heroui/card";

type Props = {
  values: string[];
};

const RiskFactorsReport = ({ values }: Props) => {
  return (
    <div className="w-full">
      <h3 className="font-medium text-lg mb-2 text-center">Risk Factors</h3>
      <Card className="bg-red-50 border border-red-100">
        <CardBody>
          <ul className="list-disc pl-5 space-y-2">
            {values.map((factor, index) => (
              <li key={index} className="text-red-700">
                {factor}
              </li>
            ))}
          </ul>
        </CardBody>
      </Card>
    </div>
  );
};

export default RiskFactorsReport;