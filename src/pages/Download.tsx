import { useMemo } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Monitor, Apple, Terminal, Download, Shield, Clock, Camera,
  Eye, RefreshCw, Lock, Wifi, WifiOff, MousePointer, AppWindow,
  Globe, HardDrive, ChevronDown, Cpu, MemoryStick, HardDriveDownload, Play
} from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

const fadeUp = {
  hidden: { opacity: 0, y: 30 } as const,
  visible: (i: number) => ({
    opacity: 1, y: 0,
    transition: { delay: i * 0.1, duration: 0.5 },
  }),
};

const DOWNLOAD_BASE = "https://releases.webmok.com/agent";

const platforms = [
  {
    name: "Windows",
    icon: Monitor,
    version: "v2.1.0",
    size: "45 MB",
    ext: ".exe",
    file: "webmok-agent-setup.exe",
    downloadUrl: `${DOWNLOAD_BASE}/v2.1.0/webmok-agent-setup.exe`,
    minOs: "Windows 10 (64-bit) or later",
    steps: [
      "Direct HTTPS download starts automatically",
      "Installer requests system permission",
      "Installs silently in background",
      "Adds agent to system startup",
      "Creates system tray icon",
      "Agent runs in background immediately",
    ],
  },
  {
    name: "macOS",
    icon: Apple,
    version: "v2.1.0",
    size: "52 MB",
    ext: ".dmg",
    file: "webmok-agent.dmg",
    downloadUrl: `${DOWNLOAD_BASE}/v2.1.0/webmok-agent.dmg`,
    minOs: "macOS 12 Monterey or later",
    steps: [
      "Open the downloaded DMG file",
      "Drag WEBMOK Agent to Applications folder",
      "Launch the app from Applications",
      "Grant Screen Recording permission when prompted",
      "Grant Accessibility permission when prompted",
      "Agent starts background service automatically",
    ],
  },
  {
    name: "Linux",
    icon: Terminal,
    version: "v2.1.0",
    size: "48 MB",
    ext: ".AppImage",
    file: "webmok-agent.AppImage",
    downloadUrl: `${DOWNLOAD_BASE}/v2.1.0/webmok-agent.AppImage`,
    minOs: "Ubuntu 20.04+ / Fedora 36+ / Debian 11+",
    steps: [
      "Download the AppImage file",
      "Make it executable: chmod +x webmok-agent.AppImage",
      "Run directly: ./webmok-agent.AppImage",
      "Auto-start setup configures on first run",
      "Agent runs in background with tray icon",
      "No installation required — portable executable",
    ],
  },
];

const systemRequirements = [
  { icon: Cpu, label: "Processor", value: "Dual-core 1.5 GHz or faster (x64 / ARM64)" },
  { icon: MemoryStick, label: "RAM", value: "2 GB minimum (4 GB recommended)" },
  { icon: HardDriveDownload, label: "Disk Space", value: "200 MB free space" },
  { icon: Globe, label: "Network", value: "Broadband internet (1 Mbps+)" },
  { icon: Monitor, label: "Display", value: "1024×768 minimum resolution" },
];

const trackingFeatures = [
  { icon: Clock, label: "Automatic Time Tracking", desc: "Active & idle time logged continuously" },
  { icon: MousePointer, label: "Idle Detection", desc: "Keyboard & mouse inactivity monitored" },
  { icon: Camera, label: "Screenshot Capture", desc: "12 randomized screenshots per hour" },
  { icon: AppWindow, label: "App Tracking", desc: "Active application names captured" },
  { icon: Globe, label: "URL Tracking", desc: "Browser tab titles & URLs recorded" },
  { icon: HardDrive, label: "Offline Queueing", desc: "Data cached locally, synced when online" },
];

const detectOS = (): string => {
  const ua = navigator.userAgent.toLowerCase();
  if (ua.includes("win")) return "Windows";
  if (ua.includes("mac")) return "macOS";
  if (ua.includes("linux")) return "Linux";
  return "";
};

