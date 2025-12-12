import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Settings } from 'lucide-react';
import { useWallet } from '@/contexts/WalletContext';
import { useToast } from '@/hooks/use-toast';

export function NetworkConfig() {
  const { config, setConfig } = useWallet();
  const { toast } = useToast();
  const [open, setOpen] = useState(false);
  const [formData, setFormData] = useState({
    contractAddress: config?.contractAddress || '',
    rpcUrl: config?.rpcUrl || '',
    chainId: config?.chainId?.toString() || '',
  });

  const handleSave = () => {
    if (!formData.contractAddress || !formData.rpcUrl || !formData.chainId) {
      toast({
        variant: 'destructive',
        title: 'Invalid Configuration',
        description: 'Please fill in all fields',
      });
      return;
    }

    setConfig({
      contractAddress: formData.contractAddress,
      rpcUrl: formData.rpcUrl,
      chainId: parseInt(formData.chainId),
    });

    toast({
      title: 'Configuration Saved',
      description: 'BlockDAG network configuration has been updated',
    });

    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="ghost" size="icon" data-testid="button-network-config">
          <Settings className="h-5 w-5" />
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>BlockDAG Network Configuration</DialogTitle>
          <DialogDescription>
            Configure your BlockDAG network settings and contract address
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="contract">Contract Address</Label>
            <Input
              id="contract"
              placeholder="0x..."
              value={formData.contractAddress}
              onChange={(e) => setFormData(prev => ({ ...prev, contractAddress: e.target.value }))}
              className="font-mono"
              data-testid="input-contract-address"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="rpc">RPC URL</Label>
            <Input
              id="rpc"
              placeholder="https://..."
              value={formData.rpcUrl}
              onChange={(e) => setFormData(prev => ({ ...prev, rpcUrl: e.target.value }))}
              data-testid="input-rpc-url"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="chainId">Chain ID</Label>
            <Input
              id="chainId"
              type="number"
              placeholder="1"
              value={formData.chainId}
              onChange={(e) => setFormData(prev => ({ ...prev, chainId: e.target.value }))}
              data-testid="input-chain-id"
            />
          </div>
        </div>
        <Button onClick={handleSave} className="w-full" data-testid="button-save-config">
          Save Configuration
        </Button>
      </DialogContent>
    </Dialog>
  );
}
