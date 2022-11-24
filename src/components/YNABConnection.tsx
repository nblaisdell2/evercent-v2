import React, { useEffect } from "react";
import { useRouter } from "next/router";
import { useInterval } from "usehooks-ts";

import {
  ArrowTopRightOnSquareIcon,
  PencilSquareIcon,
} from "@heroicons/react/24/outline";

import { useLazyQuery, useMutation, useQuery } from "@apollo/client";
import { GET_BUDGET_NAME, GET_YNAB_INITIAL_DETAILS } from "../graphql/queries";
import { REFRESH_YNAB_TOKENS } from "../graphql/mutations";

import { parseDate, ModalType } from "../utils/utils";
import { GetURL_YNABAuthorizationPage, GetURL_YNABBudget } from "../utils/ynab";

import Label from "./elements/Label";
import ChangeBudgetModal from "./modal/ChangeBudgetModal";
import { UserData } from "../pages";
import useModal from "./hooks/useModal";
import ModalContent from "./modal/ModalContent";

function YNABConnection({
  userData,
  refetchUser,
}: {
  userData: UserData;
  refetchUser: () => Promise<void>;
}) {
  const { isOpen, showModal, closeModal } = useModal();

  const router = useRouter();

  const [getYNABInitialDetails] = useLazyQuery(GET_YNAB_INITIAL_DETAILS);
  const [refreshTokens] = useMutation(REFRESH_YNAB_TOKENS);

  const {
    loading: loadingName,
    error: errorName,
    data: budgetName,
  } = useQuery(GET_BUDGET_NAME, {
    variables: {
      userID: userData.userID,
      accessToken: userData.tokenDetails.accessToken,
      refreshToken: userData.tokenDetails.refreshToken,
      budgetID: userData.budgetID,
    },
  });

  const saveNewYNABTokens = async (authCode: string) => {
    let response = await getYNABInitialDetails({
      variables: { userID: userData.userID, authCode: authCode },
    });
    // console.log("response", response);
    // let initialDetails = response.data.getInitialYNABDetails;
    // console.log("initial", initialDetails);

    delete router.query.code;
    router.push(router);

    await refetchUser();
  };

  const refreshYNABTokens = async (newTime: Date) => {
    if (
      newTime > parseDate(userData.tokenDetails.expirationDate) &&
      userData.tokenDetails.refreshToken
    ) {
      console.log("Refreshing Tokens");

      await refreshTokens({
        variables: {
          userID: userData.userID,
          refreshToken: userData.tokenDetails.refreshToken,
          expirationDate: userData.tokenDetails.expirationDate,
        },
      });

      await refetchUser();
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

  const budgetIDFound = !!userData.budgetID;
  const ynabAuthURL = GetURL_YNABAuthorizationPage();
  const ynabBudgetURL = GetURL_YNABBudget(userData.budgetID);

  if (loadingName) {
    return <div>Still Loading...</div>;
  }

  return (
    <>
      {isOpen && (
        <ModalContent
          modalContentID={ModalType.CHANGE_BUDGET}
          onClose={closeModal}
        >
          <ChangeBudgetModal
            currBudgetID={userData.budgetID}
            accessToken={userData.tokenDetails.accessToken}
            refreshToken={userData.tokenDetails.refreshToken}
            userID={userData.userID}
          />
        </ModalContent>
      )}

      <div className="flex">
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
                  onClick={showModal}
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
    </>
  );
}

export default YNABConnection;