const DownloadPage = () => {
  const detectedOS = useMemo(() => detectOS(), []);

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      {/* Hero */}
      <section className="pt-32 pb-16">
        <div className="container mx-auto px-4">
          <motion.div initial="hidden" animate="visible" className="text-center mb-14">
            <motion.h1 variants={fadeUp} custom={0} className="text-4xl md:text-5xl font-bold mb-4">
              Download <span className="text-gradient">WEBMOK Agent</span>
            </motion.h1>
            <motion.p variants={fadeUp} custom={1} className="text-muted-foreground max-w-xl mx-auto">
              One universal installer for all companies. Your login credentials automatically configure company-specific rules and plan settings.
            </motion.p>
            {detectedOS && (
              <motion.p variants={fadeUp} custom={1.5} className="text-sm text-primary font-medium mt-2">
                We detected you're using <strong>{detectedOS}</strong> — your recommended download is highlighted below.
              </motion.p>
            )}
            <motion.div variants={fadeUp} custom={2} className="flex flex-wrap justify-center gap-2 mt-4">
              <Badge variant="outline" className="gap-1"><Shield size={12} /> OS-Level APIs Only</Badge>
              <Badge variant="outline" className="gap-1"><Lock size={12} /> Encrypted Token Storage</Badge>
              <Badge variant="outline" className="gap-1"><RefreshCw size={12} /> Auto-Update</Badge>
            </motion.div>
          </motion.div>

          {/* OS Cards */}
          <motion.div initial="hidden" animate="visible" className="grid md:grid-cols-3 gap-6 max-w-4xl mx-auto">
            {platforms.map((p, i) => {
              const isDetected = p.name === detectedOS;
              return (
              <motion.div
                key={p.name}
                variants={fadeUp}
                custom={i}
                className={`rounded-xl bg-gradient-card border p-6 transition-all duration-300 ${
                  isDetected
                    ? "border-primary ring-2 ring-primary/20 shadow-glow scale-[1.02]"
                    : "border-border hover:border-primary/30 hover:shadow-glow"
                }`}
              >
                <div className="text-center mb-4">
                  <div className="w-14 h-14 rounded-xl bg-primary/10 flex items-center justify-center mx-auto mb-3">
                    <p.icon size={28} className="text-primary" />
                  </div>
                  <h3 className="text-xl font-bold text-foreground">{p.name}</h3>
                  <p className="text-sm text-muted-foreground">{p.version} • {p.size}</p>
                  <p className="text-xs text-muted-foreground font-mono">{p.file}</p>
                </div>

                <Button className="w-full gap-2 mb-4" asChild>
                  <a href={p.downloadUrl} download={p.file}>
                    <Download size={16} /> Download {p.ext}
                  </a>
                </Button>

                <div className="border-t border-border pt-3">
                  <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">Installation Steps</p>
                  <ol className="space-y-1.5">
                    {p.steps.map((step, si) => (
                      <li key={si} className="flex gap-2 text-xs text-muted-foreground">
                        <span className="text-primary font-bold shrink-0">{si + 1}.</span>
                        <span>{step}</span>
                      </li>
                    ))}
                  </ol>
                </div>
              </motion.div>
              );
            })}
          </motion.div>
        </div>
      </section>

      {/* First-Time Login Flow */}
      <section className="py-16 bg-muted/30">
        <div className="container mx-auto px-4 max-w-3xl">
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }}>
            <motion.h2 variants={fadeUp} custom={0} className="text-2xl md:text-3xl font-bold text-center mb-2">
              First-Time Agent Login
            </motion.h2>
            <motion.p variants={fadeUp} custom={1} className="text-muted-foreground text-center mb-8">
              No company selection needed — login alone determines your company & behavior.
            </motion.p>

            <motion.div variants={fadeUp} custom={2} className="rounded-xl bg-gradient-card border border-border p-6 space-y-4">
              {[
                { step: "1", text: "Agent launches after installation" },
                { step: "2", text: "Login screen appears — enter your Email & Password" },
                { step: "3", text: "Backend validates credentials and returns user_id, company_id, role & plan_settings" },
                { step: "4", text: "Agent applies company-specific monitoring rules automatically" },
                { step: "5", text: "Tracking starts immediately in the background" },
              ].map((item) => (
                <div key={item.step} className="flex gap-4 items-start">
                  <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                    <span className="text-primary font-bold text-sm">{item.step}</span>
                  </div>
                  <p className="text-sm text-foreground pt-1">{item.text}</p>
                </div>
              ))}

              <div className="border-t border-border pt-4 mt-4 space-y-2">
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <Shield size={14} className="text-primary" />
                  <span>Allowed roles: <strong>Company Admin</strong>, <strong>Sub-Admin</strong>, <strong>User</strong></span>
                </div>
                <div className="flex items-center gap-2 text-xs text-destructive">
                  <Lock size={14} />
                  <span>Super Admin login is <strong>NOT allowed</strong> in the agent</span>
                </div>
              </div>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Tracking Features */}
      <section className="py-16">
        <div className="container mx-auto px-4 max-w-3xl">
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }}>
            <motion.h2 variants={fadeUp} custom={0} className="text-2xl md:text-3xl font-bold text-center mb-8">
              What the Agent Tracks
            </motion.h2>
            <motion.div variants={fadeUp} custom={1} className="grid sm:grid-cols-2 gap-4">
              {trackingFeatures.map((f) => (
                <div key={f.label} className="flex gap-3 items-start rounded-lg border border-border p-4 bg-gradient-card">
                  <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                    <f.icon size={18} className="text-primary" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-foreground">{f.label}</p>
                    <p className="text-xs text-muted-foreground">{f.desc}</p>
                  </div>
                </div>
              ))}
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Background Behavior & Rules */}
      <section className="py-16 bg-muted/30">
        <div className="container mx-auto px-4 max-w-3xl">
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }}>
            <motion.h2 variants={fadeUp} custom={0} className="text-2xl md:text-3xl font-bold text-center mb-8">
              Agent Behavior & Rules
            </motion.h2>
            <motion.div variants={fadeUp} custom={1}>
              <Accordion type="single" collapsible className="space-y-2">
                <AccordionItem value="background" className="border border-border rounded-lg bg-gradient-card px-4">
                  <AccordionTrigger className="text-sm font-semibold">Background Behavior</AccordionTrigger>
                  <AccordionContent className="text-sm text-muted-foreground space-y-1">
                    <p>• Agent runs continuously in background after login</p>
                    <p>• System tray icon always visible</p>
                    <p>• Auto-starts on every system boot</p>
                    <p>• Cannot be closed or terminated by the user</p>
                    <p>• Only action available: Logout</p>
                  </AccordionContent>
                </AccordionItem>
                <AccordionItem value="screenshots" className="border border-border rounded-lg bg-gradient-card px-4">
                  <AccordionTrigger className="text-sm font-semibold">Screenshot Storage & Retention</AccordionTrigger>
                  <AccordionContent className="text-sm text-muted-foreground space-y-1">
                    <p>• Screenshots uploaded to backend automatically</p>
                    <p>• Stored securely for <strong>3 months (90 days)</strong></p>
                    <p>• Auto-deleted via scheduled job after retention period</p>
                    <p>• Company Admin can view & download screenshots</p>
                    <p>• Users cannot delete their own screenshots</p>
                  </AccordionContent>
                </AccordionItem>
                <AccordionItem value="security" className="border border-border rounded-lg bg-gradient-card px-4">
                  <AccordionTrigger className="text-sm font-semibold">Security & Token Management</AccordionTrigger>
                  <AccordionContent className="text-sm text-muted-foreground space-y-1">
                    <p>• Auth tokens stored with OS-level encryption</p>
                    <p>• Token expiry forces automatic re-login</p>
                    <p>• All data tagged with user_id + company_id</p>
                    <p>• Heartbeat pings every 60 seconds</p>
                    <p>• Offline data queued and synced on reconnect</p>
                  </AccordionContent>
                </AccordionItem>
                <AccordionItem value="update" className="border border-border rounded-lg bg-gradient-card px-4">
                  <AccordionTrigger className="text-sm font-semibold">Auto-Update</AccordionTrigger>
                  <AccordionContent className="text-sm text-muted-foreground space-y-1">
                    <p>• Agent checks for updates on every startup</p>
                    <p>• If a new version is available, update prompt appears</p>
                    <p>• Downloads and installs the latest version automatically</p>
                  </AccordionContent>
                </AccordionItem>
                <AccordionItem value="rules" className="border border-border rounded-lg bg-gradient-card px-4">
                  <AccordionTrigger className="text-sm font-semibold">Non-Negotiable Rules</AccordionTrigger>
                  <AccordionContent className="text-sm text-muted-foreground space-y-1">
                    <p>❌ No third-party monitoring tools</p>
                    <p>❌ No browser extensions</p>
                    <p>✅ Only OS-level native APIs</p>
                    <p>✅ Same agent build for all companies</p>
                    <p>✅ Company rules applied only after login</p>
                  </AccordionContent>
                </AccordionItem>
              </Accordion>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* System Requirements */}
      <section className="py-16">
        <div className="container mx-auto px-4 max-w-3xl">
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }}>
            <motion.h2 variants={fadeUp} custom={0} className="text-2xl md:text-3xl font-bold text-center mb-2">
              System Requirements
            </motion.h2>
            <motion.p variants={fadeUp} custom={1} className="text-muted-foreground text-center mb-8">
              Minimum specifications to run the WEBMOK Agent
            </motion.p>

            <motion.div variants={fadeUp} custom={2} className="grid sm:grid-cols-2 gap-4 mb-8">
              {systemRequirements.map((r) => (
                <div key={r.label} className="flex gap-3 items-start rounded-lg border border-border p-4 bg-gradient-card">
                  <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                    <r.icon size={18} className="text-primary" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-foreground">{r.label}</p>
                    <p className="text-xs text-muted-foreground">{r.value}</p>
                  </div>
                </div>
              ))}
            </motion.div>

            <motion.div variants={fadeUp} custom={3} className="rounded-xl border border-border bg-gradient-card p-5">
              <p className="text-sm font-semibold text-foreground mb-3">Minimum OS Versions</p>
              <div className="grid sm:grid-cols-3 gap-4">
                {platforms.map((p) => (
                  <div key={p.name} className="flex gap-2 items-start">
                    <p.icon size={16} className="text-primary mt-0.5 shrink-0" />
                    <div>
                      <p className="text-sm font-medium text-foreground">{p.name}</p>
                      <p className="text-xs text-muted-foreground">{p.minOs}</p>
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Agent Panel CTA */}
      <section className="py-16 bg-muted/30">
        <div className="container mx-auto px-4 max-w-3xl">
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} className="text-center">
            <motion.h2 variants={fadeUp} custom={0} className="text-2xl md:text-3xl font-bold mb-2">
              Try the Agent Control Panel
            </motion.h2>
            <motion.p variants={fadeUp} custom={1} className="text-muted-foreground mb-6">
              After installing the agent, use the control panel to Start, Pause, or End your work sessions.
            </motion.p>
            <motion.div variants={fadeUp} custom={2}>
              <Button size="lg" className="gap-2" asChild>
                <a href="/agent">
                  <Play size={18} /> Open Agent Panel
                </a>
              </Button>
            </motion.div>
          </motion.div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default DownloadPage;
