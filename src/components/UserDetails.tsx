import React from "react";

import { PencilSquareIcon } from "@heroicons/react/24/outline";

import { differenceInDays, startOfToday } from "date-fns";
import {
  parseDate,
  formatDate,
  ModalType,
  getMoneyString,
} from "../utils/utils";

import UpdateUserDetailsModal from "./modal/UpdateUserDetailsModal";
import useModal from "./hooks/useModal";
import ModalContent from "./modal/ModalContent";
import { UserData } from "../utils/evercent";
import LabelAndValue from "./elements/LabelAndValue";

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
        <div className="flex flex-col items-center justify-start sm:justify-center h-full">
          <LabelAndValue
            label={"Monthly Income"}
            value={getMoneyString(monthlyIncome)}
            classNameLabel={"text-sm sm:text-md"}
            classNameValue={"text-xl text-green-500"}
          />
        </div>

        {/* Vertical Divider */}
        <div className="w-[1px] h-full bg-gray-400" />

        {/* Pay Frequency */}
        <div className="flex flex-col items-center h-full justify-start sm:justify-center">
          <LabelAndValue
            label={"Pay Frequency"}
            value={monthlyIncome == 0 ? "----" : payFrequency}
            classNameLabel={"text-sm sm:text-md"}
            classNameValue={"text-md"}
          />
        </div>

        {/* Vertical Divider */}
        <div className="w-[1px] h-full bg-gray-400" />

        {/* Next Paydate */}
        <div className="flex flex-col items-center h-full justify-start sm:justify-center">
          <LabelAndValue
            label={"Next Paydate"}
            value={
              <>
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
                        {"(" +
                          daysAwayFromPayday +
                          " " +
                          (daysAwayFromPayday == 1 ? "day" : "days") +
                          ")"}
                      </div>
                    </div>
                  )}
                </div>
              </>
            }
            classNameLabel={"text-sm sm:text-md"}
            classNameValue={"text-md"}
          />
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
