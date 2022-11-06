import React, { useState } from "react";

type Props = {
  buttons: string[];
  onSelect: (button: string) => void;
  selectedButton?: string;
};

function RadioButtonGroup({ buttons, selectedButton, onSelect }: Props) {
  return (
    <div className="flex justify-around items-center mt-1">
      {buttons.map((button) => {
        return (
          <div
            key={button}
            className="flex items-center hover:cursor-pointer group"
            onClick={() => {
              onSelect(button);
            }}
          >
            <div className="flex justify-center items-center w-5 h-5 bg-gray-300 rounded-full">
              <div
                className={`h-3 w-3 rounded-full group-hover:bg-blue-900 ${
                  selectedButton == button && "bg-blue-900"
                }`}
              />
            </div>
            <div className="ml-1 font-bold">{button}</div>
          </div>
        );
      })}
    </div>
  );
}

export default RadioButtonGroup;
