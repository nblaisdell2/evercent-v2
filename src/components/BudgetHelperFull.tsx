import React, { useState } from "react";

import useModal from "./hooks/useModal";

import Amounts from "./Amounts";
import BudgetHelperCharts from "./BudgetHelperCharts";
import CategoryList from "./CategoryList";
import SelectedCategory from "./SelectedCategory";

import type { UserData } from "../pages";
import ModalContent from "./modal/ModalContent";
import AllCategoriesEditable from "./modal/AllCategoriesEditable";
import { ModalType } from "../utils/utils";

export type RegularExpenseDetails = {
  guid: string;
  isMonthly: boolean;
  nextDueDate: string;
  monthsDivisor: number;
  repeatFreqNum: number;
  repeatFreqType: string;
  includeOnChart: boolean;
  multipleTransactions: boolean;
};

export type UpcomingDetails = {
  guid: string;
  expenseAmount: number;
};

export type BudgetAmounts = {
  budgeted: number;
  activity: number;
  available: number;
};

export type CategoryListItem = {
  guid: string;
  categoryGroupID: string;
  categoryID: string;
  groupName: string;
  name: string;
  amount: number;
  extraAmount: number;
  adjustedAmt: number;
  adjustedAmtPlusExtra: number;
  percentIncome: number;
  isRegularExpense: boolean;
  isUpcomingExpense: boolean;
  regularExpenseDetails: RegularExpenseDetails;
  upcomingDetails: UpcomingDetails;
  budgetAmounts: BudgetAmounts;
};

export type CategoryListGroup = {
  groupName: string;
  isExpanded: boolean;
  amount: number;
  extraAmount: number;
  adjustedAmt: number;
  adjustedAmtPlusExtra: number;
  percentIncome: number;
  categories: CategoryListItem[];
};

function BudgetHelperFull({
  userData,
  monthlyIncome,
  payFrequency,
  nextPaydate,
  budgetMonths,
  categoryList,
  setCategoryList,
  changesMade,
  setChangesMade,
  expandedGroups,
  setExpandedGroups,
  onSave,
  refetchCategories,
  getGroupAmounts,
}: {
  userData: UserData;
  monthlyIncome: number;
  payFrequency: string;
  nextPaydate: string;
  budgetMonths: any[];
  categoryList: CategoryListGroup[];
  setCategoryList: (newList: CategoryListGroup[]) => void;
  changesMade: boolean;
  setChangesMade: (newChanges: boolean) => void;
  expandedGroups: string[];
  setExpandedGroups: any;
  onSave: () => void;
  refetchCategories: () => Promise<void>;
  getGroupAmounts: (categories: CategoryListItem[]) => {
    amount: number;
    extraAmount: number;
    adjustedAmt: number;
    adjustedAmtPlusExtra: number;
    percentIncome: number;
  };
}) {
  const { isOpen, showModal, closeModal } = useModal();

  const [selectedCategory, setSelectedCategory] =
    useState<CategoryListItem | null>();

  const getTotalAmountUsed = () => {
    return categoryList.reduce((prev, curr) => {
      return prev + curr.adjustedAmtPlusExtra;
    }, 0);
  };

  const selectCategory = (category: CategoryListItem | null) => {
    setSelectedCategory(category);
  };

  const updateSelectedCategory = (item: CategoryListItem | null) => {
    if (item) {
      let newCategoryList = [...categoryList];
      const groupIdx = newCategoryList.findIndex((grp) => {
        return grp.groupName == item.groupName;
      });
      const newGroup = { ...newCategoryList[groupIdx] };
      const catIdx = newGroup.categories.findIndex((cat) => {
        return cat.name == item.name;
      });
      let newCats = [...newGroup.categories];

      newCats[catIdx] = { ...newCats[catIdx], ...item };
      newCategoryList[groupIdx] = {
        ...newCategoryList[groupIdx],
        categories: newCats,
        ...getGroupAmounts(newCats),
      };

      setCategoryList(newCategoryList);
      setChangesMade(true);
    }

    setSelectedCategory(item);
  };

  const toggleExpanded = (grp: CategoryListGroup) => {
    let newCategoryList = [...categoryList];

    let existingGroup = newCategoryList.filter((existingGrp) => {
      return existingGrp.groupName == grp.groupName;
    })[0];
    let newToggle = !existingGroup.isExpanded;
    if (newToggle) {
      setExpandedGroups((prev: string[]) => {
        return [...prev, existingGroup.groupName];
      });
    } else {
      setExpandedGroups((prev: string[]) => {
        return prev.filter((grp) => {
          return grp != existingGroup.groupName;
        });
      });
    }
    existingGroup.isExpanded = newToggle;

    setCategoryList(newCategoryList);
  };

  if (!categoryList) return <div></div>;
  console.log("list", categoryList);

  return (
    <>
      {isOpen && (
        <ModalContent
          modalContentID={ModalType.ALL_CATEGORIES_LIST}
          onClose={closeModal}
        >
          <AllCategoriesEditable
            userData={userData}
            refetchCategories={refetchCategories}
            closeModal={closeModal}
          />
        </ModalContent>
      )}

      <div className="h-full mx-4 flex flex-col">
        {/* Amount Section */}
        <Amounts
          monthlyIncome={monthlyIncome}
          amountUsed={getTotalAmountUsed()}
        />

        {/* Charts Section */}
        <BudgetHelperCharts
          monthlyIncome={monthlyIncome}
          categoryList={categoryList}
        />

        {/* Category List / Edit / Save section */}
        {!selectedCategory ? (
          <CategoryList
            userData={userData}
            monthlyIncome={monthlyIncome}
            categoryList={categoryList}
            showModal={showModal}
            closeModal={closeModal}
            refetchCategories={async () => {
              await refetchCategories();
            }}
            onSave={onSave}
            toggleExpanded={toggleExpanded}
            selectCategory={selectCategory}
          />
        ) : (
          <SelectedCategory
            initialCategory={selectedCategory}
            monthlyIncome={monthlyIncome}
            payFrequency={payFrequency}
            nextPaydate={nextPaydate}
            budgetMonths={budgetMonths}
            updateSelectedCategory={updateSelectedCategory}
          />
        )}
      </div>
    </>
  );
}

export default BudgetHelperFull;
