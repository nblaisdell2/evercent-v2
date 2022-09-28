export async function getAPIData(storedProcName, params, isMutation) {
  console.log("GET API DATA");
  console.log("storedProcName", storedProcName);
  console.log("params", params);

  try {
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
    const resp = await Axios({
      method: "GET",
      url: baseURL + "foo",
      data: apiParams,
    });

    let newData = await resp.data["data"];
    return newData;
  } catch (err) {
    console.log("error in getAPIData");
    console.log("  Error Message: " + err.response.data.errMsg);

    return null;
  }
}
