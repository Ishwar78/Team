import { useEffect, useState } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import { useAuth } from "@/contexts/AuthContext";
import { apiFetch } from "@/lib/api";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Camera, Download, Users, Calendar } from "lucide-react";
import { usePermissions } from "@/hooks/usePermissions";
import { format } from "date-fns";

const Screenshots = () => {
  const { token, user } = useAuth();
  const { can, role } = usePermissions();
  const isAdmin = can("manage_team") || role === "company_admin" || role === "sub_admin";

  const [screenshots, setScreenshots] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedUser, setSelectedUser] = useState<string>("");
  const [teamMembers, setTeamMembers] = useState<any[]>([]);

  useEffect(() => {
    if (token && user?.id) {
      setSelectedUser(user.id);
      if (isAdmin) {
        fetchTeamMembers();
      } else {
        fetchScreenshots(user.id);
      }
    }
  }, [token, user]);

  useEffect(() => {
    if (selectedUser) {
      fetchScreenshots(selectedUser);
    }
  }, [selectedUser]);

  const fetchTeamMembers = async () => {
    try {
      const data = await apiFetch("/api/company/users", token);
      setTeamMembers(data.users || []);
      if (data.users?.length > 0) {
        setSelectedUser(data.users[0]._id);
      }
    } catch (err) {
      console.error("Failed to fetch team members", err);
    }
  };

  const fetchScreenshots = async (userId: string) => {
    setLoading(true);
    try {
      const data = await apiFetch(`/api/agent/screenshots/${userId}`, token);
      setScreenshots(data.screenshots || []);
    } catch (err) {
      console.error(err);
      setScreenshots([]);
    } finally {
      setLoading(false);
    }
  };

  const selectedEmployee = teamMembers.find(m => m._id === selectedUser);

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
              <Camera className="text-primary" size={28} />
              Screenshots
            </h1>
            <p className="text-sm text-muted-foreground mt-1">
              View employee activity screenshots
            </p>
          </div>

          {/* Employee Selector (Admin Only) */}
          {isAdmin && teamMembers.length > 0 && (
            <Select value={selectedUser} onValueChange={setSelectedUser}>
              <SelectTrigger className="w-64 bg-card border-border">
                <Users size={14} className="mr-2 text-muted-foreground" />
                <SelectValue placeholder="Select Employee" />
              </SelectTrigger>
              <SelectContent>
                {teamMembers.map((member) => (
                  <SelectItem key={member._id} value={member._id}>
                    {member.name} ({member.email})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
        </div>

        {/* Stats Card */}
        {selectedEmployee && (
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="p-3 rounded-lg bg-primary/10">
                    <Camera className="text-primary" size={20} />
                  </div>
                  <div>
                    <p className="font-semibold text-foreground">{selectedEmployee.name}</p>
                    <p className="text-sm text-muted-foreground">{selectedEmployee.email}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-2xl font-bold text-foreground">{screenshots.length}</p>
                  <p className="text-xs text-muted-foreground">Total Screenshots</p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Screenshots Grid */}
        {loading ? (
          <div className="flex h-64 items-center justify-center text-muted-foreground">
            Loading screenshots...
          </div>
        ) : screenshots.length === 0 ? (
          <Card>
            <CardContent className="p-12 text-center">
              <Camera className="mx-auto text-muted-foreground mb-4" size={48} />
              <p className="text-muted-foreground">No screenshots available</p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {screenshots.map((shot) => (
              <Card key={shot._id} className="overflow-hidden">
                <CardHeader className="p-3 pb-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <Calendar size={12} />
                      {shot.timestamp ? format(new Date(shot.timestamp), "MMM dd, yyyy HH:mm") : "Unknown"}
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        const link = document.createElement("a");
                        link.href = `http://localhost:5000/api/agent/screenshots/download/${shot._id}`;
                        link.download = `screenshot-${shot._id}.png`;
                        link.click();
                      }}
                    >
                      <Download size={14} />
                    </Button>
                  </div>
                </CardHeader>
                <CardContent className="p-0">
                  <img
                    src={`http://localhost:5000/api/agent/screenshots/download/${shot._id}`}
                    className="w-full h-48 object-cover cursor-pointer hover:opacity-90 transition-opacity"
                    alt="Screenshot"
                    onClick={() => {
                      window.open(
                        `http://localhost:5000/api/agent/screenshots/download/${shot._id}`,
                        "_blank"
                      );
                    }}
                  />
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};

export default Screenshots;
