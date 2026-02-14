import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Eye, EyeOff, CheckCircle2, AlertTriangle, UserPlus, Monitor, Phone } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { ROLE_LABELS } from "@/lib/permissions";
import Navbar from "@/components/Navbar";
import { toast } from "@/hooks/use-toast";
import OtpVerification from "@/components/OtpVerification";

const AcceptInvite = () => {
  const { token } = useParams<{ token: string }>();
  const navigate = useNavigate();
  const { invites, acceptInvite, completePendingAuth } = useAuth();
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [otpStep, setOtpStep] = useState(false);

  const invite = invites.find(i => i.token === token);

  const handleAccept = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!name.trim()) { setError("Please enter your full name."); return; }
    if (!phone.trim() || phone.length < 10) { setError("Please enter a valid mobile number."); return; }
    if (password.length < 6) { setError("Password must be at least 6 characters."); return; }
    if (password !== confirmPassword) { setError("Passwords do not match."); return; }

    const result = acceptInvite(token!, name.trim(), password, phone.trim());
    if (result.success && result.requiresOtp) {
      setOtpStep(true);
    } else if (result.success) {
      toast({ title: "Account Activated!", description: `Welcome to ${invite?.companyName}.` });
      navigate("/dashboard");
    } else {
      setError(result.error || "Something went wrong.");
    }
  };

  const handleOtpVerified = () => {
    completePendingAuth();
    toast({ title: "Account Activated!", description: `Phone verified. Welcome to ${invite?.companyName}. Tracking active.` });
    navigate("/dashboard");
  };

  if (!invite) {
    return (
      <div className="min-h-screen bg-background flex flex-col">
        <Navbar />
        <div className="flex-1 flex items-center justify-center px-4 pt-16">
          <div className="text-center space-y-4">
            <div className="w-16 h-16 rounded-2xl bg-destructive/10 flex items-center justify-center mx-auto">
              <AlertTriangle size={32} className="text-destructive" />
            </div>
            <h2 className="text-xl font-bold text-foreground">Invalid Invite Link</h2>
            <p className="text-sm text-muted-foreground">This invitation link is not valid or has been removed.</p>
            <Button onClick={() => navigate("/login")} variant="outline">Go to Login</Button>
          </div>
        </div>
      </div>
    );
  }

  if (invite.status === "expired") {
    return (
      <div className="min-h-screen bg-background flex flex-col">
        <Navbar />
        <div className="flex-1 flex items-center justify-center px-4 pt-16">
          <div className="text-center space-y-4">
            <div className="w-16 h-16 rounded-2xl bg-destructive/10 flex items-center justify-center mx-auto">
              <AlertTriangle size={32} className="text-destructive" />
            </div>
            <h2 className="text-xl font-bold text-foreground">Invite Expired</h2>
            <p className="text-sm text-muted-foreground">This invitation has expired. Please ask your admin to send a new one.</p>
            <Button onClick={() => navigate("/login")} variant="outline">Go to Login</Button>
          </div>
        </div>
      </div>
    );
  }

  if (invite.status === "accepted") {
    return (
      <div className="min-h-screen bg-background flex flex-col">
        <Navbar />
        <div className="flex-1 flex items-center justify-center px-4 pt-16">
          <div className="text-center space-y-4">
            <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto">
              <CheckCircle2 size={32} className="text-primary" />
            </div>
            <h2 className="text-xl font-bold text-foreground">Already Accepted</h2>
            <p className="text-sm text-muted-foreground">This invitation has already been used. You can log in with your credentials.</p>
            <Button onClick={() => navigate("/login")}>Go to Login</Button>
          </div>
        </div>
      </div>
    );
  }

  if (otpStep) {
    return (
      <div className="min-h-screen bg-background flex flex-col">
        <Navbar />
        <div className="flex-1 flex items-center justify-center px-4 pt-16">
          <OtpVerification phone={phone} onVerified={handleOtpVerified} onCancel={() => setOtpStep(false)} />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Navbar />
      <div className="flex-1 flex items-center justify-center px-4 pt-16">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="w-full max-w-md">
          <div className="rounded-xl bg-gradient-card border border-border p-8">
            <div className="text-center mb-6">
              <div className="w-10 h-10 rounded-lg bg-primary flex items-center justify-center mx-auto mb-3">
                <UserPlus size={20} className="text-primary-foreground" />
              </div>
              <h1 className="text-2xl font-bold text-foreground">Accept Invitation</h1>
              <p className="text-sm text-muted-foreground mt-1">You've been invited to join</p>
              <div className="mt-3 flex items-center justify-center gap-2">
                <span className="font-semibold text-foreground">{invite.companyName}</span>
                <Badge variant="secondary" className="text-[10px]">{ROLE_LABELS[invite.role]}</Badge>
              </div>
              <p className="text-xs text-muted-foreground mt-1">{invite.email}</p>
            </div>

            <form onSubmit={handleAccept} className="space-y-4">
              <div>
                <Label htmlFor="name">Full Name</Label>
                <Input id="name" placeholder="Your full name" value={name} onChange={e => setName(e.target.value)} className="mt-1.5" />
              </div>
              <div>
                <Label htmlFor="phone" className="flex items-center gap-1"><Phone size={12} /> Mobile Number <span className="text-destructive">*</span></Label>
                <Input id="phone" type="tel" placeholder="+91 98765 43210" value={phone} onChange={e => setPhone(e.target.value)} className="mt-1.5" />
                <p className="text-[10px] text-muted-foreground mt-1">OTP will be sent for verification</p>
              </div>
              <div>
                <Label htmlFor="password">Create Password</Label>
                <div className="relative mt-1.5">
                  <Input id="password" type={showPassword ? "text" : "password"} placeholder="Min 6 characters" value={password} onChange={e => setPassword(e.target.value)} />
                  <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>
              <div>
                <Label htmlFor="confirm">Confirm Password</Label>
                <Input id="confirm" type="password" placeholder="Re-enter password" value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} className="mt-1.5" />
              </div>

              {error && <p className="text-sm text-destructive flex items-center gap-1"><AlertTriangle size={14} /> {error}</p>}

              <Button type="submit" className="w-full gap-2" size="lg">
                <CheckCircle2 size={16} /> Verify Phone & Activate
              </Button>

              <div className="rounded-lg border border-border bg-secondary/30 p-3 flex items-start gap-3">
                <Monitor size={16} className="text-primary mt-0.5 shrink-0" />
                <div>
                  <p className="text-xs font-medium text-foreground">Desktop Agent Required</p>
                  <p className="text-[10px] text-muted-foreground">After activation, download and install the WebMok desktop agent to begin activity tracking on your device.</p>
                </div>
              </div>
            </form>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default AcceptInvite;
