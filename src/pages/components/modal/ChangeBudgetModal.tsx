import { useMutation, useQuery } from "@apollo/client";
import React, { useState } from "react";
import { GET_BUDGETS } from "../../../graphql/queries";
import Label from "../../elements/Label";
import { CheckIcon } from "@heroicons/react/24/outline";
import { useRouter } from "next/router";
import { UPDATE_DEFAULT_BUDGET_ID } from "../../../graphql/mutations";

type Props = {
  currBudgetID: string;
  userID: string;
  accessToken: string;
  refreshToken: string;
};

type YNABBudget = {
  id: string;
  name: string;
};

function ChangeBudgetModal({
  currBudgetID,
  userID,
  accessToken,
  refreshToken,
}: Props) {
  const router = useRouter();
  const [newBudget, setNewBudget] = useState<YNABBudget>();

  const { loading, error, data } = useQuery(GET_BUDGETS, {
    variables: {
      userID: userID,
      accessToken: accessToken,
      refreshToken: refreshToken,
    },
  });

  const [updateBudgetID] = useMutation(UPDATE_DEFAULT_BUDGET_ID);

  const switchBudget = async () => {
    if (newBudget && newBudget.name !== currBudgetName) {
      // Run the "UpdateBudgetID" query/mutation
      await updateBudgetID({
        variables: {
          userID: userID,
          newBudgetID: newBudget.id,
        },
      });

      // Reload the entire page
      router.reload();
    }
  };

  if (loading) return null;

  const currBudgetName: string = data.budgets.find(
    (x: YNABBudget) => x.id == currBudgetID.toLowerCase()
  )?.name;

  return (
    <div className="text-center h-full">
      <div className="text-3xl font-bold">Budget Details</div>

      <Label label={"Current Budget"} className="mt-10" />
      <div className="-mt-1 text-2xl font-bold">{currBudgetName}</div>

      {/* Table of Budget Names */}
      <div
        className={`absolute top-36 ${
          !newBudget ? "bottom-0" : "bottom-12"
        } w-full flex flex-col`}
      >
        <div className="bg-white rounded-lg shadow-md shadow-slate-400 text-left flex-grow overflow-y-auto">
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
        </div>
      </div>

      {newBudget && (
        <button
          onClick={switchBudget}
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
