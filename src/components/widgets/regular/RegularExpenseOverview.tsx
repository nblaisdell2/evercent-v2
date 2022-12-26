import {
  CheckIcon,
  MinusCircleIcon,
  PencilSquareIcon,
} from "@heroicons/react/24/outline";
import React, { useState } from "react";
import Card from "../../elements/Card";
import LabelAndValue from "../../elements/LabelAndValue";
import MyButton from "../../elements/MyButton";
import RadioButtonGroup from "../../elements/RadioButtonGroup";

type Props = {};

function RegularExpenseOverview({}: Props) {
  const [editingTarget, setEditingTarget] = useState(false);
  const [currentTarget, setCurrentTarget] = useState(6);

  const getMonthsAheadComponent = () => {
    return !editingTarget ? (
      <div className="flex items-center">
        <div className="text-2xl sm:text-3xl">{currentTarget}</div>
        <PencilSquareIcon
          className="h-6 sm:h-8 w-6 sm:w-8 ml-1 hover:cursor-pointer"
          onClick={() => {
            setEditingTarget(true);
          }}
        />
      </div>
    ) : (
      <div className="flex flex-col items-center">
        <RadioButtonGroup
          buttons={["3", "6", "12"]}
          selectedButton={currentTarget.toString()}
          onSelect={(button: string) => setCurrentTarget(parseInt(button))}
          className={"flex space-x-4 my-1"}
        />
        <div className="flex space-x-2">
          <MyButton
            buttonText={"Save"}
            icon={
              <CheckIcon className="h-6 w-6 text-green-600 stroke-2 mr-1" />
            }
            onClick={() => setEditingTarget(false)}
          />
          <MyButton
            buttonText={"Cancel"}
            icon={
              <MinusCircleIcon className="h-6 w-6 text-red-600 stroke-2 mr-1" />
            }
            onClick={() => {
              // TODO: Set currently selected before editing
              setCurrentTarget(6);
              setEditingTarget(false);
            }}
          />
        </div>
      </div>
    );
  };

  return (
    <Card className="p-1">
      <div className="text-center font-bold text-2xl sm:text-3xl mb-2">
        Overview
      </div>
      <div className="flex justify-around">
        <LabelAndValue
          label={
            <div>
              Months Ahead
              <br />
              Target
            </div>
          }
          value={getMonthsAheadComponent()}
          classNameValue={"px-2"}
        />

        {/* Vertical Divider */}
        <div className="w-[1px] bg-gray-400" />

        <LabelAndValue
          label={
            <div>
              # of Regular
              <br />
              Expense Categories
            </div>
          }
          value={"28"}
          classNameLabel={"block"}
          classNameValue={"text-2xl sm:text-3xl"}
        />

        {/* Vertical Divider */}
        <div className="w-[1px] bg-gray-400" />

        <LabelAndValue
          label={
            <div>
              Regular Expenses
              <br />
              w/ Target Met
            </div>
          }
          value={
            <div className="flex items-center">
              <div className="text-2xl sm:text-3xl">16</div>
              <div className="text-base sm:text-lg ml-1">(57%)</div>
            </div>
          }
        />
      </div>
    </Card>
  );
}

export default RegularExpenseOverview;
