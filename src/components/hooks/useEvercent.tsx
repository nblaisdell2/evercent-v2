import { useState } from "react";
import { useUser } from "@auth0/nextjs-auth0";
import { useRouter } from "next/router";

import { useMutation, useQuery } from "@apollo/client";
import { GET_ALL_DATA } from "../../graphql/queries";
import {
  REFRESH_YNAB_TOKENS,
  UPDATE_CATEGORIES,
  UPDATE_CATEGORY_INCLUSION,
  UPDATE_DEFAULT_BUDGET_ID,
  UPDATE_USER_DETAILS,
} from "../../graphql/mutations";

import {
  CategoryListGroup,
  CategoryListItem,
  getInput_UpdateCategories,
  isSameCategory,
  UserData,
} from "../../utils/evercent";
import { generateUUID, parseDate } from "../../utils/utils";
import { CheckboxItem } from "../elements/HierarchyTable";

function useEvercent() {
  const router = useRouter();

  const { user, isLoading, error } = useUser();
  const userEmail = user ? user.email : "";

  const [userData, setUserData] = useState<UserData>({
    userID: "",
    budgetID: "",
    budgetName: "",
    monthlyIncome: 0,
    payFrequency: "",
    nextPaydate: "",
    monthsAheadTarget: 0,
    tokenDetails: {
      accessToken: "",
      refreshToken: "",
      expirationDate: "",
    },
  });
  const [categories, setCategories] = useState<CategoryListGroup[]>([]);
  const [editableCategoryList, setEditableCategoryList] = useState<any[]>([]);

  const {
    loading,
    error: errorID,
    data,
  } = useQuery(GET_ALL_DATA, {
    variables: { userEmail: userEmail, authCode: router?.query?.code },
    onCompleted: (data) => {
      setUserData(data?.getAllData?.userData);
      setCategories(data?.getAllData?.categories);
      setEditableCategoryList(data?.getAllData?.editableCategoryList);

      if (router.query?.code) {
        delete router.query.code;
        router.push(router, undefined, {
          shallow: true,
        });
      }
    },
  });

  const [updateBudgetID] = useMutation(UPDATE_DEFAULT_BUDGET_ID);
  const updateDefaultBudgetID = async (userID: string, newBudgetID: string) => {
    // Run the "UpdateBudgetID" query/mutation
    await updateBudgetID({
      variables: {
        userID: userID,
        newBudgetID: newBudgetID,
      },
    });

    // Reload the entire page
    router.reload();
  };

  const [updateUserDetails] = useMutation(UPDATE_USER_DETAILS);
  const updateUserData = async (newUserData: UserData) => {
    await updateUserDetails({
      variables: {
        userBudgetInput: {
          userID: newUserData.userID,
          budgetID: newUserData.budgetID,
        },
        newMonthlyIncome: newUserData.monthlyIncome,
        payFreq: newUserData.payFrequency,
        nextPaydate: newUserData.nextPaydate,
      },
    });
    setUserData(newUserData);
  };

  const [refreshTokens] = useMutation(REFRESH_YNAB_TOKENS);
  const refreshYNABTokens = async (
    userID: string,
    refreshToken: string,
    expirationDate: string
  ) => {
    if (refreshToken && new Date() > parseDate(expirationDate)) {
      console.log("Refreshing Tokens");

      const mutationData = await refreshTokens({
        variables: {
          userID,
          refreshToken,
          expirationDate,
        },
      });

      const newUserData = {
        ...userData,
        tokenDetails: mutationData.data.refreshYNABTokens,
      };
      setUserData(newUserData);
    }
  };

  const [updateAllCategories] = useMutation(UPDATE_CATEGORIES);
  const updateCategories = async (
    userID: string,
    budgetID: string,
    categories: CategoryListGroup[]
  ): Promise<void> => {
    const input = getInput_UpdateCategories(categories);

    // Then, run the query/mutation to update the database.
    await updateAllCategories({
      variables: {
        userBudgetInput: {
          userID,
          budgetID,
        },
        updateCategoriesInput: input,
      },
    });

    setCategories(categories);
  };

  const [saveExcludedCategories] = useMutation(UPDATE_CATEGORY_INCLUSION);
  const saveNewExcludedCategories = async (
    userID: string,
    budgetID: string,
    itemsToUpdate: CheckboxItem[]
  ) => {
    // Collect the unselected items, format the data appropriately,
    // and add them to an array
    const toUpdate = itemsToUpdate.reduce((curr: any[], item) => {
      if (!item.selected) {
        curr.push({
          categoryGroupID: item.parentId,
          categoryID: item.id,
          included: item.selected,
        });
      }
      return curr;
    }, []);

    const includedItems = itemsToUpdate.filter((item) => item.selected);
    let newCategories: CategoryListGroup[] = [];
    let newGroup = "";
    for (let i = 0; i < includedItems.length; i++) {
      let grp = categories.filter(
        (group: CategoryListGroup) => group.groupID == includedItems[i].parentId
      )[0];
      if (grp && grp.groupName !== newGroup) {
        const includedGroup = includedItems.filter(
          (item) => item.parentId == grp.groupID
        );
        let newCats: CategoryListItem[] = [];
        for (let j = 0; j < includedGroup.length; j++) {
          let currCat = grp.categories.find(
            (cat: CategoryListItem) => cat.categoryID == includedGroup[j].id
          );
          if (currCat) {
            newCats.push({ ...currCat });
          } else {
            newCats.push(
              createCategoryListItem(
                null,
                includedGroup[j].parentId,
                includedGroup[j].id,
                grp.groupName,
                includedGroup[j].name
              )
            );
          }
        }
        grp = {
          ...grp,
          categories: newCats,
        };
        newCategories.push(grp);
        newGroup = grp.groupName;
      }
    }

    // Update the "Excluded Categories" table in the database
    await saveExcludedCategories({
      variables: {
        userBudgetInput: {
          userID,
          budgetID,
        },
        categoriesToUpdate: {
          details: [...toUpdate],
        },
      },
    });

    const newList = editableCategoryList.map((catGroup) => {
      return {
        ...catGroup,
        included: !toUpdate.some((t) => isSameCategory(t, catGroup)),
      };
    });

    setCategories(newCategories);
    setEditableCategoryList(newList);

    return newCategories;
  };

  const createCategoryListItem = (
    cat: CategoryListItem | null,
    categoryGroupID?: string,
    categoryID?: string,
    categoryGroupName?: string,
    categoryName?: string
  ): CategoryListItem => {
    const guid = generateUUID();
    return {
      __typename: cat?.__typename || "Category",
      amount: cat?.amount || 0,
      categoryGroupID: cat?.categoryGroupID || categoryGroupID || "",
      groupName: cat?.groupName || categoryGroupName || "",
      categoryID: cat?.categoryID || categoryID || "",
      name: cat?.name || categoryName || "",
      extraAmount: cat?.extraAmount || 0,
      adjustedAmt: cat?.adjustedAmt || 0,
      adjustedAmtPlusExtra: cat?.adjustedAmtPlusExtra || 0,
      percentIncome: cat?.percentIncome || 0,
      guid: cat?.guid || guid || "",
      isRegularExpense: cat?.isRegularExpense || false,
      isUpcomingExpense: cat?.isUpcomingExpense || false,
      regularExpenseDetails: {
        __typename:
          cat?.regularExpenseDetails?.__typename || "RegularExpenseDetails",
        guid: cat?.guid || guid || "",
        includeOnChart: cat?.regularExpenseDetails?.includeOnChart || false,
        isMonthly: cat?.regularExpenseDetails?.isMonthly || true,
        monthsDivisor: cat?.regularExpenseDetails?.monthsDivisor || 1,
        multipleTransactions:
          cat?.regularExpenseDetails?.multipleTransactions || true,
        nextDueDate:
          cat?.regularExpenseDetails?.nextDueDate || new Date().toISOString(),
        repeatFreqNum: cat?.regularExpenseDetails?.repeatFreqNum || 1,
        repeatFreqType: cat?.regularExpenseDetails?.repeatFreqType || "Months",
      },
      upcomingDetails: {
        __typename: cat?.upcomingDetails?.__typename || "UpcomingDetails",
        guid: cat?.guid || guid || "",
        expenseAmount: cat?.upcomingDetails?.expenseAmount || 0,
      },
      budgetAmounts: {
        __typename: cat?.budgetAmounts?.__typename || "BudgetAmounts",
        budgeted: cat?.budgetAmounts?.budgeted || 0,
        activity: cat?.budgetAmounts?.activity || 0,
        available: cat?.budgetAmounts?.available || 0,
      },
    };
  };

  console.log("useEvercent!!!");
  return {
    loading: loading || isLoading || !userData,
    userEmail,
    userData,
    categories,
    budgetNames: data?.getAllData?.budgetNames,
    budgetMonths: data?.getAllData?.budgetMonths,

    // Header/UserData functions
    refreshYNABTokens,
    updateDefaultBudgetID,
    updateUserData,

    // Budget Helper functions
    editableCategoryList,
    updateCategories,
    saveNewExcludedCategories,

    // Budget Automation functions
    // Regular Expenses functions
  };
}

export default useEvercent;
