import Queries from "../resolvers/resolverMapping.json";
import {
  GetBudgets,
  GetBudgetName,
  GetBudgetMonths,
  GetNewAccessToken,
  GetNewAccessTokenRefresh,
  GetDefaultBudgetID,
  PostCategoryMonth,
} from "../../../utils/ynab";
import { getAPIData, saveNewYNABTokens } from "../../../utils/utils";

function createCategory(categoryData) {
  return {
    guid: categoryData.CategoryGUID,
    budgetID: categoryData.BudgetID,
    categoryGroupID: categoryData.CategoryGroupID,
    categoryID: categoryData.CategoryID,
    amount: categoryData.CategoryAmount,
    extraAmount: categoryData.ExtraAmount,
    isRegularExpense: categoryData.IsRegularExpense,
    isUpcomingExpense: categoryData.IsUpcomingExpense,
    regularExpenseDetails: {
      guid: categoryData.CategoryGUID,
      isMonthly: categoryData.IsMonthly,
      nextDueDate: categoryData.NextDueDate,
      monthsDivisor: categoryData.ExpenseMonthsDivisor,
      repeatFreqNum: categoryData.RepeatFreqNum,
      repeatFreqType: categoryData.RepeatFreqType,
      includeOnChart: categoryData.IncludeOnChart,
      multipleTransactions: categoryData.MultipleTransactions,
    },
    upcomingDetails: {
      guid: categoryData.CategoryGUID,
      totalExpenseAmount: categoryData.TotalExpenseAmount,
    },
  };
}

function createAutoRuns(autoRunData) {
  let autoRuns = [];

  let autoRun = {
    runID: autoRunData[0].RunID,
    runTime: autoRunData[0].RunTime,
    isLocked: autoRunData[0].IsLocked,
    categories: [],
  };

  for (let i = 0; i < autoRunData.length; i++) {
    let currRow = autoRunData[i];

    if (autoRun.runID !== currRow.RunID) {
      autoRuns.push(autoRun);
      autoRun = {
        runID: currRow.RunID,
        runTime: currRow.RunTime,
        isLocked: currRow.IsLocked,
        categories: [],
      };
    }

    if (currRow.CategoryID) {
      let existingCategory = autoRun.categories.find(
        (cat) => cat.categoryID === currRow.CategoryID
      );
      if (!existingCategory) {
        existingCategory = {
          categoryID: currRow.CategoryID,
          categoryAmount: currRow.CategoryAmount,
          categoryExtraAmount: currRow.CategoryExtraAmount,
          categoryAdjustedAmount: currRow.CategoryAdjustedAmount,
          categoryAdjAmountPerPaycheck: currRow.CategoryAdjAmountPerPaycheck,
          postingMonths: [],
        };

        autoRun.categories.push(existingCategory);
      }

      if (currRow.PostingMonth) {
        existingCategory.postingMonths.push({
          postingMonth: currRow.PostingMonth,
          isIncluded: currRow.IsIncluded,
          amountToPost: currRow.AmountToPost,
          amountPosted: currRow.AmountPosted,
          oldAmountBudgeted: currRow.OldAmountBudgeted,
          newAmountBudgeted: currRow.NewAmountBudgeted,
        });
      }
    }
  }

  autoRuns.push(autoRun);

  return autoRuns;
}

function createRunsToLock(runsData) {
  let runsToLock = [];
  let runToLock = {
    runID: runsData[0].RunID,
    categories: [],
  };
  for (let i = 0; i < runsData.length; i++) {
    if (runsData[i].RunID !== runToLock.runID) {
      runsToLock.push(runToLock);
      runToLock = {
        runID: runsData[i].RunID,
        categories: [],
      };
    }

    let existingCategory = runToLock.categories.find(
      (cat) => cat.categoryID === runsData[i].CategoryID
    );
    if (!existingCategory) {
      existingCategory = {
        categoryID: runsData[i].CategoryID,
        postingMonths: [],
      };
      runToLock.categories.push(existingCategory);
    }

    if (runsData[i].PostingMonth) {
      existingCategory.postingMonths.push(runsData[i].PostingMonth);
    }
  }
  runsToLock.push(runToLock);

  return runsToLock;
}

