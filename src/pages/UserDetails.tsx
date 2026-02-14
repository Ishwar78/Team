import { useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import { useAuth } from "@/contexts/AuthContext";
import { apiFetch } from "@/lib/api";

const UserDetails = () => {
  const { id } = useParams();
  const { token } = useAuth();
  const [sessions, setSessions] = useState<any[]>([]);
  const [screenshots, setScreenshots] = useState<any[]>([]);

  useEffect(() => {
    if (token && id) {
      fetchData();
    }
  }, [token, id]);

  const fetchData = async () => {
    const sessionRes = await apiFetch(
      `/api/sessions/user/${id}`,
      token
    );

    const shotRes = await apiFetch(
      `/api/agent/screenshots/${id}`,
      token
    );

    setSessions(sessionRes.sessions || []);
    setScreenshots(shotRes.screenshots || []);
  };

  return (
    <DashboardLayout>
      <h1 className="text-xl font-bold mb-4">User Details</h1>

      <h2 className="font-semibold mt-4">Sessions</h2>
      {sessions.map((s) => (
        <div key={s._id}>
          {new Date(s.start_time).toLocaleString()}
        </div>
      ))}

      <h2 className="font-semibold mt-6">Screenshots</h2>
      <div className="grid grid-cols-3 gap-4">
        {screenshots.map((s) => (
         <img
  key={s._id}
  src={`http://localhost:5000/uploads/${s.file_path}`}
  width={300}
/>

        ))}
      </div>
    </DashboardLayout>
  );
};

export default UserDetails;
