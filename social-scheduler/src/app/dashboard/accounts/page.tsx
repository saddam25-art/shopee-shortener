"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Facebook, Instagram, Twitter, Plus, Trash2, RefreshCw } from "lucide-react";
import { cn } from "@/lib/utils";

interface ConnectedAccount {
  id: string;
  platform: string;
  accountName: string;
  accountHandle: string | null;
  isActive: boolean;
}

const platformConfig: Record<string, { icon: React.ElementType; color: string; bgColor: string }> = {
  facebook: { icon: Facebook, color: "text-blue-600", bgColor: "bg-blue-100" },
  instagram: { icon: Instagram, color: "text-pink-600", bgColor: "bg-pink-100" },
  twitter: { icon: Twitter, color: "text-sky-500", bgColor: "bg-sky-100" },
  tiktok: { icon: () => <span className="font-bold">T</span>, color: "text-black", bgColor: "bg-gray-100" },
};

const availablePlatforms = [
  { id: "facebook", name: "Facebook", description: "Connect your Facebook Page" },
  { id: "instagram", name: "Instagram", description: "Connect your Instagram Business account" },
  { id: "twitter", name: "Twitter/X", description: "Connect your Twitter account" },
  { id: "tiktok", name: "TikTok", description: "Connect your TikTok account" },
];

export default function AccountsPage() {
  const [accounts, setAccounts] = useState<ConnectedAccount[]>([]);
  const [loading, setLoading] = useState(true);
  const [connectDialogOpen, setConnectDialogOpen] = useState(false);
  const [connecting, setConnecting] = useState<string | null>(null);

  useEffect(() => {
    fetchAccounts();
  }, []);

  async function fetchAccounts() {
    try {
      const res = await fetch("/api/accounts");
      if (res.ok) {
        const data = await res.json();
        setAccounts(data);
      }
    } catch (error) {
      console.error("Error fetching accounts:", error);
    } finally {
      setLoading(false);
    }
  }

  async function connectAccount(platformId: string) {
    setConnecting(platformId);
    try {
      const res = await fetch("/api/accounts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ platform: platformId }),
      });

      if (res.ok) {
        await fetchAccounts();
        setConnectDialogOpen(false);
      }
    } catch (error) {
      console.error("Error connecting account:", error);
    } finally {
      setConnecting(null);
    }
  }

  async function disconnectAccount(accountId: string) {
    try {
      const res = await fetch(`/api/accounts/${accountId}`, {
        method: "DELETE",
      });

      if (res.ok) {
        setAccounts(accounts.filter((a) => a.id !== accountId));
      }
    } catch (error) {
      console.error("Error disconnecting account:", error);
    }
  }

  const connectedPlatforms = new Set(accounts.map((a) => a.platform));

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Connected Accounts</h2>
          <p className="text-muted-foreground">
            Manage your social media account connections
          </p>
        </div>
        <Dialog open={connectDialogOpen} onOpenChange={setConnectDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Connect Account
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Connect a Social Account</DialogTitle>
              <DialogDescription>
                Choose a platform to connect. This is a demo - actual OAuth would be required in production.
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-3 py-4">
              {availablePlatforms.map((platform) => {
                const config = platformConfig[platform.id];
                const isConnected = connectedPlatforms.has(platform.id);
                const Icon = config?.icon || Facebook;

                return (
                  <button
                    key={platform.id}
                    onClick={() => !isConnected && connectAccount(platform.id)}
                    disabled={isConnected || connecting === platform.id}
                    className={cn(
                      "flex items-center gap-4 p-4 rounded-lg border text-left transition-colors",
                      isConnected
                        ? "opacity-50 cursor-not-allowed"
                        : "hover:bg-accent cursor-pointer"
                    )}
                  >
                    <div className={cn("p-2 rounded-lg", config?.bgColor)}>
                      <Icon className={cn("h-5 w-5", config?.color)} />
                    </div>
                    <div className="flex-1">
                      <p className="font-medium">{platform.name}</p>
                      <p className="text-sm text-muted-foreground">
                        {platform.description}
                      </p>
                    </div>
                    {isConnected && (
                      <Badge variant="secondary">Connected</Badge>
                    )}
                    {connecting === platform.id && (
                      <RefreshCw className="h-4 w-4 animate-spin" />
                    )}
                  </button>
                );
              })}
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setConnectDialogOpen(false)}>
                Cancel
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-12">
          <RefreshCw className="h-6 w-6 animate-spin text-muted-foreground" />
        </div>
      ) : accounts.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <div className="p-4 rounded-full bg-muted mb-4">
              <Plus className="h-8 w-8 text-muted-foreground" />
            </div>
            <h3 className="text-lg font-semibold mb-2">No accounts connected</h3>
            <p className="text-muted-foreground text-center mb-4">
              Connect your social media accounts to start scheduling posts
            </p>
            <Button onClick={() => setConnectDialogOpen(true)}>
              <Plus className="mr-2 h-4 w-4" />
              Connect Your First Account
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {accounts.map((account) => {
            const config = platformConfig[account.platform];
            const Icon = config?.icon || Facebook;

            return (
              <Card key={account.id}>
                <CardHeader className="flex flex-row items-center gap-4 space-y-0">
                  <Avatar className={cn("h-12 w-12", config?.bgColor)}>
                    <AvatarFallback className={config?.bgColor}>
                      <Icon className={cn("h-6 w-6", config?.color)} />
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <CardTitle className="text-base">{account.accountName}</CardTitle>
                    <CardDescription>
                      {account.accountHandle || account.platform}
                    </CardDescription>
                  </div>
                  <Badge variant={account.isActive ? "default" : "secondary"}>
                    {account.isActive ? "Active" : "Inactive"}
                  </Badge>
                </CardHeader>
                <CardContent className="flex justify-end gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => disconnectAccount(account.id)}
                  >
                    <Trash2 className="mr-2 h-4 w-4" />
                    Disconnect
                  </Button>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
