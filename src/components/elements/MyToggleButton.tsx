import React from "react";

type Props = {
  leftSideTrue: boolean;
  leftValue: string;
  rightValue: string;
  onToggle: (toggleValue: boolean) => void;
};

function MyToggleButton({
  leftSideTrue,
  leftValue,
  rightValue,
  onToggle,
}: Props) {
  return (
    <div className="flex border-2 border-blue-900 rounded-md font-bold text-sm sm:text-base">
      <div
        className={`p-[3px] w-auto min-w-[80px] px-2 text-center whitespace-nowrap hover:cursor-pointer ${
          leftSideTrue
            ? "bg-blue-900 hover:bg-blue-900 text-white hover:text-white font-bold hover:font-bold"
            : "hover:bg-blue-900 hover:opacity-70 hover:text-white hover:font-bold"
        }`}
        onClick={() => onToggle(true)}
      >
        {leftValue}
      </div>
      <div
        className={`p-[3px] w-auto whitespace-nowrap min-w-[80px] px-2 text-center hover:cursor-pointer ${
          !leftSideTrue
            ? "bg-blue-900 hover:bg-blue-900 text-white hover:text-white font-bold hover:font-bold"
            : "hover:bg-blue-900 hover:opacity-70 hover:text-white hover:font-bold"
        }`}
        onClick={() => onToggle(false)}
      >
        {rightValue}
      </div>
    </div>
  );
}

export default MyToggleButton;
