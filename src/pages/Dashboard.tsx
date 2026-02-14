import { useEffect, useState } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import { useAuth } from "@/contexts/AuthContext";

const Dashboard = () => {
  const { token, loading } = useAuth();
  const [stats, setStats] = useState<any>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!loading && token) {
      fetchStats();
    }
  }, [token, loading]);

  const fetchStats = async () => {
    try {
      const res = await fetch("http://localhost:5000/api/dashboard/stats", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!res.ok) {
        throw new Error("Failed to load stats");
      }

      const data = await res.json();
      setStats(data);
    } catch (err: any) {
      console.error(err);
      setError("Unable to load dashboard data");
    }
  };

  if (loading) return <div>Loading...</div>;
  if (error) return <div>{error}</div>;

  return (
    <DashboardLayout>
      <h1 className="text-2xl font-bold mb-4">Dashboard</h1>

      <div className="space-y-3">
        <p>Active Now: {stats?.activeNow ?? 0}</p>
        <p>Total Screenshots: {stats?.screenshots ?? 0}</p>
        <p>Hours Today: {stats?.hoursToday ?? 0}</p>
      </div>
    </DashboardLayout>
  );
};

export default Dashboard;
