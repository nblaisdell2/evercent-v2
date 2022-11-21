import {
  CheckIcon,
  ChevronDownIcon,
  ChevronRightIcon,
  PencilSquareIcon,
} from "@heroicons/react/24/outline";
import React from "react";
import { UserData } from "../pages";
import { getMoneyString, getPercentString, ModalType } from "../utils/utils";
import { CategoryListGroup, CategoryListItem } from "./BudgetHelperFull";
import Card from "./elements/Card";
import { CheckboxItem } from "./elements/CheckBoxGroup";
import Label from "./elements/Label";
import AllCategoriesEditable from "./modal/AllCategoriesEditable";

type Props = {
  userData: UserData;
  monthlyIncome: number;
  categoryList: CategoryListGroup[];
  showModal: (
    modalContentID: number,
    modalContentToDisplay: JSX.Element
  ) => void;
  closeModal: () => void;
  refetchCategories: () => Promise<void>;
  toggleExpanded: (grp: CategoryListGroup) => void;
  selectCategory: (item: CategoryListItem) => void;
};

function CategoryList({
  userData,
  monthlyIncome,
  categoryList,
  showModal,
  closeModal,
  refetchCategories,
  toggleExpanded,
  selectCategory,
}: Props) {
  const getCategoriesCount = () => {
    return categoryList.reduce((prev, curr) => {
      return prev + curr.categories.length;
    }, 0);
  };

  const groupRow = (grp: CategoryListGroup) => {
    return (
      <div
        key={grp.groupName}
        className="flex justify-between w-full font-bold text-right text-lg hover:bg-gray-300 hover:cursor-pointer hover:rounded-md"
        onClick={() => toggleExpanded(grp)}
      >
        <div className="w-[2%] flex justify-center items-center">
          {grp.isExpanded ? (
            <ChevronDownIcon className="h-6 w-6" />
          ) : (
            <ChevronRightIcon className="h-6 w-6" />
          )}
        </div>
        <div className="w-[26%] text-left">{grp.groupName}</div>
        <div className="w-[7%] flex justify-center"></div>
        <div className="w-[7%] flex justify-center"></div>
        <div className="w-[14%]">{getMoneyString(grp.amount)}</div>
        <div className="w-[14%]">{getMoneyString(grp.extraAmount)}</div>
        <div className="w-[14%]">{getMoneyString(grp.adjustedAmt)}</div>
        <div className="w-[14%]">{getPercentString(grp.percentIncome)}</div>
      </div>
    );
  };

  const categoryRow = (category: CategoryListItem) => {
    return (
      <div
        key={category.name}
        className="flex justify-between w-full font-normal text-right text-lg hover:bg-gray-200 hover:cursor-pointer hover:rounded-md"
        onClick={() => {
          selectCategory(category);
        }}
      >
        <div className="w-[2%]"></div>
        <div className="w-[26%] text-left pl-6">{category.name}</div>
        <div className="w-[7%] flex justify-center">
          {category.isRegularExpense && (
            <CheckIcon className="h-6 w-6 text-green-600 stroke-2" />
          )}
        </div>
        <div className="w-[7%] flex justify-center">
          {category.isUpcomingExpense && (
            <CheckIcon className="h-6 w-6 text-green-600 stroke-2" />
          )}
        </div>
        <div className="w-[14%]">{getMoneyString(category.amount)}</div>
        <div className="w-[14%]">{getMoneyString(category.extraAmount)}</div>
        <div className="w-[14%]">{getMoneyString(category.adjustedAmt)}</div>
        <div className="w-[14%]">
          {getPercentString(category.percentIncome)}
        </div>
      </div>
    );
  };

  return (
    <div className="flex-grow mt-4">
      <Label label="Category List" className="text-xl" />
      <div className="flex">
        <Card className="flex-grow mr-2 p-1">
          <div className="flex justify-between w-full font-bold text-right text-lg">
            <div className="w-[2%]"></div>
            <div className="w-[26%] text-left">Category</div>
            <div className="w-[7%] text-center">Regular?</div>
            <div className="w-[7%] text-center">Upcoming?</div>
            <div className="w-[14%]">Amount</div>
            <div className="w-[14%]">Extra Amount</div>
            <div className="w-[14%]">Adjusted Amount</div>
            <div className="w-[14%]">% of Income</div>
          </div>
          <div className="w-full h-[2px] bg-black"></div>
          <div className=" h-[375px] overflow-y-auto">
            {categoryList.map((category) => {
              const gRow = groupRow(category);
              let cRows;
              if (category.categories.length > 0 && category.isExpanded) {
                cRows = category.categories.map((indCat) => {
                  return categoryRow(indCat);
                });
              }
              return (
                <div key={category.groupName}>
                  {gRow}
                  {cRows}
                </div>
              );
            })}
          </div>
        </Card>
        <div className="flex flex-col justify-evenly items-center p-1">
          <div>
            <Label label="Categories Selected" className="text-xl" />
            <div className="flex justify-center items-center">
              <div className="font-bold text-3xl">{getCategoriesCount()}</div>

              <PencilSquareIcon
                className="h-8 w-8 mt-[1px] stroke-2 hover:cursor-pointer"
                onClick={() => {
                  showModal(
                    ModalType.ALL_CATEGORIES_LIST,
                    <AllCategoriesEditable
                      userData={userData}
                      closeModal={closeModal}
                      refetchCategories={refetchCategories}
                    />
                  );
                }}
              />
            </div>
          </div>

          <button
            onClick={() => {}}
            className={`h-8 w-[95%] bg-gray-300 rounded-md shadow-slate-400 shadow-sm hover:bg-blue-400 hover:text-white`}
          >
            <div className="flex justify-center items-center">
              <CheckIcon className="h-6 w-6 text-green-600 stroke-2" />
              <div className="font-semibold text-sm">Save</div>
            </div>
          </button>
        </div>
      </div>
    </div>
  );
}

export default CategoryList;
