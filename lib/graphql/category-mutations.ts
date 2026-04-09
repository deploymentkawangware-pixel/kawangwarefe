import { gql } from '@apollo/client';

export const CREATE_CATEGORY = gql`
  mutation CreateCategory(
    $name: String!
    $code: String!
    $description: String
    $routingMode: String
    $fallbackIfNoGroup: String
    $allowedGroupIds: [ID!]
  ) {
    createCategory(
      name: $name
      code: $code
      description: $description
      routingMode: $routingMode
      fallbackIfNoGroup: $fallbackIfNoGroup
      allowedGroupIds: $allowedGroupIds
    ) {
      success
      message
      category {
        id
        name
        code
        description
        isActive
        routingMode
        fallbackIfNoGroup
        allowedGroups {
          id
          name
        }
      }
    }
  }
`;

export const UPDATE_CATEGORY = gql`
  mutation UpdateCategory(
    $categoryId: ID!
    $name: String
    $code: String
    $description: String
    $isActive: Boolean
    $routingMode: String
    $fallbackIfNoGroup: String
    $allowedGroupIds: [ID!]
  ) {
    updateCategory(
      categoryId: $categoryId
      name: $name
      code: $code
      description: $description
      isActive: $isActive
      routingMode: $routingMode
      fallbackIfNoGroup: $fallbackIfNoGroup
      allowedGroupIds: $allowedGroupIds
    ) {
      success
      message
      category {
        id
        name
        code
        description
        isActive
        routingMode
        fallbackIfNoGroup
        allowedGroups {
          id
          name
        }
      }
    }
  }
`;

export const DELETE_CATEGORY = gql`
  mutation DeleteCategory($categoryId: ID!) {
    deleteCategory(categoryId: $categoryId) {
      success
      message
    }
  }
`;

export const GET_ALL_CATEGORIES = gql`
  query GetAllCategories {
    contributionCategories {
      id
      name
      code
      description
      isActive
      routingMode
      fallbackIfNoGroup
      allowedGroups {
        id
        name
      }
    }
  }
`;
