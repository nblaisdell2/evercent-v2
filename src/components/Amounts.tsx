import React from "react";
import { CategoryListGroup, getTotalAmountUsed } from "../utils/evercent";
import { calculatePercentString, getMoneyString } from "../utils/utils";
import LabelAndValue from "./elements/LabelAndValue";

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

  return (
    <div
      className={`flex justify-center ${
        type == "full" ? "sm:justify-end" : "justify-around sm:justify-center"
      } space-x-4 sm:space-x-24`}
    >
      <div className={`${type == "widget" ? "hidden sm:block" : "block"}`}>
        <div className="flex flex-col items-center w-18">
          <LabelAndValue
            label={"Monthly Income"}
            value={getMoneyString(monthlyIncome)}
            classNameLabel={"text-sm sm:text-xl"}
            classNameValue={"text-2xl sm:text-3xl text-green-500"}
          />
        </div>
      </div>
      <div>
        <div className="flex flex-col items-center w-18">
          <LabelAndValue
            label={"Amount Remaining"}
            value={getMoneyString(monthlyIncome - totalAmountUsed)}
            classNameLabel={"text-sm sm:text-xl"}
            classNameValue={`text-2xl sm:text-3xl ${
              monthlyIncome - totalAmountUsed < 0 && "text-red-500"
            }`}
          />
        </div>
      </div>
      <div>
        <div className="flex flex-col items-center w-18">
          <LabelAndValue
            label={"Amount Used"}
            value={getMoneyString(totalAmountUsed)}
            classNameLabel={"text-sm sm:text-xl"}
            classNameValue={`text-2xl sm:text-3xl`}
          />
        </div>
      </div>
      {type == "full" && (
        <div className="flex flex-col justify-end">
          <div className="flex flex-col items-center w-18">
            <LabelAndValue
              label={"% Used"}
              value={calculatePercentString(totalAmountUsed, monthlyIncome)}
              classNameLabel={"text-sm sm:text-xl"}
              classNameValue={`text-2xl sm:text-3xl`}
            />
          </div>
        </div>
      )}
    </div>
  );
}

export default Amounts;
