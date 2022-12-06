import type { NextPage } from "next";
import { useUser } from "@auth0/nextjs-auth0";

import { useQuery } from "@apollo/client";
import { GET_BUDGET_HELPER_DETAILS, GET_USER_DATA } from "../graphql/queries";

import Header from "../components/Header";
import UserHeader from "../components/UserHeader";
import MainContent from "../components/MainContent";
import { useState } from "react";

const Home: NextPage = () => {
  const { user, isLoading, error } = useUser();
  const userEmail = user ? user.email : "";

  const [modalIsShowing, setModalIsShowing] = useState(false);

  const {
    loading,
    error: errorID,
    data,
    refetch,
  } = useQuery(GET_USER_DATA, {
    variables: { userEmail },
  });

  const {
    loading: loadingCategories,
    error: errorCategories,
    data: dataCategories,
    refetch: refetchCats,
  } = useQuery(GET_BUDGET_HELPER_DETAILS, {
    variables: {
      userBudgetInput: {
        userID: data?.userData.userID,
        budgetID: data?.userData.budgetID,
      },
      accessToken: data?.userData.tokenDetails.accessToken,
      refreshToken: data?.userData.tokenDetails.refreshToken,
    },
    skip: loading || isLoading,
    // onCompleted(data) {
    //   setCategoryList(data.categories);
    // },
  });

  const refetchUser = async () => {
    await refetch({ userEmail });
  };

  const refetchCategories = async () => {
    await refetchCats({
      userBudgetInput: {
        userID: data.userData.userID,
        budgetID: data.userData.budgetID,
      },
      accessToken: data.userData.tokenDetails.accessToken,
      refreshToken: data.userData.tokenDetails.refreshToken,
    });
  };

  if (loading || loadingCategories || isLoading)
    return (
      <div className="bg-[#D1F5FF] h-screen w-screen flex justify-center items-center">
        <div className="text-3xl font-bold">Loading...</div>
      </div>
    );

  if (error || errorID || errorCategories) {
    console.log(error);
    console.log(errorID);
    console.log(errorCategories);
    return <p>Error :(</p>;
  }

  console.log("user data", data);
  console.log("category data", dataCategories);

  return (
    <div
      className={`flex flex-col h-screen ${
        modalIsShowing && "overflow-y-hidden"
      }`}
    >
      <Header />
      {userEmail && (
        <>
          <UserHeader userData={data.userData} refetchUser={refetchUser} />

          <div className="flex flex-grow">
            <MainContent
              userData={data.userData}
              categories={dataCategories.categories}
              refetchCategories={refetchCategories}
              budgetMonths={dataCategories.budgetMonths}
              setModalIsShowing={setModalIsShowing}
            />
          </div>
        </>
      )}
    </div>
  );
};

export default Home;
