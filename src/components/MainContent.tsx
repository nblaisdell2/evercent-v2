import React from "react";
import { ModalType } from "../utils/utils";

import BudgetHelperFull from "./BudgetHelperFull";
import BudgetHelperWidget from "./BudgetHelperWidget";
import BudgetAutomationFull from "./BudgetAutomationFull";
import BudgetAutomationWidget from "./BudgetAutomationWidget";
import RegularExpensesFull from "./RegularExpensesFull";
import RegularExpensesWidget from "./RegularExpensesWidget";
import UpcomingExpensesFull from "./UpcomingExpensesFull";
import UpcomingExpensesWidget from "./UpcomingExpensesWidget";

function MainContent({
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
  const widgetBox = (
    title: string,
    component: JSX.Element,
    modalContentID: number,
    modalComponent: JSX.Element
  ) => {
    return (
      <div
        className="flex flex-col items-center basis-0 sm:basis-[49%] bg-[#F6F9FA] border border-[#ACACAC] rounded-lg shadow-md m-1 p-1 hover:cursor-pointer hover:blur-[2px] h-[250px] sm:h-auto"
        onClick={() => showModal(modalContentID, modalComponent)}
      >
        <div className="font-cinzel text-3xl">{title}</div>
        <div className="w-full h-full flex justify-center items-center">
          {component}
        </div>
      </div>
    );
  };

  return (
    <div className="w-full bg-[#D1F5FF] flex flex-col sm:flex-row flex-nowrap sm:flex-wrap justify-center">
      <div className="block sm:flex flex-nowrap sm:flex-wrap flex-col sm:flex-row justify-start sm:justify-center w-full h-full sm:w-[80%]">
        {/* Box 1 - Budget Helper */}
        {widgetBox(
          "Budget Helper",
          <BudgetHelperWidget />,
          ModalType.BUDGET_HELPER,
          <BudgetHelperFull />
        )}

        {/* Box 2 - Budget Automation */}
        {widgetBox(
          "Budget Automation",
          <BudgetAutomationWidget />,
          ModalType.BUDGET_AUTOMATION,
          <BudgetAutomationFull />
        )}

        {/* Box 3 - Regular Expenses */}
        {widgetBox(
          "Regular Expenses",
          <RegularExpensesWidget />,
          ModalType.REGULAR_EXPENSES,
          <RegularExpensesFull />
        )}

        {/* Box 4 - Upcoming Expenses */}
        {widgetBox(
          "Upcoming Expenses",
          <UpcomingExpensesWidget />,
          ModalType.UPCOMING_EXPENSES,
          <UpcomingExpensesFull />
        )}
      </div>
    </div>
  );
}

export default MainContent;
