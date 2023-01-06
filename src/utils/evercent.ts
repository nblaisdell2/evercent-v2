import { addDays, addMonths, addWeeks, differenceInMonths } from "date-fns";
import {
  calculatePercentage,
  generateUUID,
  getAPIData,
  getSQLDate,
  parseDate,
  saveNewYNABTokens,
} from "./utils";
import { today, getLocalTimeZone } from "@internationalized/date";

import Queries from "../pages/api/resolvers/resolverMapping.json";
import {
  GetBudget,
  GetBudgetMonths,
  GetBudgetName,
  GetBudgets,
  GetCategoryGroups,
  GetDefaultBudgetID,
  GetNewAccessToken,
  GetNewAccessTokenRefresh,
} from "./ynab";

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

export type ExcludedCategory = {
  CategoryGroupID: string;
  CategoryID: string;
  CategoryGUID: string;
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

export type YNABBugdetMonth = {
  month: string;
  categories: YNABBudgetMonthCategory[];
};

export type YNABBudgetMonthCategory = {
  categoryGroupID: string;
  categoryGroupName: string;
  categoryID: string;
  name: string;
  budgeted: number;
  activity: number;
  available: number;
};

export type YNABCategoryGroup = {
  categoryGroupID: string;
  categoryID: string;
  categoryGroupName: string;
  categoryName: string;
  budgeted: number;
  activity: number;
  available: number;
  included: boolean;
};

export type PostingMonth = {
  month: string;
  amount: number;
  percentAmount: number;
};

export const createCategory = (
  catDB: any,
  catGroup: YNABCategoryGroup,
  budgetMonths: YNABBugdetMonth[],
  nextPaydate: string,
  monthlyIncome: number
) => {
  let currCat: CategoryListItem = {
    __typename: "Category",
    guid: catDB.CategoryGUID,
    categoryGroupID: catGroup.categoryGroupID,
    categoryID: catGroup.categoryID,
    groupName: catGroup.categoryGroupName,
    name: catGroup.categoryName,
    amount: catDB.CategoryAmount,
    extraAmount: catDB.ExtraAmount,

    // These will be set on the next line, but are required
    adjustedAmt: -1,
    adjustedAmtPlusExtra: -1,
    percentIncome: -1,

    isRegularExpense: catDB.IsRegularExpense,
    isUpcomingExpense: catDB.IsUpcomingExpense,
    regularExpenseDetails: {
      __typename: "RegularExpenseDetails",
      guid: catDB.CategoryGUID,
      isMonthly: catDB.IsMonthly,
      nextDueDate: catDB.NextDueDate,
      monthsDivisor: catDB.ExpenseMonthsDivisor,
      repeatFreqNum: catDB.RepeatFreqNum,
      repeatFreqType: catDB.RepeatFreqType,
      includeOnChart: catDB.IncludeOnChart,
      multipleTransactions: catDB.MultipleTransactions,
    },
    upcomingDetails: {
      __typename: "UpcomingDetails",
      guid: catDB.CategoryGUID,
      expenseAmount: catDB.TotalExpenseAmount,
    },
    budgetAmounts: {
      __typename: "BudgetAmounts",
      budgeted: catGroup.budgeted,
      activity: catGroup.activity,
      available: catGroup.available,
    },
  };
  currCat.adjustedAmt = getAdjustedAmount(currCat, budgetMonths, nextPaydate);
  currCat.adjustedAmtPlusExtra = getAdjustedAmountPlusExtra(currCat);
  currCat.percentIncome = calculatePercentage(
    currCat.adjustedAmtPlusExtra,
    monthlyIncome
  );

  return currCat;
};

export const createRegularExpense = (
  nextPaydate: string
): RegularExpenseDetails => {
  return {
    __typename: "RegularExpenseDetails",
    guid: generateUUID().toUpperCase(),
    isMonthly: true,
    nextDueDate: nextPaydate,
    monthsDivisor: 1,
    repeatFreqNum: 1,
    repeatFreqType: "Months",
    includeOnChart: true,
    multipleTransactions: false,
  };
};

// ==============
//  Budget Stuff
// ==============
export const getAllBudgetCategories = async (
  userData: UserData,
  excludedCategories: ExcludedCategory[]
) => {
  const ynabData = await GetCategoryGroups({
    userID: userData.userID,
    budgetID: userData.budgetID,
    ...userData.tokenDetails,
  });
  let catGroups: YNABCategoryGroup[] = ynabData.data;
  saveNewYNABTokens(userData.userID, ynabData.connDetails);

  return catGroups.map((val) => {
    return {
      ...val,
      included: !excludedCategories.some((d) => isSameCategory(d, val)),
    };
  });
};

export const getUserData = async (
  userEmail: string,
  authCode: string
): Promise<UserData> => {
  const strRightNow = new Date().toISOString();

  if (!userEmail) {
    return {
      userID: "",
      budgetID: "",
      budgetName: "",
      monthlyIncome: 0,
      monthsAheadTarget: 6,
      payFrequency: "Weekly",
      nextPaydate: strRightNow,
      tokenDetails: {
        accessToken: "",
        refreshToken: "",
        expirationDate: strRightNow,
      },
    };
  }

  // 1. Get the UserID/BudgetID for the given email
  const queryDataID = await getAPIData(
    Queries.QUERY_USER_ID,
    { userEmail },
    false
  );
  const { UserID, DefaultBudgetID } = queryDataID[0][0];

  let newDefaultBudgetID = DefaultBudgetID;
  let tokenDetails: TokenDetails = {
    accessToken: "",
    refreshToken: "",
    expirationDate: "",
  };

  // 2. If we're connecting to YNAB for the first time, we'll...
  if (authCode) {
    // Get a new set of accessToken/refreshTokens for this user
    // connecting to YNAB for the first time
    tokenDetails = await GetNewAccessToken({
      authCode,
    });
    saveNewYNABTokens(UserID, tokenDetails);

    // Then, get the user's default BudgetID for the
    // budget they selected.
    const budgetID = await GetDefaultBudgetID({
      accessToken: tokenDetails.accessToken,
      refreshToken: tokenDetails.refreshToken,
    });
    newDefaultBudgetID = budgetID.data;

    // Then, get the user's budget categories, and save them to the
    // database, as well. That way, when the page re-loads, we can pull
    // them in.
    const budgetData = await GetBudget({
      accessToken: tokenDetails.accessToken,
      refreshToken: tokenDetails.refreshToken,
      budgetID: newDefaultBudgetID,
    });

    // Format the data properly so that it can be accepted by the stored procedure
    let budgetDetails = budgetData.data.map((bd: any) => {
      return {
        guid: generateUUID(),
        categoryGroupID: bd.categoryGroupID,
        categoryID: bd.categoryID,
        amount: 0,
        extraAmount: 0,
        isRegularExpense: false,
        isUpcomingExpense: false,
      };
    });
    budgetDetails = {
      details: budgetDetails,
    };

    await getAPIData(
      Queries.MUTATION_UPDATE_INITIAL_YNAB_DATA,
      {
        userID: UserID,
        budgetID: newDefaultBudgetID,
        updateCategoriesInput: budgetDetails,
      },
      true
    );
  }

  // 3. Query the user's details using those IDs above
  //      - User Data (monthly income, pay freq, etc)
  //      - Categories
  // TODO: Does this return categories, as well? If so, it doesn't need to
  //       since we're now gathering all the category details in the same resolver
  const queryDataUser = await getAPIData(
    Queries.QUERY_USER,
    { userID: UserID, budgetID: newDefaultBudgetID },
    false
  );
  const userDetailsData = queryDataUser[0][0];

  if (!tokenDetails.accessToken) {
    tokenDetails = {
      accessToken: userDetailsData.AccessToken || "",
      refreshToken: userDetailsData.RefreshToken || "",
      expirationDate: userDetailsData.ExpirationDate || strRightNow,
    };
  }

  // 4. Get the budget name from YNAB, so we can
  //    already have it by the time the page loads
  let budgetName = "";
  if (newDefaultBudgetID) {
    const budgetNameData = await GetBudgetName(
      {
        budgetID: newDefaultBudgetID,
        ...tokenDetails,
      },
      true
    );

    saveNewYNABTokens(UserID, budgetNameData.connDetails);

    if (budgetNameData.connDetails?.accessToken) {
      tokenDetails = { ...budgetNameData.connDetails };
    }

    budgetName = budgetNameData.data;
  }

  // 5. Lastly, format the "userData" appropriately and return it
  //    to the client
  const userData = {
    userID: userDetailsData.UserID,
    budgetID: userDetailsData.DefaultBudgetID,
    budgetName: budgetName,
    monthlyIncome: userDetailsData.MonthlyIncome || 0,
    monthsAheadTarget: userDetailsData.MonthsAheadTarget || 6,
    payFrequency: userDetailsData.PayFrequency || "Weekly",
    nextPaydate: userDetailsData.NextPaydate || strRightNow,
    tokenDetails: tokenDetails,
  };

  return userData;
};

export const getAllCategoryData = async (userData: UserData) => {
  if (!userData.userID || !userData.tokenDetails.accessToken) {
    return {
      budgetNames: null,
      budgetMonths: null,
      categories: null,
      editableCategoryList: null,
    };
  }

  // First, get the data that's been saved to the database for this user
  //   1. List of category details (used on the Budget Helper widget)
  //   2. List of "excluded categories" to not display (editable on the "AllCategoriesEditable.tsx" component)
  // console.log("  GETTING CategoryDataDB");
  const { categoryData, excludedCategories } = await getCategoryDataDB(
    userData.userID,
    userData.budgetID
  );

  // Gather all the required information from the budget (YNAB)
  //   1. Category Groups - A list of all the categories in the user's budget currently
  //   2. Budget Months - The list of months w/ each of their categories and budgeted amounts
  //   3. Budget Name list - Used for switching between budgets within Evercent
  // console.log("  GETTING getAllBudgetCategories");
  const catGroups = await getAllBudgetCategories(userData, excludedCategories);

  // console.log("  GETTING GetBudgetMonths");
  const budgetMonths = await GetBudgetMonths({
    userID: userData.userID,
    budgetID: userData.budgetID,
    ...userData.tokenDetails,
  });
  saveNewYNABTokens(userData.userID, budgetMonths.connDetails);

  // console.log("  GETTING GetBudgets");
  const bd = await GetBudgets({
    userID: userData.userID,
    ...userData.tokenDetails,
  });
  saveNewYNABTokens(userData.userID, bd.connDetails);

  // Check to see if there were any changes made to the user's budget
  // as compared to what we already have in the database. (Were there
  // any categories added/removed from their budget since they last logged in?)
  // console.log("  GETTING refreshCategories");
  const newCategoryData = refreshCategories(
    userData.userID,
    userData.budgetID,
    categoryData,
    catGroups
  );

  // Create the category list to be used throughout Evercent
  // console.log("  GETTING createCategoryList");
  const categoryList = createCategoryList(
    newCategoryData,
    catGroups,
    budgetMonths.data,
    userData.nextPaydate,
    userData.monthlyIncome
  );

  // console.log("  RETURNING");
  return {
    budgetNames: bd.data,
    budgetMonths: budgetMonths.data,
    categories: categoryList,
    editableCategoryList: catGroups,
  };
};

export const getCategoryDataDB = async (userID: string, budgetID: string) => {
  const queryData = await getAPIData(
    Queries.QUERY_CATEGORIES_INITIAL,
    {
      userBudgetInput: {
        userID,
        budgetID,
      },
    },
    false
  );

  return {
    categoryData: queryData[0],
    excludedCategories: queryData[1] as ExcludedCategory[],
  };
};

export const refreshCategories = (
  userID: string,
  budgetID: string,
  categoryData: any,
  catGroups: YNABCategoryGroup[]
) => {
  const newResults = getInput_RefreshCategories(
    budgetID,
    categoryData,
    catGroups
  );
  const newCategoryData = [...newResults.newCategoryData];
  const newResults2 = {
    details: newResults.details,
  };
  if (newResults2.details.length > 0) {
    getAPIData(
      Queries.MUTATION_REFRESH_CATEGORIES,
      {
        userID: userID,
        budgetID: budgetID,
        refreshCategoriesInput: newResults2,
      },
      true
    );
  }

  return newCategoryData;
};

export const createCategoryList = (
  categoryData: any,
  catGroups: YNABCategoryGroup[],
  budgetMonths: YNABBugdetMonth[],
  nextPaydate: string,
  monthlyIncome: number
) => {
  // TODO: I'm not a huge fan of the "algorithm" I'm using to load the data,
  //       which involves me having to check one last time after the final iteration
  //       of the loop to get the last result. Is there a better way that I can do it
  //       all in the same loop?

  // By mapping over the "catGroups" returned by the YNAB API
  // for each object in the database, we can ensure that the
  // data returned to the client will match the same order that the
  // YNAB data is shown in their actual budget.
  let categoryList = [];
  let cats = [];
  let currGroup = "";
  for (let i = 0; i < catGroups.length; i++) {
    let catDB = categoryData.find(
      (data: any) => isSameCategory(data, catGroups[i]) && catGroups[i].included
    );

    if (currGroup !== catGroups[i].categoryGroupName) {
      if (currGroup !== "" && cats.length > 0) {
        categoryList.push({
          __typename: "CategoryGroup",
          groupID: catGroups[i - 1].categoryGroupID,
          groupName: currGroup,
          categories: cats,
          ...getGroupAmounts(cats),
        });

        cats = [];
      }
      currGroup = catGroups[i].categoryGroupName;
    }

    if (catDB) {
      cats.push(
        createCategory(
          catDB,
          catGroups[i],
          budgetMonths,
          nextPaydate,
          monthlyIncome
        )
      );
    }
  }
  if (cats.length > 0) {
    categoryList.push({
      __typename: "CategoryGroup",
      groupID: catGroups[catGroups.length - 1].categoryGroupID,
      groupName: currGroup,
      categories: cats,
      ...getGroupAmounts(cats),
    });
  }

  return categoryList;
};

export const isSameCategory = (left: any, right: any) => {
  const categoryGroupIDLeft = left?.categoryGroupID || left?.CategoryGroupID;
  const categoryIDLeft = left?.categoryID || left?.CategoryID;
  const categoryGroupIDRight = right?.categoryGroupID || right?.CategoryGroupID;
  const categoryIDRight = right?.categoryID || right?.CategoryID;

  return (
    categoryGroupIDLeft.toLowerCase() == categoryGroupIDRight.toLowerCase() &&
    categoryIDLeft.toLowerCase() == categoryIDRight.toLowerCase()
  );
};

// ===============================
export const updateCategoryExpenseDetails = (
  category: CategoryListItem,
  key:
    | "nextDueDate"
    | "isMonthly"
    | "repeatFreqNum"
    | "repeatFreqType"
    | "includeOnChart"
    | "multipleTransactions",
  value: any,
  budgetMonths: YNABBugdetMonth[],
  monthlyIncome: number,
  nextPaydate: string
) => {
  let newCategory = {
    ...category,
    regularExpenseDetails: {
      ...category.regularExpenseDetails,
      [key]: value,
    },
  };

  if (key == "isMonthly" && value) {
    newCategory.regularExpenseDetails.repeatFreqNum = 1;
    newCategory.regularExpenseDetails.repeatFreqType = "Months";
  }

  const newCategoryCalc = calculateAmounts(
    newCategory,
    budgetMonths,
    monthlyIncome,
    nextPaydate
  );

  return newCategoryCalc;
};

export const updateCategoryAmount = (
  category: CategoryListItem,
  key: "amount" | "extraAmount",
  newAmount: number,
  budgetMonths: YNABBugdetMonth[],
  monthlyIncome: number,
  nextPaydate: string
) => {
  const newCategory = { ...category, [key]: newAmount };
  const newCategoryCalc = calculateAmounts(
    newCategory,
    budgetMonths,
    monthlyIncome,
    nextPaydate
  );

  return newCategoryCalc;
};

export const toggleCategoryOptions = (
  category: CategoryListItem,
  checked: boolean,
  option: string,
  budgetMonths: YNABBugdetMonth[],
  monthlyIncome: number,
  nextPaydate: string
) => {
  let newCategory = { ...category };

  newCategory.isRegularExpense = option == "Regular Expense" ? checked : false;
  newCategory.isUpcomingExpense =
    option == "Upcoming Expense" ? checked : false;

  if (
    newCategory.isRegularExpense &&
    !newCategory.regularExpenseDetails.repeatFreqType
  ) {
    // // Set regular expense defaults here
    newCategory.regularExpenseDetails = createRegularExpense(nextPaydate);
  }

  // If we're turning off the "Regular Expense" option, we should
  // recalculate the category amounts, since the adjusted amount likely
  // no longer applies
  if (!newCategory.isRegularExpense) {
    newCategory = calculateAmounts(
      newCategory,
      budgetMonths,
      monthlyIncome,
      nextPaydate
    );
  }

  return newCategory;
};

export const calculateAmounts = (
  category: CategoryListItem,
  budgetMonths: YNABBugdetMonth[],
  monthlyIncome: number,
  nextPaydate: string
) => {
  category.adjustedAmt = getAdjustedAmount(category, budgetMonths, nextPaydate);
  category.adjustedAmtPlusExtra = getAdjustedAmountPlusExtra(category);
  category.percentIncome = calculatePercentage(
    category.adjustedAmtPlusExtra,
    monthlyIncome
  );

  return category;
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

export const getAdjustedAmount = (
  category: CategoryListItem,
  budgetMonths: YNABBugdetMonth[],
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
      .categories.filter((cat) => isSameCategory(cat, category))[0];
    // console.log("strDueDate    ", strDueDate);
    // console.log("strNextPaydate", strNextPaydate);
    // console.log("strToday      ", strToday);
    // console.log("bmCat", bmCat);

    // Check "budgetMonths" for this category on the month of the nextDueDate
    // to see if the amount needed for the category has already been met
    //   If it has, the number of months should be calculated from the repeatFreqNum/repeatFreqType
    //   If it hasn't, the number of months should be calculated from the user's nextPayDate to the nextDueDate
    let availableInBudget = bmCat.available;
    if (availableInBudget < 0) {
      availableInBudget = 0;
    }
    let amountNeeded = category.amount - availableInBudget;
    // console.log("category.amount", category.amount);
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

export const getAdjustedAmountPlusExtra = (category: CategoryListItem) => {
  if (
    category.isRegularExpense &&
    !category.regularExpenseDetails.includeOnChart
  ) {
    return 0;
  }
  return category.adjustedAmt + category.extraAmount;
};

export const getPostingMonthAmounts = (): PostingMonth[] => {
  // TODO: This needs to calculate the real month/amounts
  return [
    { month: "Jan 2022", amount: 10, percentAmount: 10 },
    { month: "Feb 2022", amount: 10, percentAmount: 10 },
    { month: "Mar 2022", amount: 10, percentAmount: 10 },
    { month: "Apr 2022", amount: 10, percentAmount: 10 },
    { month: "May 2022", amount: 10, percentAmount: 10 },
    { month: "Jun 2022", amount: 10, percentAmount: 10 },
    { month: "Jul 2022", amount: 10, percentAmount: 10 },
    { month: "Aug 2022", amount: 10, percentAmount: 10 },
    { month: "Sep 2022", amount: 10, percentAmount: 10 },
    { month: "Oct 2022", amount: 10, percentAmount: 10 },
    { month: "Nov 2022", amount: 10, percentAmount: 10 },
  ];
};

export const getMonthsAhead = (
  category: CategoryListItem,
  target: number
): number => {
  // TODO: This needs to *actually* figure out the properly # of months ahead
  // for a given category
  return Math.floor(Math.random() * (target + 4));
};

export const getRegularExpenses = (
  categories: CategoryListGroup[]
): CategoryListGroup[] => {
  // First, get the groups which have at least one regular expense within them
  const groupsWithReg = categories.filter((grp) =>
    grp.categories.some((cat) => cat.isRegularExpense)
  );

  // Then, for each of those groups, only return the categories within that group
  // that actually are a "Regular Expense"
  return groupsWithReg.map((grp) => {
    return {
      ...grp,
      categories: grp.categories.filter((cat) => cat.isRegularExpense),
    };
  });
};

export const getInput_RefreshCategories = (
  budgetID: string,
  categoryData: any,
  catGroups: YNABCategoryGroup[]
) => {
  // If we have any in catGroups (YNAB) that aren't in categoryData (database),
  // then we need to adjust the database accordingly.
  //   If there's data in catGroups but not categoryData, run a query
  //   to add that data to the database, but don't "await" it, and just
  //   manually add the data to "categories" below.
  let newResults = [];
  for (let i = 0; i < catGroups.length; i++) {
    if (!categoryData.some((cat: any) => isSameCategory(cat, catGroups[i]))) {
      newResults.push({
        categoryGroupID: catGroups[i].categoryGroupID.toUpperCase(),
        categoryID: catGroups[i].categoryID.toUpperCase(),
        guid: generateUUID().toUpperCase(),
        doThis: "add",
      });

      const indexToInsert = categoryData.lastIndexOf(
        categoryData.find((cat: any) => {
          return (
            cat.CategoryGroupID == catGroups[i].categoryGroupID.toUpperCase()
          );
        })
      );
      categoryData.splice(indexToInsert, 0, {
        CategoryGUID: generateUUID().toUpperCase(),
        BudgetID: budgetID,
        CategoryGroupID: catGroups[i].categoryGroupID.toUpperCase(),
        CategoryID: catGroups[i].categoryID.toUpperCase(),
        CategoryAmount: 0,
        ExtraAmount: 0,
        IsRegularExpense: false,
        IsUpcomingExpense: false,
        IsMonthly: null,
        NextDueDate: null,
        ExpenseMonthsDivisor: null,
        RepeatFreqNum: null,
        RepeatFreqType: null,
        IncludeOnChart: null,
        MultipleTransactions: null,
        TotalExpenseAmount: null,
      });
    }
  }

  //   If there's data in categoryData, but not catGroups, that means it's
  //   been deleted from YNAB, so we should delete it from categoryData, as well,
  //   and run a query to remove it from the database at the same time, similar
  //   to the steps above.
  for (let i = 0; i < categoryData.length; i++) {
    if (!catGroups.some((grp) => isSameCategory(grp, categoryData[i]))) {
      newResults.push({
        categoryGroupID: categoryData[i].CategoryGroupID,
        categoryID: categoryData[i].CategoryID,
        guid: categoryData[i].CategoryGUID,
        doThis: "remove",
      });
      categoryData.splice(i, 1);
    }
  }

  return {
    details: newResults,
    newCategoryData: [...categoryData],
  };
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
