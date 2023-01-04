import React from "react";
import { getMoneyString } from "../../../utils/utils";
import Card from "../../elements/Card";
import HierarchyTable, { CheckboxItem } from "../../elements/HierarchyTable";
import LabelAndValue from "../../elements/LabelAndValue";
import useHierarchyTable from "../../hooks/useHierarchyTable";

type Props = {
  showUpcoming: boolean;
  selectedItem: CheckboxItem | null;
  setSelectedItem: (newItem: CheckboxItem | null) => void;
};

function AmountMonths({ showUpcoming, selectedItem, setSelectedItem }: Props) {
  const categoryMonthList: CheckboxItem[] = [
    {
      parentId: "",
      id: "1",
      name: "Immediate Obligations",
      selected: true,
      expanded: true,
    },
    {
      parentId: "1",
      id: "2",
      name: "Rent/Mortgage",
      selected: true,
      expanded: true,
    },
    { parentId: "2", id: "3", name: "AUG 2022", selected: true },
    { parentId: "2", id: "4", name: "SEP 2022", selected: true },
    { parentId: "2", id: "5", name: "OCT 2022", selected: true },
    {
      parentId: "1",
      id: "12",
      name: "Electric",
      selected: true,
      expanded: true,
    },
    { parentId: "12", id: "13", name: "AUG 2022", selected: true },
    {
      parentId: "",
      id: "6",
      name: "Subscriptions",
      selected: true,
      expanded: true,
    },
    { parentId: "6", id: "7", name: "AWS", selected: true, expanded: true },
    { parentId: "7", id: "8", name: "AUG 2022", selected: true },
    {
      parentId: "",
      id: "9",
      name: "True Expenses",
      selected: true,
      expanded: true,
    },
    {
      parentId: "9",
      id: "10",
      name: "Car Insurance",
      selected: true,
      expanded: true,
    },
    { parentId: "10", id: "11", name: "AUG 2022", selected: true },
  ];

  const createList = (data: any) => {
    return categoryMonthList;
  };

  const hierarchyTableProps = useHierarchyTable(null, createList);

  const getRowContent = (item: CheckboxItem, indent: number) => {
    switch (indent) {
      case 0:
        return (
          <div className="flex flex-grow justify-between font-mplus font-extrabold py-[1px] rounded-lg">
            <div className="flex items-center">
              <div>{item.name}</div>
            </div>
            <div className="pr-1">{getMoneyString(100)}</div>
          </div>
        );
      case 1:
        return (
          <div
            onClick={() => {
              if (!showUpcoming) {
                setSelectedItem(item);
                console.log("clicked on", { item, selectedItem });
              }
            }}
            className={`flex flex-grow justify-between font-mplus py-[1px] ${
              !showUpcoming && "hover:bg-gray-100"
            } hover:cursor-pointer rounded-lg ${
              item == selectedItem &&
              "bg-blue-900 hover:bg-blue-900 text-white font-bold"
            }`}
          >
            <div className="flex items-center">
              <div>{item.name}</div>
            </div>
            <div className="pr-1">{getMoneyString(100)}</div>
          </div>
        );
      case 2:
        return (
          <div className="flex flex-grow justify-between font-mplus text-gray-400 text-sm py-[1px] rounded-lg">
            <div className="flex items-center">
              <div>{item.name}</div>
            </div>
            <div className="pr-1">{getMoneyString(100)}</div>
          </div>
        );
      default:
        return <div></div>;
    }
  };

  return (
    <div className="flex flex-col h-auto sm:h-full flex-grow overflow-y-auto space-y-2 p-2">
      <div className="text-center font-mplus text-2xl sm:text-3xl font-extrabold">
        Amounts Posted to Budget
      </div>
      <div className="flex justify-evenly">
        <LabelAndValue
          label={"Run Time"}
          value={"08/07/2022 @ 7:00AM"}
          classNameValue={"font-mplus text-base sm:text-2xl"}
        />
        <LabelAndValue
          label={"Total"}
          value={getMoneyString(960)}
          classNameValue={"font-mplus text-base sm:text-2xl text-green-600"}
        />
        {showUpcoming && (
          <LabelAndValue
            label={"Locked?"}
            value={"Yes"}
            classNameValue={"font-mplus text-base sm:text-2xl"}
          />
        )}
      </div>
      <Card className="flex-grow p-2 overflow-y-auto no-scrollbar">
        <HierarchyTable
          tableData={hierarchyTableProps}
          getRowContent={getRowContent}
          indentPixels={"20px"}
          showCheckboxes={showUpcoming}
        />
      </Card>
    </div>
  );
}

export default AmountMonths;
