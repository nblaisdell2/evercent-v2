import {
  ArrowLeftIcon,
  CheckIcon,
  ChevronDownIcon,
  ChevronRightIcon,
  MinusCircleIcon,
  MinusIcon,
  PencilSquareIcon,
} from "@heroicons/react/24/outline";
import { stringify } from "querystring";
import React, { useState } from "react";
import { PostingMonth } from "../utils/evercent";
import { getMoneyString, ModalType } from "../utils/utils";
import Card from "./elements/Card";
import CheckBoxGroup, { CheckboxItem } from "./elements/CheckBoxGroup";
import Label from "./elements/Label";
import LabelAndValue from "./elements/LabelAndValue";
import MyCheckbox from "./elements/MyCheckbox";
import MyToggleButton from "./elements/MyToggleButton";
import useModal from "./hooks/useModal";
import AutomationScheduleModal from "./modal/AutomationScheduleModal";
import CancelAutomationModal from "./modal/CancelAutomationModal";
import ModalContent from "./modal/ModalContent";
import PostingMonthBreakdown from "./PostingMonthBreakdown";

type Props = { months: PostingMonth[]; closeModal: () => void };

function BudgetAutomationFull({ months, closeModal }: Props) {
  const {
    isOpen: isOpenCancel,
    showModal: showModalCancel,
    closeModal: closeModalCancel,
  } = useModal();
  const {
    isOpen: isOpenSchedule,
    showModal: showModalSchedule,
    closeModal: closeModalSchedule,
  } = useModal();

  const [showUpcoming, setShowUpcoming] = useState(true);
  const [pastRunListIndex, setPastRunListIndex] = useState(0);
  const [selectedItem, setSelectedItem] = useState<CheckboxItem | null>(null);
  const [categoryMonthListIndex, setCategoryMonthListIndex] = useState(-1);

  const amountsPosted: any = [
    {
      monthYear: "AUG 2022",
      previousAmount: 0,
      addedAmount: 160,
      newAmount: 160,
    },
    {
      monthYear: "SEP 2022",
      previousAmount: -10,
      addedAmount: 160,
      newAmount: 150,
    },
    {
      monthYear: "OCT 2022",
      previousAmount: 50,
      addedAmount: 160,
      newAmount: 210,
    },
  ];

  const runTimes: any[] = [1, 2, 3, 4, 2, 3, 4, 2, 3, 4];

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

  const [monthList, setMonthList] = useState(categoryMonthList);

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
          <div className="flex flex-grow justify-between font-mplus font-extrabold py-[1px]">
            <div className="flex items-center" style={indentStyle}>
              {showCheckboxes && (
                <MyCheckbox
                  selected={selected}
                  parentIsHovered={parentIsHovered}
                  isDet={isDet}
                  isAll={isAll}
                />
              )}
              <div>{item.name}</div>
            </div>
            <div className="pr-1">{getMoneyString(100)}</div>
          </div>
        );
      case 1:
        return (
          <div className={`flex flex-grow justify-between font-mplus py-[1px]`}>
            <div className="flex items-center" style={indentStyle}>
              {showCheckboxes && (
                <MyCheckbox
                  selected={selected}
                  parentIsHovered={parentIsHovered}
                  isDet={isDet}
                  isAll={isAll}
                />
              )}
              <div>{item.name}</div>
            </div>
            <div className="pr-1">{getMoneyString(100)}</div>
          </div>
        );
      case 2:
        return (
          <div className="flex flex-grow justify-between font-mplus text-gray-400 text-sm py-[1px]">
            <div className="flex items-center" style={indentStyle}>
              {showCheckboxes && (
                <MyCheckbox
                  selected={selected}
                  parentIsHovered={parentIsHovered}
                  isDet={isDet}
                  isAll={isAll}
                />
              )}
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
    <>
      {/* Web Version */}
      <div className="h-full w-full hidden sm:block">
        <div className="flex h-[25%]">
          {/* Top Left - Upcoming/Past */}
          <div className="w-[65%] flex flex-col p-2">
            <div className="flex items-center justify-around mb-2">
              <MyToggleButton
                leftSideTrue={showUpcoming}
                leftValue={"Upcoming Runs"}
                rightValue={"Past Runs"}
                onToggle={(toggleValue: boolean) => {
                  setShowUpcoming(toggleValue);
                  if (toggleValue) {
                    setCategoryMonthListIndex(-1);
                    setSelectedItem(null);
                  }
                }}
              />
              <div className="flex font-mplus text-sm italic h-10 w-96 items-end">
                {showUpcoming ? (
                  <div>Here are the next 10 upcoming paydates</div>
                ) : (
                  <div>
                    <span className="font-bold">Click</span> on one of the past
                    paydates below to see
                    <br />
                    what was posted to the budget on that date.
                  </div>
                )}
              </div>
            </div>
            <Card className="font-mplus flex flex-col w-full flex-grow p-1 overflow-y-auto">
              <div className="flex w-full justify-around font-bold border-b border-black">
                <div className="w-full text-center">Date</div>
                <div className="w-full text-center">Time</div>
                {!showUpcoming && (
                  <div className="w-full text-center">Total Amount Posted</div>
                )}
              </div>
              <div className="overflow-y-auto no-scrollbar">
                {runTimes.map((rt: any, i: number) => {
                  return (
                    <div
                      className={`flex w-full justify-around rounded-md ${
                        i == (showUpcoming ? 0 : pastRunListIndex) &&
                        "font-bold"
                      } ${
                        !showUpcoming &&
                        i == pastRunListIndex &&
                        "bg-gray-200 hover:bg-gray-200"
                      } ${!showUpcoming && "hover:cursor-pointer"} ${
                        !showUpcoming &&
                        i != pastRunListIndex &&
                        "hover:bg-gray-100"
                      }
                    }`}
                      key={i}
                      onClick={() => setPastRunListIndex(i)}
                    >
                      <div className={`w-full text-center`}>08/07/2022</div>
                      <div className={`w-full text-center`}>7:00AM</div>
                      {!showUpcoming && (
                        <div className="w-full text-center text-green-500">
                          $960
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </Card>
          </div>
          {/* Top Right - Schedule */}
          <div className="flex-grow flex flex-col justify-around">
            <div className="flex w-full items-center justify-center ">
              <div className="flex font-mplus text-3xl font-extrabold">
                Schedule
              </div>
              <PencilSquareIcon
                className="h-8 w-8 stroke-2 ml-1 hover:cursor-pointer"
                onClick={() => {
                  showModalSchedule();
                }}
              />
            </div>

            <div className="flex justify-around">
              <div className="w-[50%]">
                <LabelAndValue
                  label={"Next Auto Run"}
                  value={"08/04/2022"}
                  classNameValue={"font-mplus text-lg"}
                />
              </div>
              <div className="w-[50%]">
                <LabelAndValue
                  label={"Run Time"}
                  value={"7:00AM"}
                  classNameValue={"font-mplus text-lg"}
                />
              </div>
              <div className="w-[50%] text-center">
                <LabelAndValue
                  label={"Time Left"}
                  value={"13 days 13 hours"}
                  classNameValue={"font-mplus text-lg"}
                />
              </div>
            </div>

            <div className="flex space-x-4 justify-evenly w-full">
              <button
                onClick={() => {
                  closeModal();
                }}
                className={`inset-x-0 h-auto px-2 py-1 bg-gray-300 rounded-md shadow-slate-400 shadow-sm hover:bg-blue-400 hover:text-white`}
              >
                <div className="flex justify-center items-center">
                  <CheckIcon className="h-10 w-10 text-green-600 stroke-2 mr-1" />
                  <div className="font-semibold text-sm">Save & Exit</div>
                </div>
              </button>
              <button
                onClick={() => {}}
                className={`inset-x-0 h-auto px-2 py-1 bg-gray-300 rounded-md shadow-slate-400 shadow-sm hover:bg-blue-400 hover:text-white`}
              >
                <div
                  className="flex justify-center items-center"
                  onClick={() => {
                    showModalCancel();
                  }}
                >
                  <MinusCircleIcon className="h-10 w-10 text-red-600 stroke-2 mr-1" />
                  <div className="font-semibold text-sm">Cancel Automation</div>
                </div>
              </button>
            </div>
          </div>
        </div>
        <div className="flex h-[75%]">
          {/* Bottom Left - Amounts Posted to Budget */}
          <div className="flex flex-col space-y-2 w-[50%] p-2">
            <div className="text-center font-mplus text-3xl font-extrabold">
              Amounts Posted to Budget
            </div>
            <div className="flex justify-evenly">
              <LabelAndValue
                label={"Run Time"}
                value={"08/07/2022 @ 7:00AM"}
                classNameValue={"font-mplus text-2xl"}
              />
              <LabelAndValue
                label={"Total"}
                value={getMoneyString(960)}
                classNameValue={"font-mplus text-2xl text-green-600"}
              />
              {showUpcoming && (
                <LabelAndValue
                  label={"Locked?"}
                  value={"Yes"}
                  classNameValue={"font-mplus text-2xl"}
                />
              )}
            </div>
            <Card className="flex-grow p-2 overflow-y-auto no-scrollbar">
              <CheckBoxGroup
                items={monthList}
                setItems={setMonthList}
                getRowContent={getRowContent}
                showCheckboxes={showUpcoming}
                isCollapsible={false}
                onSelect={(
                  selectedItem: CheckboxItem,
                  selectedIndex: number
                ) => {
                  if (!showUpcoming) {
                    setCategoryMonthListIndex(selectedIndex);
                    setSelectedItem(selectedItem);
                  }
                }}
                selectedIndex={categoryMonthListIndex}
              />
            </Card>
          </div>
          {/* Bottom Right - Overview Section */}
          <div className="flex flex-col space-y-2 w-[50%] p-2">
            <Card className="flex flex-col flex-grow p-2 overflow-y-auto">
              {!selectedItem ? (
                <>
                  <div className="text-center font-mplus text-3xl font-extrabold">
                    Overview
                  </div>
                  <div className="flex-grow flex flex-col justify-center text-3xl">
                    <LabelAndValue
                      label={"Posting Month Breakdown"}
                      value={
                        <PostingMonthBreakdown
                          months={months}
                          showPercent={true}
                        />
                      }
                      classNameValue={"mt-2 w-[60%]"}
                    />
                  </div>
                </>
              ) : (
                <div className="flex flex-col h-full">
                  <div
                    className="flex items-center hover:cursor-pointer"
                    onClick={() => {
                      setSelectedItem(null);
                      setCategoryMonthListIndex(-1);
                    }}
                  >
                    <ArrowLeftIcon className="h-8 w-8 stroke-2 mr-1" />
                    <Label label={"Back to Overview"} className="text-lg" />
                  </div>
                  <div className="flex justify-around items-center">
                    <div className="flex-grow text-center text-3xl font-bold">
                      Rent/Mortage
                    </div>
                    <div className="flex-grow">
                      <div className="flex justify-around">
                        <LabelAndValue
                          label={"Amount"}
                          value={getMoneyString(960)}
                          classNameValue={"text-2xl font-mplus"}
                        />
                        <LabelAndValue
                          label={"Extra Amount"}
                          value={getMoneyString(960)}
                          classNameValue={"text-2xl font-mplus"}
                        />
                        <LabelAndValue
                          label={"Adjusted Amount"}
                          value={getMoneyString(960)}
                          classNameValue={"text-2xl font-mplus"}
                        />
                      </div>
                      <div>
                        <LabelAndValue
                          label={"Adjusted Amount per Paycheck"}
                          value={getMoneyString(480)}
                          classNameValue={"text-2xl font-mplus"}
                        />
                      </div>
                    </div>
                  </div>

                  <div className="flex-grow h-full ">
                    <div className="border-b border-black mt-2 pb-1 text-xl font-bold">
                      Explanation of Amounts
                    </div>
                    <div className="">(explanation goes here)</div>
                  </div>
                  <div className="">
                    <div className="border-b border-black mt-2 pb-1 text-xl font-bold">
                      Amounts Posted
                    </div>
                    <div className="flex justify-between border-b border-black">
                      <div className="text-sm text-center font-bold w-[25%] ">
                        Month/Year
                      </div>
                      <div className="text-sm text-right pr-1 font-bold w-[25%] ">
                        Previous Amount
                      </div>
                      <div className="text-sm text-right pr-1 font-bold w-[25%] ">
                        Added Amount
                      </div>
                      <div className="text-sm text-right pr-1 font-bold w-[25%] ">
                        New Amount
                      </div>
                    </div>
                    <div>
                      {amountsPosted.map((amt: any) => {
                        return (
                          <div
                            className="flex justify-between text-center"
                            key={amt.monthYear}
                          >
                            <div className="text-sm w-[25%] ">
                              {amt.monthYear}
                            </div>
                            <div
                              className={`text-sm text-right pr-1 w-[25%]  ${
                                amt.previousAmount < 0
                                  ? "text-yellow-500"
                                  : amt.previousAmount == 0
                                  ? "text-gray-400"
                                  : "text-green-600"
                              }`}
                            >
                              {getMoneyString(amt.previousAmount, 2)}
                            </div>
                            <div className="text-sm text-right pr-1 w-[25%] ">
                              {getMoneyString(amt.addedAmount, 2)}
                            </div>
                            <div className="text-sm text-right pr-1 w-[25%]  text-green-600 ">
                              {getMoneyString(amt.newAmount, 2)}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              )}
            </Card>
          </div>
        </div>
      </div>

      {/* Mobile Version */}
      <div className="h-full w-full flex flex-col sm:hidden">
        {showUpcoming || (!showUpcoming && !selectedItem) ? (
          <>
            <div className="mt-2 border-b border-gray-400">
              <div className="flex w-full items-center justify-center mb-1">
                <div className="flex font-mplus text-2xl font-extrabold">
                  Schedule
                </div>
                <PencilSquareIcon
                  className="h-8 w-8 stroke-2 ml-1 hover:cursor-pointer"
                  onClick={() => {
                    showModalSchedule();
                  }}
                />
              </div>

              <div className="flex justify-around">
                <div className="w-[50%]">
                  <LabelAndValue
                    label={"Next Auto Run"}
                    value={"08/04/2022"}
                    classNameValue={"font-mplus text-lg"}
                  />
                </div>
                <div className="w-[50%]">
                  <LabelAndValue
                    label={"Run Time"}
                    value={"7:00AM"}
                    classNameValue={"font-mplus text-lg"}
                  />
                </div>
                <div className="w-[50%] text-center">
                  <LabelAndValue
                    label={"Time Left"}
                    value={
                      <div>
                        <div className="-mb-2">13 days</div>
                        <div>13 hours</div>
                      </div>
                    }
                    classNameValue={"font-mplus text-lg"}
                  />
                </div>
              </div>
            </div>

            <div className="flex flex-col p-2">
              <div className="flex items-center justify-around mb-2">
                <MyToggleButton
                  leftSideTrue={showUpcoming}
                  leftValue={"Upcoming Runs"}
                  rightValue={"Past Runs"}
                  onToggle={(toggleValue: boolean) => {
                    setShowUpcoming(toggleValue);
                    if (toggleValue) {
                      setCategoryMonthListIndex(-1);
                      setSelectedItem(null);
                    }
                  }}
                />
                <div className="flex font-mplus text-xs italic h-12 w-96 items-center text-right">
                  {showUpcoming ? (
                    <div>Here are the next 10 upcoming paydates</div>
                  ) : (
                    <div>
                      <span className="font-bold">Click</span> on a past paydate
                      below to see what was posted to the budget
                    </div>
                  )}
                </div>
              </div>
              <Card className="font-mplus flex flex-col w-full h-28 p-1 overflow-y-auto">
                <div className="flex w-full justify-around font-bold border-b border-black">
                  <div className="w-full text-center">Date</div>
                  <div className="w-full text-center">Time</div>
                  {!showUpcoming && (
                    <div className="w-full text-center">Total Amount</div>
                  )}
                </div>
                <div className="overflow-y-auto no-scrollbar">
                  {runTimes.map((rt: any, i: number) => {
                    return (
                      <div
                        className={`flex w-full justify-around rounded-md ${
                          i == (showUpcoming ? 0 : pastRunListIndex) &&
                          "font-bold"
                        } ${
                          !showUpcoming &&
                          i == pastRunListIndex &&
                          "bg-gray-200 hover:bg-gray-200"
                        } ${!showUpcoming && "hover:cursor-pointer"} ${
                          !showUpcoming &&
                          i != pastRunListIndex &&
                          "hover:bg-gray-100"
                        }
                    }`}
                        key={i}
                        onClick={() => setPastRunListIndex(i)}
                      >
                        <div className={`w-full text-center`}>08/07/2022</div>
                        <div className={`w-full text-center`}>7:00AM</div>
                        {!showUpcoming && (
                          <div className="w-full text-center text-green-500">
                            $960
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </Card>
            </div>

            <div className="flex flex-col flex-grow overflow-y-auto space-y-2 p-2">
              <div className="text-center font-mplus text-2xl font-extrabold">
                Amounts Posted to Budget
              </div>
              <div className="flex justify-evenly">
                <LabelAndValue
                  label={"Run Time"}
                  value={"08/07/2022 @ 7:00AM"}
                  classNameValue={"font-mplus text-base"}
                />
                <LabelAndValue
                  label={"Total"}
                  value={getMoneyString(960)}
                  classNameValue={"font-mplus text-base text-green-600"}
                />
                {showUpcoming && (
                  <LabelAndValue
                    label={"Locked?"}
                    value={"Yes"}
                    classNameValue={"font-mplus text-base"}
                  />
                )}
              </div>
              <Card className="flex-grow p-2 overflow-y-auto no-scrollbar">
                <CheckBoxGroup
                  items={monthList}
                  setItems={setMonthList}
                  getRowContent={getRowContent}
                  showCheckboxes={showUpcoming}
                  isCollapsible={false}
                  onSelect={(
                    selectedItem: CheckboxItem,
                    selectedIndex: number
                  ) => {
                    if (!showUpcoming) {
                      setCategoryMonthListIndex(selectedIndex);
                      setSelectedItem(selectedItem);
                    }
                  }}
                  selectedIndex={categoryMonthListIndex}
                />
              </Card>
            </div>

            <div className="flex space-x-4 justify-evenly w-full">
              <button
                onClick={() => {
                  closeModal();
                }}
                className={`inset-x-0 h-auto px-2 py-1 bg-gray-300 rounded-md shadow-slate-400 shadow-sm hover:bg-blue-400 hover:text-white`}
              >
                <div className="flex justify-center items-center">
                  <CheckIcon className="h-10 w-10 text-green-600 stroke-2 mr-1" />
                  <div className="font-semibold text-sm">Save & Exit</div>
                </div>
              </button>
              <button
                onClick={() => {}}
                className={`inset-x-0 h-auto px-2 py-1 bg-gray-300 rounded-md shadow-slate-400 shadow-sm hover:bg-blue-400 hover:text-white`}
              >
                <div
                  className="flex justify-center items-center"
                  onClick={() => {
                    showModalCancel();
                  }}
                >
                  <MinusCircleIcon className="h-10 w-10 text-red-600 stroke-2 mr-1" />
                  <div className="font-semibold text-sm">Cancel Automation</div>
                </div>
              </button>
            </div>
          </>
        ) : (
          <div className="flex flex-col h-full">
            <div
              className="flex items-center hover:cursor-pointer"
              onClick={() => {
                setSelectedItem(null);
                setCategoryMonthListIndex(-1);
              }}
            >
              <ArrowLeftIcon className="h-6 w-6 stroke-2 mr-1" />
              <Label label={"Back"} className="text-base" />
            </div>
            <div className="flex flex-col justify-around items-center space-y-2">
              <div className="flex justify-evenly items-center w-full pb-1 border-b border-gray-400">
                <div className="text-2xl font-bold">Rent/Mortage</div>

                {/* Vertical Divider */}
                <div className="w-[1px] h-full bg-gray-400" />
                <LabelAndValue
                  label={"Run Time"}
                  value={"08/07/2022 @ 7:00AM"}
                  classNameValue={"font-mplus"}
                />
              </div>
              <div className="flex-grow w-full space-y-2 border-b border-gray-400 pb-1">
                <div className="flex justify-around">
                  <LabelAndValue
                    label={"Amount"}
                    value={getMoneyString(960)}
                    classNameValue={"text-2xl font-mplus"}
                  />
                  <LabelAndValue
                    label={"Extra Amount"}
                    value={getMoneyString(960)}
                    classNameValue={"text-2xl font-mplus"}
                  />
                  <LabelAndValue
                    label={"Adjusted Amount"}
                    value={getMoneyString(960)}
                    classNameValue={"text-2xl font-mplus"}
                  />
                </div>
                <div>
                  <LabelAndValue
                    label={"Adjusted Amount per Paycheck"}
                    value={getMoneyString(480)}
                    classNameValue={"text-2xl font-mplus"}
                  />
                </div>
              </div>
            </div>

            <div className="flex-grow h-full ">
              <div className="border-b border-black mt-2 pb-1 text-xl font-bold">
                Explanation of Amounts
              </div>
              <div className="">(explanation goes here)</div>
            </div>
            <div className="">
              <div className="border-b border-black mt-2 pb-1 text-xl font-bold">
                Amounts Posted
              </div>
              <div className="flex justify-between border-b border-black">
                <div className="whitespace-nowrap text-sm text-center font-bold w-[25%] ">
                  Month/Year
                </div>
                <div className="whitespace-nowrap text-sm text-right pr-1 font-bold w-[25%] ">
                  Previous Amt
                </div>
                <div className="whitespace-nowrap text-sm text-right pr-1 font-bold w-[25%] ">
                  Added Amt
                </div>
                <div className="whitespace-nowrap text-sm text-right pr-1 font-bold w-[25%] ">
                  New Amt
                </div>
              </div>
              <div>
                {amountsPosted.map((amt: any) => {
                  return (
                    <div
                      className="flex justify-between text-center"
                      key={amt.monthYear}
                    >
                      <div className="text-sm w-[25%] ">{amt.monthYear}</div>
                      <div
                        className={`text-sm text-right pr-1 w-[25%]  ${
                          amt.previousAmount < 0
                            ? "text-yellow-500"
                            : amt.previousAmount == 0
                            ? "text-gray-400"
                            : "text-green-600"
                        }`}
                      >
                        {getMoneyString(amt.previousAmount, 2)}
                      </div>
                      <div className="text-sm text-right pr-1 w-[25%] ">
                        {getMoneyString(amt.addedAmount, 2)}
                      </div>
                      <div className="text-sm text-right pr-1 w-[25%]  text-green-600 ">
                        {getMoneyString(amt.newAmount, 2)}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}
      </div>

      {isOpenCancel && (
        <ModalContent
          onClose={closeModalCancel}
          modalContentID={ModalType.CANCEL_AUTOMATION}
        >
          <CancelAutomationModal closeModal={closeModalCancel} />
        </ModalContent>
      )}

      {isOpenSchedule && (
        <ModalContent
          onClose={closeModalSchedule}
          modalContentID={ModalType.CHANGE_AUTOMATION_SCHEDULE}
        >
          <AutomationScheduleModal closeModal={closeModalSchedule} />
        </ModalContent>
      )}
    </>
  );
}

export default BudgetAutomationFull;
