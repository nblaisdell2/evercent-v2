import type { NextPage } from "next";
import { useUser } from "@auth0/nextjs-auth0";

import { useMutation, useQuery } from "@apollo/client";
import { GET_BUDGET_HELPER_DETAILS, GET_USER_DATA } from "../graphql/queries";

import Header from "../components/Header";
import UserHeader from "../components/UserHeader";
import MainContent from "../components/MainContent";
import { useState } from "react";
import YNABConnection from "../components/YNABConnection";
import { useRouter } from "next/router";
import { GET_YNAB_INITIAL_DETAILS } from "../graphql/mutations";

const Home: NextPage = () => {
  const router = useRouter();

  const { user, isLoading, error } = useUser();
  const userEmail = user ? user.email : "";

  const [modalIsShowing, setModalIsShowing] = useState(false);

  const [getYNABInitialDetails] = useMutation(GET_YNAB_INITIAL_DETAILS);

  const saveNewYNABTokens = async (authCode: string, userID: string) => {
    if (userID) {
      await getYNABInitialDetails({ variables: { userID, authCode } });

      delete router.query.code;
      router.push(router);

      await refetchUser();
    }
  };

  const {
    loading,
    error: errorID,
    data,
    refetch,
  } = useQuery(GET_USER_DATA, {
    variables: { userEmail },
    skip: !userEmail,
    onCompleted: (data) => {
      if (router.query?.code) {
        saveNewYNABTokens(router.query?.code as string, data.userData.userID);
      }
    },
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
    skip:
      loading ||
      isLoading ||
      !userEmail ||
      !data?.userData.tokenDetails.accessToken,
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

  if (loading || loadingCategories || isLoading || router?.query?.code) {
    return (
      <div className="bg-[#D1F5FF] h-screen w-screen flex justify-center items-center">
        <div className="text-3xl font-bold">Loading...</div>
      </div>
    );
  }

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
      <div className="sticky top-0 left-0 z-10">
        <Header />
        {userEmail && (
          <UserHeader userData={data?.userData} refetchUser={refetchUser} />
        )}
      </div>

      {!userEmail ? (
        <div className="h-full w-full bg-[#D1F5FF]"></div>
      ) : (
        <div className="flex flex-grow justify-center items-center">
          <div className="sm:hidden bg-[#D1F5FF] h-full flex items-center">
            {!data?.userData.tokenDetails.accessToken && (
              <YNABConnection
                userData={data.userData}
                refetchUser={refetchUser}
              />
            )}
          </div>
          <MainContent
            userData={data.userData}
            categories={dataCategories?.categories}
            refetchCategories={refetchCategories}
            budgetMonths={dataCategories?.budgetMonths}
            setModalIsShowing={setModalIsShowing}
          />
        </div>
      )}
    </div>
  );
};

export default Home;
