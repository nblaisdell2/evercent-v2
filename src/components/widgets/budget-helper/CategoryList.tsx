import React from "react";
import { CheckIcon, PencilSquareIcon } from "@heroicons/react/24/outline";
import {
  getMoneyString,
  getPercentString,
  ModalType,
} from "../../../utils/utils";
import {
  getCategoriesCount,
  CategoryListGroup,
  CategoryListItem,
  UserData,
} from "../../../utils/evercent";
import Card from "../../elements/Card";
import Label from "../../elements/Label";

import useModal from "../../hooks/useModal";
import ModalContent from "../../modal/ModalContent";
import AllCategoriesEditable from "../../modal/AllCategoriesEditable";
import HierarchyTable, { CheckboxItem } from "../../elements/HierarchyTable";
import useHierarchyTable from "../../hooks/useHierarchyTable";

type Props = {
  userData: UserData;
  categoryList: CategoryListGroup[];
  setCategoryList: (newList: CategoryListGroup[]) => void;
  onSave: (newCategories: CategoryListGroup[]) => Promise<void>;
  saveNewExcludedCategories: (
    userID: string,
    budgetID: string,
    itemsToUpdate: CheckboxItem[]
  ) => Promise<CategoryListGroup[]>;
  selectCategory: (item: CategoryListItem) => void;
};

