import { useQuery } from "@apollo/client";
import React from "react";
import { GET_YNAB_CONN_DETAILS } from "../../graphql/queries";
import UserDetails from "./UserDetails";
import YNABConnection from "../components/YNABConnection";

function UserHeader({
  userID,
  budgetID,
  refetchUser,
  showModal,
}: {
  userID: string;
  budgetID: string;
  refetchUser: () => Promise<void>;
  showModal: (modalContentID: number, modalContent: JSX.Element) => void;
}) {
  const {
    loading: loadingDetails,
    error: errorDetails,
    data: dataDetails,
    refetch,
  } = useQuery(GET_YNAB_CONN_DETAILS, {
    variables: {
      userID,
    },
  });

  const refetchYNABConnDetails = async () => {
    await refetch({ userID });
  };

  if (loadingDetails) {
    return <div>Still Loading...</div>;
  }

  return (
    <div className="bg-[#F6F9FA] flex justify-between px-10 py-1">
      <YNABConnection
        userID={userID}
        budgetID={budgetID}
        accessToken={dataDetails?.ynabConnDetails.accessToken}
        refreshToken={dataDetails?.ynabConnDetails.refreshToken}
        expirationDate={dataDetails?.ynabConnDetails.expirationDate}
        refetchYNABConnDetails={refetchYNABConnDetails}
        refetchUser={refetchUser}
        showModal={showModal}
      />
      <UserDetails />
    </div>
  );
}

export default UserHeader;
