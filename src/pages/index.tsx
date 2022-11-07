import { useState } from "react";
import type { NextPage } from "next";
import { useUser } from "@auth0/nextjs-auth0";

import { useQuery } from "@apollo/client";
import { GET_USER_ID } from "../graphql/queries";

import Header from "../components/Header";
import UserHeader from "../components/UserHeader";
import ModalContent from "../components/modal/ModalContent";

const Home: NextPage = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [modalContentID, setModalContentID] = useState(-1);
  const [modalComponentToDisplay, setModalComponentToDisplay] =
    useState<JSX.Element>();

  const showModal = (
    modalContentID: number,
    modalContentToDisplay: JSX.Element
  ) => {
    setModalContentID(modalContentID);
    setModalComponentToDisplay(modalContentToDisplay);
    setIsOpen(true);
  };

  const closeModal = () => {
    setIsOpen(false);
  };

  const { user, isLoading, error } = useUser();
  const userEmail: string = user ? (user.email as string) : "";

  const {
    loading,
    error: errorID,
    data,
    refetch,
  } = useQuery(GET_USER_ID, {
    variables: { userEmail },
  });

  const refetchUser = async () => {
    await refetch({ userEmail });
  };

  if (loading || isLoading) return <p>Loading...</p>;
  if (error || errorID) {
    return <p>Error :(</p>;
  }

  return (
    <>
      <Header />
      {isOpen && (
        <ModalContent
          open={isOpen}
          modalContentID={modalContentID}
          modalComponentToDisplay={modalComponentToDisplay}
          onClose={() => setIsOpen(false)}
        />
      )}
      {userEmail && (
        <UserHeader
          userID={data.userID.id}
          budgetID={data.userID.defaultBudgetID}
          refetchUser={refetchUser}
          showModal={showModal}
          closeModal={closeModal}
        />
      )}
    </>
  );
};

export default Home;
