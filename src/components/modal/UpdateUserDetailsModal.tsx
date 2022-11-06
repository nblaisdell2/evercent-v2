import React, { useState } from "react";
import Label from "../elements/Label";
import MyDatePicker from "../elements/MyDatePicker";
import RadioButtonGroup from "../elements/RadioButtonGroup";
import { today, getLocalTimeZone, parseDate } from "@internationalized/date";
import { CheckIcon } from "@heroicons/react/24/outline";
import { useMutation } from "@apollo/client";
import { UPDATE_USER_DETAILS } from "../../graphql/mutations";

type Props = {
  userID: string;
  budgetID: string;
  monthlyIncome: number;
  payFrequency: string;
  nextPaydate: string;
  refetchUserDetails: () => void;
  closeModal: () => void;
};

function UpdateUserDetailsModal({
  userID,
  budgetID,
  monthlyIncome,
  payFrequency,
  nextPaydate,
  refetchUserDetails,
  closeModal,
}: Props) {
  const [newMonthlyIncome, setNewMonthlyIncome] = useState(monthlyIncome || 0);
  const [newPayFrequency, setNewPayFrequency] = useState(
    payFrequency || "Every 2 Weeks"
  );
  const [newNextPaydate, setNewNextPaydate] = useState(
    nextPaydate || new Date().toISOString()
  );

  const [updateDetails] = useMutation(UPDATE_USER_DETAILS);

  console.log("MODAL - newNextPaydate", newNextPaydate.substring(0, 10));

  return (
    <div className="text-center">
      <div className="text-3xl font-bold">User Details</div>

      <div className="mt-12">
        <Label label="Monthly Income" />
        <input
          type="text"
          value={"$" + newMonthlyIncome}
          onChange={(e) => {
            setNewMonthlyIncome(
              parseInt(e.target.value.replace("$", "") || "0")
            );
          }}
          onFocus={(e) => e.target.select()}
          className="border border-black rounded-md h-12 w-40 text-center text-3xl font-bold text-green-500"
        />
      </div>

      <div className="mt-16">
        <Label label="Pay Frequency" />
        <RadioButtonGroup
          buttons={["Weekly", "Every 2 Weeks", "Monthly"]}
          selectedButton={newPayFrequency}
          onSelect={(button) => {
            setNewPayFrequency(button);
          }}
        />
      </div>

      <div className="mt-16">
        <Label label="Next Paydate" />
        <MyDatePicker
          minValue={today(getLocalTimeZone())}
          value={parseDate(newNextPaydate.substring(0, 10))}
          onChange={(newDate: any) => {
            console.log(
              "MODAL - OnChange - setting to",
              new Date(newDate.year, newDate.month - 1, newDate.day)
                .toISOString()
                .substring(0, 10)
            );
            setNewNextPaydate(
              new Date(
                newDate.year,
                newDate.month - 1,
                newDate.day
              ).toISOString()
            );
          }}
        />
      </div>

      <div className="mt-16">
        <button
          onClick={async () => {
            console.log({
              newMonthlyIncome,
              newPayFrequency,
              newNextPaydate,
            });

            if (
              monthlyIncome !== newMonthlyIncome ||
              payFrequency !== newPayFrequency ||
              nextPaydate !== newNextPaydate
            ) {
              console.log("Updating user details in database");
              await updateDetails({
                variables: {
                  userBudgetInput: {
                    userID: userID,
                    budgetID: budgetID,
                  },
                  newMonthlyIncome: newMonthlyIncome,
                  payFreq: newPayFrequency,
                  nextPaydate: newNextPaydate,
                },
              });
              refetchUserDetails();
            }

            closeModal();
          }}
          className={`absolute bottom-0 inset-x-0 h-8 bg-gray-300 rounded-md shadow-slate-400 shadow-sm hover:bg-blue-400 hover:text-white`}
        >
          <div className="flex justify-center items-center">
            <CheckIcon className="h-6 w-6 text-green-600 stroke-2" />
            <div className="font-semibold text-sm">Save</div>
          </div>
        </button>
      </div>
    </div>
  );
}

export default UpdateUserDetailsModal;
