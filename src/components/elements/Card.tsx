import React from "react";

function Card({ children, className }: { children?: any; className?: string }) {
  return (
    <div
      className={`bg-white rounded-lg shadow-md shadow-slate-400 overflow-y-auto ${
        className || ""
      }`}
    >
      {children}
    </div>
  );
}

export default Card;
