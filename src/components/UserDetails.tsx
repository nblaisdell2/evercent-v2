import React from "react";

import { useQuery } from "@apollo/client";
import { GET_USER_DETAILS } from "../graphql/queries";

import { PencilSquareIcon } from "@heroicons/react/24/outline";

import { differenceInDays, startOfToday } from "date-fns";
import { parseDate, formatDate, ModalType } from "../utils/utils";

import Label from "./elements/Label";
import UpdateUserDetailsModal from "./modal/UpdateUserDetailsModal";

function UserDetails({
  userID,
  budgetID,
  showModal,
  closeModal,
}: {
  userID: string;
  budgetID: string;
  showModal: (modalContentID: number, modalContent: JSX.Element) => void;
  closeModal: () => void;
}) {
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
    <div className="flex items-center justify-evenly w-full sm:w-auto space-x-2 sm:space-x-4 text-center">
      {/* Monthly Income */}
      <div className="flex flex-col items-center">
        <Label label="Monthly Income" />
        <div className="text-green-500 font-bold text-sm sm:text-xl">
          {"$" + monthlyIncome.toString()}
        </div>
      </div>

      {/* Vertical Divider */}
      <div className="w-[1px] h-full bg-gray-400" />

      {/* Pay Frequency */}
      <div className="flex flex-col items-center">
        <Label label="Pay Frequency" />
        <div className="font-bold text-sm sm:text-base">
          {monthlyIncome == 0 ? "----" : payFrequency}
        </div>
      </div>

      {/* Vertical Divider */}
      <div className="w-[1px] h-full bg-gray-400" />

      {/* Next Paydate */}
      <div className="flex flex-col items-center">
        <Label label="Next Paydate" />
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
              <div>{"(" + daysAway + " days)"}</div>
            </div>
          )}
        </div>
      </div>

      {/* Vertical Divider */}
      <div className="w-[1px] h-full bg-gray-400" />

      {/* Edit Icon */}
      <PencilSquareIcon
        className="h-6 sm:h-8 w-6 sm:w-8 -mr-1 sm:mr-0 stroke-2 hover:cursor-pointer"
        onClick={() =>
          showModal(
            ModalType.USER_DETAILS,
            <UpdateUserDetailsModal
              userID={userID}
              budgetID={budgetID}
              monthlyIncome={monthlyIncome}
              payFrequency={payFrequency}
              nextPaydate={nextPaydate}
              refetchUserDetails={refetch}
              closeModal={closeModal}
            />
          )
        }
      />
    </div>
  );
}

export default UserDetails;
