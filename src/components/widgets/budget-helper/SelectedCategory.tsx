import React from "react";
import { ArrowLeftIcon } from "@heroicons/react/24/outline";

import { today, getLocalTimeZone, parseDate } from "@internationalized/date";

import Label from "../../elements/Label";
import Card from "../../elements/Card";
import MyDatePicker from "../../elements/MyDatePicker";
import MySelect from "../../elements/MySelect";
import MyToggle from "../../elements/MyToggle";

import {
  calculatePercentage,
  getDateFromCalendarDate,
  getMoneyString,
  parseDate as parseDateUtil,
} from "../../../utils/utils";
import { format, differenceInDays } from "date-fns";
import {
  getPostingMonthAmounts,
  getUpcomingPaydate,
  getAdjustedAmount,
  CategoryListItem,
  getAdjustedAmountPlusExtra,
} from "../../../utils/evercent";
import MyToggleButton from "../../elements/MyToggleButton";

type Props = {
  initialCategory: CategoryListItem;
  monthlyIncome: number;
  payFrequency: string;
  nextPaydate: string;
  budgetMonths: any[];
  updateSelectedCategory: (newCategory: CategoryListItem | null) => void;
};

function SelectedCategory({
  initialCategory,
  monthlyIncome,
  payFrequency,
  nextPaydate,
  budgetMonths,
  updateSelectedCategory,
}: Props) {
  const toggleOptions = (checked: boolean, option: string) => {
    let newCategory = { ...initialCategory };

    newCategory.isRegularExpense =
      option == "Regular Expense" ? checked : false;
    if (
      newCategory.isRegularExpense &&
      !newCategory.regularExpenseDetails.repeatFreqType
    ) {
      // // Set regular expense defaults here
      newCategory.regularExpenseDetails = {
        ...newCategory.regularExpenseDetails,
        isMonthly: true,
        nextDueDate: nextPaydate,
        monthsDivisor: 1,
        repeatFreqNum: 1,
        repeatFreqType: "Months",
        includeOnChart: true,
        multipleTransactions: false,
      };
    }
    newCategory.isUpcomingExpense =
      option == "Upcoming Expense" ? checked : false;

    updateSelectedCategory(newCategory);
  };

  const updateCategory = (newFields: any) => {
    let newCat: any = { ...initialCategory };
    let keys = Object.keys(newFields);
    // console.log(newFields);
    for (let i = 0; i < keys.length; i++) {
      newCat[keys[i]] = newFields[keys[i]];
    }

    if (newCat.regularExpenseDetails.isMonthly) {
      newCat.regularExpenseDetails.repeatFreqNum = 1;
      newCat.regularExpenseDetails.repeatFreqType = "Months";
    }

    newCat.adjustedAmt = getAdjustedAmount(newCat, budgetMonths, nextPaydate);
    newCat.adjustedAmtPlusExtra = getAdjustedAmountPlusExtra(newCat);
    newCat.percentIncome = calculatePercentage(
      newCat.adjustedAmtPlusExtra,
      monthlyIncome
    );

    updateSelectedCategory(newCat);
  };

  const postingMonths = getPostingMonthAmounts();
  const upcomingPaydate = getUpcomingPaydate(
    initialCategory.upcomingDetails.expenseAmount,
    initialCategory.adjustedAmtPlusExtra,
    payFrequency,
    nextPaydate
  );

  return (
    <div className="flex flex-col flex-grow mt-4 overflow-y-auto">
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

      <div className="flex-grow overflow-y-auto no-scrollbar">
        {/* Web Version */}
        <div className="hidden sm:flex h-full m-2">
          {/* left side */}
          <div className="w-[25%] mr-2">
            <Card className="bg-blue-300 h-full flex flex-col space-y-12 items-center p-2">
              <div className="font-bold text-center text-3xl">
                {initialCategory.name}
              </div>
              <div className="flex w-full text-center justify-around">
                <div>
                  <div className="font-semibold">Amount</div>
                  <input
                    type="number"
                    className="border border-black rounded-md outline-none text-center h-8 w-32 appearance-none"
                    value={initialCategory.amount.toString()}
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
                          // adjustedAmt: parseInt(e.target.value) || 0,
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
                    value={initialCategory.extraAmount.toString()}
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
                    <MyToggle
                      checked={initialCategory.isRegularExpense}
                      onToggle={(checked) => {
                        toggleOptions(checked, "Regular Expense");
                      }}
                      className="mr-2"
                    />
                    <div>Regular Expense</div>
                  </label>
                  <label className="flex hover:cursor-pointer">
                    <MyToggle
                      checked={initialCategory.isUpcomingExpense}
                      onToggle={(checked) => {
                        toggleOptions(checked, "Upcoming Expense");
                      }}
                      className="mr-2"
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
                    {getMoneyString(initialCategory.adjustedAmt, 2)}
                  </div>
                </div>
                <div>
                  <Label label={"Adjusted plus Extra"} className="text-xl" />
                  <div className="font-bold text-3xl">
                    {getMoneyString(initialCategory.adjustedAmtPlusExtra, 2)}
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
                          <div key={pm.month} className="flex">
                            <div className="uppercase w-[55%] mr-2 text-right font-semibold">
                              {pm.month}
                            </div>
                            <div className="font-bold text-green-500">
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
            {initialCategory.isRegularExpense && (
              <Card className="h-full space-y-8 p-1">
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
                            initialCategory?.regularExpenseDetails
                              ?.nextDueDate || new Date().toISOString()
                          ).substring(0, 10)
                        )}
                        onChange={(newDate: any) => {
                          updateCategory({
                            regularExpenseDetails: {
                              ...initialCategory.regularExpenseDetails,
                              nextDueDate:
                                getDateFromCalendarDate(newDate).toISOString(),
                            },
                          });
                        }}
                      />
                    </div>
                    <div className="flex flex-col items-center">
                      <div className="font-semibold">Frequency</div>
                      <MyToggleButton
                        leftSideTrue={
                          initialCategory.regularExpenseDetails.isMonthly
                        }
                        leftValue={"Monthly"}
                        rightValue={"By Date"}
                        onToggle={(toggleValue: boolean) => {
                          updateCategory({
                            regularExpenseDetails: {
                              ...initialCategory.regularExpenseDetails,
                              isMonthly: toggleValue,
                            },
                          });
                        }}
                      />
                    </div>
                    <div className="flex flex-col items-center">
                      <div className="font-semibold">Repeat Every?</div>
                      <div className="flex items-center h-10">
                        <div className="flex items-center w-16 h-full mr-1">
                          <MySelect
                            values={[
                              "1",
                              "2",
                              "3",
                              "4",
                              "5",
                              "6",
                              "7",
                              "8",
                              "9",
                              "10",
                              "11",
                              "12",
                            ]}
                            onSelectionChange={(sel) => {
                              updateCategory({
                                regularExpenseDetails: {
                                  ...initialCategory.regularExpenseDetails,
                                  repeatFreqNum: parseInt(sel.toString()),
                                },
                              });
                            }}
                            selectedValue={initialCategory.regularExpenseDetails.repeatFreqNum.toString()}
                            isDisabled={
                              initialCategory.regularExpenseDetails.isMonthly
                            }
                          />
                        </div>
                        <div className="flex items-center h-full ml-1">
                          <MySelect
                            values={["Months", "Years"]}
                            onSelectionChange={(sel) => {
                              updateCategory({
                                regularExpenseDetails: {
                                  ...initialCategory.regularExpenseDetails,
                                  repeatFreqType: sel.toString(),
                                },
                              });
                            }}
                            selectedValue={
                              initialCategory.regularExpenseDetails
                                .repeatFreqType
                            }
                            isDisabled={
                              initialCategory.regularExpenseDetails.isMonthly
                            }
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="flex justify-around">
                    <div className="flex flex-col items-center">
                      <div className="font-semibold">Include on Chart?</div>
                      <MyToggle
                        checked={
                          initialCategory.regularExpenseDetails.includeOnChart
                        }
                        onToggle={(checked) => {
                          updateCategory({
                            regularExpenseDetails: {
                              ...initialCategory.regularExpenseDetails,
                              includeOnChart: checked,
                            },
                          });
                        }}
                      />
                    </div>
                    <div className="flex flex-col items-center">
                      <div className="font-semibold">
                        Multiple Monthly Transactions?
                      </div>
                      <MyToggle
                        checked={
                          initialCategory.regularExpenseDetails
                            .multipleTransactions
                        }
                        onToggle={(checked) => {
                          updateCategory({
                            regularExpenseDetails: {
                              ...initialCategory.regularExpenseDetails,
                              multipleTransactions: checked,
                            },
                          });
                        }}
                      />
                    </div>
                  </div>
                </div>
              </Card>
            )}

            {initialCategory.isUpcomingExpense && (
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
                        initialCategory.upcomingDetails.expenseAmount || 0
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
                              ...initialCategory.upcomingDetails,
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

        {/* Mobile Version */}
        <div className="flex flex-col sm:hidden">
          <div className="text-center w-full font-bold text-3xl mb-2">
            {initialCategory.name}
          </div>

          <Card className="flex flex-col w-full text-center p-2">
            <div className="flex justify-around">
              <div className="mb-2">
                <div className="font-semibold">Amount</div>
                <input
                  type="number"
                  className="border border-black rounded-md outline-none text-center h-8 w-32 appearance-none"
                  value={initialCategory.amount.toString()}
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
                  value={initialCategory.extraAmount.toString()}
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
            <div className="flex justify-around">
              <div>
                <Label label={"Adjusted Amount"} />
                <div className="font-bold text-2xl">
                  {getMoneyString(initialCategory.adjustedAmt, 2)}
                </div>
              </div>
              <div>
                <Label label={"Adjusted plus Extra"} />
                <div className="font-bold text-2xl">
                  {getMoneyString(
                    initialCategory.adjustedAmt + initialCategory.extraAmount,
                    2
                  )}
                </div>
              </div>
            </div>
          </Card>

          <Card className="flex flex-col items-center w-full my-2 pb-2">
            <div className="text-2xl font-bold mb-2">Options</div>
            <div>
              <label className="flex mb-2 hover:cursor-pointer">
                <MyToggle
                  checked={initialCategory.isRegularExpense}
                  onToggle={(checked) => {
                    toggleOptions(checked, "Regular Expense");
                  }}
                  className="mr-2"
                />
                <div>Regular Expense</div>
              </label>
              <label className="flex hover:cursor-pointer">
                <MyToggle
                  checked={initialCategory.isUpcomingExpense}
                  onToggle={(checked) => {
                    toggleOptions(checked, "Upcoming Expense");
                  }}
                  className="mr-2"
                />
                <div>Upcoming Expense</div>
              </label>
            </div>
          </Card>

          {initialCategory.isRegularExpense && (
            <Card className="flex-col flex-grow space-y-6 p-1 mb-2">
              <div className="text-center font-bold text-xl">
                Regular Expense Details
              </div>
              <div className="flex items-center justify-between pl-1">
                <div className="font-semibold mr-2">Next Due Date</div>
                <MyDatePicker
                  minValue={parseDate(
                    (nextPaydate || new Date().toISOString()).substring(0, 10)
                  )}
                  value={parseDate(
                    (
                      initialCategory?.regularExpenseDetails?.nextDueDate ||
                      new Date().toISOString()
                    ).substring(0, 10)
                  )}
                  onChange={(newDate: any) => {
                    updateCategory({
                      regularExpenseDetails: {
                        ...initialCategory.regularExpenseDetails,
                        nextDueDate:
                          getDateFromCalendarDate(newDate).toISOString(),
                      },
                    });
                  }}
                />
              </div>
              <div className="flex items-center justify-between pl-1">
                <div className="font-semibold mr-2">Frequency</div>
                <div className="flex border-2 border-blue-900 rounded-md font-bold">
                  <div
                    className={`p-[3px] w-20 text-center hover:cursor-pointer ${
                      initialCategory.regularExpenseDetails.isMonthly
                        ? "bg-blue-900 hover:bg-blue-900 text-white hover:text-white font-bold hover:font-bold"
                        : "hover:bg-blue-900 hover:opacity-70 hover:text-white hover:font-bold"
                    }`}
                    onClick={() => {
                      updateCategory({
                        regularExpenseDetails: {
                          ...initialCategory.regularExpenseDetails,
                          isMonthly: true,
                        },
                      });
                    }}
                  >
                    Monthly
                  </div>
                  <div
                    className={`p-[3px] w-20 text-center hover:cursor-pointer ${
                      !initialCategory.regularExpenseDetails.isMonthly
                        ? "bg-blue-900 hover:bg-blue-900 text-white hover:text-white font-bold hover:font-bold"
                        : "hover:bg-blue-900 hover:opacity-70 hover:text-white hover:font-bold"
                    }`}
                    onClick={() => {
                      updateCategory({
                        regularExpenseDetails: {
                          ...initialCategory.regularExpenseDetails,
                          isMonthly: false,
                        },
                      });
                    }}
                  >
                    By Date
                  </div>
                </div>
              </div>
              <div className="flex items-center justify-between pl-1">
                <div className="font-semibold mr-2">Repeat Every?</div>
                <div className="flex items-center h-10">
                  <div className="flex items-center w-16 h-full mr-1">
                    <MySelect
                      values={[
                        "1",
                        "2",
                        "3",
                        "4",
                        "5",
                        "6",
                        "7",
                        "8",
                        "9",
                        "10",
                        "11",
                        "12",
                      ]}
                      selectedValue={initialCategory.regularExpenseDetails.repeatFreqNum.toString()}
                      onSelectionChange={(sel) => {
                        updateCategory({
                          regularExpenseDetails: {
                            ...initialCategory.regularExpenseDetails,
                            repeatFreqNum: parseInt(sel.toString()),
                          },
                        });
                      }}
                      isDisabled={
                        initialCategory.regularExpenseDetails.isMonthly
                      }
                    />
                  </div>
                  <div className="flex items-center h-full ml-1">
                    <MySelect
                      values={["Months", "Years"]}
                      selectedValue={
                        initialCategory.regularExpenseDetails.repeatFreqType
                      }
                      onSelectionChange={(sel) => {
                        updateCategory({
                          regularExpenseDetails: {
                            ...initialCategory.regularExpenseDetails,
                            repeatFreqType: sel.toString(),
                          },
                        });
                      }}
                      isDisabled={
                        initialCategory.regularExpenseDetails.isMonthly
                      }
                    />
                  </div>
                </div>
              </div>
              <div className="flex items-center justify-between pl-1">
                <div className="font-semibold mr-2">Include on Chart?</div>
                <MyToggle
                  checked={initialCategory.regularExpenseDetails.includeOnChart}
                  onToggle={(checked) => {
                    updateCategory({
                      regularExpenseDetails: {
                        ...initialCategory.regularExpenseDetails,
                        includeOnChart: checked,
                      },
                    });
                  }}
                />
              </div>
              <div className="flex items-center justify-between pl-1">
                <div className="font-semibold mr-2">
                  Multiple Monthly Transactions?
                </div>
                <MyToggle
                  checked={
                    initialCategory.regularExpenseDetails.multipleTransactions
                  }
                  onToggle={(checked) => {
                    updateCategory({
                      regularExpenseDetails: {
                        ...initialCategory.regularExpenseDetails,
                        multipleTransactions: checked,
                      },
                    });
                  }}
                />
              </div>
            </Card>
          )}

          {initialCategory.isUpcomingExpense && (
            <Card className="flex flex-col space-y-4 flex-grow p-1 text-xl mb-2">
              <div className="text-center font-bold text-xl">
                Upcoming Expense Details
              </div>
              <div className="flex flex-col items-center">
                <div className="font-semibold">Total Purchase Amount</div>
                <input
                  type="number"
                  className="border border-black rounded-md outline-none text-center h-8 w-56 appearance-none"
                  value={(
                    initialCategory.upcomingDetails.expenseAmount || 0
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
                          ...initialCategory.upcomingDetails,
                          expenseAmount: parseInt(e.target.value) || null,
                        },
                      });
                    }
                  }}
                  onFocus={(e) => e.target.select()}
                />
              </div>
              <div className="flex justify-around items-center h-full">
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
