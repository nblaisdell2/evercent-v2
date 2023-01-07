import {
  CheckIcon,
  MinusCircleIcon,
  PencilSquareIcon,
} from "@heroicons/react/24/outline";
import React from "react";
import { ModalType } from "../../../utils/utils";
import LabelAndValue from "../../elements/LabelAndValue";
import MyButton from "../../elements/MyButton";
import useModal from "../../hooks/useModal";
import AutomationScheduleModal from "../../modal/AutomationScheduleModal";
import CancelAutomationModal from "../../modal/CancelAutomationModal";
import ModalContent from "../../modal/ModalContent";

function AutomationSchedule({
  closeModal,
  showModalCancel,
  getAutomationButtons,
}: {
  closeModal: () => void;
  showModalCancel: () => void;
  getAutomationButtons: () => JSX.Element;
}) {
  const {
    isOpen: isOpenSchedule,
    showModal: showModalSchedule,
    closeModal: closeModalSchedule,
  } = useModal();

  return (
    <>
      <div className="flex flex-col h-auto sm:h-full mt-2 sm:mt-0 border-b sm:border-none border-gray-400 justify-around">
        <div className="flex w-full items-center justify-center mb-1 sm:mb-0">
          <div className="flex font-mplus text-2xl sm:text-3xl font-extrabold">
            Schedule
          </div>
          <PencilSquareIcon
            className="h-8 w-8 stroke-2 ml-1 hover:cursor-pointer"
            onClick={() => {
              showModalSchedule();
            }}
          />
        </div>

        <div className="flex justify-around">
          <div className="w-[50%]">
            <LabelAndValue
              label={"Next Auto Run"}
              value={"08/04/2022"}
              classNameValue={"font-mplus text-lg"}
            />
          </div>
          <div className="w-[50%]">
            <LabelAndValue
              label={"Run Time"}
              value={"7:00AM"}
              classNameValue={"font-mplus text-lg"}
            />
          </div>
          <div className="w-[50%] text-center">
            <LabelAndValue
              label={"Time Left"}
              value={
                <div>
                  <div className="-mb-2">13 days</div>
                  <div>13 hours</div>
                </div>
              }
              classNameValue={"font-mplus text-lg"}
            />
          </div>
        </div>

        <div className="hidden sm:block">{getAutomationButtons()}</div>
      </div>

      {isOpenSchedule && (
        <ModalContent
          onClose={closeModalSchedule}
          modalContentID={ModalType.CHANGE_AUTOMATION_SCHEDULE}
        >
          <AutomationScheduleModal closeModal={closeModalSchedule} />
        </ModalContent>
      )}
    </>
  );
}

export default AutomationSchedule;
