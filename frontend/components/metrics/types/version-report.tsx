import React from "react";

type Props = {
  value: string;
};

const VersionReport = ({ value }: Props) => {
  return (
    <div className="mb-2">
      <span className="text-xs text-gray-500">API Version: {value}</span>
    </div>
  );
};

export default VersionReport;