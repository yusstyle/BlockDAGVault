import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { UserPlus, Trash2, Clock, Shield } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { web3Service } from '@/lib/web3';
import { Role, roleLabels, roleDescriptions, AccessStatus, durationUnits, type AccessGrant } from '@shared/schema';

interface AccessManagementProps {
  documentId: string;
  grants: Array<AccessGrant & { address: string }>;
  onUpdate: () => void;
}

export function AccessManagement({ documentId, grants, onUpdate }: AccessManagementProps) {
  const { toast } = useToast();
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    walletAddress: '',
    role: '',
    duration: '',
    durationUnit: 'permanent',
  });

  const handleGrantAccess = async () => {
    if (!formData.walletAddress || !formData.role) {
      toast({
        variant: 'destructive',
        title: 'Invalid Input',
        description: 'Please fill in all required fields',
      });
      return;
    }

    if (!/^0x[a-fA-F0-9]{40}$/.test(formData.walletAddress)) {
      toast({
        variant: 'destructive',
        title: 'Invalid Address',
        description: 'Please enter a valid wallet address',
      });
      return;
    }

    try {
      setLoading(true);
      const contract = web3Service.getContract();

      let durationInSeconds = 0;
      if (formData.durationUnit !== 'permanent' && formData.duration) {
        const multiplier = durationUnits[formData.durationUnit as keyof typeof durationUnits];
        durationInSeconds = parseInt(formData.duration) * multiplier;
      }

      const tx = await contract.grantAccess(
        documentId,
        formData.walletAddress,
        parseInt(formData.role),
        durationInSeconds
      );

      await tx.wait();

      toast({
        title: 'Access Granted',
        description: `Successfully granted ${roleLabels[parseInt(formData.role) as Role]} access`,
      });

      setFormData({
        walletAddress: '',
        role: '',
        duration: '',
        durationUnit: 'permanent',
      });
      setOpen(false);
      onUpdate();
    } catch (error: any) {
      console.error('Grant access error:', error);
      toast({
        variant: 'destructive',
        title: 'Failed to Grant Access',
        description: error.message || 'An error occurred',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleRevokeAccess = async (address: string) => {
    try {
      setLoading(true);
      const contract = web3Service.getContract();

      const tx = await contract.revokeAccess(documentId, address);
      await tx.wait();

      toast({
        title: 'Access Revoked',
        description: 'User access has been revoked',
      });

      onUpdate();
    } catch (error: any) {
      console.error('Revoke access error:', error);
      toast({
        variant: 'destructive',
        title: 'Failed to Revoke Access',
        description: error.message || 'An error occurred',
      });
    } finally {
      setLoading(false);
    }
  };

  const formatAddress = (address: string) => {
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  const formatExpiry = (expiresAt: number) => {
    if (expiresAt === 0) return 'Never';
    const date = new Date(expiresAt * 1000);
    return date.toLocaleString();
  };

  const isExpired = (expiresAt: number) => {
    if (expiresAt === 0) return false;
    return Date.now() > expiresAt * 1000;
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Access Control</CardTitle>
            <CardDescription>
              Manage who can access this document and their permissions
            </CardDescription>
          </div>
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <Button className="gap-2" data-testid="button-grant-access">
                <UserPlus className="h-4 w-4" />
                Grant Access
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Grant Access</DialogTitle>
                <DialogDescription>
                  Provide access to this document for another user
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="wallet">Wallet Address</Label>
                  <Input
                    id="wallet"
                    placeholder="0x..."
                    value={formData.walletAddress}
                    onChange={(e) => setFormData(prev => ({ ...prev, walletAddress: e.target.value }))}
                    className="font-mono"
                    data-testid="input-grantee-address"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="role">Role</Label>
                  <Select
                    value={formData.role}
                    onValueChange={(value) => setFormData(prev => ({ ...prev, role: value }))}
                  >
                    <SelectTrigger id="role" data-testid="select-role">
                      <SelectValue placeholder="Select a role" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value={Role.VIEWER.toString()} data-testid="option-role-viewer">
                        <div>
                          <div className="font-medium">{roleLabels[Role.VIEWER]}</div>
                          <div className="text-xs text-muted-foreground">{roleDescriptions[Role.VIEWER]}</div>
                        </div>
                      </SelectItem>
                      <SelectItem value={Role.EDITOR.toString()} data-testid="option-role-editor">
                        <div>
                          <div className="font-medium">{roleLabels[Role.EDITOR]}</div>
                          <div className="text-xs text-muted-foreground">{roleDescriptions[Role.EDITOR]}</div>
                        </div>
                      </SelectItem>
                      <SelectItem value={Role.AUDITOR.toString()} data-testid="option-role-auditor">
                        <div>
                          <div className="font-medium">{roleLabels[Role.AUDITOR]}</div>
                          <div className="text-xs text-muted-foreground">{roleDescriptions[Role.AUDITOR]}</div>
                        </div>
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="duration-unit">Access Duration</Label>
                  <Select
                    value={formData.durationUnit}
                    onValueChange={(value) => setFormData(prev => ({ ...prev, durationUnit: value }))}
                  >
                    <SelectTrigger id="duration-unit" data-testid="select-duration">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="permanent">Permanent Access</SelectItem>
                      <SelectItem value="minutes">Minutes</SelectItem>
                      <SelectItem value="hours">Hours</SelectItem>
                      <SelectItem value="days">Days</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                {formData.durationUnit !== 'permanent' && (
                  <div className="space-y-2">
                    <Label htmlFor="duration">Duration Value</Label>
                    <Input
                      id="duration"
                      type="number"
                      placeholder="1"
                      value={formData.duration}
                      onChange={(e) => setFormData(prev => ({ ...prev, duration: e.target.value }))}
                      data-testid="input-duration-value"
                    />
                  </div>
                )}
              </div>
              <Button 
                onClick={handleGrantAccess} 
                disabled={loading}
                className="w-full"
                data-testid="button-submit-grant"
              >
                {loading ? 'Granting...' : 'Grant Access'}
              </Button>
            </DialogContent>
          </Dialog>
        </div>
      </CardHeader>
      <CardContent>
        {grants.length === 0 ? (
          <div className="text-center py-8">
            <Users className="h-12 w-12 text-muted-foreground mx-auto mb-2" />
            <p className="text-muted-foreground">No access grants yet</p>
            <p className="text-sm text-muted-foreground">Grant access to share this document</p>
          </div>
        ) : (
          <div className="space-y-3">
            {grants.map((grant) => (
              <div
                key={grant.address}
                className="flex items-center justify-between p-4 border rounded-md"
                data-testid={`grant-${grant.address}`}
              >
                <div className="flex-1 space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-sm">{formatAddress(grant.address)}</span>
                    <Badge variant={grant.status === AccessStatus.ACTIVE ? 'default' : 'secondary'}>
                      {roleLabels[grant.role as Role]}
                    </Badge>
                    {grant.status === AccessStatus.REVOKED && (
                      <Badge variant="destructive">Revoked</Badge>
                    )}
                    {isExpired(grant.expiresAt) && (
                      <Badge variant="secondary">Expired</Badge>
                    )}
                  </div>
                  <div className="flex items-center gap-3 text-xs text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      Expires: {formatExpiry(grant.expiresAt)}
                    </span>
                  </div>
                </div>
                {grant.status === AccessStatus.ACTIVE && (
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleRevokeAccess(grant.address)}
                    disabled={loading}
                    data-testid={`button-revoke-${grant.address}`}
                  >
                    <Trash2 className="h-4 w-4 text-destructive" />
                  </Button>
                )}
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
