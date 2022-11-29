import React, { useState } from "react";
import { ArrowLeftIcon } from "@heroicons/react/24/outline";

import { today, getLocalTimeZone, parseDate } from "@internationalized/date";

import { CategoryListItem } from "./BudgetHelperFull";
import Label from "./elements/Label";
import Card from "./elements/Card";

import Switch from "react-switch";
import {
  calculatePercentage,
  getAdjustedAmount,
  getDateFromCalendarDate,
  getMoneyString,
  parseDate as parseDateUtil,
} from "../utils/utils";
import MyDatePicker from "./elements/MyDatePicker";
import { Select } from "./elements/select/Select";
import { Item } from "react-stately";
import { addMonths, addWeeks, format, differenceInDays } from "date-fns";

type Props = {
  initialCategory: CategoryListItem;
  monthlyIncome: number;
  payFrequency: string;
  nextPaydate: string;
  budgetMonths: any[];
  updateSelectedCategory: (item: CategoryListItem | null) => void;
};

type PostingMonth = {
  month: string;
  amount: number;
};

function SelectedCategory({
  initialCategory,
  monthlyIncome,
  payFrequency,
  nextPaydate,
  budgetMonths,
  updateSelectedCategory,
}: Props) {
  const [category, setCategory] = useState(initialCategory);

  const toggleOptions = (checked: boolean, option: string) => {
    let newCategory = { ...category };

    newCategory.isRegularExpense =
      option == "Regular Expense" ? checked : false;
    if (
      newCategory.isRegularExpense &&
      !newCategory.regularExpenseDetails.repeatFreqType
    ) {
      // Set regular expense defaults here
      newCategory.regularExpenseDetails.isMonthly = true;
      newCategory.regularExpenseDetails.nextDueDate = nextPaydate;
      newCategory.regularExpenseDetails.monthsDivisor = 1;
      newCategory.regularExpenseDetails.repeatFreqNum = 1;
      newCategory.regularExpenseDetails.repeatFreqType = "Months";
      newCategory.regularExpenseDetails.includeOnChart = true;
      newCategory.regularExpenseDetails.multipleTransactions = false;
    }
    newCategory.isUpcomingExpense =
      option == "Upcoming Expense" ? checked : false;

    setCategory(newCategory);
    updateSelectedCategory(newCategory);
  };

  const getPostingMonthAmounts = (): PostingMonth[] => {
    // TODO: This needs to calculate the real month/amounts
    return [
      { month: "Jan 2022", amount: 10 },
      { month: "Feb 2022", amount: 10 },
      { month: "Mar 2022", amount: 10 },
      { month: "Apr 2022", amount: 10 },
      { month: "May 2022", amount: 10 },
      { month: "Jun 2022", amount: 10 },
      { month: "Jul 2022", amount: 10 },
      { month: "Aug 2022", amount: 10 },
      { month: "Sep 2022", amount: 10 },
      { month: "Oct 2022", amount: 10 },
      { month: "Nov 2022", amount: 10 },
    ];
  };

  const updateCategory = (newFields: any) => {
    setCategory((prev) => {
      let newCat: any = { ...prev };
      let keys = Object.keys(newFields);
      for (let i = 0; i < keys.length; i++) {
        newCat[keys[i]] = newFields[keys[i]];
      }

      if (newCat.regularExpenseDetails.isMonthly) {
        newCat.regularExpenseDetails.repeatFreqNum = 1;
        newCat.regularExpenseDetails.repeatFreqType = "Months";
      }

      newCat.adjustedAmt = getAdjustedAmount(newCat, budgetMonths, nextPaydate);
      newCat.adjustedAmtPlusExtra = newCat.adjustedAmt + newCat.extraAmount;
      newCat.percentIncome = calculatePercentage(
        newCat.adjustedAmtPlusExtra,
        monthlyIncome
      );

      // console.log(
      //   "percent?",
      //   calculatePercentage(newCat.adjustedAmtPlusExtra, monthlyIncome) * 100
      // );

      updateSelectedCategory(newCat);
      return newCat as CategoryListItem;
    });
  };

  const getAdjustedAmtByFrequency = (
    adjustedAmt: number,
    payFrequency: string
  ) => {
    switch (payFrequency) {
      case "Weekly":
        return adjustedAmt / 4;
      case "Every 2 Weeks":
        return adjustedAmt / 2;
      case "Monthly":
      default:
        return adjustedAmt;
    }
  };

  const getUpcomingPaydate = (
    purchaseAmt: number,
    adjustedAmt: number,
    payFreq: string,
    nextPaydate: string
  ) => {
    if (!adjustedAmt || !purchaseAmt) {
      return null;
    }

    const amtPerPaycheck = getAdjustedAmtByFrequency(adjustedAmt, payFreq);
    const numPaychecks = Math.ceil(purchaseAmt / amtPerPaycheck);

    let newPaydate = parseDateUtil(nextPaydate);
    switch (payFreq) {
      case "Weekly":
        newPaydate = addWeeks(newPaydate, numPaychecks);
        break;
      case "Every 2 Weeks":
        newPaydate = addWeeks(newPaydate, numPaychecks * 2);
        break;
      case "Monthly":
        newPaydate = addMonths(newPaydate, numPaychecks);
    }

    return newPaydate.toISOString();
  };

  const postingMonths = getPostingMonthAmounts();

  const upcomingPaydate = getUpcomingPaydate(
    category.upcomingDetails.expenseAmount,
    category.adjustedAmtPlusExtra,
    payFrequency,
    nextPaydate
  );

  return (
    <div className="flex flex-col flex-grow mt-4">
      <div className="inline-flex items-center">
        <div
          onClick={() => {
            updateSelectedCategory(null);
          }}
          className="inline-flex border-b border-transparent hover:border-black hover:cursor-pointer"
        >
          <ArrowLeftIcon className="h-6 w-6 mr-1" />
          <Label
            label="Back to Category List"
            className="text-xl no-underline"
          />
        </div>
      </div>

      <div className="flex flex-grow m-2">
        {/* left side */}
        <div className="w-[25%] mr-2">
          <Card className="bg-blue-300 h-full flex flex-col space-y-16 items-center p-2">
            <div className="font-bold text-3xl">{category.name}</div>
            <div className="flex w-full text-center justify-around">
              <div>
                <div className="font-semibold">Amount</div>
                <input
                  type="number"
                  className="border border-black rounded-md outline-none text-center h-8 w-32 appearance-none"
                  value={category.amount.toString()}
                  onChange={(e: any) => {
                    let { data, inputType } = e.nativeEvent;
                    if (
                      (data >= "0" && data <= "9") ||
                      [
                        "deleteContentForward",
                        "deleteContentBackward",
                      ].includes(inputType)
                    ) {
                      updateCategory({
                        amount: parseInt(e.target.value) || 0,
                        adjustedAmt: parseInt(e.target.value) || 0,
                      });
                    }
                  }}
                  onFocus={(e) => e.target.select()}
                />
              </div>
              <div>
                <div className="font-semibold">Extra Amount</div>
                <input
                  type="number"
                  className="border border-black rounded-md outline-none text-center h-8 w-32 appearance-none"
                  value={category.extraAmount.toString()}
                  onChange={(e: any) => {
                    let { data, inputType } = e.nativeEvent;
                    if (
                      (data >= "0" && data <= "9") ||
                      [
                        "deleteContentForward",
                        "deleteContentBackward",
                      ].includes(inputType)
                    ) {
                      updateCategory({
                        extraAmount: parseInt(e.target.value) || 0,
                      });
                    }
                  }}
                  onFocus={(e) => e.target.select()}
                />
              </div>
            </div>
            <div className="flex flex-col items-center w-full">
              <div className="text-2xl font-bold mb-2">Options</div>
              <div>
                <label className="flex mb-2 hover:cursor-pointer">
                  <Switch
                    checked={category.isRegularExpense}
                    onChange={(checked) => {
                      toggleOptions(checked, "Regular Expense");
                    }}
                    className="mr-2"
                    uncheckedIcon={<div></div>}
                    checkedIcon={<div></div>}
                    onColor={"#1E3A8A"}
                  />
                  <div>Regular Expense</div>
                </label>
                <label className="flex hover:cursor-pointer">
                  <Switch
                    checked={category.isUpcomingExpense}
                    onChange={(checked) => {
                      toggleOptions(checked, "Upcoming Expense");
                    }}
                    className="mr-2"
                    uncheckedIcon={<div></div>}
                    checkedIcon={<div></div>}
                    onColor={"#1E3A8A"}
                  />
                  <div>Upcoming Expense</div>
                </label>
              </div>
            </div>
          </Card>
        </div>

        {/* right side */}
        <div className="flex flex-col flex-grow justify-center">
          {/* top section */}
          <div className="flex justify-around p-2">
            {/* Amounts Section */}
            <div className="text-center">
              <div className="mb-2">
                <Label label={"Adjusted Amount"} className="text-xl" />
                <div className="font-bold text-3xl">
                  {getMoneyString(category.adjustedAmt, 2)}
                </div>
              </div>
              <div>
                <Label label={"Adjusted plus Extra"} className="text-xl" />
                <div className="font-bold text-3xl">
                  {getMoneyString(
                    category.adjustedAmt + category.extraAmount,
                    2
                  )}
                </div>
              </div>
            </div>

            {/* Posting Months Section */}
            <Card>
              <Label
                label={"Posting Months on Next Paydate"}
                className="text-xl text-center"
              />
              <div className="w-96 h-24 text-xl overflow-y-auto">
                {postingMonths.length == 0 ? (
                  <div className="flex justify-center items-center font-bold text-2xl h-full">
                    N/A
                  </div>
                ) : (
                  <>
                    {postingMonths.map((pm) => {
                      return (
                        <div
                          key={pm.month}
                          className="flex items-center justify-around"
                        >
                          <div className="uppercase w-[55%] mr-2 text-right font-semibold">
                            {pm.month}
                          </div>
                          <div className="font-bold flex-grow text-green-500">
                            {getMoneyString(pm.amount)}
                          </div>
                        </div>
                      );
                    })}
                  </>
                )}
              </div>
            </Card>
          </div>

          {/* bottom section */}
          {category.isRegularExpense && (
            <Card className="flex-grow space-y-8 p-1">
              <div className="text-center font-bold text-xl">
                Regular Expense Details
              </div>
              <div className="flex flex-col space-y-10">
                <div className="flex justify-around">
                  <div className="flex flex-col items-center">
                    <div className="font-semibold">Next Due Date</div>
                    <MyDatePicker
                      minValue={parseDate(
                        (nextPaydate || new Date().toISOString()).substring(
                          0,
                          10
                        )
                      )}
                      value={parseDate(
                        (
                          category?.regularExpenseDetails?.nextDueDate ||
                          new Date().toISOString()
                        ).substring(0, 10)
                      )}
                      onChange={(newDate: any) => {
                        updateCategory({
                          regularExpenseDetails: {
                            ...category.regularExpenseDetails,
                            nextDueDate:
                              getDateFromCalendarDate(newDate).toISOString(),
                          },
                        });
                      }}
                    />
                  </div>
                  <div className="flex flex-col items-center">
                    <div className="font-semibold">Frequency</div>
                    <div className="flex border-2 border-blue-900 rounded-md font-bold">
                      <div
                        className={`p-[3px] w-20 text-center hover:cursor-pointer ${
                          category.regularExpenseDetails.isMonthly
                            ? "bg-blue-900 hover:bg-blue-900 text-white hover:text-white font-bold hover:font-bold"
                            : "hover:bg-blue-900 hover:opacity-70 hover:text-white hover:font-bold"
                        }`}
                        onClick={() => {
                          updateCategory({
                            regularExpenseDetails: {
                              ...category.regularExpenseDetails,
                              isMonthly: true,
                            },
                          });
                        }}
                      >
                        Monthly
                      </div>
                      <div
                        className={`p-[3px] w-20 text-center hover:cursor-pointer ${
                          !category.regularExpenseDetails.isMonthly
                            ? "bg-blue-900 hover:bg-blue-900 text-white hover:text-white font-bold hover:font-bold"
                            : "hover:bg-blue-900 hover:opacity-70 hover:text-white hover:font-bold"
                        }`}
                        onClick={() => {
                          updateCategory({
                            regularExpenseDetails: {
                              ...category.regularExpenseDetails,
                              isMonthly: false,
                            },
                          });
                        }}
                      >
                        By Date
                      </div>
                    </div>
                  </div>
                  <div className="flex flex-col items-center">
                    <div className="font-semibold">Repeat Every?</div>
                    <div className="flex items-center h-10">
                      <div className="flex items-center w-16 h-full mr-1">
                        <Select
                          label=""
                          selectedKey={category.regularExpenseDetails.repeatFreqNum.toString()}
                          onSelectionChange={(sel) => {
                            updateCategory({
                              regularExpenseDetails: {
                                ...category.regularExpenseDetails,
                                repeatFreqNum: parseInt(sel.toString()),
                              },
                            });
                          }}
                        >
                          <Item key="1">1</Item>
                          <Item key="2">2</Item>
                          <Item key="3">3</Item>
                          <Item key="4">4</Item>
                          <Item key="5">5</Item>
                          <Item key="6">6</Item>
                          <Item key="7">7</Item>
                          <Item key="8">8</Item>
                          <Item key="9">9</Item>
                          <Item key="10">10</Item>
                          <Item key="11">11</Item>
                          <Item key="12">12</Item>
                        </Select>
                      </div>
                      <div className="flex items-center h-full ml-1">
                        <Select
                          label=""
                          selectedKey={
                            category.regularExpenseDetails.repeatFreqType
                          }
                          onSelectionChange={(sel) => {
                            updateCategory({
                              regularExpenseDetails: {
                                ...category.regularExpenseDetails,
                                repeatFreqType: sel.toString(),
                              },
                            });
                          }}
                        >
                          <Item key="Months">Months</Item>
                          <Item key="Years">Years</Item>
                        </Select>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="flex justify-around">
                  <div className="flex flex-col items-center">
                    <div className="font-semibold">Include on Chart?</div>
                    <Switch
                      checked={category.regularExpenseDetails.includeOnChart}
                      onChange={(checked) => {
                        updateCategory({
                          regularExpenseDetails: {
                            ...category.regularExpenseDetails,
                            includeOnChart: checked,
                          },
                        });
                      }}
                      uncheckedIcon={<div></div>}
                      checkedIcon={<div></div>}
                      onColor={"#1E3A8A"}
                    />
                  </div>
                  {/* <div>
                    <div>Always Use Current Month?</div>
                    <Switch
                      checked={category.useCurrentMonth}
                      onChange={(checked) => {}}
                      uncheckedIcon={<div></div>}
                      checkedIcon={<div></div>}
                      onColor={"#1E3A8A"}
                    /></div> */}
                  <div className="flex flex-col items-center">
                    <div className="font-semibold">
                      Multiple Monthly Transactions?
                    </div>
                    <Switch
                      checked={
                        category.regularExpenseDetails.multipleTransactions
                      }
                      onChange={(checked) => {
                        updateCategory({
                          regularExpenseDetails: {
                            ...category.regularExpenseDetails,
                            multipleTransactions: checked,
                          },
                        });
                      }}
                      uncheckedIcon={<div></div>}
                      checkedIcon={<div></div>}
                      onColor={"#1E3A8A"}
                    />
                  </div>
                </div>
              </div>
            </Card>
          )}

          {category.isUpcomingExpense && (
            <Card className="flex flex-col flex-grow p-1 text-xl">
              <div className="text-center font-bold text-xl">
                Upcoming Expense Details
              </div>
              <div className="flex justify-around items-center h-full">
                <div className="flex flex-col items-center">
                  <div className="font-semibold">Total Purchase Amount</div>
                  <input
                    type="number"
                    className="border border-black rounded-md outline-none text-center h-8 w-56 appearance-none"
                    value={(
                      category.upcomingDetails.expenseAmount || 0
                    ).toString()}
                    onChange={(e: any) => {
                      let { data, inputType } = e.nativeEvent;
                      if (
                        (data >= "0" && data <= "9") ||
                        [
                          "deleteContentForward",
                          "deleteContentBackward",
                        ].includes(inputType)
                      ) {
                        updateCategory({
                          upcomingDetails: {
                            ...category.upcomingDetails,
                            expenseAmount: parseInt(e.target.value) || null,
                          },
                        });
                      }
                    }}
                    onFocus={(e) => e.target.select()}
                  />
                </div>
                <div className="flex flex-col items-center">
                  <Label label={"Purchase Date"} className="font-semibold" />
                  <div className="font-bold text-2xl">
                    {!upcomingPaydate
                      ? "----"
                      : format(parseDateUtil(upcomingPaydate), "MMM d, yyyy")}
                  </div>
                </div>
                <div className="flex flex-col items-center">
                  <Label label={"Days Away"} className="font-semibold" />
                  <div className="font-bold text-2xl">
                    {!upcomingPaydate
                      ? "----"
                      : differenceInDays(
                          parseDateUtil(upcomingPaydate),
                          today(getLocalTimeZone()).toDate(getLocalTimeZone())
                        )}
                  </div>
                </div>
              </div>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}

export default SelectedCategory;
