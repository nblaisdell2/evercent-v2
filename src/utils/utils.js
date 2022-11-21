import Axios from "axios";
import Queries from "../pages/api/resolvers/resolverMapping.json";

const INPUTS_TO_STRING = [
  "refreshCategoriesInput",
  "updateCategoryInclusionInput",
  "updateCategoriesInput",
  "saveAutomationInput",
  "saveLockedResultsInput",
  "savePastResultsInput",
];

export const ModalType = {
  CHANGE_BUDGET: 0,
  USER_DETAILS: 1,
  RESET_REGULAR_EXPENSES: 2,
  CANCEL_AUTOMATION: 3,
  ALL_CATEGORIES_LIST: 4,
  BUDGET_HELPER: 5,
  BUDGET_AUTOMATION: 6,
  REGULAR_EXPENSES: 7,
  UPCOMING_EXPENSES: 8,
};

// ========================= //
// ====== DATABASES ======== //
// ========================= //
export async function getAPIData(storedProcName, params, isMutation) {
  // console.log("GET API DATA");
  // console.log("storedProcName", storedProcName);
  // console.log("params", params);

  const baseURL = process.env.DB_API_HOST;

  let apiParams = { spName: storedProcName, getResults: !isMutation };

  const keys = Object.keys(params);
  for (let i = 0; i < keys.length; i++) {
    // console.log("keys[i]", keys[i]);
    // console.log("param", params[keys[i]]);
    if (params[keys[i]] instanceof Object) {
      if (INPUTS_TO_STRING.includes(keys[i])) {
        apiParams = {
          ...apiParams,
          [keys[i]]: JSON.stringify(params[keys[i]]),
        };
      } else {
        apiParams = { ...apiParams, ...params[keys[i]] };
      }
    } else {
      apiParams = { ...apiParams, [keys[i]]: params[keys[i]] };
    }
  }

  // console.log("URL (GET): " + baseURL + "foo");
  console.log("apiParams", apiParams);

  return await Axios({
    method: "GET",
    url: baseURL + "foo",
    data: apiParams,
  })
    .then((response) => {
      return response.data.data;
    })
    .catch((err) => {
      console.log("error in getAPIData");
      console.log(err.response.data.errMsg);
    });
}

export async function saveNewYNABTokens(userID, newTokenDetails) {
  if (newTokenDetails) {
    await getAPIData(
      Queries.MUTATION_SAVE_YNAB_TOKENS,
      { userID: userID, ...newTokenDetails },
      true
    );
  }
}

// ========================= //
// ======== DATES ========== //
// ========================= //
export function parseDate(isoDateString) {
  if (!isoDateString) return new Date();
  return new Date(isoDateString.replace("T", " ") + "Z");
}

export function formatDate(date) {
  return [
    padTo2Digits(date.getMonth() + 1),
    padTo2Digits(date.getDate()),
    date.getFullYear(),
  ].join("/");
}

// ========================= //
// ======== NUMBER ========= //
// ========================= //
export function padTo2Digits(num, digits = 2) {
  return num.toString().padStart(digits, "0");
}

export function calculatePercentage(numerator, denominator) {
  if (denominator == 0) {
    return 0;
  }
  return numerator / denominator;
}

// ========================= //
// ======== STRINGS ======== //
// ========================= //
export function getMoneyString(amount) {
  return "$" + amount.toString();
}

export function calculatePercentString(numerator, denominator) {
  const perc = calculatePercentage(numerator, denominator);
  return (perc * 100).toFixed(0) + "%";
}

export function getPercentString(num) {
  return num.toString() + "%";
}
