import { useState, useMemo } from "react";
import { motion } from "framer-motion";
import { Globe, Monitor, Calendar, User, ExternalLink } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import DashboardLayout from "@/components/DashboardLayout";
import { PageGuard } from "@/components/RoleGuard";

const employees = [
  { id: "all", name: "All Users" },
  { id: "alice", name: "Alice Johnson" },
  { id: "bob", name: "Bob Smith" },
  { id: "carol", name: "Carol White" },
  { id: "david", name: "David Lee" },
  { id: "eva", name: "Eva Brown" },
];

type AppEntry = { name: string; hours: number; users: number; category: string };
type UrlEntry = { url: string; hours: number; visits: number; category: string };

const perEmployeeApps: Record<string, AppEntry[]> = {
  alice: [
    { name: "VS Code", hours: 6.2, users: 1, category: "Development" },
    { name: "Chrome", hours: 4.1, users: 1, category: "Browser" },
    { name: "Terminal", hours: 3.8, users: 1, category: "Development" },
    { name: "Slack", hours: 2.5, users: 1, category: "Communication" },
    { name: "Notion", hours: 1.4, users: 1, category: "Productivity" },
    { name: "Zoom", hours: 0.8, users: 1, category: "Communication" },
  ],
  bob: [
    { name: "Figma", hours: 7.1, users: 1, category: "Design" },
    { name: "Chrome", hours: 5.3, users: 1, category: "Browser" },
    { name: "Slack", hours: 3.2, users: 1, category: "Communication" },
    { name: "Notion", hours: 2.6, users: 1, category: "Productivity" },
    { name: "Zoom", hours: 2.1, users: 1, category: "Communication" },
    { name: "Jira", hours: 1.5, users: 1, category: "Project Mgmt" },
  ],
  carol: [
    { name: "VS Code", hours: 5.8, users: 1, category: "Development" },
    { name: "Chrome", hours: 4.7, users: 1, category: "Browser" },
    { name: "Jira", hours: 3.2, users: 1, category: "Project Mgmt" },
    { name: "Slack", hours: 2.9, users: 1, category: "Communication" },
    { name: "Terminal", hours: 2.4, users: 1, category: "Development" },
    { name: "Zoom", hours: 1.3, users: 1, category: "Communication" },
  ],
  david: [
    { name: "Chrome", hours: 6.5, users: 1, category: "Browser" },
    { name: "Slack", hours: 4.8, users: 1, category: "Communication" },
    { name: "Notion", hours: 3.9, users: 1, category: "Productivity" },
    { name: "Zoom", hours: 2.7, users: 1, category: "Communication" },
    { name: "VS Code", hours: 1.9, users: 1, category: "Development" },
    { name: "Figma", hours: 1.2, users: 1, category: "Design" },
  ],
  eva: [
    { name: "Figma", hours: 6.4, users: 1, category: "Design" },
    { name: "Chrome", hours: 5.1, users: 1, category: "Browser" },
    { name: "Slack", hours: 3.7, users: 1, category: "Communication" },
    { name: "VS Code", hours: 2.3, users: 1, category: "Development" },
    { name: "Notion", hours: 1.8, users: 1, category: "Productivity" },
    { name: "Jira", hours: 1.1, users: 1, category: "Project Mgmt" },
  ],
};

const perEmployeeUrls: Record<string, UrlEntry[]> = {
  alice: [
    { url: "github.com", hours: 4.5, visits: 112, category: "Development" },
    { url: "stackoverflow.com", hours: 2.8, visits: 64, category: "Development" },
    { url: "docs.google.com", hours: 1.5, visits: 22, category: "Productivity" },
    { url: "slack.com", hours: 1.2, visits: 48, category: "Communication" },
    { url: "notion.so", hours: 0.9, visits: 18, category: "Productivity" },
    { url: "youtube.com", hours: 0.4, visits: 8, category: "Entertainment" },
  ],
  bob: [
    { url: "figma.com", hours: 3.8, visits: 42, category: "Design" },
    { url: "dribbble.com", hours: 2.1, visits: 34, category: "Design" },
    { url: "slack.com", hours: 1.8, visits: 56, category: "Communication" },
    { url: "docs.google.com", hours: 1.4, visits: 19, category: "Productivity" },
    { url: "notion.so", hours: 1.1, visits: 22, category: "Productivity" },
    { url: "youtube.com", hours: 0.9, visits: 14, category: "Entertainment" },
  ],
  carol: [
    { url: "github.com", hours: 3.9, visits: 87, category: "Development" },
    { url: "stackoverflow.com", hours: 2.4, visits: 52, category: "Development" },
    { url: "jira.atlassian.com", hours: 1.9, visits: 38, category: "Project Mgmt" },
    { url: "slack.com", hours: 1.3, visits: 44, category: "Communication" },
    { url: "docs.google.com", hours: 0.8, visits: 12, category: "Productivity" },
    { url: "reddit.com", hours: 0.5, visits: 16, category: "Social" },
  ],
  david: [
    { url: "docs.google.com", hours: 3.2, visits: 41, category: "Productivity" },
    { url: "notion.so", hours: 2.6, visits: 35, category: "Productivity" },
    { url: "slack.com", hours: 2.1, visits: 62, category: "Communication" },
    { url: "youtube.com", hours: 1.4, visits: 22, category: "Entertainment" },
    { url: "github.com", hours: 1.1, visits: 28, category: "Development" },
    { url: "reddit.com", hours: 0.8, visits: 26, category: "Social" },
  ],
  eva: [
    { url: "figma.com", hours: 3.4, visits: 38, category: "Design" },
    { url: "github.com", hours: 2.7, visits: 54, category: "Development" },
    { url: "slack.com", hours: 1.9, visits: 50, category: "Communication" },
    { url: "stackoverflow.com", hours: 1.5, visits: 32, category: "Development" },
    { url: "notion.so", hours: 1.0, visits: 15, category: "Productivity" },
    { url: "youtube.com", hours: 0.6, visits: 10, category: "Entertainment" },
  ],
};

