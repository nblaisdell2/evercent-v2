import React, { useState } from "react";
import { useQuery } from "@apollo/client";
import { CheckIcon } from "@heroicons/react/24/outline";
import { GET_CATEGORY_GROUPS } from "../../graphql/queries";
import { CategoryListGroup, UserData } from "../../utils/evercent";
import Card from "../elements/Card";
import CheckBoxGroup, { CheckboxItem } from "../elements/CheckBoxGroup";

function AllCategoriesEditable({
  userData,
  closeModal,
  setCategoryList,
  saveNewExcludedCategories,
}: {
  userData: UserData;
  closeModal: () => void;
  setCategoryList: (newList: CategoryListGroup[]) => void;
  saveNewExcludedCategories: (
    userID: string,
    budgetID: string,
    itemsToUpdate: CheckboxItem[]
  ) => Promise<CategoryListGroup[]>;
}) {
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

  const [items, setItems] = useState<CheckboxItem[]>();

  const { loading, error, data, refetch } = useQuery(GET_CATEGORY_GROUPS, {
    variables: {
      userID: userData.userID,
      accessToken: userData.tokenDetails.accessToken,
      refreshToken: userData.tokenDetails.refreshToken,
      budgetID: userData.budgetID,
    },
    onCompleted(data) {
      setItems(createList(data));
    },
  });

  const onSave = async () => {
    if (items) {
      // Get the individual items, not the parent/group items
      const itemsToUpdate = items?.filter((itm) => {
        return itm.parentId !== "";
      });

      const newCategories = await saveNewExcludedCategories(
        userData.userID,
        userData.budgetID,
        itemsToUpdate
      );

      await refetch();

      // After the new data has been refetched, close this modal and go back
      // to the Budget Helper section.
      setCategoryList(newCategories);
      closeModal();
    }
  };

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
        {!loading && items && (
          <div className="absolute p-1 top-1 bottom-1 right-0 left-0 overflow-y-auto">
            <CheckBoxGroup
              items={items}
              setItems={setItems}
              getRowContent={(item: CheckboxItem) => <span>{item.name}</span>}
              showCheckboxes={true}
            />
          </div>
        )}
      </Card>

      {!loading && (
        <button
          onClick={onSave}
          className={`w-full h-12 bg-gray-300 rounded-md shadow-slate-400 shadow-sm hover:bg-blue-400 hover:text-white`}
        >
          <div className="flex justify-center items-center">
            <CheckIcon className="h-6 w-6 text-green-600 stroke-2" />
            <div className="font-semibold text-sm">Save</div>
          </div>
        </button>
      )}
    </div>
  );
}

export default AllCategoriesEditable;
