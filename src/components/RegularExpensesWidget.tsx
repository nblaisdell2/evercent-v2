import React from "react";
import LabelAndValue from "./elements/LabelAndValue";

type Props = {};

function RegularExpensesWidget({}: Props) {
  return (
    <div className="h-full w-full flex flex-col justify-evenly">
      <LabelAndValue
        label={"# of Regular Expenses"}
        value={"27"}
        classNameValue={"text-4xl sm:text-6xl"}
      />
      <LabelAndValue
        label={"Categories with Target Met"}
        value={
          <div className="flex items-center -mt-1">
            <div className="text-4xl sm:text-6xl">18</div>
            <div className="text-xl sm:text-2xl ml-1 sm:ml-2">(67%)</div>
          </div>
        }
      />
    </div>
  );
}

export default RegularExpensesWidget;
