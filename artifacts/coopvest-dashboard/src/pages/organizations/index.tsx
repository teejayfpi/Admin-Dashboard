import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Layout } from "@/components/layout/Layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { Building2, Plus, ChevronDown, ChevronRight, Users, Search, Briefcase, TrendingUp, CheckCircle, AlertCircle, Clock, Download, RefreshCw, ArrowRightLeft } from "lucide-react";
import { formatCurrency } from "@/lib/format";

interface StaffMember {
  id: number;
  name: string;
  email: string;
  department: string;
  joinedDate: string;
}

interface RemittanceRecord {
  month: string;
  amount: number;
  status: "remitted" | "pending" | "overdue";
  date?: string;
}

interface Organization {
  id: number;
  name: string;
  type: "Government" | "Private" | "NGO" | "Educational" | "Financial";
  memberCount: number;
  status: "Active" | "Inactive" | "Pending";
  dateAdded: string;
  contactEmail: string;
  deductionStatus: "on_track" | "delayed" | "stopped";
  totalContributions: number;
  lastRemittance?: string;
  staff: StaffMember[];
  remittances: RemittanceRecord[];
}

const MOCK_ORGS: Organization[] = [
  {
    id: 1, name: "Lagos State Civil Service Commission", type: "Government", memberCount: 842, status: "Active",
    dateAdded: "2023-03-15", contactEmail: "hr@lagosgov.ng", deductionStatus: "on_track",
    totalContributions: 42100000, lastRemittance: "2025-05-01",
    staff: [
      { id: 1, name: "Adaobi Nwoye", email: "a.nwoye@lagosgov.ng", department: "Finance", joinedDate: "2023-04-01" },
      { id: 2, name: "Kola Abioye", email: "k.abioye@lagosgov.ng", department: "HR", joinedDate: "2023-04-15" },
      { id: 3, name: "Zainab Usman", email: "z.usman@lagosgov.ng", department: "Administration", joinedDate: "2023-05-01" },
    ],
    remittances: [
      { month: "May 2025", amount: 4210000, status: "remitted", date: "2025-05-01" },
      { month: "Apr 2025", amount: 4210000, status: "remitted", date: "2025-04-02" },
      { month: "Mar 2025", amount: 4100000, status: "remitted", date: "2025-03-04" },
      { month: "Feb 2025", amount: 4050000, status: "remitted", date: "2025-02-03" },
    ],
  },
  {
    id: 2, name: "Access Bank Plc", type: "Financial", memberCount: 521, status: "Active",
    dateAdded: "2023-06-10", contactEmail: "staff@accessbankplc.com", deductionStatus: "on_track",
    totalContributions: 26050000, lastRemittance: "2025-05-02",
    staff: [
      { id: 4, name: "Emeka Obi", email: "e.obi@accessbank.com", department: "HR", joinedDate: "2023-06-20" },
    ],
    remittances: [
      { month: "May 2025", amount: 2605000, status: "remitted", date: "2025-05-02" },
      { month: "Apr 2025", amount: 2605000, status: "remitted", date: "2025-04-01" },
      { month: "Mar 2025", amount: 2605000, status: "remitted", date: "2025-03-01" },
    ],
  },
  {
    id: 3, name: "Federal University of Technology, Akure", type: "Educational", memberCount: 234, status: "Active",
    dateAdded: "2024-01-15", contactEmail: "bursary@futa.edu.ng", deductionStatus: "delayed",
    totalContributions: 8190000, lastRemittance: "2025-03-20",
    staff: [
      { id: 5, name: "Prof. Adunola Salami", email: "a.salami@futa.edu.ng", department: "Bursary", joinedDate: "2024-01-20" },
    ],
    remittances: [
      { month: "May 2025", amount: 0, status: "overdue" },
      { month: "Apr 2025", amount: 0, status: "pending" },
      { month: "Mar 2025", amount: 2730000, status: "remitted", date: "2025-03-20" },
    ],
  },
  {
    id: 4, name: "Save the Children Nigeria", type: "NGO", memberCount: 67, status: "Inactive",
    dateAdded: "2023-09-01", contactEmail: "admin@savethechildren.ng", deductionStatus: "stopped",
    totalContributions: 1340000, lastRemittance: "2024-12-01",
    staff: [],
    remittances: [
      { month: "Dec 2024", amount: 335000, status: "remitted", date: "2024-12-01" },
    ],
  },
];

