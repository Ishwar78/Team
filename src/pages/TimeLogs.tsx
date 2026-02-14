import { useEffect, useState } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import { useAuth } from "@/contexts/AuthContext";
import { apiFetch } from "@/lib/api";

const TimeLogs = () => {
  const { token } = useAuth();
  const [sessions, setSessions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (token) fetchSessions();
  }, [token]);

  const fetchSessions = async () => {
    try {
      const data = await apiFetch("/api/sessions", token);
      setSessions(data.sessions || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div>Loading time logs...</div>;

  return (
    <DashboardLayout>
      <h1 className="text-xl font-bold mb-6">Time Logs</h1>

      {sessions.map((session) => (
        <div
          key={session._id}
          className="p-4 border rounded mb-4 bg-card"
        >
          <div>
            Start:{" "}
            {new Date(session.start_time).toLocaleString()}
          </div>

          {session.end_time && (
            <div>
              End:{" "}
              {new Date(session.end_time).toLocaleString()}
            </div>
          )}

          <div>Status: {session.status}</div>
          <div>
            Total Duration:{" "}
            {(session.summary.total_duration / 3600).toFixed(2)} hrs
          </div>
        </div>
      ))}
    </DashboardLayout>
  );
};

export default TimeLogs;
