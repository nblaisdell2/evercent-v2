import { ArrowLeftIcon } from "@heroicons/react/24/outline";
import React, { useState } from "react";
import { getMoneyString } from "../utils/utils";
import Card from "./elements/Card";
import Label from "./elements/Label";
import LabelAndValue from "./elements/LabelAndValue";

type Props = {};

function UpcomingExpensesFull({}: Props) {
  const upcomingExpenses = [
    {
      id: 1,
      name: "Rent/Mortgage",
      amountSaved: 100,
      totalAmount: 500,
      purchaseDate: "09/29/2022",
      daysAway: 44,
      paychecksAway: 3,
    },
    {
      id: 2,
      name: "Rent/Mortgage",
      amountSaved: 100,
      totalAmount: 500,
      purchaseDate: "09/29/2022",
      daysAway: 44,
      paychecksAway: 3,
    },
    {
      id: 3,
      name: "Rent/Mortgage",
      amountSaved: 100,
      totalAmount: 500,
      purchaseDate: "09/29/2022",
      daysAway: 44,
      paychecksAway: 3,
    },
    {
      id: 4,
      name: "Rent/Mortgage",
      amountSaved: 100,
      totalAmount: 500,
      purchaseDate: "09/29/2022",
      daysAway: 44,
      paychecksAway: 3,
    },
    {
      id: 5,
      name: "Rent/Mortgage",
      amountSaved: 100,
      totalAmount: 500,
      purchaseDate: "09/29/2022",
      daysAway: 44,
      paychecksAway: 3,
    },
  ];

  const [selectedIndex, setSelectedIndex] = useState(-1);

  return (
    <>
      {selectedIndex == -1 ? (
        <Card className="h-full flex flex-col font-mplus p-2">
          <div className="text-2xl text-center font-extrabold mt-4 mb-8">
            List of Upcoming Expenses
          </div>
          <div className="flex border-t border-b font-bold py-1 border-gray-400">
            <div className="w-[20%] flex-grow pl-2 sm:pl-6">Category</div>
            <div className="hidden sm:block w-[16%] flex-grow text-right">
              Amount Saved
            </div>
            <div className="hidden sm:block w-[16%] flex-grow text-right">
              Total Amount
            </div>
            <div className="w-[16%] flex-grow text-right pr-2 sm:pr-0">
              Purchase Date
            </div>
            <div className="hidden sm:block w-[16%] flex-grow text-right">
              Days Away
            </div>
            <div className="hidden sm:block w-[16%] flex-grow text-right pr-6">
              Paychecks Away
            </div>
          </div>
          <div className="flex-grow overflow-y-auto">
            {upcomingExpenses.map((u, i) => {
              return (
                <>
                  <div
                    key={u.id}
                    className="flex sm:hidden py-3 hover:cursor-pointer sm:hover:cursor-default hover:bg-gray-200 rounded-lg"
                    onClick={() => {
                      setSelectedIndex(i);
                    }}
                  >
                    <div className="w-[20%] flex-grow pl-2 sm:pl-6">
                      {u.name}
                    </div>
                    <div className="hidden sm:block w-[16%] flex-grow text-right">
                      {getMoneyString(u.amountSaved, 0)}
                    </div>
                    <div className="hidden sm:block w-[16%] flex-grow text-right">
                      {getMoneyString(u.totalAmount, 0)}
                    </div>
                    <div className="w-[16%] flex-grow text-right pr-2 sm:pr-0">
                      {u.purchaseDate}
                    </div>
                    <div className="hidden sm:block w-[16%] flex-grow text-right">
                      {u.daysAway}
                    </div>
                    <div className="hidden sm:block w-[16%] flex-grow text-right pr-6">
                      {u.paychecksAway}
                    </div>
                  </div>
                  <div
                    key={u.id}
                    className="hidden sm:flex py-3 hover:cursor-pointer sm:hover:cursor-default hover:bg-gray-200 rounded-lg"
                  >
                    <div className="w-[20%] flex-grow pl-2 sm:pl-6">
                      {u.name}
                    </div>
                    <div className="hidden sm:block w-[16%] flex-grow text-right">
                      {getMoneyString(u.amountSaved, 0)}
                    </div>
                    <div className="hidden sm:block w-[16%] flex-grow text-right">
                      {getMoneyString(u.totalAmount, 0)}
                    </div>
                    <div className="w-[16%] flex-grow text-right pr-2 sm:pr-0">
                      {u.purchaseDate}
                    </div>
                    <div className="hidden sm:block w-[16%] flex-grow text-right">
                      {u.daysAway}
                    </div>
                    <div className="hidden sm:block w-[16%] flex-grow text-right pr-6">
                      {u.paychecksAway}
                    </div>
                  </div>
                </>
              );
            })}
          </div>
        </Card>
      ) : (
        <div className="flex flex-col h-full">
          <div
            className="flex items-center hover:cursor-pointer mt-2"
            onClick={() => {
              setSelectedIndex(-1);
            }}
          >
            <ArrowLeftIcon className="h-6 w-6 stroke-2 mr-1" />
            <Label label={"Back"} className="text-base" />
          </div>
          <div className="flex-grow flex flex-col space-y-16 mt-20">
            <div className="text-center font-bold text-4xl">
              {upcomingExpenses[selectedIndex].name}
            </div>
            <div className="flex flex-col items-center space-y-6">
              <div className="flex justify-center w-full space-x-4">
                <Card className="flex justify-center items-center w-[40%] h-24">
                  <LabelAndValue
                    label={"Amount Saved"}
                    value={"$100"}
                    classNameLabel={"text-lg"}
                    classNameValue={"font-mplus text-3xl"}
                  />
                </Card>
                <Card className="flex justify-center items-center w-[40%] h-24">
                  <LabelAndValue
                    label={"Total Amount"}
                    value={"$500"}
                    classNameLabel={"text-lg"}
                    classNameValue={"font-mplus text-3xl"}
                  />
                </Card>
              </div>
              <div className="flex justify-center w-full space-x-4">
                <Card className="flex justify-center items-center w-[40%] h-24">
                  <LabelAndValue
                    label={"% Saved"}
                    value={"67%"}
                    classNameLabel={"text-lg"}
                    classNameValue={"font-mplus text-3xl"}
                  />
                </Card>
                <Card className="flex justify-center items-center w-[40%] h-24">
                  <LabelAndValue
                    label={"Purchase Date"}
                    value={"09/29/2022"}
                    classNameLabel={"text-lg"}
                    classNameValue={"font-mplus text-xl"}
                  />
                </Card>
              </div>
              <div className="flex justify-center w-full space-x-4">
                <Card className="flex justify-center items-center w-[40%] h-24">
                  <LabelAndValue
                    label={"Days Left"}
                    value={"44"}
                    classNameLabel={"text-lg"}
                    classNameValue={"font-mplus text-3xl"}
                  />
                </Card>
                <Card className="flex justify-center items-center w-[40%] h-24">
                  <LabelAndValue
                    label={"Paychecks Left"}
                    value={"3"}
                    classNameLabel={"text-lg"}
                    classNameValue={"font-mplus text-3xl"}
                  />
                </Card>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

export default UpcomingExpensesFull;
