import React from "react";
import { UserData, YNABBudget } from "../utils/evercent";
import UserDetails from "./UserDetails";
import YNABConnection from "./YNABConnection";

function UserHeader({
  userData,
  updateUserData,
  updateDefaultBudgetID,
  refreshYNABTokens,
}: {
  userData: UserData;
  updateUserData: (newUserData: UserData) => Promise<void>;
  updateDefaultBudgetID: (
    newBudget: YNABBudget,
    userID: string
  ) => Promise<void>;
  refreshYNABTokens: (
    userID: string,
    refreshToken: string,
    expirationDate: string
  ) => Promise<void>;
}) {
  return (
    <div className="bg-[#F6F9FA] border-b border-black flex justify-between px-2 sm:px-10 py-1 w-full">
      <div className="hidden sm:flex">
        <YNABConnection
          userData={userData}
          refreshYNABTokens={refreshYNABTokens}
          updateDefaultBudgetID={updateDefaultBudgetID}
        />
      </div>
      <UserDetails userData={userData} updateUserData={updateUserData} />
    </div>
  );
}

export default UserHeader;
