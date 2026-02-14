import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { Camera, Eye, EyeOff, Clock, Download, CheckCircle2, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
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
  { icon: Camera, title: "Randomized Captures", desc: "Up to 12 screenshots per hour at random intervals — no predictable pattern." },
  { icon: EyeOff, title: "Privacy Blur", desc: "Optional privacy blur to protect sensitive information while maintaining oversight." },
  { icon: Clock, title: "90-Day Retention", desc: "Screenshots stored securely for 3 months with automatic cleanup after expiry." },
  { icon: Download, title: "Download & Export", desc: "Admins can view and download screenshots anytime for reviews or compliance." },
];

const benefits = [
  "Silent capture — employees aren't disrupted",
  "Configurable frequency: 1–30 screenshots per hour",
  "Automatic secure upload to cloud storage",
  "Admin-only access — employees cannot delete screenshots",
  "90-day retention with auto-delete scheduled jobs",
  "Works across Windows, macOS, and Linux",
];

const ScreenshotMonitoring = () => (
  <div className="min-h-screen bg-background">
    <Navbar />
    <section className="pt-28 pb-16">
      <div className="container mx-auto px-4">
        <motion.div initial="hidden" animate="visible" className="text-center max-w-3xl mx-auto mb-16">
          <motion.div variants={fadeUp} custom={0} className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary text-sm font-medium mb-6">
            <Camera size={16} /> Feature
          </motion.div>
          <motion.h1 variants={fadeUp} custom={1} className="text-4xl md:text-5xl font-bold text-foreground mb-4">
            Screenshot Monitoring
          </motion.h1>
          <motion.p variants={fadeUp} custom={2} className="text-lg text-muted-foreground">
            Get visual proof of work with automated, randomized screenshots. Silent captures with optional privacy blur for a balanced approach to monitoring.
          </motion.p>
          <motion.div variants={fadeUp} custom={3} className="flex gap-3 justify-center mt-8">
            <Link to="/admin/login"><Button size="lg">Start Free Trial <ArrowRight size={16} /></Button></Link>
            <Link to="/pricing"><Button size="lg" variant="outline">View Pricing</Button></Link>
          </motion.div>
        </motion.div>

        <motion.div initial="hidden" animate="visible" className="grid md:grid-cols-2 gap-6 max-w-4xl mx-auto mb-16">
          {features.map((f, i) => (
            <motion.div key={f.title} variants={fadeUp} custom={i} className="rounded-xl border border-border bg-card p-6">
              <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                <f.icon size={24} className="text-primary" />
              </div>
              <h3 className="text-lg font-semibold text-foreground mb-2">{f.title}</h3>
              <p className="text-sm text-muted-foreground">{f.desc}</p>
            </motion.div>
          ))}
        </motion.div>

        <motion.div initial="hidden" animate="visible" className="max-w-2xl mx-auto">
          <motion.h2 variants={fadeUp} custom={0} className="text-2xl font-bold text-foreground text-center mb-8">Why It Works</motion.h2>
          <div className="space-y-3">
            {benefits.map((b, i) => (
              <motion.div key={i} variants={fadeUp} custom={i} className="flex items-start gap-3">
                <CheckCircle2 size={20} className="text-primary mt-0.5 shrink-0" />
                <span className="text-muted-foreground">{b}</span>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>
    </section>
    <Footer />
  </div>
);

export default ScreenshotMonitoring;
