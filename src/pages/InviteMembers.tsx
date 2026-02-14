import { useState } from "react";
import { motion } from "framer-motion";
import { UserPlus, Mail, Shield, AlertTriangle, CheckCircle2, Copy, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { toast } from "@/hooks/use-toast";
import DashboardLayout from "@/components/DashboardLayout";
import { PageGuard } from "@/components/RoleGuard";

const planLimits = { name: "Professional", maxUsers: 25, currentUsers: 18 };

const roles = [
  { value: "user", label: "Employee", desc: "Desktop tracking only" },
  { value: "sub_admin", label: "Sub-Admin", desc: "View reports & screenshots" },
  { value: "admin", label: "Admin", desc: "Full company control" },
];

const pendingInvites = [
  { email: "john@acme.com", role: "user", status: "pending", sent: "2026-02-08", token: "inv_a1b2c3" },
  { email: "sarah@acme.com", role: "sub_admin", status: "pending", sent: "2026-02-07", token: "inv_d4e5f6" },
  { email: "mike@acme.com", role: "user", status: "expired", sent: "2026-01-25", token: "inv_g7h8i9" },
];

const InviteMembers = () => {
  const [email, setEmail] = useState("");
  const [role, setRole] = useState("user");
  const [invites, setInvites] = useState(pendingInvites);
  const remaining = planLimits.maxUsers - planLimits.currentUsers;
  const canInvite = remaining > 0;

  const handleInvite = () => {
    if (!email) return;
    if (!canInvite) {
      toast({ title: "User limit reached", description: "Upgrade your plan to add more users.", variant: "destructive" });
      return;
    }
    const token = `inv_${Math.random().toString(36).slice(2, 8)}`;
    setInvites([{ email, role, status: "pending", sent: new Date().toISOString().slice(0, 10), token }, ...invites]);
    setEmail("");
    toast({ title: "Invite sent!", description: `Invitation sent to ${email}` });
  };

  return (
    <DashboardLayout>
      <PageGuard permission="invite_members">
      <div className="space-y-6 max-w-3xl">
        <div>
          <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
            <UserPlus size={22} className="text-primary" /> Invite Team Members
          </h1>
          <p className="text-sm text-muted-foreground">Add employees to your organization</p>
        </div>

        {/* Plan Status */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className={`p-4 rounded-xl border flex items-center gap-4 ${
            canInvite ? "border-border bg-gradient-card" : "border-destructive/30 bg-destructive/5"
          }`}
        >
          <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
            <Users size={20} className="text-primary" />
          </div>
          <div className="flex-1">
            <div className="text-sm font-medium text-foreground">{planLimits.name} Plan</div>
            <div className="text-xs text-muted-foreground">
              {planLimits.currentUsers} / {planLimits.maxUsers} users
            </div>
          </div>
          <div className="text-right">
            <div className={`text-lg font-bold ${canInvite ? "text-primary" : "text-destructive"}`}>{remaining}</div>
            <div className="text-[10px] text-muted-foreground">seats left</div>
          </div>
          {!canInvite && (
            <Button variant="outline" size="sm" className="text-destructive border-destructive/30">
              Upgrade Plan
            </Button>
          )}
        </motion.div>

        {/* Invite Form */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="p-6 rounded-xl bg-gradient-card border border-border space-y-4"
        >
          <h2 className="font-semibold text-foreground text-sm">Send Invitation</h2>
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="flex-1">
              <Label className="text-xs">Email Address</Label>
              <div className="relative mt-1.5">
                <Mail size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                <Input
                  type="email"
                  placeholder="colleague@company.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="pl-9"
                />
              </div>
            </div>
            <div className="w-full sm:w-48">
              <Label className="text-xs">Role</Label>
              <Select value={role} onValueChange={setRole}>
                <SelectTrigger className="mt-1.5">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {roles.map((r) => (
                    <SelectItem key={r.value} value={r.value}>
                      <div>
                        <div className="font-medium">{r.label}</div>
                        <div className="text-[10px] text-muted-foreground">{r.desc}</div>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <Button onClick={handleInvite} disabled={!canInvite || !email} className="gap-2">
            <UserPlus size={14} /> Send Invite
          </Button>
          {!canInvite && (
            <p className="text-xs text-destructive flex items-center gap-1">
              <AlertTriangle size={12} /> User limit reached. Upgrade to invite more members.
            </p>
          )}
        </motion.div>

        {/* Pending Invites */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="rounded-xl bg-gradient-card border border-border"
        >
          <div className="p-4 border-b border-border">
            <h2 className="font-semibold text-foreground text-sm">Pending Invitations ({invites.length})</h2>
          </div>
          <div className="divide-y divide-border">
            {invites.map((inv) => (
              <div key={inv.token} className="flex items-center gap-4 p-4 hover:bg-secondary/20 transition-colors">
                <div className="w-8 h-8 rounded-full bg-secondary flex items-center justify-center text-xs font-medium text-foreground">
                  {inv.email[0].toUpperCase()}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-medium text-foreground truncate">{inv.email}</div>
                  <div className="text-xs text-muted-foreground capitalize">{inv.role.replace("_", "-")} • Sent {inv.sent}</div>
                </div>
                <Badge variant={inv.status === "pending" ? "default" : "destructive"} className="text-[10px]">
                  {inv.status === "pending" ? (
                    <span className="flex items-center gap-1"><CheckCircle2 size={10} /> Pending</span>
                  ) : (
                    <span className="flex items-center gap-1"><AlertTriangle size={10} /> Expired</span>
                  )}
                </Badge>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8"
                  onClick={() => {
                    navigator.clipboard.writeText(`https://webmok.app/invite/${inv.token}`);
                    toast({ title: "Link copied!" });
                  }}
                >
                  <Copy size={14} />
                </Button>
              </div>
            ))}
          </div>
        </motion.div>
      </div>
      </PageGuard>
    </DashboardLayout>
  );
};

export default InviteMembers;
