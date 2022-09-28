import type { NextPage } from "next";
import { useUser } from "@auth0/nextjs-auth0";

const Home: NextPage = () => {
  // const { loading, error, data } = useQuery(GET_USER_ID, {
  //   variables: {
  //     userEmail: "nblaisdell2@gmail.com"
  //   }
  // });

  // console.log(error);

  // if (loading) return <p>Loading...</p>;
  // if (error) return <p>Error :(</p>;

  // console.log(data);

  // const { user, error, isLoading } = useUser();

  // if (isLoading) return <div>Loading...</div>;
  // if (error) return <div>{error.message}</div>;

  // console.log("user", user);

  return (
    <div>
      Hello
      {/* <a href="/api/auth/login">Login</a> */}
      {/* <a href="/api/auth/logout">Logout</a> */}
    </div>
  );
};

export default Home;
