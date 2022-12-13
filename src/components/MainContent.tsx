import React, { useEffect, useState } from "react";

import BudgetHelperFull from "./BudgetHelperFull";
import BudgetHelperWidget from "./BudgetHelperWidget";
import BudgetAutomationFull from "./BudgetAutomationFull";
import BudgetAutomationWidget from "./BudgetAutomationWidget";
import RegularExpensesFull from "./RegularExpensesFull";
import RegularExpensesWidget from "./RegularExpensesWidget";
import UpcomingExpensesFull from "./UpcomingExpensesFull";
import UpcomingExpensesWidget from "./UpcomingExpensesWidget";

import useModal from "./hooks/useModal";
import ModalContent from "./modal/ModalContent";
import UnsavedChangesModal from "./modal/UnsavedChangesModal";

import { ModalType } from "../utils/utils";
import { BudgetMonth, CategoryListGroup, UserData } from "../utils/evercent";
import { CheckboxItem } from "./elements/CheckBoxGroup";

function MainContent({
  userData,
  categories,
  budgetMonths,
  updateCategories,
  saveNewExcludedCategories,
  setModalIsShowing,
}: {
  userData: UserData;
  categories: CategoryListGroup[];
  budgetMonths: BudgetMonth[];
  updateCategories: (
    userID: string,
    budgetID: string,
    categories: CategoryListGroup[]
  ) => CategoryListGroup[];
  saveNewExcludedCategories: (
    userID: string,
    budgetID: string,
    itemsToUpdate: CheckboxItem[]
  ) => Promise<CategoryListGroup[]>;
  setModalIsShowing: (newShow: boolean) => void;
}) {
  const {
    isOpen: isOpenBH,
    showModal: showModalBH,
    closeModal: closeModalBH,
  } = useModal(setModalIsShowing);
  const {
    isOpen: isOpenBHWarning,
    showModal: showModalBHWarning,
    closeModal: closeModalBHWarning,
  } = useModal(setModalIsShowing);
  const {
    isOpen: isOpenBA,
    showModal: showModalBA,
    closeModal: closeModalBA,
  } = useModal(setModalIsShowing);
  const {
    isOpen: isOpenRE,
    showModal: showModalRE,
    closeModal: closeModalRE,
  } = useModal(setModalIsShowing);
  const {
    isOpen: isOpenUE,
    showModal: showModalUE,
    closeModal: closeModalUE,
  } = useModal(setModalIsShowing);

  const [categoryList, setCategoryList] =
    useState<CategoryListGroup[]>(categories);

  const [changesMade, setChangesMade] = useState(false);

  const onSave = (newCategories: CategoryListGroup[]) => {
    if (!changesMade) {
      console.log("NO CHANGES!");
      return;
    }

    const newList = updateCategories(
      userData.userID,
      userData.budgetID,
      newCategories
    );
    setCategoryList(newList);

    setChangesMade(false);
  };

  const widgetBox = (
    title: string,
    widgetComponent: JSX.Element,
    modalContentID: number,
    modalComponent: JSX.Element,
    modalIsOpen: boolean,
    showModalFn: () => void,
    closeModalFn: () => void
  ) => {
    return (
      <>
        <div
          className="flex flex-col items-center basis-0 sm:basis-[49%] bg-[#F6F9FA] border border-[#ACACAC] rounded-lg shadow-md m-1 p-1 hover:cursor-pointer hover:blur-[2px] h-[250px] sm:h-[49%]"
          onClick={() => showModalFn()}
        >
          <div className="font-cinzel text-3xl">{title}</div>
          <div className="w-full h-full flex justify-center items-center">
            {widgetComponent}
          </div>
        </div>
        {modalIsOpen && (
          <ModalContent
            modalContentID={modalContentID}
            onClose={() => {
              if (modalContentID == ModalType.BUDGET_HELPER && changesMade) {
                showModalBHWarning();
              } else {
                closeModalFn();
              }
            }}
          >
            {modalComponent}
          </ModalContent>
        )}
      </>
    );
  };

  const onExit = (exitType: "back" | "discard" | "save") => {
    switch (exitType) {
      case "back":
        closeModalBHWarning();
        break;

      case "discard":
        setChangesMade(false);
        // reset the category list to before we entered the widget, using the existing data
        setCategoryList(categories);
        closeModalBHWarning();
        closeModalBH();
        break;

      case "save":
        onSave(categoryList);
        closeModalBHWarning();
        closeModalBH();
        break;

      default:
        break;
    }
  };

  if (!categoryList) {
    return <div className="hidden sm:block bg-[#D1F5FF] h-full w-full"></div>;
  }

  return (
    <div className="w-full h-full bg-[#D1F5FF] flex flex-col sm:flex-row flex-nowrap sm:flex-wrap justify-center">
      <div className="block sm:flex flex-nowrap sm:flex-wrap flex-col sm:flex-row justify-start sm:justify-center w-full h-full sm:w-[80%]">
        {categoryList && (
          <>
            {/* Box 1 - Budget Helper */}
            {widgetBox(
              "Budget Helper",
              <BudgetHelperWidget
                monthlyIncome={userData.monthlyIncome}
                categoryList={categoryList}
              />,
              ModalType.BUDGET_HELPER,
              <BudgetHelperFull
                userData={userData}
                categoryList={categoryList}
                setCategoryList={setCategoryList}
                budgetMonths={budgetMonths}
                saveNewExcludedCategories={saveNewExcludedCategories}
                onSave={onSave}
                setChangesMade={setChangesMade}
              />,
              isOpenBH,
              showModalBH,
              closeModalBH
            )}

            {/* Box 2 - Budget Automation */}
            {widgetBox(
              "Budget Automation",
              <BudgetAutomationWidget />,
              ModalType.BUDGET_AUTOMATION,
              <BudgetAutomationFull />,
              isOpenBA,
              showModalBA,
              closeModalBA
            )}

            {/* Box 3 - Regular Expenses */}
            {widgetBox(
              "Regular Expenses",
              <RegularExpensesWidget />,
              ModalType.REGULAR_EXPENSES,
              <RegularExpensesFull />,
              isOpenRE,
              showModalRE,
              closeModalRE
            )}

            {/* Box 4 - Upcoming Expenses */}
            {widgetBox(
              "Upcoming Expenses",
              <UpcomingExpensesWidget />,
              ModalType.UPCOMING_EXPENSES,
              <UpcomingExpensesFull />,
              isOpenUE,
              showModalUE,
              closeModalUE
            )}

            {isOpenBHWarning && (
              <ModalContent
                modalContentID={ModalType.BUDGET_HELPER_CHECK}
                onClose={closeModalBHWarning}
              >
                <UnsavedChangesModal onExit={onExit} />
              </ModalContent>
            )}
          </>
        )}
      </div>
    </div>
  );
}

export default MainContent;
