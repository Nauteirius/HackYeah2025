import React from "react";
import { Card, CardBody } from "@heroui/card";
import { ShieldExclamationIcon } from "@heroicons/react/24/outline";

type Props = {
  values: string[];
};

const SafetyNotesReport = ({ values }: Props) => {
  return (
    <div className="mb-4">
      <p className="text-lg font-medium mb-2">Safety Notes</p>
      <Card className="bg-amber-50 border border-amber-200">
        <CardBody className="p-0">
          <ul className="divide-y divide-amber-200">
            {values.map((note, index) => (
              <li key={index} className="flex items-start p-3">
                <ShieldExclamationIcon className="h-5 w-5 text-amber-500 mt-0.5 mr-2 flex-shrink-0" />
                <span className="text-amber-800">{note}</span>
              </li>
            ))}
          </ul>
        </CardBody>
      </Card>
    </div>
  );
};

export default SafetyNotesReport;