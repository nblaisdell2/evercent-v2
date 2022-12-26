import React from "react";
import { PostingMonth } from "../../../utils/evercent";
import { getMoneyString, getPercentString } from "../../../utils/utils";

type Props = {
  months: PostingMonth[];
  showPercent: boolean;
  showTotal?: boolean | undefined;
};

function PostingMonthBreakdown({ months, showPercent, showTotal }: Props) {
  if (showTotal == undefined) {
    showTotal = true;
  }

  const newMonths = months.filter((m) => m.month != (showTotal ? "" : "Total"));

  return (
    <>
      {newMonths.map((m) => {
        return (
          <>
            {m.month == "Total" && <div className="h-[1px] bg-black" />}
            <div className="flex justify-between" key={m.month}>
              <div className="w-[60%] font-semibold flex-grow text-right mr-4">
                {m.month}
              </div>
              <div className="w-[20%] text-right font-semibold text-green-500">
                {getMoneyString(m.amount)}
              </div>
              {showPercent && (
                <div className="w-[20%] text-right font-semibold">
                  {getPercentString(m.percentAmount / 100)}
                </div>
              )}
            </div>
          </>
        );
      })}
    </>
  );
}

export default PostingMonthBreakdown;
