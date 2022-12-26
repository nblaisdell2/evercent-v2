import React, { useState } from "react";
import Card from "../../elements/Card";
import { CheckboxItem } from "../../elements/HierarchyTable";
import MyToggleButton from "../../elements/MyToggleButton";

type Props = {
  runTimes: any;
  showUpcoming: boolean;
  setShowUpcoming: (newVal: boolean) => void;
  setSelectedItem: (item: CheckboxItem | null) => void;
};

function UpcomingPastList({
  runTimes,
  showUpcoming,
  setShowUpcoming,
  setSelectedItem,
}: Props) {
  const [pastRunListIndex, setPastRunListIndex] = useState(0);

  return (
    <div className="h-auto sm:h-full flex flex-col">
      <div className="flex flex-grow items-center justify-around mx-1 sm:mx-0 my-2 space-x-1">
        <MyToggleButton
          leftSideTrue={showUpcoming}
          leftValue={"Upcoming Runs"}
          rightValue={"Past Runs"}
          onToggle={(toggleValue: boolean) => {
            setShowUpcoming(toggleValue);
            if (toggleValue) {
              setSelectedItem(null);
            }
          }}
        />
        <div className="flex flex-grow sm:flex-grow-0 font-mplus text-xs sm:text-sm italic h-auto sm:h-10 w-96 items-center sm:items-end text-right sm:text-left">
          {showUpcoming ? (
            <div>Here are the next 10 upcoming paydates</div>
          ) : (
            <div className="flex-grow">
              <span className="font-bold">Click</span> on one of the past
              paydates below to see what was posted to the budget on that date.
            </div>
          )}
        </div>
      </div>
      <Card className="flex flex-col h-28 sm:h-full overflow-y-auto font-mplus w-full p-1">
        <div className="flex w-full justify-around font-bold border-b border-black">
          <div className="w-full text-center">Date</div>
          <div className="w-full text-center">Time</div>
          {!showUpcoming && (
            <>
              <div className="hidden sm:block w-full text-center">
                Total Amount Posted
              </div>
              <div className="block sm:hidden w-full text-center">
                Amount Posted
              </div>
            </>
          )}
        </div>
        <div className="overflow-y-auto no-scrollbar">
          {runTimes.map((rt: any, i: number) => {
            return (
              <div
                className={`flex w-full justify-around rounded-md ${
                  i == (showUpcoming ? 0 : pastRunListIndex) && "font-bold"
                } ${
                  !showUpcoming &&
                  i == pastRunListIndex &&
                  "bg-gray-200 hover:bg-gray-200"
                } ${!showUpcoming && "hover:cursor-pointer"} ${
                  !showUpcoming && i != pastRunListIndex && "hover:bg-gray-100"
                }
                    }`}
                key={i}
                onClick={() => setPastRunListIndex(i)}
              >
                <div className={`w-full text-center`}>08/07/2022</div>
                <div className={`w-full text-center`}>7:00AM</div>
                {!showUpcoming && (
                  <div className="w-full text-center text-green-500">$960</div>
                )}
              </div>
            );
          })}
        </div>
      </Card>
    </div>
  );
}

export default UpcomingPastList;