const deductionColors: Record<string, string> = {
  on_track: "bg-emerald-100 text-emerald-800",
  delayed: "bg-amber-100 text-amber-800",
  stopped: "bg-red-100 text-red-800",
};

const remittanceColors: Record<string, string> = {
  remitted: "bg-emerald-100 text-emerald-800",
  pending: "bg-amber-100 text-amber-800",
  overdue: "bg-red-100 text-red-800",
};

export default function Organizations() {
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [expandedId, setExpandedId] = useState<number | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [creating, setCreating] = useState(false);
  const [selectedOrg, setSelectedOrg] = useState<Organization | null>(null);
  const [detailTab, setDetailTab] = useState("overview");
  const [newOrg, setNewOrg] = useState({ name: "", type: "Government" as Organization["type"], contactEmail: "" });
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const [orgs, setOrgs] = useState<Organization[]>(MOCK_ORGS);

  const filtered = orgs.filter(o => {
    const matchSearch = o.name.toLowerCase().includes(search.toLowerCase()) || o.contactEmail.toLowerCase().includes(search.toLowerCase());
    const matchType = typeFilter === "all" || o.type === typeFilter;
    const matchStatus = statusFilter === "all" || o.status === statusFilter;
    return matchSearch && matchType && matchStatus;
  });

  function createOrg(data: typeof newOrg) {
    setCreating(true);
    setTimeout(() => {
      const newEntry: Organization = {
        id: orgs.length + 1,
        ...data,
        memberCount: 0,
        status: "Pending",
        dateAdded: new Date().toISOString().split("T")[0],
        deductionStatus: "on_track",
        totalContributions: 0,
        staff: [],
        remittances: [],
      };
      setOrgs(prev => [...prev, newEntry]);
      toast({ title: "Organization Added", description: `${data.name} has been onboarded.` });
      setShowModal(false);
      setNewOrg({ name: "", type: "Government", contactEmail: "" });
      setCreating(false);
    }, 800);
  }

  function exportRemittanceReport(org: Organization) {
    const rows = org.remittances;
    const headers = ["Month", "Amount", "Status", "Date"];
    const csv = [headers.join(","), ...rows.map(r => [r.month, r.amount, r.status, r.date ?? ""].join(","))].join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a"); a.href = url; a.download = `${org.name.replace(/\s/g, "_")}_remittances.csv`; a.click();
    URL.revokeObjectURL(url);
  }

  const totalContribs = orgs.reduce((s, o) => s + o.totalContributions, 0);
  const onTrackCount = orgs.filter(o => o.deductionStatus === "on_track").length;
  const delayedCount = orgs.filter(o => o.deductionStatus !== "on_track").length;

  return (
    <Layout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">Organization Management</h1>
            <p className="text-muted-foreground">Manage onboarded institutions, deductions & remittances</p>
          </div>
          <Button onClick={() => setShowModal(true)}>
            <Plus className="mr-2 h-4 w-4" /> Onboard Organization
          </Button>
        </div>

        {/* Summary Stats */}
        <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
          {[
            { label: "Total Organizations", value: orgs.length, icon: Building2, color: "text-primary", format: "number" },
            { label: "Total Members", value: orgs.reduce((s, o) => s + o.memberCount, 0), icon: Users, color: "text-blue-600", format: "number" },
            { label: "Total Contributions", value: totalContribs, icon: TrendingUp, color: "text-emerald-600", format: "currency" },
            { label: "Deduction Issues", value: delayedCount, icon: AlertCircle, color: "text-red-500", format: "number" },
          ].map(s => (
            <Card key={s.label}>
              <CardContent className="p-4 flex items-center gap-3">
                <div className={`p-2 rounded-lg bg-muted`}>
                  <s.icon className={`h-5 w-5 ${s.color}`} />
                </div>
                <div>
                  <div className="text-xl font-bold">{s.format === "currency" ? formatCurrency(s.value) : s.value.toLocaleString()}</div>
                  <div className="text-xs text-muted-foreground">{s.label}</div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Filters */}
        <div className="flex gap-3 flex-wrap">
          <div className="relative flex-1 min-w-[200px]">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input placeholder="Search organizations…" className="pl-9" value={search} onChange={(e) => setSearch(e.target.value)} />
          </div>
          <Select value={typeFilter} onValueChange={setTypeFilter}>
            <SelectTrigger className="w-40"><SelectValue placeholder="Type" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Types</SelectItem>
              <SelectItem value="Government">Government</SelectItem>
              <SelectItem value="Private">Private</SelectItem>
              <SelectItem value="NGO">NGO</SelectItem>
              <SelectItem value="Educational">Educational</SelectItem>
              <SelectItem value="Financial">Financial</SelectItem>
            </SelectContent>
          </Select>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-36"><SelectValue placeholder="Status" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="Active">Active</SelectItem>
              <SelectItem value="Inactive">Inactive</SelectItem>
              <SelectItem value="Pending">Pending</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Organizations List */}
        <Card>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b bg-muted/40 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    <th className="px-4 py-3 text-left w-8"></th>
                    <th className="px-4 py-3 text-left">Organization</th>
                    <th className="px-4 py-3 text-left">Type</th>
                    <th className="px-4 py-3 text-center">Staff/Members</th>
                    <th className="px-4 py-3 text-left">Deduction Status</th>
                    <th className="px-4 py-3 text-right">Total Contributions</th>
                    <th className="px-4 py-3 text-center">Last Remittance</th>
                    <th className="px-4 py-3 text-center">Status</th>
                    <th className="px-4 py-3 text-center">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {filtered.map(org => (
                    <>
                      <tr key={org.id} className="hover:bg-muted/30 transition-colors">
                        <td className="px-4 py-3">
                          <button onClick={() => setExpandedId(expandedId === org.id ? null : org.id)}>
                            {expandedId === org.id
                              ? <ChevronDown className="h-4 w-4 text-muted-foreground" />
                              : <ChevronRight className="h-4 w-4 text-muted-foreground" />}
                          </button>
                        </td>
                        <td className="px-4 py-3">
                          <div className="font-medium">{org.name}</div>
                          <div className="text-xs text-muted-foreground">{org.contactEmail}</div>
                        </td>
                        <td className="px-4 py-3 text-muted-foreground text-xs">{org.type}</td>
                        <td className="px-4 py-3 text-center">
                          <span className="font-semibold">{org.memberCount.toLocaleString()}</span>
                          <span className="text-xs text-muted-foreground"> members</span>
                        </td>
                        <td className="px-4 py-3">
                          <Badge className={deductionColors[org.deductionStatus]} variant="outline">
                            {org.deductionStatus === "on_track" ? "On Track" : org.deductionStatus === "delayed" ? "Delayed" : "Stopped"}
                          </Badge>
                        </td>
                        <td className="px-4 py-3 text-right font-semibold">{formatCurrency(org.totalContributions)}</td>
                        <td className="px-4 py-3 text-center text-xs text-muted-foreground">
                          {org.lastRemittance ? new Date(org.lastRemittance).toLocaleDateString("en-NG") : "—"}
                        </td>
                        <td className="px-4 py-3 text-center">
                          <Badge variant={org.status === "Active" ? "default" : "secondary"}>{org.status}</Badge>
                        </td>
                        <td className="px-4 py-3 text-center">
                          <div className="flex justify-center gap-1">
                            <Button variant="outline" size="sm" onClick={() => { setSelectedOrg(org); setDetailTab("overview"); }}>
                              Details
                            </Button>
                            <Button variant="outline" size="sm" onClick={() => exportRemittanceReport(org)}>
                              <Download className="h-3 w-3" />
                            </Button>
                          </div>
                        </td>
                      </tr>
                      {expandedId === org.id && (
                        <tr key={`${org.id}-expanded`} className="bg-muted/20">
                          <td colSpan={9} className="px-8 py-4">
                            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                              {/* Staff */}
                              <div>
                                <h4 className="font-semibold text-sm mb-2 flex items-center gap-1.5"><Briefcase className="h-4 w-4" /> Staff ({org.staff.length})</h4>
                                {org.staff.length === 0 ? (
                                  <p className="text-xs text-muted-foreground">No staff records.</p>
                                ) : (
                                  <div className="space-y-1.5">
                                    {org.staff.map(s => (
                                      <div key={s.id} className="flex justify-between text-xs bg-background rounded px-3 py-1.5 border">
                                        <span className="font-medium">{s.name}</span>
                                        <span className="text-muted-foreground">{s.department}</span>
                                        <span className="text-muted-foreground">{s.email}</span>
                                      </div>
                                    ))}
                                  </div>
                                )}
                              </div>
                              {/* Recent Remittances */}
                              <div>
                                <h4 className="font-semibold text-sm mb-2 flex items-center gap-1.5"><ArrowRightLeft className="h-4 w-4" /> Recent Remittances</h4>
                                <div className="space-y-1.5">
                                  {org.remittances.slice(0, 4).map((r, i) => (
                                    <div key={i} className="flex justify-between text-xs bg-background rounded px-3 py-1.5 border">
                                      <span>{r.month}</span>
                                      <span className="font-medium">{r.amount > 0 ? formatCurrency(r.amount) : "—"}</span>
                                      <Badge className={`text-[10px] px-1.5 ${remittanceColors[r.status]}`} variant="outline">{r.status}</Badge>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            </div>
                          </td>
                        </tr>
                      )}
                    </>
                  ))}
                  {filtered.length === 0 && (
                    <tr><td colSpan={9} className="text-center py-12 text-muted-foreground">No organizations found.</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Add Organization Modal */}
      <Dialog open={showModal} onOpenChange={setShowModal}>
        <DialogContent>
          <DialogHeader><DialogTitle>Onboard New Organization</DialogTitle></DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-1.5">
              <Label>Organization Name</Label>
              <Input placeholder="e.g. Lagos State Civil Service" value={newOrg.name} onChange={(e) => setNewOrg({ ...newOrg, name: e.target.value })} />
            </div>
            <div className="space-y-1.5">
              <Label>Type</Label>
              <Select value={newOrg.type} onValueChange={(v) => setNewOrg({ ...newOrg, type: v as Organization["type"] })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="Government">Government</SelectItem>
                  <SelectItem value="Private">Private</SelectItem>
                  <SelectItem value="NGO">NGO</SelectItem>
                  <SelectItem value="Educational">Educational</SelectItem>
                  <SelectItem value="Financial">Financial</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label>Contact Email</Label>
              <Input type="email" placeholder="hr@organization.com" value={newOrg.contactEmail} onChange={(e) => setNewOrg({ ...newOrg, contactEmail: e.target.value })} />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowModal(false)}>Cancel</Button>
            <Button onClick={() => createOrg(newOrg)} disabled={creating || !newOrg.name}>
              {creating ? "Onboarding…" : "Onboard Organization"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Org Detail Modal */}
      {selectedOrg && (
        <Dialog open={!!selectedOrg} onOpenChange={() => setSelectedOrg(null)}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Building2 className="h-5 w-5" /> {selectedOrg.name}
              </DialogTitle>
            </DialogHeader>
            <Tabs value={detailTab} onValueChange={setDetailTab}>
              <TabsList className="w-full">
                <TabsTrigger value="overview" className="flex-1">Overview</TabsTrigger>
                <TabsTrigger value="contributions" className="flex-1">Contributions</TabsTrigger>
                <TabsTrigger value="remittances" className="flex-1">Remittance Tracking</TabsTrigger>
                <TabsTrigger value="staff" className="flex-1">Staff</TabsTrigger>
              </TabsList>

              <TabsContent value="overview" className="mt-4 space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  {[
                    { label: "Type", value: selectedOrg.type },
                    { label: "Status", value: selectedOrg.status },
                    { label: "Onboarded", value: new Date(selectedOrg.dateAdded).toLocaleDateString("en-NG") },
                    { label: "Contact", value: selectedOrg.contactEmail },
                    { label: "Members", value: selectedOrg.memberCount.toLocaleString() },
                    { label: "Deduction Status", value: selectedOrg.deductionStatus.replace("_", " ") },
                    { label: "Total Contributions", value: formatCurrency(selectedOrg.totalContributions) },
                    { label: "Last Remittance", value: selectedOrg.lastRemittance ? new Date(selectedOrg.lastRemittance).toLocaleDateString("en-NG") : "—" },
                  ].map(item => (
                    <div key={item.label} className="rounded-lg border p-3">
                      <div className="text-xs text-muted-foreground">{item.label}</div>
                      <div className="font-semibold mt-0.5">{item.value}</div>
                    </div>
                  ))}
                </div>
              </TabsContent>

              <TabsContent value="contributions" className="mt-4">
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <h4 className="font-semibold">Contribution Reports</h4>
                    <Button variant="outline" size="sm" onClick={() => exportRemittanceReport(selectedOrg)}>
                      <Download className="mr-1 h-3.5 w-3.5" /> Export
                    </Button>
                  </div>
                  <div className="rounded-lg border overflow-hidden">
                    <table className="w-full text-sm">
                      <thead className="bg-muted/40 text-xs">
                        <tr>
                          <th className="px-4 py-2 text-left">Month</th>
                          <th className="px-4 py-2 text-right">Amount</th>
                          <th className="px-4 py-2 text-center">Status</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y">
                        {selectedOrg.remittances.map((r, i) => (
                          <tr key={i} className="hover:bg-muted/20">
                            <td className="px-4 py-2">{r.month}</td>
                            <td className="px-4 py-2 text-right font-medium">{r.amount > 0 ? formatCurrency(r.amount) : "—"}</td>
                            <td className="px-4 py-2 text-center">
                              <Badge className={remittanceColors[r.status]} variant="outline">{r.status}</Badge>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="remittances" className="mt-4">
                <div className="space-y-4">
                  <div className="grid grid-cols-3 gap-3">
                    <Card><CardContent className="p-3 text-center">
                      <div className="text-lg font-bold text-emerald-600">{selectedOrg.remittances.filter(r => r.status === "remitted").length}</div>
                      <div className="text-xs text-muted-foreground">Remitted</div>
                    </CardContent></Card>
                    <Card><CardContent className="p-3 text-center">
                      <div className="text-lg font-bold text-amber-600">{selectedOrg.remittances.filter(r => r.status === "pending").length}</div>
                      <div className="text-xs text-muted-foreground">Pending</div>
                    </CardContent></Card>
                    <Card><CardContent className="p-3 text-center">
                      <div className="text-lg font-bold text-red-600">{selectedOrg.remittances.filter(r => r.status === "overdue").length}</div>
                      <div className="text-xs text-muted-foreground">Overdue</div>
                    </CardContent></Card>
                  </div>
                  {selectedOrg.remittances.map((r, i) => (
                    <div key={i} className="flex items-center justify-between rounded-lg border p-3">
                      <div>
                        <div className="font-medium text-sm">{r.month}</div>
                        {r.date && <div className="text-xs text-muted-foreground">Received: {new Date(r.date).toLocaleDateString("en-NG")}</div>}
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="font-semibold">{r.amount > 0 ? formatCurrency(r.amount) : "—"}</span>
                        <Badge className={remittanceColors[r.status]} variant="outline">{r.status}</Badge>
                        {r.status !== "remitted" && (
                          <Button size="sm" variant="outline" onClick={() => toast({ title: "Reminder Sent", description: `Deduction reminder sent for ${r.month}` })}>
                            <RefreshCw className="mr-1 h-3 w-3" /> Remind
                          </Button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </TabsContent>

              <TabsContent value="staff" className="mt-4">
                {selectedOrg.staff.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-12 text-muted-foreground gap-2">
                    <Users className="h-8 w-8 opacity-40" />
                    <p>No staff records for this organization.</p>
                  </div>
                ) : (
                  <div className="rounded-lg border overflow-hidden">
                    <table className="w-full text-sm">
                      <thead className="bg-muted/40 text-xs">
                        <tr>
                          <th className="px-4 py-2 text-left">Name</th>
                          <th className="px-4 py-2 text-left">Email</th>
                          <th className="px-4 py-2 text-left">Department</th>
                          <th className="px-4 py-2 text-center">Joined</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y">
                        {selectedOrg.staff.map(s => (
                          <tr key={s.id} className="hover:bg-muted/20">
                            <td className="px-4 py-2 font-medium">{s.name}</td>
                            <td className="px-4 py-2 text-muted-foreground">{s.email}</td>
                            <td className="px-4 py-2">{s.department}</td>
                            <td className="px-4 py-2 text-center text-muted-foreground">{new Date(s.joinedDate).toLocaleDateString("en-NG")}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </TabsContent>
            </Tabs>
            <DialogFooter>
              <Button variant="outline" onClick={() => setSelectedOrg(null)}>Close</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </Layout>
  );
}
