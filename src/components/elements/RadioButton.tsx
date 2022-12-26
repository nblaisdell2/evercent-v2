import React from "react";

type Props = { buttonText: string; selectedButton: string | undefined };

function RadioButton({ buttonText, selectedButton }: Props) {
  return (
    <div className="flex items-center">
      <div className="flex justify-center items-center w-5 h-5 bg-gray-300 rounded-full">
        <div
          className={`h-3 w-3 rounded-full group-hover:bg-blue-900 ${
            selectedButton == buttonText
              ? "group-hover:bg-opacity-100"
              : "group-hover:bg-opacity-50"
          } ${selectedButton == buttonText && "bg-blue-900"}`}
        />
      </div>
      <div className="ml-1 mb-[2px] font-bold">{buttonText}</div>
    </div>
  );
}

export default RadioButton;
