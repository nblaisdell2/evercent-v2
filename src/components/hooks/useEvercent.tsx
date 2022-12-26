import { useMutation, useQuery } from "@apollo/client";
import { useRouter } from "next/router";
import {
  REFRESH_YNAB_TOKENS,
  UPDATE_CATEGORIES,
  UPDATE_CATEGORY_INCLUSION,
  UPDATE_DEFAULT_BUDGET_ID,
  UPDATE_USER_DETAILS,
} from "../../graphql/mutations";
import {
  GET_BUDGET_HELPER_DETAILS,
  GET_USER_DATA,
} from "../../graphql/queries";
import {
  CategoryListGroup,
  CategoryListItem,
  getInput_UpdateCategories,
  UserData,
  YNABBudget,
} from "../../utils/evercent";
import { parseDate } from "../../utils/utils";
import { clearYNABCache } from "../../utils/ynab";
import { CheckboxItem } from "../elements/HierarchyTable";

function useEvercent(userEmail: string | null | undefined) {
  const router = useRouter();

  const {
    loading,
    error: errorID,
    data,
    refetch,
  } = useQuery(GET_USER_DATA, {
    variables: { userEmail: userEmail, authCode: router?.query?.code },
    onCompleted: () => {
      if (router.query?.code) {
        delete router.query.code;
        router.push(router, undefined, {
          shallow: true,
        });
      }
    },
  });

  const {
    loading: loadingCategories,
    error: errorCategories,
    data: dataCategories,
    // refetch: refetchCats,
  } = useQuery(GET_BUDGET_HELPER_DETAILS, {
    variables: {
      userBudgetInput: {
        userID: data?.userData.userID,
        budgetID: data?.userData.budgetID,
      },
      accessToken: data?.userData.tokenDetails.accessToken,
      refreshToken: data?.userData.tokenDetails.refreshToken,
    },
    skip: loading || !userEmail || !data?.userData.tokenDetails.accessToken,
  });

  const refetchUser = async () => {
    await refetch({ userEmail });
  };

  // const refetchCategories = async () => {
  //   await refetchCats({
  //     userBudgetInput: {
  //       userID: data.userData.userID,
  //       budgetID: data.userData.budgetID,
  //     },
  //     accessToken: data.userData.tokenDetails.accessToken,
  //     refreshToken: data.userData.tokenDetails.refreshToken,
  //   });
  // };

  const [updateBudgetID] = useMutation(UPDATE_DEFAULT_BUDGET_ID);
  const updateDefaultBudgetID = async (
    newBudget: YNABBudget,
    userID: string
  ) => {
    // Run the "UpdateBudgetID" query/mutation
    await updateBudgetID({
      variables: {
        userID: userID,
        newBudgetID: newBudget.id,
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
    await refetchUser();
  };

  const [refreshTokens] = useMutation(REFRESH_YNAB_TOKENS);
  const refreshYNABTokens = async (
    userID: string,
    refreshToken: string,
    expirationDate: string
  ) => {
    if (refreshToken && new Date() > parseDate(expirationDate)) {
      console.log("Refreshing Tokens");

      await refreshTokens({
        variables: {
          userID: userID,
          refreshToken: refreshToken,
          expirationDate: expirationDate,
        },
      });

      await refetchUser();
    }
  };

  const [updateAllCategories] = useMutation(UPDATE_CATEGORIES);
  const updateCategories = async (
    userID: string,
    budgetID: string,
    categories: CategoryListGroup[]
  ): Promise<CategoryListGroup[]> => {
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

    return categories;
  };

  const [saveExcludedCategories] = useMutation(UPDATE_CATEGORY_INCLUSION);
  const saveNewExcludedCategories = async (
    userID: string,
    budgetID: string,
    itemsToUpdate: CheckboxItem[]
  ): Promise<CategoryListGroup[]> => {
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
      let grp = dataCategories?.categories.find(
        (group: CategoryListGroup) => group.groupID == includedItems[i].parentId
      );
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
                newGroup,
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

    clearYNABCache();

    return newCategories;
  };

  const createCategoryListItem = (
    cat: CategoryListItem | null,
    categoryGroupID?: string,
    categoryID?: string,
    categoryGroupName?: string,
    categoryName?: string
  ): CategoryListItem => {
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
      guid: cat?.guid || "",
      isRegularExpense: cat?.isRegularExpense || false,
      isUpcomingExpense: cat?.isUpcomingExpense || false,
      regularExpenseDetails: {
        __typename:
          cat?.regularExpenseDetails?.__typename || "RegularExpenseDetails",
        guid: cat?.guid || "",
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
        guid: cat?.guid || "",
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

  return {
    loading: loading || loadingCategories || !data?.userData,
    userData: data?.userData,
    categories: dataCategories?.categories,
    budgetMonths: dataCategories?.budgetMonths,
    refreshYNABTokens,
    updateDefaultBudgetID,
    updateUserData,
    updateCategories,
    saveNewExcludedCategories,
  };
}

export default useEvercent;
