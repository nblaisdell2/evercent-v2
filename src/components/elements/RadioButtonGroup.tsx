import React from "react";
import RadioButton from "./RadioButton";

type Props = {
  buttons: string[];
  selectedButton?: string;
  onSelect: (button: string) => void;
  className?: string;
};

function RadioButtonGroup({
  buttons,
  selectedButton,
  onSelect,
  className,
}: Props) {
  return (
    <div className={className}>
      {buttons.map((button) => {
        return (
          <div
            key={button}
            className="flex items-center hover:cursor-pointer group"
            onClick={() => {
              onSelect(button);
            }}
          >
            <RadioButton buttonText={button} selectedButton={selectedButton} />
          </div>
        );
      })}
    </div>
  );
}

export default RadioButtonGroup;
