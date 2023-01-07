import React, { useState } from "react";

import BudgetHelperFull from "./widgets/budget-helper/BudgetHelperFull";
import BudgetHelperWidget from "./widgets/budget-helper/BudgetHelperWidget";
import BudgetAutomationFull from "./widgets/budget-automation/BudgetAutomationFull";
import BudgetAutomationWidget from "./widgets/budget-automation/BudgetAutomationWidget";
import RegularExpensesFull from "./widgets/regular/RegularExpensesFull";
import RegularExpensesWidget from "./widgets/regular/RegularExpensesWidget";
import UpcomingExpensesFull from "./widgets/upcoming/UpcomingExpensesFull";
import UpcomingExpensesWidget from "./widgets/upcoming/UpcomingExpensesWidget";

import useModal from "./hooks/useModal";
import { ModalType } from "../utils/utils";
import ModalContent from "./modal/ModalContent";
import UnsavedChangesModal from "./modal/UnsavedChangesModal";

import {
  YNABBugdetMonth,
  CategoryListGroup,
  UserData,
  PostingMonth,
  YNABCategoryGroup,
} from "../utils/evercent";
import { CheckboxItem } from "./elements/HierarchyTable";
import useBudgetHelper from "./hooks/useBudgetHelper";

function MainContent({
  userData,
  categories,
  budgetMonths,
  editableCategoryList,
  updateCategories,
  saveNewExcludedCategories,
  setModalIsShowing,
}: {
  userData: UserData;
  categories: CategoryListGroup[];
  budgetMonths: YNABBugdetMonth[];
  editableCategoryList: YNABCategoryGroup[];
  updateCategories: (
    userID: string,
    budgetID: string,
    categories: CategoryListGroup[]
  ) => Promise<void>;
  saveNewExcludedCategories: (
    userID: string,
    budgetID: string,
    itemsToUpdate: CheckboxItem[]
  ) => Promise<CategoryListGroup[]>;
  setModalIsShowing: (newShow: boolean) => void;
}) {
  // Lets me know which widget is currently selected
  const [currentWidget, setCurrentWidget] = useState(-1);

  const { isOpen, showModal, closeModal } = useModal(setModalIsShowing);
  const {
    isOpen: isOpenWarning,
    showModal: showModalWarning,
    closeModal: closeModalWarning,
  } = useModal();

  const {
    categoryList,
    selectedCategory,
    changesMade,
    setSelectedCategory,
    updateSelectedCategoryAmount,
    toggleSelectedCategoryOptions,
    updateSelectedCategoryExpense,
    updateSelectedCategoryUpcomingAmount,
    saveCategoryList,
    saveExcludedCategories,
    discardChanges,
  } = useBudgetHelper(
    userData,
    categories,
    budgetMonths,
    updateCategories,
    saveNewExcludedCategories
  );

  const onSaveAutomation = async () => {};

  const onExit = async (exitType: "back" | "discard" | "save") => {
    switch (exitType) {
      case "back":
        closeModalWarning();
        break;

      case "discard":
        // reset the category list to before we entered the widget, using the existing data
        discardChanges();

        closeModalWarning();
        closeModal();
        setCurrentWidget(-1);
        break;

      case "save":
        if (currentWidget == ModalType.BUDGET_HELPER) {
          await saveCategoryList();
        } else if (currentWidget == ModalType.BUDGET_AUTOMATION) {
          await onSaveAutomation();
        }

        closeModalWarning();
        closeModal();
        setCurrentWidget(-1);
        break;

      default:
        break;
    }
  };

  const widgetBox = (
    title: string,
    widgetComponent: JSX.Element,
    modalContentID: number,
    modalComponent: JSX.Element
  ) => {
    return (
      <>
        <div
          className="flex flex-col items-center basis-0 sm:basis-[49%] bg-[#F6F9FA] border-2 border-opacity-50 border-[#ACACAC] rounded-lg shadow-md m-1 p-1 hover:cursor-pointer hover:border-opacity-100 h-[250px] sm:h-[49%]"
          onClick={() => {
            setCurrentWidget(modalContentID);
            showModal();
          }}
        >
          <div className="font-cinzel text-3xl">{title}</div>
          <div className="w-full h-full flex justify-center items-center">
            {widgetComponent}
          </div>
        </div>

        {isOpen && currentWidget == modalContentID && (
          <ModalContent
            modalContentID={modalContentID}
            onClose={() => {
              if (
                (modalContentID == ModalType.BUDGET_HELPER ||
                  modalContentID == ModalType.BUDGET_AUTOMATION) &&
                changesMade
              ) {
                showModalWarning();
              } else {
                closeModal();
              }
            }}
          >
            {modalComponent}
          </ModalContent>
        )}
      </>
    );
  };

  const months: PostingMonth[] = [
    { month: "August 2022", amount: 160, percentAmount: 17 },
    { month: "September 2022", amount: 160, percentAmount: 17 },
    { month: "October 2022", amount: 160, percentAmount: 17 },
    { month: "November 2022", amount: 160, percentAmount: 17 },
    { month: "December 2022", amount: 160, percentAmount: 17 },
    { month: "January 2023", amount: 160, percentAmount: 17 },
  ];
  months.push({
    month: "Total",
    amount: months.reduce((prev, curr) => prev + curr.amount, 0),
    percentAmount: months.reduce((prev, curr) => prev + curr.percentAmount, 0),
  });

  if (!categories) {
    return <div className="hidden sm:block bg-[#D1F5FF] h-full w-full"></div>;
  }

  return (
    <div className="w-full h-full bg-[#D1F5FF] flex flex-col sm:flex-row flex-nowrap sm:flex-wrap justify-center">
      <div className="block sm:flex flex-nowrap sm:flex-wrap flex-col sm:flex-row justify-start sm:justify-center w-full sm:w-[80%]">
        {categories && (
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
                selectedCategory={selectedCategory}
                setSelectedCategory={setSelectedCategory}
                updateSelectedCategoryAmount={updateSelectedCategoryAmount}
                toggleSelectedCategoryOptions={toggleSelectedCategoryOptions}
                updateSelectedCategoryExpense={updateSelectedCategoryExpense}
                updateSelectedCategoryUpcomingAmount={
                  updateSelectedCategoryUpcomingAmount
                }
                editableCategoryList={editableCategoryList}
                saveExcludedCategories={saveExcludedCategories}
                onSave={saveCategoryList}
              />
            )}

            {widgetBox(
              "Budget Automation",
              <BudgetAutomationWidget months={months} />,
              ModalType.BUDGET_AUTOMATION,
              <BudgetAutomationFull months={months} closeModal={closeModal} />
            )}

            {widgetBox(
              "Regular Expenses",
              <RegularExpensesWidget />,
              ModalType.REGULAR_EXPENSES,
              <RegularExpensesFull categories={categories} />
            )}

            {widgetBox(
              "Upcoming Expenses",
              <UpcomingExpensesWidget />,
              ModalType.UPCOMING_EXPENSES,
              <UpcomingExpensesFull />
            )}

            {isOpenWarning && (
              <ModalContent
                modalContentID={ModalType.BUDGET_HELPER_CHECK}
                onClose={closeModalWarning}
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
