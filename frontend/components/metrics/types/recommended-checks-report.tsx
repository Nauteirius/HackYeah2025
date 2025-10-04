import React from "react";
import { Card, CardBody } from "@heroui/card";
import { CheckCircleIcon } from "@heroicons/react/24/outline";

type Props = {
  values: string[];
};

const RecommendedChecksReport = ({ values }: Props) => {
  return (
    <div className="mb-4">
      <p className="text-lg font-medium mb-2">Recommended Checks</p>
      <Card>
        <CardBody className="p-0">
          <ul className="divide-y">
            {values.map((check, index) => (
              <li key={index} className="flex items-start p-3">
                <CheckCircleIcon className="h-5 w-5 text-blue-500 mt-0.5 mr-2 flex-shrink-0" />
                <span>{check}</span>
              </li>
            ))}
          </ul>
        </CardBody>
      </Card>
    </div>
  );
};

export default RecommendedChecksReport;