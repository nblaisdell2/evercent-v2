import { stringify } from "querystring";
import React, { useState } from "react";
import Chart, { ReactGoogleChartEvent } from "react-google-charts";
import { merge } from "../utils/utils";
import { CategoryListGroup, CategoryListItem } from "./BudgetHelperFull";

type Props = {
  monthlyIncome: number;
  categoryList: CategoryListGroup[];
  amountUsed: number;
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

function BudgetHelperCharts({
  monthlyIncome,
  categoryList,
  amountUsed,
}: Props) {
  const [selectedGroup, setSelectedGroup] = useState<{
    groupID: string;
    groupName: string;
  }>({
    groupID: "",
    groupName: "",
  });

  const getChartData = (
    categoryList: CategoryListGroup[],
    monthlyIncome: number,
    chartType: string
  ) => {
    let myChartData;
    if (chartType == "group") {
      myChartData = categoryList.reduce(
        (prev, curr) => {
          if (curr.adjustedAmtPlusExtra > 0) {
            prev[0] = [...prev[0], curr.groupName];
            prev[1] = [...prev[1], curr.adjustedAmtPlusExtra];
          }
          return prev;
        },
        [[] as string[], [] as (string | number)[]]
      );
    } else {
      myChartData = (
        merge(categoryList, "categories") as CategoryListItem[]
      ).reduce(
        (prev, curr) => {
          if (
            curr.adjustedAmtPlusExtra > 0 &&
            (selectedGroup.groupID == "" ||
              curr.categoryGroupID == selectedGroup.groupID)
          ) {
            prev[0] = [...prev[0], curr.name];
            prev[1] = [...prev[1], curr.adjustedAmtPlusExtra];
          }
          return prev;
        },
        [[] as string[], [] as (string | number)[]]
      );
    }

    myChartData[0] = ["", ...myChartData[0]];
    myChartData[1] = ["", ...myChartData[1]];

    if (
      chartType == "group" ||
      (chartType == "category" && !selectedGroup.groupID)
    ) {
      let remainder = monthlyIncome - amountUsed;
      myChartData[0] = [...myChartData[0], "Unused"];
      myChartData[1] = [...myChartData[1], remainder];
    }

    return myChartData;
  };

  const chartEvents: ReactGoogleChartEvent[] = [
    {
      eventName: "select",
      callback: ({ chartWrapper }) => {
        const chart = chartWrapper.getChart();
        const selection = chart.getSelection();
        if (selection.length === 1) {
          const [selectedItem] = selection;
          const dataTable = chartWrapper.getDataTable();
          const { row, column } = selectedItem;

          const colName = dataTable?.getColumnLabel(column) || "";
          const colID =
            categoryList.find((catGroup: CategoryListGroup) => {
              return catGroup.groupName == colName;
            })?.categories[0].categoryGroupID || "";

          setSelectedGroup((prev) => {
            if (prev.groupID == colID || colName == "Unused") {
              return {
                groupID: "",
                groupName: "",
              };
            }
            return {
              groupID: colID,
              groupName: colName,
            };
          });

          console.log("You selected:", {
            row,
            column,
            colName: colName,
            colID: colID,
            value: dataTable?.getValue(row, column),
          });
        }
      },
    },
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

  const chartDataGroup = getChartData(categoryList, monthlyIncome, "group");
  const chartDataCategory = getChartData(
    categoryList,
    monthlyIncome,
    "category"
  );

  console.log("group data", chartDataGroup);
  let groupColors = [];
  for (let i = 1; i < chartDataGroup[0].length - 1; i++) {
    groupColors.push(
      !selectedGroup.groupID || selectedGroup.groupName == chartDataGroup[0][i]
        ? CHART_COLORS[i - 1]
        : "#C0C0C0"
    );
  }
  groupColors.push(!selectedGroup.groupID ? "#A0A0A0" : "#C0C0C0");
  // let groupColors = [
  //   ...CHART_COLORS.slice(0, chartDataGroup[0].length - 2),
  //   "#A0A0A0",
  // ];

  return (
    <div>
      <div>
        <div className="p-1 font-bold">By Category Group</div>
        <Chart
          chartType="BarChart"
          width={"100%"}
          height={"115px"}
          data={chartDataGroup}
          options={{
            ...chartOptions,
            colors: groupColors,
          }}
          chartEvents={chartEvents}
        />
      </div>
      <div>
        <div className="p-1 font-bold">By Category</div>
        <Chart
          chartType="BarChart"
          width={"100%"}
          height={"115px"}
          data={chartDataCategory}
          options={{
            ...chartOptions,
            colors: [
              ...CHART_COLORS.slice(0, chartDataGroup[0].length - 1),
              "#A0A0A0",
            ],
          }}
        />
      </div>
    </div>
  );
}

export default BudgetHelperCharts;
