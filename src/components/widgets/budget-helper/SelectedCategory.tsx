import React, { SetStateAction } from "react";
import { ArrowLeftIcon } from "@heroicons/react/24/outline";

import { today, getLocalTimeZone, parseDate } from "@internationalized/date";

import Label from "../../elements/Label";
import Card from "../../elements/Card";
import MyDatePicker from "../../elements/MyDatePicker";
import MySelect from "../../elements/MySelect";
import MyToggle from "../../elements/MyToggle";

import {
  getDateFromCalendarDate,
  getMoneyString,
  parseDate as parseDateUtil,
} from "../../../utils/utils";
import { format, differenceInDays } from "date-fns";
import {
  getPostingMonthAmounts,
  getUpcomingPaydate,
  CategoryListItem,
} from "../../../utils/evercent";
import MyToggleButton from "../../elements/MyToggleButton";
import MyInput from "../../elements/MyInput";

function SelectedCategory({
  initialCategory,
  payFrequency,
  nextPaydate,
  setSelectedCategory,
  updateSelectedCategoryAmount,
  toggleSelectedCategoryOptions,
  updateSelectedCategoryExpense,
  updateSelectedCategoryUpcomingAmount,
}: {
  initialCategory: CategoryListItem;
  payFrequency: string;
  nextPaydate: string;
  setSelectedCategory: (
    action: SetStateAction<CategoryListItem | null>
  ) => void;
  updateSelectedCategoryAmount: (
    category: CategoryListItem,
    key: "amount" | "extraAmount",
    newAmount: number
  ) => void;
  toggleSelectedCategoryOptions: (
    category: CategoryListItem,
    checked: boolean,
    option: string
  ) => void;
  updateSelectedCategoryExpense: (
    category: CategoryListItem,
    key:
      | "nextDueDate"
      | "isMonthly"
      | "repeatFreqNum"
      | "repeatFreqType"
      | "includeOnChart"
      | "multipleTransactions",
    value: any
  ) => void;
  updateSelectedCategoryUpcomingAmount: (
    category: CategoryListItem,
    newAmount: number
  ) => void;
}) {
  const postingMonths = getPostingMonthAmounts();
  const upcomingPaydate = getUpcomingPaydate(
    initialCategory.upcomingDetails.expenseAmount,
    initialCategory.adjustedAmtPlusExtra,
    payFrequency,
    nextPaydate
  );

  return (
    <div className="flex flex-col flex-grow mt-4 overflow-y-auto sm:overflow-y-visible">
      <div className="inline-flex items-center">
        <div
          onClick={() => {
            setSelectedCategory(null);
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

      <div className="flex-grow overflow-y-auto sm:overflow-y-visible sm:no-scrollbar">
        {/* Web Version */}
        <div className="hidden sm:flex h-full m-2">
          {/* left side */}
          <div className="w-[25%] mr-2">
            <Card className="h-full flex flex-col space-y-12 items-center p-2">
              <div className="font-bold text-center text-3xl">
                {initialCategory.name}
              </div>
              <div className="flex w-full text-center justify-around">
                <div>
                  <div className="font-semibold">Amount</div>
                  <MyInput
                    value={initialCategory.amount}
                    onChange={(newVal: number) => {
                      updateSelectedCategoryAmount(
                        initialCategory,
                        "amount",
                        newVal
                      );
                    }}
                    className={"h-8 w-32"}
                  />
                </div>
                <div>
                  <div className="font-semibold">Extra Amount</div>
                  <MyInput
                    value={initialCategory.extraAmount}
                    onChange={(newVal: number) => {
                      updateSelectedCategoryAmount(
                        initialCategory,
                        "extraAmount",
                        newVal
                      );
                    }}
                    className={"h-8 w-32"}
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
                        toggleSelectedCategoryOptions(
                          initialCategory,
                          checked,
                          "Regular Expense"
                        );
                      }}
                      className="mr-2"
                    />
                    <div>Regular Expense</div>
                  </label>
                  <label className="flex hover:cursor-pointer">
                    <MyToggle
                      checked={initialCategory.isUpcomingExpense}
                      onToggle={(checked) => {
                        toggleSelectedCategoryOptions(
                          initialCategory,
                          checked,
                          "Upcoming Expense"
                        );
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
                          updateSelectedCategoryExpense(
                            initialCategory,
                            "nextDueDate",
                            getDateFromCalendarDate(newDate).toISOString()
                          );
                        }}
                        classNamePosition={"bottom-0"}
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
                          updateSelectedCategoryExpense(
                            initialCategory,
                            "isMonthly",
                            toggleValue
                          );
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
                              updateSelectedCategoryExpense(
                                initialCategory,
                                "repeatFreqNum",
                                parseInt(sel.toString())
                              );
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
                              updateSelectedCategoryExpense(
                                initialCategory,
                                "repeatFreqType",
                                sel.toString()
                              );
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
                          updateSelectedCategoryExpense(
                            initialCategory,
                            "includeOnChart",
                            checked
                          );
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
                          updateSelectedCategoryExpense(
                            initialCategory,
                            "multipleTransactions",
                            checked
                          );
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
                    <MyInput
                      value={initialCategory.upcomingDetails.expenseAmount || 0}
                      onChange={(newVal: number) => {
                        updateSelectedCategoryUpcomingAmount(
                          initialCategory,
                          newVal
                        );
                      }}
                      className={"h-8 w-56"}
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
                <MyInput
                  value={initialCategory.amount}
                  onChange={(newVal: number) => {
                    updateSelectedCategoryAmount(
                      initialCategory,
                      "amount",
                      newVal
                    );
                  }}
                  className={"h-8 w-32"}
                />
              </div>
              <div>
                <div className="font-semibold">Extra Amount</div>
                <MyInput
                  value={initialCategory.extraAmount}
                  onChange={(newVal: number) => {
                    updateSelectedCategoryAmount(
                      initialCategory,
                      "extraAmount",
                      newVal
                    );
                  }}
                  className={"h-8 w-32"}
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
                    toggleSelectedCategoryOptions(
                      initialCategory,
                      checked,
                      "Regular Expense"
                    );
                  }}
                  className="mr-2"
                />
                <div>Regular Expense</div>
              </label>
              <label className="flex hover:cursor-pointer">
                <MyToggle
                  checked={initialCategory.isUpcomingExpense}
                  onToggle={(checked) => {
                    toggleSelectedCategoryOptions(
                      initialCategory,
                      checked,
                      "Upcoming Expense"
                    );
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
                    updateSelectedCategoryExpense(
                      initialCategory,
                      "nextDueDate",
                      getDateFromCalendarDate(newDate).toISOString()
                    );
                  }}
                  classNamePosition={"bottom-0 left-5"}
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
                      updateSelectedCategoryExpense(
                        initialCategory,
                        "isMonthly",
                        true
                      );
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
                      updateSelectedCategoryExpense(
                        initialCategory,
                        "isMonthly",
                        false
                      );
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
                        updateSelectedCategoryExpense(
                          initialCategory,
                          "repeatFreqNum",
                          parseInt(sel.toString())
                        );
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
                        updateSelectedCategoryExpense(
                          initialCategory,
                          "repeatFreqType",
                          sel.toString()
                        );
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
                    updateSelectedCategoryExpense(
                      initialCategory,
                      "includeOnChart",
                      checked
                    );
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
                    updateSelectedCategoryExpense(
                      initialCategory,
                      "multipleTransactions",
                      checked
                    );
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
                <MyInput
                  value={initialCategory.upcomingDetails.expenseAmount || 0}
                  onChange={(newVal: number) => {
                    updateSelectedCategoryUpcomingAmount(
                      initialCategory,
                      newVal
                    );
                  }}
                  className={"h-8 w-56"}
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
