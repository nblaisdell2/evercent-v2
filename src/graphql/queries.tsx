import { gql } from "@apollo/client";

export const GET_USER_DATA = gql`
  query GetUserData($userEmail: String!) {
    userData(userEmail: $userEmail) {
      userID
      budgetID
      tokenDetails {
        accessToken
        refreshToken
        expirationDate
      }
    }
  }
`;

export const GET_USER_ID = gql`
  query GetUserID($userEmail: String!) {
    userID(userEmail: $userEmail) {
      id
      defaultBudgetID
    }
  }
`;

export const GET_USERNAME = gql`
  query GetUsername($userBudgetInput: UserBudgetInput!) {
    user(userBudgetInput: $userBudgetInput) {
      username
    }
  }
`;

export const GET_MONTHLY_INCOME = gql`
  query GetMonthlyIncome($userBudgetInput: UserBudgetInput!) {
    user(userBudgetInput: $userBudgetInput) {
      monthlyIncome
    }
  }
`;

export const GET_PAY_FREQUENCY = gql`
  query GetPayFrequency($userBudgetInput: UserBudgetInput!) {
    user(userBudgetInput: $userBudgetInput) {
      payFrequency
    }
  }
`;

export const GET_MONTHS_AHEAD_TARGET = gql`
  query GetMonthsAheadTarget($userBudgetInput: UserBudgetInput!) {
    user(userBudgetInput: $userBudgetInput) {
      monthsAheadTarget
    }
  }
`;

export const GET_USER_DETAILS = gql`
  query GetUserDetails($userBudgetInput: UserBudgetInput!) {
    user(userBudgetInput: $userBudgetInput) {
      monthlyIncome
      payFrequency
      nextPaydate
    }
  }
`;

export const GET_YNAB_CONN_DETAILS = gql`
  query GetYNABConnectionDetails($userID: ID!) {
    ynabConnDetails(userID: $userID) {
      accessToken
      refreshToken
      expirationDate
    }
  }
`;

export const GET_YNAB_INITIAL_DETAILS = gql`
  query GetYNABInitialDetails($userID: ID!, $authCode: String!) {
    getInitialYNABDetails(userID: $userID, authCode: $authCode) {
      defaultBudgetID
      tokenDetails {
        accessToken
        refreshToken
        expirationDate
      }
      categories {
        categoryGroupID
        categoryID
        categoryGroupName
        name
        budgeted
        activity
        available
      }
    }
  }
`;

export const GET_NEW_ACCESS_TOKEN = gql`
  query GetNewAccessToken($userID: ID!, $authCode: String!) {
    getNewAccessToken(userID: $userID, authCode: $authCode) {
      accessToken
      refreshToken
      expirationDate
    }
  }
`;

export const GET_DEFAULT_BUDGET_ID = gql`
  query GetDefaultBudgetID(
    $userID: ID!
    $accessToken: String!
    $refreshToken: String!
  ) {
    getDefaultBudgetID(
      userID: $userID
      accessToken: $accessToken
      refreshToken: $refreshToken
    )
  }
`;

export const GET_BUDGETS = gql`
  query GetBudgets(
    $userID: ID!
    $accessToken: String!
    $refreshToken: String!
  ) {
    budgets(
      userID: $userID
      accessToken: $accessToken
      refreshToken: $refreshToken
    ) {
      id
      name
    }
  }
`;

export const GET_BUDGET_NAME = gql`
  query GetBudgetName(
    $userID: ID!
    $accessToken: String!
    $refreshToken: String!
    $budgetID: ID!
  ) {
    budgetName(
      userID: $userID
      accessToken: $accessToken
      refreshToken: $refreshToken
      budgetID: $budgetID
    )
  }
`;

export const GET_BUDGET_MONTHS = gql`
  query GetBudgetMonths(
    $userID: ID!
    $accessToken: String!
    $refreshToken: String!
    $budgetID: ID!
  ) {
    budgetMonths(
      userID: $userID
      accessToken: $accessToken
      refreshToken: $refreshToken
      budgetID: $budgetID
    ) {
      month
      categories {
        categoryGroupID
        categoryGroupName
        categoryID
        name
        budgeted
        activity
        available
      }
    }
  }
`;

export const GET_CATEGORY_GROUPS = gql`
  query GetCategoryGroups(
    $userID: ID!
    $accessToken: String!
    $refreshToken: String!
    $budgetID: ID!
  ) {
    getCategoryGroups(
      userID: $userID
      accessToken: $accessToken
      refreshToken: $refreshToken
      budgetID: $budgetID
    ) {
      categoryGroupID
      categoryID
      categoryGroupName
      categoryName
      included
    }
  }
`;

export const GET_CATEGORY_GROUP_AMOUNTS = gql`
  query GetCategoryGroupAmounts($userBudgetInput: UserBudgetInput!) {
    categories(userBudgetInput: $userBudgetInput) {
      guid
      categoryGroupID
      categoryID
      amount
      extraAmount
      regularExpenseDetails {
        isMonthly
        monthsDivisor
      }
    }
  }
`;

