import React, { useState } from "react";
import { Card, CardBody } from "@heroui/card";
import { Button } from "@heroui/button";
import { ScrollShadow } from "@heroui/scroll-shadow";
import { CodeBracketIcon } from "@heroicons/react/24/outline";

type Props = {
  value: string;
};

const RawTextReport = ({ value }: Props) => {
  const [isExpanded, setIsExpanded] = useState(false);
  
  return (
    <div className="mb-4">
      <div className="flex items-center justify-between mb-2">
        <p className="text-lg font-medium">Raw Data</p>
        <Button 
          size="sm" 
          variant="ghost" 
          onClick={() => setIsExpanded(!isExpanded)}
        >
          {isExpanded ? "Hide" : "Show"} Raw Data
        </Button>
      </div>
      
      {isExpanded && (
        <Card className="bg-gray-900">
          <CardBody className="p-0">
            <ScrollShadow className="max-h-60">
              <pre className="p-4 text-green-400 font-mono text-sm whitespace-pre-wrap">
                <CodeBracketIcon className="h-4 w-4 inline-block mr-2" />
                {value}
              </pre>
            </ScrollShadow>
          </CardBody>
        </Card>
      )}
    </div>
  );
};

export default RawTextReport;