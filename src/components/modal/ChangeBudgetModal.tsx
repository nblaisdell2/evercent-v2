import React, { useState } from "react";
import { useQuery } from "@apollo/client";
import { GET_BUDGETS } from "../../graphql/queries";

import { CheckIcon } from "@heroicons/react/24/outline";

import Label from "../elements/Label";
import Card from "../elements/Card";

import { UserData, YNABBudget } from "../../utils/evercent";

function ChangeBudgetModal({
  userData,
  updateDefaultBudgetID,
}: {
  userData: UserData;
  updateDefaultBudgetID?: (
    newBudget: YNABBudget,
    userID: string
  ) => Promise<void>;
}) {
  const [newBudget, setNewBudget] = useState<YNABBudget>();

  const { loading, error, data } = useQuery(GET_BUDGETS, {
    variables: {
      userID: userData.userID,
      accessToken: userData.tokenDetails.accessToken,
      refreshToken: userData.tokenDetails.refreshToken,
    },
  });

  if (loading) return null;

  const currBudgetName: string = data.budgets.find(
    (x: YNABBudget) => x.id == userData.budgetID.toLowerCase()
  )?.name;

  return (
    <div className="text-center h-full">
      <div className="text-3xl font-bold">Budget Details</div>

      <Label label={"Current Budget"} className="mt-10" />
      <div className="-mt-1 text-2xl font-bold">{currBudgetName}</div>

      {/* Table of Budget Names */}
      <div
        className={`absolute top-36 w-full flex flex-col ${
          !newBudget ? "bottom-0" : "bottom-12"
        }`}
      >
        <Card className="text-left flex-grow overflow-y-auto">
          {data.budgets.map((budget: YNABBudget) => {
            return (
              <div
                key={budget.id}
                onClick={() => {
                  setNewBudget(budget);
                }}
                className={`p-1 m-1 font-semibold text-xl rounded-md hover:bg-gray-300 hover:cursor-pointer ${
                  ((!newBudget && budget.name == currBudgetName) ||
                    (newBudget && budget.name == newBudget.name)) &&
                  "hover:bg-[#1E3A8A] bg-[#1E3A8A] text-white"
                }`}
              >
                {budget.name}
              </div>
            );
          })}
        </Card>
      </div>

      {newBudget && (
        <button
          onClick={async () => {
            if (
              updateDefaultBudgetID &&
              newBudget &&
              newBudget.name !== currBudgetName
            ) {
              await updateDefaultBudgetID(newBudget, userData.userID);
            }
          }}
          className={`absolute bottom-0 inset-x-0 h-8 bg-gray-300 rounded-md shadow-slate-400 shadow-sm hover:bg-blue-400 hover:text-white ${
            newBudget.name == currBudgetName && "hover:cursor-not-allowed"
          }`}
        >
          <div className="flex justify-center items-center">
            <CheckIcon className="h-6 w-6 text-green-600 stroke-2" />
            <div className="font-semibold text-sm">Switch Budget</div>
          </div>
        </button>
      )}
    </div>
  );
}

export default ChangeBudgetModal;
