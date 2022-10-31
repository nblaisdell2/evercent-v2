import { gql } from "apollo-server-micro";

export const typeDefs = gql`
  # ===========
  #   TYPES
  # ===========
  type UserID {
    id: ID!
    defaultBudgetID: ID
  }

  type User {
    id: ID!
    email: String!
    username: String!
    defaultBudgetID: ID
    monthlyIncome: Int!
    monthsAheadTarget: Int!
    payFrequency: String!
    nextPaydate: String!
  }

  type YNABConnection {
    accessToken: String!
    refreshToken: String!
    expirationDate: String!
  }

  type Budget {
    id: ID!
    name: String!
  }

  # TODO: Should this be re-factored to have a list of BudgetCategoryGroup objects,
  #       each of which has a list of categories, or just have a list of categories
  #       like it is now?
  type BudgetMonth {
    month: String!
    categories: [BudgetCategory!]
  }

  type BudgetCategory {
    categoryGroupID: ID!
    categoryGroupName: String!
    categoryID: ID!
    name: String!
    budgeted: Float!
    activity: Float!
    available: Float!
  }

  type Category {
    guid: ID!
    budgetID: ID!
    categoryGroupID: ID!
    categoryID: ID!
    amount: Int!
    extraAmount: Int
    isRegularExpense: Boolean!
    isUpcomingExpense: Boolean!
    regularExpenseDetails: RegularExpenseDetails
    upcomingDetails: UpcomingDetails
  }

  type RegularExpenseDetails {
    guid: ID!
    isMonthly: Boolean
    nextDueDate: String
    monthsDivisor: Int
    repeatFreqNum: Int
    repeatFreqType: String
    includeOnChart: Boolean
    multipleTransactions: Boolean
  }

  type UpcomingDetails {
    guid: ID!
    expenseAmount: Int
  }

  type AutoRun {
    runID: ID!
    runTime: String!
    isLocked: Boolean!
    categories: [AutoRunCategory]
  }

  type AutoRunCategory {
    categoryID: ID!
    categoryAmount: Float!
    categoryExtraAmount: Float!
    categoryAdjustedAmount: Float!
    categoryAdjAmountPerPaycheck: Float!
    postingMonths: [AutoRunCategoryMonth]
  }

  type AutoRunCategoryMonth {
    postingMonth: String!
    isIncluded: Boolean!
    amountToPost: Float
    amountPosted: Float
    oldAmountBudgeted: Float
    newAmountBudgeted: Float
  }

  type RunsToLock {
    runID: ID!
    categories: [RunToLockCategory]
  }

  type RunToLockCategory {
    categoryID: ID!
    postingMonths: [String]
  }

  # ===========
  #   INPUTS
  # ===========
  input UserBudgetInput {
    userID: ID!
    budgetID: ID
  }

  input UpdateCategoriesInput {
    details: [UpdateCategoriesDetailsInput]
    expense: [UpdateCategoriesExpenseInput]
    upcoming: [UpdateCategoriesUpcomingInput]
  }

  input UpdateCategoriesDetailsInput {
    guid: ID!
    categoryGroupID: ID!
    categoryID: ID!
    amount: Int!
    extraAmount: Int!
    isRegularExpense: Boolean!
    isUpcomingExpense: Boolean!
  }

  input UpdateCategoriesExpenseInput {
    guid: ID!
    isMonthly: Boolean!
    nextDueDate: String!
    expenseMonthsDivisor: Int
    repeatFreqNum: Int!
    repeatFreqType: String!
    includeOnChart: Boolean!
    multipleTransactions: Boolean!
  }

  input UpdateCategoriesUpcomingInput {
    guid: ID!
    totalExpenseAmount: Int!
  }

  input SaveAutomationInput {
    upcomingRuns: [SaveAutomationUpcomingRun!]
    toggledCategories: [ToggledCategory!]
  }

  input SaveAutomationUpcomingRun {
    runTime: String!
  }

  input ToggledCategory {
    categoryGUID: ID!
    postingMonth: String!
  }

  input SaveLockedResultsInput {
    results: [SaveLockedResultsInputFields!]
  }

  input SaveLockedResultsInputFields {
    runID: ID!
    categoryID: ID!
    postingMonth: String!
    amountToPost: Int!
    isIncluded: Boolean!
    categoryAmount: Int!
    categoryExtraAmount: Int!
    categoryAdjustedAmount: Int!
    categoryAdjAmountPerPaycheck: Int!
  }

  input SavePastResultsInput {
    categoryID: ID!
    categoryAmount: Int!
    categoryExtraAmount: Int!
    categoryAdjustedAmount: Int!
    categoryAdjAmountPerPaycheck: Int!
    postingMonth: String!
    oldAmountBudgeted: Float!
    amountPosted: Float!
    newAmountBudgeted: Float!
  }

  # ===========
  #  QUERIES
  # ===========
  type Query {
    userID(userEmail: String!): UserID!
    user(userBudgetInput: UserBudgetInput!): User!
    ynabConnDetails(userID: ID!): YNABConnection
    getNewAccessToken(userID: ID!, authCode: String!): YNABConnection
    getDefaultBudgetID(
      userID: ID!
      accessToken: String!
      refreshToken: String!
    ): ID!
    budgets(userID: ID!, accessToken: String!, refreshToken: String!): [Budget!]
    budgetName(
      userID: ID!
      accessToken: String!
      refreshToken: String!
      budgetID: ID!
    ): String!
    budgetMonths(
      userID: ID!
      accessToken: String!
      refreshToken: String!
      budgetID: ID!
    ): [BudgetMonth]
    categories(userBudgetInput: UserBudgetInput!): [Category!]
    category(userBudgetInput: UserBudgetInput!, categoryGUID: ID!): Category!
    regularExpenses(
      userBudgetInput: UserBudgetInput!
      categoryGUID: ID
    ): [Category!]
    nextUpcomingCategory(userBudgetInput: UserBudgetInput!): Category!
    upcomingCategories(
      userBudgetInput: UserBudgetInput!
      categoryGUID: ID
    ): [Category!]
    nextAutoRun(userBudgetInput: UserBudgetInput!): AutoRun
    autoRuns(userBudgetInput: UserBudgetInput!): [AutoRun!]
    pastAutoRuns(userBudgetInput: UserBudgetInput!): [AutoRun!]
    runsToLock: [RunsToLock!]
  }

  # ===========
  #  MUTATIONS
  # ===========
  type Mutation {
    saveYNABTokens(
      userID: ID!
      accessToken: String!
      refreshToken: String!
      expirationDate: String!
    ): String
    refreshYNABTokens(
      userID: ID!
      refreshToken: String!
      expirationDate: String!
    ): YNABConnection
    postAmountToBudget(
      userID: ID!
      accessToken: String!
      refreshToken: String!
      budgetID: ID!
      categoryID: ID!
      month: String!
      newBudgetedAmount: Float!
    ): String
    updateBudgetID(userID: ID!, newBudgetID: ID!): String
    updateUserDetails(
      userBudgetInput: UserBudgetInput!
      newMonthlyIncome: Int!
      payFreq: String!
      nextPaydate: String!
    ): String
    updateMonthsAheadTarget(
      userBudgetInput: UserBudgetInput!
      newTarget: Int!
    ): String
    updateCategories(
      userBudgetInput: UserBudgetInput!
      updateCategoriesInput: UpdateCategoriesInput!
    ): String
    toggleCategoryInclusion(
      userBudgetInput: UserBudgetInput!
      categoryGUID: ID!
    ): String
    updateCategoryMonthsDivisor(
      userBudgetInput: UserBudgetInput!
      categoryGUID: ID!
    ): String
    saveAutomationResults(
      userBudgetInput: UserBudgetInput!
      saveAutomationInput: SaveAutomationInput!
    ): String
    cancelAutomationRuns(userBudgetInput: UserBudgetInput!): String
  }
`;
