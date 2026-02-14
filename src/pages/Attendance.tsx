import { useState, useMemo } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import { PageGuard } from "@/components/RoleGuard";
import { usePermissions } from "@/hooks/usePermissions";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import {
  CalendarCheck, Clock, AlertTriangle, Download, ChevronLeft, ChevronRight,
  LogIn, LogOut, TrendingUp, Users
} from "lucide-react";
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth, isToday, isWeekend, getDay } from "date-fns";

type AttendanceStatus = "present" | "late" | "early_leave" | "absent" | "half_day" | "weekend" | "holiday";

interface AttendanceRecord {
  id: string;
  userId: string;
  userName: string;
  date: string;
  loginTime: string | null;
  logoutTime: string | null;
  scheduledStart: string;
  scheduledEnd: string;
  status: AttendanceStatus;
  totalHours: number;
  lateBy?: string;
  earlyBy?: string;
}

const STATUS_CONFIG: Record<AttendanceStatus, { label: string; className: string }> = {
  present: { label: "Present", className: "bg-[hsl(var(--status-active))]/15 text-[hsl(var(--status-active))] border-[hsl(var(--status-active))]/30" },
  late: { label: "Late", className: "bg-[hsl(var(--status-idle))]/15 text-[hsl(var(--status-idle))] border-[hsl(var(--status-idle))]/30" },
  early_leave: { label: "Early Leave", className: "bg-[hsl(var(--status-idle))]/15 text-[hsl(var(--status-idle))] border-[hsl(var(--status-idle))]/30" },
  absent: { label: "Absent", className: "bg-destructive/15 text-destructive border-destructive/30" },
  half_day: { label: "Half Day", className: "bg-primary/15 text-primary border-primary/30" },
  weekend: { label: "Weekend", className: "bg-muted text-muted-foreground border-border" },
  holiday: { label: "Holiday", className: "bg-primary/10 text-primary border-primary/20" },
};

const TEAM_MEMBERS = [
  { id: "all", name: "All Members" },
  { id: "u1", name: "Alice Johnson" },
  { id: "u2", name: "Bob Smith" },
  { id: "u3", name: "Carol Davis" },
  { id: "u4", name: "Dan Wilson" },
];

function generateMockRecords(year: number, month: number): AttendanceRecord[] {
  const start = startOfMonth(new Date(year, month));
  const end = endOfMonth(start);
  const days = eachDayOfInterval({ start, end });
  const records: AttendanceRecord[] = [];
  const users = TEAM_MEMBERS.slice(1);

  users.forEach((user) => {
    days.forEach((day) => {
      const dayOfWeek = getDay(day);
      if (dayOfWeek === 0 || dayOfWeek === 6) return;

      const rand = Math.random();
      let status: AttendanceStatus;
      let loginTime: string | null = "09:00";
      let logoutTime: string | null = "18:00";
      let totalHours = 9;
      let lateBy: string | undefined;
      let earlyBy: string | undefined;

      if (rand < 0.6) {
        status = "present";
      } else if (rand < 0.75) {
        status = "late";
        const mins = Math.floor(Math.random() * 45) + 5;
        loginTime = `09:${String(mins).padStart(2, "0")}`;
        lateBy = `${mins}m`;
        totalHours = 9 - mins / 60;
      } else if (rand < 0.85) {
        status = "early_leave";
        const mins = Math.floor(Math.random() * 60) + 15;
        const leaveHour = 18 - Math.ceil(mins / 60);
        logoutTime = `${leaveHour}:${String(60 - (mins % 60 || 60)).padStart(2, "0")}`;
        earlyBy = `${mins}m`;
        totalHours = 9 - mins / 60;
      } else if (rand < 0.92) {
        status = "half_day";
        logoutTime = "13:00";
        totalHours = 4;
      } else {
        status = "absent";
        loginTime = null;
        logoutTime = null;
        totalHours = 0;
      }

      records.push({
        id: `${user.id}-${format(day, "yyyy-MM-dd")}`,
        userId: user.id,
        userName: user.name,
        date: format(day, "yyyy-MM-dd"),
        loginTime,
        logoutTime,
        scheduledStart: "09:00",
        scheduledEnd: "18:00",
        status,
        totalHours: Math.round(totalHours * 10) / 10,
        lateBy,
        earlyBy,
      });
    });
  });

  return records;
}

