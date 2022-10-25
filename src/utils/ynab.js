import { post, get, patch } from "axios";
import { parseISO, addMonths, addMinutes } from "date-fns";
import { parseDate } from "./utils";

const CLIENT_ID = process.env.YNAB_CLIENT_ID;
const CLIENT_SECRET = process.env.YNAB_CLIENT_SECRET;
const REDIRECT_URI = process.env.YNAB_REDIRECT_URI;

const OAUTH_BASE_URL = "https://app.youneedabudget.com/oauth";
const API_BASE_URL = "https://api.youneedabudget.com/v1";

const RATE_LIMIT_THRESHOLD = 180;

const IGNORED_CATEGORY_GROUPS = [
  "Internal Master Category", // Used internally by YNAB, not necessary for me
  "Credit Card Payments", // Special category within YNAB which works with Credit Cards
  "Hidden Categories", // Any categories hidden by the user in their budget, don't include them
];

// ### PRIVATE FUNCTIONS ###
function isOverRateLimitThreshold(response) {
  let rateLim = response.headers["x-rate-limit"];
  console.log("Rate Limit: ", rateLim);
  let rateLimLeft = parseInt(rateLim.substring(0, rateLim.indexOf("/")));

  return rateLimLeft >= RATE_LIMIT_THRESHOLD;
}

async function FormatAccessTokenDetails(response) {
  let accToken = response.access_token;
  let refToken = response.refresh_token;

  let newExpirDate = new Date();
  newExpirDate.setSeconds(newExpirDate.getSeconds() + response.expires_in);

  return {
    accessToken: accToken,
    refreshToken: refToken,
    expirationDate: newExpirDate.toISOString(),
  };
}

async function GetResponseWithTokenDetails(data, response) {
  return {
    data: data,
    connDetails: response.newTokenDetails,
  };
}

async function SendYNABRequest(method, uri, params, postData) {
  console.log("Inside 'SendYNABRequest'");

  console.log("  method", method);
  console.log("  uri", uri);
  console.log("  params", params);
  console.log("  postData", postData);
  let details = {};

  // First, check to see if the user's access token has already expired,
  // BEFORE running the request. If it is expired, we'll request a new
  // access/refresh token here, using the current refresh token, and override
  // the current results, so that when the request runs, it will still run properly
  // without the caller of this function having to think about refreshing the tokens.
  // However, this function will still return the new token details and the user will
  // have to persist those new token details somewhere, for future requests.
  if (
    Object.keys(params).includes("expirationDate") &&
    Object.keys(params).includes("refreshToken") &&
    !Object.keys(params).includes("grant_type")
  ) {
    console.log("checking expiration date");

    let now = new Date();
    let dtExpirationDateEarly = addMinutes(
      parseDate(params.expirationDate),
      -10
    );
    if (now >= dtExpirationDateEarly) {
      console.log("Attempting to refresh access tokens");
      let newTokenDetails = await GetNewAccessTokenRefresh(params);

      details.newTokenDetails = newTokenDetails;
      params.accessToken = newTokenDetails.accessToken;
    }
  }
  console.log("here too");

  // Append the access token to the headers object of the request, if provided
  const foundAccessToken = Object.keys(params).includes("accessToken");
  if (foundAccessToken) {
    console.log("adding headers");

    params = {
      ...params,
      headers: {
        Authorization: "Bearer " + params.accessToken,
      },
    };
  }

  // const foundAuthCode = Object.keys(params).includes("code");
  // if (foundAuthCode) {
  //   console.log("found auth code: " + params.code);
  //   if (params.headers) {
  //     params.headers["Access-Control-Allow-Origin"] = "*";
  //   } else {
  //     params.headers = {
  //       "Access-Control-Allow-Origin": "*",
  //     };
  //   }
  // }
  console.log("  new params", params);

  // Run the request and get the response
  let responsePromise;
  if (postData) {
    responsePromise = method(uri, postData, params);
  } else {
    responsePromise = method(uri, params);
  }

  return await responsePromise
    .then(async (response) => {
      // If an access token was passed in the parameters, we should
      // check the rate limit details to see if we are going to pass
      // the threshold.
      //    If we do pass the threshold, we need to run a new request
      //    to get some new token details
      //
      //    These details ALSO need to be passed to the user, so they
      //    can make adjustments, as necessary, based on there being a
      //    new token for this user.
      if (foundAccessToken) {
        if (isOverRateLimitThreshold(response)) {
          console.log("Over threshold... Getting new access token");
          let newTokenDetails = await GetNewAccessTokenRefresh(params); // Does this only pass the refreshToken properly?
          console.log("newTokenDetails", newTokenDetails);
          details.newTokenDetails = newTokenDetails;
        }
      }

      details.data = response.data;
      return details;
    })
    .catch((e) => {
      console.log("ERROR FROM YNAB");
      console.log(e);
      console.log("Error Message: " + e.response.data.error_description);
      console.log("Error Message: " + e.response.data.error);

      return e;
    });
}

// ### PUBLIC FUNCTIONS ###
export function GetURL_YNABAuthorizationPage() {
  return (
    OAUTH_BASE_URL +
    "/authorize?client_id=" +
    CLIENT_ID +
    "&redirect_uri=" +
    REDIRECT_URI +
    "&response_type=code"
  );
}

export function GetURL_YNABBudget(budgetID) {
  return (
    "https://app.youneedabudget.com/" + budgetID?.toLowerCase() + "/budget"
  );
}

