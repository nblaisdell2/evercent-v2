import React from "react";
import { PostingMonth } from "../utils/evercent";
import { getMoneyString, getPercentString } from "../utils/utils";
import Label from "./elements/Label";
import LabelAndValue from "./elements/LabelAndValue";
import PostingMonthBreakdown from "./PostingMonthBreakdown";

type Props = { months: PostingMonth[] };

function BudgetAutomationWidget({ months }: Props) {
  return (
    <>
      {/* Web Version */}
      <div className="h-full w-full hidden sm:block">
        <div className="h-full w-full p-2 flex flex-col">
          <div className="flex justify-around">
            <LabelAndValue
              label={"Next Auto Run"}
              value={"08/04/2022"}
              classNameValue={"text-2xl"}
            />
            <LabelAndValue
              label={"Run Time"}
              value={"7:00AM"}
              classNameValue={"text-2xl"}
            />
            <LabelAndValue
              label={"Time Left"}
              value={"2 days 13 hours"}
              classNameValue={"text-2xl"}
            />
          </div>
          <div className="flex justify-around h-full mt-3">
            {/* left side */}
            <div className=" flex flex-col justify-evenly">
              <LabelAndValue
                label={"Amount to Post"}
                value={getMoneyString(960)}
                classNameValue={"text-green-500 text-2xl sm:text-3xl"}
              />
              <LabelAndValue
                label={"# of Categories"}
                value={"17"}
                classNameValue={"text-2xl sm:text-3xl"}
              />
            </div>
            {/* right side */}
            <div className="flex flex-col justify-center">
              <Label
                label={"Posting Month Breakdown"}
                className="text-sm sm:text-xl whitespace-pre-wrap text-center"
              />
              <PostingMonthBreakdown months={months} showPercent={true} />
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Version */}
      <div className="h-full w-full flex flex-col justify-around sm:hidden">
        <div className="flex justify-around">
          <div className="w-[50%]">
            <LabelAndValue
              label={"Next Auto Run"}
              value={"08/04/2022"}
              classNameValue={"text-2xl sm:text-3xl"}
            />
          </div>
          <div className="w-[50%]">
            <LabelAndValue
              label={"Run Time"}
              value={"7:00AM"}
              classNameValue={"text-2xl sm:text-3xl"}
            />
          </div>
        </div>
        <div className="flex justify-around">
          <div className="w-[50%] text-center">
            <LabelAndValue
              label={"Time Left"}
              value={
                <div className="text-2xl sm:text-3xl">
                  <div>2 days</div>
                  <div className="-mt-1">13 hours</div>
                </div>
              }
            />
          </div>
          <div className="w-[50%]">
            <LabelAndValue
              label={"Amount to Post"}
              value={getMoneyString(960)}
              classNameValue={"text-green-500 text-2xl sm:text-3xl"}
            />
          </div>
        </div>
      </div>
    </>
  );
}

export default BudgetAutomationWidget;
