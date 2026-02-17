import { useState, useEffect } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Clock, Send, AlertCircle, CheckCircle2, XCircle, Calendar } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { apiFetch } from "@/lib/api";

const TimeClaim = () => {
    const { token, user } = useAuth();
    const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
    const [startTime, setStartTime] = useState("");
    const [endTime, setEndTime] = useState("");
    const [type, setType] = useState("Other");
    const [reason, setReason] = useState("");
    const [claims, setClaims] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (token) fetchClaims();
    }, [token]);

    const fetchClaims = async () => {
        try {
            const data = await apiFetch("/api/claims/my", token);
            setClaims(data.claims || []);
        } catch (err) {
            console.error("Failed to fetch claims", err);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!startTime || !endTime || !reason) {
            toast({ title: "Error", description: "Please fill all fields", variant: "destructive" });
            return;
        }

        setLoading(true);
        try {
            await apiFetch("/api/claims", token, {
                method: "POST",
                body: JSON.stringify({
                    date,
                    startTime,
                    endTime,
                    type,
                    reason
                })
            });

            toast({ title: "Success", description: "Time claim submitted successfully" });
            setReason("");
            setStartTime("");
            setEndTime("");
            fetchClaims();
        } catch (err: any) {
            toast({ title: "Error", description: err.message, variant: "destructive" });
        } finally {
            setLoading(false);
        }
    };

    const getStatusBadge = (status: string) => {
        switch (status) {
            case 'approved': return <Badge className="bg-green-500/10 text-green-500 hover:bg-green-500/20 border-0"><CheckCircle2 size={12} className="mr-1" /> Approved</Badge>;
            case 'rejected': return <Badge className="bg-red-500/10 text-red-500 hover:bg-red-500/20 border-0"><XCircle size={12} className="mr-1" /> Rejected</Badge>;
            default: return <Badge className="bg-yellow-500/10 text-yellow-500 hover:bg-yellow-500/20 border-0"><Clock size={12} className="mr-1" /> Pending</Badge>;
        }
    };

    return (
        <DashboardLayout>
            <div className="space-y-6">
                <div>
                    <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
                        <Clock className="text-primary" /> Time Claims
                    </h1>
                    <p className="text-muted-foreground mt-1">
                        Submit requests for manual time entry or adjustments.
                    </p>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Submission Form */}
                    <Card className="lg:col-span-1 border-primary/20 bg-gradient-card">
                        <CardHeader>
                            <CardTitle className="text-lg">New Claim</CardTitle>
                            <CardDescription>Request time adjustment</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <form onSubmit={handleSubmit} className="space-y-4">
                                <div className="space-y-2">
                                    <Label>Date</Label>
                                    <div className="relative">
                                        <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground h-4 w-4" />
                                        <Input
                                            type="date"
                                            value={date}
                                            onChange={(e) => setDate(e.target.value)}
                                            className="pl-9"
                                        />
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label>Start Time</Label>
                                        <Input
                                            type="time"
                                            value={startTime}
                                            onChange={(e) => setStartTime(e.target.value)}
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label>End Time</Label>
                                        <Input
                                            type="time"
                                            value={endTime}
                                            onChange={(e) => setEndTime(e.target.value)}
                                        />
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <Label>Type</Label>
                                    <Select value={type} onValueChange={setType}>
                                        <SelectTrigger>
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="Meeting">Meeting</SelectItem>
                                            <SelectItem value="Call">Call</SelectItem>
                                            <SelectItem value="Break">Break</SelectItem>
                                            <SelectItem value="Other">Other</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>

                                <div className="space-y-2">
                                    <Label>Reason</Label>
                                    <Textarea
                                        placeholder="Describe why this time needs to be added..."
                                        value={reason}
                                        onChange={(e) => setReason(e.target.value)}
                                        className="min-h-[100px]"
                                    />
                                </div>

                                <Button type="submit" className="w-full gap-2" disabled={loading}>
                                    <Send size={16} /> {loading ? "Submitting..." : "Submit Claim"}
                                </Button>
                            </form>
                        </CardContent>
                    </Card>

                    {/* Claims List */}
                    <Card className="lg:col-span-2">
                        <CardHeader>
                            <CardTitle className="text-lg">Your Claims</CardTitle>
                            <CardDescription>History of your time claim requests</CardDescription>
                        </CardHeader>
                        <CardContent>
                            {claims.length === 0 ? (
                                <div className="text-center py-12 text-muted-foreground">
                                    <Clock className="h-12 w-12 mx-auto mb-3 opacity-20" />
                                    <p>No claims found</p>
                                </div>
                            ) : (
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead>Date</TableHead>
                                            <TableHead>Time</TableHead>
                                            <TableHead>Type</TableHead>
                                            <TableHead>Reason</TableHead>
                                            <TableHead>Status</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {claims.map((claim) => (
                                            <TableRow key={claim._id}>
                                                <TableCell className="font-medium">{claim.date}</TableCell>
                                                <TableCell className="text-xs text-muted-foreground">
                                                    {claim.startTime} - {claim.endTime}
                                                    <div className="font-mono text-[10px] mt-0.5">
                                                        {claim.duration} mins
                                                    </div>
                                                </TableCell>
                                                <TableCell>
                                                    <Badge variant="outline">{claim.type}</Badge>
                                                </TableCell>
                                                <TableCell className="max-w-[200px]">
                                                    <div className="truncate text-sm">{claim.reason}</div>
                                                    {claim.rejectionReason && (
                                                        <div className="text-red-400 text-xs mt-1">
                                                            Note: {claim.rejectionReason}
                                                        </div>
                                                    )}
                                                </TableCell>
                                                <TableCell>{getStatusBadge(claim.status)}</TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            )}
                        </CardContent>
                    </Card>
                </div>
            </div>
        </DashboardLayout>
    );
};

export default TimeClaim;
