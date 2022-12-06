import React from "react";
import { CategoryListGroup } from "../utils/evercent";
import { getPercentString } from "../utils/utils";
import Amounts from "./Amounts";
import BudgetHelperCharts from "./BudgetHelperCharts";

type Props = {
  monthlyIncome: number;
  categoryList: CategoryListGroup[];
};

const CHART_COLORS = [
  "#3366cc",
  "#dc3912",
  "#ff9900",
  "#109618",
  "#990099",
  "#0099c6",
  "#dd4477",
  "#66aa00",
  "#b82e2e",
  "#316395",
  "#994499",
  "#22aa99",
  "#aaaa11",
  "#6633cc",
  "#e67300",
  "#8b0707",
  "#651067",
  "#329262",
  "#5574a6",
  "#3b3eac",
  "#b77322",
  "#16d620",
  "#b91383",
  "#f4359e",
  "#9c5935",
  "#a9c413",
  "#2a778d",
  "#668d1c",
  "#bea413",
  "#0c5922",
  "#743411",
];

function BudgetHelperWidget({ monthlyIncome, categoryList }: Props) {
  const numCols = Math.floor(categoryList.length / 6) + 1;
  const gridCols = "grid-rows-" + numCols;

  const percUnused = categoryList.reduce((prev, curr) => {
    return prev + curr.percentIncome;
  }, 0);
  const strPercUnused = getPercentString(1 - percUnused, 0);

  let idx = 0;
  return (
    <div className="h-full pt-2 flex flex-col space-y-6">
      <Amounts
        monthlyIncome={monthlyIncome}
        categoryList={categoryList}
        type="widget"
      />

      <div className="hidden sm:block">
        <BudgetHelperCharts
          monthlyIncome={monthlyIncome}
          categoryList={categoryList}
          type="widget"
        />
      </div>

      <div className={`grid grid-flow-col auto-rows-auto ${gridCols}`}>
        {categoryList.map((grp) => {
          if (grp.adjustedAmtPlusExtra == 0) return null;
          return (
            <div
              className="flex items-center ml-4 sm:ml-10"
              key={grp.groupName}
            >
              <div
                className="h-2 w-2 rounded-full"
                style={{
                  backgroundColor: CHART_COLORS[idx++],
                }}
              ></div>
              <div className="font-semibold text-sm ml-1">
                {"(" +
                  getPercentString(grp.percentIncome, 0) +
                  ") " +
                  grp.groupName}
              </div>
            </div>
          );
        })}
        <div className="flex items-center ml-4 sm:ml-10">
          <div
            className="h-2 w-2 rounded-full"
            style={{ backgroundColor: "#A0A0A0" }}
          ></div>
          <div className="font-semibold text-sm ml-1">
            {"(" + strPercUnused + ") Unused"}
          </div>
        </div>
      </div>
    </div>
  );
}

export default BudgetHelperWidget;
