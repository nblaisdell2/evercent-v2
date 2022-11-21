import React, { useEffect, useState } from "react";

import { useQuery } from "@apollo/client";
import { GET_BUDGET_HELPER_DETAILS } from "../graphql/queries";

import useModal from "./hooks/useModal";
import ModalContent from "./modal/ModalContent";

import Amounts from "./Amounts";
import BudgetHelperCharts from "./BudgetHelperCharts";
import CategoryList from "./CategoryList";
import SelectedCategory from "./SelectedCategory";

import type { UserData } from "../pages";
import { calculatePercentage } from "../utils/utils";

export type CategoryListItem = {
  name: string;
  amount: number;
  extraAmount: number;
  adjustedAmt: number;
  percentIncome: number;
  isRegularExpense: boolean;
  isUpcomingExpense: boolean;
};

export type CategoryListGroup = {
  groupName: string;
  isExpanded: boolean;
  amount: number;
  extraAmount: number;
  adjustedAmt: number;
  percentIncome: number;
  categories: CategoryListItem[];
};

function BudgetHelperFull({ userData }: { userData: UserData }) {
  const {
    isOpen,
    modalContentID,
    modalComponentToDisplay,
    showModal,
    closeModal,
  } = useModal();

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

  const [categoryList, setCategoryList] = useState<CategoryListGroup[]>([]);
  const [selectedCategory, setSelectedCategory] =
    useState<CategoryListItem | null>();

  useEffect(() => {
    if (data) {
      setCategoryList(getCategoryList(data.categories));
    }
  }, [data]);

  const getTotalAmountUsed = () => {
    return categoryList.reduce((prev, curr) => {
      return prev + curr.adjustedAmt;
    }, 0);
  };

  const getCategoryList = (categories: any) => {
    let categoryListTemp = [];
    let cats: any[] = [];
    let currGroup = "";
    let amountTotal = 0;
    let extraAmountTotal = 0;
    let adjustedAmtTotal = 0;
    let percentIncomeTotal = 0;
    for (let i = 0; i < categories.length; i++) {
      if (currGroup !== categories[i].categoryGroupName) {
        if (currGroup !== "") {
          categoryListTemp.push({
            groupName: currGroup,
            isExpanded: false,
            amount: amountTotal,
            extraAmount: extraAmountTotal,
            adjustedAmt: adjustedAmtTotal,
            percentIncome: percentIncomeTotal,
            categories: cats,
          });

          cats = [];
          amountTotal = 0;
          extraAmountTotal = 0;
          adjustedAmtTotal = 0;
          percentIncomeTotal = 0;
        }
        currGroup = categories[i].categoryGroupName;
      }

      amountTotal += categories[i].amount;
      extraAmountTotal += categories[i].extraAmount;
      adjustedAmtTotal += categories[i].amount;
      percentIncomeTotal += calculatePercentage(
        categories[i].amount,
        data.user.monthlyIncome
      );

      cats.push({
        name: categories[i].categoryName,
        amount: categories[i].amount,
        extraAmount: categories[i].extraAmount,
        adjustedAmt: categories[i].amount, // TODO: This needs to be adjusted appropriately
        percentIncome: calculatePercentage(
          categories[i].amount,
          data.user.monthlyIncome
        ),
        isRegularExpense: categories[i].isRegularExpense,
        isUpcomingExpense: categories[i].isUpcomingExpense,
      });
    }
    categoryListTemp.push({
      groupName: currGroup,
      isExpanded: false,
      amount: amountTotal,
      extraAmount: extraAmountTotal,
      adjustedAmt: adjustedAmtTotal,
      percentIncome: percentIncomeTotal,
      categories: cats,
    });

    return categoryListTemp;
  };

  const selectCategory = (item: CategoryListItem | null) => {
    setSelectedCategory(item);
  };

  const toggleExpanded = (grp: CategoryListGroup) => {
    let newCategoryList = [...categoryList];

    let existingGroup = newCategoryList.filter((existingGrp) => {
      return existingGrp.groupName == grp.groupName;
    })[0];
    existingGroup.isExpanded = !existingGroup.isExpanded;

    setCategoryList(newCategoryList);
  };

  if (loading || !categoryList) return <div></div>;

  console.log("category data", data);
  console.log("list", categoryList);

  return (
    <>
      {isOpen && (
        <ModalContent
          open={isOpen}
          modalContentID={modalContentID}
          modalComponentToDisplay={modalComponentToDisplay}
          onClose={closeModal}
        />
      )}

      <div className="h-full mx-4 flex flex-col">
        {/* Amount Section */}
        <Amounts
          monthlyIncome={data.user.monthlyIncome}
          amountUsed={getTotalAmountUsed()}
        />

        {/* Charts Section */}
        <BudgetHelperCharts
          monthlyIncome={data.user.monthlyIncome}
          categoryList={categoryList}
        />

        {/* Category List / Edit / Save section */}
        {!selectedCategory ? (
          <CategoryList
            userData={userData}
            monthlyIncome={data.user.monthlyIncome}
            categoryList={categoryList}
            showModal={showModal}
            closeModal={closeModal}
            refetchCategories={async () => {
              await refetch();
            }}
            toggleExpanded={toggleExpanded}
            selectCategory={selectCategory}
          />
        ) : (
          <SelectedCategory
            initialCategory={selectedCategory}
            selectCategory={selectCategory}
          />
        )}
      </div>
    </>
  );
}

export default BudgetHelperFull;
