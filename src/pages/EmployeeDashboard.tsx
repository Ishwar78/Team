import { useEffect, useState } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import { useAuth } from "@/contexts/AuthContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Clock, Calendar, CheckCircle, AlertCircle, Timer } from "lucide-react";
import { format } from "date-fns";
import Attendance from "./Attendance";

const EmployeeDashboard = () => {
    const { user } = useAuth();
    const [greeting, setGreeting] = useState("");

    useEffect(() => {
        const hour = new Date().getHours();
        if (hour < 12) setGreeting("Good Morning");
        else if (hour < 18) setGreeting("Good Afternoon");
        else setGreeting("Good Evening");
    }, []);

    return (
        <DashboardLayout>
            <div className="space-y-6">
                {/* Welcome Section */}
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                    <div>
                        <h1 className="text-3xl font-bold text-foreground">
                            {greeting}, {user?.name?.split(" ")[0]}!
                        </h1>
                        <p className="text-muted-foreground mt-1">
                            Here is your activity overview for today.
                        </p>
                    </div>
                    <div className="flex items-center gap-2 bg-secondary/50 px-4 py-2 rounded-full border border-border">
                        <Clock size={16} className="text-primary" />
                        <span className="text-sm font-medium font-mono">
                            {format(new Date(), "EEE, dd MMM yyyy")}
                        </span>
                    </div>
                </div>

                {/* Quick Stats */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {/* Working Time */}
                    <Card className="bg-gradient-to-br from-green-500/10 to-green-600/5 border-green-500/20">
                        <CardHeader className="pb-2">
                            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                                <Timer size={16} className="text-green-500" /> Working Time
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-green-500">
                                00h 00m
                            </div>
                            <p className="text-xs text-muted-foreground mt-1">
                                Active time today
                            </p>
                        </CardContent>
                    </Card>

                    {/* Idle Time */}
                    <Card className="bg-gradient-to-br from-yellow-500/10 to-yellow-600/5 border-yellow-500/20">
                        <CardHeader className="pb-2">
                            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                                <AlertCircle size={16} className="text-yellow-500" /> Idle Time
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-yellow-500">
                                00h 00m
                            </div>
                            <p className="text-xs text-muted-foreground mt-1">
                                Non-productive time
                            </p>
                        </CardContent>
                    </Card>

                    {/* Attendance Status */}
                    <Card className="bg-gradient-to-br from-blue-500/10 to-blue-600/5 border-blue-500/20">
                        <CardHeader className="pb-2">
                            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                                <CheckCircle size={16} className="text-blue-500" /> Status
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-blue-500">
                                Active
                            </div>
                            <p className="text-xs text-muted-foreground mt-1">
                                Current session status
                            </p>
                        </CardContent>
                    </Card>
                </div>

                {/* Attendance View for Employee */}
                <div className="space-y-4">
                    <h2 className="text-xl font-semibold text-foreground flex items-center gap-2">
                        <Calendar size={20} className="text-primary" /> Your Attendance
                    </h2>
                    <Attendance />
                </div>
            </div>
        </DashboardLayout>
    );
};

export default EmployeeDashboard;
