import React from "react";

type Props = {
  label: any;
  className?: string;
};

function Label({ label, className }: Props) {
  return (
    <div
      className={`font-raleway text-black sm:whitespace-normal font-bold underline ${
        className || ""
      }`}
    >
      {label}
    </div>
  );
}

export default Label;
