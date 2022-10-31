import React, { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/router";
import { useInterval } from "usehooks-ts";

import {
  ArrowTopRightOnSquareIcon,
  PencilSquareIcon,
} from "@heroicons/react/24/outline";

import {
  GetURL_YNABAuthorizationPage,
  GetURL_YNABBudget,
} from "../../utils/ynab";
import { useLazyQuery, useMutation, useQuery } from "@apollo/client";
import {
  GET_NEW_ACCESS_TOKEN,
  GET_DEFAULT_BUDGET_ID,
  GET_BUDGET_NAME,
} from "../../graphql/queries";
import {
  REFRESH_YNAB_TOKENS,
  // SAVE_YNAB_TOKENS,
  // UPDATE_DEFAULT_BUDGET_ID,
} from "../../graphql/mutations";
import { parseDate } from "../../utils/utils";

function YNABConnection({
  userID,
  budgetID,
  accessToken,
  refreshToken,
  expirationDate,
  refetchYNABConnDetails,
  refetchUser,
}: {
  userID: string;
  budgetID: string;
  accessToken: string;
  refreshToken: string;
  expirationDate: string;
  refetchYNABConnDetails: () => Promise<void>;
  refetchUser: () => Promise<void>;
}) {
  const router = useRouter();

  const [getNewTokens, { error }] = useLazyQuery(GET_NEW_ACCESS_TOKEN);
  // const [saveTokens] = useMutation(SAVE_YNAB_TOKENS);
  const [getYNABBudgetID] = useLazyQuery(GET_DEFAULT_BUDGET_ID);
  // const [updateBudgetID] = useMutation(UPDATE_DEFAULT_BUDGET_ID);

  const [refreshTokens] = useMutation(REFRESH_YNAB_TOKENS);

  // const [delay, setDelay] = useState<number | null>(10000);

  const {
    loading: loadingName,
    error: errorName,
    data: budgetName,
  } = useQuery(GET_BUDGET_NAME, {
    variables: {
      userID: userID,
      accessToken: accessToken,
      refreshToken: refreshToken,
      budgetID: budgetID,
    },
  });

  const saveNewYNABTokens = async (authCode: string) => {
    console.log("GETTING NEW TOKENS");
    let response = await getNewTokens({
      variables: { userID, authCode },
    });
    if (error) {
      console.log(error);
    }
    console.log(response);
    let tokenDetails = response.data.getNewAccessToken;
    // let tokenDetailInput = { userID, ...tokenDetails };
    // await saveTokens({ variables: tokenDetailInput });

    // Get Budget Details from YNAB (BudgetID/BudgetName)
    // and save the "DefaultBudgetID" to the database
    await getYNABBudgetID({
      variables: {
        userID: userID,
        accessToken: tokenDetails.accessToken,
        refreshToken: tokenDetails.refreshToken,
      },
    });

    // await updateBudgetID({
    //   variables: {
    //     userID: userID,
    //     newBudgetID: newBudgetID.data.getDefaultBudgetID,
    //   },
    // });

    delete router.query.code;
    router.push(router);

    await refetchUser();
    await refetchYNABConnDetails();
  };

  const refreshYNABTokens = async (newTime: Date) => {
    console.log("  refreshYNABTokens");
    console.log({
      refreshToken,
      expirationDate,
    });
    if (newTime > parseDate(expirationDate) && refreshToken) {
      console.log("Refreshing Tokens");

      await refreshTokens({
        variables: {
          userID: userID,
          refreshToken: refreshToken,
          expirationDate: expirationDate,
        },
      });

      await refetchUser();
      await refetchYNABConnDetails();
    }
  };

  useEffect(() => {
    refreshYNABTokens(new Date());
  }, []);

  useEffect(() => {
    if (router.query?.code) {
      saveNewYNABTokens(router.query.code as string);
    }
  }, [router.query?.code]);

  useInterval(() => {
    // setDelay(null);
    refreshYNABTokens(new Date());
    // setDelay(10000);
  }, 10000);

  const budgetIDFound = !!budgetID;
  const ynabAuthURL = GetURL_YNABAuthorizationPage();
  const ynabBudgetURL = GetURL_YNABBudget(budgetID);

  if (loadingName) {
    return <div>Still Loading...</div>;
  }

  console.log("=== RE-RENDERING YNABConnection.tsx ===");

  return (
    <div className="flex">
      <div className="text-center mr-4">
        <div className="font-raleway text-black font-bold underline">
          API Connection
        </div>
        <div
          className={`${
            !budgetIDFound ? "bg-[#E48E0C]" : "bg-green-600"
          } text-white font-semibold rounded-full`}
        >
          {!budgetIDFound ? "Disconnected" : "Connected"}
        </div>
      </div>

      {budgetIDFound ? (
        <>
          <div className="text-center ml-4">
            <div className="font-raleway text-black font-bold underline">
              Current Budget
            </div>
            <div className="flex space-x-1">
              <div className=" font-bold">{budgetName?.budgetName}</div>
              <PencilSquareIcon className="h-6 w-6 stroke-2 hover:cursor-pointer" />

              <div>
                <a
                  target="_blank"
                  href={ynabBudgetURL}
                  rel="noopener noreferrer"
                >
                  <ArrowTopRightOnSquareIcon className="h-6 w-6 stroke-2 hover:cursor-pointer" />
                </a>
              </div>
            </div>
          </div>

          {/* Temporary / Can be removed later */}
          {/* This is to show that the refreshing of the tokens is happening */}
          <div>
            <div>AccToken: {accessToken}</div>
            <div>RefToken: {refreshToken}</div>
            <div>ExpDate: {expirationDate}</div>
          </div>
        </>
      ) : (
        <div className="flex items-center">
          <a href={ynabAuthURL}>
            <div className="ml-4 flex space-x-1 hover:underline hover:cursor-pointer hover:text-blue-400">
              <div className="font-bold">Connect to YNAB</div>
              <ArrowTopRightOnSquareIcon className="h-6 w-6 stroke-2" />
            </div>
          </a>
        </div>
      )}
    </div>
  );
}

export default YNABConnection;
