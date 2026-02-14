import { useState, useMemo, useEffect } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import { PageGuard } from "@/components/RoleGuard";
import { useAuth } from "@/contexts/AuthContext";
import { apiFetch } from "@/lib/api";
import { usePermissions } from "@/hooks/usePermissions";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Users, ChevronLeft, ChevronRight, Calendar } from "lucide-react";
import { format, startOfWeek, endOfWeek, startOfMonth, endOfMonth, addDays, subWeeks, addWeeks, subMonths, addMonths, subDays, addDays as addDay, eachDayOfInterval } from "date-fns";

type ViewMode = "day" | "week" | "month" | "dateRange";

interface AttendanceData {
  date: string;
  inTime: string | null;
  finishTime: string | null;
  workHours: string;
  idleHours: string;
  hourlyData: { [hour: string]: string }; // "Active", "Idle", "Absent" etc.
}

// Mock hourly columns like in the reference screenshot
const HOURLY_COLUMNS = ["7 AM", "8 AM", "11 AM", "1 PM", "3 PM", "8 PM", "7 PM", "9 PM", "11 PM", "1 AM", "3 AM", "8 AM"];

const generateMockAttendance = (startDate: Date, endDate: Date): AttendanceData[] => {
  const days = eachDayOfInterval({ start: startDate, end: endDate });
  return days.map((day) => {
    const rand = Math.random();
    const isAbsent = rand < 0.2;

    const hourlyData: { [hour: string]: string } = {};
    HOURLY_COLUMNS.forEach((hour) => {
      if (isAbsent) {
        hourlyData[hour] = "Absent";
      } else {
        const activity = Math.random();
        if (activity < 0.6) hourlyData[hour] = "Active";
        else if (activity < 0.9) hourlyData[hour] = "Idle";
        else hourlyData[hour] = "Away";
      }
    });

    return {
      date: format(day, "dd MMM yyyy EEE"),
      inTime: isAbsent ? null : "09:00 AM",
      finishTime: isAbsent ? null : "06:00 PM",
      workHours: isAbsent ? "00:00:00" : "08:30:00",
      idleHours: isAbsent ? "00:00:00" : "00:30:00",
      hourlyData,
    };
  });
};

