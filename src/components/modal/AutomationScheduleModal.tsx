import { CheckIcon, MinusCircleIcon } from "@heroicons/react/24/outline";
import React, { useState } from "react";
import { parseDate } from "../../utils/utils";
import Label from "../elements/Label";
import MySelect from "../elements/MySelect";
import RadioButtonGroup from "../elements/RadioButtonGroup";

type Props = { closeModal: () => void };

function AutomationScheduleModal({ closeModal }: Props) {
  const rightNow = parseDate(new Date().toISOString());
  console.log("rightNow", rightNow);

  let currHour = rightNow.getHours();
  console.log("currHour", currHour);

  const [hourOfDay, setHourOfDay] = useState(
    currHour <= 12 ? currHour : currHour - 12
  );
  const [timeOfDay, setTimeOfDay] = useState(currHour <= 12 ? "AM" : "PM");

  return (
    <div className="w-full h-full flex flex-col text-center">
      <div className="text-3xl font-bold">Scheduling the Budget Automation</div>
      <div className="flex flex-col justify-center space-y-10 flex-grow">
        <Label
          label={"What time on paydate should the automation run?"}
          className={"text-lg sm:text-xl whitespace-pre-wrap"}
        />
        <div className="flex items-center justify-center">
          <MySelect
            values={[
              "1",
              "2",
              "3",
              "4",
              "5",
              "6",
              "7",
              "8",
              "9",
              "10",
              "11",
              "12",
            ]}
            selectedValue={hourOfDay.toString()}
            onSelectionChange={(newSelectedValue: string) => {
              setHourOfDay(parseInt(newSelectedValue));
            }}
          />
          <RadioButtonGroup
            buttons={["AM", "PM"]}
            selectedButton={timeOfDay}
            onSelect={(newButton: string) => {
              setTimeOfDay(newButton);
            }}
            className="ml-2"
          />
        </div>
        <div className="flex justify-around">
          <button
            onClick={() => {}}
            className={`px-2 py-1 w-[45%] bg-gray-300 rounded-md shadow-slate-400 shadow-sm hover:bg-blue-400 hover:text-white`}
          >
            <div
              className="flex justify-center items-center"
              onClick={() => {
                // TODO: Set the new "next runtime" using the state values
                closeModal();
              }}
            >
              <CheckIcon className="h-10 w-10 text-green-600 stroke-2 mr-1" />
              <div className="font-semibold text-sm">
                Set New Time
                <br />& Review
              </div>
            </div>
          </button>
          <button
            onClick={() => {}}
            className={`px-2 py-1 w-[45%] bg-gray-300 rounded-md shadow-slate-400 shadow-sm hover:bg-blue-400 hover:text-white`}
          >
            <div
              className="flex justify-center items-center"
              onClick={() => {
                closeModal();
              }}
            >
              <MinusCircleIcon className="h-10 w-10 text-red-600 stroke-2 mr-1" />
              <div className="font-semibold text-sm">Go Back</div>
            </div>
          </button>
        </div>
      </div>
    </div>
  );
}

export default AutomationScheduleModal;
