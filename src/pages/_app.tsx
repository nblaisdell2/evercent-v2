import "../styles/globals.css";
import type { AppProps } from "next/app";
import Head from "next/head";
import { ApolloClient, InMemoryCache, ApolloProvider } from "@apollo/client";
import { UserProvider } from "@auth0/nextjs-auth0";

const client = new ApolloClient({
  uri: process.env.GRAPHQL_ENDPOINT + "/api/graphql",
  cache: new InMemoryCache(),
});
function MyApp({ Component, pageProps }: AppProps) {
  return (
    <ApolloProvider client={client}>
      <UserProvider>
        <Head>
          <link
            href="https://fonts.googleapis.com/css2?family=Anonymous+Pro:wght@700&family=Arima+Madurai:wght@500&family=Cinzel:wght@600&family=Raleway:wght@100&display=swap"
            rel="stylesheet"
          />
        </Head>

        <Component {...pageProps} />
      </UserProvider>
    </ApolloProvider>
  );
}

export default MyApp;
