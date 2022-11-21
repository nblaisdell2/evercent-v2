import React from "react";
import Chart from "react-google-charts";
import { CategoryListGroup } from "./BudgetHelperFull";

type Props = { monthlyIncome: number; categoryList: CategoryListGroup[] };

function BudgetHelperCharts({ monthlyIncome, categoryList }: Props) {
  const chartData = [
    ["", "2010 Population", "2000 Population"],
    ["", 8175000, 8008000],
  ];

  const chartOptions = {
    chartArea: { width: "100%", height: "100%", left: "5" },
    bar: { groupWidth: "100%" },
    isStacked: true,
    legend: "none",
    backgroundColor: "transparent",
    hAxis: {
      baselineColor: "transparent",
      textPosition: "none",
      gridlines: { count: 0 },
    },
    animation: {
      startup: true,
      easing: "inAndOut",
      duration: 1500,
    },
  };

  return (
    <div>
      <div>
        <div className="p-1 font-bold">By Category Group</div>
        <Chart
          chartType="BarChart"
          width={"100%"}
          height={"115px"}
          data={chartData}
          options={chartOptions}
        />
      </div>
      <div>
        <div className="p-1 font-bold">By Category</div>
        <Chart
          chartType="BarChart"
          width={"100%"}
          height={"115px"}
          data={chartData}
          options={chartOptions}
        />
      </div>
    </div>
  );
}

export default BudgetHelperCharts;
