import { useState, useEffect, useMemo } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import { useAuth } from "@/contexts/AuthContext";
import { apiFetch } from "@/lib/api";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { format, startOfDay, endOfDay, addDays, subDays } from "date-fns";
import { Input } from "@/components/ui/input";

const TimeLogs = () => {
  const { token } = useAuth();
  const [users, setUsers] = useState<any[]>([]);
  const [selectedUserId, setSelectedUserId] = useState<string>("");
  const [logs, setLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [currentDate, setCurrentDate] = useState<Date>(new Date());
  const [searchTerm, setSearchTerm] = useState("");

  const TIMELINE_WIDTH = 2400;

  /* ================= FETCH USERS ================= */

  useEffect(() => {
    if (!token) return;
    apiFetch("/api/company/users", token)
      .then(data => setUsers(data.users || []))
      .catch(console.error);
  }, [token]);

  /* ================= FETCH TIMELINE ================= */

  useEffect(() => {
    if (!selectedUserId || !token) return;

    const fetchTimeline = async () => {
      setLoading(true);
      try {
        const start = startOfDay(currentDate).toISOString();
        const end = endOfDay(currentDate).toISOString();

        const data = await apiFetch(
          `/api/activity/timeline?user_id=${selectedUserId}&start_date=${start}&end_date=${end}`,
          token
        );

        setLogs(data.logs || []);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchTimeline();
  }, [selectedUserId, currentDate, token]);

  /* ================= TIMELINE DATA ================= */

  const timelineData = useMemo(() => {
    if (!logs.length) return [];

    const dayStart = startOfDay(currentDate).getTime();
    const dayEnd = endOfDay(currentDate).getTime();
    const dayDuration = dayEnd - dayStart;

    return logs.map(log => {
      const start = new Date(log.interval_start).getTime();
      const end = new Date(log.interval_end).getTime();

      return {
        id: log._id,
        left: ((start - dayStart) / dayDuration) * TIMELINE_WIDTH,
        width: ((end - start) / dayDuration) * TIMELINE_WIDTH,
        idle: log.idle,
        startStr: format(new Date(log.interval_start), "hh:mm a"),
        endStr: format(new Date(log.interval_end), "hh:mm a"),
      };
    });
  }, [logs, currentDate]);

  const totalWork = useMemo(() => {
    const totalMs = logs.reduce((acc, log) => {
      return acc + (new Date(log.interval_end).getTime() - new Date(log.interval_start).getTime());
    }, 0);

    const hours = Math.floor(totalMs / (1000 * 60 * 60));
    const minutes = Math.floor((totalMs % (1000 * 60 * 60)) / (1000 * 60));

    return `${hours}h ${minutes}m`;
  }, [logs]);

  const filteredUsers = users.filter(u =>
    u.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    u.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <DashboardLayout>
      <div className="flex h-[calc(100vh-100px)] gap-6 overflow-hidden">

        {/* Sidebar */}
        <Card className="w-80 flex flex-col h-full">
          <CardHeader>
            <CardTitle>Team Members</CardTitle>
            <Input
              placeholder="Search..."
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              className="mt-2"
            />
          </CardHeader>

          <CardContent className="overflow-y-auto space-y-2">
            {filteredUsers.map(u => (
              <div
                key={u._id}
                onClick={() => setSelectedUserId(u._id)}
                className={`flex items-center gap-3 p-3 rounded cursor-pointer ${
                  selectedUserId === u._id ? "bg-primary/10" : "hover:bg-secondary/50"
                }`}
              >
                <Avatar>
                  <AvatarFallback>{u.name.charAt(0)}</AvatarFallback>
                </Avatar>
                <div>
                  <p>{u.name}</p>
                  <p className="text-xs text-muted-foreground">{u.email}</p>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Timeline Section */}
        <div className="flex-1 flex flex-col overflow-hidden">

          {/* Header */}
          <div className="flex justify-between items-center p-4 bg-card rounded border mb-4">
            <div className="flex items-center gap-2">
              <Button variant="ghost" onClick={() => setCurrentDate(subDays(currentDate, 1))}>
                <ChevronLeft size={18} />
              </Button>

              <div className="font-medium">
                {format(currentDate, "EEE, dd MMM yyyy")}
              </div>

              <Button variant="ghost" onClick={() => setCurrentDate(addDays(currentDate, 1))}>
                <ChevronRight size={18} />
              </Button>
            </div>

            <div className="text-green-500 font-bold">
              {totalWork}
            </div>
          </div>

          {/* Timeline Card */}
          <Card className="flex-1 flex flex-col overflow-hidden">
            <CardHeader>
              <CardTitle>Activity Timeline</CardTitle>
            </CardHeader>

            <CardContent className="flex-1 overflow-hidden">

              {!selectedUserId ? (
                <div className="text-center text-muted-foreground py-10">
                  Select a user
                </div>
              ) : loading ? (
                <div>Loading...</div>
              ) : (

                /* 🔥 ONLY THIS AREA SCROLLS */
                <div className="overflow-x-auto h-full">

                  <div style={{ width: TIMELINE_WIDTH }}>

                    {/* Time Ruler */}
                    <div className="relative h-10 border-b border-border mb-4">
                      {Array.from({ length: 24 }).map((_, i) => {
                        const left = (i / 24) * TIMELINE_WIDTH;

                        return (
                          <div
                            key={i}
                            className="absolute text-xs text-muted-foreground"
                            style={{ left }}
                          >
                            {format(new Date().setHours(i, 0, 0, 0), "h a")}
                          </div>
                        );
                      })}
                    </div>

                    {/* Activity Bar */}
                    <div className="relative h-20 bg-secondary/20 rounded border border-border">
                      {timelineData.map(item => (
                        <div
                          key={item.id}
                          className={`absolute top-4 h-12 rounded-sm group ${
                            item.idle
                              ? "bg-red-500/80 hover:bg-red-400"
                              : "bg-green-500/80 hover:bg-green-400"
                          }`}
                          style={{
                            left: item.left,
                            width: item.width
                          }}
                        >
                          <div className="hidden group-hover:block absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2 py-1 bg-black text-white text-xs rounded">
                            {item.startStr} - {item.endStr}
                          </div>
                        </div>
                      ))}
                    </div>

                  </div>
                </div>

              )}

              {/* Legend */}
              <div className="flex gap-6 mt-6 text-sm">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-green-500 rounded"></div>
                  Active
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-red-500 rounded"></div>
                  Idle
                </div>
              </div>

            </CardContent>
          </Card>

        </div>
      </div>
    </DashboardLayout>
  );
};

export default TimeLogs;
