import React from "react";

import { useQuery } from "@apollo/client";
import { GET_USER_DETAILS } from "../graphql/queries";

import { PencilSquareIcon } from "@heroicons/react/24/outline";

import { differenceInDays, startOfToday } from "date-fns";
import { parseDate, formatDate, ModalType } from "../utils/utils";

import Label from "./elements/Label";
import UpdateUserDetailsModal from "./modal/UpdateUserDetailsModal";
import useModal from "./hooks/useModal";
import ModalContent from "./modal/ModalContent";

function UserDetails({
  userID,
  budgetID,
}: {
  userID: string;
  budgetID: string;
}) {
  const { isOpen, showModal, closeModal } = useModal();

  const { loading, error, data, refetch } = useQuery(GET_USER_DETAILS, {
    variables: {
      userBudgetInput: {
        userID: userID,
        budgetID: budgetID,
      },
    },
  });

  if (loading) return null;

  const { monthlyIncome, nextPaydate, payFrequency } = data.user;
  const daysAway = differenceInDays(parseDate(nextPaydate), startOfToday());

  return (
    <>
      {isOpen && (
        <ModalContent
          modalContentID={ModalType.USER_DETAILS}
          onClose={closeModal}
        >
          <UpdateUserDetailsModal
            userID={userID}
            budgetID={budgetID}
            monthlyIncome={monthlyIncome}
            payFrequency={payFrequency}
            nextPaydate={nextPaydate}
            refetchUserDetails={refetch}
            closeModal={closeModal}
          />
        </ModalContent>
      )}
      <div className="flex items-center justify-evenly w-full sm:w-auto sm:space-x-4 text-center">
        {/* Monthly Income */}
        <div className="flex flex-col items-center h-full justify-start">
          <Label label="Monthly Income" className="text-sm" />
          <div className="text-green-500 font-bold text-base sm:text-xl">
            {"$" + monthlyIncome.toString()}
          </div>
        </div>

        {/* Vertical Divider */}
        <div className="w-[1px] h-full bg-gray-400" />

        {/* Pay Frequency */}
        <div className="flex flex-col items-center h-full justify-start">
          <Label label="Pay Frequency" className="text-sm" />
          <div className="font-bold text-sm sm:text-base">
            {monthlyIncome == 0 ? "----" : payFrequency}
          </div>
        </div>

        {/* Vertical Divider */}
        <div className="w-[1px] h-full bg-gray-400" />

        {/* Next Paydate */}
        <div className="flex flex-col items-center h-full justify-start">
          <Label label="Next Paydate" className="text-sm" />
          <div className="hidden sm:block font-bold text-sm sm:text-base">
            {monthlyIncome == 0
              ? "----"
              : formatDate(parseDate(nextPaydate)) + " (" + daysAway + " days)"}
          </div>
          <div className="block sm:hidden font-bold text-sm sm:text-base">
            {monthlyIncome == 0 ? (
              "----"
            ) : (
              <div>
                <div>{formatDate(parseDate(nextPaydate))}</div>
                <div className="text-xs sm:text-base -mt-1 sm:mt-0">
                  {"(" + daysAway + " days)"}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Vertical Divider */}
        <div className="w-[1px] h-full bg-gray-400" />

        {/* Edit Icon */}
        <PencilSquareIcon
          className="h-6 w-6 sm:h-8 sm:w-8 -mr-1 sm:mr-0 stroke-2 hover:cursor-pointer"
          onClick={showModal}
        />
      </div>
    </>
  );
}

export default UserDetails;
