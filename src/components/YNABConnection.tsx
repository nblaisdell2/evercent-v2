import React, { useEffect } from "react";
import { useRouter } from "next/router";
import { useInterval } from "usehooks-ts";

import {
  ArrowTopRightOnSquareIcon,
  PencilSquareIcon,
} from "@heroicons/react/24/outline";

import { useLazyQuery, useMutation, useQuery } from "@apollo/client";
import {
  GET_NEW_ACCESS_TOKEN,
  GET_DEFAULT_BUDGET_ID,
  GET_BUDGET_NAME,
} from "../graphql/queries";
import { REFRESH_YNAB_TOKENS } from "../graphql/mutations";

import { parseDate, ModalType } from "../utils/utils";
import { GetURL_YNABAuthorizationPage, GetURL_YNABBudget } from "../utils/ynab";

import Label from "./elements/Label";
import ChangeBudgetModal from "./modal/ChangeBudgetModal";

function YNABConnection({
  userID,
  budgetID,
  accessToken,
  refreshToken,
  expirationDate,
  refetchYNABConnDetails,
  refetchUser,
  showModal,
}: {
  userID: string;
  budgetID: string;
  accessToken: string;
  refreshToken: string;
  expirationDate: string;
  refetchYNABConnDetails: () => Promise<void>;
  refetchUser: () => Promise<void>;
  showModal: (modalContentID: number, modalContent: JSX.Element) => void;
}) {
  const router = useRouter();

  const [getNewTokens] = useLazyQuery(GET_NEW_ACCESS_TOKEN);
  const [getYNABBudgetID] = useLazyQuery(GET_DEFAULT_BUDGET_ID);
  const [refreshTokens] = useMutation(REFRESH_YNAB_TOKENS);

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
    let response = await getNewTokens({
      variables: { userID, authCode },
    });
    let tokenDetails = response.data.getNewAccessToken;

    // Get Budget Details from YNAB (BudgetID/BudgetName)
    // and save the "DefaultBudgetID" to the database
    await getYNABBudgetID({
      variables: {
        userID: userID,
        accessToken: tokenDetails.accessToken,
        refreshToken: tokenDetails.refreshToken,
      },
    });

    delete router.query.code;
    router.push(router);

    await refetchUser();
    await refetchYNABConnDetails();
  };

  const refreshYNABTokens = async (newTime: Date) => {
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
    if (router.query?.code) {
      saveNewYNABTokens(router.query.code as string);
    }
  }, [router.query?.code]);

  useEffect(() => {
    refreshYNABTokens(new Date());
  }, []);

  useInterval(() => {
    refreshYNABTokens(new Date());
  }, 60000);

  const budgetIDFound = !!budgetID;
  const ynabAuthURL = GetURL_YNABAuthorizationPage();
  const ynabBudgetURL = GetURL_YNABBudget(budgetID);

  if (loadingName) {
    return <div>Still Loading...</div>;
  }

  return (
    <div className="hidden sm:flex">
      <div className="text-center mr-4">
        <Label label={"API Connection"} />
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
            <Label label={"Current Budget"} />
            <div className="flex justify-center space-x-1">
              <div className=" font-bold">{budgetName?.budgetName}</div>
              <PencilSquareIcon
                className="h-6 w-6 stroke-2 hover:cursor-pointer"
                onClick={() =>
                  showModal(
                    ModalType.CHANGE_BUDGET,
                    <ChangeBudgetModal
                      currBudgetID={budgetID}
                      accessToken={accessToken}
                      refreshToken={refreshToken}
                      userID={userID}
                    />
                  )
                }
              />

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
