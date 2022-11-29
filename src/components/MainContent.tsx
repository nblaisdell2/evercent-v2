import React, { useEffect, useState } from "react";
import {
  calculatePercentage,
  getSQLDate,
  ModalType,
  parseDate,
  getAdjustedAmount,
} from "../utils/utils";

import BudgetHelperFull, {
  CategoryListGroup,
  CategoryListItem,
} from "./BudgetHelperFull";
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

import { ExclamationTriangleIcon } from "@heroicons/react/24/solid";
import {
  CheckIcon,
  ArrowLeftIcon,
  XMarkIcon,
} from "@heroicons/react/24/outline";
import { GET_BUDGET_HELPER_DETAILS } from "../graphql/queries";
import { useMutation, useQuery } from "@apollo/client";
import { UPDATE_CATEGORIES } from "../graphql/mutations";

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
    }
  );

  const [updateCategories] = useMutation(UPDATE_CATEGORIES);

  const [categoryList, setCategoryList] = useState<CategoryListGroup[]>([]);
  const [expandedGroups, setExpandedGroups] = useState<string[]>([]);
  const [changesMade, setChangesMade] = useState(false);

  useEffect(() => {
    if (data) {
      setCategoryList(getCategoryList(data.categories));
    }
  }, [data]);

  const getCategoryList = (categoryData: any): CategoryListGroup[] => {
    let categoryListTemp: CategoryListGroup[] = [];
    let cats: CategoryListItem[] = [];
    let currGroup = "";
    for (let i = 0; i < categoryData.length; i++) {
      if (currGroup !== categoryData[i].categoryGroupName) {
        if (currGroup !== "") {
          categoryListTemp.push({
            groupName: currGroup,
            isExpanded: expandedGroups.includes(currGroup),
            categories: cats,
            ...getGroupAmounts(cats),
          });

          cats = [];
        }
        currGroup = categoryData[i].categoryGroupName;
      }

      let adjAmt = getAdjustedAmount(
        categoryData[i],
        data.budgetMonths,
        data.user.nextPaydate
      );

      cats.push({
        guid: categoryData[i].guid,
        categoryGroupID: categoryData[i].categoryGroupID,
        categoryID: categoryData[i].categoryID,
        groupName: currGroup,
        name: categoryData[i].categoryName,
        amount: categoryData[i].amount,
        extraAmount: categoryData[i].extraAmount,
        adjustedAmt: adjAmt,
        adjustedAmtPlusExtra: adjAmt + categoryData[i].extraAmount,
        percentIncome: calculatePercentage(
          adjAmt + categoryData[i].extraAmount,
          data.user.monthlyIncome
        ),
        isRegularExpense: categoryData[i].isRegularExpense,
        isUpcomingExpense: categoryData[i].isUpcomingExpense,
        regularExpenseDetails: {
          guid: categoryData[i].guid,
          isMonthly: categoryData[i].regularExpenseDetails.isMonthly,
          nextDueDate: categoryData[i].regularExpenseDetails.nextDueDate,
          monthsDivisor: categoryData[i].regularExpenseDetails.monthsDivisor,
          repeatFreqNum: categoryData[i].regularExpenseDetails.repeatFreqNum,
          repeatFreqType: categoryData[i].regularExpenseDetails.repeatFreqType,
          includeOnChart: categoryData[i].regularExpenseDetails.includeOnChart,
          multipleTransactions:
            categoryData[i].regularExpenseDetails.multipleTransactions,
        },
        upcomingDetails: {
          guid: categoryData[i].guid,
          expenseAmount: categoryData[i].upcomingDetails.expenseAmount,
        },
        budgetAmounts: {
          budgeted: categoryData[i].budgetAmounts.budgeted,
          activity: categoryData[i].budgetAmounts.activity,
          available: categoryData[i].budgetAmounts.available,
        },
      });
    }
    categoryListTemp.push({
      groupName: currGroup,
      isExpanded: expandedGroups.includes(currGroup),
      categories: cats,
      ...getGroupAmounts(cats),
    });

    return categoryListTemp;
  };

  const getGroupAmounts = (categories: CategoryListItem[]) => {
    return categories.reduce(
      (prev, curr) => {
        return {
          amount: prev.amount + curr.amount,
          extraAmount: prev.extraAmount + curr.extraAmount,
          adjustedAmt: prev.adjustedAmt + curr.adjustedAmt,
          adjustedAmtPlusExtra:
            prev.adjustedAmtPlusExtra + curr.adjustedAmtPlusExtra,
          percentIncome: prev.percentIncome + curr.percentIncome,
        };
      },
      {
        amount: 0,
        extraAmount: 0,
        adjustedAmt: 0,
        adjustedAmtPlusExtra: 0,
        percentIncome: 0,
      }
    );
  };

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
            changesMade={changesMade}
            setChangesMade={setChangesMade}
            budgetMonths={data.budgetMonths}
            categoryList={categoryList}
            setCategoryList={setCategoryList}
            expandedGroups={expandedGroups}
            setExpandedGroups={setExpandedGroups}
            monthlyIncome={data.user.monthlyIncome}
            payFrequency={data.user.payFrequency}
            nextPaydate={data.user.nextPaydate}
            refetchCategories={async () => {
              await refetch();
            }}
            getGroupAmounts={getGroupAmounts}
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
            <div className="flex flex-col items-center h-full w-full">
              <div className="flex items-center mt-6 mb-20">
                <ExclamationTriangleIcon className="h-10 w-10 text-orange-400" />
                <div className="font-bold text-3xl -mt-1">Unsaved Changes!</div>
              </div>
              <div className="mb-10 text-lg text-center">
                Would you like to save the changes before exiting?
              </div>

              <div className="w-full flex flex-col space-y-10 mt-10">
                <button
                  className={`w-full h-20 bg-gray-300 rounded-md shadow-slate-400 shadow-sm hover:bg-blue-400 hover:text-white`}
                  onClick={() => {
                    closeModalBHWarning();
                  }}
                >
                  <div className="flex justify-center items-center">
                    <ArrowLeftIcon className="h-10 w-10 text-black stroke-2 mr-2" />
                    <div className="font-semibold text-2xl">Go Back</div>
                  </div>
                </button>
                <button
                  className={`w-full h-20 bg-gray-300 rounded-md shadow-slate-400 shadow-sm hover:bg-blue-400 hover:text-white`}
                  onClick={() => {
                    setChangesMade(false);
                    // reset the category list to before we entered the widget, using the existing data
                    setCategoryList(getCategoryList(data.categories));
                    closeModalBHWarning();
                    closeModalBH();
                  }}
                >
                  <div className="flex justify-center items-center">
                    <XMarkIcon className="h-10 w-10 text-red-600 stroke-2" />
                    <div className="font-semibold text-2xl">
                      Discard Changes and Exit
                    </div>
                  </div>
                </button>
                <button
                  className={`w-full h-20 bg-gray-300 rounded-md shadow-slate-400 shadow-sm hover:bg-blue-400 hover:text-white`}
                  onClick={() => {
                    onSave();
                    closeModalBHWarning();
                    closeModalBH();
                  }}
                >
                  <div className="flex justify-center items-center">
                    <CheckIcon className="h-10 w-10 text-green-600 stroke-2" />
                    <div className="font-semibold text-2xl">
                      Save Changes and Exit
                    </div>
                  </div>
                </button>
              </div>
            </div>
          </ModalContent>
        )}
      </div>
    </div>
  );
}

export default MainContent;
