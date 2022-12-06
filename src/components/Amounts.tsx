import React from "react";
import { CategoryListGroup, getTotalAmountUsed } from "../utils/evercent";
import { calculatePercentString, getMoneyString } from "../utils/utils";
import Label from "./elements/Label";

function Amounts({
  monthlyIncome,
  categoryList,
  type,
}: {
  monthlyIncome: number;
  categoryList: CategoryListGroup[];
  type: string;
}) {
  const totalAmountUsed = getTotalAmountUsed(categoryList);

  const amtMonthlyIncome = getMoneyString(monthlyIncome);
  const amtUsed = getMoneyString(totalAmountUsed);
  const amtRemaining = getMoneyString(monthlyIncome - totalAmountUsed);
  const percentUsed = calculatePercentString(totalAmountUsed, monthlyIncome);

  return (
    <div
      className={`flex justify-center ${
        type == "full" ? "sm:justify-end" : "justify-around sm:justify-center"
      } space-x-4 sm:space-x-24`}
    >
      <div className={`${type == "widget" ? "hidden sm:block" : "block"}`}>
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
              monthlyIncome - totalAmountUsed < 0 && "text-red-500"
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
      {type == "full" && (
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
      )}
    </div>
  );
}

export default Amounts;
