import React from "react";
import { PostingMonth } from "../utils/evercent";
import { getMoneyString, getPercentString } from "../utils/utils";

type Props = { months: PostingMonth[] };

function PostingMonthBreakdown({ months }: Props) {
  return (
    <>
      {months.map((m) => {
        return (
          <>
            {m.month == "Total" && <div className="h-[1px] bg-black" />}
            <div className="flex justify-between" key={m.month}>
              <div className="w-[60%] font-semibold flex-grow">{m.month}</div>
              <div className="w-[20%] text-right font-semibold text-green-500">
                {getMoneyString(m.amount)}
              </div>
              <div className="w-[20%] text-right font-semibold">
                {getPercentString(m.percentAmount / 100)}
              </div>
            </div>
          </>
        );
      })}
    </>
  );
}

export default PostingMonthBreakdown;
