import React, { useEffect, useState } from "react";
import { ModalType } from "../utils/utils";

import BudgetHelperFull from "./BudgetHelperFull";
import BudgetHelperWidget from "./BudgetHelperWidget";
import BudgetAutomationFull from "./BudgetAutomationFull";
import BudgetAutomationWidget from "./BudgetAutomationWidget";
import RegularExpensesFull from "./RegularExpensesFull";
import RegularExpensesWidget from "./RegularExpensesWidget";
import UpcomingExpensesFull from "./UpcomingExpensesFull";
import UpcomingExpensesWidget from "./UpcomingExpensesWidget";
import ModalContent from "./modal/ModalContent";
import useModal from "./hooks/useModal";

import { useMutation } from "@apollo/client";
import { UPDATE_CATEGORIES } from "../graphql/mutations";
import { BudgetMonth, CategoryListGroup, UserData } from "../utils/evercent";
import UnsavedChangesModal from "./modal/UnsavedChangesModal";
import { GET_BUDGET_HELPER_DETAILS } from "../graphql/queries";

function MainContent({
  userData,
  categories,
  refetchCategories,
  budgetMonths,
  setModalIsShowing,
}: {
  userData: UserData;
  categories: CategoryListGroup[];
  refetchCategories: () => Promise<void>;
  budgetMonths: BudgetMonth[];
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

  const [updateCategories] = useMutation(UPDATE_CATEGORIES);

  useEffect(() => {
    setCategoryList(categories);
  }, [categories]);

  const onSave = (newCategories: CategoryListGroup[]) => {
    if (!changesMade) {
      console.log("NO CHANGES!");
      return;
    }

    // Format the categoryList into the format needed for the stored procedure
    // for updating the database.
    let input: { details: any[]; expense: any[]; upcoming: any[] } = {
      details: [],
      expense: [],
      upcoming: [],
    };

    for (let i = 0; i < newCategories.length; i++) {
      for (let j = 0; j < newCategories[i].categories.length; j++) {
        let currCat = newCategories[i].categories[j];
        input.details.push({
          guid: currCat.guid,
          categoryGroupID: currCat.categoryGroupID,
          categoryID: currCat.categoryID,
          amount: currCat.amount,
          extraAmount: currCat.extraAmount,
          isRegularExpense: currCat.isRegularExpense,
          isUpcomingExpense: currCat.isUpcomingExpense,
        });

        if (currCat.isRegularExpense) {
          input.expense.push({
            guid: currCat.guid,
            isMonthly: currCat.regularExpenseDetails.isMonthly,
            nextDueDate: currCat.regularExpenseDetails.nextDueDate,
            expenseMonthsDivisor: currCat.regularExpenseDetails.monthsDivisor,
            repeatFreqNum: currCat.regularExpenseDetails.repeatFreqNum,
            repeatFreqType: currCat.regularExpenseDetails.repeatFreqType,
            includeOnChart: currCat.regularExpenseDetails.includeOnChart,
            multipleTransactions:
              currCat.regularExpenseDetails.multipleTransactions,
          });
        }

        if (currCat.isUpcomingExpense) {
          input.upcoming.push({
            guid: currCat.guid,
            totalExpenseAmount: currCat.upcomingDetails.expenseAmount,
          });
        }
      }
    }

    // Then, run the query/mutation to update the database.
    updateCategories({
      variables: {
        userBudgetInput: {
          userID: userData.userID,
          budgetID: userData.budgetID,
        },
        updateCategoriesInput: input,
      },
      update: (cache, { data: { updateCategories } }) => {
        let newList = newCategories.reduce(
          (prev: CategoryListGroup[], curr) => {
            let catList = curr.categories.map((cat) => {
              return {
                __typename: "Category",
                amount: cat.amount,
                categoryGroupID: cat.categoryGroupID,
                groupName: cat.groupName,
                categoryID: cat.categoryID,
                name: cat.name,
                extraAmount: cat.extraAmount,
                adjustedAmt: cat.adjustedAmt,
                adjustedAmtPlusExtra: cat.adjustedAmtPlusExtra,
                percentIncome: cat.percentIncome,
                guid: cat.guid,
                isRegularExpense: cat.isRegularExpense,
                isUpcomingExpense: cat.isUpcomingExpense,
                regularExpenseDetails: {
                  __typename: "RegularExpenseDetails",
                  guid: cat.guid,
                  includeOnChart: cat?.regularExpenseDetails?.includeOnChart,
                  isMonthly: cat?.regularExpenseDetails?.isMonthly,
                  monthsDivisor: cat?.regularExpenseDetails?.monthsDivisor,
                  multipleTransactions:
                    cat?.regularExpenseDetails?.multipleTransactions,
                  nextDueDate: cat?.regularExpenseDetails?.nextDueDate,
                  repeatFreqNum: cat?.regularExpenseDetails?.repeatFreqNum,
                  repeatFreqType: cat?.regularExpenseDetails?.repeatFreqType,
                },
                upcomingDetails: {
                  __typename: "UpcomingDetails",
                  guid: cat.guid,
                  expenseAmount: cat?.upcomingDetails?.expenseAmount,
                },
                budgetAmounts: {
                  __typename: "BudgetAmounts",
                  budgeted: cat?.budgetAmounts?.budgeted,
                  activity: cat?.budgetAmounts?.activity,
                  available: cat?.budgetAmounts?.available,
                },
              };
            });

            curr = { ...curr, categories: catList };
            return prev.concat(curr);
          },
          []
        );

        cache.writeQuery({
          query: GET_BUDGET_HELPER_DETAILS,
          data: { budgetMonths: budgetMonths, categories: newList },
        });

        // Finally, refetch the data and return back to the Budget Helper screen
        refetchCategories();
        setCategoryList(newList);
      },
    });

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
                monthlyIncome={userData.monthlyIncome}
                payFrequency={userData.payFrequency}
                nextPaydate={userData.nextPaydate}
                refetchCategories={refetchCategories}
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
