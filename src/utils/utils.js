import Axios from "axios";
import Queries from "../pages/api/resolvers/resolverMapping.json";

const INPUTS_TO_STRING = [
  "updateCategoriesInput",
  "saveAutomationInput",
  "saveLockedResultsInput",
  "savePastResultsInput",
];

export async function getAPIData(storedProcName, params, isMutation) {
  console.log("GET API DATA");
  console.log("storedProcName", storedProcName);
  console.log("params", params);

  const baseURL = process.env.DB_API_HOST;

  let apiParams = { spName: storedProcName, getResults: !isMutation };

  const keys = Object.keys(params);
  for (let i = 0; i < keys.length; i++) {
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

  console.log("URL (GET): " + baseURL + "foo");
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

export function parseDate(isoDateString) {
  if (!isoDateString) return new Date();
  return new Date(isoDateString.replace("T", " ") + "Z");
}
