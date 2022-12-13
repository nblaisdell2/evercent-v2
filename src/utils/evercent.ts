import { addDays, addMonths, addWeeks, differenceInMonths } from "date-fns";
import { getSQLDate, parseDate } from "./utils";
import { today, getLocalTimeZone } from "@internationalized/date";

export type UserData = {
  userID: string;
  budgetID: string;
  budgetName: string;
  monthlyIncome: number;
  monthsAheadTarget: number;
  payFrequency: string;
  nextPaydate: string;
  tokenDetails: TokenDetails;
};

export type TokenDetails = {
  accessToken: string;
  refreshToken: string;
  expirationDate: string;
};

export type CategoryListGroup = {
  __typename: string;
  groupID: string;
  groupName: string;
  amount: number;
  extraAmount: number;
  adjustedAmt: number;
  adjustedAmtPlusExtra: number;
  percentIncome: number;
  categories: CategoryListItem[];
};

export type CategoryListItem = {
  __typename: string;
  guid: string;
  categoryGroupID: string;
  categoryID: string;
  groupName: string;
  name: string;
  amount: number;
  extraAmount: number;
  adjustedAmt: number;
  adjustedAmtPlusExtra: number;
  percentIncome: number;
  isRegularExpense: boolean;
  isUpcomingExpense: boolean;
  regularExpenseDetails: RegularExpenseDetails;
  upcomingDetails: UpcomingDetails;
  budgetAmounts: BudgetAmounts;
};

export type RegularExpenseDetails = {
  __typename: string;
  guid: string;
  isMonthly: boolean;
  nextDueDate: string;
  monthsDivisor: number;
  repeatFreqNum: number;
  repeatFreqType: string;
  includeOnChart: boolean;
  multipleTransactions: boolean;
};

export type UpcomingDetails = {
  __typename: string;
  guid: string;
  expenseAmount: number;
};

export type BudgetAmounts = {
  __typename: string;
  budgeted: number;
  activity: number;
  available: number;
};

export type YNABBudget = {
  id: string;
  name: string;
};

export type PostingMonth = {
  month: string;
  amount: number;
};

export type BudgetMonth = {
  month: string;
  categories: BudgetMonthCategory[];
};

export type BudgetMonthCategory = {
  categoryGroupID: string;
  categoryGroupName: string;
  categoryID: string;
  name: string;
  budgeted: number;
  activity: number;
  available: number;
};

export const getCategoriesCount = (categoryList: CategoryListGroup[]) => {
  return categoryList.reduce((prev, curr) => {
    return prev + curr.categories.length;
  }, 0);
};

export const getTotalAmountUsed = (categoryList: CategoryListGroup[]) => {
  return categoryList.reduce((prev, curr) => {
    return prev + curr.adjustedAmtPlusExtra;
  }, 0);
};

