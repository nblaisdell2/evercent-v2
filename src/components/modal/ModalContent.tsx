import React from "react";
import { XMarkIcon } from "@heroicons/react/24/outline";
import { ModalType } from "../../utils/utils";

type Props = {
  open: boolean;
  modalComponentToDisplay: JSX.Element | undefined;
  modalContentID: number;
  onClose: () => void;
};

const getModalTitle = (modalContentID: number): string => {
  switch (modalContentID) {
    case ModalType.BUDGET_HELPER:
      return "Budget Helper";
    case ModalType.BUDGET_AUTOMATION:
      return "Budget Automation";
    case ModalType.REGULAR_EXPENSES:
      return "Regular Expenses";
    case ModalType.UPCOMING_EXPENSES:
      return "Upcoming Expenses";
    default:
      return "";
  }
};

const getModalBigMode = (modalContentID: number): boolean => {
  return [
    ModalType.BUDGET_HELPER,
    ModalType.BUDGET_AUTOMATION,
    ModalType.REGULAR_EXPENSES,
    ModalType.UPCOMING_EXPENSES,
  ].includes(modalContentID);
};

function ModalContent({
  open,
  modalComponentToDisplay,
  modalContentID,
  onClose,
}: Props) {
  if (!open) return null;

  return (
    <>
      <div
        onClick={onClose}
        className="fixed top-0 bottom-0 left-0 right-0 opacity-70 bg-black z-10"
      />
      <div
        className={`fixed ${
          getModalBigMode(modalContentID)
            ? "top-0 left-0 right-0 bottom-0 rounded-none sm:rounded-md sm:top-16 sm:left-5 sm:right-5 sm:h-[90%]"
            : "top-24 left-2 right-2 bottom-24 sm:top-40 sm:left-96 sm:right-[35%] sm:h-[65%]"
        } bg-[#F6F9FA] rounded-lg p-2 z-20`}
      >
        <div className="flex justify-between" onClick={onClose}>
          <div className="font-cinzel font-light text-3xl">
            {getModalTitle(modalContentID)}
          </div>
          <XMarkIcon className="h-6 w-6 justify-center stroke-2 hover:cursor-pointer hover:text-red-600" />
        </div>
        <div id="modalContent" className="relative h-[95%]">
          {modalComponentToDisplay}
        </div>
      </div>
    </>
  );
}

export default ModalContent;
