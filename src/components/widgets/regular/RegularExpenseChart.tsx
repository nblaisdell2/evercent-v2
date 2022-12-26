import React from "react";
import { CategoryListGroup, getMonthsAhead } from "../../../utils/evercent";
import Card from "../../elements/Card";

type Props = { regularExpenses: CategoryListGroup[]; resetProgress: boolean };

function RegularExpenseChart({ regularExpenses, resetProgress }: Props) {
  const getChartBarColor = (monthsAhead: number) => {
    if (monthsAhead <= 2) {
      return "bg-orange-500";
    }
    if (monthsAhead < 6) {
      return "bg-yellow-400";
    }
    return "bg-green-500";
  };

  const getChartItemAndBar = (itemName: string, numMonthsAhead: number) => {
    return (
      <div className="flex items-center">
        <div className="w-[23.5%] text-right pr-[2px]">{itemName}</div>
        <div
          style={{ width: (10.6 * numMonthsAhead).toString() + "%" }}
          className={`h-5 ${resetProgress && "opacity-50"} ${
            resetProgress && "opacity-50"
          } ${getChartBarColor(numMonthsAhead)}`}
        ></div>
      </div>
    );
  };

  const getChartCategoryItems = (categoryGroup: CategoryListGroup) => {
    return (
      <div className="flex w-full h-fit border-b border-black">
        <div className="flex justify-end items-center w-[15%] text-right font-extrabold pr-1">
          <div>{categoryGroup.groupName}</div>
        </div>

        <div className="w-[85%] h-fit space-y-1 text-sm py-1">
          {categoryGroup.categories.map((cat) => {
            return getChartItemAndBar(cat.name, getMonthsAhead(cat));
          })}
        </div>
      </div>
    );
  };

  const getChartBackgroundStatic = () => {
    return (
      <>
        <div className="w-[15%] h-[97%] z-10 border-r border-black"></div>

        <div className="w-[20%]"></div>

        <div className="flex flex-col items-center w-0 bg-purple-200">
          <div className="flex-grow w-[2px] bg-gray-300"></div>
          <div className="">0</div>
        </div>

        <div className="w-[9%]"></div>

        <div className="flex flex-col items-center w-0">
          <div className="flex-grow w-[2px] bg-gray-300"></div>
          <div className="">1</div>
        </div>

        <div className="w-[9%]"></div>

        <div className="flex flex-col items-center w-0">
          <div className="flex-grow w-[2px] bg-gray-300"></div>
          <div className="">2</div>
        </div>

        <div className="w-[9%]"></div>

        <div className="flex flex-col items-center w-0">
          <div className="flex-grow w-[2px] bg-gray-300"></div>
          <div className="">3</div>
        </div>

        <div className="w-[9%]"></div>

        <div className="flex flex-col items-center w-0">
          <div className="flex-grow w-[2px] bg-gray-300"></div>
          <div className="">4</div>
        </div>

        <div className="w-[9%]"></div>

        <div className="flex flex-col items-center w-0">
          <div className="flex-grow w-[2px] bg-gray-300"></div>
          <div className="">5</div>
        </div>

        <div className="w-[9%]"></div>

        <div className="z-10 flex flex-col items-center w-0">
          <div className="flex-grow w-[2px] border border-dashed border-red-500"></div>
          <div className="">6</div>
        </div>

        <div className="w-[9%]"></div>

        <div className="flex flex-col items-center w-0">
          <div className="flex-grow w-[2px] bg-gray-300"></div>
          <div className="">More</div>
        </div>
      </>
    );
  };

  return (
    <Card className="hidden sm:flex flex-col w-[60%] p-1">
      <div className="text-center font-bold text-3xl mb-2">
        Regular Expenses Progress
      </div>
      <div className="relative w-[98%] flex flex-grow">
        {getChartBackgroundStatic()}

        <div className="absolute top-0 left-0 right-0 bottom-0 space-y-1">
          <div className="flex flex-col w-full h-[96%] overflow-y-auto no-scrollbar">
            {regularExpenses.map((r) => {
              return getChartCategoryItems(r);
            })}
          </div>
        </div>
      </div>
    </Card>
  );
}

export default RegularExpenseChart;
