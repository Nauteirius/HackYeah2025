import React from "react";

type Props = {
  value: string;
};

const SummaryReport = ({ value }: Props) => {
  return (
    <>
      <p className="text-lg font-medium mb-2">Summary</p>
      <p>{value as string}</p>
    </>
  );
};

export default SummaryReport;
