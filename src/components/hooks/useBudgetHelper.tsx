import { useState } from "react";
import {
  CategoryListGroup,
  CategoryListItem,
  getGroupAmounts,
  toggleCategoryOptions,
  updateCategoryAmount,
  updateCategoryExpenseDetails,
  UserData,
  YNABBugdetMonth,
} from "../../utils/evercent";
import { CheckboxItem } from "../elements/HierarchyTable";

function useBudgetHelper(
  userData: UserData,
  categoryListStart: CategoryListGroup[],
  budgetMonths: YNABBugdetMonth[],
  saveCategoriesDB: (
    userID: string,
    budgetID: string,
    categories: CategoryListGroup[]
  ) => Promise<void>,
  saveNewExcludedCategories: (
    userID: string,
    budgetID: string,
    itemsToUpdate: CheckboxItem[]
  ) => Promise<CategoryListGroup[]>
) {
  const [preCategoryList, setPreCategoryList] = useState(categoryListStart);

  const [categoryList, setCategoryList] = useState(categoryListStart);
  const [selectedCategory, setSelectedCategory] =
    useState<CategoryListItem | null>(null);

  const [changesMade, setChangesMade] = useState(false);

  const updateSelectedCategoryAmount = (
    category: CategoryListItem,
    key: "amount" | "extraAmount",
    newAmount: number
  ) => {
    const newCategory = updateCategoryAmount(
      category,
      key,
      newAmount,
      budgetMonths,
      userData.monthlyIncome,
      userData.nextPaydate
    );
    updateSelectedCategory(newCategory);
  };

  const toggleSelectedCategoryOptions = (
    category: CategoryListItem,
    checked: boolean,
    option: string
  ) => {
    const newCategory = toggleCategoryOptions(
      category,
      checked,
      option,
      budgetMonths,
      userData.monthlyIncome,
      userData.nextPaydate
    );
    updateSelectedCategory(newCategory);
  };

  const updateSelectedCategoryExpense = (
    category: CategoryListItem,
    key:
      | "nextDueDate"
      | "isMonthly"
      | "repeatFreqNum"
      | "repeatFreqType"
      | "includeOnChart"
      | "multipleTransactions",
    value: any
  ) => {
    const newCategory = updateCategoryExpenseDetails(
      category,
      key,
      value,
      budgetMonths,
      userData.monthlyIncome,
      userData.nextPaydate
    );
    updateSelectedCategory(newCategory);
  };

  const updateSelectedCategoryUpcomingAmount = (
    category: CategoryListItem,
    newAmount: number
  ) => {
    const newCategory = {
      ...category,
      upcomingDetails: {
        ...category.upcomingDetails,
        expenseAmount: newAmount,
      },
    };
    updateSelectedCategory(newCategory);
  };

  const updateSelectedCategory = (newCategory: CategoryListItem | null) => {
    if (newCategory) {
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

      setCategoryList(newCategoryList);
      setChangesMade(true);
    }

    setSelectedCategory(newCategory);
  };

  const saveExcludedCategories = async (itemsToUpdate: CheckboxItem[]) => {
    console.log("itemsToUpdate", itemsToUpdate);

    const newCategories = await saveNewExcludedCategories(
      userData.userID,
      userData.budgetID,
      itemsToUpdate
    );

    console.log("save excluded (state) - new categories", newCategories);
    setCategoryList(newCategories);
    setPreCategoryList(newCategories);
  };

  const saveCategoryList = async () => {
    if (!changesMade) {
      console.log("NO CHANGES!");
      return;
    }

    // save the category list results to the database
    await saveCategoriesDB(userData.userID, userData.budgetID, categoryList);

    // override the preCategoryList so we don't lose the saved changes (locally)
    setPreCategoryList(categoryList);

    updateSelectedCategory(null);
    setChangesMade(false);
  };

  const discardChanges = () => {
    setCategoryList(preCategoryList);

    updateSelectedCategory(null);
    setChangesMade(false);
  };

  return {
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
  };
}

export default useBudgetHelper;
