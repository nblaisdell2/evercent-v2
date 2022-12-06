import React from "react";
import { UserData } from "../utils/evercent";
import UserDetails from "./UserDetails";
import YNABConnection from "./YNABConnection";

function UserHeader({
  userData,
  refetchUser,
}: {
  userData: UserData;
  refetchUser: () => Promise<void>;
}) {
  return (
    <div className="bg-[#F6F9FA] flex justify-between px-2 sm:px-10 py-1 w-full">
      <div className="hidden sm:flex">
        <YNABConnection userData={userData} refetchUser={refetchUser} />
      </div>
      <UserDetails userData={userData} refetchUser={refetchUser} />
    </div>
  );
}

export default UserHeader;
