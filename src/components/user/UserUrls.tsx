import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Globe, ExternalLink } from "lucide-react";

// Mock data for now since backend integration for user-specific URLs needs to be verified
const MOCK_URLS = [
    { id: 1, url: "https://github.com/workwise/backend", title: "GitHub - Backend Repo", duration: "45m", time: "10:30 AM" },
    { id: 2, url: "https://stackoverflow.com/questions/react", title: "Stack Overflow", duration: "15m", time: "11:15 AM" },
    { id: 3, url: "https://figma.com/file/xyz", title: "Figma - Designs", duration: "1h 20m", time: "01:00 PM" },
    { id: 4, url: "https://google.com/search", title: "Google Search", duration: "5m", time: "02:45 PM" }
];

const UserUrls = () => {
    return (
        <div className="space-y-6">
            <h2 className="text-xl font-bold flex items-center gap-2">
                <Globe className="text-primary" /> Visited URLs Today
            </h2>
            <div className="grid grid-cols-1 gap-4">
                {MOCK_URLS.map(item => (
                    <Card key={item.id} className="bg-secondary/10 border-border/50">
                        <CardContent className="p-4 flex items-center justify-between">
                            <div className="flex items-start gap-3 overflow-hidden">
                                <div className="p-2 bg-blue-500/10 text-blue-400 rounded-lg mt-0.5">
                                    <Globe size={18} />
                                </div>
                                <div className="min-w-0">
                                    <h3 className="font-medium text-foreground truncate">{item.title}</h3>
                                    <a href={item.url} target="_blank" rel="noreferrer" className="text-sm text-muted-foreground hover:text-primary hover:underline flex items-center gap-1 truncate">
                                        {item.url} <ExternalLink size={10} />
                                    </a>
                                </div>
                            </div>
                            <div className="text-right whitespace-nowrap pl-4">
                                <div className="font-bold text-primary">{item.duration}</div>
                                <div className="text-xs text-muted-foreground">{item.time}</div>
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>
        </div>
    );
};

export default UserUrls;
