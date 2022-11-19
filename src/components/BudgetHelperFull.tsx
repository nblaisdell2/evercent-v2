import React from "react";
import Chart from "react-google-charts";
import Label from "./elements/Label";
import {
  PencilSquareIcon,
  CheckIcon,
  ChevronDownIcon,
  ChevronRightIcon,
} from "@heroicons/react/24/outline";
import { ModalType } from "../utils/utils";
import useModal from "./hooks/useModal";
import ModalContent from "./modal/ModalContent";
import AllCategoriesEditable from "./modal/AllCategoriesEditable";
import Card from "./elements/Card";
import type { CheckboxItem } from "./elements/CheckBoxGroup";
import { useMutation, useQuery } from "@apollo/client";
import { GET_CATEGORY_LIST } from "../graphql/queries";
import { UserData } from "../pages";
import { UPDATE_CATEGORY_INCLUSION } from "../graphql/mutations";

function BudgetHelperFull({ userData }: { userData: UserData }) {
  const {
    isOpen,
    modalContentID,
    modalComponentToDisplay,
    showModal,
    closeModal,
  } = useModal();

  const { loading, error, data, refetch } = useQuery(GET_CATEGORY_LIST, {
    variables: {
      userBudgetInput: { userID: userData.userID, budgetID: userData.budgetID },
      accessToken: userData.tokenDetails.accessToken,
      refreshToken: userData.tokenDetails.refreshToken,
    },
  });

  const [saveExcludedCategories] = useMutation(UPDATE_CATEGORY_INCLUSION);

  if (loading) return <div></div>;

  console.log("category data", data);

  let categoryList = [];
  let cats: any[] = [];
  let currGroup = "";
  let amountTotal = 0;
  let extraAmountTotal = 0;
  let adjustedAmtTotal = 0;
  let percentIncomeTotal = 0;
  for (let i = 0; i < data.categories.length; i++) {
    if (currGroup !== data.categories[i].categoryGroupName) {
      if (currGroup !== "") {
        categoryList.push({
          groupName: currGroup,
          isExpanded: false,
          amount: amountTotal,
          extraAmount: extraAmountTotal,
          adjustedAmt: adjustedAmtTotal,
          percentIncome: percentIncomeTotal,
          categories: cats,
        });

        cats = [];
        amountTotal = 0;
        extraAmountTotal = 0;
        adjustedAmtTotal = 0;
        percentIncomeTotal = 0;
      }
      currGroup = data.categories[i].categoryGroupName;
    }

    cats.push({
      name: data.categories[i].categoryName,
      amount: data.categories[i].amount,
      extraAmount: data.categories[i].extraAmount,
      adjustedAmt: data.categories[i].amount, // TODO: This needs to be adjusted appropriately
      percentIncome: 5, // TODO
      isRegularExpense: data.categories[i].isRegularExpense,
      isUpcomingExpense: data.categories[i].isUpcomingExpense,
    });
  }
  categoryList.push({
    groupName: currGroup,
    isExpanded: false,
    amount: amountTotal,
    extraAmount: extraAmountTotal,
    adjustedAmt: adjustedAmtTotal,
    percentIncome: percentIncomeTotal,
    categories: cats,
  });

  console.log("list", categoryList);

  const chartData = [
    ["", "2010 Population", "2000 Population"],
    ["", 8175000, 8008000],
  ];

  const chartOptions = {
    chartArea: { width: "100%", height: "100%", left: "5" },
    bar: { groupWidth: "100%" },
    isStacked: true,
    legend: "none",
    backgroundColor: "transparent",
    hAxis: {
      baselineColor: "transparent",
      textPosition: "none",
      gridlines: { count: 0 },
    },
    animation: {
      startup: true,
      easing: "inAndOut",
      duration: 1500,
    },
  };

  const groupRow = (category: any) => {
    return (
      <div
        key={category.name}
        className="flex justify-between w-full font-bold text-right text-lg hover:bg-gray-300 hover:cursor-pointer hover:rounded-md"
      >
        <div className="w-[2%] flex justify-center items-center">
          {category.isExpanded ? (
            <ChevronDownIcon className="h-6 w-6" />
          ) : (
            <ChevronRightIcon className="h-6 w-6" />
          )}
        </div>
        <div className="w-[26%] text-left">{category.groupName}</div>
        <div className="w-[7%] flex justify-center"></div>
        <div className="w-[7%] flex justify-center"></div>
        <div className="w-[14%]">{"$" + category.amount}</div>
        <div className="w-[14%]">{"$" + category.extraAmount}</div>
        <div className="w-[14%]">{"$" + category.adjustedAmt}</div>
        <div className="w-[14%]">{category.percentIncome + "%"}</div>
      </div>
    );
  };

  const categoryRow = (category: any) => {
    return (
      <div
        key={category.name}
        className="flex justify-between w-full font-normal text-right text-lg hover:bg-gray-200 hover:cursor-pointer hover:rounded-md"
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
        <div className="w-[14%]">{"$" + category.amount}</div>
        <div className="w-[14%]">{"$" + category.extraAmount}</div>
        <div className="w-[14%]">{"$" + category.adjustedAmt}</div>
        <div className="w-[14%]">{category.percentIncome + "%"}</div>
      </div>
    );
  };

  const onSave = async (items: CheckboxItem[]) => {
    let toUpdate = [];
    for (let i = 0; i < items.length; i++) {
      if (!items[i].selected) {
        toUpdate.push({
          categoryGroupID: items[i].parentId,
          categoryID: items[i].id,
          included: items[i].selected,
        });
      }
    }

    console.log("toUpdate", toUpdate);

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

    await refetch();
  };

  return (
    <>
      {isOpen && (
        <ModalContent
          open={isOpen}
          modalContentID={modalContentID}
          modalComponentToDisplay={modalComponentToDisplay}
          onClose={closeModal}
        />
      )}
      <div className="h-full mx-4 flex flex-col">
        {/* Amount Section */}
        <div className="flex justify-end space-x-24">
          <div>
            <div className="flex flex-col items-center">
              <Label label="Monthly Income" className="text-xl" />
              <div className="font-bold text-3xl -mt-1 text-green-500">
                {"$1500"}
              </div>
            </div>
          </div>
          <div>
            <div className="flex flex-col items-center">
              <Label label="Amount Remaining" className="text-xl" />
              <div className="font-bold text-3xl -mt-1">{"$1450"}</div>
            </div>
          </div>
          <div>
            <div className="flex flex-col items-center">
              <Label label="Amount Used" className="text-xl" />
              <div className="font-bold text-3xl -mt-1">{"$50"}</div>
            </div>
          </div>
          <div>
            <div className="flex flex-col items-center">
              <Label label="% Used" className="text-xl" />
              <div className="font-bold text-3xl -mt-1">{"10%"}</div>
            </div>
          </div>
        </div>

        {/* Charts Section */}
        <div className="">
          <div className="">
            <div className="p-1 font-bold">By Category Group</div>
            <Chart
              chartType="BarChart"
              width={"100%"}
              height={"115px"}
              data={chartData}
              options={chartOptions}
            />
          </div>
          <div className="">
            <div className="p-1 font-bold">By Category</div>
            <Chart
              chartType="BarChart"
              width={"100%"}
              height={"115px"}
              data={chartData}
              options={chartOptions}
            />
          </div>
        </div>

        {/* Category List / Edit / Save section */}
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
                  if (category.categories.length > 0) {
                    cRows = category.categories.map((indCat) => {
                      return categoryRow(indCat);
                    });
                  }
                  return (
                    <>
                      {gRow}
                      {cRows}
                    </>
                  );
                })}
              </div>
            </Card>
            <div className="flex flex-col justify-evenly items-center p-1">
              <div>
                <Label label="Categories Selected" className="text-xl" />
                <div className="flex justify-center items-center">
                  <div className="font-bold text-3xl">
                    {data.categories.length}
                  </div>

                  <PencilSquareIcon
                    className="h-8 w-8 mt-[1px] stroke-2 hover:cursor-pointer"
                    onClick={() =>
                      showModal(
                        ModalType.ALL_CATEGORIES_LIST,
                        <AllCategoriesEditable
                          userData={userData}
                          closeModal={closeModal}
                          onSave={onSave}
                        />
                      )
                    }
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
      </div>
    </>
  );
}

export default BudgetHelperFull;
