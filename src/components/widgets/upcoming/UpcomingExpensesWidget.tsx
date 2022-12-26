import React from "react";
import LabelAndValue from "../../elements/LabelAndValue";

type Props = {};

function UpcomingExpensesWidget({}: Props) {
  return (
    <div className="h-full w-full flex flex-col justify-evenly">
      <LabelAndValue
        label={"Next Expense"}
        value={"Car Detailing (M)"}
        classNameValue={"text-3xl sm:text-5xl"}
      />
      <div className="flex justify-around">
        <LabelAndValue
          label={"Amount Saved"}
          value={"$420 / $500"}
          classNameValue={"text-lg sm:text-3xl"}
        />
        <LabelAndValue
          label={"Purchase Date"}
          value={
            <div className="text-center">
              <div className="text-lg sm:text-3xl">9/15/2022</div>
              <div className="text-sm sm:text-xl -mt-1">(35 days)</div>
            </div>
          }
        />
        <LabelAndValue
          label={"# of Paychecks"}
          value={"4"}
          classNameValue={"text-lg sm:text-3xl"}
        />
      </div>
    </div>
  );
}

export default UpcomingExpensesWidget;
