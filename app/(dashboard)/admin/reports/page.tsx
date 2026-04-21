/**
 * Admin Reports Page
 * Sprint 4: Reporting System
 *
 * Allows staff to generate and download contribution reports
 */

"use client";

import { useMemo, useState } from "react";
import { useMutation, useQuery } from "@apollo/client/react";
import { GENERATE_CONTRIBUTION_REPORT } from "@/lib/graphql/mutations";
import { GET_CONTRIBUTION_CATEGORIES, GET_DEPARTMENT_PURPOSES } from "@/lib/graphql/queries";
import { GET_DEPARTMENT_ROUTING_REPORT } from "@/lib/graphql/admin-queries";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { AdminLayout } from "@/components/layouts/admin-layout";
import { AdminProtectedRoute } from "@/components/auth/admin-protected-route";
import { useUserRole } from "@/lib/hooks/use-user-role";
import { Checkbox } from "@/components/ui/checkbox";
import { Download, FileText, Table as TableIcon, Calendar } from "lucide-react";
import toast from "react-hot-toast";

interface Category {
  id: string;
  name: string;
  code: string;
}

interface CategoriesData {
  contributionCategories: Category[];
}

interface Purpose {
  id: string;
  name: string;
  code: string;
}

interface PurposesData {
  departmentPurposes: Purpose[];
}

interface ReportResponse {
  generateContributionReport: {
    success: boolean;
    message: string;
    fileData: string | null;
    filename: string | null;
    contentType: string | null;
  };
}

interface DepartmentRoutingSummary {
  totalCompletedAmount: string;
  totalCompletedCount: number;
  guestTopLevelAmount: string;
  guestTopLevelCount: number;
  memberRoutedAmount: string;
  memberRoutedCount: number;
  memberTopLevelAmount: string;
  memberTopLevelCount: number;
}

interface DepartmentBreakdownItem {
  departmentId: string;
  departmentName: string;
  departmentCode: string;
  totalAmount: string;
  totalCount: number;
}

interface DepartmentPurposeBreakdownItem {
  departmentId: string;
  departmentName: string;
  departmentCode: string;
  purposeId: string;
  purposeName: string;
  purposeCode: string;
  totalAmount: string;
  totalCount: number;
}

interface DepartmentGroupBreakdownItem {
  departmentId: string;
  departmentName: string;
  departmentCode: string;
  groupId: string | null;
  groupName: string;
  isTopLevel: boolean;
  totalAmount: string;
  totalCount: number;
}

interface DepartmentRoutingReportData {
  departmentRoutingReport: {
    summary: DepartmentRoutingSummary;
    byDepartment: DepartmentBreakdownItem[];
    byDepartmentPurpose: DepartmentPurposeBreakdownItem[];
    byDepartmentGroup: DepartmentGroupBreakdownItem[];
  };
}

