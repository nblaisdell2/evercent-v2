import { ArrowLeftIcon } from "@heroicons/react/24/outline";
import React from "react";
import { PostingMonth } from "../../../utils/evercent";
import { getMoneyString } from "../../../utils/utils";
import Card from "../../elements/Card";
import { CheckboxItem } from "../../elements/HierarchyTable";
import Label from "../../elements/Label";
import LabelAndValue from "../../elements/LabelAndValue";
import PostingMonthBreakdown from "./PostingMonthBreakdown";

function AutomationOverview({
  selectedItem,
  setSelectedItem,
  months,
}: {
  selectedItem: CheckboxItem | null;
  setSelectedItem: (newItem: CheckboxItem | null) => void;
  months: PostingMonth[];
}) {
  const pastRunsAmountsPosted: any = [
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

  return (
    <>
      {/* Web Version */}
      <div className="hidden sm:flex flex-col h-full space-y-2">
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
                    <PostingMonthBreakdown months={months} showPercent={true} />
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
                  {pastRunsAmountsPosted.map((amt: any) => {
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
        </Card>
      </div>

      {/* Mobile Version */}
      <div className="sm:hidden flex flex-col h-full">
        <div
          className="flex items-center hover:cursor-pointer"
          onClick={() => {
            setSelectedItem(null);
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
            {pastRunsAmountsPosted.map((amt: any) => {
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
    </>
  );
}

export default AutomationOverview;
