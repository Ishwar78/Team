import { useState, useEffect, useMemo } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import { useAuth } from "@/contexts/AuthContext";
import { apiFetch } from "@/lib/api";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Calendar as CalendarIcon, Clock, User, ChevronLeft, ChevronRight, Search } from "lucide-react";
import { format, startOfDay, endOfDay, addDays, subDays } from "date-fns";
import { Input } from "@/components/ui/input";

const TimeLogs = () => {
  const { token, user } = useAuth();
  const [users, setUsers] = useState<any[]>([]);
  const [selectedUserId, setSelectedUserId] = useState<string>("");
  const [sessions, setSessions] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [currentDate, setCurrentDate] = useState<Date>(new Date());
  const [searchTerm, setSearchTerm] = useState("");

  // Fetch Users
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const data = await apiFetch("/api/company/users", token);
        setUsers(data.users || []);
      } catch (err) {
        console.error("Failed to fetch users", err);
      }
    };
    if (token) fetchUsers();
  }, [token]);

  // Fetch Sessions when user or date changes
  useEffect(() => {
    if (!selectedUserId) return;

    const fetchSessions = async () => {
      setLoading(true);
      try {
        const start = startOfDay(currentDate).toISOString();
        const end = endOfDay(currentDate).toISOString();
        // Assumes backend now supports filtering by user_id, start_date, end_date
        const data = await apiFetch(`/api/sessions?user_id=${selectedUserId}&start_date=${start}&end_date=${end}`, token);
        setSessions(data.sessions || []);
      } catch (err) {
        console.error("Failed to fetch sessions", err);
      } finally {
        setLoading(false);
      }
    };

    fetchSessions();
  }, [selectedUserId, currentDate, token]);

  const filteredUsers = users.filter(u =>
    u.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    u.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const timelineData = useMemo(() => {
    // Process sessions to create timeline segments
    // This is a simplified logic. Real logic needs to handle overlapping, gaps, etc.
    if (!sessions.length) return [];

    return sessions.map(session => {
      const start = new Date(session.start_time);
      const end = session.end_time ? new Date(session.end_time) : new Date(); // If ongoing, use now

      // Calculate position and width percentage relative to the day (00:00 - 24:00)
      const dayStart = startOfDay(currentDate).getTime();
      const dayEnd = endOfDay(currentDate).getTime();
      const dayDuration = dayEnd - dayStart;

      const sessionStart = Math.max(start.getTime(), dayStart);
      const sessionEnd = Math.min(end.getTime(), dayEnd);

      const left = ((sessionStart - dayStart) / dayDuration) * 100;
      const width = ((sessionEnd - sessionStart) / dayDuration) * 100;

      return {
        id: session._id,
        left: `${left}%`,
        width: `${width}%`,
        type: 'active', // can be 'idle' if we have that data
        startStr: format(start, "HH:mm"),
        endStr: format(end, "HH:mm"),
        duration: ((sessionEnd - sessionStart) / (1000 * 60 * 60)).toFixed(2) // hours
      };
    });
  }, [sessions, currentDate]);

  const totalWorkHours = useMemo(() => {
    const ms = sessions.reduce((acc, session) => {
      const start = new Date(session.start_time).getTime();
      const end = session.end_time ? new Date(session.end_time).getTime() : new Date().getTime();
      return acc + (end - start);
    }, 0);
    const hours = Math.floor(ms / (1000 * 60 * 60));
    const minutes = Math.floor((ms % (1000 * 60 * 60)) / (1000 * 60));
    return `${hours}h ${minutes}m`;
  }, [sessions]);

  return (
    <DashboardLayout>
      <div className="flex h-[calc(100vh-100px)] gap-6">
        {/* Left Sidebar: Team List */}
        <Card className="w-80 flex flex-col h-full border-border">
          <CardHeader className="p-4 border-b">
            <CardTitle className="text-lg">Team Members</CardTitle>
            <div className="relative mt-2">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search..."
                className="pl-8"
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
              />
            </div>
          </CardHeader>
          <CardContent className="flex-1 overflow-y-auto p-2 space-y-2">
            {filteredUsers.map(u => (
              <div
                key={u._id}
                onClick={() => setSelectedUserId(u._id)}
                className={`flex items-center gap-3 p-3 rounded-lg cursor-pointer transition-colors ${selectedUserId === u._id ? 'bg-primary/10 border border-primary/20' : 'hover:bg-secondary/50'}`}
              >
                <Avatar className="h-9 w-9">
                  <AvatarFallback className="bg-primary/20 text-primary">{u.name.charAt(0)}</AvatarFallback>
                </Avatar>
                <div className="overflow-hidden">
                  <p className="font-medium truncate">{u.name}</p>
                  <p className="text-xs text-muted-foreground truncate">{u.email}</p>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Main Content: Timeline */}
        <div className="flex-1 flex flex-col space-y-6">
          {/* Header Controls */}
          <div className="flex items-center justify-between bg-card p-4 rounded-lg border">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2 bg-secondary/30 p-1 rounded-lg">
                <Button variant="ghost" size="icon" onClick={() => setCurrentDate(subDays(currentDate, 1))}>
                  <ChevronLeft size={18} />
                </Button>
                <div className="flex items-center gap-2 min-w-[150px] justify-center font-medium">
                  <CalendarIcon size={16} className="text-primary" />
                  {format(currentDate, "EEE, dd MMM yyyy")}
                </div>
                <Button variant="ghost" size="icon" onClick={() => setCurrentDate(addDays(currentDate, 1))}>
                  <ChevronRight size={18} />
                </Button>
              </div>

              <div className="h-8 w-px bg-border mx-2"></div>

              <div className="flex items-center gap-2">
                <Clock className="text-muted-foreground" size={18} />
                <span className="text-sm font-medium text-muted-foreground">Total Work:</span>
                <span className="text-lg font-bold text-green-500">{totalWorkHours}</span>
              </div>
            </div>
          </div>

          {/* Timeline Visualization */}
          <Card className="flex-1 border-border">
            <CardHeader>
              <CardTitle>Activity Timeline</CardTitle>
            </CardHeader>
            <CardContent className="h-full">
              {!selectedUserId ? (
                <div className="flex flex-col items-center justify-center h-64 text-muted-foreground">
                  <User size={48} className="mb-4 opacity-20" />
                  <p>Select a team member to view their timeline</p>
                </div>
              ) : loading ? (
                <div className="flex items-center justify-center h-64">Loading...</div>
              ) : (
                <div className="space-y-8 mt-4">
                  {/* Timeline Ruler */}
                  <div className="relative h-12 w-full border-b border-border/50">
                    {Array.from({ length: 25 }).map((_, i) => {
                      const hour = i;
                      const displayHour = hour === 0 || hour === 24 ? "12 AM" : hour === 12 ? "12 PM" : hour > 12 ? `${hour - 12} PM` : `${hour} AM`;

                      return (
                        <div
                          key={hour}
                          className="absolute bottom-0 transform -translate-x-1/2 flex flex-col items-center"
                          style={{ left: `${(hour / 24) * 100}%` }}
                        >
                          <div className="h-2 w-px bg-border"></div>
                          <span className="text-[10px] text-muted-foreground mt-1 whitespace-nowrap">{displayHour}</span>
                        </div>
                      );
                    })}
                  </div>

                  {/* Activity Bar */}
                  <div className="relative h-16 w-full bg-secondary/20 rounded-lg overflow-hidden border border-border/50">
                    {timelineData.map((item, idx) => (
                      <div
                        key={item.id}
                        className="absolute top-2 bottom-2 bg-green-500/80 rounded-sm hover:bg-green-400 cursor-help transition-colors group"
                        style={{ left: item.left, width: item.width }}
                      >
                        {/* Tooltip */}
                        <div className="hidden group-hover:block absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2 py-1 bg-popover text-popover-foreground text-xs rounded shadow border whitespace-nowrap z-10">
                          {item.startStr} - {item.endStr} ({item.duration}h)
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Legend */}
                  <div className="flex gap-4 text-sm">
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 bg-green-500 rounded-sm"></div>
                      <span>Active Working Time</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 bg-secondary/20 border border-border/50 rounded-sm"></div>
                      <span>Idle / No Activity</span>
                    </div>
                  </div>

                  {/* Session List Details */}
                  <div className="mt-8">
                    <h3 className="font-semibold mb-4">Detailed Session Log</h3>
                    <div className="space-y-2">
                      {sessions.map(s => (
                        <div key={s._id} className="flex justify-between items-center p-3 rounded border border-border bg-card/50">
                          <div className="flex items-center gap-3">
                            <div className={`w-2 h-2 rounded-full ${s.status === 'active' ? 'bg-green-500 animate-pulse' : 'bg-gray-400'}`}></div>
                            <span className="font-mono text-sm">{format(new Date(s.start_time), "HH:mm:ss")}</span>
                            <span className="text-muted-foreground">→</span>
                            <span className="font-mono text-sm">{s.end_time ? format(new Date(s.end_time), "HH:mm:ss") : "Now"}</span>
                          </div>
                          <div className="text-sm text-muted-foreground capitalize">
                            {s.status}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default TimeLogs;
