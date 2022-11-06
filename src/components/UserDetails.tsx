import React from "react";
import Label from "./elements/Label";
import { PencilSquareIcon } from "@heroicons/react/24/outline";
import { useQuery } from "@apollo/client";
import { GET_USER_DETAILS } from "../graphql/queries";
import { differenceInDays, startOfToday } from "date-fns";
import { parseDate, padTo2Digits, ModalType } from "../utils/utils";
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

  const formatDate = (date: Date): string => {
    return [
      padTo2Digits(date.getMonth() + 1),
      padTo2Digits(date.getDate()),
      date.getFullYear(),
    ].join("/");
  };

  if (loading) return null;

  const { monthlyIncome, nextPaydate, payFrequency } = data.user;
  const daysAway = differenceInDays(parseDate(nextPaydate), startOfToday());

  console.log({
    monthlyIncome,
    payFrequency,
    nextPaydate,
  });

  return (
    <div className="flex items-center space-x-6">
      {/* Monthly Income */}
      <div className="flex flex-col items-center">
        <Label label="Monthly Income" />
        <div className="text-green-500 font-bold text-xl">
          {"$" + monthlyIncome.toString()}
        </div>
      </div>

      {/* Vertical Divider */}
      <div className="w-[1px] h-10 bg-gray-400" />

      {/* Pay Frequency */}
      <div className="flex flex-col items-center">
        <Label label="Pay Frequency" />
        <div className="font-bold">
          {monthlyIncome == 0 ? "----" : payFrequency}
        </div>
      </div>

      {/* Vertical Divider */}
      <div className="w-[1px] h-10 bg-gray-400" />

      {/* Next Paydate */}
      <div className="flex flex-col items-center">
        <Label label="Next Paydate" />
        <div className="font-bold">
          {monthlyIncome == 0
            ? "----"
            : formatDate(parseDate(nextPaydate)) + " (" + daysAway + " days)"}
        </div>
      </div>

      {/* Edit Icon */}
      <PencilSquareIcon
        className="h-8 w-8 stroke-2 hover:cursor-pointer"
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
