import React from "react";

import { PencilSquareIcon } from "@heroicons/react/24/outline";

import { differenceInDays, startOfToday } from "date-fns";
import {
  parseDate,
  formatDate,
  ModalType,
  getMoneyString,
} from "../utils/utils";

import Label from "./elements/Label";
import UpdateUserDetailsModal from "./modal/UpdateUserDetailsModal";
import useModal from "./hooks/useModal";
import ModalContent from "./modal/ModalContent";
import { UserData } from "../utils/evercent";

function UserDetails({
  userData,
  updateUserData,
}: {
  userData: UserData;
  updateUserData: (newUserData: UserData) => Promise<void>;
}) {
  const { isOpen, showModal, closeModal } = useModal();

  const { monthlyIncome, nextPaydate, payFrequency } = userData;
  const daysAwayFromPayday = differenceInDays(
    parseDate(nextPaydate),
    startOfToday()
  );

  return (
    <>
      {isOpen && (
        <ModalContent
          modalContentID={ModalType.USER_DETAILS}
          onClose={closeModal}
        >
          <UpdateUserDetailsModal
            userData={userData}
            updateUserData={updateUserData}
            closeModal={closeModal}
          />
        </ModalContent>
      )}
      <div className="flex items-center justify-evenly w-full sm:w-auto sm:space-x-4 text-center">
        {/* Monthly Income */}
        <div className="flex flex-col items-center h-full justify-start">
          <Label label="Monthly Income" className="text-sm" />
          <div className="text-green-500 font-bold text-base sm:text-xl">
            {getMoneyString(monthlyIncome)}
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
              : formatDate(parseDate(nextPaydate)) +
                " (" +
                daysAwayFromPayday +
                " " +
                (daysAwayFromPayday == 1 ? "day" : "days") +
                ")"}
          </div>
          <div className="block sm:hidden font-bold text-sm sm:text-base">
            {monthlyIncome == 0 ? (
              "----"
            ) : (
              <div>
                <div>{formatDate(parseDate(nextPaydate))}</div>
                <div className="text-xs sm:text-base -mt-1 sm:mt-0">
                  {"(" + daysAwayFromPayday + " days)"}
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
