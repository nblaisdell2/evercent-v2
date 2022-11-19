import type { NextPage } from "next";
import { useUser } from "@auth0/nextjs-auth0";

import { useQuery } from "@apollo/client";
import { GET_USER_DATA } from "../graphql/queries";

import Header from "../components/Header";
import UserHeader from "../components/UserHeader";
import ModalContent from "../components/modal/ModalContent";
import MainContent from "../components/MainContent";
import useModal from "../components/hooks/useModal";

export type TokenDetails = {
  accessToken: string;
  refreshToken: string;
  expirationDate: string;
};

export type UserData = {
  userID: string;
  budgetID: string;
  tokenDetails: TokenDetails;
};

const Home: NextPage = () => {
  const {
    isOpen,
    modalContentID,
    modalComponentToDisplay,
    showModal,
    closeModal,
  } = useModal();

  const { user, isLoading, error } = useUser();
  const userEmail: string = user ? (user.email as string) : "";

  const {
    loading,
    error: errorID,
    data,
    refetch,
  } = useQuery(GET_USER_DATA, {
    variables: { userEmail },
  });

  const refetchUser = async () => {
    await refetch({ userEmail });
  };

  if (loading || isLoading) return <p>Loading...</p>;
  if (error || errorID) {
    // console.log(error);
    // console.log(errorID);
    return <p>Error :(</p>;
  }

  return (
    <div className="flex flex-col h-screen">
      <Header />
      {isOpen && (
        <ModalContent
          open={isOpen}
          modalContentID={modalContentID}
          modalComponentToDisplay={modalComponentToDisplay}
          onClose={closeModal}
        />
      )}
      {userEmail && (
        <>
          <UserHeader
            userData={data.userData}
            refetchUser={refetchUser}
            showModal={showModal}
            closeModal={closeModal}
          />

          <div className="flex flex-grow">
            <MainContent
              userData={data.userData}
              showModal={showModal}
              closeModal={closeModal}
            />
          </div>
        </>
      )}
    </div>
  );
};

export default Home;
