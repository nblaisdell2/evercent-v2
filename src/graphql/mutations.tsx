import { gql } from "@apollo/client";

export const SAVE_YNAB_TOKENS = gql`
  mutation SaveYNABTokens(
    $userID: ID!
    $accessToken: String!
    $refreshToken: String!
    $expirationDate: String!
  ) {
    saveYNABTokens(
      userID: $userID
      accessToken: $accessToken
      refreshToken: $refreshToken
      expirationDate: $expirationDate
    )
  }
`;

export const GET_YNAB_INITIAL_DETAILS = gql`
  mutation GetYNABInitialDetails($userID: ID!, $authCode: String!) {
    getInitialYNABDetails(userID: $userID, authCode: $authCode)
  }
`;

export const REFRESH_YNAB_TOKENS = gql`
  mutation RefreshYNABTokens(
    $userID: ID!
    $refreshToken: String!
    $expirationDate: String!
  ) {
    refreshYNABTokens(
      userID: $userID
      refreshToken: $refreshToken
      expirationDate: $expirationDate
    ) {
      accessToken
      refreshToken
      expirationDate
    }
  }
`;

export const POST_AMOUNT_TO_BUDGET = gql`
  mutation PostAmountToBudget(
    $userID: ID!
    $accessToken: String!
    $budgetID: ID!
    $categoryID: ID!
    $month: String!
    $newBudgetedAmount: Float!
  ) {
    postAmountToBudget(
      userID: $userID
      accessToken: $accessToken
      budgetID: $budgetID
      categoryID: $categoryID
      month: $month
      newBudgetedAmount: $newBudgetedAmount
    )
  }
`;

export const UPDATE_DEFAULT_BUDGET_ID = gql`
  mutation UpdateDefaultBudgetID($userID: ID!, $newBudgetID: ID!) {
    updateBudgetID(userID: $userID, newBudgetID: $newBudgetID)
  }
`;

export const UPDATE_USER_DETAILS = gql`
  mutation UpdateUserDetails(
    $userBudgetInput: UserBudgetInput!
    $newMonthlyIncome: Int!
    $payFreq: String!
    $nextPaydate: String!
  ) {
    updateUserDetails(
      userBudgetInput: $userBudgetInput
      newMonthlyIncome: $newMonthlyIncome
      payFreq: $payFreq
      nextPaydate: $nextPaydate
    )
  }
`;

export const UPDATE_MONTHS_AHEAD_TARGET = gql`
  mutation UpdateMonthsAheadTarget(
    $userBudgetInput: UserBudgetInput!
    $newTarget: Int!
  ) {
    updateMonthsAheadTarget(
      userBudgetInput: $userBudgetInput
      newTarget: $newTarget
    )
  }
`;

export const UPDATE_CATEGORIES = gql`
  mutation UpdateCategories(
    $userBudgetInput: UserBudgetInput!
    $updateCategoriesInput: UpdateCategoriesInput!
  ) {
    updateCategories(
      userBudgetInput: $userBudgetInput
      updateCategoriesInput: $updateCategoriesInput
    )
  }
`;

export const UPDATE_CATEGORY_INCLUSION = gql`
  mutation UpdateCategoryInclusion(
    $userBudgetInput: UserBudgetInput!
    $categoriesToUpdate: UpdateExcludedCategoriesInput!
  ) {
    updateCategoryInclusion(
      userBudgetInput: $userBudgetInput
      updateCategoryInclusionInput: $categoriesToUpdate
    )
  }
`;

export const TOGGLE_CATEGORY_INCLUSION = gql`
  mutation ToggleCategoryInclusion(
    $userBudgetInput: UserBudgetInput!
    $categoryGUID: ID!
  ) {
    toggleCategoryInclusion(
      userBudgetInput: $userBudgetInput
      categoryGUID: $categoryGUID
    )
  }
`;

export const UPDATE_CATEGORY_MONTHS_DIVISOR = gql`
  mutation UpdateCategoryMonthsDivisor(
    $userBudgetInput: UserBudgetInput!
    $categoryGUID: ID!
  ) {
    updateCategoryMonthsDivisor(
      userBudgetInput: $userBudgetInput
      categoryGUID: $categoryGUID
    )
  }
`;

export const SAVE_AUTOMATION_RESULTS = gql`
  mutation SaveAutomationResults(
    $userBudgetInput: UserBudgetInput!
    $saveAutomationInput: SaveAutomationInput!
  ) {
    saveAutomationResults(
      userBudgetInput: $userBudgetInput
      saveAutomationInput: $saveAutomationInput
    )
  }
`;

export const CANCEL_AUTOMATION_RUNS = gql`
  mutation CancelAutomationRuns($userBudgetInput: UserBudgetInput!) {
    cancelAutomationRuns(userBudgetInput: $userBudgetInput)
  }
`;

export const LOAD_LOCKED_DETAILS = gql`
  mutation LoadLockedAutoRunDetails(
    $saveLockedResultsInput: SaveLockedResultsInput!
  ) {
    loadLockedAutoRunDetails(saveLockedResultsInput: $saveLockedResultsInput)
  }
`;

export const ADD_PAST_AUTO_RUN_RESULTS = gql`
  mutation AddPastAutoRunResults(
    $runID: ID!
    $savePastResultsInput: SavePastResultsInput!
  ) {
    addPastAutoRunResults(
      runID: $runID
      savePastResultsInput: $savePastResultsInput
    )
  }
`;

export const CLEANUP_AUTOMATION_RUN = gql`
  mutation CleanupAutomationRun($userBudgetInput: UserBudgetInput!) {
    cleanupAutomationRun(userBudgetInput: $userBudgetInput)
  }
`;
