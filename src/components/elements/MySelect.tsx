import React, { useState } from "react";
import { Item } from "react-stately";
import { Select } from "./select/Select";

type Props = {
  values: string[];
  selectedValue: string;
  onSelectionChange: (newSelectedValue: string) => void;
  isDisabled?: boolean;
};

function MySelect({
  values,
  selectedValue,
  onSelectionChange,
  isDisabled,
}: Props) {
  return (
    <Select
      label=""
      selectedKey={selectedValue}
      onSelectionChange={(sel) => {
        onSelectionChange(sel.toString());
      }}
      isDisabled={isDisabled}
    >
      {values.map((val) => {
        return <Item key={val}>{val}</Item>;
      })}
    </Select>
  );
}

export default MySelect;
