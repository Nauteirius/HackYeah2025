import React from "react";

type Props = {
  value: string;
};

const SummaryReport = ({ value }: Props) => {
  return (
    <>
      <p>Summary</p>
      <p>{value as string}</p>
    </>
  );
};

export default SummaryReport;
