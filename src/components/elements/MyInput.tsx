import React from "react";
import { getMoneyString } from "../../utils/utils";

function MyInput({
  value,
  onChange,
  className,
  isMoneyString,
}: {
  value: string | number;
  onChange?: (newValue: number) => void;
  className?: string;
  isMoneyString?: boolean;
}) {
  return (
    <input
      type="text"
      inputMode="numeric"
      value={isMoneyString ? getMoneyString(value) : value}
      onChange={(e) => {
        if (onChange) {
          let newValue = e.target.value;
          if (isMoneyString) newValue = newValue.replace("$", "");
          onChange(parseInt(newValue) || 0);
        }
      }}
      className={`border border-black rounded-md outline-none text-center ${
        className || ""
      }`}
      onFocus={(e) => e.target.select()}
    />
  );
}

export default MyInput;