function CategoryList({
  userData,
  categoryList,
  setCategoryList,
  onSave,
  saveNewExcludedCategories,
  selectCategory,
}: Props) {
  const { isOpen, showModal, closeModal } = useModal();

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

  const createGroupRow = (grp: CategoryListGroup) => {
    return (
      <div
        key={grp.groupName}
        className="flex py-[2px] sm:py-0 w-full font-bold text-right hover:bg-gray-300 hover:cursor-pointer hover:rounded-md"
      >
        <div className="flex w-[50%] sm:w-[26%] text-left">{grp.groupName}</div>
        <div className="hidden sm:block sm:w-[10%] justify-center"></div>
        <div className="hidden sm:block sm:w-[10%] justify-center"></div>
        <div className="hidden sm:block text-right w-[14%]">
          {getMoneyString(grp.amount)}
        </div>
        <div className="hidden sm:block text-right w-[14%]">
          {getMoneyString(grp.adjustedAmt)}
        </div>
        <div className="hidden sm:block text-right w-[14%]">
          {getMoneyString(grp.extraAmount)}
        </div>
        <div className="w-[25%] sm:w-[14%]">
          {getMoneyString(grp.adjustedAmtPlusExtra)}
        </div>
        <div className="w-[25%] sm:w-[14%]">
          {getPercentString(grp.percentIncome)}
        </div>
      </div>
    );
  };

  const createCategoryRow = (category: CategoryListItem) => {
    return (
      <div
        key={category.name}
        className="flex py-[2px] sm:py-0 w-full font-normal text-right text-sm hover:bg-gray-200 hover:cursor-pointer hover:rounded-md"
        onClick={() => {
          selectCategory(category);
        }}
      >
        <div className="w-[50%] sm:w-[26%] text-left">{category.name}</div>
        <div className="hidden sm:flex sm:w-[10%] justify-center">
          {category.isRegularExpense && (
            <CheckIcon className="h-6 w-6 text-green-600 stroke-2" />
          )}
        </div>
        <div className="hidden sm:flex sm:w-[10%] justify-center">
          {category.isUpcomingExpense && (
            <CheckIcon className="h-6 w-6 text-green-600 stroke-2" />
          )}
        </div>
        <div className="hidden sm:block w-[14%]">
          {getMoneyString(category.amount, 2)}
        </div>
        <div className="hidden sm:block w-[14%]">
          {getMoneyString(category.adjustedAmt, 2)}
        </div>
        <div className="hidden sm:block w-[14%]">
          {getMoneyString(category.extraAmount, 2)}
        </div>
        <div className="w-[25%] sm:w-[14%]">
          {getMoneyString(category.adjustedAmtPlusExtra, 2)}
        </div>
        <div className="w-[25%] sm:w-[14%]">
          {getPercentString(category.percentIncome)}
        </div>
      </div>
    );
  };

  const hierarchyTableProps = useHierarchyTable(createList(categoryList));

  const getRowContent = (item: CheckboxItem, indent: number) => {
    const itemID = indent == 0 ? item.id : item.parentId;
    const grp = categoryList.filter((cGrp) => cGrp.groupID == itemID)[0];
    switch (indent) {
      case 0:
        return createGroupRow(grp);
      case 1:
        const category = grp.categories.filter(
          (cat) => cat.categoryID == item.id
        )[0];
        return createCategoryRow(category);
      default:
        return <></>;
    }
  };

  return (
    <div className="flex-grow mt-4  font-mplus text-sm sm:text-base flex flex-col">
      <div className="flex justify-between">
        <div className="flex items-center">
          <Label label="Category List" className="text-xl" />

          <PencilSquareIcon
            className="block ml-1 sm:hidden h-6 w-6 mt-[1px] stroke-2 hover:cursor-pointer"
            onClick={() => {
              showModal();
            }}
          />
        </div>
        <div className="block sm:hidden">
          <button
            onClick={() => onSave(categoryList)}
            className={`h-8 w-[120px] bg-gray-300 rounded-md shadow-slate-400 shadow-sm hover:bg-blue-400 hover:text-white`}
          >
            <div className="flex justify-center items-center">
              <CheckIcon className="h-6 w-6 text-green-600 stroke-2" />
              <div className="font-semibold text-sm">Save</div>
            </div>
          </button>
        </div>
      </div>
      <div className="flex mt-2 h-full">
        <Card className="flex flex-col flex-grow mr-0 sm:mr-2 p-1">
          <div className="flex w-full font-bold text-right whitespace-nowrap border-b-2 border-black">
            <div className="w-[50%] sm:w-[26%] text-left pl-2">Category</div>
            <div className="hidden sm:block w-[10%] text-center">Regular?</div>
            <div className="hidden sm:block w-[10%] text-center">Upcoming?</div>
            <div className="hidden sm:block w-[14%]">Amount</div>
            <div className="hidden sm:block w-[14%]">Adjusted Amt.</div>
            <div className="hidden sm:block w-[14%]">Extra</div>
            <div className="w-[25%] sm:w-[14%]">Adj. + Extra</div>
            <div className="w-[25%] sm:w-[14%]">% Income</div>
          </div>
          <div className="flex-grow h-0 overflow-y-scroll no-scrollbar">
            <HierarchyTable
              tableData={hierarchyTableProps}
              getRowContent={getRowContent}
              indentPixels={"20px"}
              isCollapsible={true}
            />
          </div>
        </Card>
        <div className="hidden sm:flex flex-col justify-evenly items-center p-1">
          <div>
            <Label label="Categories Selected" className="text-xl" />
            <div className="flex justify-center items-center">
              <div className="font-bold text-3xl">
                {getCategoriesCount(categoryList)}
              </div>

              <PencilSquareIcon
                className="h-8 w-8 mt-[1px] stroke-2 hover:cursor-pointer"
                onClick={() => {
                  showModal();
                }}
              />
            </div>
          </div>

          <button
            onClick={() => onSave(categoryList)}
            className={`h-8 w-[95%] bg-gray-300 rounded-md shadow-slate-400 shadow-sm hover:bg-blue-400 hover:text-white`}
          >
            <div className="flex justify-center items-center">
              <CheckIcon className="h-6 w-6 text-green-600 stroke-2" />
              <div className="font-semibold text-sm">Save</div>
            </div>
          </button>
        </div>
      </div>

      {isOpen && (
        <ModalContent
          modalContentID={ModalType.ALL_CATEGORIES_LIST}
          onClose={closeModal}
        >
          <AllCategoriesEditable
            userData={userData}
            saveNewExcludedCategories={saveNewExcludedCategories}
            setCategoryList={setCategoryList}
            closeModal={closeModal}
          />
        </ModalContent>
      )}
    </div>
  );
}

export default CategoryList;
