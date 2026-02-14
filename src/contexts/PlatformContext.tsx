import { createContext, useContext, useState, ReactNode } from "react";

export interface Plan {
  id: string;
  name: string;
  price: number;
  users: number | string;
  screenshots: string;
  retention: string;
  active: number;
  features?: string[];
  popular?: boolean;
}

export interface Company {
  id: number;
  name: string;
  plan: string;
  users: number;
  maxUsers: number;
  status: "active" | "trial" | "suspended";
  mrr: number;
  joined: string;
  email: string;
  country: string;
  adminPassword?: string;
}

const DEFAULT_PLANS: Plan[] = [
  { id: "free_trial", name: "Free Trial", price: 0, users: 5, screenshots: "12/hr", retention: "1 Month", active: 12, features: ["12 screenshots/hr", "Time tracking", "Basic reports", "1 month storage", "Email support"], popular: false },
  { id: "starter", name: "Starter", price: 49, users: 10, screenshots: "12/hr", retention: "3 Months", active: 34, features: ["12 screenshots/hr", "Time tracking", "Full reports", "3 months storage", "URL tracking", "Priority support"], popular: false },
  { id: "professional", name: "Professional", price: 99, users: 25, screenshots: "12/hr", retention: "3 Months", active: 52, features: ["12 screenshots/hr", "Time tracking", "Full reports", "3 months storage", "URL & app tracking", "Idle detection", "PDF/CSV export", "Sub-admin roles"], popular: true },
  { id: "team", name: "Team", price: 199, users: 50, screenshots: "12/hr", retention: "6 Months", active: 24, features: ["12 screenshots/hr", "All Pro features", "3 months storage", "Advanced analytics", "API access", "Dedicated support"], popular: false },
  { id: "enterprise", name: "Enterprise", price: 499, users: 200, screenshots: "Custom", retention: "1 Year", active: 5, features: ["Custom screenshot rate", "Unlimited storage", "All features", "On-premise option", "SLA guarantee", "Account manager"], popular: false },
];

const DEFAULT_COMPANIES: Company[] = [
  { id: 1, name: "Acme Corp", plan: "Professional", users: 18, maxUsers: 25, status: "active", mrr: 99, joined: "2025-11-12", email: "admin@acme.com", country: "US" },
  { id: 2, name: "TechFlow Inc", plan: "Team", users: 42, maxUsers: 50, status: "active", mrr: 199, joined: "2025-09-05", email: "ceo@techflow.io", country: "UK" },
  { id: 3, name: "StartupXYZ", plan: "Starter", users: 8, maxUsers: 10, status: "active", mrr: 49, joined: "2026-01-20", email: "hello@startupxyz.com", country: "IN" },
  { id: 4, name: "BigCo Ltd", plan: "Enterprise", users: 156, maxUsers: 200, status: "active", mrr: 499, joined: "2025-06-14", email: "ops@bigco.com", country: "DE" },
  { id: 5, name: "FreeTest", plan: "Free Trial", users: 3, maxUsers: 5, status: "trial", mrr: 0, joined: "2026-02-01", email: "test@free.com", country: "US" },
  { id: 6, name: "OldCompany", plan: "Starter", users: 5, maxUsers: 10, status: "suspended", mrr: 0, joined: "2025-03-10", email: "old@company.com", country: "CA" },
  { id: 7, name: "DesignHub", plan: "Professional", users: 22, maxUsers: 25, status: "active", mrr: 99, joined: "2025-08-22", email: "team@designhub.co", country: "AU" },
  { id: 8, name: "DevShop", plan: "Team", users: 38, maxUsers: 50, status: "active", mrr: 199, joined: "2025-10-01", email: "hello@devshop.dev", country: "US" },
];

interface PlatformContextValue {
  plans: Plan[];
  companies: Company[];
  addPlan: (plan: Omit<Plan, "id" | "active">) => void;
  updatePlan: (id: string, updates: Partial<Plan>) => void;
  deletePlan: (id: string) => void;
  addCompany: (company: Omit<Company, "id" | "users" | "joined">) => void;
  updateCompany: (id: number, updates: Partial<Company>) => void;
  suspendCompany: (id: number) => void;
  activateCompany: (id: number) => void;
}

const PlatformContext = createContext<PlatformContextValue | null>(null);

export const PlatformProvider = ({ children }: { children: ReactNode }) => {
  const [plans, setPlans] = useState<Plan[]>(DEFAULT_PLANS);
  const [companies, setCompanies] = useState<Company[]>(DEFAULT_COMPANIES);

  const addPlan = (plan: Omit<Plan, "id" | "active">) => {
    const id = plan.name.toLowerCase().replace(/\s+/g, "_");
    setPlans(prev => [...prev, { ...plan, id, active: 0 }]);
  };

  const updatePlan = (id: string, updates: Partial<Plan>) => {
    setPlans(prev => prev.map(p => p.id === id ? { ...p, ...updates } : p));
  };

  const deletePlan = (id: string) => {
    setPlans(prev => prev.filter(p => p.id !== id));
  };

  const addCompany = (company: Omit<Company, "id" | "users" | "joined">) => {
    const newId = Math.max(...companies.map(c => c.id), 0) + 1;
    const today = new Date().toISOString().split("T")[0];
    setCompanies(prev => [...prev, { ...company, id: newId, users: 0, joined: today }]);
  };

  const updateCompany = (id: number, updates: Partial<Company>) => {
    setCompanies(prev => prev.map(c => c.id === id ? { ...c, ...updates } : c));
  };

  const suspendCompany = (id: number) => {
    setCompanies(prev => prev.map(c => c.id === id ? { ...c, status: "suspended", mrr: 0 } : c));
  };

  const activateCompany = (id: number) => {
    setCompanies(prev => prev.map(c => c.id === id ? { ...c, status: "active" } : c));
  };

  return (
    <PlatformContext.Provider value={{ plans, companies, addPlan, updatePlan, deletePlan, addCompany, updateCompany, suspendCompany, activateCompany }}>
      {children}
    </PlatformContext.Provider>
  );
};

export const usePlatform = () => {
  const ctx = useContext(PlatformContext);
  if (!ctx) throw new Error("usePlatform must be used within PlatformProvider");
  return ctx;
};
