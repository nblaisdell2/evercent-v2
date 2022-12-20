import {
  ArrowLeftIcon,
  CheckIcon,
  ChevronDownIcon,
  ChevronRightIcon,
  MinusCircleIcon,
  PencilSquareIcon,
  QuestionMarkCircleIcon,
} from "@heroicons/react/24/outline";
import React, { useState } from "react";
import { PostingMonth } from "../utils/evercent";
import { getMoneyString, ModalType } from "../utils/utils";
import Card from "./elements/Card";
import CheckBoxGroup, { CheckboxItem } from "./elements/CheckBoxGroup";
import Label from "./elements/Label";
import LabelAndValue from "./elements/LabelAndValue";
import MyToggleButton from "./elements/MyToggleButton";
import RadioButtonGroup from "./elements/RadioButtonGroup";
import useModal from "./hooks/useModal";
import ModalContent from "./modal/ModalContent";
import ResetExpensesProgress from "./modal/ResetExpensesProgress";
import PostingMonthBreakdown from "./PostingMonthBreakdown";

type Props = {};

function RegularExpensesFull({}: Props) {
  const { isOpen, showModal, closeModal } = useModal();

  const [editingTarget, setEditingTarget] = useState(false);
  const [currentTarget, setCurrentTarget] = useState(6);

  const [resetProgress, setResetProgress] = useState(false);
  const [clicked, setClicked] = useState<CheckboxItem | null>(null);
  const [hovered, setHovered] = useState<CheckboxItem | null>(null);

  const [isPosting, setIsPosting] = useState(false);

  const months: PostingMonth[] = [
    { month: "August 2022", amount: 160, percentAmount: 17 },
    { month: "September 2022", amount: 160, percentAmount: 17 },
    { month: "October 2022", amount: 160, percentAmount: 17 },
    { month: "November 2022", amount: 160, percentAmount: 17 },
    { month: "December 2022", amount: 160, percentAmount: 17 },
    { month: "January 2023", amount: 160, percentAmount: 17 },
  ];
  months.push({
    month: "Total",
    amount: months.reduce((prev, curr) => prev + curr.amount, 0),
    percentAmount: months.reduce((prev, curr) => prev + curr.percentAmount, 0),
  });

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
    {
      parentId: "2",
      id: "3",
      name: "AUG 2022",
      selected: true,
      expanded: true,
    },
    {
      parentId: "2",
      id: "4",
      name: "SEP 2022",
      selected: true,
      expanded: true,
    },
    {
      parentId: "2",
      id: "5",
      name: "OCT 2022",
      selected: true,
      expanded: true,
    },
    {
      parentId: "1",
      id: "12",
      name: "Electric",
      selected: true,
      expanded: true,
    },
    {
      parentId: "12",
      id: "13",
      name: "AUG 2022",
      selected: true,
      expanded: true,
    },
    {
      parentId: "",
      id: "6",
      name: "Subscriptions",
      selected: true,
      expanded: true,
    },
    { parentId: "6", id: "7", name: "AWS", selected: true, expanded: true },
    {
      parentId: "7",
      id: "8",
      name: "AUG 2022",
      selected: true,
      expanded: true,
    },
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
    {
      parentId: "10",
      id: "11",
      name: "AUG 2022",
      selected: true,
      expanded: true,
    },
  ];

  const [monthList, setMonthList] = useState(categoryMonthList);

  const getChartBarColor = (monthsAhead: number) => {
    if (monthsAhead <= 2) {
      return "bg-orange-500";
    }
    if (monthsAhead <= 6) {
      return "bg-yellow-400";
    }
    return "bg-green-500";
  };

  const parentsAreExpanded = (item: CheckboxItem): boolean => {
    // console.log("PARENT FUNCTION");
    // console.log("item", item);
    const itemParent = monthList.find((itm) => itm.id == item.parentId);
    // console.log("itemParent", itemParent);
    if (itemParent && itemParent.expanded) {
      let isExpanded = itemParent.expanded;
      if (!isExpanded) {
        return false;
      }
      if (itemParent.parentId == "") {
        return true;
      }
      return parentsAreExpanded(itemParent);
    }
    return false;
  };

  const getRowContent = (
    item: CheckboxItem,
    indent: number,
    isCollapsible: boolean,
    showCheckboxes: boolean,
    selected: boolean,
    parentIsHovered: boolean,
    isDet: boolean,
    isAll: boolean
  ) => {
    const LEFT_MARGIN_PIXELS = 25;
    const indentStyle = {
      paddingLeft: (LEFT_MARGIN_PIXELS * indent + 2).toString() + "px",
    };

    switch (indent) {
      case 0:
        return (
          <div
            className={`flex flex-grow justify-between font-mplus py-[1px] font-extrabold ${
              isCollapsible && "hover: hover:cursor-pointer rounded-lg"
            }`}
          >
            <div style={indentStyle} className="w-[50%] flex">
              {isCollapsible &&
                (item.expanded ? (
                  <ChevronDownIcon className="h-4 sm:h-6 w-4 sm:w-6" />
                ) : (
                  <ChevronRightIcon className="h-4 sm:h-6 w-4 sm:w-6" />
                ))}
              <div>{item.name}</div>
            </div>
            {resetProgress && <div className="w-[17%]"></div>}
            <div className={`${resetProgress ? "w-[17%]" : "w-[25%]"}`}></div>
            <div
              className={`${
                resetProgress ? "w-[17%]" : "w-[25%]"
              } text-right pr-2`}
            >
              {getMoneyString(100)}
            </div>
          </div>
        );
      case 1:
        return !isCollapsible || (isCollapsible && parentsAreExpanded(item)) ? (
          <div
            className={`flex flex-grow justify-between font-mplus py-[1px] ${
              isCollapsible &&
              !hovered &&
              "hover: hover:cursor-pointer rounded-lg"
            }`}
          >
            <div style={indentStyle} className="w-[50%] flex">
              {isCollapsible &&
                (item.expanded ? (
                  <ChevronDownIcon className="h-4 sm:h-6 w-4 sm:w-6" />
                ) : (
                  <ChevronRightIcon className="h-4 sm:h-6 w-4 sm:w-6" />
                ))}
              <div>{item.name}</div>
            </div>
            {resetProgress && (
              <div className="w-[17%]">
                <div className="h-6 flex items-center border-2 border-blue-900 rounded-lg font-bold text-sm sm:text-base">
                  <div
                    className={`flex-grow border-r border-blue-900 rounded-tr-none rounded-br-none rounded-lg text-center hover:cursor-pointer hover:bg-blue-900 ${
                      clicked?.id == item.id
                        ? "hover:opacity-100"
                        : "hover:opacity-60"
                    } hover:text-white hover:font-bold`}
                    onClick={() => {}}
                    onMouseDown={() => {
                      setClicked(item);
                    }}
                    onMouseUp={() => {
                      setClicked(null);
                    }}
                    onMouseEnter={() => {
                      setHovered(item);
                    }}
                    onMouseLeave={() => {
                      setHovered(null);
                    }}
                  >
                    <div className="unselectable">-</div>
                  </div>
                  <div
                    className={`flex-grow border-l border-blue-900 rounded-tl-none rounded-bl-none rounded-lg text-center hover:cursor-pointer hover:bg-blue-900 ${
                      clicked?.id == item.id
                        ? "hover:opacity-100"
                        : "hover:opacity-60"
                    } hover:text-white hover:font-bold`}
                    onClick={() => {}}
                    onMouseDown={() => {
                      setClicked(item);
                    }}
                    onMouseUp={() => {
                      setClicked(null);
                    }}
                    onMouseEnter={() => {
                      setHovered(item);
                    }}
                    onMouseLeave={() => {
                      setHovered(null);
                    }}
                  >
                    <div className="unselectable">+</div>
                  </div>
                </div>
              </div>
            )}
            <div
              className={`${resetProgress ? "w-[17%]" : "w-[25%]"} text-center`}
            >
              3
            </div>
            <div
              className={`${
                resetProgress ? "w-[17%]" : "w-[25%]"
              } text-right pr-2`}
            >
              {getMoneyString(100)}
            </div>
          </div>
        ) : (
          <></>
        );
      case 2:
        return !isCollapsible || (isCollapsible && parentsAreExpanded(item)) ? (
          <div className="flex flex-grow justify-between font-mplus py-[1px] text-gray-400 text-sm">
            <div style={indentStyle} className="w-[50%] flex">
              <div className="pl-4">{item.name}</div>
            </div>
            {resetProgress && <div className="w-[17%]"></div>}
            <div className={`${resetProgress ? "w-[17%]" : "w-[25%]"}`}></div>
            <div
              className={`${
                resetProgress ? "w-[17%]" : "w-[25%]"
              } text-right pr-2`}
            >
              {getMoneyString(100)}
            </div>
          </div>
        ) : (
          <></>
        );
      default:
        return <div></div>;
    }
  };

  return (
    <>
      <div className="h-full flex font-mplus p-2 space-x-2">
        {/* Chart */}
        <Card className="flex flex-col w-[60%] p-1">
          <div className="text-center font-bold text-3xl mb-2">
            Regular Expenses Progress
          </div>
          <div className="relative flex flex-grow ">
            <div className="flex w-full">
              <div className="w-[15%] h-[97%] z-10 border-r border-black"></div>

              <div className="w-[20%] -mr-4"></div>

              <div className="w-[9%] flex flex-col items-center">
                <div className="flex-grow w-[2px] bg-gray-300 mr-10"></div>
                <div className="mr-10">0</div>
              </div>

              <div className="w-[9%] flex flex-col items-center">
                <div className="flex-grow w-[2px] bg-gray-300 mr-10"></div>
                <div className="mr-10">1</div>
              </div>
              <div className="w-[9%] flex flex-col items-center">
                <div className="flex-grow w-[2px] bg-gray-300 mr-10"></div>
                <div className="mr-10">2</div>
              </div>
              <div className="w-[9%] flex flex-col items-center">
                <div className="flex-grow w-[2px] bg-gray-300 mr-10"></div>
                <div className="mr-10">3</div>
              </div>
              <div className="w-[9%] flex flex-col items-center">
                <div className="flex-grow w-[2px] bg-gray-300 mr-10"></div>
                <div className="mr-10">4</div>
              </div>
              <div className="w-[9%] flex flex-col items-center">
                <div className="flex-grow w-[2px] bg-gray-300 mr-10"></div>
                <div className="mr-10">5</div>
              </div>
              <div className="w-[9%] z-10 flex flex-col items-center">
                <div className="flex-grow w-[2px] border border-dashed border-red-500 mr-10"></div>
                <div className="mr-10">6</div>
              </div>
              <div className="w-[9%] flex flex-col items-center">
                <div className="flex-grow w-[2px] bg-gray-300 mr-10"></div>
                <div className="mr-10">More</div>
              </div>

              <div className="absolute top-2 left-0 h-[96%] w-full space-y-1 overflow-y-auto no-scrollbar">
                <div className="flex border-b border-black pb-1 space-x-1">
                  <div className="w-[14%] text-right font-extrabold pr-1">
                    <div>Immediate Obligations</div>
                  </div>
                  <div className="w-[86%] space-y-1 text-sm">
                    <div className="flex items-center">
                      <div className="w-[23%] text-right pr-1">
                        Rent/Mortgage
                      </div>
                      <div
                        style={{ width: (10 * 7).toString() + "%" }}
                        className={`h-5 ml-[1px] ${
                          resetProgress && "opacity-50"
                        } ${resetProgress && "opacity-50"} ${getChartBarColor(
                          2
                        )}`}
                      ></div>
                    </div>
                    <div className="flex items-center">
                      <div className="w-[23%] text-right pr-1">
                        Rent/Mortgage
                      </div>
                      <div
                        style={{ width: (10 * 7).toString() + "%" }}
                        className={`h-5 ml-[1px] ${
                          resetProgress && "opacity-50"
                        } ${getChartBarColor(2)}`}
                      ></div>
                    </div>
                    <div className="flex items-center">
                      <div className="w-[23%] text-right pr-1">
                        Rent/Mortgage
                      </div>
                      <div
                        style={{ width: (10 * 7).toString() + "%" }}
                        className={`h-5 ml-[1px] ${
                          resetProgress && "opacity-50"
                        } ${getChartBarColor(2)}`}
                      ></div>
                    </div>
                    <div className="flex items-center">
                      <div className="w-[23%] text-right pr-1">
                        Rent/Mortgage
                      </div>
                      <div
                        style={{ width: (10 * 7).toString() + "%" }}
                        className={`h-5 ml-[1px] ${
                          resetProgress && "opacity-50"
                        } ${getChartBarColor(2)}`}
                      ></div>
                    </div>
                    <div className="flex items-center">
                      <div className="w-[23%] text-right pr-1">
                        Rent/Mortgage
                      </div>
                      <div
                        style={{ width: (10 * 7).toString() + "%" }}
                        className={`h-5 ml-[1px] ${
                          resetProgress && "opacity-50"
                        } ${getChartBarColor(2)}`}
                      ></div>
                    </div>
                    <div className="flex items-center">
                      <div className="w-[23%] text-right pr-1">
                        Rent/Mortgage
                      </div>
                      <div
                        style={{ width: (10 * 7).toString() + "%" }}
                        className={`h-5 ml-[1px] ${
                          resetProgress && "opacity-50"
                        } ${getChartBarColor(2)}`}
                      ></div>
                    </div>
                    <div className="flex items-center">
                      <div className="w-[23%] text-right pr-1">
                        Rent/Mortgage
                      </div>
                      <div
                        style={{ width: (10 * 7).toString() + "%" }}
                        className={`h-5 ml-[1px] ${
                          resetProgress && "opacity-50"
                        } ${getChartBarColor(2)}`}
                      ></div>
                    </div>
                    <div className="flex items-center">
                      <div className="w-[23%] text-right pr-1">
                        Rent/Mortgage
                      </div>
                      <div
                        style={{ width: (10 * 7).toString() + "%" }}
                        className={`h-5 ml-[1px] ${
                          resetProgress && "opacity-50"
                        } ${getChartBarColor(2)}`}
                      ></div>
                    </div>
                  </div>
                </div>
                <div className="flex border-b border-black pb-1 space-x-1">
                  <div className="w-[14%] text-right font-extrabold pr-1">
                    <div>Subscriptions</div>
                  </div>
                  <div className="w-[86%] space-y-1 text-sm">
                    <div className="flex items-center">
                      <div className="w-[23%] text-right pr-1">
                        Rent/Mortgage
                      </div>
                      <div
                        style={{ width: (10 * 7).toString() + "%" }}
                        className={`h-5 ml-[1px] ${
                          resetProgress && "opacity-50"
                        } ${getChartBarColor(2)}`}
                      ></div>
                    </div>

                    <div className="flex items-center">
                      <div className="w-[23%] text-right pr-1">
                        Rent/Mortgage
                      </div>
                      <div
                        style={{ width: (10 * 7).toString() + "%" }}
                        className={`h-5 ml-[1px] ${
                          resetProgress && "opacity-50"
                        } ${getChartBarColor(2)}`}
                      ></div>
                    </div>
                    <div className="flex items-center">
                      <div className="w-[23%] text-right pr-1">
                        Rent/Mortgage
                      </div>
                      <div
                        style={{ width: (10 * 7).toString() + "%" }}
                        className={`h-5 ml-[1px] ${
                          resetProgress && "opacity-50"
                        } ${getChartBarColor(2)}`}
                      ></div>
                    </div>
                    <div className="flex items-center">
                      <div className="w-[23%] text-right pr-1">
                        Rent/Mortgage
                      </div>
                      <div
                        style={{ width: (10 * 7).toString() + "%" }}
                        className={`h-5 ml-[1px] ${
                          resetProgress && "opacity-50"
                        } ${getChartBarColor(2)}`}
                      ></div>
                    </div>
                    <div className="flex items-center">
                      <div className="w-[23%] text-right pr-1">
                        Rent/Mortgage
                      </div>
                      <div
                        style={{ width: (10 * 7).toString() + "%" }}
                        className={`h-5 ml-[1px] ${
                          resetProgress && "opacity-50"
                        } ${getChartBarColor(2)}`}
                      ></div>
                    </div>
                    <div className="flex items-center">
                      <div className="w-[23%] text-right pr-1">
                        Rent/Mortgage
                      </div>
                      <div
                        style={{ width: (10 * 7).toString() + "%" }}
                        className={`h-5 ml-[1px] ${
                          resetProgress && "opacity-50"
                        } ${getChartBarColor(2)}`}
                      ></div>
                    </div>
                    <div className="flex items-center">
                      <div className="w-[23%] text-right pr-1">
                        Rent/Mortgage
                      </div>
                      <div
                        style={{ width: (10 * 7).toString() + "%" }}
                        className={`h-5 ml-[1px] ${
                          resetProgress && "opacity-50"
                        } ${getChartBarColor(2)}`}
                      ></div>
                    </div>
                    <div className="flex items-center">
                      <div className="w-[23%] text-right pr-1">
                        Rent/Mortgage
                      </div>
                      <div
                        style={{ width: (10 * 7).toString() + "%" }}
                        className={`h-5 ml-[1px] ${
                          resetProgress && "opacity-50"
                        } ${getChartBarColor(2)}`}
                      ></div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </Card>

        <div className="flex flex-col flex-grow space-y-2">
          {/* Overview */}
          <Card className="p-1">
            <div className="text-center font-bold text-3xl mb-2">Overview</div>
            <div className="flex justify-around pb-1">
              <LabelAndValue
                label={<div>Months Ahead Target</div>}
                value={
                  !editingTarget ? (
                    <div className="flex items-center">
                      <div className="text-3xl">{currentTarget}</div>
                      <PencilSquareIcon
                        className="h-8 w-8 ml-1 hover:cursor-pointer"
                        onClick={() => {
                          setEditingTarget(true);
                        }}
                      />
                    </div>
                  ) : (
                    <div className="flex flex-col items-center">
                      <RadioButtonGroup
                        buttons={["3", "6", "12"]}
                        selectedButton={currentTarget.toString()}
                        onSelect={(button: string) =>
                          setCurrentTarget(parseInt(button))
                        }
                        className={"flex space-x-4 my-1"}
                      />
                      <div className="flex space-x-2">
                        <button
                          onClick={() => {
                            setEditingTarget(false);
                          }}
                          className={`px-2 py-1 bg-gray-300 rounded-md shadow-slate-400 shadow-sm hover:bg-blue-400 hover:text-white`}
                        >
                          <div className="flex justify-center items-center">
                            <CheckIcon className="h-6 w-6 text-green-600 stroke-2 mr-1" />
                            <div className="font-semibold text-sm">Save</div>
                          </div>
                        </button>
                        <button
                          onClick={() => {
                            // TODO: Set currently selected before editing
                            setCurrentTarget(6);
                            setEditingTarget(false);
                          }}
                          className={`px-2 py-1 bg-gray-300 rounded-md shadow-slate-400 shadow-sm hover:bg-blue-400 hover:text-white`}
                        >
                          <div className="flex justify-center items-center">
                            <MinusCircleIcon className="h-6 w-6 text-red-600 stroke-2 mr-1" />
                            <div className="font-semibold text-sm">Cancel</div>
                          </div>
                        </button>
                      </div>
                    </div>
                  )
                }
                classNameValue={"px-2"}
              />

              {/* Vertical Divider */}
              <div className="w-[1px] bg-gray-400" />

              <LabelAndValue
                label={
                  <div>
                    # of Regular Expense
                    <br />
                    Categories
                  </div>
                }
                value={"28"}
                classNameValue={"text-3xl"}
              />

              {/* Vertical Divider */}
              <div className="w-[1px] bg-gray-400" />

              <LabelAndValue
                label={
                  <div>
                    Regular Expenses w/
                    <br />
                    Target Met
                  </div>
                }
                value={
                  <div className="flex items-center">
                    <div className="text-3xl">16</div>
                    <div className="text-lg ml-1">(57%)</div>
                  </div>
                }
              />
            </div>
          </Card>

          {/* Details */}
          <Card className="flex flex-col h-full p-2 space-y-2">
            {!isPosting ? (
              <>
                <div className="text-center font-bold text-3xl">Details</div>
                <div className="flex justify-around items-center">
                  {!resetProgress ? (
                    <>
                      <LabelAndValue
                        label={
                          <div className="leading-6">
                            Total Saved for
                            <br />
                            Future Months
                          </div>
                        }
                        value={"$160"}
                        classNameLabel={"line"}
                        classNameValue={"text-green-500 text-2xl"}
                      />
                      <LabelAndValue
                        label={"Total Saved by Month"}
                        value={
                          <PostingMonthBreakdown
                            months={months}
                            showPercent={false}
                          />
                        }
                        classNameValue={""}
                      />

                      <button
                        onClick={showModal}
                        className={`px-2 py-1 h-fit bg-gray-300 rounded-md shadow-slate-400 shadow-sm hover:bg-blue-400 hover:text-white`}
                      >
                        <div className="flex justify-center items-center">
                          <QuestionMarkCircleIcon className="h-10 w-10 text-purple-600 stroke-2 mr-1" />
                          <div className="font-semibold text-base">
                            Reset
                            <br />
                            Progress
                          </div>
                        </div>
                      </button>
                    </>
                  ) : (
                    <>
                      <LabelAndValue
                        label={
                          <div className="leading-6">
                            Total Amount Available
                            <br />
                            in Budget
                          </div>
                        }
                        value={"$160"}
                        classNameValue={"text-green-500 text-2xl"}
                      />
                      <LabelAndValue
                        label={
                          <div className="leading-6">
                            Amount
                            <br />
                            Used
                          </div>
                        }
                        value={"$160"}
                        classNameValue={"text-2xl"}
                      />
                      <LabelAndValue
                        label={
                          <div className="leading-6">
                            Amount
                            <br />
                            Remaining
                          </div>
                        }
                        value={"$160"}
                        classNameValue={"text-green-500 text-2xl"}
                      />
                    </>
                  )}
                </div>

                {/* NOTE: 
                    For some reason, if I don't put a height at all "h-0", then it goes past
                    the window. However, no matter what height I put (h-0, h-50, h-2million),
                    it doesn't apply that height, but does fit the content between the details
                    above and the buttons below, which is exactly what I'm looking for! */}
                {/* TABLE STARTS HERE */}
                <div className="flex flex-col h-0 flex-grow ">
                  <div className="flex items-center border-t border-b border-black py-1">
                    <div className={`w-[50%] font-bold text-lg pl-6`}>
                      Category
                    </div>
                    {resetProgress && (
                      <div
                        className={`w-[17%] font-bold text-lg text-center pr-2 leading-5`}
                      >
                        Add/
                        <br />
                        Remove
                      </div>
                    )}
                    <div
                      className={`${
                        resetProgress ? "w-[17%]" : "w-[25%]"
                      } font-bold text-lg text-center pr-2 leading-5`}
                    >
                      # of
                      <br />
                      Months
                    </div>
                    <div
                      className={`${
                        resetProgress ? "w-[17%]" : "w-[25%]"
                      } font-bold text-lg text-right pr-2 leading-5`}
                    >
                      Total
                      <br />
                      Amount
                    </div>
                  </div>

                  <div className="flex flex-col overflow-y-auto no-scrollbar">
                    <CheckBoxGroup
                      items={monthList}
                      setItems={setMonthList}
                      getRowContent={getRowContent}
                      showCheckboxes={false}
                      isCollapsible={true}
                      hovered={hovered}
                      // onSelect={(
                      //   selectedItem: CheckboxItem,
                      //   selectedIndex: number
                      // ) => {}}
                    />
                  </div>
                </div>

                {/* "Posting To budget / Cancel" buttons */}
                {resetProgress && (
                  <div className="flex items-end justify-center space-x-4 pt-2 border-t border-black">
                    <button
                      onClick={() => {
                        setIsPosting(true);
                        setResetProgress(false);
                      }}
                      className={`px-2 py-1 w-[45%] bg-gray-300 rounded-md shadow-slate-400 shadow-sm hover:bg-blue-400 hover:text-white`}
                    >
                      <div className="flex justify-center items-center">
                        <CheckIcon className="h-10 w-10 text-green-600 stroke-2 mr-1" />
                        <div className="font-semibold text-base">
                          Post Amounts to Budget
                        </div>
                      </div>
                    </button>
                    <button
                      onClick={() => setResetProgress(false)}
                      className={`px-2 py-1 w-[45%] bg-gray-300 rounded-md shadow-slate-400 shadow-sm hover:bg-blue-400 hover:text-white`}
                    >
                      <div className="flex justify-center items-center">
                        <MinusCircleIcon className="h-10 w-10 text-red-600 stroke-2 mr-1" />
                        <div className="font-semibold text-base">Go Back</div>
                      </div>
                    </button>
                  </div>
                )}
              </>
            ) : (
              <div className="h-full flex flex-col justify-between">
                <div className="text-center font-bold text-3xl">
                  Posting to Budget
                </div>

                <div className="flex flex-col space-y-10">
                  <div className="px-2">
                    <Label label={"Current Progress"} className="px-2" />
                    <div className="bg-gray-300 h-6 rounded-md shadow-md shadow-slate-400">
                      <div
                        style={{ width: "24%" }}
                        className="h-6 rounded-md bg-green-600"
                      ></div>
                    </div>
                  </div>
                  <div className="flex flex-col space-y-4">
                    <LabelAndValue
                      label={"Currently Posting to Budget"}
                      value={"Rent/Mortgage"}
                      classNameValue={"text-2xl"}
                    />
                    <LabelAndValue
                      label={"Month"}
                      value={"August 2022"}
                      classNameValue={"text-2xl"}
                    />
                    <LabelAndValue
                      label={"Amount"}
                      value={"$500"}
                      classNameValue={"text-2xl text-green-600"}
                    />
                  </div>
                </div>

                <div className="flex justify-center items-end">
                  <button
                    onClick={() => setIsPosting(false)}
                    className={`px-6 py-1 w-[95%] bg-gray-300 rounded-md shadow-slate-400 shadow-sm hover:bg-blue-400 hover:text-white`}
                  >
                    <div className="flex justify-center items-center">
                      <ArrowLeftIcon className="h-10 w-10 stroke-2 mr-1" />
                      <div className="font-semibold text-base">Go Back</div>
                    </div>
                  </button>
                </div>
              </div>
            )}
          </Card>
        </div>
      </div>

      {isOpen && (
        <ModalContent
          modalContentID={ModalType.RESET_REGULAR_EXPENSES}
          onClose={closeModal}
        >
          <ResetExpensesProgress
            closeModal={closeModal}
            setResetProgress={setResetProgress}
          />
        </ModalContent>
      )}
    </>
  );
}

export default RegularExpensesFull;