export const GET_BUDGET_HELPER_DETAILS = gql`
  query GetBudgetHelperDetails(
    $userBudgetInput: UserBudgetInput!
    $accessToken: String!
    $refreshToken: String!
  ) {
    user(userBudgetInput: $userBudgetInput) {
      monthlyIncome
    }
    categories(
      userBudgetInput: $userBudgetInput
      accessToken: $accessToken
      refreshToken: $refreshToken
    ) {
      guid
      categoryGroupID
      categoryID
      categoryGroupName
      categoryName
      amount
      extraAmount
      isRegularExpense
      isUpcomingExpense
      regularExpenseDetails {
        isMonthly
        monthsDivisor
      }
    }
  }
`;

export const GET_CATEGORY_LIST = gql`
  query GetCategoryList(
    $userBudgetInput: UserBudgetInput!
    $accessToken: String!
    $refreshToken: String!
  ) {
    categories(
      userBudgetInput: $userBudgetInput
      accessToken: $accessToken
      refreshToken: $refreshToken
    ) {
      guid
      categoryGroupID
      categoryID
      categoryGroupName
      categoryName
      amount
      extraAmount
      isRegularExpense
      isUpcomingExpense
      regularExpenseDetails {
        isMonthly
        monthsDivisor
      }
    }
  }
`;

export const GET_CATEGORY_DETAILS = gql`
  query GetCategoryDetails(
    $userBudgetInput: UserBudgetInput!
    $categoryGUID: ID!
  ) {
    category(userBudgetInput: $userBudgetInput, categoryGUID: $categoryGUID) {
      guid
      categoryGroupID
      categoryID
      amount
      extraAmount
      isRegularExpense
      isUpcomingExpense
      regularExpenseDetails {
        isMonthly
        monthsDivisor
        nextDueDate
        repeatFreqNum
        repeatFreqType
        includeOnChart
        multipleTransactions
      }
      upcomingDetails {
        expenseAmount
      }
    }
  }
`;

export const GET_REGULAR_EXPENSES = gql`
  query GetRegularExpenses(
    $userBudgetInput: UserBudgetInput!
    $categoryGUID: ID
  ) {
    regularExpenses(
      userBudgetInput: $userBudgetInput
      categoryGUID: $categoryGUID
    ) {
      guid
      categoryGroupID
      categoryID
      amount
      extraAmount
      regularExpenseDetails {
        isMonthly
        monthsDivisor
      }
    }
  }
`;

export const GET_NEXT_UPCOMING_CATEGORY = gql`
  query GetNextUpcomingCategory($userBudgetInput: UserBudgetInput!) {
    nextUpcomingCategory(userBudgetInput: $userBudgetInput) {
      guid
      categoryID
      amount
      extraAmount
      regularExpenseDetails {
        isMonthly
        monthsDivisor
      }
      upcomingDetails {
        expenseAmount
      }
    }
  }
`;

export const GET_UPCOMING_CATEGORIES = gql`
  query GetUpcomingCategories(
    $userBudgetInput: UserBudgetInput!
    $categoryGUID: ID
  ) {
    upcomingCategories(
      userBudgetInput: $userBudgetInput
      categoryGUID: $categoryGUID
    ) {
      guid
      categoryID
      amount
      extraAmount
      regularExpenseDetails {
        isMonthly
        monthsDivisor
      }
      upcomingDetails {
        expenseAmount
      }
    }
  }
`;

export const GET_NEXT_AUTO_RUN = gql`
  query GetNextAutoRun($userBudgetInput: UserBudgetInput!) {
    nextAutoRun(userBudgetInput: $userBudgetInput) {
      runID
      runTime
    }
  }
`;

export const GET_UPCOMING_AUTO_RUNS = gql`
  query GetUpcomingAutoRuns($userBudgetInput: UserBudgetInput!) {
    autoRuns(userBudgetInput: $userBudgetInput) {
      runID
      runTime
      isLocked
      categories {
        categoryID
        categoryAmount
        categoryExtraAmount
        categoryAdjustedAmount
        categoryAdjAmountPerPaycheck
        postingMonths {
          postingMonth
          isIncluded
          amountToPost
        }
      }
    }
  }
`;

export const GET_PAST_AUTO_RUNS = gql`
  query GetPastAutoRuns($userBudgetInput: UserBudgetInput!) {
    pastAutoRuns(userBudgetInput: $userBudgetInput) {
      runID
      runTime
      categories {
        categoryID
        categoryAmount
        categoryExtraAmount
        categoryAdjustedAmount
        categoryAdjAmountPerPaycheck
        postingMonths {
          postingMonth
          amountPosted
          oldAmountBudgeted
          newAmountBudgeted
        }
      }
    }
  }
`;

export const GET_RUN_IDS_TO_LOCK = gql`
  query GetRunIDsToLock {
    runsToLock {
      runID
      categories {
        categoryID
        postingMonths
      }
    }
  }
`;
