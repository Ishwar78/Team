import { useState } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";
import {
  Clock, CheckCircle2, XCircle, AlertCircle, Send, FileText,
  Timer, CalendarDays, User, Shield,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { usePermissions } from "@/hooks/usePermissions";
import { useAuth } from "@/contexts/AuthContext";

type ReasonType = "meeting" | "call" | "training" | "other";
type RequestStatus = "pending" | "approved" | "rejected";

interface JustificationRequest {
  id: string;
  userId: string;
  userName: string;
  date: string;
  idleStart: string;
  idleEnd: string;
  duration: string;
  reasonType: ReasonType;
  description: string;
  status: RequestStatus;
  reviewedBy?: string;
  reviewedAt?: string;
  reviewNote?: string;
}

interface AuditEntry {
  id: string;
  timestamp: string;
  action: string;
  actor: string;
  requestId: string;
  userName: string;
  details: string;
}

const REASON_LABELS: Record<ReasonType, string> = {
  meeting: "Meeting",
  call: "Phone Call",
  training: "Training",
  other: "Other",
};

const REASON_ICONS: Record<ReasonType, typeof Clock> = {
  meeting: CalendarDays,
  call: Clock,
  training: FileText,
  other: AlertCircle,
};

const INITIAL_REQUESTS: JustificationRequest[] = [
  {
    id: "j1", userId: "u3", userName: "Bob Williams", date: "2026-02-10",
    idleStart: "10:15", idleEnd: "10:45", duration: "30m",
    reasonType: "meeting", description: "Client onboarding call with TechCorp team in conference room B.",
    status: "pending",
  },
  {
    id: "j2", userId: "u4", userName: "Carol Davis", date: "2026-02-10",
    idleStart: "14:00", idleEnd: "14:30", duration: "30m",
    reasonType: "call", description: "Phone call with vendor about Q1 deliverables.",
    status: "pending",
  },
  {
    id: "j3", userId: "u3", userName: "Bob Williams", date: "2026-02-09",
    idleStart: "09:00", idleEnd: "10:00", duration: "1h",
    reasonType: "training", description: "Mandatory compliance training session.",
    status: "approved", reviewedBy: "Alice Johnson", reviewedAt: "2026-02-09 11:30", reviewNote: "Confirmed with HR.",
  },
  {
    id: "j4", userId: "u5", userName: "Dave Lee", date: "2026-02-08",
    idleStart: "15:00", idleEnd: "16:00", duration: "1h",
    reasonType: "other", description: "Stepped out for personal errand.",
    status: "rejected", reviewedBy: "Alice Johnson", reviewedAt: "2026-02-08 17:00", reviewNote: "Personal errands are not justifiable idle time.",
  },
  {
    id: "j5", userId: "u4", userName: "Carol Davis", date: "2026-02-07",
    idleStart: "11:00", idleEnd: "11:45", duration: "45m",
    reasonType: "meeting", description: "Sprint planning meeting with engineering team.",
    status: "approved", reviewedBy: "Alice Johnson", reviewedAt: "2026-02-07 12:00",
  },
];

const INITIAL_AUDIT: AuditEntry[] = [
  { id: "a1", timestamp: "2026-02-09 11:30", action: "approved", actor: "Alice Johnson", requestId: "j3", userName: "Bob Williams", details: "Approved training justification (1h). Note: Confirmed with HR." },
  { id: "a2", timestamp: "2026-02-08 17:00", action: "rejected", actor: "Alice Johnson", requestId: "j4", userName: "Dave Lee", details: "Rejected 'other' justification (1h). Note: Personal errands are not justifiable." },
  { id: "a3", timestamp: "2026-02-07 12:00", action: "approved", actor: "Alice Johnson", requestId: "j5", userName: "Carol Davis", details: "Approved meeting justification (45m)." },
  { id: "a4", timestamp: "2026-02-10 09:15", action: "submitted", actor: "Bob Williams", requestId: "j1", userName: "Bob Williams", details: "Submitted justification for 30m idle — Meeting." },
  { id: "a5", timestamp: "2026-02-10 14:05", action: "submitted", actor: "Carol Davis", requestId: "j2", userName: "Carol Davis", details: "Submitted justification for 30m idle — Phone Call." },
];

const StatusBadge = ({ status }: { status: RequestStatus }) => {
  const config = {
    pending: { label: "Pending", variant: "outline" as const, className: "border-amber-500/30 text-amber-600 dark:text-amber-400 bg-amber-500/10" },
    approved: { label: "Approved", variant: "outline" as const, className: "border-emerald-500/30 text-emerald-600 dark:text-emerald-400 bg-emerald-500/10" },
    rejected: { label: "Rejected", variant: "destructive" as const, className: "" },
  };
  const c = config[status];
  return <Badge variant={c.variant} className={c.className}>{c.label}</Badge>;
};

const IdleJustification = () => {
  const [requests, setRequests] = useState(INITIAL_REQUESTS);
  const [audit, setAudit] = useState(INITIAL_AUDIT);
  const [reasonType, setReasonType] = useState<ReasonType>("meeting");
  const [description, setDescription] = useState("");
  const [reviewNote, setReviewNote] = useState("");
  const { toast } = useToast();
  const { can, role } = usePermissions();
  const { user } = useAuth();

  const isAdmin = role === "company_admin";

  // User: submit justification
  const submitJustification = () => {
    if (!description.trim()) {
      toast({ title: "Description required", description: "Please describe the reason for idle time.", variant: "destructive" });
      return;
    }
    const newReq: JustificationRequest = {
      id: crypto.randomUUID(),
      userId: user.id,
      userName: user.name,
      date: new Date().toISOString().split("T")[0],
      idleStart: "—",
      idleEnd: "—",
      duration: "—",
      reasonType,
      description: description.trim(),
      status: "pending",
    };
    setRequests((prev) => [newReq, ...prev]);
    setAudit((prev) => [{
      id: crypto.randomUUID(),
      timestamp: new Date().toISOString().replace("T", " ").slice(0, 16),
      action: "submitted",
      actor: user.name,
      requestId: newReq.id,
      userName: user.name,
      details: `Submitted justification — ${REASON_LABELS[reasonType]}.`,
    }, ...prev]);
    setDescription("");
    toast({ title: "Justification submitted", description: "Your request has been sent to the admin for review." });
  };

  // Admin: approve or reject
  const reviewRequest = (id: string, decision: "approved" | "rejected") => {
    setRequests((prev) =>
      prev.map((r) =>
        r.id === id
          ? { ...r, status: decision, reviewedBy: user.name, reviewedAt: new Date().toISOString().replace("T", " ").slice(0, 16), reviewNote: reviewNote.trim() || undefined }
          : r
      )
    );
    const req = requests.find((r) => r.id === id);
    setAudit((prev) => [{
      id: crypto.randomUUID(),
      timestamp: new Date().toISOString().replace("T", " ").slice(0, 16),
      action: decision,
      actor: user.name,
      requestId: id,
      userName: req?.userName ?? "Unknown",
      details: `${decision === "approved" ? "Approved" : "Rejected"} justification (${req?.duration}). ${reviewNote.trim() ? `Note: ${reviewNote.trim()}` : ""}`,
    }, ...prev]);
    setReviewNote("");
    toast({
      title: decision === "approved" ? "Request Approved" : "Request Rejected",
      description: decision === "approved" ? "Idle time has been converted to active." : "Idle time remains flagged.",
    });
  };

  const pendingRequests = requests.filter((r) => r.status === "pending");
  const resolvedRequests = requests.filter((r) => r.status !== "pending");

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-2xl font-bold text-foreground">Idle Time Justification</h1>
          <p className="text-muted-foreground text-sm mt-1">
            {isAdmin
              ? "Review and manage idle time justification requests from your team."
              : "Submit a reason for detected idle time periods. Approved requests convert idle to active time."}
          </p>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="pt-4 pb-3 px-4 flex items-center gap-3">
              <div className="p-2 rounded-lg bg-amber-500/10"><AlertCircle size={18} className="text-amber-500" /></div>
              <div>
                <p className="text-xl font-bold">{pendingRequests.length}</p>
                <p className="text-[11px] text-muted-foreground">Pending</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-4 pb-3 px-4 flex items-center gap-3">
              <div className="p-2 rounded-lg bg-emerald-500/10"><CheckCircle2 size={18} className="text-emerald-500" /></div>
              <div>
                <p className="text-xl font-bold">{requests.filter((r) => r.status === "approved").length}</p>
                <p className="text-[11px] text-muted-foreground">Approved</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-4 pb-3 px-4 flex items-center gap-3">
              <div className="p-2 rounded-lg bg-destructive/10"><XCircle size={18} className="text-destructive" /></div>
              <div>
                <p className="text-xl font-bold">{requests.filter((r) => r.status === "rejected").length}</p>
                <p className="text-[11px] text-muted-foreground">Rejected</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-4 pb-3 px-4 flex items-center gap-3">
              <div className="p-2 rounded-lg bg-primary/10"><Timer size={18} className="text-primary" /></div>
              <div>
                <p className="text-xl font-bold">{requests.length}</p>
                <p className="text-[11px] text-muted-foreground">Total Requests</p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Submit Form (all roles can submit) */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2"><Send size={16} /> Submit Justification</CardTitle>
            <CardDescription>Explain the reason for an idle time period detected by the agent.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex flex-col sm:flex-row gap-3">
              <Select value={reasonType} onValueChange={(v) => setReasonType(v as ReasonType)}>
                <SelectTrigger className="w-full sm:w-44">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {(Object.keys(REASON_LABELS) as ReasonType[]).map((key) => (
                    <SelectItem key={key} value={key}>{REASON_LABELS[key]}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Textarea
                placeholder="Describe the reason for idle time…"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="flex-1 min-h-[80px]"
              />
            </div>
            <Button onClick={submitJustification} className="gap-2">
              <Send size={14} /> Submit Request
            </Button>
          </CardContent>
        </Card>

        {/* Tabs: Pending / History / Audit */}
        <Card>
          <CardContent className="pt-6">
            <Tabs defaultValue={isAdmin ? "pending" : "history"}>
              <TabsList>
                {isAdmin && (
                  <TabsTrigger value="pending" className="gap-1.5">
                    <AlertCircle size={14} /> Pending ({pendingRequests.length})
                  </TabsTrigger>
                )}
                <TabsTrigger value="history" className="gap-1.5">
                  <FileText size={14} /> History
                </TabsTrigger>
                {isAdmin && (
                  <TabsTrigger value="audit" className="gap-1.5">
                    <Shield size={14} /> Audit Log
                  </TabsTrigger>
                )}
              </TabsList>

              {/* Pending (Admin) */}
              {isAdmin && (
                <TabsContent value="pending" className="mt-4">
                  {pendingRequests.length === 0 ? (
                    <div className="text-center py-10 text-muted-foreground">
                      <CheckCircle2 size={32} className="mx-auto mb-2 opacity-40" />
                      <p className="text-sm">No pending requests. All caught up!</p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {pendingRequests.map((req) => {
                        const ReasonIcon = REASON_ICONS[req.reasonType];
                        return (
                          <Card key={req.id} className="border-amber-500/20">
                            <CardContent className="pt-4 pb-4 space-y-3">
                              <div className="flex items-start justify-between">
                                <div className="flex items-center gap-3">
                                  <div className="p-2 rounded-full bg-amber-500/10">
                                    <ReasonIcon size={16} className="text-amber-500" />
                                  </div>
                                  <div>
                                    <p className="font-semibold text-sm flex items-center gap-2">
                                      <User size={13} className="text-muted-foreground" /> {req.userName}
                                    </p>
                                    <p className="text-xs text-muted-foreground">
                                      {req.date} · {req.idleStart}–{req.idleEnd} ({req.duration}) · {REASON_LABELS[req.reasonType]}
                                    </p>
                                  </div>
                                </div>
                                <StatusBadge status={req.status} />
                              </div>
                              <p className="text-sm text-foreground pl-11">{req.description}</p>
                              <Separator />
                              <div className="flex flex-col sm:flex-row gap-2 pl-11">
                                <Textarea
                                  placeholder="Optional review note…"
                                  className="flex-1 min-h-[40px] text-sm"
                                  value={reviewNote}
                                  onChange={(e) => setReviewNote(e.target.value)}
                                />
                                <div className="flex gap-2">
                                  <Button size="sm" onClick={() => reviewRequest(req.id, "approved")} className="gap-1.5 bg-emerald-600 hover:bg-emerald-700">
                                    <CheckCircle2 size={14} /> Approve
                                  </Button>
                                  <Button size="sm" variant="destructive" onClick={() => reviewRequest(req.id, "rejected")} className="gap-1.5">
                                    <XCircle size={14} /> Reject
                                  </Button>
                                </div>
                              </div>
                            </CardContent>
                          </Card>
                        );
                      })}
                    </div>
                  )}
                </TabsContent>
              )}

              {/* History */}
              <TabsContent value="history" className="mt-4">
                {resolvedRequests.length === 0 ? (
                  <p className="text-sm text-muted-foreground text-center py-8">No resolved requests yet.</p>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Employee</TableHead>
                        <TableHead>Date</TableHead>
                        <TableHead>Duration</TableHead>
                        <TableHead>Reason</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Reviewed By</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {resolvedRequests.map((req) => (
                        <TableRow key={req.id}>
                          <TableCell className="font-medium">{req.userName}</TableCell>
                          <TableCell className="text-muted-foreground text-xs">{req.date}</TableCell>
                          <TableCell className="text-xs">{req.duration}</TableCell>
                          <TableCell>
                            <Badge variant="outline" className="text-[10px]">{REASON_LABELS[req.reasonType]}</Badge>
                          </TableCell>
                          <TableCell><StatusBadge status={req.status} /></TableCell>
                          <TableCell className="text-xs text-muted-foreground">
                            {req.reviewedBy ?? "—"}
                            {req.reviewNote && <p className="text-[10px] italic mt-0.5">"{req.reviewNote}"</p>}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                )}
              </TabsContent>

              {/* Audit Log (Admin) */}
              {isAdmin && (
                <TabsContent value="audit" className="mt-4">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Timestamp</TableHead>
                        <TableHead>Action</TableHead>
                        <TableHead>Actor</TableHead>
                        <TableHead>Employee</TableHead>
                        <TableHead>Details</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {audit.map((entry) => (
                        <TableRow key={entry.id}>
                          <TableCell className="text-xs text-muted-foreground whitespace-nowrap">{entry.timestamp}</TableCell>
                          <TableCell>
                            <Badge
                              variant="outline"
                              className={
                                entry.action === "approved"
                                  ? "border-emerald-500/30 text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 text-[10px]"
                                  : entry.action === "rejected"
                                  ? "border-destructive/30 text-destructive bg-destructive/10 text-[10px]"
                                  : "text-[10px]"
                              }
                            >
                              {entry.action.toUpperCase()}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-sm">{entry.actor}</TableCell>
                          <TableCell className="text-sm">{entry.userName}</TableCell>
                          <TableCell className="text-xs text-muted-foreground max-w-xs">{entry.details}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TabsContent>
              )}
            </Tabs>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default IdleJustification;
