import { CheckIcon, MinusCircleIcon } from "@heroicons/react/24/outline";
import React, { useState } from "react";
import { PostingMonth } from "../../../utils/evercent";
import { ModalType } from "../../../utils/utils";
import { CheckboxItem } from "../../elements/HierarchyTable";
import MyButton from "../../elements/MyButton";
import useModal from "../../hooks/useModal";
import CancelAutomationModal from "../../modal/CancelAutomationModal";
import ModalContent from "../../modal/ModalContent";
import AmountMonths from "./AmountMonths";
import AutomationOverview from "./AutomationOverview";
import AutomationSchedule from "./AutomationSchedule";
import UpcomingPastList from "./UpcomingPastList";

function BudgetAutomationFull({
  months,
  closeModal,
}: {
  months: PostingMonth[];
  closeModal: () => void;
}) {
  const {
    isOpen: isOpenCancel,
    showModal: showModalCancel,
    closeModal: closeModalCancel,
  } = useModal();

  const [showUpcoming, setShowUpcoming] = useState(true);
  const [selectedItem, setSelectedItem] = useState<CheckboxItem | null>(null);

  const runTimes: any[] = [1, 2, 3, 4, 2, 3, 4, 2, 3, 4];

  const getAutomationButtons = () => {
    return (
      <div className="flex space-x-4 justify-evenly w-full">
        <MyButton
          onClick={closeModal}
          icon={
            <CheckIcon className="h-10 w-10 text-green-600 stroke-2 mr-1" />
          }
          buttonText={"Save & Exit"}
        />
        <MyButton
          onClick={showModalCancel}
          icon={
            <MinusCircleIcon className="h-10 w-10 text-red-600 stroke-2 mr-1" />
          }
          buttonText={"Cancel Automation"}
        />
      </div>
    );
  };

  return (
    <>
      {/* Web Version */}
      <div className="h-full w-full hidden sm:block">
        <div className="flex h-[25%]">
          {/* Top Left - Upcoming/Past */}
          <div className="w-[65%] p-2">
            <UpcomingPastList
              runTimes={runTimes}
              showUpcoming={showUpcoming}
              setShowUpcoming={setShowUpcoming}
              setSelectedItem={setSelectedItem}
            />
          </div>

          {/* Top Right - Schedule */}
          <div className="w-[35%] p-2">
            <AutomationSchedule
              closeModal={closeModal}
              showModalCancel={showModalCancel}
              getAutomationButtons={getAutomationButtons}
            />
          </div>
        </div>

        <div className="flex h-[75%]">
          {/* Bottom Left - Amounts Posted to Budget */}
          <div className="w-[50%] p-2">
            <AmountMonths
              selectedItem={selectedItem}
              setSelectedItem={setSelectedItem}
              showUpcoming={showUpcoming}
            />
          </div>

          {/* Bottom Right - Overview Section */}
          <div className="w-[50%] p-2">
            <AutomationOverview
              selectedItem={selectedItem}
              setSelectedItem={setSelectedItem}
              months={months}
            />
          </div>
        </div>
      </div>

      {/* Mobile Version */}
      <div className="h-full w-full flex flex-col sm:hidden">
        {showUpcoming || (!showUpcoming && !selectedItem) ? (
          <>
            <AutomationSchedule
              closeModal={closeModal}
              showModalCancel={showModalCancel}
              getAutomationButtons={getAutomationButtons}
            />

            <UpcomingPastList
              runTimes={runTimes}
              showUpcoming={showUpcoming}
              setShowUpcoming={setShowUpcoming}
              setSelectedItem={setSelectedItem}
            />

            <AmountMonths
              selectedItem={selectedItem}
              setSelectedItem={setSelectedItem}
              showUpcoming={showUpcoming}
            />

            {getAutomationButtons()}
          </>
        ) : (
          <AutomationOverview
            selectedItem={selectedItem}
            setSelectedItem={setSelectedItem}
            months={months}
          />
        )}
      </div>

      {isOpenCancel && (
        <ModalContent
          onClose={closeModalCancel}
          modalContentID={ModalType.CANCEL_AUTOMATION}
        >
          <CancelAutomationModal closeModal={closeModalCancel} />
        </ModalContent>
      )}
    </>
  );
}

export default BudgetAutomationFull;
