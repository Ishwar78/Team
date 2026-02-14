import { useEffect, useState } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import { useAuth } from "@/contexts/AuthContext";
import { apiFetch } from "@/lib/api";

const TeamManagement = () => {
  const { token } = useAuth();
  const [members, setMembers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (token) fetchMembers();
  }, [token]);

  const fetchMembers = async () => {
    try {
      const data = await apiFetch("/api/company/users", token);
      setMembers(data.users || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div>Loading team...</div>;

  return (
    <DashboardLayout>
      <h1 className="text-xl font-bold mb-6">Team Members</h1>

      {members.map((member) => (
        <div
          key={member._id}
          className="p-4 border rounded mb-4 bg-card"
        >
          <div>Name: {member.name}</div>
          <div>Email: {member.email}</div>
          <div>Role: {member.role}</div>
          <div>Status: {member.status}</div>
        </div>
      ))}
    </DashboardLayout>
  );
};

export default TeamManagement;