export async function GetNewAccessToken({ authCode }) {
  return await SendYNABRequest(post, OAUTH_BASE_URL + "/token", {
    client_id: CLIENT_ID,
    client_secret: CLIENT_SECRET,
    redirect_uri: REDIRECT_URI,
    grant_type: "authorization_code",
    code: authCode,
  }).then(async (response) => await FormatAccessTokenDetails(response.data));
}

export async function GetNewAccessTokenRefresh({
  refreshToken,
  expirationDate,
}) {
  console.log("did I get the refresh token?", refreshToken);
  console.log("did I get the expiration Date?", expirationDate);

  let response = await SendYNABRequest(post, OAUTH_BASE_URL + "/token", {
    client_id: CLIENT_ID,
    client_secret: CLIENT_SECRET,
    grant_type: "refresh_token",
    refresh_token: refreshToken,
  });
  let formatted = await FormatAccessTokenDetails(response.data);

  return {
    data: formatted,
    connDetails: formatted,
  };
}

export async function GetDefaultBudgetID(params) {
  console.log("getting default budget id");
  let response = await SendYNABRequest(
    get,
    API_BASE_URL + "/budgets/default",
    params
  );
  console.log("ynab repsnose", response);

  let budgetData = response.data.data.budget;

  let defaultBudgetID = budgetData.id;
  return GetResponseWithTokenDetails(defaultBudgetID, response);
}

export async function GetBudgets(params) {
  let response = await SendYNABRequest(get, API_BASE_URL + "/budgets", params);
  let budgetData = response.data.data.budgets;

  let myBudgetData = [];
  for (let i = 0; i < budgetData.length; i++) {
    myBudgetData.push({
      id: budgetData[i].id,
      name: budgetData[i].name,
    });
  }

  return GetResponseWithTokenDetails(myBudgetData, response);
}

export async function GetBudgetName(params) {
  let response = await SendYNABRequest(
    get,
    API_BASE_URL + "/budgets/" + params.budgetID,
    params
  );

  return GetResponseWithTokenDetails(response.data.data.budget.name, response);
}

export async function GetBudgetMonths(params) {
  let response = await SendYNABRequest(
    get,
    API_BASE_URL + "/budgets/" + params.budgetID,
    params
  );

  let budgetMonthData = response.data.data.budget;

  let budgetCatGroups = budgetMonthData.category_groups;
  let categoryGroups = budgetCatGroups.filter((catGroup) => {
    if (
      !catGroup.hidden &&
      !catGroup.deleted &&
      !IGNORED_CATEGORY_GROUPS.includes(catGroup.name)
    ) {
      return {
        id: catGroup.id,
        name: catGroup.name,
      };
    }
  });

  let today = new Date();
  today.setDate(1);
  today.setHours(0);
  today.setMinutes(0);
  today.setSeconds(0);
  today.setMilliseconds(0);

  let myBudgetMonths = [];
  let myCategories = [];
  let currCategory = {};
  let budgetMonths = budgetMonthData.months;
  for (let i = budgetMonths.length - 1; i >= 0; i--) {
    let ynMonth = parseISO(budgetMonths[i].month);
    if (
      ynMonth.getFullYear() > today.getFullYear() ||
      (ynMonth.getFullYear() == today.getFullYear() &&
        ynMonth.getMonth() >= today.getMonth())
    ) {
      myCategories = [];
      for (let j = 0; j < budgetMonths[i].categories.length; j++) {
        currCategory = budgetMonths[i].categories[j];

        let goodGroup = categoryGroups.find(
          (group) => group.id === currCategory.category_group_id
        );
        if (goodGroup && !currCategory.hidden && !currCategory.deleted) {
          myCategories.push({
            categoryGroupID: goodGroup.id,
            categoryGroupName: goodGroup.name,
            categoryID: currCategory.id,
            name: currCategory.name,
            budgeted: currCategory.budgeted / 1000,
            activity: currCategory.activity / 1000,
            available: currCategory.balance / 1000,
          });
        }
      }

      let newBudgetMonth = {
        month: budgetMonths[i].month,
        categories: myCategories,
      };
      myBudgetMonths.push(newBudgetMonth);
    }
  }

  // Append 20+ more Budget Months to the end of the list, so that we
  // can work with months greater than the user has budgeted
  if (myBudgetMonths.length > 0) {
    for (let i = 0; i < 50; i++) {
      myBudgetMonths.push({ ...myBudgetMonths[myBudgetMonths.length - 1] });
      myBudgetMonths[myBudgetMonths.length - 1].month = addMonths(
        parseISO(myBudgetMonths[myBudgetMonths.length - 1].month),
        1
      )
        .toISOString()
        .substring(0, 10);
    }
  }

  return GetResponseWithTokenDetails(myBudgetMonths, response);
}

export async function PostCategoryMonth(params) {
  let ynabURI =
    API_BASE_URL +
    "/budgets/" +
    params.budgetID +
    "/months/" +
    params.month +
    "/categories/" +
    params.categoryID;

  let postData = {
    category: {
      budgeted: parseInt(params.newBudgetedAmount * 1000),
    },
  };

  let response = await SendYNABRequest(patch, ynabURI, params, postData);
  console.log("Category Name: " + response.data.data.category.name);

  let postedDataDetails = {
    newAvailableAmount: response.data.data.category.balance / 1000,
  };
  return GetResponseWithTokenDetails(postedDataDetails, response);
}
