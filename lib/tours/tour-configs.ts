/**
 * Tour Configuration Examples
 * These are ready-to-use tour definitions for the three initial onboarding flows
 */

import type { Config } from 'driver.js';

/**
 * Welcome Tour - Introduces new users to the main dashboard
 * Targets: Header, Stats Cards, Quick Actions
 * Trigger: First login (check isNewMember from auth response)
 */
export const WELCOME_TOUR_CONFIG: Config = {
  showProgress: true,
  allowClose: true,
  overlayOpacity: 0.5,
  stagePadding: 10,
  steps: [
    {
      element: '[data-tour="header"]',
      popover: {
        title: 'Welcome to Church Funds System',
        description: 'Track contributions, manage giving, and stay connected with your church community.',
        side: 'bottom',
        align: 'center',
      },
    },
    {
      element: '[data-tour="stats-cards"]',
      popover: {
        title: 'Dashboard Overview',
        description: 'See your giving statistics at a glance: total contributions, this month\'s gifts, and transaction count.',
        side: 'bottom',
        align: 'center',
      },
    },
    {
      element: '[data-tour="new-contribution-btn"]',
      popover: {
        title: 'Make a Contribution',
        description: 'Click here to give financially to your church through M-Pesa or other payment methods.',
        side: 'left',
        align: 'center',
      },
    },
    {
      element: '[data-tour="contribution-history"]',
      popover: {
        title: 'Your Giving History',
        description: 'View all your past contributions with dates, amounts, and confirmation details.',
        side: 'top',
        align: 'center',
      },
    },
  ],
};

/**
 * Contribution Flow Tour - Guides users through making their first contribution
 * Targets: Category Selector, Amount Input, Payment Method
 * Trigger: User navigates to contribution page for first time
 */
export const CONTRIBUTION_FLOW_TOUR_CONFIG: Config = {
  showProgress: true,
  allowClose: true,
  overlayOpacity: 0.5,
  stagePadding: 10,
  steps: [
    {
      element: '[data-tour="contribution-header"]',
      popover: {
        title: 'Make a Contribution',
        description: 'You can give financially to different departments and causes within the church.',
        side: 'bottom',
        align: 'center',
      },
    },
    {
      element: '[data-tour="category-selector"]',
      popover: {
        title: 'Choose a Department',
        description: 'Select which church department or cause you want to contribute to. Each category supports different ministries.',
        side: 'bottom',
        align: 'center',
      },
    },
    {
      element: '[data-tour="amount-input"]',
      popover: {
        title: 'Enter Amount',
        description: 'Type the amount you wish to give in Kenya Shillings (KES). You can give any amount.',
        side: 'left',
        align: 'center',
      },
    },
    {
      element: '[data-tour="payment-method"]',
      popover: {
        title: 'Payment Method',
        description: 'Choose how you want to pay: M-Pesa or manual bank transfer. M-Pesa is instant and immediate.',
        side: 'bottom',
        align: 'center',
      },
    },
    {
      element: '[data-tour="contribute-btn"]',
      popover: {
        title: 'Complete Your Contribution',
        description: 'Click "Contribute" to proceed with payment. You\'ll receive a confirmation after.',
        side: 'top',
        align: 'center',
      },
    },
  ],
};

/**
 * Admin Dashboard Tour - Teaches admin users dashboard navigation
 * Targets: Stats Overview, Member Management, Reports
 * Trigger: When user with admin role accesses admin panel
 */
export const ADMIN_DASHBOARD_TOUR_CONFIG: Config = {
  showProgress: true,
  allowClose: true,
  overlayOpacity: 0.5,
  stagePadding: 10,
  steps: [
    {
      element: '[data-tour="admin-header"]',
      popover: {
        title: 'Admin Dashboard',
        description: 'Welcome! This is your administrative hub for managing church finances and members.',
        side: 'bottom',
        align: 'center',
      },
    },
    {
      element: '[data-tour="admin-stats"]',
      popover: {
        title: 'Financial Overview',
        description: 'View total contributions received, today\'s receipts, member count, and active contributions this month.',
        side: 'bottom',
        align: 'center',
      },
    },
    {
      element: '[data-tour="contributions-table"]',
      popover: {
        title: 'Contribution Records',
        description: 'Browse all contributions with member details, amounts, dates, and payment status. Use filters to search.',
        side: 'top',
        align: 'center',
      },
    },
    {
      element: '[data-tour="admin-filters"]',
      popover: {
        title: 'Advanced Filtering',
        description: 'Filter contributions by date range, category, member, or payment status. Export reports with the button below.',
        side: 'left',
        align: 'center',
      },
    },
    {
      element: '[data-tour="member-mgmt-btn"]',
      popover: {
        title: 'Member Management',
        description: 'Access the member management section to add, edit, or manage church member records and roles.',
        side: 'left',
        align: 'center',
      },
    },
    {
      element: '[data-tour="reports-btn"]',
      popover: {
        title: 'Reports & Analytics',
        description: 'Generate detailed reports about giving patterns, member activity, and financial summaries.',
        side: 'left',
        align: 'center',
      },
    },
  ],
};

/**
 * Tour Step Helpers - Reusable configurations
 */

// Standard step configuration preset
export const defaultStepConfig = {
  side: 'bottom' as const,
  align: 'center' as const,
};

// Mobile-friendly step configuration
export const mobileStepConfig = {
  side: 'bottom' as const,
  align: 'center' as const,
};

/**
 * Helper function to create a custom tour config
 */
export function createTourConfig(
  steps: Array<{
    element: string;
    title: string;
    description: string;
    side?: 'left' | 'right' | 'top' | 'bottom';
    align?: 'start' | 'center' | 'end';
  }>
): Config {
  return {
    showProgress: true,
    allowClose: true,
    overlayOpacity: 0.5,
    stagePadding: 10,
    steps: steps.map((step) => ({
      element: step.element,
      popover: {
        title: step.title,
        description: step.description,
        side: step.side || 'bottom',
        align: step.align || 'center',
      },
    })),
  };
}
