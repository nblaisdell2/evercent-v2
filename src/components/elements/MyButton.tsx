import React from "react";

function MyButton({
  icon,
  buttonText,
  onClick,
  className,
}: {
  onClick?: () => void;
  icon: JSX.Element;
  buttonText: JSX.Element | string;
  className?: string;
}) {
  return (
    <button
      onClick={onClick}
      className={`px-2 py-1 bg-gray-300 rounded-md shadow-slate-400 shadow-sm hover:bg-blue-400 hover:text-white ${
        className || ""
      }`}
    >
      <div className="flex justify-center items-center">
        {icon}
        <div className="font-semibold text-sm">{buttonText}</div>
      </div>
    </button>
  );
}

export default MyButton;
