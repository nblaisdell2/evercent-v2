import React from "react";
import UserDetails from "./UserDetails";
import YNABConnection from "./YNABConnection";
import type { UserData } from "../pages";

function UserHeader({
  userData,
  refetchUser,
  showModal,
  closeModal,
}: {
  userData: UserData;
  refetchUser: () => Promise<void>;
  showModal: (modalContentID: number, modalContent: JSX.Element) => void;
  closeModal: () => void;
}) {
  return (
    <div className="bg-[#F6F9FA] flex justify-between px-2 sm:px-10 py-1 w-full">
      <div className="hidden sm:flex">
        <YNABConnection
          userData={userData}
          refetchUser={refetchUser}
          showModal={showModal}
        />
      </div>
      <UserDetails
        userID={userData.userID}
        budgetID={userData.budgetID}
        showModal={showModal}
        closeModal={closeModal}
      />
    </div>
  );
}

export default UserHeader;
