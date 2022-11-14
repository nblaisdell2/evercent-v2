import React from "react";
import { ModalType } from "../utils/utils";

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
          <div>Widget Content</div>,
          ModalType.BUDGET_HELPER,
          <div>Budget Helper</div>
        )}
        {/* {widgetBox("Budget Helper", <BudgetHelperWidget />)} */}

        {/* Box 2 - Budget Automation */}
        {widgetBox(
          "Budget Automation",
          <div>Widget Content</div>,
          ModalType.BUDGET_AUTOMATION,
          <div>Budget Automation</div>
        )}
        {/* {widgetBox("Budget Automation", <BudgetAutomationWidget />)} */}

        {/* Box 3 - Regular Expenses */}
        {widgetBox(
          "Regular Expenses",
          <div>Widget Content</div>,
          ModalType.REGULAR_EXPENSES,
          <div>Regular Expenses</div>
        )}
        {/* {widgetBox("Regular Expenses", <RegularExpensesWidget />)} */}

        {/* Box 4 - Upcoming Expenses */}
        {widgetBox(
          "Upcoming Expenses",
          <div>Widget Content</div>,
          ModalType.UPCOMING_EXPENSES,
          <div>Upcoming Expenses</div>
        )}
        {/* {widgetBox("Upcoming Expenses", <UpcomingExpensesWidget />)} */}
      </div>
    </div>
  );
}

export default MainContent;
