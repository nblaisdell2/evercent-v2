import React, { useState } from "react";
import Chart, {
  GoogleDataTable,
  ReactGoogleChartEvent,
} from "react-google-charts";
import { merge } from "../../../utils/utils";
import {
  CategoryListGroup,
  CategoryListItem,
  getTotalAmountUsed,
} from "../../../utils/evercent";

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
  type,
}: {
  monthlyIncome: number;
  categoryList: CategoryListGroup[];
  type: string;
}) {
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
    chartType: string,
    other?: string
  ) => {
    let myChartData;
    if (chartType == "group") {
      if (other && other == "pie") {
        myChartData = categoryList.reduce(
          (prev: any, curr: any) => {
            if (curr.adjustedAmtPlusExtra > 0) {
              return [...prev, [curr.groupName, curr.adjustedAmtPlusExtra]];
            }
            return prev;
          },
          [["Category Group", "Amount Used"] as string[]]
        );
      } else {
        myChartData = categoryList.reduce(
          (prev, curr) => {
            if (curr?.adjustedAmtPlusExtra > 0) {
              prev[0] = [...prev[0], curr.groupName];
              prev[1] = [...prev[1], curr.adjustedAmtPlusExtra];
            }
            return prev;
          },
          [[] as string[], [] as (string | number)[]]
        );
      }
    } else {
      myChartData = (
        merge(categoryList, "categories") as CategoryListItem[]
      ).reduce(
        (prev, curr) => {
          if (
            curr?.adjustedAmtPlusExtra > 0 &&
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

    let remainder = monthlyIncome - getTotalAmountUsed(categoryList);
    if (other == "pie") {
      myChartData.push(["Unused", remainder]);
    } else {
      myChartData[0] = ["", ...myChartData[0]];
      myChartData[1] = ["", ...myChartData[1]];

      if (
        chartType == "group" ||
        (chartType == "category" && !selectedGroup.groupID)
      ) {
        myChartData[0] = [...myChartData[0], "Unused"];
        myChartData[1] = [...myChartData[1], remainder];
      }
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
          const dataTable = chartWrapper.getDataTable() as GoogleDataTable;
          const { row, column } = selectedItem;

          const colName = dataTable.getColumnLabel(column) || "";
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

          // console.log("You selected:", {
          //   row,
          //   column,
          //   colName: colName,
          //   colID: colID,
          //   value: dataTable?.getValue(row, column),
          // });
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

  const chartOptionsPie = {
    chartArea: { width: "100%", height: "90%" },
    legend: "none",
    pieHole: 0.5,
    pieSliceBorderColor: "transparent",
    backgroundColor: "transparent",
    animation: {
      startup: true,
      easing: "inAndOut",
      duration: 1500,
    },
  };

  const chartDataGroup = getChartData(categoryList, monthlyIncome, "group");
  const chartDataGroupPie = getChartData(
    categoryList,
    monthlyIncome,
    "group",
    "pie"
  );
  const chartDataCategory = getChartData(
    categoryList,
    monthlyIncome,
    "category"
  );

  let groupColors = [];
  for (let i = 1; i < chartDataGroup[0].length - 1; i++) {
    groupColors.push(
      !selectedGroup.groupID || selectedGroup.groupName == chartDataGroup[0][i]
        ? CHART_COLORS[i - 1]
        : "#C0C0C0"
    );
  }
  groupColors.push(!selectedGroup.groupID ? "#A0A0A0" : "#C0C0C0");

  return (
    <>
      <div className="hidden sm:block">
        <div>
          {type == "full" && (
            <div className="p-1 font-bold">By Category Group</div>
          )}
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
        {type == "full" && (
          <div>
            <div className="p-1 font-bold">
              By Category{" "}
              {selectedGroup.groupName && " - " + selectedGroup.groupName}
            </div>
            <Chart
              chartType="BarChart"
              width={"100%"}
              height={"115px"}
              data={chartDataCategory}
              options={{
                ...chartOptions,
                colors: [
                  ...CHART_COLORS.slice(0, chartDataCategory[0].length - 2),
                  "#A0A0A0",
                ],
              }}
            />
          </div>
        )}
      </div>
      <div className="block sm:hidden">
        <div>
          <Chart
            chartType="PieChart"
            width={"100%"}
            height={"250px"}
            data={chartDataGroupPie}
            options={{
              ...chartOptionsPie,
              colors: [
                ...CHART_COLORS.slice(0, chartDataGroupPie.length - 2),
                "#A0A0A0",
              ],
            }}
          />
        </div>
      </div>
    </>
  );
}

export default BudgetHelperCharts;
