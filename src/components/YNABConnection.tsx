import React, { useEffect } from "react";
import { useInterval } from "usehooks-ts";

import {
  ArrowTopRightOnSquareIcon,
  PencilSquareIcon,
} from "@heroicons/react/24/outline";

import { ModalType } from "../utils/utils";
import { GetURL_YNABAuthorizationPage, GetURL_YNABBudget } from "../utils/ynab";

import Label from "./elements/Label";
import useModal from "./hooks/useModal";
import ModalContent from "./modal/ModalContent";
import ChangeBudgetModal from "./modal/ChangeBudgetModal";
import { UserData, YNABBudget } from "../utils/evercent";

function YNABConnection({
  userData,
  refreshYNABTokens,
  updateDefaultBudgetID,
}: {
  userData: UserData;
  refreshYNABTokens?: (
    userID: string,
    refreshToken: string,
    expirationDate: string
  ) => Promise<void>;
  updateDefaultBudgetID?: (
    newBudget: YNABBudget,
    userID: string
  ) => Promise<void>;
}) {
  const { isOpen, showModal, closeModal } = useModal();

  useEffect(() => {
    if (refreshYNABTokens)
      refreshYNABTokens(
        userData.userID,
        userData.tokenDetails.refreshToken,
        userData.tokenDetails.expirationDate
      );
  }, []);

  useInterval(() => {
    if (refreshYNABTokens)
      refreshYNABTokens(
        userData.userID,
        userData.tokenDetails.refreshToken,
        userData.tokenDetails.expirationDate
      );
  }, 60000);

  const budgetIDFound = !!userData.budgetName;
  const ynabAuthURL = GetURL_YNABAuthorizationPage();
  const ynabBudgetURL = GetURL_YNABBudget(userData.budgetID);

  return (
    <>
      {isOpen && (
        <ModalContent
          modalContentID={ModalType.CHANGE_BUDGET}
          onClose={closeModal}
        >
          <ChangeBudgetModal
            userData={userData}
            updateDefaultBudgetID={updateDefaultBudgetID}
          />
        </ModalContent>
      )}

      <div className="flex">
        <div className="hidden sm:block text-center mr-4">
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
                <div className=" font-bold">{userData.budgetName}</div>
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
          <div className="flex flex-col sm:flex-row items-center">
            <div className="block sm:hidden text-center font-semibold text-xl">
              <div className="mb-4 px-6">
                Please click the button below to connect Evercent to your YNAB
                Budget account.
              </div>
              <div className="mb-4 px-6">
                This will allow Evercent to pull in all of the categories from
                your budget for planning, automation, etc.
              </div>
            </div>

            <a href={ynabAuthURL}>
              <div className="ml-0 sm:ml-2 flex items-center space-x-1 underline sm:no-underline hover:underline hover:cursor-pointer hover:text-blue-400">
                <div className="font-bold text-3xl sm:text-base">
                  Connect to YNAB
                </div>
                <ArrowTopRightOnSquareIcon className="h-12 sm:h-6 w-12 sm:w-6 stroke-2" />
              </div>
            </a>
          </div>
        )}
      </div>
    </>
  );
}

export default YNABConnection;
