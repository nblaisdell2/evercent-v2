import type { NextApiRequest, NextApiResponse } from 'next'
import { setDate } from 'date-fns';

import { getAPIData, saveNewYNABTokens, parseDate } from '../../utils/utils';
import { GetBudgetMonths } from '../../utils/ynab';
import Queries from '../api/resolvers/resolverMapping.json';

async function GetBudgetMonthDetails(category) {
  let mthDetails = await GetBudgetMonths({
    budgetID: category.BudgetID,
    accessToken: category.AccessToken,
    refreshToken: category.RefreshToken,
    expirationDate: category.ExpirationDate,
  });

  // If we got any token details, that means that we reached the YNAB API
  // threshold limit, OR our access token has reached its expiration date
  // If that's the case, we should update our token details in the database
  let newTokenDetails = mthDetails.connDetails;
  if (newTokenDetails) {
    saveNewYNABTokens(category.UserID, newTokenDetails);
  }

  return mthDetails.data;
}

async function GetAmountDetails(category, mthDetails, payFreq) {
  // console.log('category', category);

  if (!category.IncludeOnChart) {
    return {
      categoryAmount: category.CategoryAmount,
      categoryExtraAmount: category.ExtraAmount,
      categoryAdjustedAmount: 0,
      categoryAdjAmountPerPaycheck: 0
    }
  }

  let amt = category.CategoryAmount;

  if (category.IsMonthly !== null && !category.IsMonthly) {
    if (category.NextDueDate) {
      let dtDueDate = parseDate(category.NextDueDate);
      dtDueDate = setDate(dtDueDate, 1);

      let strMonth = dtDueDate.toISOString().substring(0, 10);
      let ynabCategory = mthDetails.find(x => x.month == strMonth).categories.find(x => x.categoryID.toUpperCase() == category.CategoryID);

      // console.log("ynabCategory", ynabCategory);
      if (ynabCategory && ynabCategory.available >= category.CategoryAmount) {
        amt = await GetAmountByRepeatType(amt, category.RepeatFreqNum, category.RepeatFreqType);
      } else {
        amt /= category.ExpenseMonthsDivisor;
      }
    }
  }

  amt += category.ExtraAmount;

  return {
    categoryAmount: category.CategoryAmount,
    categoryExtraAmount: category.ExtraAmount,
    categoryAdjustedAmount: amt,
    categoryAdjAmountPerPaycheck: await GetAmountByFrequency(amt, payFreq)
  }
}

async function GetAutoMonthDetails(category, amountDetails, mthDetails, nextPaydate) {
  let monthAmounts = [];

  let totalAmtToPost = amountDetails.categoryAdjAmountPerPaycheck;
  let totalDesiredAmt = amountDetails.categoryAdjustedAmount - amountDetails.categoryExtraAmount;

  // Make sure the first month starts at the user's next paydate
  if (nextPaydate) {
    let dtNextPaydate = parseDate(nextPaydate);
    dtNextPaydate = setDate(dtNextPaydate, 1);

    let strNextPaydate = dtNextPaydate.toISOString().substring(0, 10);
    let startIdx = 0;
    for (let i = 0; i < mthDetails.length; i++) {
      if (mthDetails[i].month == strNextPaydate) {
        console.log('Exiting...');
        startIdx = i;
        break;
      }
    }

    mthDetails = mthDetails.slice(startIdx);
  }

  let foundStartMonth = false;
  for (let i = 0; i < mthDetails.length; i++) {
    if (totalAmtToPost <= 0) break;

    let ynabCategory = mthDetails[i].categories.find(x => x.categoryID.toUpperCase() == category.CategoryID);
    if (!foundStartMonth) {
      let foundTransactions = ynabCategory.activity !== 0;
      if (i == 0 && !category.MultipleTransactions && foundTransactions) {
        continue; // already paid that month, move onto the next
      }

      if (ynabCategory.budgeted < totalDesiredAmt) {
        foundStartMonth = true;
      }
    }

    if (foundStartMonth) {
      let amtCurrBudgeted = ynabCategory.budgeted;

      let amtToPost = totalDesiredAmt - (category.IsRegularExpense ? amtCurrBudgeted : 0);
      if (amtToPost > totalAmtToPost) {
        // does this ever happen?
        amtToPost = totalAmtToPost;
      }

      monthAmounts.push({
        month: mthDetails[i].month,
        amountToPost: amtToPost
      });

      if (mthDetails[i].month == category.NextDueDate) {
        totalDesiredAmt = await GetAmountByRepeatType(amountDetails.categoryAmount, category.RepeatFreqNum, category.RepeatFreqType);
      }

      totalAmtToPost -= amtToPost;
    }
  }

  return monthAmounts;
}

