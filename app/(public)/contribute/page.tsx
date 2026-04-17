"use client";

import { useRouter } from "next/navigation";
import { ContributionForm } from "@/components/forms/contribution-form";
import { Navigation } from "@/components/landing/navigation";
import { useAuth } from "@/lib/auth/auth-context";
import { useTour } from "@/hooks/use-tour";
import { CONTRIBUTION_FLOW_TOUR_CONFIG } from "@/lib/tours/tour-configs";
import { Button } from "@/components/ui/button";
import { ArrowLeft, HelpCircle } from "lucide-react";

export default function ContributePage() {
  const router = useRouter();
  const { isAuthenticated } = useAuth();
  const { start: startContributionTour } = useTour({
    tourKey: "contribution_flow",
    steps: CONTRIBUTION_FLOW_TOUR_CONFIG.steps || [],
    autoStart: false,
  });

  const handleSuccess = (data: any) => {
    // Redirect to confirmation page with contribution details
    const contributionId = data?.contribution?.id;
    const checkoutRequestId = data?.checkoutRequestId;

    if (contributionId) {
      router.push(
        `/confirmation?id=${contributionId}&checkoutRequestId=${checkoutRequestId || ""}`
      );
    } else if (checkoutRequestId) {
      // Multi-category flow: no single contributionId — navigate by checkoutRequestId
      router.push(`/confirmation?checkoutRequestId=${checkoutRequestId}`);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Navigation */}
      <Navigation />

      {/* Gradient Header Section */}
      <div className="relative overflow-hidden bg-gradient-to-r from-teal-50 via-emerald-50 to-blue-50 dark:from-teal-950/20 dark:via-emerald-950/20 dark:to-blue-950/20 border-b border-emerald-200/30 dark:border-emerald-800/30">
        {/* Decorative gradient orb */}
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-emerald-400/10 to-teal-400/10 dark:from-emerald-500/5 dark:to-teal-500/5 rounded-full blur-3xl" />
        <div className="absolute -bottom-32 -left-32 w-64 h-64 bg-gradient-to-tr from-blue-400/10 to-emerald-400/10 dark:from-blue-500/5 dark:to-emerald-500/5 rounded-full blur-3xl" />

        <div className="relative container mx-auto px-4 py-12 md:py-16">
          {/* Header */}
          <div className="text-center space-y-3 animate-fade-in max-w-3xl mx-auto">
            <div className="inline-block mb-2">
              <span className="px-3 py-1 rounded-full bg-emerald-100/60 dark:bg-emerald-900/30 border border-emerald-300/50 dark:border-emerald-700/50 text-emerald-700 dark:text-emerald-300 text-xs font-semibold uppercase tracking-wider">
                Secure Giving
              </span>
            </div>
            <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-teal-600 via-emerald-600 to-blue-600 dark:from-teal-400 dark:via-emerald-400 dark:to-blue-400 bg-clip-text text-transparent tracking-tight">
              Church Contribution Portal
            </h1>
            <p className="text-base md:text-lg text-muted-foreground max-w-2xl mx-auto">
              Make your contribution securely via M-Pesa. Your generosity supports our ministry and community outreach programs.
            </p>
          </div>
        </div>
      </div>

      {/* Dashboard return bar for logged-in users */}
      {isAuthenticated && (
        <div className="bg-muted/40 border-b backdrop-blur-sm">
          <div className="container mx-auto px-4 py-2 flex items-center">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => router.push("/dashboard")}
              className="hover:bg-emerald-100/50 dark:hover:bg-emerald-900/30"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Dashboard
            </Button>
          </div>
        </div>
      )}

      {/* Main content */}
      <main className="container mx-auto px-4 py-8 md:py-12">
        <div className="max-w-2xl mx-auto space-y-6">
          {/* Help button */}
          <div className="flex justify-end">
            <Button
              variant="outline"
              size="sm"
              onClick={() => startContributionTour()}
              title="View contribution guide"
            >
              <HelpCircle className="w-4 h-4 mr-2" />
              How to Contribute
            </Button>
          </div>

          {/* Contribution Form */}
          <div data-tour="contribution-form" className="animate-slide-up">
            <ContributionForm onSuccess={handleSuccess} />
          </div>

          {/* Quick Info Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 animate-slide-up">
            <div className="flex flex-col items-center gap-2 p-4 rounded-lg border border-emerald-200/30 dark:border-emerald-800/30 bg-emerald-50/40 dark:bg-emerald-950/20 hover:bg-emerald-100/50 dark:hover:bg-emerald-900/30 transition-colors">
              <span className="text-2xl">🔒</span>
              <span className="font-semibold text-emerald-900 dark:text-emerald-200">Secure</span>
              <span className="text-xs text-emerald-700/70 dark:text-emerald-300/70">M-Pesa gateway</span>
            </div>
            <div className="flex flex-col items-center gap-2 p-4 rounded-lg border border-blue-200/30 dark:border-blue-800/30 bg-blue-50/40 dark:bg-blue-950/20 hover:bg-blue-100/50 dark:hover:bg-blue-900/30 transition-colors">
              <span className="text-2xl">⚡</span>
              <span className="font-semibold text-blue-900 dark:text-blue-200">Instant</span>
              <span className="text-xs text-blue-700/70 dark:text-blue-300/70">Immediate receipt</span>
            </div>
            <div className="flex flex-col items-center gap-2 p-4 rounded-lg border border-teal-200/30 dark:border-teal-800/30 bg-teal-50/40 dark:bg-teal-950/20 hover:bg-teal-100/50 dark:hover:bg-teal-900/30 transition-colors">
              <span className="text-2xl">📊</span>
              <span className="font-semibold text-teal-900 dark:text-teal-200">Tracked</span>
              <span className="text-xs text-teal-700/70 dark:text-teal-300/70">View history</span>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}