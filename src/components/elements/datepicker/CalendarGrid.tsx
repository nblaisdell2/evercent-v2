import { useCalendarGrid } from "@react-aria/calendar";
import { getWeeksInMonth } from "@internationalized/date";
import { useLocale } from "@react-aria/i18n";
import { CalendarCell } from "./CalendarCell";
import { AriaCalendarGridProps } from "react-aria";

export function CalendarGrid({
  state,
  props,
}: {
  state: any;
  props: AriaCalendarGridProps;
}) {
  let { locale } = useLocale();
  let { gridProps, headerProps, weekDays } = useCalendarGrid(props, state);

  // Get the number of weeks in the month so we can render the proper number of rows.
  let weeksInMonth = getWeeksInMonth(state.visibleRange.start, locale);

  console.log("calendar grid state", state);

  return (
    <table {...gridProps} cellPadding="0" className="flex-1">
      <thead {...headerProps} className="text-gray-600 border-b border-black">
        <tr>
          {weekDays.map((day, index) => (
            <th key={index}>{day}</th>
          ))}
        </tr>
      </thead>
      <tbody>
        {[...new Array(weeksInMonth).keys()].map((weekIndex) => (
          <tr key={weekIndex}>
            {state
              .getDatesInWeek(weekIndex)
              .map((date: any, i: number) =>
                date ? (
                  <CalendarCell key={i} state={state} date={date} />
                ) : (
                  <td key={i} />
                )
              )}
          </tr>
        ))}
      </tbody>
    </table>
  );
}
