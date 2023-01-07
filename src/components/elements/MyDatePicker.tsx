import { useRef } from "react";
import { useDatePickerState } from "@react-stately/datepicker";
import { useDatePicker } from "@react-aria/datepicker";
import { FieldButton } from "./datepicker/Button";
import { Calendar } from "./datepicker/Calendar";
import { DateField } from "./datepicker/DateField";
import { OverlayProvider } from "@react-aria/overlays";
import { Popover } from "./datepicker/Popover";
import {
  CalendarIcon,
  ExclamationCircleIcon,
} from "@heroicons/react/24/outline";

export default function MyDatePicker(props: any) {
  let state = useDatePickerState(props);
  let ref = useRef(null);
  let {
    groupProps,
    labelProps,
    fieldProps,
    buttonProps,
    dialogProps,
    calendarProps,
  } = useDatePicker(props, state, ref);

  return (
    <OverlayProvider>
      <div className="inline-flex flex-col text-left">
        <div {...groupProps} ref={ref} className="flex group">
          <div className="bg-white border border-gray-300 group-hover:border-gray-400 transition-colors rounded-l-md pr-10 group-focus-within:border-blue-900 group-focus-within:group-hover:border-blue-900 p-1 relative flex items-center">
            <DateField {...fieldProps} />
            {state.validationState === "invalid" && (
              <ExclamationCircleIcon className="w-6 h-6 text-red-500 absolute right-1" />
            )}
          </div>
          <FieldButton {...buttonProps} isPressed={state.isOpen}>
            <CalendarIcon className="w-5 h-5 text-gray-700 group-focus-within:text-blue-900" />
          </FieldButton>
        </div>
        {state.isOpen && (
          <Popover
            {...dialogProps}
            isOpen={state.isOpen}
            onClose={() => state.setOpen(false)}
            classNamePosition={props?.classNamePosition || ""}
          >
            <Calendar {...calendarProps} />
          </Popover>
        )}
      </div>
    </OverlayProvider>
  );
}