function ReportsPageContent() {
  const { isStaff, isCategoryAdmin, adminCategoryIds } = useUserRole();
  const [reportType, setReportType] = useState<string>("daily");
  const [format, setFormat] = useState<string>("excel");
  const [dateFrom, setDateFrom] = useState<string>("");
  const [dateTo, setDateTo] = useState<string>("");
  const [selectedCategoryIds, setSelectedCategoryIds] = useState<string[]>([]);
  const [analyticsCategoryId, setAnalyticsCategoryId] = useState<string>("all");
  const [analyticsPurposeId, setAnalyticsPurposeId] = useState<string>("all");
  const [analyticsGroupId, setAnalyticsGroupId] = useState<string>("all");
  const [analyticsRoutingType, setAnalyticsRoutingType] = useState<string>("all");
  const [activeBreakdownTab, setActiveBreakdownTab] = useState<"department" | "purpose" | "group">("department");
  const [breakdownSortBy, setBreakdownSortBy] = useState<"amount" | "count">("amount");
  const [breakdownSortDirection, setBreakdownSortDirection] = useState<"desc" | "asc">("desc");
  const [breakdownPage, setBreakdownPage] = useState<number>(1);
  const [breakdownPageSize, setBreakdownPageSize] = useState<number>(10);

  const { data: categoriesData } = useQuery<CategoriesData>(GET_CONTRIBUTION_CATEGORIES);
  const allCategories = categoriesData?.contributionCategories || [];
  const categories = isCategoryAdmin && !isStaff
    ? allCategories.filter((category) => adminCategoryIds.includes(category.id))
    : allCategories;

  const selectedAnalyticsCategoryId = analyticsCategoryId === "all" ? undefined : analyticsCategoryId;
  const { data: purposesData } = useQuery<PurposesData>(GET_DEPARTMENT_PURPOSES, {
    variables: { categoryId: selectedAnalyticsCategoryId, isActive: null },
    skip: !selectedAnalyticsCategoryId,
  });
  const analyticsPurposes = purposesData?.departmentPurposes || [];

  const customDateFrom = reportType === "custom" && dateFrom
    ? new Date(dateFrom).toISOString()
    : null;
  const customDateTo = reportType === "custom" && dateTo
    ? new Date(dateTo).toISOString()
    : null;

  const selectedExportCategoryIds = selectedCategoryIds.length > 0
    ? selectedCategoryIds
    : (analyticsCategoryId !== "all" ? [analyticsCategoryId] : []);

  const {
    data: routingReportData,
    loading: routingReportLoading,
  } = useQuery<DepartmentRoutingReportData>(GET_DEPARTMENT_ROUTING_REPORT, {
    variables: {
      dateFrom: customDateFrom,
      dateTo: customDateTo,
      categoryId: selectedAnalyticsCategoryId,
      purposeId: analyticsPurposeId === "all" ? null : analyticsPurposeId,
      groupId: analyticsGroupId === "all" ? null : analyticsGroupId,
      routingType: analyticsRoutingType === "all" ? null : analyticsRoutingType,
    },
  });

  const [generateReport, { loading }] = useMutation<ReportResponse>(GENERATE_CONTRIBUTION_REPORT, {
    onCompleted: (data) => {
      if (data.generateContributionReport.success) {
        toast.success(data.generateContributionReport.message);

        // Download the file
        if (data.generateContributionReport.fileData && data.generateContributionReport.filename) {
          downloadFile(
            data.generateContributionReport.fileData,
            data.generateContributionReport.filename,
            data.generateContributionReport.contentType || "application/octet-stream"
          );
        }
      } else {
        toast.error(data.generateContributionReport.message);
      }
    },
    onError: (error) => {
      toast.error(`Error: ${error.message}`);
    },
  });

  const downloadFile = (base64Data: string, filename: string, contentType: string) => {
    // Convert base64 to blob
    const byteCharacters = atob(base64Data);
    const byteNumbers = new Array(byteCharacters.length);
    for (let i = 0; i < byteCharacters.length; i++) {
      byteNumbers[i] = byteCharacters.codePointAt(i) ?? 0;
    }
    const byteArray = new Uint8Array(byteNumbers);
    const blob = new Blob([byteArray], { type: contentType });

    // Create download link
    const url = globalThis.URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    link.remove();
    globalThis.URL.revokeObjectURL(url);
  };

  const handleGenerateReport = () => {
    // Validate custom date range
    if (reportType === "custom" && (!dateFrom || !dateTo)) {
      toast.error("Please select both start and end dates for custom reports");
      return;
    }

    if (reportType === "custom" && new Date(dateFrom) > new Date(dateTo)) {
      toast.error("Start date must be before end date");
      return;
    }

    generateReport({
      variables: {
        format,
        reportType,
        dateFrom: customDateFrom,
        dateTo: customDateTo,
        categoryIds: selectedExportCategoryIds.length > 0
          ? selectedExportCategoryIds.map((id) => Number.parseInt(id, 10))
          : null,
        purposeId: analyticsPurposeId === "all" ? null : Number.parseInt(analyticsPurposeId, 10),
        groupId: analyticsGroupId === "all" ? null : Number.parseInt(analyticsGroupId, 10),
        routingType: analyticsRoutingType === "all" ? null : analyticsRoutingType,
        memberId: null, // Can be added later if needed
      },
    });
  };

  const routingSummary = routingReportData?.departmentRoutingReport?.summary;
  const allDepartmentBreakdown = routingReportData?.departmentRoutingReport?.byDepartment || [];
  const allPurposeBreakdown = routingReportData?.departmentRoutingReport?.byDepartmentPurpose || [];
  const allGroupBreakdown = routingReportData?.departmentRoutingReport?.byDepartmentGroup || [];
  const analyticsGroups = allGroupBreakdown
    .filter((row) => row.groupId)
    .reduce<Array<{ id: string; name: string }>>((acc, row) => {
      if (!row.groupId || acc.some((group) => group.id === row.groupId)) {
        return acc;
      }
      acc.push({ id: row.groupId, name: row.groupName });
      return acc;
    }, []);
  const topDepartments = (routingReportData?.departmentRoutingReport?.byDepartment || []).slice(0, 5);
  const topPurposeBreakdown = (routingReportData?.departmentRoutingReport?.byDepartmentPurpose || []).slice(0, 5);
  const topGroupBreakdown = (routingReportData?.departmentRoutingReport?.byDepartmentGroup || []).slice(0, 5);

  const sortedDepartmentBreakdown = useMemo(() => {
    const rows = [...allDepartmentBreakdown];
    rows.sort((a, b) => {
      const left = breakdownSortBy === "amount" ? Number(a.totalAmount) : a.totalCount;
      const right = breakdownSortBy === "amount" ? Number(b.totalAmount) : b.totalCount;
      return breakdownSortDirection === "desc" ? right - left : left - right;
    });
    return rows;
  }, [allDepartmentBreakdown, breakdownSortBy, breakdownSortDirection]);

  const sortedPurposeBreakdown = useMemo(() => {
    const rows = [...allPurposeBreakdown];
    rows.sort((a, b) => {
      const left = breakdownSortBy === "amount" ? Number(a.totalAmount) : a.totalCount;
      const right = breakdownSortBy === "amount" ? Number(b.totalAmount) : b.totalCount;
      return breakdownSortDirection === "desc" ? right - left : left - right;
    });
    return rows;
  }, [allPurposeBreakdown, breakdownSortBy, breakdownSortDirection]);

  const sortedGroupBreakdown = useMemo(() => {
    const rows = [...allGroupBreakdown];
    rows.sort((a, b) => {
      const left = breakdownSortBy === "amount" ? Number(a.totalAmount) : a.totalCount;
      const right = breakdownSortBy === "amount" ? Number(b.totalAmount) : b.totalCount;
      return breakdownSortDirection === "desc" ? right - left : left - right;
    });
    return rows;
  }, [allGroupBreakdown, breakdownSortBy, breakdownSortDirection]);

  const activeRowsCount = activeBreakdownTab === "department"
    ? sortedDepartmentBreakdown.length
    : activeBreakdownTab === "purpose"
      ? sortedPurposeBreakdown.length
      : sortedGroupBreakdown.length;
  const totalBreakdownPages = Math.max(1, Math.ceil(activeRowsCount / breakdownPageSize));
  const normalizedBreakdownPage = Math.min(breakdownPage, totalBreakdownPages);
  const breakdownStart = (normalizedBreakdownPage - 1) * breakdownPageSize;
  const breakdownEnd = breakdownStart + breakdownPageSize;
  const pagedDepartmentBreakdown = sortedDepartmentBreakdown.slice(breakdownStart, breakdownEnd);
  const pagedPurposeBreakdown = sortedPurposeBreakdown.slice(breakdownStart, breakdownEnd);
  const pagedGroupBreakdown = sortedGroupBreakdown.slice(breakdownStart, breakdownEnd);

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Page Header */}
        <div>
          <h1 className="text-3xl font-bold">Reports</h1>
          <p className="text-muted-foreground">Generate and download contribution reports</p>
        </div>

        {/* Report Configuration */}
        {isStaff && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Generate Report
            </CardTitle>
            <CardDescription>
              Configure report parameters and download in your preferred format
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Report Type */}
            <div className="grid md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="reportType">Report Type</Label>
                <Select value={reportType} onValueChange={setReportType}>
                  <SelectTrigger id="reportType">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="daily">
                      <div className="flex items-center gap-2">
                        <Calendar className="h-4 w-4" />
                        Daily Report (Today)
                      </div>
                    </SelectItem>
                    <SelectItem value="weekly">
                      <div className="flex items-center gap-2">
                        <Calendar className="h-4 w-4" />
                        Weekly Report (This Week)
                      </div>
                    </SelectItem>
                    <SelectItem value="monthly">
                      <div className="flex items-center gap-2">
                        <Calendar className="h-4 w-4" />
                        Monthly Report (This Month)
                      </div>
                    </SelectItem>
                    <SelectItem value="custom">
                      <div className="flex items-center gap-2">
                        <Calendar className="h-4 w-4" />
                        Custom Date Range
                      </div>
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Export Format */}
              <div className="space-y-2">
                <Label htmlFor="format">Export Format</Label>
                <Select value={format} onValueChange={setFormat}>
                  <SelectTrigger id="format">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="excel">
                      <div className="flex items-center gap-2">
                        <TableIcon className="h-4 w-4" />
                        Excel (.xlsx)
                      </div>
                    </SelectItem>
                    <SelectItem value="pdf">
                      <div className="flex items-center gap-2">
                        <FileText className="h-4 w-4" />
                        PDF (.pdf)
                      </div>
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Custom Date Range */}
            {reportType === "custom" && (
              <div className="grid md:grid-cols-2 gap-6 p-4 bg-slate-50 dark:bg-slate-900 rounded-lg">
                <div className="space-y-2">
                  <Label htmlFor="dateFrom">Start Date</Label>
                  <Input
                    id="dateFrom"
                    type="date"
                    value={dateFrom}
                    onChange={(e) => setDateFrom(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="dateTo">End Date</Label>
                  <Input
                    id="dateTo"
                    type="date"
                    value={dateTo}
                    onChange={(e) => setDateTo(e.target.value)}
                  />
                </div>
              </div>
            )}

            {/* Department Filter */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="font-medium">Filter by Departments (Optional)</h3>
                {selectedCategoryIds.length > 0 && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setSelectedCategoryIds([])}
                  >
                    Clear selection
                  </Button>
                )}
              </div>
              <p className="text-sm text-muted-foreground">
                {selectedCategoryIds.length === 0
                  ? "All departments will be included"
                  : `${selectedCategoryIds.length} department(s) selected`}
              </p>
              <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-3 p-4 bg-slate-50 dark:bg-slate-900 rounded-lg">
                {categories.map((category) => {
                  const isChecked = selectedCategoryIds.includes(category.id);
                  return (
                    <label
                      key={category.id}
                      className={`flex items-center gap-3 p-3 rounded-md border cursor-pointer transition-colors ${
                        isChecked
                          ? "bg-primary/10 border-primary"
                          : "bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-750"
                      }`}
                    >
                      <Checkbox
                        checked={isChecked}
                        onCheckedChange={(checked) => {
                          if (checked) {
                            setSelectedCategoryIds([...selectedCategoryIds, category.id]);
                          } else {
                            setSelectedCategoryIds(selectedCategoryIds.filter((id) => id !== category.id));
                          }
                        }}
                      />
                      <div>
                        <span className="font-medium text-sm">{category.name}</span>
                        <span className="text-xs text-muted-foreground ml-1">({category.code})</span>
                      </div>
                    </label>
                  );
                })}
              </div>
            </div>

            {/* Generate Button */}
            <div className="flex justify-end pt-4">
              <Button
                onClick={handleGenerateReport}
                disabled={loading}
                size="lg"
              >
                <Download className="h-4 w-4 mr-2" />
                {loading ? "Generating..." : "Generate & Download Report"}
              </Button>
            </div>
          </CardContent>
        </Card>
        )}

        {/* Quick Report Actions */}
        {isStaff && (
        <div className="grid md:grid-cols-3 gap-4">
          <Card className="cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
            onClick={() => {
              setReportType("daily");
              setFormat("excel");
              setSelectedCategoryIds([]);
              setTimeout(handleGenerateReport, 100);
            }}
          >
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-blue-100 dark:bg-blue-900 rounded-lg">
                  <Calendar className="h-6 w-6 text-blue-600 dark:text-blue-300" />
                </div>
                <div>
                  <h3 className="font-semibold">Today's Report</h3>
                  <p className="text-sm text-muted-foreground">Excel format</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
            onClick={() => {
              setReportType("weekly");
              setFormat("excel");
              setSelectedCategoryIds([]);
              setTimeout(handleGenerateReport, 100);
            }}
          >
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-green-100 dark:bg-green-900 rounded-lg">
                  <Calendar className="h-6 w-6 text-green-600 dark:text-green-300" />
                </div>
                <div>
                  <h3 className="font-semibold">Weekly Report</h3>
                  <p className="text-sm text-muted-foreground">Excel format</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
            onClick={() => {
              setReportType("monthly");
              setFormat("pdf");
              setSelectedCategoryIds([]);
              setTimeout(handleGenerateReport, 100);
            }}
          >
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-purple-100 dark:bg-purple-900 rounded-lg">
                  <FileText className="h-6 w-6 text-purple-600 dark:text-purple-300" />
                </div>
                <div>
                  <h3 className="font-semibold">Monthly Report</h3>
                  <p className="text-sm text-muted-foreground">PDF format</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
        )}

        {/* Department Routing Analytics */}
        <Card>
          <CardHeader>
            <CardTitle>Department Routing Analytics</CardTitle>
            <CardDescription>
              Live split of top-level, purpose-based, and group-routed giving
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="analytics-department">Department</Label>
                <Select
                  value={analyticsCategoryId}
                  onValueChange={(value) => {
                    setAnalyticsCategoryId(value);
                    setAnalyticsPurposeId("all");
                    setAnalyticsGroupId("all");
                  }}
                >
                  <SelectTrigger id="analytics-department">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Departments</SelectItem>
                    {categories.map((category) => (
                      <SelectItem key={category.id} value={category.id}>
                        {category.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="analytics-purpose">Purpose</Label>
                <Select
                  value={analyticsPurposeId}
                  onValueChange={(value) => {
                    setAnalyticsPurposeId(value);
                    setAnalyticsGroupId("all");
                  }}
                  disabled={!selectedAnalyticsCategoryId}
                >
                  <SelectTrigger id="analytics-purpose">
                    <SelectValue placeholder={selectedAnalyticsCategoryId ? "All Purposes" : "Select department first"} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Purposes</SelectItem>
                    {analyticsPurposes.map((purpose) => (
                      <SelectItem key={purpose.id} value={purpose.id}>
                        {purpose.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2 md:col-span-2">
                <Label htmlFor="analytics-group">Group</Label>
                <Select
                  value={analyticsGroupId}
                  onValueChange={setAnalyticsGroupId}
                >
                  <SelectTrigger id="analytics-group">
                    <SelectValue placeholder="All Groups" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Groups</SelectItem>
                    {analyticsGroups.map((group) => (
                      <SelectItem key={group.id} value={group.id}>
                        {group.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2 md:col-span-2">
                <Label htmlFor="analytics-routing-type">Routing Type</Label>
                <Select
                  value={analyticsRoutingType}
                  onValueChange={setAnalyticsRoutingType}
                >
                  <SelectTrigger id="analytics-routing-type">
                    <SelectValue placeholder="All Routing Types" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Routing Types</SelectItem>
                    <SelectItem value="GUEST_TOP_LEVEL">Guest Top-level</SelectItem>
                    <SelectItem value="MEMBER_ROUTED">Member Routed to Group</SelectItem>
                    <SelectItem value="MEMBER_TOP_LEVEL">Member Top-level</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {routingReportLoading && (
              <p className="text-sm text-muted-foreground">Loading routing analytics...</p>
            )}

            {!routingReportLoading && routingSummary && (
              <>
                <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                  <div className="rounded-md border p-3">
                    <p className="text-xs text-muted-foreground">Total Completed</p>
                    <p className="text-lg font-semibold">KES {Number(routingSummary.totalCompletedAmount).toLocaleString("en-KE")}</p>
                    <p className="text-xs text-muted-foreground">{routingSummary.totalCompletedCount} contributions</p>
                  </div>
                  <div className="rounded-md border p-3">
                    <p className="text-xs text-muted-foreground">Guest Top-level</p>
                    <p className="text-lg font-semibold">KES {Number(routingSummary.guestTopLevelAmount).toLocaleString("en-KE")}</p>
                    <p className="text-xs text-muted-foreground">{routingSummary.guestTopLevelCount} contributions</p>
                  </div>
                  <div className="rounded-md border p-3">
                    <p className="text-xs text-muted-foreground">Member Routed to Group</p>
                    <p className="text-lg font-semibold">KES {Number(routingSummary.memberRoutedAmount).toLocaleString("en-KE")}</p>
                    <p className="text-xs text-muted-foreground">{routingSummary.memberRoutedCount} contributions</p>
                  </div>
                  <div className="rounded-md border p-3">
                    <p className="text-xs text-muted-foreground">Member Top-level</p>
                    <p className="text-lg font-semibold">KES {Number(routingSummary.memberTopLevelAmount).toLocaleString("en-KE")}</p>
                    <p className="text-xs text-muted-foreground">{routingSummary.memberTopLevelCount} contributions</p>
                  </div>
                </div>

                <div className="grid gap-4 lg:grid-cols-3">
                  <div className="rounded-md border p-3">
                    <p className="mb-2 text-sm font-medium">Top Departments</p>
                    <div className="space-y-2">
                      {topDepartments.length === 0 && (
                        <p className="text-xs text-muted-foreground">No department data</p>
                      )}
                      {topDepartments.map((row) => (
                        <div key={row.departmentId} className="flex items-center justify-between text-sm">
                          <span>{row.departmentName}</span>
                          <span className="font-medium">KES {Number(row.totalAmount).toLocaleString("en-KE")}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="rounded-md border p-3">
                    <p className="mb-2 text-sm font-medium">Top Department Purposes</p>
                    <div className="space-y-2">
                      {topPurposeBreakdown.length === 0 && (
                        <p className="text-xs text-muted-foreground">No purpose data</p>
                      )}
                      {topPurposeBreakdown.map((row) => (
                        <div key={`${row.departmentId}-${row.purposeId}`} className="flex items-center justify-between text-sm">
                          <span>{row.departmentName} • {row.purposeName}</span>
                          <span className="font-medium">KES {Number(row.totalAmount).toLocaleString("en-KE")}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="rounded-md border p-3">
                    <p className="mb-2 text-sm font-medium">Top Department Groups</p>
                    <div className="space-y-2">
                      {topGroupBreakdown.length === 0 && (
                        <p className="text-xs text-muted-foreground">No group data</p>
                      )}
                      {topGroupBreakdown.map((row, index) => {
                        const groupKey = row.groupId || `top-${index}`;
                        return (
                          <div key={`${row.departmentId}-${groupKey}`} className="flex items-center justify-between text-sm">
                            <span>{row.departmentName} • {row.groupName}</span>
                            <span className="font-medium">KES {Number(row.totalAmount).toLocaleString("en-KE")}</span>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <h3 className="text-sm font-semibold text-muted-foreground">Detailed Breakdowns</h3>

                  <div className="flex flex-col gap-3 rounded-md border p-3">
                    <p className="text-sm font-medium">Breakdown View</p>
                    <div className="flex flex-wrap gap-2">
                      <Button
                        size="sm"
                        variant={activeBreakdownTab === "department" ? "default" : "outline"}
                        onClick={() => {
                          setActiveBreakdownTab("department");
                          setBreakdownPage(1);
                        }}
                      >
                        Departments
                      </Button>
                      <Button
                        size="sm"
                        variant={activeBreakdownTab === "purpose" ? "default" : "outline"}
                        onClick={() => {
                          setActiveBreakdownTab("purpose");
                          setBreakdownPage(1);
                        }}
                      >
                        Purposes
                      </Button>
                      <Button
                        size="sm"
                        variant={activeBreakdownTab === "group" ? "default" : "outline"}
                        onClick={() => {
                          setActiveBreakdownTab("group");
                          setBreakdownPage(1);
                        }}
                      >
                        Groups
                      </Button>
                    </div>

                    <div className="grid gap-3 md:grid-cols-4">
                      <div className="space-y-1 md:col-span-1">
                        <Label htmlFor="breakdown-sort-by">Sort By</Label>
                        <Select
                          value={breakdownSortBy}
                          onValueChange={(value) => {
                            setBreakdownSortBy(value as "amount" | "count");
                            setBreakdownPage(1);
                          }}
                        >
                          <SelectTrigger id="breakdown-sort-by">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="amount">Amount</SelectItem>
                            <SelectItem value="count">Count</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="space-y-1 md:col-span-1">
                        <Label htmlFor="breakdown-sort-direction">Direction</Label>
                        <Select
                          value={breakdownSortDirection}
                          onValueChange={(value) => {
                            setBreakdownSortDirection(value as "desc" | "asc");
                            setBreakdownPage(1);
                          }}
                        >
                          <SelectTrigger id="breakdown-sort-direction">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="desc">Highest First</SelectItem>
                            <SelectItem value="asc">Lowest First</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="space-y-1 md:col-span-1">
                        <Label htmlFor="breakdown-page-size">Rows Per Page</Label>
                        <Select
                          value={String(breakdownPageSize)}
                          onValueChange={(value) => {
                            setBreakdownPageSize(Number.parseInt(value, 10));
                            setBreakdownPage(1);
                          }}
                        >
                          <SelectTrigger id="breakdown-page-size">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="10">10</SelectItem>
                            <SelectItem value="25">25</SelectItem>
                            <SelectItem value="50">50</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="md:col-span-1 flex items-end justify-end gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => setBreakdownPage((current) => Math.max(1, current - 1))}
                          disabled={normalizedBreakdownPage <= 1}
                        >
                          Previous
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => setBreakdownPage((current) => Math.min(totalBreakdownPages, current + 1))}
                          disabled={normalizedBreakdownPage >= totalBreakdownPages}
                        >
                          Next
                        </Button>
                      </div>
                    </div>

                    <p className="text-xs text-muted-foreground">
                      Page {normalizedBreakdownPage} of {totalBreakdownPages} • {activeRowsCount} row(s)
                    </p>
                  </div>

                  {activeBreakdownTab === "department" && (
                  <div className="rounded-md border">
                    <div className="border-b px-4 py-3">
                      <p className="text-sm font-medium">By Department ({allDepartmentBreakdown.length})</p>
                    </div>
                    <div className="max-h-64 overflow-auto">
                      {allDepartmentBreakdown.length === 0 ? (
                        <p className="px-4 py-3 text-xs text-muted-foreground">No department data</p>
                      ) : (
                        <table className="w-full text-sm">
                          <thead>
                            <tr className="border-b bg-muted/40">
                              <th className="px-4 py-2 text-left font-medium">Department</th>
                              <th className="px-4 py-2 text-right font-medium">Amount</th>
                              <th className="px-4 py-2 text-right font-medium">Count</th>
                            </tr>
                          </thead>
                          <tbody>
                            {pagedDepartmentBreakdown.map((row) => (
                              <tr key={row.departmentId} className="border-b last:border-0">
                                <td className="px-4 py-2">{row.departmentName}</td>
                                <td className="px-4 py-2 text-right font-medium">KES {Number(row.totalAmount).toLocaleString("en-KE")}</td>
                                <td className="px-4 py-2 text-right">{row.totalCount}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      )}
                    </div>
                  </div>
                  )}

                  {activeBreakdownTab === "purpose" && (
                  <div className="rounded-md border">
                    <div className="border-b px-4 py-3">
                      <p className="text-sm font-medium">By Purpose ({allPurposeBreakdown.length})</p>
                    </div>
                    <div className="max-h-64 overflow-auto">
                      {allPurposeBreakdown.length === 0 ? (
                        <p className="px-4 py-3 text-xs text-muted-foreground">No purpose data</p>
                      ) : (
                        <table className="w-full text-sm">
                          <thead>
                            <tr className="border-b bg-muted/40">
                              <th className="px-4 py-2 text-left font-medium">Department</th>
                              <th className="px-4 py-2 text-left font-medium">Purpose</th>
                              <th className="px-4 py-2 text-right font-medium">Amount</th>
                              <th className="px-4 py-2 text-right font-medium">Count</th>
                            </tr>
                          </thead>
                          <tbody>
                            {pagedPurposeBreakdown.map((row) => (
                              <tr key={`${row.departmentId}-${row.purposeId}`} className="border-b last:border-0">
                                <td className="px-4 py-2">{row.departmentName}</td>
                                <td className="px-4 py-2">{row.purposeName}</td>
                                <td className="px-4 py-2 text-right font-medium">KES {Number(row.totalAmount).toLocaleString("en-KE")}</td>
                                <td className="px-4 py-2 text-right">{row.totalCount}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      )}
                    </div>
                  </div>
                  )}

                  {activeBreakdownTab === "group" && (
                  <div className="rounded-md border">
                    <div className="border-b px-4 py-3">
                      <p className="text-sm font-medium">By Group ({allGroupBreakdown.length})</p>
                    </div>
                    <div className="max-h-64 overflow-auto">
                      {allGroupBreakdown.length === 0 ? (
                        <p className="px-4 py-3 text-xs text-muted-foreground">No group data</p>
                      ) : (
                        <table className="w-full text-sm">
                          <thead>
                            <tr className="border-b bg-muted/40">
                              <th className="px-4 py-2 text-left font-medium">Department</th>
                              <th className="px-4 py-2 text-left font-medium">Group</th>
                              <th className="px-4 py-2 text-right font-medium">Amount</th>
                              <th className="px-4 py-2 text-right font-medium">Count</th>
                            </tr>
                          </thead>
                          <tbody>
                            {pagedGroupBreakdown.map((row, index) => {
                              const groupKey = row.groupId || `top-${breakdownStart + index}`;
                              return (
                                <tr key={`${row.departmentId}-${groupKey}`} className="border-b last:border-0">
                                  <td className="px-4 py-2">{row.departmentName}</td>
                                  <td className="px-4 py-2">{row.groupName}</td>
                                  <td className="px-4 py-2 text-right font-medium">KES {Number(row.totalAmount).toLocaleString("en-KE")}</td>
                                  <td className="px-4 py-2 text-right">{row.totalCount}</td>
                                </tr>
                              );
                            })}
                          </tbody>
                        </table>
                      )}
                    </div>
                  </div>
                  )}
                </div>
              </>
            )}
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  );
}

export default function ReportsPage() {
  return (
    <AdminProtectedRoute requiredAccess="any-admin">
      <ReportsPageContent />
    </AdminProtectedRoute>
  );
}
