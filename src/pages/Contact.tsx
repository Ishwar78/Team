import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Mail, MessageSquare } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

const Contact = () => {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <section className="pt-32 pb-20">
        <div className="container mx-auto px-4 max-w-xl">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <div className="text-center mb-10">
              <h1 className="text-4xl font-bold mb-3">Get in <span className="text-gradient">Touch</span></h1>
              <p className="text-muted-foreground">Have a question or want to book a demo? We'd love to hear from you.</p>
            </div>
            <div className="rounded-xl bg-gradient-card border border-border p-8">
              <form className="space-y-4" onSubmit={(e) => e.preventDefault()}>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>First Name</Label>
                    <Input placeholder="John" className="mt-1.5" />
                  </div>
                  <div>
                    <Label>Last Name</Label>
                    <Input placeholder="Doe" className="mt-1.5" />
                  </div>
                </div>
                <div>
                  <Label>Email</Label>
                  <Input type="email" placeholder="john@company.com" className="mt-1.5" />
                </div>
                <div>
                  <Label>Company</Label>
                  <Input placeholder="Acme Corp" className="mt-1.5" />
                </div>
                <div>
                  <Label>Message</Label>
                  <Textarea placeholder="Tell us about your needs..." className="mt-1.5" rows={4} />
                </div>
                <Button className="w-full gap-2" size="lg">
                  <Mail size={16} /> Send Message
                </Button>
              </form>
            </div>
          </motion.div>
        </div>
      </section>
      <Footer />
    </div>
  );
};

export default Contact;
