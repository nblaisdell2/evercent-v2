import React, { useState } from "react";
import { CategoryListGroup, getRegularExpenses } from "../../../utils/evercent";
import { ModalType } from "../../../utils/utils";
import useModal from "../../hooks/useModal";
import ModalContent from "../../modal/ModalContent";
import ResetExpensesProgress from "../../modal/ResetExpensesProgress";
import RegularExpenseChart from "./RegularExpenseChart";
import RegularExpenseDetails from "./RegularExpenseDetails";
import RegularExpenseOverview from "./RegularExpenseOverview";

type Props = { categories: CategoryListGroup[] };

function RegularExpensesFull({ categories }: Props) {
  const { isOpen, showModal, closeModal } = useModal();

  const [resetProgress, setResetProgress] = useState(false);

  const regularExpenses = getRegularExpenses(categories);

  return (
    <>
      <div className="h-full flex font-mplus p-2 space-x-0 sm:space-x-2">
        <RegularExpenseChart
          regularExpenses={regularExpenses}
          resetProgress={resetProgress}
        />

        <div className="flex flex-col flex-grow space-y-2">
          <RegularExpenseOverview />

          <RegularExpenseDetails
            resetProgress={resetProgress}
            setResetProgress={setResetProgress}
            showModal={showModal}
          />
        </div>
      </div>

      {isOpen && (
        <ModalContent
          modalContentID={ModalType.RESET_REGULAR_EXPENSES}
          onClose={closeModal}
        >
          <ResetExpensesProgress
            closeModal={closeModal}
            setResetProgress={setResetProgress}
          />
        </ModalContent>
      )}
    </>
  );
}

export default RegularExpensesFull;
