/**
 * Member Dashboard Page
 * Sprint 2: Authentication & Member Dashboard
 *
 * Shows contribution history, summary cards, and charts
 */

"use client";

import { ProtectedRoute } from "@/components/auth/protected-route";
import { MemberLayout } from "@/components/layouts/member-layout";
import { useAuth } from "@/lib/auth/auth-context";
import { useQuery } from "@apollo/client/react";
import { GET_MY_CONTRIBUTIONS } from "@/lib/graphql/queries";
import { GET_DASHBOARD_STATS } from "@/lib/graphql/admin-queries";
import { useMyCategoryAdminRoles } from "@/lib/hooks/use-category-admin";
import { useUserRole } from "@/lib/hooks/use-user-role";
import { useTour } from "@/hooks/use-tour";
import { WELCOME_TOUR_CONFIG } from "@/lib/tours/tour-configs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { TrendingUp, DollarSign, Calendar, Shield, FolderKey } from "lucide-react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import { useEffect } from "react";

interface Contribution {
  id: string;
  amount: string;
  status: string;
  transactionDate: string | null;
  category: {
    id: string;
    name: string;
    code: string;
  };
  mpesaTransaction: {
    id: string;
    mpesaReceiptNumber: string | null;
    status: string;
  } | null;
}

interface ContributionsData {
  myContributions: Contribution[];
}

interface DashboardStatsData {
  dashboardStats: {
    todayTotal: string;
  };
}

