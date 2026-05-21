import { Layout } from "@/components/layout/Layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { formatCurrency } from "@/lib/format";
import {
  useGetDashboardSummary,
  useGetMonthlyContributions,
  useGetLoanStatusBreakdown,
  useGetRecentActivity,
} from "@workspace/api-client-react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
} from "recharts";
import {
  Users,
  CreditCard,
  Wallet,
  PieChartIcon,
  ShieldCheck,
  LifeBuoy,
  TrendingUp,
  TrendingDown,
  ArrowUpRight,
  AlertTriangle,
  ShieldAlert,
  Clock,
  UserX,
  FileSpreadsheet,
  Building2,
} from "lucide-react";
import { useLocation } from "wouter";
import { formatDistanceToNow } from "date-fns";

const PIE_COLORS = ["#2d6a4f", "#40916c", "#f6ae2d", "#e63946", "#74c69d"];

function KPICard({
  title,
  value,
  growth,
  icon: Icon,
  loading,
  format = "number",
}: {
  title: string;
  value: number;
  growth?: number;
  icon: React.ElementType;
  loading: boolean;
  format?: "number" | "currency" | "percent";
}) {
  const formatted =
    format === "currency"
      ? formatCurrency(value)
      : format === "percent"
      ? `${value}%`
      : value.toLocaleString();

  return (
    <Card data-testid={`kpi-card-${title.toLowerCase().replace(/\s+/g, "-")}`}>
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10">
            <Icon className="h-6 w-6 text-primary" />
          </div>
          {growth !== undefined && (
            <div
              className={`flex items-center gap-1 text-sm font-medium ${growth >= 0 ? "text-emerald-600" : "text-red-500"}`}
            >
              {growth >= 0 ? (
                <TrendingUp className="h-4 w-4" />
              ) : (
                <TrendingDown className="h-4 w-4" />
              )}
              {Math.abs(growth)}%
            </div>
          )}
        </div>
        {loading ? (
          <>
            <Skeleton className="mt-4 h-8 w-32" />
            <Skeleton className="mt-1 h-4 w-24" />
          </>
        ) : (
          <>
            <div className="mt-4 text-2xl font-bold text-foreground">{formatted}</div>
            <p className="text-sm text-muted-foreground">{title}</p>
          </>
        )}
      </CardContent>
    </Card>
  );
}

