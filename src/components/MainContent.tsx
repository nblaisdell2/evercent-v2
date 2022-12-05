import React, { useState } from "react";
import { ModalType } from "../utils/utils";

import BudgetHelperFull from "./BudgetHelperFull";
import BudgetHelperWidget from "./BudgetHelperWidget";
import BudgetAutomationFull from "./BudgetAutomationFull";
import BudgetAutomationWidget from "./BudgetAutomationWidget";
import RegularExpensesFull from "./RegularExpensesFull";
import RegularExpensesWidget from "./RegularExpensesWidget";
import UpcomingExpensesFull from "./UpcomingExpensesFull";
import UpcomingExpensesWidget from "./UpcomingExpensesWidget";
import { UserData } from "../pages";
import ModalContent from "./modal/ModalContent";
import useModal from "./hooks/useModal";

import { GET_BUDGET_HELPER_DETAILS } from "../graphql/queries";
import { useMutation, useQuery } from "@apollo/client";
import { UPDATE_CATEGORIES } from "../graphql/mutations";
import { CategoryListGroup } from "../utils/evercent";
import UnsavedChangesModal from "./modal/UnsavedChangesModal";

function MainContent({
  userData,
  setModalIsShowing,
}: {
  userData: UserData;
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

  const [categoryList, setCategoryList] = useState<CategoryListGroup[]>([]);
  const [changesMade, setChangesMade] = useState(false);

  const { loading, error, data, refetch } = useQuery(
    GET_BUDGET_HELPER_DETAILS,
    {
      variables: {
        userBudgetInput: {
          userID: userData.userID,
          budgetID: userData.budgetID,
        },
        accessToken: userData.tokenDetails.accessToken,
        refreshToken: userData.tokenDetails.refreshToken,
      },
      onCompleted(data) {
        setCategoryList(data.categories);
      },
    }
  );

  const [updateCategories] = useMutation(UPDATE_CATEGORIES);

  const onSave = () => {
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

    for (let i = 0; i < categoryList.length; i++) {
      for (let j = 0; j < categoryList[i].categories.length; j++) {
        let currCat = categoryList[i].categories[j];
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
        let newList = categoryList.reduce((prev: any, curr) => {
          let catList = curr.categories.map((cat) => {
            return {
              __typename: "Category",
              amount: cat.amount,
              categoryGroupID: cat.categoryGroupID,
              categoryGroupName: cat.groupName,
              categoryID: cat.categoryID,
              categoryName: cat.name,
              extraAmount: cat.extraAmount,
              guid: cat.guid,
              isRegularExpense: cat.isRegularExpense,
              isUpcomingExpense: cat.isUpcomingExpense,
              regularExpenseDetails: {
                __typename: "RegularExpenseDetails",
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
          return [...prev, ...catList];
        }, []);

        cache.writeQuery({
          query: GET_BUDGET_HELPER_DETAILS,
          data: { ...data, categories: newList },
        });

        // Finally, refetch the data and return back to the Budget Helper screen
        refetch();
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
          className="flex flex-col items-center basis-0 sm:basis-[49%] bg-[#F6F9FA] border border-[#ACACAC] rounded-lg shadow-md m-1 p-1 hover:cursor-pointer hover:blur-[2px] h-[250px] sm:h-auto"
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
        setCategoryList(data?.categories);
        closeModalBHWarning();
        closeModalBH();
        break;

      case "save":
        onSave();
        closeModalBHWarning();
        closeModalBH();
        break;

      default:
        break;
    }
  };

  if (loading || !data) {
    return <div></div>;
  }

  console.log("data", data);

  return (
    <div className="w-full bg-[#D1F5FF] flex flex-col sm:flex-row flex-nowrap sm:flex-wrap justify-center">
      <div className="block sm:flex flex-nowrap sm:flex-wrap flex-col sm:flex-row justify-start sm:justify-center w-full h-full sm:w-[80%]">
        {/* Box 1 - Budget Helper */}
        {widgetBox(
          "Budget Helper",
          <BudgetHelperWidget />,
          ModalType.BUDGET_HELPER,
          <BudgetHelperFull
            userData={userData}
            setChangesMade={setChangesMade}
            categoryList={categoryList}
            setCategoryList={setCategoryList}
            budgetMonths={data.budgetMonths}
            monthlyIncome={data.user.monthlyIncome}
            payFrequency={data.user.payFrequency}
            nextPaydate={data.user.nextPaydate}
            refetchCategories={async () => {
              await refetch();
            }}
            onSave={onSave}
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
      </div>
    </div>
  );
}

export default MainContent;