export const resolvers = {
  Query: {
    userID: async (_, args) => {
      const queryData = await getAPIData(Queries.QUERY_USER_ID, args, false);
      const userData = queryData[0][0];

      return {
        id: userData?.UserID,
        defaultBudgetID: userData?.DefaultBudgetID,
      };
    },
    user: async (_, args) => {
      const queryData = await getAPIData(Queries.QUERY_USER, args, false);
      const user = queryData[0][0];

      return {
        id: user.UserID,
        email: user.UserEmail,
        username: user.UserName,
        defaultBudgetID: user.DefaultBudgetID,
        monthlyIncome: user.MonthlyIncome,
        monthsAheadTarget: user.MonthsAheadTarget,
        payFrequency: user.PayFrequency,
        nextPaydate: user.NextPaydate,
      };
    },
    ynabConnDetails: async (_, args) => {
      const queryData = await getAPIData(
        Queries.QUERY_YNAB_CONN_DETAILS,
        args,
        false
      );
      const details = queryData[0][0];

      return {
        accessToken: details?.AccessToken || "",
        refreshToken: details?.RefreshToken || "",
        expirationDate: details?.ExpirationDate || new Date().toISOString(),
      };
    },
    getNewAccessToken: async (_, args) => {
      const tokenDetails = await GetNewAccessToken(args);
      saveNewYNABTokens(args.userID, tokenDetails);

      return tokenDetails;
    },
    getDefaultBudgetID: async (_, args) => {
      const budgetID = await GetDefaultBudgetID(args);
      saveNewYNABTokens(args.userID, budgetID.connDetails);

      await getAPIData(
        Queries.MUTATION_UPDATE_BUDGET_ID,
        { userID: args.userID, budgetID: budgetID.data },
        true
      );

      return budgetID.data;
    },
    budgets: async (_, args) => {
      const budgetData = await GetBudgets(args);
      saveNewYNABTokens(args.userID, budgetData.connDetails);

      return budgetData.data;
    },
    budgetName: async (_, args) => {
      const budgetName = await GetBudgetName(args);
      saveNewYNABTokens(args.userID, budgetName.connDetails);

      return budgetName.data;
    },
    budgetMonths: async (_, args) => {
      const budgetMonths = await GetBudgetMonths(args);
      saveNewYNABTokens(args.userID, budgetMonths.connDetails);

      return budgetMonths.data;
    },
    categories: async (_, args) => {
      const queryData = await getAPIData(Queries.QUERY_CATEGORIES, args, false);
      const categoryData = queryData[0];

      const categories = categoryData?.map(createCategory);
      return categories;
    },
    category: async (_, args) => {
      const queryData = await getAPIData(Queries.QUERY_CATEGORY, args, false);
      const categoryData = queryData[0][0];

      const category = createCategory(categoryData);
      return category;
    },
    regularExpenses: async (_, args) => {
      const queryData = await getAPIData(
        Queries.QUERY_REGULAR_EXPENSES,
        args,
        false
      );
      const expenseData = queryData[0];

      const regularExpenses = expenseData?.map(createCategory);
      return regularExpenses;
    },
    nextUpcomingCategory: async (_, args) => {},
    upcomingCategories: async (_, args) => {
      const queryData = await getAPIData(
        Queries.QUERY_UPCOMING_EXPENSES,
        args,
        false
      );
      const upcomingData = queryData[0];

      const upcomingExpenses = upcomingData?.map(createCategory);
      return upcomingExpenses;
    },
    nextAutoRun: async (_, args) => {
      const queryData = await getAPIData(
        Queries.QUERY_NEXT_AUTO_RUN,
        args,
        false
      );
      const autoRunData = queryData[0];

      const autoRun = createAutoRuns(autoRunData)[0];
      return autoRun;
    },
    autoRuns: async (_, args) => {
      const queryData = await getAPIData(Queries.QUERY_AUTO_RUNS, args, false);
      const autoRunData = queryData[0];

      const autoRuns = createAutoRuns(autoRunData);
      return autoRuns;
    },
    pastAutoRuns: async (_, args) => {
      const queryData = await getAPIData(
        Queries.QUERY_PAST_AUTO_RUNS,
        args,
        false
      );
      const pastRunData = queryData[0];

      const pastRuns = createAutoRuns(pastRunData);
      return pastRuns;
    },
    runsToLock: async (_, args) => {
      const queryData = await getAPIData(
        Queries.QUERY_RUNS_TO_LOCK,
        args,
        false
      );
      const runsData = queryData[0];

      const runsToLock = createRunsToLock(runsData);
      return runsToLock;
    },
  },
  Mutation: {
    saveYNABTokens: async (_, args) => {
      const result = await getAPIData(
        Queries.MUTATION_SAVE_YNAB_TOKENS,
        args,
        true
      );
      return !result ? "There was an error." : "Query Successful";
    },
    refreshYNABTokens: async (_, args) => {
      const result = await GetNewAccessTokenRefresh(args);
      saveNewYNABTokens(args.userID, result.connDetails);

      return result.data;
    },
    postAmountToBudget: async (_, args) => {
      const result = await PostCategoryMonth(args);
      saveNewYNABTokens(args.userID, result.connDetails);

      return result.data;
    },
    updateBudgetID: async (_, args) => {
      const result = await getAPIData(
        Queries.MUTATION_UPDATE_BUDGET_ID,
        args,
        true
      );
      return !result ? "There was an error." : "Query Successful";
    },
    updateUserDetails: async (_, args) => {
      const result = await getAPIData(
        Queries.MUTATION_UPDATE_USER_DETAILS,
        args,
        true
      );
      return !result ? "There was an error." : "Query Successful";
    },
    updateMonthsAheadTarget: async (_, args) => {
      const result = await getAPIData(
        Queries.MUTATION_UPDATE_MONTHS_AHEAD_TARGET,
        args,
        true
      );
      return !result ? "There was an error." : "Query Successful";
    },
    updateCategories: async (_, args) => {
      const result = await getAPIData(
        Queries.MUTATION_UPDATE_CATEGORIES,
        args,
        true
      );
      return !result ? "There was an error." : "Query Successful";
    },
    toggleCategoryInclusion: async (_, args) => {
      const result = await getAPIData(
        Queries.MUTATION_TOGGLE_CATEGORY_INCLUSION,
        args,
        true
      );
      return !result ? "There was an error." : "Query Successful";
    },
    updateCategoryMonthsDivisor: async (_, args) => {
      const result = await getAPIData(
        Queries.MUTATION_UPDATE_CATEGORY_MONTHS_DIVISOR,
        args,
        true
      );
      return !result ? "There was an error." : "Query Successful";
    },
    saveAutomationResults: async (_, args) => {
      const result = await getAPIData(
        Queries.MUTATION_SAVE_AUTOMATION_RESULTS,
        args,
        true
      );
      return !result ? "There was an error." : "Query Successful";
    },
    cancelAutomationRuns: async (_, args) => {
      const result = await getAPIData(
        Queries.MUTATION_CANCEL_AUTOMATION_RUNS,
        args,
        true
      );
      return !result ? "There was an error." : "Query Successful";
    },
    // loadLockedAutoRunDetails: async (_, args) => {
    //   const result = await getAPIData(
    //     Queries.MUTATION_LOAD_LOCKED_AUTO_RUN_RESULTS,
    //     args,
    //     true
    //   );
    //   return !result ? "There was an error." : "Query Successful";
    // },
    // addPastAutoRunResults: async (_, args) => {
    //   const result = await getAPIData(
    //     Queries.MUTATION_ADD_PAST_AUTO_RUN_RESULTS,
    //     args,
    //     true
    //   );
    //   return !result ? "There was an error." : "Query Successful";
    // },
    // cleanupAutomationRun: async (_, args) => {
    //   const result = await getAPIData(
    //     Queries.MUTATION_CLEANUP_AUTOMATION_RUN,
    //     args,
    //     true
    //   );
    //   return !result ? "There was an error." : "Query Successful";
    // },
  },
};
