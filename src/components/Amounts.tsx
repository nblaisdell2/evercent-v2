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
    <div className="flex justify-end space-x-24">
      <div>
        <div className="flex flex-col items-center">
          <Label label="Monthly Income" className="text-xl" />
          <div className="font-bold text-3xl -mt-1 text-green-500">
            {amtMonthlyIncome}
          </div>
        </div>
      </div>
      <div>
        <div className="flex flex-col items-center">
          <Label label="Amount Remaining" className="text-xl" />
          <div className="font-bold text-3xl -mt-1">{amtRemaining}</div>
        </div>
      </div>
      <div>
        <div className="flex flex-col items-center">
          <Label label="Amount Used" className="text-xl" />
          <div className="font-bold text-3xl -mt-1">{amtUsed}</div>
        </div>
      </div>
      <div>
        <div className="flex flex-col items-center">
          <Label label="% Used" className="text-xl" />
          <div className="font-bold text-3xl -mt-1">{percentUsed}</div>
        </div>
      </div>
    </div>
  );
}

export default Amounts;
