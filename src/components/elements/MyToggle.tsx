import React from "react";
import Switch from "react-switch";

type Props = {
  checked: boolean;
  onToggle: (newChecked: boolean) => void;
  checkedColor?: string;
  uncheckedIcon?: JSX.Element;
  checkedIcon?: JSX.Element;
  className?: string;
};

function MyToggle({
  checked,
  onToggle,
  checkedColor,
  uncheckedIcon,
  checkedIcon,
  className,
}: Props) {
  return (
    <Switch
      checked={checked}
      onChange={(newChecked) => onToggle(newChecked)}
      uncheckedIcon={uncheckedIcon || <div></div>}
      checkedIcon={checkedIcon || <div></div>}
      onColor={checkedColor || "#1E3A8A"}
      className={className || ""}
    />
  );
}

export default MyToggle;
