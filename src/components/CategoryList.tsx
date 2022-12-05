import React, { useState } from "react";
import {
  CheckIcon,
  ChevronDownIcon,
  ChevronRightIcon,
  PencilSquareIcon,
} from "@heroicons/react/24/outline";
import { getMoneyString, getPercentString, ModalType } from "../utils/utils";
import {
  getCategoriesCount,
  CategoryListGroup,
  CategoryListItem,
} from "../utils/evercent";
import { UserData } from "../pages";
import Card from "./elements/Card";
import Label from "./elements/Label";

import useModal from "./hooks/useModal";
import ModalContent from "./modal/ModalContent";
import AllCategoriesEditable from "./modal/AllCategoriesEditable";

type Props = {
  userData: UserData;
  refetchCategories: () => Promise<void>;
  categoryList: CategoryListGroup[];
  onSave: () => void;
  selectCategory: (item: CategoryListItem) => void;
};

function CategoryList({
  userData,
  refetchCategories,
  categoryList,
  onSave,
  selectCategory,
}: Props) {
  const { isOpen, showModal, closeModal } = useModal();
  const [expandedGroups, setExpandedGroups] = useState<string[]>([]);

  const groupIsExpanded = (grp: CategoryListGroup): boolean => {
    return expandedGroups.includes(grp.groupName);
  };

  const toggleExpanded = (grp: CategoryListGroup) => {
    let newGroups = [...expandedGroups];

    if (newGroups.includes(grp.groupName)) {
      newGroups = newGroups.filter((g) => g != grp.groupName);
    } else {
      newGroups.push(grp.groupName);
    }

    setExpandedGroups(newGroups);
  };

  const groupRow = (grp: CategoryListGroup) => {
    return (
      <div
        key={grp.groupName}
        className="flex w-full font-bold text-right hover:bg-gray-300 hover:cursor-pointer hover:rounded-md"
        onClick={() => toggleExpanded(grp)}
      >
        <div className="w-[5%] sm:w-[2%] flex justify-center items-center">
          {groupIsExpanded(grp) ? (
            <ChevronDownIcon className="h-4 sm:h-6 w-4 sm:w-6" />
          ) : (
            <ChevronRightIcon className="h-4 sm:h-6 w-4 sm:w-6" />
          )}
        </div>
        <div className="w-[50%] sm:w-[26%] text-left">{grp.groupName}</div>
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

  const categoryRow = (category: CategoryListItem) => {
    return (
      <div
        key={category.name}
        className="flex w-full font-normal text-right hover:bg-gray-200 hover:cursor-pointer hover:rounded-md"
        onClick={() => {
          selectCategory(category);
        }}
      >
        <div className="w-[5%] sm:w-[2%]"></div>
        <div className="w-[50%] sm:w-[26%] text-left pl-4 sm:pl-6">
          {category.name}
        </div>
        <div className="hidden sm:block sm:w-[10%] justify-center">
          {category.isRegularExpense && (
            <CheckIcon className="h-6 w-6 text-green-600 stroke-2" />
          )}
        </div>
        <div className="hidden sm:block sm:w-[10%] justify-center">
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

  return (
    <div className="flex-grow mt-4 text-sm sm:text-base">
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
            onClick={onSave}
            className={`h-8 w-[120px] bg-gray-300 rounded-md shadow-slate-400 shadow-sm hover:bg-blue-400 hover:text-white`}
          >
            <div className="flex justify-center items-center">
              <CheckIcon className="h-6 w-6 text-green-600 stroke-2" />
              <div className="font-semibold text-sm">Save</div>
            </div>
          </button>
        </div>
      </div>
      <div className="flex my-2">
        <Card className="h-full flex-grow mr-0 sm:mr-2 p-1">
          <div className="flex w-full font-bold text-right whitespace-nowrap">
            <div className="w-[5%] sm:w-[2%]"></div>
            <div className="w-[50%] sm:w-[26%] text-left">Category</div>
            <div className="hidden sm:block w-[10%] text-center">Regular?</div>
            <div className="hidden sm:block w-[10%] text-center">Upcoming?</div>
            <div className="hidden sm:block w-[14%]">Amount</div>
            <div className="hidden sm:block w-[14%]">Adjusted Amt.</div>
            <div className="hidden sm:block w-[14%]">Extra</div>
            <div className="w-[25%] sm:w-[14%]">Adj. + Extra</div>
            <div className="w-[25%] sm:w-[14%]">% Income</div>
          </div>
          <div className="w-full h-[2px] bg-black"></div>
          <div className="h-[375px] overflow-y-auto no-scrollbar">
            {categoryList.map((category) => {
              const gRow = groupRow(category);
              let cRows;
              if (category.categories.length > 0 && groupIsExpanded(category)) {
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
            onClick={onSave}
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
            refetchCategories={refetchCategories}
            closeModal={closeModal}
          />
        </ModalContent>
      )}
    </div>
  );
}

export default CategoryList;