export default function Dashboard() {
  const [, setLocation] = useLocation();
  const { data: summary, isLoading: loadingSummary } = useGetDashboardSummary();
  const { data: monthlyContribs, isLoading: loadingMonthly } = useGetMonthlyContributions();
  const { data: loanBreakdown, isLoading: loadingBreakdown } = useGetLoanStatusBreakdown();
  const { data: recentActivity, isLoading: loadingActivity } = useGetRecentActivity();

  return (
    <Layout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Command Center</h1>
            <p className="text-muted-foreground">Coopvest Africa — Admin Dashboard Overview</p>
          </div>
          <div className="flex gap-2">
            <button
              className="flex items-center gap-1.5 rounded-md border px-3 py-1.5 text-sm hover:bg-muted transition-colors"
              onClick={() => setLocation("/excel-manager")}
            >
              <FileSpreadsheet className="h-4 w-4" /> Excel Manager
            </button>
            <button
              className="flex items-center gap-1.5 rounded-md border px-3 py-1.5 text-sm hover:bg-muted transition-colors"
              onClick={() => setLocation("/organizations")}
            >
              <Building2 className="h-4 w-4" /> Organizations
            </button>
          </div>
        </div>

        {/* Alert Banner for Urgent Items */}
        <div className="grid grid-cols-1 gap-2 sm:grid-cols-3">
          {[
            { label: "Loan Defaulters", value: 12, icon: AlertTriangle, color: "bg-red-50 border-red-200 text-red-700", href: "/members" },
            { label: "High-Risk Accounts", value: 8, icon: ShieldAlert, color: "bg-rose-50 border-rose-200 text-rose-700", href: "/risk-scoring" },
            { label: "Pending KYC Verification", value: summary?.pendingVerifications ?? 24, icon: Clock, color: "bg-amber-50 border-amber-200 text-amber-700", href: "/user-verification" },
          ].map(alert => (
            <div
              key={alert.label}
              className={`flex items-center justify-between rounded-lg border px-4 py-3 cursor-pointer hover:opacity-80 transition-opacity ${alert.color}`}
              onClick={() => setLocation(alert.href)}
            >
              <div className="flex items-center gap-2">
                <alert.icon className="h-4 w-4" />
                <span className="text-sm font-medium">{alert.label}</span>
              </div>
              <span className="text-lg font-bold">{(alert.value ?? 0).toLocaleString()}</span>
            </div>
          ))}
        </div>

        {/* KPI Cards */}
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6">
          <KPICard
            title="Total Members"
            value={summary?.totalMembers ?? 0}
            growth={summary?.membersGrowth}
            icon={Users}
            loading={loadingSummary}
          />
          <KPICard
            title="Total Contributions"
            value={summary?.totalContributions ?? 0}
            growth={summary?.contributionsGrowth}
            icon={Wallet}
            loading={loadingSummary}
            format="currency"
          />
          <KPICard
            title="Loans Disbursed"
            value={summary?.loansDisbursed ?? 0}
            growth={summary?.loansGrowth}
            icon={CreditCard}
            loading={loadingSummary}
            format="currency"
          />
          <KPICard
            title="Repayment Rate"
            value={summary?.repaymentRate ?? 0}
            icon={TrendingUp}
            loading={loadingSummary}
            format="percent"
          />
          <KPICard
            title="Active Loans"
            value={summary?.activeLoans ?? 0}
            icon={ArrowUpRight}
            loading={loadingSummary}
          />
          <KPICard
            title="Total Investments"
            value={summary?.totalInvestments ?? 0}
            icon={PieChartIcon}
            loading={loadingSummary}
            format="currency"
          />
          <KPICard
            title="Pending Compliance"
            value={summary?.pendingCompliance ?? 0}
            icon={ShieldCheck}
            loading={loadingSummary}
          />
          <KPICard
            title="Open Support Tickets"
            value={summary?.openSupportTickets ?? 0}
            icon={LifeBuoy}
            loading={loadingSummary}
          />
          <KPICard
            title="Suspended Users"
            value={summary?.suspendedMembers ?? 0}
            icon={UserX}
            loading={loadingSummary}
          />
          <KPICard
            title="Missed Contributions"
            value={summary?.overdueContributions ?? 0}
            icon={AlertTriangle}
            loading={loadingSummary}
          />
          <KPICard
            title="Onboarded Orgs"
            value={summary?.totalOrganizations ?? 0}
            icon={Building2}
            loading={loadingSummary}
          />
          <KPICard
            title="Pending Verifications"
            value={summary?.pendingVerifications ?? 0}
            icon={Clock}
            loading={loadingSummary}
          />
        </div>

        {/* Charts Row */}
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          {/* Monthly Contributions Chart */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base font-semibold">Monthly Contributions</CardTitle>
            </CardHeader>
            <CardContent>
              {loadingMonthly ? (
                <Skeleton className="h-64 w-full" />
              ) : (
                <ResponsiveContainer width="100%" height={250}>
                  <AreaChart data={monthlyContribs ?? []}>
                    <defs>
                      <linearGradient id="contribGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#2d6a4f" stopOpacity={0.3} />
                        <stop offset="95%" stopColor="#2d6a4f" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                    <XAxis dataKey="month" tick={{ fontSize: 12 }} />
                    <YAxis tick={{ fontSize: 12 }} tickFormatter={(v) => `₦${(v / 1000).toFixed(0)}k`} />
                    <Tooltip formatter={(val: number) => [formatCurrency(val), "Contributions"]} />
                    <Area
                      type="monotone"
                      dataKey="value"
                      stroke="#2d6a4f"
                      strokeWidth={2}
                      fill="url(#contribGrad)"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              )}
            </CardContent>
          </Card>

          {/* Loan Status Breakdown */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base font-semibold">Loan Portfolio Breakdown</CardTitle>
            </CardHeader>
            <CardContent>
              {loadingBreakdown ? (
                <Skeleton className="h-64 w-full" />
              ) : (
                <ResponsiveContainer width="100%" height={250}>
                  <PieChart>
                    <Pie
                      data={loanBreakdown ?? []}
                      dataKey="count"
                      nameKey="status"
                      cx="50%"
                      cy="50%"
                      outerRadius={90}
                      label={({ status, percentage }) => `${status} ${percentage}%`}
                      labelLine={false}
                    >
                      {(loanBreakdown ?? []).map((_, i) => (
                        <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(val, name) => [val, name]} />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Recent Activity */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base font-semibold">Recent Activity</CardTitle>
          </CardHeader>
          <CardContent>
            {loadingActivity ? (
              <div className="space-y-3">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Skeleton key={i} className="h-12 w-full" />
                ))}
              </div>
            ) : (
              <div className="divide-y">
                {(recentActivity ?? []).map((item) => (
                  <div
                    key={item.id}
                    className="flex items-center justify-between py-3"
                    data-testid={`activity-item-${item.id}`}
                  >
                    <div className="flex items-center gap-3">
                      <div className="flex h-9 w-9 items-center justify-center rounded-full bg-primary/10">
                        {item.type === "contribution" ? (
                          <Wallet className="h-4 w-4 text-primary" />
                        ) : (
                          <CreditCard className="h-4 w-4 text-primary" />
                        )}
                      </div>
                      <div>
                        <p className="text-sm font-medium">{item.description}</p>
                        <p className="text-xs text-muted-foreground">
                          {formatDistanceToNow(new Date(item.createdAt), { addSuffix: true })}
                        </p>
                      </div>
                    </div>
                    {item.amount != null && (
                      <span className="text-sm font-semibold text-primary">
                        {formatCurrency(item.amount)}
                      </span>
                    )}
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
}