const Attendance = () => {
  const { can } = usePermissions();
  const isAdmin = can("export_reports");
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedUser, setSelectedUser] = useState("all");

  const records = useMemo(
    () => generateMockRecords(currentMonth.getFullYear(), currentMonth.getMonth()),
    [currentMonth]
  );

  const filtered = selectedUser === "all" ? records : records.filter((r) => r.userId === selectedUser);

  const stats = useMemo(() => {
    const total = filtered.length;
    const present = filtered.filter((r) => r.status === "present").length;
    const late = filtered.filter((r) => r.status === "late").length;
    const absent = filtered.filter((r) => r.status === "absent").length;
    const avgHours = total ? filtered.reduce((s, r) => s + r.totalHours, 0) / total : 0;
    return { total, present, late, absent, avgHours: Math.round(avgHours * 10) / 10 };
  }, [filtered]);

  const prevMonth = () => setCurrentMonth((d) => new Date(d.getFullYear(), d.getMonth() - 1));
  const nextMonth = () => setCurrentMonth((d) => new Date(d.getFullYear(), d.getMonth() + 1));

  // Calendar data
  const calendarDays = useMemo(() => {
    const start = startOfMonth(currentMonth);
    const end = endOfMonth(currentMonth);
    return eachDayOfInterval({ start, end });
  }, [currentMonth]);

  const getStatusForDay = (day: Date) => {
    if (isWeekend(day)) return "weekend";
    const dateStr = format(day, "yyyy-MM-dd");
    const dayRecords = filtered.filter((r) => r.date === dateStr);
    if (!dayRecords.length) return null;
    if (dayRecords.some((r) => r.status === "absent")) return "absent";
    if (dayRecords.some((r) => r.status === "late")) return "late";
    if (dayRecords.some((r) => r.status === "early_leave")) return "early_leave";
    if (dayRecords.some((r) => r.status === "half_day")) return "half_day";
    return "present";
  };

  const calendarStatusColor: Record<string, string> = {
    present: "bg-[hsl(var(--status-active))]",
    late: "bg-[hsl(var(--status-idle))]",
    early_leave: "bg-[hsl(var(--status-idle))]",
    absent: "bg-destructive",
    half_day: "bg-primary",
    weekend: "bg-muted",
  };

  const handleExport = () => {
    const csv = [
      "Date,Employee,Login,Logout,Status,Hours,Late By,Early By",
      ...filtered.map((r) =>
        `${r.date},${r.userName},${r.loginTime ?? "-"},${r.logoutTime ?? "-"},${r.status},${r.totalHours},${r.lateBy ?? "-"},${r.earlyBy ?? "-"}`
      ),
    ].join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `attendance-${format(currentMonth, "yyyy-MM")}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <DashboardLayout>
      <PageGuard permission="view_attendance">
        <div className="space-y-6">
          {/* Header */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
                <CalendarCheck className="text-primary" size={28} />
                Attendance & Compliance
              </h1>
              <p className="text-sm text-muted-foreground mt-1">Track work hours, punctuality, and attendance patterns</p>
            </div>
            <div className="flex items-center gap-3">
              {isAdmin && (
                <Select value={selectedUser} onValueChange={setSelectedUser}>
                  <SelectTrigger className="w-44 bg-card border-border">
                    <Users size={14} className="mr-2 text-muted-foreground" />
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {TEAM_MEMBERS.map((m) => (
                      <SelectItem key={m.id} value={m.id}>{m.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
              {isAdmin && (
                <Button variant="outline" size="sm" onClick={handleExport} className="gap-2">
                  <Download size={14} /> Export CSV
                </Button>
              )}
            </div>
          </div>

          {/* Summary Cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { label: "Present Days", value: stats.present, icon: CalendarCheck, color: "text-[hsl(var(--status-active))]" },
              { label: "Late Arrivals", value: stats.late, icon: AlertTriangle, color: "text-[hsl(var(--status-idle))]" },
              { label: "Absent Days", value: stats.absent, icon: LogOut, color: "text-destructive" },
              { label: "Avg Hours/Day", value: stats.avgHours, icon: TrendingUp, color: "text-primary" },
            ].map((s) => (
              <Card key={s.label} className="bg-card border-border">
                <CardContent className="p-4 flex items-center gap-3">
                  <div className={`p-2 rounded-lg bg-secondary ${s.color}`}>
                    <s.icon size={18} />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-foreground">{s.value}</p>
                    <p className="text-xs text-muted-foreground">{s.label}</p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Tabs */}
          <Tabs defaultValue="calendar">
            <TabsList className="bg-secondary">
              <TabsTrigger value="calendar">Calendar</TabsTrigger>
              <TabsTrigger value="log">Daily Log</TabsTrigger>
            </TabsList>

            {/* Calendar View */}
            <TabsContent value="calendar">
              <Card className="bg-card border-border">
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <Button variant="ghost" size="icon" onClick={prevMonth}><ChevronLeft size={16} /></Button>
                  <CardTitle className="text-base">{format(currentMonth, "MMMM yyyy")}</CardTitle>
                  <Button variant="ghost" size="icon" onClick={nextMonth}><ChevronRight size={16} /></Button>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-7 gap-1 mb-2">
                    {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((d) => (
                      <div key={d} className="text-center text-xs font-medium text-muted-foreground py-1">{d}</div>
                    ))}
                  </div>
                  <div className="grid grid-cols-7 gap-1">
                    {/* Leading blanks */}
                    {Array.from({ length: getDay(calendarDays[0]) }).map((_, i) => (
                      <div key={`blank-${i}`} />
                    ))}
                    {calendarDays.map((day) => {
                      const status = getStatusForDay(day);
                      return (
                        <div
                          key={day.toISOString()}
                          className={`relative aspect-square flex items-center justify-center rounded-lg text-xs font-medium transition-colors
                            ${isToday(day) ? "ring-2 ring-primary" : ""}
                            ${status && status !== "weekend" ? "text-foreground" : "text-muted-foreground"}
                          `}
                        >
                          {status && status !== "weekend" && (
                            <div className={`absolute inset-1 rounded-md ${calendarStatusColor[status]} opacity-20`} />
                          )}
                          <span className="relative z-10">{format(day, "d")}</span>
                          {status && status !== "weekend" && (
                            <span className={`absolute bottom-0.5 w-1.5 h-1.5 rounded-full ${calendarStatusColor[status]}`} />
                          )}
                        </div>
                      );
                    })}
                  </div>
                  {/* Legend */}
                  <div className="flex flex-wrap gap-4 mt-4 pt-3 border-t border-border">
                    {(["present", "late", "early_leave", "absent", "half_day"] as AttendanceStatus[]).map((s) => (
                      <div key={s} className="flex items-center gap-1.5 text-xs text-muted-foreground">
                        <span className={`w-2.5 h-2.5 rounded-full ${calendarStatusColor[s]}`} />
                        {STATUS_CONFIG[s].label}
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Daily Log Table */}
            <TabsContent value="log">
              <Card className="bg-card border-border">
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <Button variant="ghost" size="icon" onClick={prevMonth}><ChevronLeft size={16} /></Button>
                  <CardTitle className="text-base">{format(currentMonth, "MMMM yyyy")}</CardTitle>
                  <Button variant="ghost" size="icon" onClick={nextMonth}><ChevronRight size={16} /></Button>
                </CardHeader>
                <CardContent className="p-0">
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow className="border-border">
                          <TableHead>Date</TableHead>
                          {isAdmin && <TableHead>Employee</TableHead>}
                          <TableHead className="text-center"><LogIn size={13} className="inline mr-1" />Login</TableHead>
                          <TableHead className="text-center"><LogOut size={13} className="inline mr-1" />Logout</TableHead>
                          <TableHead className="text-center">Hours</TableHead>
                          <TableHead className="text-center">Status</TableHead>
                          <TableHead className="text-center">Deviation</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {filtered.slice(0, 40).map((r) => (
                          <TableRow key={r.id} className="border-border">
                            <TableCell className="font-medium text-foreground">{format(new Date(r.date), "EEE, MMM d")}</TableCell>
                            {isAdmin && <TableCell className="text-muted-foreground">{r.userName}</TableCell>}
                            <TableCell className="text-center">
                              <span className={r.lateBy ? "text-[hsl(var(--status-idle))] font-medium" : "text-muted-foreground"}>
                                {r.loginTime ?? "—"}
                              </span>
                            </TableCell>
                            <TableCell className="text-center">
                              <span className={r.earlyBy ? "text-[hsl(var(--status-idle))] font-medium" : "text-muted-foreground"}>
                                {r.logoutTime ?? "—"}
                              </span>
                            </TableCell>
                            <TableCell className="text-center text-muted-foreground">{r.totalHours > 0 ? `${r.totalHours}h` : "—"}</TableCell>
                            <TableCell className="text-center">
                              <Badge variant="outline" className={`text-[10px] ${STATUS_CONFIG[r.status].className}`}>
                                {STATUS_CONFIG[r.status].label}
                              </Badge>
                            </TableCell>
                            <TableCell className="text-center text-xs text-muted-foreground">
                              {r.lateBy && <span className="text-[hsl(var(--status-idle))]">Late {r.lateBy}</span>}
                              {r.earlyBy && <span className="text-[hsl(var(--status-idle))]">Early {r.earlyBy}</span>}
                              {!r.lateBy && !r.earlyBy && r.status === "present" && <span className="text-[hsl(var(--status-active))]">On time</span>}
                              {r.status === "absent" && <span className="text-destructive">No show</span>}
                              {r.status === "half_day" && "Half day"}
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </PageGuard>
    </DashboardLayout>
  );
};

export default Attendance;
