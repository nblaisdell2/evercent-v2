import React from "react";

type Props = {
  label: string;
  className?: string;
};

function Label({ label, className }: Props) {
  return (
    <div
      className={`font-raleway text-black font-bold underline ${
        className || ""
      }`}
    >
      {label}
    </div>
  );
}

export default Label;
