import React, { SetStateAction } from "react";

import Amounts from "./Amounts";
import BudgetHelperCharts from "./BudgetHelperCharts";
import CategoryList from "./CategoryList";
import SelectedCategory from "./SelectedCategory";

import {
  CategoryListGroup,
  CategoryListItem,
  UserData,
} from "../../../utils/evercent";
import { CheckboxItem } from "../../elements/HierarchyTable";
import useHierarchyTable from "../../hooks/useHierarchyTable";

function BudgetHelperFull({
  userData,
  categoryList,
  selectedCategory,
  setSelectedCategory,
  updateSelectedCategoryAmount,
  toggleSelectedCategoryOptions,
  updateSelectedCategoryExpense,
  updateSelectedCategoryUpcomingAmount,
  editableCategoryList,
  onSave,
  saveExcludedCategories,
}: {
  userData: UserData;
  categoryList: CategoryListGroup[];
  selectedCategory: CategoryListItem | null;
  setSelectedCategory: (
    action: SetStateAction<CategoryListItem | null>
  ) => void;
  updateSelectedCategoryAmount: (
    category: CategoryListItem,
    key: "amount" | "extraAmount",
    newAmount: number
  ) => void;
  toggleSelectedCategoryOptions: (
    category: CategoryListItem,
    checked: boolean,
    option: string
  ) => void;
  updateSelectedCategoryExpense: (
    category: CategoryListItem,
    key:
      | "nextDueDate"
      | "isMonthly"
      | "repeatFreqNum"
      | "repeatFreqType"
      | "includeOnChart"
      | "multipleTransactions",
    value: any
  ) => void;
  updateSelectedCategoryUpcomingAmount: (
    category: CategoryListItem,
    newAmount: number
  ) => void;
  editableCategoryList: any;
  onSave: () => Promise<void>;
  saveExcludedCategories: (itemsToUpdate: CheckboxItem[]) => Promise<void>;
}) {
  const createList = (data: CategoryListGroup[]) => {
    if (!data) return [];

    let itemList: CheckboxItem[] = [];
    let currItemGroup;
    let currItemCat;
    for (let i = 0; i < data.length; i++) {
      currItemGroup = data[i];

      itemList.push({
        parentId: "",
        id: currItemGroup.groupID,
        name: currItemGroup.groupName,
        expanded: false,
      });

      for (let j = 0; j < currItemGroup.categories.length; j++) {
        currItemCat = currItemGroup.categories[j];

        itemList.push({
          parentId: currItemGroup.groupID,
          id: currItemCat.categoryID,
          name: currItemCat.name,
        });
      }
    }

    return itemList;
  };
  const hierarchyProps = useHierarchyTable(categoryList, createList);

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
          categoryList={categoryList}
          editableCategoryList={editableCategoryList}
          hierarchyProps={hierarchyProps}
          onSave={onSave}
          saveExcludedCategories={saveExcludedCategories}
          selectCategory={setSelectedCategory}
        />
      ) : (
        <SelectedCategory
          initialCategory={selectedCategory}
          payFrequency={userData.payFrequency}
          nextPaydate={userData.nextPaydate}
          setSelectedCategory={setSelectedCategory}
          updateSelectedCategoryAmount={updateSelectedCategoryAmount}
          toggleSelectedCategoryOptions={toggleSelectedCategoryOptions}
          updateSelectedCategoryExpense={updateSelectedCategoryExpense}
          updateSelectedCategoryUpcomingAmount={
            updateSelectedCategoryUpcomingAmount
          }
        />
      )}
    </div>
  );
}

export default BudgetHelperFull;
