import React from "react";
import Label from "./Label";

type Props = {
  label: any;
  value: any;
  classNameLabel?: string;
  classNameValue?: string;
};

function LabelAndValue({
  label,
  value,
  classNameLabel,
  classNameValue,
}: Props) {
  return (
    <div className="flex flex-col items-center">
      <Label
        label={label}
        className={`whitespace-pre-wrap text-center mb-1 text-sm sm:text-lg ${
          classNameLabel || ""
        }`}
      />
      <div className={`${classNameValue || ""} font-bold -mt-2  `}>{value}</div>
    </div>
  );
}

export default LabelAndValue;
