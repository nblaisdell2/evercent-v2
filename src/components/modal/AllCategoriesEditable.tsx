import { useMutation, useQuery } from "@apollo/client";
import { CheckIcon } from "@heroicons/react/24/outline";
import React, { useState, useEffect } from "react";
import { UPDATE_CATEGORY_INCLUSION } from "../../graphql/mutations";
import { GET_CATEGORY_GROUPS } from "../../graphql/queries";
import { UserData } from "../../pages";
import Card from "../elements/Card";
import CheckBoxGroup, { CheckboxItem } from "../elements/CheckBoxGroup";

type Props = {
  userData: UserData;
  closeModal: () => void;
  refetchCategories: () => Promise<void>;
};

function AllCategoriesEditable({
  userData,
  closeModal,
  refetchCategories,
}: Props) {
  const { loading, error, data, refetch } = useQuery(GET_CATEGORY_GROUPS, {
    variables: {
      userID: userData.userID,
      accessToken: userData.tokenDetails.accessToken,
      refreshToken: userData.tokenDetails.refreshToken,
      budgetID: userData.budgetID,
    },
  });

  const [saveExcludedCategories] = useMutation(UPDATE_CATEGORY_INCLUSION);

  const onSave = async () => {
    // Get the individual items, not the parent/group items
    const itemsToUpdate = items.filter((itm) => {
      return itm.parentId !== "";
    });

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

    // Update the "Excluded Categories" table in the database
    await saveExcludedCategories({
      variables: {
        userBudgetInput: {
          userID: userData.userID,
          budgetID: userData.budgetID,
        },
        categoriesToUpdate: {
          details: [...toUpdate],
        },
      },
    });

    // Refetch the data on this modal, as well as the categories
    // on the main Budget Helper section
    await refetch();
    await refetchCategories();

    // After the new data has been refetched, close this modal and go back
    // to the Budget Helper section.
    closeModal();
  };

  const createList = (data: any) => {
    if (!data) return [];

    let editableList: CheckboxItem[] = [];
    let currGroup = "";
    let currItem;
    for (let i = 0; i < data.getCategoryGroups.length; i++) {
      currItem = data.getCategoryGroups[i];

      if (currItem.categoryGroupID != currGroup) {
        editableList.push({
          parentId: "",
          id: currItem.categoryGroupID,
          name: currItem.categoryGroupName,
          selected: currItem.included,
        });
        currGroup = currItem.categoryGroupID;
      }

      editableList.push({
        parentId: currItem.categoryGroupID,
        id: currItem.categoryID,
        name: currItem.categoryName,
        selected: currItem.included,
      });
    }

    return editableList;
  };

  const [items, setItems] = useState(createList(data));

  useEffect(() => {
    setItems(createList(data));
  }, [data]);

  if (loading) return <div></div>;

  return (
    <div className="relative flex flex-col items-center text-center h-full">
      <div className="font-extrabold text-3xl">All Categories</div>
      <div className="mt-2 text-sm w-[90%]">
        This is a list of all the categories from YNAB, which are currently
        included on the <br />
        <span className="font-cinzel text-lg">Budget Helper</span> widget.
        <br />
        <br />
        Use the list below to add/remove categories from the chart/table.
      </div>

      <Card className="relative w-full my-2 h-full">
        <div className="absolute p-1 top-1 bottom-1 right-0 left-0 overflow-y-auto">
          <CheckBoxGroup items={items} setItems={setItems} />
        </div>
      </Card>

      <button
        onClick={onSave}
        className={`w-full h-12 bg-gray-300 rounded-md shadow-slate-400 shadow-sm hover:bg-blue-400 hover:text-white`}
      >
        <div className="flex justify-center items-center">
          <CheckIcon className="h-6 w-6 text-green-600 stroke-2" />
          <div className="font-semibold text-sm">Save</div>
        </div>
      </button>
    </div>
  );
}

export default AllCategoriesEditable;