function DashboardContent() {
  const router = useRouter();
  const { user } = useAuth();
  const { start: startWelcomeTour, isReady } = useTour({
    tourKey: "welcome_tour",
    steps: WELCOME_TOUR_CONFIG.steps || [],
    autoStart: false,
  });

  const { data, loading, error } = useQuery<ContributionsData>(GET_MY_CONTRIBUTIONS, {
    variables: {
      phoneNumber: user?.phoneNumber,
      limit: 50,
    },
    skip: !user?.phoneNumber,
  });

  // Check if user has admin/staff access by trying to query dashboard stats
  const { data: adminCheck } = useQuery<DashboardStatsData>(GET_DASHBOARD_STATS, {
    errorPolicy: "ignore", // Ignore permission errors
  });

  const isStaff = !!adminCheck?.dashboardStats;

  // Get category admin roles
  const { roles: categoryAdminRoles, isAnyCategoryAdmin } = useMyCategoryAdminRoles();

  // Check if user has content admin role
  const { isContentAdmin } = useUserRole();

  // Calculate contributions early for useEffect dependency
  const contributions = data?.myContributions || [];

  // Auto-start welcome tour for new users (optional - remove if not wanted)
  useEffect(() => {
    if (isReady && contributions.length === 0) {
      // Auto-start for new users with no contributions
      const timer = setTimeout(() => {
        startWelcomeTour();
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [isReady, contributions.length, startWelcomeTour]);

  // Calculate summary stats
  const totalContributions = contributions
    .filter((c) => c.status === "completed")
    .reduce((sum, c) => sum + Number.parseFloat(c.amount), 0);

  const thisMonth = new Date();
  const monthlyContributions = contributions
    .filter((c) => {
      if (c.status !== "completed" || !c.transactionDate) return false;
      const date = new Date(c.transactionDate);
      return (
        date.getMonth() === thisMonth.getMonth() &&
        date.getFullYear() === thisMonth.getFullYear()
      );
    })
    .reduce((sum, c) => sum + Number.parseFloat(c.amount), 0);

  const completedCount = contributions.filter((c) => c.status === "completed").length;

  return (
    <ProtectedRoute>
      <MemberLayout>
        <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800">
          {/* Header */}
          <header data-tour="dashboard-header" className="bg-white dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
              <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                <div>
                  <h1 className="text-2xl font-bold">My Dashboard</h1>
                  <p className="text-sm text-muted-foreground">Welcome, {user?.fullName}</p>
                </div>
              </div>
            </div>
          </header>

          {/* Main Content */}
          <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 pb-20 md:pb-8">
        <Card data-tour="dashboard-snapshot" className="mb-6 border-teal-200/70 bg-white/80 dark:bg-slate-800/80 backdrop-blur">
          <CardContent className="p-4 sm:p-5">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div className="space-y-1">
                <p className="text-xs font-semibold uppercase tracking-wide text-teal-600 dark:text-teal-400">
                  Your Giving Snapshot
                </p>
                <h2 className="text-lg font-semibold">View total contributions and breakdown</h2>
                <p className="text-sm text-muted-foreground">
                  Tap to see your full totals by department, purpose, and group.
                </p>
              </div>
              <div className="flex flex-wrap gap-2">
                <Button variant="default" onClick={() => router.push("/profile#contribution-totals")}>
                  View Totals
                </Button>
                <Button variant="outline" onClick={() => router.push("/contribute")}>
                  Give Now
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Summary Cards */}
        <div data-tour="dashboard-stats" className="grid md:grid-cols-3 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Contributions</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                KES {totalContributions.toLocaleString()}
              </div>
              <p className="text-xs text-muted-foreground">
                {completedCount} completed transactions
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">This Month</CardTitle>
              <Calendar className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                KES {monthlyContributions.toLocaleString()}
              </div>
              <p className="text-xs text-muted-foreground">
                {thisMonth.toLocaleString("default", { month: "long", year: "numeric" })}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Status</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">Active</div>
              <p className="text-xs text-muted-foreground">
                Member since {new Date().getFullYear()}
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Department Admin Roles */}
        {isAnyCategoryAdmin && (
          <Card className="mb-8 border-blue-200 dark:border-blue-800">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FolderKey className="h-5 w-5 text-blue-600" />
                Your Department Admin Roles
              </CardTitle>
              <CardDescription>
                You have admin privileges for the following contribution departments
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-2">
                {categoryAdminRoles.map((role) => (
                  <div
                    key={role.id}
                    className="inline-flex items-center gap-2 px-3 py-2 bg-blue-50 dark:bg-blue-900/30 border border-blue-200 dark:border-blue-800 rounded-lg"
                  >
                    <Shield className="h-4 w-4 text-blue-600" />
                    <div>
                      <p className="font-medium text-sm">{role.category.name}</p>
                      <p className="text-xs text-muted-foreground">
                        Since {new Date(role.assignedAt).toLocaleDateString("en-GB", {
                          day: "2-digit",
                          month: "short",
                          year: "numeric",
                        })}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
              <p className="text-sm text-muted-foreground mt-4">
                As a department admin, you can view and manage contributions for your assigned departments.
              </p>
            </CardContent>
          </Card>
        )}

        {/* Contribution History */}
        <Card>
          <CardHeader>
            <CardTitle>Contribution History</CardTitle>
            <CardDescription>
              View all your past contributions and their status
            </CardDescription>
          </CardHeader>
          <CardContent data-tour="dashboard-history">
            {loading && (
              <div className="text-center py-8 text-muted-foreground">
                Loading contributions...
              </div>
            )}

            {error && (
              <div className="text-center py-8 text-red-600">
                Error loading contributions: {error.message}
              </div>
            )}

            {!loading && !error && contributions.length === 0 && (
              <div className="text-center py-8 text-muted-foreground">
                <p>No contributions yet</p>
                <Button
                  className="mt-4"
                  onClick={() => router.push("/contribute")}
                >
                  Make Your First Contribution
                </Button>
              </div>
            )}

            {!loading && !error && contributions.length > 0 && (
              <>
              {/* Mobile card view */}
              <div className="space-y-3 md:hidden">
                {contributions.map((contribution) => (
                  <div key={contribution.id} className="border rounded-lg p-3 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="font-semibold">
                        KES {Number.parseFloat(contribution.amount).toLocaleString()}
                      </span>
                      <span
                        className={`inline-block px-2 py-1 text-xs rounded-full ${
                          contribution.status === "completed"
                            ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100"
                            : contribution.status === "failed"
                            ? "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-100"
                            : "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-100"
                        }`}
                      >
                        {contribution.status}
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-sm text-muted-foreground">
                      <span>{contribution.category.name}</span>
                      <span>
                        {contribution.transactionDate
                          ? new Date(contribution.transactionDate).toLocaleDateString()
                          : "Pending"}
                      </span>
                    </div>
                    {contribution.mpesaTransaction?.mpesaReceiptNumber && (
                      <div className="text-xs font-mono text-muted-foreground">
                        Receipt: {contribution.mpesaTransaction.mpesaReceiptNumber}
                      </div>
                    )}
                  </div>
                ))}
              </div>

              {/* Desktop table view */}
              <div className="overflow-x-auto hidden md:block">
                <table className="w-full">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left p-2 font-medium">Date</th>
                      <th className="text-left p-2 font-medium">Department</th>
                      <th className="text-right p-2 font-medium">Amount</th>
                      <th className="text-center p-2 font-medium">Status</th>
                      <th className="text-left p-2 font-medium">Receipt</th>
                    </tr>
                  </thead>
                  <tbody>
                    {contributions.map((contribution) => (
                      <tr key={contribution.id} className="border-b hover:bg-slate-50 dark:hover:bg-slate-800">
                        <td className="p-2 text-sm">
                          {contribution.transactionDate
                            ? new Date(contribution.transactionDate).toLocaleDateString()
                            : "Pending"}
                        </td>
                        <td className="p-2 text-sm">{contribution.category.name}</td>
                        <td className="p-2 text-sm text-right font-semibold">
                          KES {Number.parseFloat(contribution.amount).toLocaleString()}
                        </td>
                        <td className="p-2 text-center">
                          <span
                            className={`inline-block px-2 py-1 text-xs rounded-full ${
                              contribution.status === "completed"
                                ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100"
                                : contribution.status === "failed"
                                ? "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-100"
                                : "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-100"
                            }`}
                          >
                            {contribution.status}
                          </span>
                        </td>
                        <td className="p-2 text-sm font-mono">
                          {contribution.mpesaTransaction?.mpesaReceiptNumber || "-"}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              </>
            )}
          </CardContent>
        </Card>
          </main>
        </div>
      </MemberLayout>
    </ProtectedRoute>
  );
}

export default function DashboardPage() {
  return <DashboardContent />;
}
