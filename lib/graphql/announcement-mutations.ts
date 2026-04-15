import { gql } from "@apollo/client";

export const CREATE_ANNOUNCEMENT = gql`
  mutation CreateAnnouncement(
    $title: String!
    $content: String!
    $publishDate: String
    $expiryDate: String
    $isActive: Boolean
    $priority: Int
  ) {
    createAnnouncement(
      title: $title
      content: $content
      publishDate: $publishDate
      expiryDate: $expiryDate
      isActive: $isActive
      priority: $priority
    ) {
      success
      message
      announcement {
        id
        title
        content
        publishDate
        expiryDate
        isActive
        priority
        createdAt
        updatedAt
      }
    }
  }
`;

export const UPDATE_ANNOUNCEMENT = gql`
  mutation UpdateAnnouncement(
    $announcementId: ID!
    $title: String
    $content: String
    $publishDate: String
    $expiryDate: String
    $isActive: Boolean
    $priority: Int
  ) {
    updateAnnouncement(
      announcementId: $announcementId
      title: $title
      content: $content
      publishDate: $publishDate
      expiryDate: $expiryDate
      isActive: $isActive
      priority: $priority
    ) {
      success
      message
      announcement {
        id
        title
        content
        publishDate
        expiryDate
        isActive
        priority
        createdAt
        updatedAt
      }
    }
  }
`;

export const DELETE_ANNOUNCEMENT = gql`
  mutation DeleteAnnouncement($announcementId: ID!) {
    deleteAnnouncement(announcementId: $announcementId) {
      success
      message
    }
  }
`;

export const TOGGLE_ANNOUNCEMENT_ACTIVE = gql`
  mutation ToggleAnnouncementActive($announcementId: ID!) {
    toggleAnnouncementActive(announcementId: $announcementId) {
      success
      message
      announcement {
        id
        title
        isActive
      }
    }
  }
`;
