import { CheckIcon } from "@heroicons/react/24/outline";
import React from "react";

type Props = {
  closeModal: () => void;
  setResetProgress: (newVal: boolean) => void;
};

function ResetExpensesProgress({ closeModal, setResetProgress }: Props) {
  return (
    <div className="flex flex-col font-mplus h-full p-2">
      <div className="text-center font-extrabold text-3xl mb-4">
        Reset Progress?
      </div>
      <div className="overflow-y-auto">
        <div className="mb-8 text-sm sm:text-base">
          By resetting the “Regular Expenses” progress, you will temporarily
          take all of the money available in your budget currently, and move it
          back into the “Ready to Assign” section, allowing you to re-choose
          where that money should be budgeted, based on the rules for the{" "}
          <span className="font-cinzel">Budget Automation</span>. This should be
          done in order to prioritize achieving 6-months ahead on all of the
          Regular Expenses.
          <br />
          <br />
          <b>Note:</b> Nothing is updated or removed from the actual budget
          until the very end of this process, when the “Post Amounts to Budget”
          button is pressed.
        </div>
      </div>

      <div className="flex justify-center">
        <button
          className={`px-2 py-1 h-fit w-fit bg-gray-300 rounded-md shadow-slate-400 shadow-sm`}
          disabled={true}
        >
          <div className="flex justify-center items-center">
            <CheckIcon className="h-10 w-10 text-green-600 stroke-2 mr-1" />
            <div className="font-semibold text-base">
              Post Amounts to Budget
            </div>
          </div>
        </button>
      </div>

      <div className="flex justify-center items-end text-2xl font-bold flex-grow mt-2">
        <button
          onClick={() => {
            setResetProgress(true);
            closeModal();
          }}
          className="mx-2 p-2 h-12 w-[40%] bg-blue-900 text-white rounded-md shadow-md shadow-slate-400"
        >
          Continue
        </button>
        <button
          onClick={closeModal}
          className="mx-2 p-2 h-12 w-[40%] bg-gray-300 rounded-md shadow-md shadow-slate-400 hover:bg-blue-400 hover:text-white"
        >
          Go Back
        </button>
      </div>
    </div>
  );
}

export default ResetExpensesProgress;
