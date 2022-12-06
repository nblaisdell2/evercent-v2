import Queries from "../resolvers/resolverMapping.json";
import {
  GetBudgets,
  GetBudgetName,
  GetBudgetMonths,
  GetNewAccessToken,
  GetNewAccessTokenRefresh,
  GetDefaultBudgetID,
  PostCategoryMonth,
  GetBudget,
  GetCategoryGroups,
} from "../../../utils/ynab";
import {
  calculatePercentage,
  getAPIData,
  saveNewYNABTokens,
} from "../../../utils/utils";
import {
  getAdjustedAmount,
  getAdjustedAmountPlusExtra,
  getGroupAmounts,
} from "../../../utils/evercent";
import { v4 as uuidv4 } from "uuid";

function generateUUID() {
  return uuidv4();
}

function createCategory(categoryData) {
  return {
    guid: catDB.CategoryGUID,
    budgetID: catDB.BudgetID,
    categoryGroupID: catDB.CategoryGroupID,
    categoryID: catDB.CategoryID,
    categoryGroupName: catDB.CategoryGroupName,
    categoryName: catDB.CategoryName,
    amount: catDB.CategoryAmount,
    extraAmount: catDB.ExtraAmount,
    isRegularExpense: catDB.IsRegularExpense,
    isUpcomingExpense: catDB.IsUpcomingExpense,
    regularExpenseDetails: {
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
      guid: catDB.CategoryGUID,
      totalExpenseAmount: catDB.TotalExpenseAmount,
    },
    budgetAmounts: {
      budgeted: catDB.BudgetAmountBudgeted,
      activity: catDB.BudgetAmountActivity,
      available: catDB.BudgetAmountAvailable,
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
    userData: async (_, args) => {
      const strRightNow = new Date().toISOString();

      if (!args.userEmail) {
        return {
          userID: "",
          budgetID: "",
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
      const queryData = await getAPIData(Queries.QUERY_USER_ID, args, false);
      const { UserID, DefaultBudgetID } = queryData[0][0];

      // 2. Query the user's details using those IDs above
      //      - User Data (monthly income, pay freq, etc)
      //      - Categories
      const queryDataUser = await getAPIData(
        Queries.QUERY_USER,
        { userID: UserID, budgetID: DefaultBudgetID },
        false
      );
      const details = queryDataUser[0][0];

      // 3. Get the budget name from YNAB, so we can
      //    already have it by the time the page loads
      const budgetName = await GetBudgetName({
        budgetID: DefaultBudgetID,
        accessToken: details.AccessToken || "",
        refreshToken: details.RefreshToken || "",
        expirationDate: details.ExpirationDate || strRightNow,
      });

      console.log("returning", {
        userID: details.UserID,
        budgetID: details.DefaultBudgetID,
        budgetName: budgetName.data,
        monthlyIncome: details.MonthlyIncome || 0,
        monthsAheadTarget: details.MonthsAheadTarget || 6,
        payFrequency: details.PayFrequency || "Weekly",
        nextPaydate: details.NextPaydate || strRightNow,
        tokenDetails: {
          accessToken: details.AccessToken || "",
          refreshToken: details.RefreshToken || "",
          expirationDate: details.ExpirationDate || strRightNow,
        },
      });

      return {
        userID: details.UserID,
        budgetID: details.DefaultBudgetID,
        budgetName: budgetName.data,
        monthlyIncome: details.MonthlyIncome || 0,
        monthsAheadTarget: details.MonthsAheadTarget || 6,
        payFrequency: details.PayFrequency || "Weekly",
        nextPaydate: details.NextPaydate || strRightNow,
        tokenDetails: {
          accessToken: details.AccessToken || "",
          refreshToken: details.RefreshToken || "",
          expirationDate: details.ExpirationDate || strRightNow,
        },
      };
    },
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
    getCategoryGroups: async (_, args) => {
      const catGroups = await GetCategoryGroups(args);

      const queryData = await getAPIData(
        Queries.QUERY_EXCLUDED_CATEGORIES,
        { userID: args.userID, budgetID: args.budgetID },
        false
      );
      const details = queryData[0];

      for (let i = 0; i < catGroups.length; i++) {
        catGroups[i].included = !details.some((d) => {
          return d.CategoryID.toLowerCase() == catGroups[i].categoryID;
        });
      }

      return catGroups;
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
    budget: async (_, args) => {
      const budgetData = await GetBudget(args);
      saveNewYNABTokens(args.userID, budgetData.connDetails);

      return budgetData.data;
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
      let { userID, budgetID } = args.userBudgetInput;
      delete args.userBudgetInput;
      args.userID = userID;
      args.budgetID = budgetID;

      const budgetMonths = await GetBudgetMonths(args);
      saveNewYNABTokens(args.userID, budgetMonths.connDetails);

      return budgetMonths.data;
    },
    categories: async (_, args) => {
      const queryData = await getAPIData(
        Queries.QUERY_CATEGORIES_INITIAL,
        { userBudgetInput: args.userBudgetInput },
        false
      );

      const categoryData = queryData[0];
      const user = queryData[1][0];
      const excludedCategories = queryData[2];

      let { userID, budgetID } = args.userBudgetInput;
      delete args.userBudgetInput;

      const catGroups = await GetCategoryGroups({ ...args, userID, budgetID });
      const budgetMonths = await GetBudgetMonths({ ...args, userID, budgetID });
      const bm = budgetMonths.data;

      // ======================================
      // If we have any in catGroups (YNAB) that aren't in categoryData (database),
      // then we need to adjust the database accordingly.
      //   If there's data in catGroups but not categoryData, run a query
      //   to add that data to the database, but don't "await" it, and just
      //   manually add the data to "categories" below.

      //   If there's data in categoryData, but not catGroups, that means it's
      //   been deleted from YNAB, so we should delete it from categoryData, as well,
      //   and run a query to remove it from the database at the same time, similar
      //   to the steps above.

      let newResults = [];
      for (let i = 0; i < catGroups.length; i++) {
        if (
          !categoryData.some((cat) => {
            return (
              cat.CategoryGroupID.toLowerCase() ==
                catGroups[i].categoryGroupID &&
              cat.CategoryID.toLowerCase() == catGroups[i].categoryID
            );
          }) &&
          !excludedCategories.some((cat) => {
            return (
              cat.CategoryGroupID.toLowerCase() ==
                catGroups[i].categoryGroupID &&
              cat.CategoryID.toLowerCase() == catGroups[i].categoryID
            );
          })
        ) {
          newResults.push({
            categoryGroupID: catGroups[i].categoryGroupID.toUpperCase(),
            categoryID: catGroups[i].categoryID.toUpperCase(),
            guid: generateUUID().toUpperCase(),
            doThis: "add",
          });

          const indexToInsert = categoryData.lastIndexOf(
            categoryData.find((cat) => {
              return (
                cat.CategoryGroupID ==
                catGroups[i].categoryGroupID.toUpperCase()
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

      for (let i = 0; i < categoryData.length; i++) {
        if (
          !catGroups.some((grp) => {
            return (
              grp.categoryGroupID ==
                categoryData[i].CategoryGroupID.toLowerCase() &&
              grp.categoryID == categoryData[i].CategoryID.toLowerCase()
            );
          })
        ) {
          newResults.push({
            categoryGroupID: categoryData[i].CategoryGroupID,
            categoryID: categoryData[i].CategoryID,
            guid: categoryData[i].CategoryGUID,
            doThis: "remove",
          });
          categoryData.splice(i, 1);
        }
      }

      newResults = {
        details: newResults,
      };

      if (newResults.details.length > 0) {
        getAPIData(
          Queries.MUTATION_REFRESH_CATEGORIES,
          {
            userID: userID,
            budgetID: budgetID,
            refreshCategoriesInput: newResults,
          },
          true
        );
      }
      // ======================================

      // By mapping over the "catGroups" returned by the YNAB API
      // for each object in the database, we can ensure that the
      // data returned to the client will match the same order that the
      // YNAB data is shown in their actual budget.
      let categoryListTemp = [];
      let cats = [];
      let currGroup = "";
      for (let i = 0; i < catGroups.length; i++) {
        let catDB = categoryData.find((data) => {
          return (
            data.CategoryGroupID.toLowerCase() ==
              catGroups[i].categoryGroupID &&
            data.CategoryID.toLowerCase() == catGroups[i].categoryID
          );
        });

        if (currGroup !== catGroups[i].categoryGroupName) {
          if (currGroup !== "") {
            categoryListTemp.push({
              groupName: currGroup,
              categories: cats,
              ...getGroupAmounts(cats),
            });

            cats = [];
          }
          currGroup = catGroups[i].categoryGroupName;
        }

        if (catDB) {
          let currCat = {
            guid: catDB.CategoryGUID,
            categoryGroupID: catGroups[i].categoryGroupID,
            categoryID: catGroups[i].categoryID,
            groupName: currGroup,
            name: catGroups[i].categoryName,
            amount: catDB.CategoryAmount,
            extraAmount: catDB.ExtraAmount,
            isRegularExpense: catDB.IsRegularExpense,
            isUpcomingExpense: catDB.IsUpcomingExpense,
            regularExpenseDetails: {
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
              guid: catDB.CategoryGUID,
              totalExpenseAmount: catDB.TotalExpenseAmount,
            },
            budgetAmounts: {
              budgeted: catGroups[i].budgeted,
              activity: catGroups[i].activity,
              available: catGroups[i].available,
            },
          };
          currCat.adjustedAmt = getAdjustedAmount(
            currCat,
            bm,
            user.NextPaydate
          );
          currCat.adjustedAmtPlusExtra = getAdjustedAmountPlusExtra(currCat);
          currCat.percentIncome = calculatePercentage(
            currCat.adjustedAmtPlusExtra,
            user.MonthlyIncome // NEED INCOME
          );
          cats.push(currCat);
        }
      }
      categoryListTemp.push({
        groupName: currGroup,
        categories: cats,
        ...getGroupAmounts(cats),
      });

      return categoryListTemp;
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
    getInitialYNABDetails: async (_, args) => {
      // Get a new set of accessToken/refreshTokens for this user
      // connecting to YNAB for the first time
      const tokenDetails = await GetNewAccessToken(args);
      saveNewYNABTokens(args.userID, tokenDetails);
      console.log("TOKEN DETAILS", tokenDetails);

      // Then, get the user's default BudgetID for the budget they
      // selected. Then, save that to the database.
      const budgetID = await GetDefaultBudgetID({
        ...args,
        accessToken: tokenDetails.accessToken,
        refreshToken: tokenDetails.refreshToken,
      });

      await getAPIData(
        Queries.MUTATION_UPDATE_BUDGET_ID,
        { userID: args.userID, budgetID: budgetID.data },
        true
      );

      // Then, get the user's budget categories, and save them to the
      // database, as well. That way, when the page re-loads, we can pull
      // them in.
      const budgetData = await GetBudget({
        ...args,
        accessToken: tokenDetails.accessToken,
        refreshToken: tokenDetails.refreshToken,
        budgetID: budgetID.data,
      });

      // Format the data properly so that it can be accepted by the stored procedure
      let budgetDetails = budgetData.data.map((bd) => {
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

      // Save the category details to the database.
      await getAPIData(
        Queries.MUTATION_UPDATE_CATEGORIES,
        {
          userID: args.userID,
          budgetID: budgetID.data,
          updateCategoriesInput: budgetDetails,
        },
        true
      );

      // Return all 3 sets of data retrieved back to the user/client
      return "Query Successful";
    },
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
        Queries.MUTATION_UPDATE_MONTHS_AHEAD_ / TARGET,
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
    updateCategoryInclusion: async (_, args) => {
      const result = await getAPIData(
        Queries.MUTATION_UPDATE_CATEGORY_INCLUSION,
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
