import { useState } from "react";
import type { NextPage } from "next";
import { useUser } from "@auth0/nextjs-auth0";

import Header from "../components/Header";
import UserHeader from "../components/UserHeader";
import YNABConnection from "../components/YNABConnection";
import MainContent from "../components/MainContent";

import useEvercent from "../components/hooks/useEvercent";

const Home: NextPage = () => {
  const { user, isLoading, error } = useUser();
  const userEmail = user ? user.email : "";

  const {
    loading,
    userData,
    categories,
    budgetMonths,
    refreshYNABTokens,
    updateDefaultBudgetID,
    updateUserData,
    updateCategories,
    saveNewExcludedCategories,
  } = useEvercent(userEmail);

  const [modalIsShowing, setModalIsShowing] = useState(false);

  if (loading || isLoading) {
    return (
      <div className="bg-[#D1F5FF] h-screen w-screen flex justify-center items-center">
        <div className="text-3xl font-bold">Loading...</div>
      </div>
    );
  }

  if (error) {
    console.log(error);
    return <p>Error :(</p>;
  }

  console.log("user data", userData);
  console.log("category data", categories);

  return (
    <div
      className={`flex flex-col h-screen ${
        modalIsShowing && "overflow-y-hidden"
      }`}
    >
      <div className="sticky top-0 left-0 z-10">
        <Header />
        {userEmail && (
          <UserHeader
            userData={userData}
            updateUserData={updateUserData}
            refreshYNABTokens={refreshYNABTokens}
            updateDefaultBudgetID={updateDefaultBudgetID}
          />
        )}
      </div>

      {!userEmail || !userData ? (
        <div className="h-full w-full bg-[#D1F5FF]"></div>
      ) : (
        <div className="flex flex-grow justify-center items-center">
          <div className="sm:hidden bg-[#D1F5FF] h-full flex items-center">
            {!userData.tokenDetails.accessToken && (
              <YNABConnection userData={userData} />
            )}
          </div>
          <MainContent
            userData={userData}
            categories={categories}
            budgetMonths={budgetMonths}
            updateCategories={updateCategories}
            saveNewExcludedCategories={saveNewExcludedCategories}
            setModalIsShowing={setModalIsShowing}
          />
        </div>
      )}
    </div>
  );
};

export default Home;
