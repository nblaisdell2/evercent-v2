import {
  ArrowLeftIcon,
  CheckIcon,
  XMarkIcon,
} from "@heroicons/react/24/outline";
import { ExclamationTriangleIcon } from "@heroicons/react/24/solid";
import React from "react";

type Props = {
  onExit: (exitType: "back" | "discard" | "save") => void;
};

function UnsavedChangesModal({ onExit }: Props) {
  return (
    <div className="flex flex-col items-center h-full w-full relative">
      <div className="flex items-center mt-6 mb-20">
        <ExclamationTriangleIcon className="h-10 w-10 text-orange-400" />
        <div className="font-bold text-3xl -mt-1">Unsaved Changes!</div>
      </div>
      <div className="mb-10 text-lg text-center">
        Would you like to save the changes before exiting?
      </div>

      <div className="w-full absolute bottom-0 space-y-2 sm:space-y-12 flex flex-col pb-2">
        <button
          className={`w-full h-16 bg-gray-300 rounded-md shadow-slate-400 shadow-sm hover:bg-blue-400 hover:text-white`}
          onClick={() => onExit("back")}
        >
          <div className="flex justify-center items-center">
            <ArrowLeftIcon className="h-10 w-10 text-black stroke-2 mr-2" />
            <div className="font-semibold text-2xl">Go Back</div>
          </div>
        </button>
        <button
          className={`w-full h-16 bg-gray-300 rounded-md shadow-slate-400 shadow-sm hover:bg-blue-400 hover:text-white`}
          onClick={() => onExit("discard")}
        >
          <div className="flex justify-center items-center">
            <XMarkIcon className="h-10 w-10 text-red-600 stroke-2" />
            <div className="font-semibold text-2xl">
              Discard Changes and Exit
            </div>
          </div>
        </button>
        <button
          className={`w-full h-16 bg-gray-300 rounded-md shadow-slate-400 shadow-sm hover:bg-blue-400 hover:text-white`}
          onClick={() => onExit("save")}
        >
          <div className="flex justify-center items-center">
            <CheckIcon className="h-10 w-10 text-green-600 stroke-2" />
            <div className="font-semibold text-2xl">Save Changes and Exit</div>
          </div>
        </button>
      </div>
    </div>
  );
}

export default UnsavedChangesModal;
