import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { CheckCircle2, ArrowRight } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { useEffect, useState } from "react";
import axios from "axios";

interface Plan {
  id: string;
  name: string;
  price: number;
  users: number;
  features: string[];
  popular?: boolean;
}

const fadeUp = {
  hidden: { opacity: 0, y: 30 } as const,
  visible: (i: number) => ({
    opacity: 1, y: 0,
    transition: { delay: i * 0.1, duration: 0.5 },
  }),
};

const Pricing = () => {
  const [plans, setPlans] = useState<Plan[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPlans = async () => {
      try {
        // Fetch PUBLIC plans (no auth required)
        const res = await axios.get("http://localhost:5000/api/public/plans");
        if (res.data.success) {
          setPlans(res.data.data);
        }
      } catch (error) {
        console.error("Failed to fetch public plans", error);
      } finally {
        setLoading(false);
      }
    };

    fetchPlans();
  }, []);

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <section className="pt-32 pb-20">
        <div className="container mx-auto px-4">
          <motion.div initial="hidden" animate="visible" className="text-center mb-14">
            <motion.h1 variants={fadeUp} custom={0} className="text-4xl md:text-5xl font-bold mb-4">
              Simple, <span className="text-gradient">Transparent</span> Pricing
            </motion.h1>
            <motion.p variants={fadeUp} custom={1} className="text-muted-foreground max-w-lg mx-auto">
              Choose the plan that fits your team. Upgrade or downgrade anytime.
            </motion.p>
          </motion.div>

          {loading ? (
            <div className="flex justify-center py-20 text-muted-foreground">Loading plans...</div>
          ) : (
            <motion.div initial="hidden" animate="visible" className={`grid gap-4 ${plans.length <= 3 ? "md:grid-cols-2 lg:grid-cols-3" : plans.length <= 4 ? "md:grid-cols-2 lg:grid-cols-4" : "md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5"}`}>
              {plans.map((plan, i) => (
                <motion.div
                  key={plan.id}
                  variants={fadeUp}
                  custom={i}
                  className={`relative rounded-xl p-6 border transition-all duration-300 hover:shadow-glow ${plan.popular
                    ? "border-primary bg-gradient-card shadow-glow"
                    : "border-border bg-gradient-card"
                    }`}
                >
                  {plan.popular && (
                    <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-1 rounded-full bg-primary text-primary-foreground text-xs font-semibold">
                      Most Popular
                    </div>
                  )}
                  <h3 className="font-semibold text-foreground text-lg">{plan.name}</h3>
                  <div className="mt-3 mb-1">
                    <span className="text-3xl font-bold text-foreground">
                      {plan.price === 0 ? "Free" : `₹${plan.price}`}
                    </span>
                    {plan.price > 0 && <span className="text-sm text-muted-foreground">/month</span>}
                  </div>
                  <p className="text-sm text-primary mb-4">Up to {plan.users} users</p>
                  <ul className="space-y-2 mb-6">
                    {(plan.features ?? []).map((f) => (
                      <li key={f} className="flex items-start gap-2 text-sm text-muted-foreground">
                        <CheckCircle2 size={14} className="text-primary mt-0.5 shrink-0" />
                        {f}
                      </li>
                    ))}
                  </ul>
                  {/* <Link to="/login"> */}
                  <Link to="/onboarding">
                    <Button
                      className="w-full gap-1"
                      variant={plan.popular ? "default" : "outline"}
                      size="sm"
                    >
                      {plan.price === 0 ? "Start Free" : "Get Started"} <ArrowRight size={14} />
                    </Button>
                  </Link>
                </motion.div>
              ))}
            </motion.div>
          )}
        </div>
      </section>
      <Footer />
    </div>
  );
};

export default Pricing;
