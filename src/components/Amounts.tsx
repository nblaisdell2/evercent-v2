import React from "react";
import { calculatePercentString, getMoneyString } from "../utils/utils";
import Label from "./elements/Label";

function Amounts({
  monthlyIncome,
  amountUsed,
}: {
  monthlyIncome: number;
  amountUsed: number;
}) {
  const amtMonthlyIncome = getMoneyString(monthlyIncome);
  const amtUsed = getMoneyString(amountUsed);
  const amtRemaining = getMoneyString(monthlyIncome - amountUsed);
  const percentUsed = calculatePercentString(amountUsed, monthlyIncome);

  return (
    <div className="flex justify-center sm:justify-end space-x-4 sm:space-x-24">
      <div>
        <div className="flex flex-col items-center w-18">
          <Label
            label={`Monthly Income`}
            className="text-sm sm:text-xl whitespace-pre-wrap text-center"
          />
          <div className="font-bold text-xl sm:text-3xl -mt-1 text-green-500">
            {amtMonthlyIncome}
          </div>
        </div>
      </div>
      <div>
        <div className="flex flex-col items-center w-18">
          <Label
            label="Amount Remaining"
            className="text-sm sm:text-xl whitespace-pre-wrap text-center"
          />
          <div
            className={`font-bold text-xl sm:text-3xl -mt-1 ${
              monthlyIncome - amountUsed < 0 && "text-red-500"
            }`}
          >
            {amtRemaining}
          </div>
        </div>
      </div>
      <div>
        <div className="flex flex-col items-center w-18">
          <Label
            label="Amount Used"
            className="text-sm sm:text-xl whitespace-pre-wrap text-center"
          />
          <div className="font-bold text-xl sm:text-3xl -mt-1">{amtUsed}</div>
        </div>
      </div>
      <div>
        <div className="flex flex-col items-center w-18">
          <Label
            label="% Used"
            className="text-sm sm:text-xl whitespace-pre-wrap text-center"
          />
          <div className="font-bold text-xl sm:text-3xl -mt-1">
            {percentUsed}
          </div>
        </div>
      </div>
    </div>
  );
}

export default Amounts;