const Attendance = () => {
  const { token, user } = useAuth();
  const { can, role } = usePermissions();
  const isAdmin = can("manage_team") || role === "company_admin" || role === "sub_admin";

  const [viewMode, setViewMode] = useState<ViewMode>("week");
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedUser, setSelectedUser] = useState<string>("");
  const [teamMembers, setTeamMembers] = useState<any[]>([]);

  useEffect(() => {
    if (token && user?.id) {
      setSelectedUser(user.id);
      if (isAdmin) {
        fetchTeamMembers();
      }
    }
  }, [token, user]);

  const fetchTeamMembers = async () => {
    try {
      const data = await apiFetch("/api/company/users", token);
      setTeamMembers(data.users || []);
    } catch (err) {
      console.error("Failed to fetch team members", err);
    }
  };

  const { startDate, endDate, displayRange } = useMemo(() => {
    let start: Date, end: Date, display: string;

    switch (viewMode) {
      case "day":
        start = end = currentDate;
        display = format(currentDate, "dd MMM yyyy");
        break;
      case "week":
        start = startOfWeek(currentDate, { weekStartsOn: 1 });
        end = endOfWeek(currentDate, { weekStartsOn: 1 });
        display = `${format(start, "dd MMM")} - ${format(end, "dd MMM yyyy")}`;
        break;
      case "month":
        start = startOfMonth(currentDate);
        end = endOfMonth(currentDate);
        display = format(currentDate, "MMMM yyyy");
        break;
      case "dateRange":
        start = subDays(currentDate, 30);
        end = currentDate;
        display = `${format(start, "dd MMM")} - ${format(end, "dd MMM yyyy")}`;
        break;
    }

    return { startDate: start, endDate: end, displayRange: display };
  }, [viewMode, currentDate]);

  const attendanceData = useMemo(() => {
    return generateMockAttendance(startDate, endDate);
  }, [startDate, endDate]);

  const stats = useMemo(() => {
    const totalWork = attendanceData.reduce((acc, d) => {
      const [h, m, s] = d.workHours.split(":").map(Number);
      return acc + h * 3600 + m * 60 + s;
    }, 0);

    const totalIdle = attendanceData.reduce((acc, d) => {
      const [h, m, s] = d.idleHours.split(":").map(Number);
      return acc + h * 3600 + m * 60 + s;
    }, 0);

    const formatTime = (seconds: number) => {
      const h = Math.floor(seconds / 3600);
      const m = Math.floor((seconds % 3600) / 60);
      const s = seconds % 60;
      return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
    };

    return {
      timeSpent: formatTime(totalWork + totalIdle),
      workingTime: formatTime(totalWork),
      idleTime: formatTime(totalIdle),
    };
  }, [attendanceData]);

  const handlePrev = () => {
    switch (viewMode) {
      case "day":
        setCurrentDate((d) => subDays(d, 1));
        break;
      case "week":
        setCurrentDate((d) => subWeeks(d, 1));
        break;
      case "month":
        setCurrentDate((d) => subMonths(d, 1));
        break;
    }
  };

  const handleNext = () => {
    switch (viewMode) {
      case "day":
        setCurrentDate((d) => addDay(d, 1));
        break;
      case "week":
        setCurrentDate((d) => addWeeks(d, 1));
        break;
      case "month":
        setCurrentDate((d) => addMonths(d, 1));
        break;
    }
  };

  const getHourColor = (status: string) => {
    switch (status) {
      case "Active":
        return "bg-green-500/20 text-green-400";
      case "Idle":
        return "bg-yellow-500/20 text-yellow-400";
      case "Away":
        return "bg-orange-500/20 text-orange-400";
      case "Absent":
        return "bg-blue-500/20 text-blue-400";
      default:
        return "bg-muted text-muted-foreground";
    }
  };

  return (
    <DashboardLayout>
      <PageGuard permission="view_attendance">
        <div className="space-y-6">
          {/* Header with Navigation */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-6">
              <div className="flex items-center gap-2">
                <Button variant="ghost" size="icon" onClick={handlePrev}>
                  <ChevronLeft size={18} />
                </Button>
                <div className="flex items-center gap-2 min-w-[160px] justify-center">
                  <Calendar className="text-primary" size={20} />
                  <h2 className="text-lg font-semibold">{displayRange}</h2>
                </div>
                <Button variant="ghost" size="icon" onClick={handleNext}>
                  <ChevronRight size={18} />
                </Button>
              </div>

              {/* Employee Selector (Admin Only) */}
              {isAdmin && teamMembers.length > 0 && (
                <div className="flex items-center gap-2 ml-4 border-l pl-6 border-border">
                  <Select value={selectedUser} onValueChange={setSelectedUser}>
                    <SelectTrigger className="w-56 bg-card border-border">
                      <Users size={14} className="mr-2 text-muted-foreground" />
                      <SelectValue placeholder="Select Employee" />
                    </SelectTrigger>
                    <SelectContent>
                      {teamMembers.map((member) => (
                        <SelectItem key={member._id} value={member._id}>
                          {member.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}
            </div>

            {/* View Mode Tabs */}
            <div className="flex gap-2">
              {(["day", "week", "month", "dateRange"] as ViewMode[]).map((mode) => (
                <Button
                  key={mode}
                  variant={viewMode === mode ? "default" : "outline"}
                  size="sm"
                  onClick={() => setViewMode(mode)}
                  className="capitalize"
                >
                  {mode === "dateRange" ? "Date Range" : mode}
                </Button>
              ))}
            </div>
          </div>

          {/* Summary Stats */}
          <div className="grid grid-cols-3 gap-4">
            <Card className="bg-gradient-to-br from-blue-500/10 to-blue-600/5 border-blue-500/20">
              <CardContent className="p-6">
                <div className="text-center">
                  <p className="text-sm text-muted-foreground mb-2">Time Spent</p>
                  <p className="text-3xl font-bold text-blue-500">{stats.timeSpent}</p>
                </div>
              </CardContent>
            </Card>
            <Card className="bg-gradient-to-br from-green-500/10 to-green-600/5 border-green-500/20">
              <CardContent className="p-6">
                <div className="text-center">
                  <p className="text-sm text-muted-foreground mb-2">Total Working Time</p>
                  <p className="text-3xl font-bold text-green-500">{stats.workingTime}</p>
                </div>
              </CardContent>
            </Card>
            <Card className="bg-gradient-to-br from-yellow-500/10 to-yellow-600/5 border-yellow-500/20">
              <CardContent className="p-6">
                <div className="text-center">
                  <p className="text-sm text-muted-foreground mb-2">Idle Time</p>
                  <p className="text-3xl font-bold text-yellow-500">{stats.idleTime}</p>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Attendance Table with Hourly Breakdown */}
          <Card>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-primary/5">
                      <TableHead className="font-semibold">Date</TableHead>
                      <TableHead className="font-semibold text-center">In Time</TableHead>
                      <TableHead className="font-semibold text-center">Finish</TableHead>
                      <TableHead className="font-semibold text-center">Work</TableHead>
                      <TableHead className="font-semibold text-center">Idle</TableHead>
                      {HOURLY_COLUMNS.map((hour) => (
                        <TableHead key={hour} className="font-semibold text-center text-xs">
                          {hour}
                        </TableHead>
                      ))}
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {attendanceData.map((record, idx) => (
                      <TableRow key={idx} className="hover:bg-muted/50">
                        <TableCell className="font-medium">{record.date}</TableCell>
                        <TableCell className="text-center text-sm">
                          {record.inTime || "-"}
                        </TableCell>
                        <TableCell className="text-center text-sm">
                          {record.finishTime || "-"}
                        </TableCell>
                        <TableCell className="text-center text-sm font-mono">
                          {record.workHours}
                        </TableCell>
                        <TableCell className="text-center text-sm font-mono">
                          {record.idleHours}
                        </TableCell>
                        {HOURLY_COLUMNS.map((hour) => (
                          <TableCell key={hour} className="text-center p-1">
                            <div
                              className={`rounded px-2 py-1 text-xs font-medium ${getHourColor(
                                record.hourlyData[hour]
                              )}`}
                            >
                              {record.hourlyData[hour] === "Absent" ? "Absent" : ""}
                            </div>
                          </TableCell>
                        ))}
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </div>
      </PageGuard>
    </DashboardLayout>
  );
};

export default Attendance;
