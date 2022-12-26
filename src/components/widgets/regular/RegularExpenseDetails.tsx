import {
  ArrowLeftIcon,
  CheckIcon,
  MinusCircleIcon,
  QuestionMarkCircleIcon,
} from "@heroicons/react/24/outline";
import React, { useState } from "react";
import { PostingMonth } from "../../../utils/evercent";
import { getMoneyString } from "../../../utils/utils";
import Card from "../../elements/Card";
import HierarchyTable, { CheckboxItem } from "../../elements/HierarchyTable";
import Label from "../../elements/Label";
import LabelAndValue from "../../elements/LabelAndValue";
import MyButton from "../../elements/MyButton";
import useHierarchyTable from "../../hooks/useHierarchyTable";
import PostingMonthBreakdown from "../budget-automation/PostingMonthBreakdown";

function RegularExpenseDetails({
  resetProgress,
  setResetProgress,
  showModal,
}: {
  resetProgress: boolean;
  setResetProgress: (b: boolean) => void;
  showModal: () => void;
}) {
  const [clicked, setClicked] = useState<CheckboxItem | null>(null);
  const [hovered, setHovered] = useState<CheckboxItem | null>(null);

  const [isPosting, setIsPosting] = useState(false);

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

  const getAddRemoveButtons = (item: CheckboxItem) => {
    return (
      <div className="h-6 flex items-center border-2 border-blue-900 rounded-lg font-bold text-sm sm:text-base">
        <div
          className={`flex-grow border-r rounded-tl-md rounded-bl-md border-blue-900 text-center hover:cursor-pointer hover:bg-blue-900 ${
            clicked?.id == item.id ? "hover:opacity-100" : "hover:opacity-60"
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
          className={`flex-grow border-l border-blue-900 rounded-tr-md rounded-br-md text-center hover:cursor-pointer hover:bg-blue-900 ${
            clicked?.id == item.id ? "hover:opacity-100" : "hover:opacity-60"
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
    );
  };

  const getRowContent = (item: CheckboxItem, indent: number) => {
    switch (indent) {
      case 0:
        return (
          <div
            className={`flex w-full justify-between items-center font-mplus py-[1px] text-sm sm:text-base font-extrabold hover:bg-gray-200 hover:cursor-pointer rounded-lg`}
          >
            <div className=" w-[50%] flex items-center">
              <div>{item.name}</div>
            </div>
            {resetProgress && <div className="w-[17%]"></div>}
            <div className={`${resetProgress ? "w-[17%]" : "w-[25%]"} `}></div>
            <div
              className={`${
                resetProgress ? "w-[17%]" : "w-[25%]"
              } text-right pr-2 `}
            >
              {getMoneyString(100)}
            </div>
          </div>
        );
      case 1:
        return (
          <div
            className={`flex w-full justify-between items-center font-mplus py-[1px] text-sm sm:text-base ${
              !hovered && "hover:bg-gray-200 hover:cursor-pointer rounded-lg"
            }`}
          >
            <div className=" w-[50%] flex items-center">
              <div>{item.name}</div>
            </div>
            {resetProgress && (
              <div className="w-[17%]">{getAddRemoveButtons(item)}</div>
            )}
            <div
              className={`${
                resetProgress ? "w-[17%]" : "w-[25%]"
              } text-center `}
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
        );
      case 2:
        return (
          <div className="flex w-full justify-between items-center font-mplus py-[1px] text-gray-400 text-xs sm:text-sm">
            <div className=" w-[50%] flex">
              <div>{item.name}</div>
            </div>
            {resetProgress && <div className="w-[17%]"></div>}
            <div className={`${resetProgress ? "w-[17%]" : "w-[25%]"} `}></div>
            <div
              className={`${
                resetProgress ? "w-[17%]" : "w-[25%]"
              } text-right pr-2`}
            >
              {getMoneyString(100)}
            </div>
          </div>
        );
      default:
        return <div></div>;
    }
  };

  const hierarchyTableData = useHierarchyTable(categoryMonthList);

  return (
    <Card className="flex flex-col flex-grow h-0 p-2 space-y-2">
      {!isPosting ? (
        <>
          {/* Top Section - Web Version */}
          <div className="hidden sm:block">
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

                  <MyButton
                    buttonText={
                      <div className="font-semibold text-base">
                        Reset
                        <br />
                        Progress
                      </div>
                    }
                    icon={
                      <QuestionMarkCircleIcon className="h-10 w-10 text-purple-600 stroke-2 mr-1" />
                    }
                    onClick={showModal}
                  />
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
          </div>

          {/* Top Section - Mobile Version */}
          <div className="block sm:hidden w-full">
            <div className="text-center font-bold text-3xl">Details</div>

            <div className="flex w-full items-center">
              {!resetProgress ? (
                <div className="flex flex-col w-full">
                  <div className="flex justify-around items-center">
                    <LabelAndValue
                      label={
                        <div className="leading-5">
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
                          showTotal={false}
                        />
                      }
                      classNameValue={"-space-y-1 sm:space-y-0"}
                    />
                  </div>

                  <div className="w-full py-1">
                    <MyButton
                      buttonText={"Reset Progress"}
                      icon={
                        <QuestionMarkCircleIcon className="h-10 w-10 text-purple-600 stroke-2 mr-1" />
                      }
                      onClick={showModal}
                      className={"w-full"}
                    />
                  </div>
                </div>
              ) : (
                <div className="flex justify-around w-full">
                  <LabelAndValue
                    label={
                      <div className="leading-6">
                        Total Amount
                        <br />
                        Available in Budget
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
                </div>
              )}
            </div>
          </div>

          {/* TABLE STARTS HERE */}
          <div className="flex flex-col h-0 flex-grow">
            <div className="flex items-center border-t border-b border-black py-1">
              <div
                className={`w-[50%] font-bold text-sm sm:text-lg pl-3 sm:pl-6`}
              >
                Category
              </div>
              {resetProgress && (
                <div
                  className={`w-[17%] font-bold text-sm sm:text-lg text-center pr-2 leading-5`}
                >
                  Add
                  <br />
                  Remove
                </div>
              )}
              <div
                className={`${
                  resetProgress ? "w-[17%]" : "w-[25%]"
                } font-bold text-sm sm:text-lg text-center pr-2 leading-5`}
              >
                # of
                <br />
                Months
              </div>
              <div
                className={`${
                  resetProgress ? "w-[17%]" : "w-[25%]"
                } font-bold text-sm sm:text-lg text-right pr-2 leading-5`}
              >
                Total
                <br />
                Amount
              </div>
            </div>

            <div className="flex flex-col overflow-y-auto no-scrollbar">
              <HierarchyTable
                tableData={hierarchyTableData}
                getRowContent={getRowContent}
                indentPixels={"20px"}
                isCollapsible={true}
                disableOnClick={hovered !== null}
              />
            </div>
          </div>

          {/* "Posting To budget / Cancel" buttons */}
          {resetProgress && (
            <div className="flex items-end justify-center space-x-4 pt-2 border-t border-black">
              <MyButton
                buttonText={
                  <div className="font-semibold text-base">
                    Post Amounts
                    <br />
                    to Budget
                  </div>
                }
                icon={
                  <CheckIcon className="h-10 w-10 text-green-600 stroke-2 mr-1" />
                }
                onClick={() => {
                  setIsPosting(true);
                  setResetProgress(false);
                }}
                className={"h-full w-[45%]"}
              />
              <MyButton
                buttonText={
                  <div className="font-semibold text-base">Go Back</div>
                }
                icon={
                  <MinusCircleIcon className="h-10 w-10 text-red-600 stroke-2 mr-1" />
                }
                onClick={() => setResetProgress(false)}
                className={"h-full w-[45%] text-base"}
              />
            </div>
          )}
        </>
      ) : (
        <div className="h-full flex flex-col justify-between items-center">
          <div className="text-center font-bold text-3xl">
            Posting to Budget
          </div>

          <div className="flex flex-col w-full space-y-10">
            {/* Progress Bar */}
            <div className="px-2">
              <Label label={"Current Progress"} className="px-2" />
              <div className="bg-gray-300 h-6 rounded-md shadow-md shadow-slate-400">
                <div
                  style={{ width: "24%" }}
                  className="h-6 rounded-md bg-green-600"
                ></div>
              </div>
            </div>

            {/* Posting Info */}
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

          <MyButton
            buttonText={"Go Back"}
            icon={<ArrowLeftIcon className="h-10 w-10 stroke-2 mr-1" />}
            onClick={() => setIsPosting(false)}
            className={"w-[95%]"}
          />
        </div>
      )}
    </Card>
  );
}

export default RegularExpenseDetails;