const periodMultiplier: Record<string, number> = { today: 1, week: 5.2, month: 22 };

const categoryColors: Record<string, string> = {
  Development: "bg-primary/20 text-primary",
  Browser: "bg-blue-500/20 text-blue-400",
  Design: "bg-violet-500/20 text-violet-400",
  Communication: "bg-emerald-500/20 text-emerald-400",
  Productivity: "bg-amber-500/20 text-amber-400",
  "Project Mgmt": "bg-rose-500/20 text-rose-400",
  Entertainment: "bg-red-500/20 text-red-400",
  Social: "bg-orange-500/20 text-orange-400",
};

const AppUsage = () => {
  const [selectedUser, setSelectedUser] = useState("all");
  const [period, setPeriod] = useState("today");

  const { apps, urls } = useMemo(() => {
    const mult = periodMultiplier[period] || 1;

    if (selectedUser === "all") {
      // Aggregate all employees
      const appMap: Record<string, AppEntry> = {};
      const urlMap: Record<string, UrlEntry> = {};
      Object.values(perEmployeeApps).forEach(list =>
        list.forEach(a => {
          if (appMap[a.name]) {
            appMap[a.name].hours += a.hours;
            appMap[a.name].users += 1;
          } else {
            appMap[a.name] = { ...a, users: 1 };
          }
        })
      );
      Object.values(perEmployeeUrls).forEach(list =>
        list.forEach(u => {
          if (urlMap[u.url]) {
            urlMap[u.url].hours += u.hours;
            urlMap[u.url].visits += u.visits;
          } else {
            urlMap[u.url] = { ...u };
          }
        })
      );
      return {
        apps: Object.values(appMap)
          .map(a => ({ ...a, hours: +(a.hours * mult).toFixed(1) }))
          .sort((a, b) => b.hours - a.hours),
        urls: Object.values(urlMap)
          .map(u => ({ ...u, hours: +(u.hours * mult).toFixed(1), visits: Math.round(u.visits * mult) }))
          .sort((a, b) => b.hours - a.hours),
      };
    }

    const empApps = perEmployeeApps[selectedUser] || [];
    const empUrls = perEmployeeUrls[selectedUser] || [];
    return {
      apps: empApps.map(a => ({ ...a, hours: +(a.hours * mult).toFixed(1) })),
      urls: empUrls.map(u => ({ ...u, hours: +(u.hours * mult).toFixed(1), visits: Math.round(u.visits * mult) })),
    };
  }, [selectedUser, period]);

  const maxAppHours = Math.max(...apps.map(a => a.hours), 1);
  const maxUrlHours = Math.max(...urls.map(u => u.hours), 1);

  const periodLabel = period === "today" ? "Today" : period === "week" ? "This Week" : "This Month";
  const userName = employees.find(e => e.id === selectedUser)?.name || "All Users";

  return (
    <DashboardLayout>
      <PageGuard permission="view_app_usage">
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
            <Globe size={22} className="text-primary" /> App & URL Usage
          </h1>
          <p className="text-sm text-muted-foreground">Track application and website usage across your team</p>
        </div>

        {/* Filters */}
        <div className="flex flex-wrap items-center gap-3 p-4 rounded-xl bg-gradient-card border border-border">
          <div className="flex items-center gap-2">
            <User size={14} className="text-muted-foreground" />
            <Select value={selectedUser} onValueChange={setSelectedUser}>
              <SelectTrigger className="w-[180px] h-9"><SelectValue /></SelectTrigger>
              <SelectContent>
                {employees.map(e => <SelectItem key={e.id} value={e.id}>{e.name}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
          <div className="flex items-center gap-2">
            <Calendar size={14} className="text-muted-foreground" />
            <Select value={period} onValueChange={setPeriod}>
              <SelectTrigger className="w-[140px] h-9"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="today">Today</SelectItem>
                <SelectItem value="week">This Week</SelectItem>
                <SelectItem value="month">This Month</SelectItem>
              </SelectContent>
            </Select>
          </div>
          {selectedUser !== "all" && (
            <span className="ml-auto text-xs text-muted-foreground">
              Showing data for <span className="text-primary font-medium">{userName}</span> · {periodLabel}
            </span>
          )}
        </div>

        <div className="grid lg:grid-cols-2 gap-6">
          {/* Top Applications */}
          <motion.div
            key={`apps-${selectedUser}-${period}`}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="rounded-xl bg-gradient-card border border-border"
          >
            <div className="p-4 border-b border-border flex items-center gap-2">
              <Monitor size={16} className="text-primary" />
              <h2 className="font-semibold text-foreground text-sm">Top Applications</h2>
            </div>
            <div className="p-4 space-y-3">
              {apps.map((app, i) => (
                <motion.div
                  key={app.name}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.04 }}
                  className="space-y-1.5"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium text-foreground">{app.name}</span>
                      <span className={`text-[10px] px-1.5 py-0.5 rounded-full ${categoryColors[app.category] || "bg-muted text-muted-foreground"}`}>
                        {app.category}
                      </span>
                    </div>
                    <div className="text-right">
                      <span className="text-sm font-semibold text-foreground">{app.hours}h</span>
                      <span className="text-[10px] text-muted-foreground ml-2">
                        {selectedUser === "all" ? `${app.users} users` : ""}
                      </span>
                    </div>
                  </div>
                  <div className="h-2 bg-card rounded-full overflow-hidden border border-border">
                    <motion.div
                      className="h-full rounded-full bg-primary/60"
                      initial={{ width: 0 }}
                      animate={{ width: `${(app.hours / maxAppHours) * 100}%` }}
                      transition={{ delay: i * 0.04 + 0.2, duration: 0.5 }}
                    />
                  </div>
                </motion.div>
              ))}
              {apps.length === 0 && (
                <p className="text-sm text-muted-foreground text-center py-4">No data available</p>
              )}
            </div>
          </motion.div>

          {/* Top Websites */}
          <motion.div
            key={`urls-${selectedUser}-${period}`}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="rounded-xl bg-gradient-card border border-border"
          >
            <div className="p-4 border-b border-border flex items-center gap-2">
              <Globe size={16} className="text-primary" />
              <h2 className="font-semibold text-foreground text-sm">Top Websites</h2>
            </div>
            <div className="p-4 space-y-3">
              {urls.map((site, i) => (
                <motion.div
                  key={site.url}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.04 }}
                  className="space-y-1.5"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium text-foreground flex items-center gap-1">
                        {site.url} <ExternalLink size={10} className="text-muted-foreground" />
                      </span>
                      <span className={`text-[10px] px-1.5 py-0.5 rounded-full ${categoryColors[site.category] || "bg-muted text-muted-foreground"}`}>
                        {site.category}
                      </span>
                    </div>
                    <div className="text-right">
                      <span className="text-sm font-semibold text-foreground">{site.hours}h</span>
                      <span className="text-[10px] text-muted-foreground ml-2">{site.visits} visits</span>
                    </div>
                  </div>
                  <div className="h-2 bg-card rounded-full overflow-hidden border border-border">
                    <motion.div
                      className="h-full rounded-full bg-accent/60"
                      initial={{ width: 0 }}
                      animate={{ width: `${(site.hours / maxUrlHours) * 100}%` }}
                      transition={{ delay: i * 0.04 + 0.2, duration: 0.5 }}
                    />
                  </div>
                </motion.div>
              ))}
              {urls.length === 0 && (
                <p className="text-sm text-muted-foreground text-center py-4">No data available</p>
              )}
            </div>
          </motion.div>
        </div>

        {/* Category Breakdown */}
        <motion.div
          key={`cats-${selectedUser}-${period}`}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="rounded-xl bg-gradient-card border border-border p-6"
        >
          <h2 className="font-semibold text-foreground text-sm mb-4">Time by Category</h2>
          <div className="flex flex-wrap gap-3">
            {Object.entries(
              [...apps, ...urls].reduce<Record<string, number>>((acc, item) => {
                acc[item.category] = (acc[item.category] || 0) + item.hours;
                return acc;
              }, {})
            )
              .sort(([, a], [, b]) => b - a)
              .map(([cat, hours]) => (
                <div
                  key={cat}
                  className="flex items-center gap-2 px-3 py-2 rounded-lg border border-border bg-card"
                >
                  <span className={`w-2.5 h-2.5 rounded-sm ${categoryColors[cat]?.split(" ")[0] || "bg-muted"}`} />
                  <span className="text-sm text-foreground">{cat}</span>
                  <span className="text-xs text-muted-foreground font-mono">{hours.toFixed(1)}h</span>
                </div>
              ))}
          </div>
        </motion.div>
      </div>
      </PageGuard>
    </DashboardLayout>
  );
};

export default AppUsage;
