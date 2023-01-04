import { useState } from "react";
import type { NextPage } from "next";

import MainHeader from "../components/widgets/header/MainHeader";
import MainContent from "../components/MainContent";

import useEvercent from "../components/hooks/useEvercent";
import UserHeader from "../components/widgets/header/UserHeader";
import YNABConnection from "../components/widgets/header/YNABConnection";

const Home: NextPage = () => {
  const {
    loading,
    userEmail,
    userData,
    categories,
    budgetNames,
    budgetMonths,
    editableCategoryList,
    updateDefaultBudgetID,
    updateUserData,
    refreshYNABTokens,
    updateCategories,
    saveNewExcludedCategories,
  } = useEvercent();

  const [modalIsShowing, setModalIsShowing] = useState(false);

  if (loading) {
    return (
      <div className="bg-[#D1F5FF] h-screen w-screen flex justify-center items-center">
        <div className="text-3xl font-bold">Loading...</div>
      </div>
    );
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
        <MainHeader />

        {userEmail && (
          <UserHeader
            budgetNames={budgetNames}
            userData={userData}
            updateUserData={updateUserData}
            refreshYNABTokens={refreshYNABTokens}
            updateDefaultBudgetID={updateDefaultBudgetID}
          />
        )}
      </div>

      {!userEmail ? (
        <div className="h-full w-full bg-[#D1F5FF]"></div>
      ) : (
        <div className="flex flex-grow justify-center items-center">
          <div className="sm:hidden bg-[#D1F5FF] h-full flex items-center">
            {!userData.tokenDetails.accessToken && (
              <YNABConnection budgetNames={budgetNames} userData={userData} />
            )}
          </div>

          <MainContent
            userData={userData}
            categories={categories}
            budgetMonths={budgetMonths}
            editableCategoryList={editableCategoryList}
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