export const getAdjustedAmtByFrequency = (
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

export const getUpcomingPaydate = (
  purchaseAmt: number,
  adjustedAmt: number,
  payFreq: string,
  nextPaydate: string
) => {
  if (!adjustedAmt || !purchaseAmt) {
    return null;
  }

  // Determine the '# of Paychecks' that will need to be saved for in order
  // to purchase the 'Upcoming Expense'.
  //   1. Determine how much can be saved per paycheck (payFreq)
  const amtPerPaycheck = getAdjustedAmtByFrequency(adjustedAmt, payFreq);

  //   3. TODO: Figure out how much the user already has saved in their budget
  //            for this purchase/category
  //   4. TODO: Subtract that currently saved amount from the total purchase amount
  //            to the the NEW total purchase amount

  //   5. Take the total purchase amount / amount saved per paycheck
  //   6. If we're currently on the user's next paydate (it's payday today),
  //      don't count today's paydate, since the money was likely already used. (-1).
  const nextPaydateIsToday =
    today(getLocalTimeZone()).toDate(getLocalTimeZone()).toISOString() !=
    nextPaydate;
  const numPaychecks =
    Math.ceil(purchaseAmt / amtPerPaycheck) - (nextPaydateIsToday ? 0 : 1);

  //   7. Add the appropriate # of weeks/months to the user's next paydate and return it
  let newPaydate = parseDate(nextPaydate);
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

export const getGroupAmounts = (categories: CategoryListItem[]) => {
  return categories.reduce(
    (prev, curr) => {
      return {
        amount: prev.amount + curr.amount,
        extraAmount: prev.extraAmount + curr.extraAmount,
        adjustedAmt: prev.adjustedAmt + curr.adjustedAmt,
        adjustedAmtPlusExtra:
          prev.adjustedAmtPlusExtra + curr.adjustedAmtPlusExtra,
        percentIncome: prev.percentIncome + curr.percentIncome,
      };
    },
    {
      amount: 0,
      extraAmount: 0,
      adjustedAmt: 0,
      adjustedAmtPlusExtra: 0,
      percentIncome: 0,
    }
  );
};

export const getAdjustedAmountPlusExtra = (category: CategoryListItem) => {
  if (
    category.isRegularExpense &&
    !category.regularExpenseDetails.includeOnChart
  ) {
    return 0;
  }
  return category.adjustedAmt + category.extraAmount;
};

export const getAdjustedAmount = (
  category: CategoryListItem,
  budgetMonths: BudgetMonth[],
  nextPaydate: string
) => {
  let adjustedAmt = category.amount;

  if (category.isRegularExpense) {
    if (!category.regularExpenseDetails.includeOnChart) {
      return 0;
    }

    let dtNextDueDate = parseDate(category.regularExpenseDetails.nextDueDate);
    dtNextDueDate = addDays(dtNextDueDate, -(dtNextDueDate.getDate() - 1));
    let strDueDate = getSQLDate(dtNextDueDate);

    let dtNextPaydate = parseDate(nextPaydate);
    dtNextPaydate = addDays(dtNextPaydate, -(dtNextPaydate.getDate() - 1));
    let strNextPaydate = getSQLDate(dtNextPaydate);

    let dtToday = parseDate(new Date().toISOString());
    dtToday = addDays(dtToday, -(dtToday.getDate() - 1));
    let strToday = getSQLDate(dtToday);

    let bmCat = budgetMonths
      .filter((budMonth) => {
        return budMonth.month == strDueDate;
      })[0]
      .categories.filter((cat) => {
        return (
          cat.categoryGroupID == category.categoryGroupID.toLowerCase() &&
          cat.categoryID == category.categoryID.toLowerCase()
        );
      })[0];
    // console.log("strDueDate    ", strDueDate);
    // console.log("strNextPaydate", strNextPaydate);
    // console.log("strToday      ", strToday);
    // console.log("bmCat", bmCat);

    // Check "budgetMonths" for this category on the month of the nextDueDate
    // to see if the amount needed for the category has already been met
    //   If it has, the number of months should be calculated from the repeatFreqNum/repeatFreqType
    //   If it hasn't, the number of months should be calculated from the user's nextPayDate to the nextDueDate
    let amountNeeded = category.amount - bmCat.available;
    // console.log("amountNeeded", amountNeeded);
    let numMonths = 1;
    if (amountNeeded <= 0) {
      numMonths =
        category.regularExpenseDetails.repeatFreqNum *
        (category.regularExpenseDetails.repeatFreqType == "Months" ? 1 : 12);
      amountNeeded = category.amount;
    } else {
      numMonths = differenceInMonths(dtNextDueDate, dtNextPaydate) + 1;
    }
    // console.log("amountNeeded again", amountNeeded);
    // console.log("numMonths", numMonths);

    let sameMonth = strNextPaydate == strDueDate && strDueDate == strToday; // check if nextDueDate and today are the same month
    if (
      !category.regularExpenseDetails.multipleTransactions &&
      sameMonth &&
      category.budgetAmounts.activity != 0
    ) {
      numMonths -= 1;
    }
    // console.log("numMonths again", numMonths);

    adjustedAmt = amountNeeded / numMonths;

    if (adjustedAmt % 1 > 0) {
      adjustedAmt += 0.01;
    }
  }

  return adjustedAmt;
};

export const getPostingMonthAmounts = (): PostingMonth[] => {
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

export const getInput_UpdateCategories = (
  newCategories: CategoryListGroup[]
) => {
  // Format the categoryList into the format needed for the stored procedure
  // for updating the database.
  let input: { details: any[]; expense: any[]; upcoming: any[] } = {
    details: [],
    expense: [],
    upcoming: [],
  };

  for (let i = 0; i < newCategories.length; i++) {
    for (let j = 0; j < newCategories[i].categories.length; j++) {
      let currCat = newCategories[i].categories[j];
      input.details.push({
        guid: currCat.guid,
        categoryGroupID: currCat.categoryGroupID,
        categoryID: currCat.categoryID,
        amount: currCat.amount,
        extraAmount: currCat.extraAmount,
        isRegularExpense: currCat.isRegularExpense,
        isUpcomingExpense: currCat.isUpcomingExpense,
      });

      if (currCat.isRegularExpense) {
        input.expense.push({
          guid: currCat.guid,
          isMonthly: currCat.regularExpenseDetails.isMonthly,
          nextDueDate: currCat.regularExpenseDetails.nextDueDate,
          expenseMonthsDivisor: currCat.regularExpenseDetails.monthsDivisor,
          repeatFreqNum: currCat.regularExpenseDetails.repeatFreqNum,
          repeatFreqType: currCat.regularExpenseDetails.repeatFreqType,
          includeOnChart: currCat.regularExpenseDetails.includeOnChart,
          multipleTransactions:
            currCat.regularExpenseDetails.multipleTransactions,
        });
      }

      if (currCat.isUpcomingExpense) {
        input.upcoming.push({
          guid: currCat.guid,
          totalExpenseAmount: currCat.upcomingDetails.expenseAmount,
        });
      }
    }
  }

  return input;
};
