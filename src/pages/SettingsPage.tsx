import { useState } from "react";
import { motion } from "framer-motion";
import { Settings as SettingsIcon, Building2, Monitor, Bell, Save, Camera, Clock, MousePointer } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { Separator } from "@/components/ui/separator";
import { toast } from "@/hooks/use-toast";
import DashboardLayout from "@/components/DashboardLayout";
import { PageGuard } from "@/components/RoleGuard";

const SettingsPage = () => {
  const [company, setCompany] = useState({ name: "Acme Corp", website: "https://acme.com", industry: "Technology", timezone: "UTC-5" });
  const [monitoring, setMonitoring] = useState({ idleTimeout: 5, screenshotFreq: 12, blurScreenshots: false, trackUrls: true, trackApps: true, autoStart: true });
  const [notifications, setNotifications] = useState({ emailReports: true, idleAlerts: false, newMemberAlert: true, billingAlerts: true, weeklyDigest: true, reportFreq: "daily" });

  const handleSave = () => toast({ title: "Settings saved", description: "Your changes have been applied." });

  return (
    <DashboardLayout>
      <PageGuard permission="manage_settings">
        <div className="space-y-6 max-w-3xl">
          <div>
            <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
              <SettingsIcon size={22} className="text-primary" /> Settings
            </h1>
            <p className="text-sm text-muted-foreground">Company profile, monitoring rules & notifications</p>
          </div>

          {/* Company Profile */}
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="rounded-xl bg-gradient-card border border-border p-6 space-y-4">
            <h2 className="font-semibold text-foreground text-sm flex items-center gap-2"><Building2 size={16} className="text-primary" /> Company Profile</h2>
            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <Label className="text-xs">Company Name</Label>
                <Input className="mt-1.5" value={company.name} onChange={e => setCompany({ ...company, name: e.target.value })} />
              </div>
              <div>
                <Label className="text-xs">Website</Label>
                <Input className="mt-1.5" value={company.website} onChange={e => setCompany({ ...company, website: e.target.value })} />
              </div>
              <div>
                <Label className="text-xs">Industry</Label>
                <Select value={company.industry} onValueChange={v => setCompany({ ...company, industry: v })}>
                  <SelectTrigger className="mt-1.5"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {["Technology", "Finance", "Healthcare", "Education", "Retail", "Other"].map(i => (
                      <SelectItem key={i} value={i}>{i}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label className="text-xs">Timezone</Label>
                <Select value={company.timezone} onValueChange={v => setCompany({ ...company, timezone: v })}>
                  <SelectTrigger className="mt-1.5"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {["UTC-8", "UTC-7", "UTC-6", "UTC-5", "UTC-4", "UTC+0", "UTC+1", "UTC+5:30", "UTC+8"].map(tz => (
                      <SelectItem key={tz} value={tz}>{tz}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </motion.div>

          {/* Monitoring Rules */}
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="rounded-xl bg-gradient-card border border-border p-6 space-y-5">
            <h2 className="font-semibold text-foreground text-sm flex items-center gap-2"><Monitor size={16} className="text-primary" /> Monitoring Rules</h2>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label className="text-sm flex items-center gap-2"><MousePointer size={14} className="text-muted-foreground" /> Idle Timeout</Label>
                <span className="text-sm font-medium text-primary">{monitoring.idleTimeout} min</span>
              </div>
              <Slider
                value={[monitoring.idleTimeout]}
                onValueChange={([v]) => setMonitoring({ ...monitoring, idleTimeout: v })}
                min={1} max={30} step={1}
              />
              <p className="text-[10px] text-muted-foreground">Mark user as idle after this many minutes of inactivity</p>
            </div>

            <Separator />

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label className="text-sm flex items-center gap-2"><Camera size={14} className="text-muted-foreground" /> Screenshot Frequency</Label>
                <span className="text-sm font-medium text-primary">{monitoring.screenshotFreq}/hr</span>
              </div>
              <Slider
                value={[monitoring.screenshotFreq]}
                onValueChange={([v]) => setMonitoring({ ...monitoring, screenshotFreq: v })}
                min={1} max={30} step={1}
              />
              <p className="text-[10px] text-muted-foreground">Number of randomized screenshots captured per hour</p>
            </div>

            <Separator />

            <div className="space-y-3">
              {[
                { key: "blurScreenshots" as const, label: "Blur Screenshots", desc: "Apply blur to all captured screenshots for privacy" },
                { key: "trackUrls" as const, label: "Track Browser URLs", desc: "Monitor active browser tab titles and URLs" },
                { key: "trackApps" as const, label: "Track Applications", desc: "Monitor active window and application usage" },
                { key: "autoStart" as const, label: "Auto-Start on Boot", desc: "Agent starts automatically when OS boots" },
              ].map(item => (
                <div key={item.key} className="flex items-center justify-between">
                  <div>
                    <Label className="text-sm">{item.label}</Label>
                    <p className="text-[10px] text-muted-foreground">{item.desc}</p>
                  </div>
                  <Switch
                    checked={monitoring[item.key]}
                    onCheckedChange={v => setMonitoring({ ...monitoring, [item.key]: v })}
                  />
                </div>
              ))}
            </div>
          </motion.div>

          {/* Notifications */}
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="rounded-xl bg-gradient-card border border-border p-6 space-y-4">
            <h2 className="font-semibold text-foreground text-sm flex items-center gap-2"><Bell size={16} className="text-primary" /> Notification Preferences</h2>

            <div className="space-y-3">
              {[
                { key: "emailReports" as const, label: "Email Reports", desc: "Receive productivity reports via email" },
                { key: "idleAlerts" as const, label: "Idle Alerts", desc: "Get notified when employees exceed idle threshold" },
                { key: "newMemberAlert" as const, label: "New Member Alerts", desc: "Notification when a new member joins via invite" },
                { key: "billingAlerts" as const, label: "Billing Alerts", desc: "Payment reminders and subscription updates" },
                { key: "weeklyDigest" as const, label: "Weekly Digest", desc: "Summary of team productivity every Monday" },
              ].map(item => (
                <div key={item.key} className="flex items-center justify-between">
                  <div>
                    <Label className="text-sm">{item.label}</Label>
                    <p className="text-[10px] text-muted-foreground">{item.desc}</p>
                  </div>
                  <Switch
                    checked={notifications[item.key]}
                    onCheckedChange={v => setNotifications({ ...notifications, [item.key]: v })}
                  />
                </div>
              ))}
            </div>

            <Separator />

            <div>
              <Label className="text-xs">Report Frequency</Label>
              <Select value={notifications.reportFreq} onValueChange={v => setNotifications({ ...notifications, reportFreq: v })}>
                <SelectTrigger className="mt-1.5 w-48"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="daily">Daily</SelectItem>
                  <SelectItem value="weekly">Weekly</SelectItem>
                  <SelectItem value="monthly">Monthly</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </motion.div>

          <div className="flex justify-end">
            <Button onClick={handleSave} className="gap-2"><Save size={14} /> Save Changes</Button>
          </div>
        </div>
      </PageGuard>
    </DashboardLayout>
  );
};

export default SettingsPage;
