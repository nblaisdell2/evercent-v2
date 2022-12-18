import React from "react";

type Props = { closeModal: () => void };

function CancelAutomationModal({ closeModal }: Props) {
  return (
    <div className="flex flex-col font-mplus h-full p-2">
      <div className="text-center font-extrabold text-3xl mb-2">
        Cancel Automation?
      </div>
      <div className="mb-8">
        If you need to <span className="font-bold">turn off</span> the budget
        automation temporarily, you can cancel it with the button below. This
        will cancel any upcoming runs so that you can manually interact with
        your budget without the automation interfering.
        <br />
        <br />
        You can always re-schedule the automation at a later time to turn it
        back on.
      </div>
      <div className="font-bold underline text-xl">
        Special Note about Locked Runs
      </div>
      <div className="mb-4">
        One hour before an automation run starts, the amount details will be
        locked, so any changes to the Budget Helper section won’t affect what
        gets posted.
        <br />
        <br />
        As a result, if the automation is cancelled when locked, it will still
        be stopped, but another cannot be scheduled until at least 2 hours after
        the current time. If cancelled at 1:30pm, the next automation cannot be
        scheduled until at least 3:00pm (so any changes can be locked at 2:00pm
        first).
      </div>
      <div className="flex justify-center items-end text-lg font-bold flex-grow">
        <button
          onClick={() => {
            // TODO: Update the appropriate tables to 'Cancel the Budget Automation'
            //       here before closing the modal.
            closeModal();
          }}
          className="mx-2 p-2 h-12 w-[40%] bg-red-600 text-white rounded-md shadow-md shadow-slate-400"
        >
          Yes, Cancel
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

export default CancelAutomationModal;
