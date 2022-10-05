import { setDate } from "date-fns";
import type { NextApiRequest, NextApiResponse } from "next";
import { getAPIData, parseDate, saveNewYNABTokens } from "../../utils/utils";
import { GetBudgetMonths, PostCategoryMonth } from "../../utils/ynab";
import Queries from "../api/resolvers/resolverMapping.json";

type RunDetails = {
  RunID: string;
  UserID: string;
  BudgetID: string;
  AccessToken: string;
  RefreshToken: string;
  ExpirationDate: string;
};

type CategoryMonth = {
  RunID: string;
  CategoryID: string;
  PostingMonth: string;
  AmountToPost: number;
  IsIncluded: boolean;
  CategoryAmount: number;
  CategoryExtraAmount: number;
  CategoryAdjustedAmount: number;
  CategoryAdjAmountPerPaycheck: number;
  IsMonthly: boolean;
  NextDueDate: string;
};

type YNABMonth = {
  month: string;
  categories: YNABMonthCategory[];
};

type YNABMonthCategory = {
  categoryGroupID: string;
  categoryGroupName: string;
  categoryID: string;
  name: string;
  budgeted: number;
  activity: number;
  available: number;
};

async function GetBudgetMonthDetails(runDetails: RunDetails) {
  let mthDetails = await GetBudgetMonths({
    budgetID: runDetails.BudgetID,
    accessToken: runDetails.AccessToken,
    refreshToken: runDetails.RefreshToken,
    expirationDate: runDetails.ExpirationDate,
  });

  // If we got any token details, that means that we reached the YNAB API
  // threshold limit, OR our access token has reached its expiration date
  // If that's the case, we should update our token details in the database
  saveNewYNABTokens(runDetails.UserID, mthDetails.connDetails);

  return mthDetails.data;
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  try {
    let data = await getAPIData(Queries.QUERY_AUTO_RUNS_LOCKED, {}, false);

    // If there are no results to run/lock within the next hour, exit here
    if (data[0].length == 0) {
      res.status(200).json({ status: "No auto runs to lock. Exiting..." });
      return;
    }

    for (let i = 0; i < data[0].length; i++) {
      let mthDetails = await GetBudgetMonthDetails(data[0][i]);
      console.log("test", mthDetails[0].categories[0]);

      let categoryMonths = data[1].filter(
        (x: CategoryMonth) => x.RunID == data[0][i].RunID
      );
      console.log("catMonths", categoryMonths);

      for (let j = 0; j < categoryMonths.length; j++) {
        let ynabCategory = mthDetails
          .find(
            (x: YNABMonth) =>
              x.month == categoryMonths[j].PostingMonth.substring(0, 10)
          )
          .categories.find(
            (x: YNABMonthCategory) =>
              x.categoryID.toUpperCase() == categoryMonths[j].CategoryID
          );

        let oldAmountBudgeted = ynabCategory.budgeted;
        let newAmountBudgeted =
          oldAmountBudgeted + parseFloat(categoryMonths[j].AmountToPost);

        let newAmounts = await PostCategoryMonth({
          budgetID: data[0][i].BudgetID.toLowerCase(),
          accessToken: data[0][i].AccessToken,
          refreshToken: data[0][i].RefreshToken,
          expirationDate: data[0][i].ExpirationDate,
          month: categoryMonths[j].PostingMonth.substring(0, 10),
          categoryID: categoryMonths[j].CategoryID.toLowerCase(),
          newBudgetedAmount: newAmountBudgeted,
        });
        saveNewYNABTokens(data[0][i].UserID, newAmounts.connDetails);
        console.log("newAmounts", newAmounts);

        await new Promise((r) => setTimeout(r, 1000));

        // Load data into past results table
        let pastResultsParams = {
          categoryID: categoryMonths[j].CategoryID,
          categoryAmount: categoryMonths[j].CategoryAmount,
          categoryExtraAmount: categoryMonths[j].CategoryExtraAmount,
          categoryAdjustedAmount: categoryMonths[j].CategoryAdjustedAmount,
          categoryAdjAmountPerPaycheck:
            categoryMonths[j].CategoryAdjAmountPerPaycheck,
          postingMonth: categoryMonths[j].PostingMonth,
          oldAmountBudgeted: oldAmountBudgeted,
          amountPosted: parseFloat(categoryMonths[j].AmountToPost),
          newAmountBudgeted: newAmountBudgeted,
        };
        let params = {
          runID: data[0][i].RunID,
          savePastResultsInput: pastResultsParams,
        };
        await getAPIData(
          Queries.MUTATION_ADD_PAST_AUTO_RUN_RESULTS,
          params,
          true
        );

        // Update "ExpenseMonthsDivisor" field
        let catDueDate = parseDate(categoryMonths[j].NextDueDate);
        catDueDate = setDate(catDueDate, 1);
        let strDueDate = catDueDate.toISOString();
        if (
          !categoryMonths[j].IsMonthly &&
          categoryMonths[j].PostingMonth.substring(0, 10) ==
            strDueDate.substring(0, 10) &&
          newAmounts.data.newAvailableAmount >=
            parseFloat(categoryMonths[j].CategoryAmount)
        ) {
          await getAPIData(
            Queries.MUTATION_UPDATE_CATEGORY_MONTHS_DIVISOR,
            {
              userID: data[0][i].UserID,
              budgetID: data[0][i].BudgetID,
              categoryGUID: categoryMonths[j].CategoryID,
            },
            true
          );
        }
      }

      await getAPIData(
        Queries.MUTATION_CLEANUP_AUTOMATION_RUN,
        {
          userID: data[0][i].UserID,
          budgetID: data[0][i].BudgetID,
          runID: data[0][i].RunID,
        },
        true
      );
    }

    res
      .status(200)
      .json({ status: "Budget Automation finished successfully!" });
  } catch (err) {
    // If there was an error during this entire function, print that to the user instead
    console.log("Error", err);
    res.status(500).json({ status: "Error", errorMessage: err });
  }
}