async function GetAmountByFrequency(amt, payFreq) {
  let newAmt = amt;
  switch (payFreq) {
    case "Weekly":
      newAmt /= 4;
      break;
    case "Every 2 Weeks":
      newAmt /= 2;
      break;
    default:
      break;
  }

  return newAmt;
}

async function GetAmountByRepeatType(amt, repeatNum, repeatType) {
  return (amt / (repeatNum * (repeatType == "Months" ? 1 : 12)));
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  try {
    // 1. Check the database to see if there are any upcoming runs (within the next hour)
    let data = await getAPIData(Queries.QUERY_RUNS_TO_LOCK, {}, false);

    // If there are no results to run/lock within the next hour, exit here
    if (data[0].length == 0) {
      res.status(200).json({ status: "No auto runs to lock. Exiting..." });
      return;
    }

    // 2. Then, loop through each RunID (automation run for a particular User/Budget),
    //    then through each of their categories, gathering the appropriate adjusted amounts,
    //    and finally determining how much should go towards each month in their budget for
    //    that category.
    let results = [];
    for (let i = 0; i < data[0].length; i++) {
      // First, get the current YNAB month details for this user
      let mthDetails = await GetBudgetMonthDetails(data[0][i]);
      // console.log('mthDetails', mthDetails);
      // console.log('mthDetails categories', mthDetails[0].categories);

      // Then, find the user's category details from the database (for this particular RunID)
      // and loop through each of those
      let runID = data[0][i].RunID;
      let categories = data[1].filter((x) => x.RunID == runID);
      for (let j = 0; j < categories.length; j++) {
        // Find the adjusted amounts for this category
        // This will use the user's entered details, including Regular Expense details
        let amountDetails = await GetAmountDetails(categories[j], mthDetails, data[0][i].PayFrequency);
        // console.log('amountDetails', amountDetails);

        // This will determine how much will be applied to each month in the user's budget
        // for this category, based on the adjusted amounts calculated above
        let monthAmounts = await GetAutoMonthDetails(categories[j], amountDetails, mthDetails, data[0][i].NextPaydate);
        // console.log('monthAmounts', monthAmounts);

        for (let k = 0; k < monthAmounts.length; k++) {
          let isIncluded = true;
          let foundMonth = data[2].find(x => x.RunID == runID && x.CategoryID == categories[j].CategoryID && x.PostingMonth == monthAmounts[k].month);
          if (foundMonth) {
            isIncluded = false;
          }

          results.push({
            runID: runID,
            categoryID: categories[j].CategoryID,
            postingMonth: monthAmounts[k].month,
            amountToPost: monthAmounts[k].amountToPost,
            isIncluded: isIncluded,
            categoryAmount: amountDetails.categoryAmount,
            categoryExtraAmount: amountDetails.categoryExtraAmount,
            categoryAdjustedAmount: amountDetails.categoryAdjustedAmount,
            categoryAdjAmountPerPaycheck: amountDetails.categoryAdjAmountPerPaycheck,
          });
        }
      }
    }

    // 3. Format the "results" object into the appropriate input object and run the query
    //    to update the locked tables in the database
    let params = {
      saveLockedResultsInput: { results: [...results] }
    }
    await getAPIData(Queries.MUTATION_LOAD_LOCKED_AUTO_RUN_RESULTS, params, true);

    // Lastly, just send a message to let the process know everything ran successfully
    res.status(200).json({ status: "Successfully locked auto runs" });
  } catch (err) {
    // If there was an error during this entire function, print that to the user instead
    console.log('Error', err);
    res.status(500).json({ status: "Error", errorMessage: err });
  }
}
