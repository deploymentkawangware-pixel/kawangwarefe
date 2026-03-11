/**
 * Church Content Management Hub
 * Central page for managing all church content:
 * Announcements, Devotionals, Events, and YouTube Videos
 */

"use client";

import { useRouter } from "next/navigation";
import { AdminLayout } from "@/components/layouts/admin-layout";
import { AdminProtectedRoute } from "@/components/auth/admin-protected-route";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Megaphone,
  BookOpen,
  CalendarDays,
  Youtube,
  ArrowRight,
} from "lucide-react";

const contentSections = [
  {
    title: "Announcements",
    description:
      "Create and manage church announcements. Control visibility, set priority, and keep the congregation informed.",
    href: "/admin/announcements",
    icon: Megaphone,
    color: "text-amber-600 dark:text-amber-400",
    bg: "bg-amber-50 dark:bg-amber-950/30",
    border: "border-amber-200 dark:border-amber-800",
  },
  {
    title: "Devotionals",
    description:
      "Publish daily or weekly devotionals. Add scripture references, reflections, and spiritual content for members.",
    href: "/admin/devotionals",
    icon: BookOpen,
    color: "text-indigo-600 dark:text-indigo-400",
    bg: "bg-indigo-50 dark:bg-indigo-950/30",
    border: "border-indigo-200 dark:border-indigo-800",
  },
  {
    title: "Events",
    description:
      "Schedule and manage church events. Set dates, locations, and details for upcoming activities and services.",
    href: "/admin/events",
    icon: CalendarDays,
    color: "text-emerald-600 dark:text-emerald-400",
    bg: "bg-emerald-50 dark:bg-emerald-950/30",
    border: "border-emerald-200 dark:border-emerald-800",
  },
  {
    title: "YouTube Videos",
    description:
      "Manage sermon recordings and church videos. Sync from YouTube, feature videos, and organize content.",
    href: "/admin/youtube",
    icon: Youtube,
    color: "text-red-600 dark:text-red-400",
    bg: "bg-red-50 dark:bg-red-950/30",
    border: "border-red-200 dark:border-red-800",
  },
];

function ContentHubPage() {
  const router = useRouter();

  return (
    <AdminProtectedRoute requiredAccess="content-admin">
      <AdminLayout>
        <div className="space-y-6">
          {/* Page Header */}
          <div>
            <h1 className="text-2xl font-bold tracking-tight">
              Church Content
            </h1>
            <p className="text-muted-foreground mt-1">
              Manage all church content — announcements, devotionals, events,
              and videos — from one place.
            </p>
          </div>

          {/* Content Cards Grid */}
          <div className="grid gap-6 sm:grid-cols-2">
            {contentSections.map((section) => {
              const Icon = section.icon;
              return (
                <Card
                  key={section.title}
                  className={`group cursor-pointer transition-all hover:shadow-md border ${section.border}`}
                  onClick={() => router.push(section.href)}
                >
                  <CardHeader className="flex flex-row items-start gap-4 space-y-0">
                    <div
                      className={`rounded-lg p-3 ${section.bg}`}
                    >
                      <Icon className={`h-6 w-6 ${section.color}`} />
                    </div>
                    <div className="flex-1">
                      <CardTitle className="flex items-center justify-between text-lg">
                        {section.title}
                        <ArrowRight className="h-4 w-4 text-muted-foreground opacity-0 transition-opacity group-hover:opacity-100" />
                      </CardTitle>
                      <CardDescription className="mt-1.5">
                        {section.description}
                      </CardDescription>
                    </div>
                  </CardHeader>
                </Card>
              );
            })}
          </div>
        </div>
      </AdminLayout>
    </AdminProtectedRoute>
  );
}

export default ContentHubPage;
