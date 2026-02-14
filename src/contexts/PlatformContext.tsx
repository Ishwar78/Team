import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import axios from "axios";
import { useAuth } from "./AuthContext";

// Configure axios base URL if not already configured globally
const api = axios.create({
  baseURL: "http://localhost:5000/api/super-admin", // centralized config
});

export interface Plan {
  _id: string; // MongoDB ID
  id?: string; // Frontend compatibility (mapped from _id)
  name: string;
  price_monthly: number;
  max_users: number;
  screenshots_per_hour: number;
  data_retention: string;
  isActive: boolean;
  features?: string[];
  active?: number; // count of companies

  // Frontend legacy fields mapping
  price?: number;
  users?: number | string;
  screenshots?: string;
  retention?: string;
  popular?: boolean;
}

export interface Company {
  _id: string;
  id?: string | number;
  name: string;
  email: string;
  plan: string;
  users: number;
  maxUsers: number;
  status: "active" | "trial" | "suspended";
  mrr: number;
  joined: string;
  country: string;
}

export interface User {
  id: string;
  name: string;
  email: string;
  company: string;
  role: string;
  status: string;
  lastSeen: string;
}

interface PlatformContextValue {
  plans: Plan[];
  companies: Company[];
  users: User[];
  loading: boolean;
  refreshData: () => void;

  addPlan: (plan: any) => Promise<void>;
  updatePlan: (id: string, updates: any) => Promise<void>;
  deletePlan: (id: string) => Promise<void>;

  addCompany: (company: any) => Promise<void>;
  updateCompany: (id: string, updates: any) => Promise<void>;
  suspendCompany: (id: string) => Promise<void>;
  activateCompany: (id: string) => Promise<void>;
}

const PlatformContext = createContext<PlatformContextValue | null>(null);

export const PlatformProvider = ({ children }: { children: ReactNode }) => {
  const { token } = useAuth(); // Assuming AuthContext provides token
  const [plans, setPlans] = useState<Plan[]>([]);
  const [companies, setCompanies] = useState<Company[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);

  // Set auth header
  useEffect(() => {
    if (token) {
      api.defaults.headers.common["Authorization"] = `Bearer ${token}`;
    }
  }, [token]);

  const fetchData = async () => {
    if (!token) return;
    setLoading(true);
    try {
      const [plansRes, companiesRes, usersRes] = await Promise.all([
        api.get("/plans"),
        api.get("/companies"),
        api.get("/users")
      ]);

      if (plansRes.data.success) {
        // Map backend Plan to frontend interface
        const mappedPlans = plansRes.data.data.map((p: any) => ({
          ...p,
          id: p._id,
          price: p.price_monthly,
          users: p.max_users,
          screenshots: `${p.screenshots_per_hour}/hr`,
          retention: p.data_retention
        }));
        setPlans(mappedPlans);
      }

      if (companiesRes.data.success) {
        // Map backend Company to frontend interface
        const mappedCompanies = companiesRes.data.data.map((c: any) => ({
          ...c,
          id: c.id, // backend sends .id as _id
        }));
        setCompanies(mappedCompanies);
      }

      if (usersRes.data.success) {
        setUsers(usersRes.data.data);
      }

    } catch (error) {
      console.error("Failed to fetch platform data", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [token]);

  const addPlan = async (planData: any) => {
    // Map frontend form data to backend expected
    const payload = {
      name: planData.name,
      price_monthly: planData.price,
      max_users: Number(planData.users) || 5, // handle 'Custom' if needed
      screenshots_per_hour: parseInt(planData.screenshots) || 12,
      data_retention: planData.retention,
      features: planData.features,
      isActive: true
    };
    await api.post("/plans", payload);
    fetchData();
  };

  const updatePlan = async (id: string, updates: any) => {
    // Map updates if needed
    const payload: any = {};
    if (updates.name) payload.name = updates.name;
    if (updates.price !== undefined) payload.price_monthly = updates.price;
    if (updates.users) payload.max_users = Number(updates.users);
    if (updates.screenshots) payload.screenshots_per_hour = parseInt(updates.screenshots);
    if (updates.retention) payload.data_retention = updates.retention;
    if (updates.features) payload.features = updates.features;

    await api.put(`/plans/${id}`, payload);
    fetchData();
  };

  const deletePlan = async (id: string) => {
    await api.delete(`/plans/${id}`);
    fetchData();
  };

  const addCompany = async (companyData: any) => {
    const payload = {
      name: companyData.name,
      domain: companyData.name.toLowerCase().replace(/\s+/g, '') + '.com', // Generate domain
      adminEmail: companyData.email,
      adminPassword: companyData.adminPassword || 'password123', // should be provided
      plan_name: companyData.plan,
      country: companyData.country
    };
    await api.post("/company", payload);
    fetchData();
  };

  const updateCompany = async (id: string, updates: any) => {
    const payload: any = {};
    if (updates.plan) payload.plan_name = updates.plan;
    await api.put(`/companies/${id}`, payload);
    fetchData();
  };

  const suspendCompany = async (id: string) => {
    await api.put(`/companies/${id}`, { status: 'suspended' });
    fetchData();
  };

  const activateCompany = async (id: string) => {
    await api.put(`/companies/${id}`, { status: 'active' });
    fetchData();
  };

  return (
    <PlatformContext.Provider value={{
      plans, companies, users, loading, refreshData: fetchData,
      addPlan, updatePlan, deletePlan,
      addCompany, updateCompany, suspendCompany, activateCompany
    }}>
      {children}
    </PlatformContext.Provider>
  );
};

export const usePlatform = () => {
  const ctx = useContext(PlatformContext);
  if (!ctx) throw new Error("usePlatform must be used within PlatformProvider");
  return ctx;
};
