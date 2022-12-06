import React, { useState } from "react";

import Amounts from "./Amounts";
import BudgetHelperCharts from "./BudgetHelperCharts";
import CategoryList from "./CategoryList";
import SelectedCategory from "./SelectedCategory";

import {
  CategoryListGroup,
  CategoryListItem,
  getGroupAmounts,
  getTotalAmountUsed,
  UserData,
} from "../utils/evercent";

function BudgetHelperFull({
  userData,
  monthlyIncome,
  payFrequency,
  nextPaydate,
  budgetMonths,
  categoryList,
  setCategoryList,
  setChangesMade,
  onSave,
  refetchCategories,
}: {
  userData: UserData;
  monthlyIncome: number;
  payFrequency: string;
  nextPaydate: string;
  budgetMonths: any[];
  categoryList: CategoryListGroup[];
  setCategoryList: (newList: CategoryListGroup[]) => void;
  setChangesMade: (newChanges: boolean) => void;
  onSave: (newCategories: CategoryListGroup[]) => void;
  refetchCategories: () => Promise<void>;
}) {
  const [expandedGroups, setExpandedGroups] = useState<string[]>([]);
  const [selectedCategory, setSelectedCategory] =
    useState<CategoryListItem | null>();

  const updateSelectedCategory = (item: CategoryListItem | null) => {
    if (item) {
      // REFACTOR
      // ==========================================
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
      // ==========================================

      setCategoryList(newCategoryList);
      setChangesMade(true);
    }

    setSelectedCategory(item);
  };

  const amtUsed = getTotalAmountUsed(categoryList);

  return (
    <div className="h-full mx-4 flex flex-col">
      <Amounts monthlyIncome={monthlyIncome} amountUsed={amtUsed} />

      <BudgetHelperCharts
        monthlyIncome={monthlyIncome}
        categoryList={categoryList}
        amountUsed={amtUsed}
      />

      {!selectedCategory ? (
        <CategoryList
          userData={userData}
          refetchCategories={refetchCategories}
          categoryList={categoryList}
          setCategoryList={setCategoryList}
          expandedGroups={expandedGroups}
          setExpandedGroups={setExpandedGroups}
          onSave={onSave}
          selectCategory={setSelectedCategory}
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
  );
}

export default BudgetHelperFull;
