import React from "react";
import {
  CategoryListGroup,
  CategoryListItem,
  getMonthsAhead,
} from "../../../utils/evercent";
import Card from "../../elements/Card";

function RegularExpenseChart({
  target,
  regularExpenses,
  resetProgress,
}: {
  target: number;
  regularExpenses: CategoryListGroup[];
  resetProgress: boolean;
}) {
  const getChartBarColor = (monthsAhead: number, target: number) => {
    let firstCheck = 2;
    if (target == 3) {
      firstCheck /= 2;
    } else if (target == 12) {
      firstCheck *= 2;
    }

    if (monthsAhead <= firstCheck) {
      return "bg-orange-500";
    }
    if (monthsAhead < target) {
      return "bg-yellow-400";
    }
    return "bg-green-500";
  };

  const getChartItemAndBar = (category: CategoryListItem, target: number) => {
    const monthsAhead = getMonthsAhead(category, target);
    const barWidth = 10.6 * (target == 3 ? 2 : 1);

    let barVal = target == 12 ? monthsAhead / 2 : monthsAhead;
    if (target == 3 && barVal > target) {
      barVal = 3.5;
    } else if (target == 6 && barVal > target) {
      barVal = 7;
    } else if (target == 12 && barVal * 2 > target) {
      barVal = 7;
    }

    // console.log({ barVal, barWidth, target });
    return (
      <div className="flex items-center">
        <div className="w-[23.5%] text-right pr-[2px]">{category.name}</div>
        <div
          style={{
            width: (barWidth * barVal).toString() + "%",
          }}
          className={`h-5 ${resetProgress && "opacity-50"} ${
            resetProgress && "opacity-50"
          } ${getChartBarColor(monthsAhead, target)}`}
        >
          {monthsAhead > target && (
            <div className="text-right text-white font-bold pr-2">
              {monthsAhead}
            </div>
          )}
        </div>
      </div>
    );
  };

  const getChartCategoryItems = (
    categoryGroup: CategoryListGroup,
    target: number
  ) => {
    return (
      <div className="flex w-full h-fit border-b border-black">
        <div className="flex justify-end items-center w-[15%] text-right font-extrabold pr-1">
          <div>{categoryGroup.groupName}</div>
        </div>

        <div className="w-[85%] h-fit space-y-1 text-sm py-1">
          {categoryGroup.categories.map((cat) => {
            return getChartItemAndBar(cat, target);
          })}
        </div>
      </div>
    );
  };

  const getChartTick = (val: string, isDashed: boolean) => {
    return (
      <div className={`flex flex-col items-center w-0 ${isDashed && "z-10"}`}>
        <div
          className={`flex-grow w-[2px] ${
            isDashed
              ? "border border-dashed border-red-500"
              : val == ""
              ? "bg-gray-100"
              : "bg-gray-300"
          }`}
        ></div>
        <div className="h-[3%]">{val}</div>
      </div>
    );
  };

  const getChartBackgroundStatic = (target: number) => {
    let ticks2: string[] = [];
    const step = target == 12 ? 2 : 1;
    for (let i = 0; i <= target; i += step) {
      ticks2.push(i.toString());
      if (i !== target && target == 3) ticks2.push("");
    }
    ticks2.push("More");

    return (
      <>
        <div className="w-[15%] h-[97%] z-10 border-r border-black"></div>
        <div className="w-[20%]"></div>
        {ticks2.map((tick, i, arr) => (
          <>
            {getChartTick(tick, i == arr.length - 2)}
            {tick !== "More" && <div className="w-[9%]"></div>}
          </>
        ))}
      </>
    );
  };

  return (
    <Card className="hidden sm:flex flex-col w-[60%] p-1">
      <div className="text-center font-bold text-3xl mb-2">
        Regular Expenses Progress
      </div>
      <div className="relative w-[98%] flex flex-grow">
        {getChartBackgroundStatic(target)}

        <div className="absolute top-0 left-0 right-0 bottom-0 space-y-1">
          <div className="flex flex-col w-full h-[96%] overflow-y-auto no-scrollbar">
            {regularExpenses.map((r) => {
              return getChartCategoryItems(r, target);
            })}
          </div>
        </div>
      </div>
    </Card>
  );
}

export default RegularExpenseChart;
