import { useEffect, useState } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import { useAuth } from "@/contexts/AuthContext";
import { apiFetch } from "@/lib/api";

const Screenshots = () => {
  const { token, user } = useAuth();
  const [screenshots, setScreenshots] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (token && user?._id) {
      fetchScreenshots();
    }
  }, [token, user]);

  const fetchScreenshots = async () => {
    try {
      const data = await apiFetch(
        `/api/agent/screenshots/${user._id}`,
        token
      );

      setScreenshots(data.screenshots || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div>Loading screenshots...</div>;

  return (
    <DashboardLayout>
      <h1 className="text-xl font-bold mb-4">Screenshots</h1>

      <div className="grid grid-cols-3 gap-4">
        {screenshots.map((shot) => (
          <img
            key={shot._id}
            src={`http://localhost:5000/api/agent/screenshots/download/${shot._id}`}
            className="rounded border"
          />
        ))}
      </div>
    </DashboardLayout>
  );
};

export default Screenshots;
