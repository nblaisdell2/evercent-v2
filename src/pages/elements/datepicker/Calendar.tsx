import { useRef, useState } from "react";
import { useCalendarState } from "@react-stately/calendar";
import { useCalendar } from "@react-aria/calendar";
import { useLocale } from "@react-aria/i18n";
import { createCalendar } from "@internationalized/date";
import { CalendarButton } from "./Button";
import { CalendarGrid } from "./CalendarGrid";
import { ChevronLeftIcon, ChevronRightIcon } from "@heroicons/react/24/outline";

export function Calendar(props: any) {
  let { locale } = useLocale();
  let state = useCalendarState({
    ...props,
    locale,
    createCalendar,
  });

  let ref = useRef(null);
  let { calendarProps, prevButtonProps, nextButtonProps, title } = useCalendar(
    props,
    state
  );

  const [calendarMode, setCalendarMode] = useState("DatePicker"); // "DatePicker", "MonthPicker"

  return (
    <div {...calendarProps} ref={ref} className="text-gray-800 w-full">
      <div className="flex flex-col items-center text-center pb-4">
        <div className="flex justify-around space-x-4 items-center">
          <CalendarButton {...prevButtonProps}>
            <ChevronLeftIcon className="h-6 w-6" />
          </CalendarButton>
          <h2
            className="flex-1 font-bold text-xl mb-2 w-[175px] whitespace-nowrap hover:underline hover:cursor-pointer"
            onClick={() => {
              if (calendarMode == "DatePicker") {
                setCalendarMode("MonthPicker");
              }
            }}
          >
            {(calendarMode == "DatePicker" && title) ||
              (calendarMode == "MonthPicker" &&
                title.substring(title.indexOf(" ") + 1))}
          </h2>
          <CalendarButton {...nextButtonProps}>
            <ChevronRightIcon className="h-6 w-6" />
          </CalendarButton>
        </div>
        {(calendarMode == "DatePicker" && (
          <CalendarGrid state={state} props={{}} />
        )) ||
          (calendarMode == "MonthPicker" && <div>MonthPicker</div>)}
      </div>
    </div>
  );
}
