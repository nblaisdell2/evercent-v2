import React, { useState } from "react";

import Amounts from "./Amounts";
import BudgetHelperCharts from "./BudgetHelperCharts";
import CategoryList from "./CategoryList";
import SelectedCategory from "./SelectedCategory";

import {
  CategoryListGroup,
  CategoryListItem,
  getGroupAmounts,
  UserData,
} from "../utils/evercent";
import { CheckboxItem } from "./elements/CheckBoxGroup";

function BudgetHelperFull({
  userData,
  budgetMonths,
  categoryList,
  setCategoryList,
  setChangesMade,
  onSave,
  saveNewExcludedCategories,
}: {
  userData: UserData;
  budgetMonths: any[];
  categoryList: CategoryListGroup[];
  setCategoryList: (newList: CategoryListGroup[]) => void;
  setChangesMade: (newChanges: boolean) => void;
  onSave: (newCategories: CategoryListGroup[]) => void;
  saveNewExcludedCategories: (
    userID: string,
    budgetID: string,
    itemsToUpdate: CheckboxItem[]
  ) => Promise<CategoryListGroup[]>;
}) {
  const [expandedGroups, setExpandedGroups] = useState<string[]>([]);
  const [selectedCategory, setSelectedCategory] =
    useState<CategoryListItem | null>();

  const updateSelectedCategory = (newCategory: CategoryListItem | null) => {
    if (newCategory) {
      // REFACTOR
      // ==========================================
      let newCategoryList = [...categoryList];
      const groupIdx = newCategoryList.findIndex((grp) => {
        return grp.groupName == newCategory.groupName;
      });
      const newGroup = { ...newCategoryList[groupIdx] };
      const catIdx = newGroup.categories.findIndex((cat) => {
        return cat.name == newCategory.name;
      });
      let newCats = [...newGroup.categories];

      newCats[catIdx] = { ...newCats[catIdx], ...newCategory };
      newCategoryList[groupIdx] = {
        ...newCategoryList[groupIdx],
        categories: newCats,
        ...getGroupAmounts(newCats),
      };
      // ==========================================

      setCategoryList(newCategoryList);
      setChangesMade(true);
    }

    setSelectedCategory(newCategory);
  };

  return (
    <div className="h-full mx-4 flex flex-col">
      <Amounts
        monthlyIncome={userData.monthlyIncome}
        categoryList={categoryList}
        type="full"
      />

      <BudgetHelperCharts
        monthlyIncome={userData.monthlyIncome}
        categoryList={categoryList}
        type="full"
      />

      {!selectedCategory ? (
        <CategoryList
          userData={userData}
          categoryList={categoryList}
          setCategoryList={setCategoryList}
          expandedGroups={expandedGroups}
          setExpandedGroups={setExpandedGroups}
          onSave={onSave}
          saveNewExcludedCategories={saveNewExcludedCategories}
          selectCategory={setSelectedCategory}
        />
      ) : (
        <SelectedCategory
          initialCategory={selectedCategory}
          monthlyIncome={userData.monthlyIncome}
          payFrequency={userData.payFrequency}
          nextPaydate={userData.nextPaydate}
          budgetMonths={budgetMonths}
          updateSelectedCategory={updateSelectedCategory}
        />
      )}
    </div>
  );
}

export default BudgetHelperFull;
