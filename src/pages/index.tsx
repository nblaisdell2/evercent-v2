import type { NextPage } from "next";
import Header from "./components/Header";
import UserHeader from "./components/UserHeader";
import { useUser } from "@auth0/nextjs-auth0";
import { useQuery } from "@apollo/client";
import { GET_USER_ID } from "../graphql/queries";

const Home: NextPage = () => {
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

  if (loading) return <p>Loading...</p>;
  if (error || errorID) {
    return <p>Error :(</p>;
  }

  console.log("UserID", data.userID);

  console.log("=== RE-RENDERING index.tsx ===");

  return (
    <>
      <Header />
      {userEmail && (
        <UserHeader
          userID={data.userID.id}
          budgetID={data.userID.defaultBudgetID}
          refetchUser={refetchUser}
        />
      )}
    </>
  );
};

export default Home;
