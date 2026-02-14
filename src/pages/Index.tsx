import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import {
  Clock, Monitor, Camera, Globe, BarChart3, Users, Shield, Zap,
  ArrowRight, CheckCircle2
} from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

const fadeUp = {
  hidden: { opacity: 0, y: 30 },
  visible: (i: number) => ({
    opacity: 1, y: 0,
    transition: { delay: i * 0.1, duration: 0.5, ease: [0.25, 0.46, 0.45, 0.94] as const },
  }),
};

const features = [
  { icon: Clock, title: "Time Tracking", desc: "Automatic app start/stop, active & idle time logging with per-user daily timelines." },
  { icon: Camera, title: "Screenshot Monitoring", desc: "12 silent screenshots/hour at randomized intervals. Secure upload with optional blur." },
  { icon: Globe, title: "URL & App Tracking", desc: "Track active windows, browser tabs, and time spent per application or website." },
  { icon: Monitor, title: "Idle Detection", desc: "Real-time active/idle/offline status detection with keyboard & mouse monitoring." },
  { icon: BarChart3, title: "Productivity Analytics", desc: "Daily, weekly & monthly reports with PDF/CSV export and company-wide insights." },
  { icon: Users, title: "Team Management", desc: "Role-based access with Company Admin, Sub-Admin, and Employee roles." },
  { icon: Shield, title: "Data Isolation", desc: "Strict multi-tenant architecture with company-wise data isolation on every table." },
  { icon: Zap, title: "Desktop Agent", desc: "Silent background agent for Windows, Mac & Linux. Auto-start, tray-based, tamper-proof." },
];

const stats = [
  { value: "99.9%", label: "Uptime" },
  { value: "10M+", label: "Hours Tracked" },
  { value: "500+", label: "Companies" },
  { value: "<1s", label: "Sync Latency" },
];

const Index = () => {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      {/* Hero */}
      <section className="relative pt-32 pb-20 overflow-hidden">
        <div className="absolute inset-0 bg-glow opacity-40" />
        <div className="absolute inset-0 grid-pattern opacity-30" />
        <div className="container mx-auto px-4 relative z-10">
          <motion.div
            initial="hidden"
            animate="visible"
            className="max-w-3xl mx-auto text-center"
          >
            <motion.div variants={fadeUp} custom={0} className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full glass text-xs text-primary mb-6">
              <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse-glow" />
              Now available for Windows, Mac & Linux
            </motion.div>
            <motion.h1 variants={fadeUp} custom={1} className="text-5xl md:text-7xl font-black leading-tight tracking-tight mb-6">
              Monitor Your Team's <span className="text-gradient">Productivity</span>
            </motion.h1>
            <motion.p variants={fadeUp} custom={2} className="text-lg text-muted-foreground mb-8 max-w-xl mx-auto">
              Silent desktop tracking, automatic screenshots, real-time activity monitoring — all in one enterprise-grade platform built for scale.
            </motion.p>
            <motion.div variants={fadeUp} custom={3} className="flex flex-col sm:flex-row gap-3 justify-center">
              <Link to="/login">
                <Button size="lg" className="gap-2 shadow-glow">
                  Start Free Trial <ArrowRight size={16} />
                </Button>
              </Link>
              <Link to="/download">
                <Button variant="outline" size="lg">Download Agent</Button>
              </Link>
            </motion.div>
          </motion.div>

          {/* Stats */}
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-20 max-w-2xl mx-auto"
          >
            {stats.map((s, i) => (
              <motion.div key={s.label} variants={fadeUp} custom={i} className="text-center">
                <div className="text-3xl font-bold text-gradient">{s.value}</div>
                <div className="text-sm text-muted-foreground mt-1">{s.label}</div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="py-20">
        <div className="container mx-auto px-4">
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} className="text-center mb-14">
            <motion.h2 variants={fadeUp} custom={0} className="text-3xl md:text-4xl font-bold mb-4">
              Everything You Need to <span className="text-gradient">Track & Manage</span>
            </motion.h2>
            <motion.p variants={fadeUp} custom={1} className="text-muted-foreground max-w-lg mx-auto">
              A comprehensive suite of monitoring tools designed for enterprise teams.
            </motion.p>
          </motion.div>
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
            {features.map((f, i) => (
              <motion.div key={f.title} variants={fadeUp} custom={i} className="group p-6 rounded-xl bg-gradient-card border border-border hover:border-primary/30 transition-all duration-300 hover:shadow-glow">
                <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center mb-4 group-hover:bg-primary/20 transition-colors">
                  <f.icon size={20} className="text-primary" />
                </div>
                <h3 className="font-semibold text-foreground mb-2">{f.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{f.desc}</p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="relative rounded-2xl overflow-hidden bg-gradient-card border border-border p-12 text-center">
            <div className="absolute inset-0 bg-glow opacity-30" />
            <div className="relative z-10">
              <h2 className="text-3xl md:text-4xl font-bold mb-4">Ready to boost productivity?</h2>
              <p className="text-muted-foreground mb-6 max-w-md mx-auto">Start your free trial with up to 5 users. No credit card required.</p>
              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <Link to="/login">
                  <Button size="lg" className="gap-2 shadow-glow">Get Started Free <ArrowRight size={16} /></Button>
                </Link>
                <Link to="/pricing">
                  <Button variant="outline" size="lg">View Pricing</Button>
                </Link>
              </div>
              <div className="flex flex-wrap gap-4 justify-center mt-6 text-sm text-muted-foreground">
                {["5 users free", "No credit card", "14-day trial", "Cancel anytime"].map(t => (
                  <span key={t} className="flex items-center gap-1"><CheckCircle2 size={14} className="text-primary" /> {t}</span>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default Index;
